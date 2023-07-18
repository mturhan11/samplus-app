import { HttpClient, HttpParams } from '@angular/common/http';
import {Component, AfterViewInit,  ViewChild, Input} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DxDataGridComponent} from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source';
import { ClickEvent } from 'devextreme/ui/button';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import CustomFileSystemProvider from 'devextreme/file_management/custom_provider';
declare var $: any;

export class Durumlar {
  id!: number;
  DurumText!: string;
}

@Component({
  selector: 'detail-view',
  templateUrl: 'alt_projeler.component.html'
})

export class AltProjelerComponent implements AfterViewInit  {
  @Input() key: number = 0;

  @ViewChild('dataGridProjeler', { static: false }) dataGrid?:DxDataGridComponent;

  formData: any = {};
  _projeID: string = "0";
  projeDokumanlari: any[]=[];

  dataSourceProjelerAlt: any = {};
  dataStoreProjelerAlt: any = {};
  dataStoreKullanicilar: any = {};
  dataStoreUrunGrubu: any = {};
  dataStoreMusteriler: any = {};

  yetkili = false;
  kullanici = false;
  satinalma = false;
  userID = 0;

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

  kayitListeleAlt(){
    let payload = new HttpParams();
    let subject = new Subject();
    payload = payload.append("token",localStorage.getItem('token')!);
    payload = payload.append("ProjeID",this.key);
    this.httpClient.post(environment._baseUrl+'/ws/ws-projects.php?aksiyon=list',payload).subscribe((results: any) => {
      subject.next(results);
    });
    return subject;
  }

  dosyalarIconClick = (e) => {
    this._projeID = e.row.data.id;
    this.popupVisibleProjeDokumanlari = true; 
  };

  detayIconClick = (e) => {
    this._projeID = e.row.data.id;
    this.router.navigate(['/proje/'+this._projeID+'/'+e.row.data.ust_proje]);
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

  constructor(private httpClient : HttpClient,private route: ActivatedRoute,private router: Router) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
        return false;
    };
    const that=this;
    this.loginIDAl();
    this.remoteProvideProjeDokumanlari = new CustomFileSystemProvider({
        getItems:(parentDirectory) => {
            return new Promise((resolve, reject) => {
                that.getItems(parentDirectory,that.key).subscribe((results)=>{
                    const data = JSON.stringify(results);
                    resolve(JSON.parse(data));
                    }); 
                });
        },
        deleteItem:(item)=>{
            return new Promise((resolve, reject) => {
                that.deleteItem(item,that.key).subscribe((results)=>{
                    resolve(true);
                });
            });
        },
        createDirectory:(parentDirectory, name)=>{
            return new Promise((resolve, reject) => {
                that.createDirectory(parentDirectory,name,that.key).subscribe((results)=>{
                    resolve(true);
                });
            });
        },
        uploadFileChunk:(fileData, uploadInfo, destinationDirectory) =>{
            return new Promise((resolve, reject) => {
                that.uploadFileChunk(fileData, uploadInfo, destinationDirectory,that.key).subscribe((results)=>{
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


  }

  ngAfterViewInit() {
    const that=this;
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