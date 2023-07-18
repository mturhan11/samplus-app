import { formatDate } from '@angular/common';
import { HttpClient, HttpParams, HttpRequest } from '@angular/common/http';
import {Component,EventEmitter,NgModule, OnInit, Output, ViewChild} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DxResponsiveBoxModule,DxCheckBoxModule, DxDataGridModule,DxButtonModule, DxSelectBoxModule, DxDataGridComponent, DxFormComponent,DxScrollViewModule, DxFormModule, DxPopupModule, DxFileUploaderModule, DxFileManagerModule, DxListComponent, DxListModule, DxTemplateModule } from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source';
import { ClickEvent } from 'devextreme/ui/button';
import notify from 'devextreme/ui/notify';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import CustomFileSystemProvider from 'devextreme/file_management/custom_provider';
import { resolve } from 'dns';
import dxFileUploader from 'devextreme/ui/file_uploader';
import { AltProjelerComponent } from './alt_projeler.component';
import FileSystemItem from 'devextreme/file_management/file_system_item';
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

@Component({
  templateUrl: 'projeler.component.html',
  styleUrls: [ './projeler.component.scss' ]
})

export class ProjelerComponent implements OnInit {
  @ViewChild('dataGridProjeler', { static: false }) dataGrid?:DxDataGridComponent;
  @ViewChild('formGorevlendirme', { static: false }) formVar?:DxFormComponent;
  @ViewChild('formProjeDokumanlari', { static: false }) formProjeDokumanlari?:DxFormComponent;
  @ViewChild('dxListSorumluPersonel', { static: false }) dxListSorumluPersonel?:DxListComponent;

  pageTitle = "Projeler";
  pageIcon = "fa fa-briefcase";

  base64Data: string = "0";
  projeID: string = "0";
  _projeID: string = "0";
  projeDokumanlari: any[]=[];

  dataSourceProjeler: any = {};
  dataStoreProjeler: any = {};
  dataSourceProjelerAlt: any = {};
  dataStoreProjelerAlt: any = {};
  dataStoreKullanicilar: any = {};
  dataStoreUrunGrubu: any = {};
  dataStoreMusteriler: any = {};

  yetkili = false;
  kullanici = false;
  satinalma = false;
  userID = 0;

  loading = false;
  popupVisible = false;
  saveButtonOptions: any;
  closeButtonOptions: any;
  formData: any = {};

  loadingProjeDokumanlari = false;
  popupVisibleProjeDokumanlari = false;
  closeButtonOptionsProjeDokumanlari: any;
  formDataProjeDokumanlari: any = {};
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

  selectStatus(data) {
    if (data.value === null) {
      this.dataGrid?.instance.clearFilter();
    } else {
      this.dataGrid?.instance.filter(['durum', '=', data.value]);
    }
  }

  selectClear(data) {
    if (data.event.keyCode === 32) {
      this.dataGrid?.instance.clearFilter();
      data.component.reset();
    }
  }



  isVisibleAlt(e)
  {
    let _value=true;
      if (Number(e.row.data.alt_proje)==0)
      {
        _value = false;
      } 
    return _value
  }

  isVisibleDetay(e)
  {
    let _value=false;
      if (Number(e.row.data.alt_proje)==0)
      {
        _value = true;
      } 
    return _value
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

  clickYeniProje(e)  {
    this._projeID = "0";
    this.formVar?.instance._refresh();
    this.formVar?.instance.resetValues();
    this.formVar?.instance.repaint();
    this.popupVisible = true;
  }

  loginIDAl()
  {
    this.userID =  Number(sessionStorage.getItem("id"));
    if (sessionStorage.getItem("yetki")=="true") this.yetkili=true; else this.yetkili=false;
    if (sessionStorage.getItem("satinalma")=="true") this.satinalma=true; else this.satinalma=false;
    if (sessionStorage.getItem("kullanici")=="true") this.kullanici=true; else this.kullanici=false;
  }

  kullaniciListele(){
    let payload = new HttpParams();
    let subject = new Subject();
    this.httpClient.post(environment._baseUrl+'/ws/ws-users.php?aksiyon=list',payload).subscribe((results: any) => {
      subject.next(results);
    });
    return subject;
  }

  musteriListele(){
    let payload = new HttpParams();
    let subject = new Subject();
    this.httpClient.post(environment._baseUrl+'/ws/ws-clients.php?aksiyon=list',payload).subscribe((results: any) => {
      subject.next(results);
    });
    return subject;
  }

  urungrubuListele(){
    let payload = new HttpParams();
    let subject = new Subject();
    this.httpClient.post(environment._baseUrl+'/ws/ws-products.php?aksiyon=list',payload).subscribe((results: any) => {
      subject.next(results);
    });
    return subject;
  }

  kayitListele(tur:number){
    let payload = new HttpParams();
    let subject = new Subject();
    let tur_param = "";
    payload = payload.append("token",localStorage.getItem('token')!);
    if (tur>-1)
    {
      tur_param = '&tur='+tur.toString();
    }
    //console.log(tur_param);
    this.httpClient.post(environment._baseUrl+'/ws/ws-projects.php?aksiyon=list'+tur_param,payload).subscribe((results: any) => {
      subject.next(results);
    });
    return subject;
  }

  kayitListeleAlt(){
    let payload = new HttpParams();
    let subject = new Subject();
    payload = payload.append("token",localStorage.getItem('token')!);
    payload = payload.append("ProjeID",this._projeID);
    this.httpClient.post(environment._baseUrl+'/ws/ws-projects.php?aksiyon=list',payload).subscribe((results: any) => {
      subject.next(results);
    });
    return subject;
  }

  kayitGuncelle(payload:HttpParams){
    const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-projects.php?aksiyon=guncelle',payload)
    return result;
  }
  
  kayitEkle(payload:HttpParams){
    const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-projects.php?aksiyon=kaydet',payload)
    return result;
  }

  dosyalarIconClick = (e) => {
    this._projeID = e.row.data.id;
    this.remoteProvideProjeDokumanlari.getItems(new FileSystemItem("",true));
    this.formProjeDokumanlari?.instance._refresh();
    this.formProjeDokumanlari?.instance.resetValues();
    this.formProjeDokumanlari?.instance.repaint();
    this.popupVisibleProjeDokumanlari = true; 
  };

  detayIconClick = (e) => {
    if (e.row.data.alt_proje<1)
    {
      this._projeID = e.row.data.id;
      this.router.navigate(['/proje/'+this._projeID]);
    }
  };

  altProjeIconClick = (e) => {
    let projeID=e.row.data.id;
      this.formVar?.instance.resetValues();
      this.formVar?.instance.repaint();
      this._projeID = projeID;
      this.formVar?.instance.updateData("ust_proje",projeID);
      this.popupVisible = true;
  };

  altProjeDetayClick(e) {
    if (e.row.data.alt_proje>0)
    {
      const that=this;
      e.component.collapseAll(-1);
      e.component.expandRow(e.row.data.id);
    }
  }

  ngOnInit(): void {
    this.projeID = this.route.snapshot.paramMap.get('id') as string;
    if (this.projeID!==null)
    {
        this.pageTitle += " "+this.projeID;
    }
    else
    {
        this.projeID = "1";
    }
  }

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


  onUploaded(event)
  {
    this.remoteProvideProjeDokumanlari.getItems;
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

  constructor(private httpClient : HttpClient,private route: ActivatedRoute,private router: Router) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
        return false;
    };
    const that=this;
    this.loginIDAl();
    
    this.remoteProvideProjeDokumanlari = new CustomFileSystemProvider({
        getItems:(parentDirectory) => {
            return new Promise((resolve, reject) => {
                that.getItems(parentDirectory,that._projeID).subscribe((results)=>{
                    const data = JSON.stringify(results);
                    resolve(JSON.parse(data));
                    }); 
                });
        },
        deleteItem:(item)=>{
            return new Promise((resolve, reject) => {
                that.deleteItem(item,that._projeID).subscribe((results)=>{
                    resolve(true);
                });
            });
        },
        createDirectory:(parentDirectory, name)=>{
            return new Promise((resolve, reject) => {
                that.createDirectory(parentDirectory,name,that._projeID).subscribe((results)=>{
                    resolve(true);
                });
            });
        },
        uploadFileChunk:(fileData, uploadInfo, destinationDirectory) =>{
            return new Promise((resolve, reject) => {
                that.uploadFileChunk(fileData, uploadInfo, destinationDirectory,that._projeID).subscribe((results)=>{
                    resolve(results);
                });
            });
        },
        downloadItems:(items)=>{
            return new Promise((resolve, reject) => {
                that.downloadItems(items,that._projeID).subscribe((results)=>{
                    const _result = JSON.parse(JSON.stringify(results));
                    console.log(_result);
                    window.open(environment._baseUrl+_result.url, 'Download');
                    
                    resolve(true);
                });
            });
        }
      });

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

    this.dataStoreMusteriler = new CustomStore({
      key:"id",
      load: (loadoptions)=> {
        return new Promise((resolve, reject) => {
          that.musteriListele().subscribe((results)=>{
            const data = JSON.stringify(results);
            resolve(JSON.parse(data));
          });
        });
      },
      byKey: (key)=>{
        return new Promise((resolve, reject) => {
          that.musteriListele().subscribe((results)=>{
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

    this.dataStoreUrunGrubu = new CustomStore({
      key:"id",
      load: (loadoptions)=> {
        return new Promise((resolve, reject) => {
          that.urungrubuListele().subscribe((results)=>{
            const data = JSON.stringify(results);
            resolve(JSON.parse(data));
          });
        });
      },
      byKey: (key)=>{
        return new Promise((resolve, reject) => {
          that.urungrubuListele().subscribe((results)=>{
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

    this.dataStoreProjeler = new CustomStore({
      key: "id",
      load: (loadOptions) => {
        let _loadOptions=-1;
        if (loadOptions!=null)
        {
          _loadOptions=loadOptions as number;
        }
        return new Promise((resolve, reject) => {
          that.kayitListele(_loadOptions).subscribe((results)=>{
            const data = JSON.stringify(results);
            resolve(JSON.parse(data));
          });
        });
      },
      remove: (key) => {
        let payload = new HttpParams();
        payload = payload.append("id",key);
        payload = payload.append("token",localStorage.getItem('token')!);
        return this.httpClient.delete(environment._baseUrl+'/ws/ws-projects.php?aksiyon=sil&'+payload).toPromise().then();
      }
    });
  
    this.dataSourceProjeler = new DataSource({
      store:this.dataStoreProjeler,
    });

    this.dataStoreProjelerAlt = new CustomStore({
      key: "id",
      load: (loadOptions) => {
        return new Promise((resolve, reject) => {
          that.kayitListeleAlt().subscribe((results)=>{
            const data = JSON.stringify(results);
            resolve(JSON.parse(data));
          });
        });
      },
      remove: (key) => {
        let payload = new HttpParams();
        payload = payload.append("id",key);
        payload = payload.append("token",localStorage.getItem('token')!);
        return this.httpClient.delete(environment._baseUrl+'/ws/ws-projects.php?aksiyon=sil&'+payload).toPromise().then();
      }
    });
  
    this.dataSourceProjelerAlt = new DataSource({
      store:this.dataStoreProjelerAlt,
    });

    this.saveButtonOptions = {
      icon: 'save',
      text: 'Kaydet',
      async onClick(e: ClickEvent){
        const _validate = that.formVar?.instance.validate();
        if (_validate?.isValid)
        {
          let { ust_proje, proje_adi,urun_grubu,musteri_id,sorumlu_personel,baslangic_tarih,teslim_tarih,aciklama} = that.formVar?.formData;
          let payload = new HttpParams();
          payload = payload.append("token",localStorage.getItem('token')!);
          if (ust_proje!="0") payload = payload.append("ust_proje",ust_proje);
          if (ust_proje=="0") payload = payload.append("ust_proje","null");
          payload = payload.append("proje_adi",proje_adi);
          payload = payload.append("urun_grubu",urun_grubu);
          payload = payload.append("musteri_id",musteri_id);
          payload = payload.append("baslangic_tarih",formatDate(baslangic_tarih, 'yyyy-MM-dd HH:mm:ss', 'en_US') );
          payload = payload.append("teslim_tarih",formatDate(teslim_tarih, 'yyyy-MM-dd HH:mm:ss', 'en_US') );
          payload = payload.append("aciklama",aciklama);
          payload = payload.append("sorumlu_personeller",that.dxListSorumluPersonel?.selectedItemKeys.join(",") as string);
          console.log(payload);
              that.kayitEkle(payload).subscribe((res)=>{
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
                  const message = 'Proje başarı ile eklendi.';
                  notify({
                    message,
                    position: {
                      my: 'center bottom',
                      at: 'center bottom',
                    },
                  }, 'success', 3000);
                  that.dataGrid?.instance.refresh();
                }
              });
          
          that.formVar?.formData.clear;
          that.popupVisible = false;
        }
      }      
    };
    this.closeButtonOptions = {
      text: 'Kapat',
      icon: 'close',
      onClick(e: ClickEvent) {
        that.formVar?.formData.clear;
        that.popupVisible = false;
      },
    };

      this.closeButtonOptionsProjeDokumanlari = {
        text: 'Kapat',
        icon: 'close',
        onClick(e: ClickEvent) {
          that.popupVisibleProjeDokumanlari = false;
        },
      };


  }

  getSizeQualifier(width:any) {
    if (width < 1360)
        return 'sm';
    return 'lg';
    }   
}
  
  function uploadFileChunk(fileData, uploadInfo, destinationDirectory) {
    /*let promise = null;
  
    if (uploadInfo.chunkIndex === 0) {
      const filePath = destinationDirectory.path ? `${destinationDirectory.path}/${fileData.name}` : fileData.name;
      promise = gateway.getUploadAccessUrl(filePath).done((accessUrl) => {
        uploadInfo.customData.accessUrl = accessUrl;
      });
    } else {
      promise = Promise.resolve();
    }
  
    promise = promise.then(() => gateway.putBlock(uploadInfo.customData.accessUrl, uploadInfo.chunkIndex, uploadInfo.chunkBlob));
  
    if (uploadInfo.chunkIndex === uploadInfo.chunkCount - 1) {
      promise = promise.then(() => gateway.putBlockList(uploadInfo.customData.accessUrl, uploadInfo.chunkCount));
    }
  
    return promise;*/
  }


@NgModule({
  imports: [
      BrowserModule,
      DxResponsiveBoxModule,
      DxDataGridModule,
      DxButtonModule,
      DxSelectBoxModule,
      DxScrollViewModule,
      DxFormModule,
      DxPopupModule,
      DxCheckBoxModule,
      DxFileManagerModule,
      DxFileUploaderModule,
      DxListModule,
      DxTemplateModule
  ],
  declarations: [ProjelerComponent,AltProjelerComponent],
  bootstrap: [ProjelerComponent],
})
export class ProjelerModule { }