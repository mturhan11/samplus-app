import { HttpClient, HttpParams } from '@angular/common/http';
import {Component,NgModule, OnInit, ViewChild} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DxDataGridComponent, DxDataGridModule, DxFileManagerModule, DxFormComponent, DxFormModule, DxPopupModule, DxResponsiveBoxModule, DxTabPanelModule } from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import CustomStore from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source';
import LocalStore from 'devextreme/data/local_store';
import CustomFileSystemProvider from 'devextreme/file_management/custom_provider';
import { ClickEvent } from 'devextreme/ui/button';
import notify from 'devextreme/ui/notify';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
declare var $: any;

export class Durumlar {
  id!: number;
  DurumText!: string;
}

export class IMesaj {
  public status!: boolean;
  public error!: string;
  public id!: number;

  getStatus()
  {
    return this.status;
  }
  getError()
  {
    return this.error;
  }
  getID()
  {
    return this.id;
  }
}

export class AciklamaDetay {
  id!: number;
  adet!: number;
  malzeme_adi!: string;
}

@Component({
  templateUrl: 'proje.component.html'
})

export class ProjeComponent  implements OnInit  {
  @ViewChild('dataGridProjeGorevlendirme', { static: false }) dataGridProjeGorevlendirme?:DxDataGridComponent;
  @ViewChild('dataGridProjeSatinalma', { static: false }) dataGridProjeSatinalma?:DxDataGridComponent;
  @ViewChild('formProjeSatinalmaAciklama', { static: false }) formProjeSatinalmaAciklama?:DxFormComponent;
  @ViewChild('gridAciklamaDetay', { static: false }) gridAciklamaDetay?:DxDataGridComponent;
  
  
  min: Date = new Date(2022, 10, 1);
  max: Date = new Date(2022, 10, 30);
  _projeID: string = "0";
  _ustProjeID: string = "";
  _fileManagerProjeID: string = "";
  _satinalmaID: string = "";

  pageTitle = "Proje Detayı";
  pageIcon = "fa fa-briefcase";

  yetkili = false;
  kullanici = false;
  satinalma = false;
  userID = 0;

  dataSourceProjeGorevlendirme: any = {};
  dataStoreProjeGorevlendirme: any = {};
  dataSourceProjeSatinalma: any = {};
  dataStoreProjeSatinalma: any = {};
  dataSourceProjeLog: any = {};
  dataStoreProjeLog: any = {};
  dataStoreKullanicilar: any = {};

  formDataDetay: any = {};

  dataAciklamaDetay: DataSource = new DataSource({});
  dataAciklamaDetayLocalArray: any = {};
  dataAciklamaDetayArray: AciklamaDetay[] = [];
  
  detayPopupVisible = false;
  detaySaveButtonOptions: any;
  detayCloseButtonOptions: any;

  detayGorevlendirmePopupVisible = false;
  detayGorevlendirmeSaveButtonOptions: any;
  detayGorevlendirmeCloseButtonOptions: any;

  remoteProvideProjeDokumanlari: CustomFileSystemProvider;
  
  durumlar: Durumlar[] = [{
    id: 0, DurumText: 'Beklemede',
  }, {
    id: 1, DurumText: 'Devam ediyor',
  }, {
    id: 2, DurumText: 'Gecikmede',
  }, {
    id: 3, DurumText: 'Tamamlandı',
  },
  ];

  ngOnInit(): void {
    this._projeID = this.route.snapshot.paramMap.get('id') as string;
    this._ustProjeID = this.route.snapshot.paramMap.get('ust_proje') as string;
    if (this._ustProjeID!="") this._fileManagerProjeID=this._ustProjeID; else this._fileManagerProjeID=this._projeID;
  }

  loginIDAl()
  {
    this.userID =  Number(sessionStorage.getItem("id"));
    if (sessionStorage.getItem("yetki")=="true") this.yetkili=true; else this.yetkili=false;
    if (sessionStorage.getItem("satinalma")=="true") this.satinalma=true; else this.satinalma=false;
    if (sessionStorage.getItem("kullanici")=="true") this.kullanici=true; else this.kullanici=false;
  }

  detayGorevlendirmeIconClick = (e) => {
    const that=this;
    this.detayGorevlendirmePopupVisible = true; 
  };

  aciklamaSatinalmaIconClick = (e) => {
    const that=this;
    this.dataAciklamaDetayLocalArray = new ArrayStore({
      key: "id",
      data: that.dataAciklamaDetayArray,
      errorHandler: function (error) {
        console.log(error.message);
      }
    });
  
    this.dataAciklamaDetay = new DataSource({
      store: that.dataAciklamaDetayLocalArray,
      reshapeOnPush: true
      });
      
    this.dataAciklamaDetayLocalArray.clear();
    this.formProjeSatinalmaAciklama?.instance._refresh();
    this._satinalmaID=this.dataGridProjeSatinalma?.instance.cellValue(e.row.rowIndex,"id");
    let _aciklama = this.dataGridProjeSatinalma?.instance.cellValue(e.row.rowIndex,"aciklama");
    console.log(_aciklama.length);
    if (_aciklama.length>10) {
      
      
      JSON.parse(_aciklama).forEach((element) => {
               let _aciklamaDetaySatir = new AciklamaDetay;
               _aciklamaDetaySatir.adet = element.adet;
               _aciklamaDetaySatir.malzeme_adi = element.malzeme_adi;
               that.dataAciklamaDetayLocalArray.push([{ type: "insert", data: _aciklamaDetaySatir}]);
              });
    }else{
      this.dataAciklamaDetayLocalArray.clear();
    }
    this.formProjeSatinalmaAciklama?.instance.resetValues();
    this.formProjeSatinalmaAciklama?.instance.repaint();
    this.detayPopupVisible = true; 
  };

  getItems(parentDirectory,projeID) {
    let payload = new HttpParams();
    let subject = new Subject();
    payload = payload.append("token",localStorage.getItem('token')!);
    payload = payload.append("proje_id",projeID);
    payload = payload.append("path",parentDirectory.path);
    this.httpClient.post(environment._baseUrl+'/ws/ws-files.php?aksiyon=list',payload).subscribe((results: any) => {
      subject.next(results);
    });
    return subject;
  }

  createDirectory(parentDirectory, name,projeID) {
    let payload = new HttpParams();
    payload = payload.append("token",localStorage.getItem('token')!);
    payload = payload.append("proje_id",projeID);
    payload = payload.append("path",parentDirectory.path);
    payload = payload.append("name",name);
    const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-files.php?aksiyon=ekle_klasor',payload)
    return result;
  }

  deleteItem(item,projeID) {
    let payload = new HttpParams();
    payload = payload.append("token",localStorage.getItem('token')!);
    payload = payload.append("proje_id",projeID);
    console.log(item);
    payload = payload.append("isDirectory",item.isDirectory);
    payload = payload.append("path",item.parentPath);
    payload = payload.append("name",item.name);
    const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-files.php?aksiyon=sil',payload)
    return result;
  }

  downloadItems(items,projeID) {
    //azure.downloadFile(items[0].path);
    let payload = new HttpParams();
    payload = payload.append("token",localStorage.getItem('token')!);
    payload = payload.append("proje_id",projeID);
    console.log(items);
    payload = payload.append("path",items[0].parentPath);
    payload = payload.append("name",items[0].name);
    const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-files.php?aksiyon=indir',payload)
    return result;
  }

  uploadFileChunk(fileData, uploadInfo, destinationDirectory,projeID) {
    const fnc=this;
    let subject = new Subject();
    let formData = new FormData();
    var fileOfBlob = new File([uploadInfo.chunkBlob], fileData.name);
    formData.append("chunkBlob",fileOfBlob);
    formData.append("token",localStorage.getItem('token')!);
    formData.append("destinationDirectory",destinationDirectory.path);
    formData.append("proje_id",projeID);
    this.httpClient.post(environment._baseUrl+'/ws/ws-files.php?aksiyon=ekle',formData).subscribe((results: any) => {
      subject.next(results);
    });
    return subject;
  }

  onCellPrepared(e) {

    let _durum=0;
    let _row=0;
    if (e.rowType === "data") {
      if (e.column.dataField == "durum")
      {
        _durum=Number(e.value.toString());
        _row=e.rowIndex;
        if (_durum == 0)
          {
            for (var i=0;i<=7;i++)
            {
              e.component.getCellElement(_row,i).style.backgroundColor="#FFDAB9";
              e.component.getCellElement(_row,i).style.color="black";
            }
          } 
          else if (_durum == 1)
          {
            for (var i=0;i<=7;i++)
            {
              e.component.getCellElement(_row,i).style.backgroundColor="#FFFFE0";
              e.component.getCellElement(_row,i).style.color="black";
            }
          } 
          else if (_durum == 2)
          {
            for (var i=0;i<=7;i++)
            {
              e.component.getCellElement(_row,i).style.backgroundColor="#DC143C";
              e.component.getCellElement(_row,i).style.color="black";
            }
          }
          else
          {
            for (var i=0;i<=7;i++)
            {
              e.component.getCellElement(_row,i).style.backgroundColor="lightgreen";
              e.component.getCellElement(_row,i).style.color="black";
            }
          }
      }     
    }
  }

  kullaniciListele(){
    let payload = new HttpParams();
    let subject = new Subject();
    this.httpClient.post(environment._baseUrl+'/ws/ws-users.php?aksiyon=list',payload).subscribe((results: any) => {
      subject.next(results);
    });
    return subject;
  }

  kayitListeleGorevlendirme(){
    let payload = new HttpParams();
    let subject = new Subject();
    let tur_param = "";
    payload = payload.append("token",localStorage.getItem('token')!);
    payload = payload.append("proje_id",this._projeID);
    this.httpClient.post(environment._baseUrl+'/ws/ws-tasks.php?aksiyon=list',payload).subscribe((results: any) => {
      subject.next(results);
    });
    return subject;
  }

  kayitGuncelleGorevlendirme(payload:HttpParams){
    const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-tasks.php?aksiyon=guncelle',payload)
    return result;
  }
  
  kayitEkleGorevlendirme(payload:HttpParams){
    const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-tasks.php?aksiyon=kaydet',payload)
    return result;
  }

  dataProjeGorevlendirmeKeyDown(e) {
    if (e.event.keyCode === 45) {
      e.component.addRow();
    }
  }

  kayitListeleSatinalma(){
    let payload = new HttpParams();
    let subject = new Subject();
    let tur_param = "";
    payload = payload.append("token",localStorage.getItem('token')!);
    payload = payload.append("proje_id",this._projeID);
    this.httpClient.post(environment._baseUrl+'/ws/ws-buyers.php?aksiyon=list',payload).subscribe((results: any) => {
      subject.next(results);
    });
    return subject;
  }

  kayitListeleLog(){
    let payload = new HttpParams();
    let subject = new Subject();
    let tur_param = "";
    payload = payload.append("token",localStorage.getItem('token')!);
    payload = payload.append("proje_id",this._projeID);
    this.httpClient.post(environment._baseUrl+'/ws/ws-log.php?aksiyon=list',payload).subscribe((results: any) => {
      subject.next(results);
    });
    return subject;
  }

  kayitGuncelleSatinalma(payload:HttpParams){
    const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-buyers.php?aksiyon=guncelle',payload)
    return result;
  }
  
  kayitEkleSatinalma(payload:HttpParams){
    const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-buyers.php?aksiyon=kaydet',payload)
    return result;
  }

  kayitEkleSatinalmaAciklama(payload:HttpParams) {
    const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-buyers.php?aksiyon=aciklama_guncelle',payload)
    return result;
  }

  dataProjeSatinalmaKeyDown(e) {
    if (e.event.keyCode === 45) {
      e.component.addRow();
    }
  }

  constructor(private httpClient : HttpClient,private route: ActivatedRoute,private router: Router) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
        return false;
    };
    const that=this;
    this.loginIDAl();

    

    this.dataStoreKullanicilar = new CustomStore({
      key:"id",
      load: (loadoptions)=> {
        return new Promise((resolve, reject) => {
          that.kullaniciListele().subscribe((results)=>{
            const data = JSON.stringify(results);
            resolve(JSON.parse(data));
          });
        });
      },
      byKey: (key)=>{
        return new Promise((resolve, reject) => {
          that.kullaniciListele().subscribe((results)=>{
            const data = JSON.stringify(results);
            const TumKullanicilar = JSON.parse(data);
            TumKullanicilar.forEach((element) => {
              if (element.id == key) {
                resolve( element); 
                }
              }); 
          });
        });
      }
    });

    this.dataStoreProjeGorevlendirme = new CustomStore({
      key: "id",
      load: (loadOptions) => {
        return new Promise((resolve, reject) => {
          that.kayitListeleGorevlendirme().subscribe((results)=>{
            const data = JSON.stringify(results);
            resolve(JSON.parse(data));
          });
        });
      },
      update: (key, values) => {
        let payload = new HttpParams();
        payload = payload.append("id",key);
        payload = payload.append("token",localStorage.getItem('token')!);
        payload = payload.append("proje_id",that._projeID);
        if (values.durum!=null)
        {
          payload = payload.append("durum",values.durum);
        }
        if (values.tarih!=null)
        {
          payload = payload.append("tarih",values.tarih);
        }
        if (values.bitis_tarih!=null)
        {
          payload = payload.append("bitis_tarih",values.bitis_tarih);
        }
        if (values.aciklama!=null)
        {
          payload = payload.append("aciklama",values.aciklama);
        }
        return new Promise((resolve, reject) => {
          that.kayitGuncelleGorevlendirme(payload).subscribe((results)=>{
            const _result = JSON.parse(JSON.stringify(results));
              let __result = Object.assign(new IMesaj, _result);
              const isOk=__result.getStatus();
              const message=__result.getError();
              const id=__result.getID();
              if (!isOk) {
                notify({
                  message,
                  position: {
                    my: 'center bottom',
                    at: 'center bottom',
                  },
                }, 'error', 3000);
               }
               else
               {
                const message = 'Görevlendirme başarı ile güncellendi.';
                notify({
                  message,
                  position: {
                    my: 'center bottom',
                    at: 'center bottom',
                  },
                }, 'success', 3000);
                that.dataGridProjeGorevlendirme?.instance.refresh();
               }
            resolve(true);
          });
        });
      },
      insert: (values) => {
        let payload = new HttpParams();
        payload = payload.append("token",localStorage.getItem('token')!);
        payload = payload.append("proje_id",that._projeID);
        if (values.durum!=null)
        {
          payload = payload.append("durum",values.durum);
        }
        if (values.kullanici_id!=null)
        {
          payload = payload.append("kullanici_id",values.kullanici_id);
        }
        if (values.tarih!=null)
        {
          payload = payload.append("tarih",values.tarih);
        }
        if (values.bitis_tarih!=null)
        {
          payload = payload.append("bitis_tarih",values.bitis_tarih);
        }
        if (values.aciklama!=null)
        {
          payload = payload.append("aciklama",values.aciklama);
        }
        
        return new Promise((resolve, reject) => {
          that.kayitEkleGorevlendirme(payload).subscribe((results)=>{
            const _result = JSON.parse(JSON.stringify(results));
              let __result = Object.assign(new IMesaj, _result);
              const isOk=__result.getStatus();
              const message=__result.getError();
              const id=__result.getID();
              if (!isOk) {
                notify({
                  message,
                  position: {
                    my: 'center bottom',
                    at: 'center bottom',
                  },
                }, 'error', 3000);
               }
               else
               {
                const message = 'Görevlendirme başarı ile eklendi.';
                notify({
                  message,
                  position: {
                    my: 'center bottom',
                    at: 'center bottom',
                  },
                }, 'success', 3000);
                that.dataGridProjeGorevlendirme?.instance.refresh();
               }
            resolve(true);
          });
        });
      },
      remove: (key) => {
        let payload = new HttpParams();
        payload = payload.append("id",key);
        payload = payload.append("token",localStorage.getItem('token')!);
        payload = payload.append("proje_id",that._projeID);
        return this.httpClient.delete(environment._baseUrl+'/ws/ws-tasks.php?aksiyon=sil&'+payload).toPromise().then();
      }
    });
  
    this.dataSourceProjeGorevlendirme = new DataSource({
      store:this.dataStoreProjeGorevlendirme,
    });

    this.dataStoreProjeSatinalma = new CustomStore({
      key: "id",
      load: (loadOptions) => {
        return new Promise((resolve, reject) => {
          that.kayitListeleSatinalma().subscribe((results)=>{
            const data = JSON.stringify(results);
            resolve(JSON.parse(data));
          });
        });
      },
      update: (key, values) => {
        let payload = new HttpParams();
        payload = payload.append("id",key);
        payload = payload.append("token",localStorage.getItem('token')!);
        payload = payload.append("proje_id",that._projeID);
        if (values.durum!=null)
        {
          payload = payload.append("durum",values.durum);
        }
        if (values.kullanici_id!=null)
        {
          payload = payload.append("kullanici_id",values.kullanici_id);
        }
        if (values.tarih!=null)
        {
          payload = payload.append("tarih",values.tarih);
        }
        if (values.istek!=null)
        {
          payload = payload.append("istek",values.istek);
        }
        if (values.kullanilacagi_yer!=null)
        {
          payload = payload.append("kullanilacagi_yer","Proje "+that._projeID+" : "+values.kullanilacagi_yer);
        }
        return new Promise((resolve, reject) => {
          that.kayitGuncelleSatinalma(payload).subscribe((results)=>{
            const _result = JSON.parse(JSON.stringify(results));
              let __result = Object.assign(new IMesaj, _result);
              const isOk=__result.getStatus();
              const message=__result.getError();
              const id=__result.getID();
              if (!isOk) {
                notify({
                  message,
                  position: {
                    my: 'center bottom',
                    at: 'center bottom',
                  },
                }, 'error', 3000);
               }
               else
               {
                const message = 'Satınalma başarı ile güncellendi.';
                notify({
                  message,
                  position: {
                    my: 'center bottom',
                    at: 'center bottom',
                  },
                }, 'success', 3000);
                that.dataGridProjeGorevlendirme?.instance.refresh();
               }
            resolve(true);
          });
        });
      },
      insert: (values) => {
        let payload = new HttpParams();
        payload = payload.append("token",localStorage.getItem('token')!);
        payload = payload.append("proje_id",that._projeID);
        if (values.durum!=null)
        {
          payload = payload.append("durum",values.durum);
        }
        if (values.kullanici_id!=null)
        {
          payload = payload.append("kullanici_id",values.kullanici_id);
        }
        if (values.tarih!=null)
        {
          payload = payload.append("tarih",values.tarih);
        }
        if (values.istek!=null)
        {
          payload = payload.append("istek",values.istek);
        }
        if (values.kullanilacagi_yer!=null)
        {
          payload = payload.append("kullanilacagi_yer","Proje "+that._projeID+" : "+values.kullanilacagi_yer);
        }
        
        return new Promise((resolve, reject) => {
          that.kayitEkleSatinalma(payload).subscribe((results)=>{
            const _result = JSON.parse(JSON.stringify(results));
              let __result = Object.assign(new IMesaj, _result);
              const isOk=__result.getStatus();
              const message=__result.getError();
              const id=__result.getID();
              if (!isOk) {
                notify({
                  message,
                  position: {
                    my: 'center bottom',
                    at: 'center bottom',
                  },
                }, 'error', 3000);
               }
               else
               {
                const message = 'Satınalma başarı ile eklendi.';
                notify({
                  message,
                  position: {
                    my: 'center bottom',
                    at: 'center bottom',
                  },
                }, 'success', 3000);
                that.dataGridProjeGorevlendirme?.instance.refresh();
               }
            resolve(true);
          });
        });
      },
      remove: (key) => {
        let payload = new HttpParams();
        payload = payload.append("id",key);
        payload = payload.append("token",localStorage.getItem('token')!);
        payload = payload.append("proje_id",that._projeID);
        return this.httpClient.delete(environment._baseUrl+'/ws/ws-buyers.php?aksiyon=sil&'+payload).toPromise().then();
      }
    });
  
    this.dataSourceProjeSatinalma = new DataSource({
      store:this.dataStoreProjeSatinalma,
    });

    this.dataSourceProjeLog = new CustomStore({
      key: "id",
      load: (loadOptions) => {
        return new Promise((resolve, reject) => {
          that.kayitListeleLog().subscribe((results)=>{
            const data = JSON.stringify(results);
            resolve(JSON.parse(data));
          });
        });
      }
    });
  
    this.dataSourceProjeLog = new DataSource({
      store:this.dataSourceProjeLog,
    });

    this.dataAciklamaDetayLocalArray = new ArrayStore({
      key: "id",
      data: that.dataAciklamaDetayArray,
      errorHandler: function (error) {
        console.log(error.message);
      }
    });
  
    this.dataAciklamaDetay = new DataSource({
      store: that.dataAciklamaDetayLocalArray,
      reshapeOnPush: true
      });

    this.remoteProvideProjeDokumanlari = new CustomFileSystemProvider({
        getItems:(parentDirectory) => {
            return new Promise((resolve, reject) => {
                that.getItems(parentDirectory,that._fileManagerProjeID).subscribe((results)=>{
                    const data = JSON.stringify(results);
                    resolve(JSON.parse(data));
                    }); 
                });
        },
        deleteItem:(item)=>{
            return new Promise((resolve, reject) => {
                that.deleteItem(item,that._fileManagerProjeID).subscribe((results)=>{
                    resolve(true);
                });
            });
        },
        createDirectory:(parentDirectory, name)=>{
            return new Promise((resolve, reject) => {
                that.createDirectory(parentDirectory,name,that._fileManagerProjeID).subscribe((results)=>{
                    resolve(true);
                });
            });
        },
        uploadFileChunk:(fileData, uploadInfo, destinationDirectory) =>{
            return new Promise((resolve, reject) => {
                that.uploadFileChunk(fileData, uploadInfo, destinationDirectory,that._fileManagerProjeID).subscribe((results)=>{
                    resolve(results);
                });
            });
        },
        downloadItems:(items)=>{
            return new Promise((resolve, reject) => {
                that.downloadItems(items,that._fileManagerProjeID).subscribe((results)=>{
                    const _result = JSON.parse(JSON.stringify(results));
                    console.log(_result);
                    window.open(environment._baseUrl+_result.url, 'Download');
                    
                    resolve(true);
                });
            });
        }
      });
      
      this.detaySaveButtonOptions = {
        icon: 'save',
        text: 'Kaydet',
        async onClick(e: ClickEvent){
          const _validate = that.formProjeSatinalmaAciklama?.instance.validate();
          if (_validate?.isValid)
          {
                let aciklama=JSON.stringify(that.dataAciklamaDetay.items()); 
                let payload = new HttpParams();
                payload = payload.append("id",that._satinalmaID);
                payload = payload.append("aciklama",aciklama);
                payload = payload.append("token",localStorage.getItem('token')!);
                payload = payload.append("proje_id",that._projeID);
                that.kayitEkleSatinalmaAciklama(payload).subscribe((res)=>{
                  const _result = JSON.parse(JSON.stringify(res));
                  let __result = Object.assign(new IMesaj, _result);
                  const isOk=__result.getStatus();
                  const message=__result.getError();
                  const id=__result.getID();
                  if (!isOk) {
                    notify({
                      message,
                      position: {
                        my: 'center bottom',
                        at: 'center bottom',
                      },
                    }, 'error', 3000);
                  }
                  else
                  {
                    const message = 'Satınalma detay bilgisi başarılı bir şekilde güncellendi.';
                    notify({
                      message,
                      position: {
                        my: 'center bottom',
                        at: 'center bottom',
                      },
                    }, 'success', 3000);
                    that.dataGridProjeSatinalma?.instance.refresh();
                  }
                });
            
            that.formProjeSatinalmaAciklama?.formData.clear;
            that.detayPopupVisible = false;
          }
          else
          {
            const message = 'Boş alanlar var lütfen kontrol ediniz.';
            notify({
              message,
              position: {
                my: 'center center',
                at: 'center center',
              },
            }, 'error', 3000);        
          }
        }      
      };
      this.detayCloseButtonOptions = {
        text: 'Kapat',
        icon: 'close',
        onClick(e: ClickEvent) {
          that.formProjeSatinalmaAciklama?.formData.clear;
          that.detayPopupVisible = false;
        },
      };
  }

  getSizeQualifier(width:any) {
    if (width < 1360)
        return 'sm';
    return 'lg';
    }   
}

@NgModule({
  imports: [
      BrowserModule,
      DxResponsiveBoxModule,
      DxFileManagerModule,
      DxTabPanelModule,
      DxDataGridModule,
      DxFormModule,
      DxPopupModule
  ],
  declarations: [ProjeComponent],
  bootstrap: [ProjeComponent],
})
export class ProjeModule { }