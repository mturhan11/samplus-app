import { formatDate } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Component,NgModule, ViewChild} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxResponsiveBoxModule, DxDataGridModule,DxButtonModule, DxSelectBoxModule, DxDataGridComponent, DxFormComponent,DxScrollViewModule, DxFormModule, DxPopupModule } from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source';
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

@Component({
  templateUrl: 'gorevlendirme.component.html',
  styleUrls: [ './gorevlendirme.component.scss' ]
})

export class GorevlendirmeComponent {

  @ViewChild('dataGridGorevlendirme', { static: false }) dataGrid?:DxDataGridComponent;
  @ViewChild('formGorevlendirme', { static: false }) formVar?:DxFormComponent;

  pageTitle = "Görevlendirme";
  pageIcon = "fa fa-list-ul";

  dataSourceGorevlendirme: any = {};
  dataStoreGorevlendirme: any = {};
  dataStoreKullanicilar: any = {};

  yetkili = false;
  kullanici = false;
  satinalma = false;
  userID = 0;

  loading = false;
  popupVisible = false;
  saveButtonOptions: any;
  closeButtonOptions: any;
  formData: any = {};

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

  clickYeniGorevlendirme(e)  {
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
    this.httpClient.post(environment._baseUrl+'/ws/ws-tasks.php?aksiyon=list'+tur_param,payload).subscribe((results: any) => {
      subject.next(results);
    });
    return subject;
  }


  kayitGuncelle(payload:HttpParams){
    const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-tasks.php?aksiyon=guncelle',payload)
    return result;
  }
  
  kayitEkle(payload:HttpParams){
    const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-tasks.php?aksiyon=kaydet',payload)
    return result;
  }

  constructor(private httpClient : HttpClient) {
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

    this.dataStoreGorevlendirme = new CustomStore({
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
      update: (key, values) => {
        let payload = new HttpParams();
        payload = payload.append("id",key);
        payload = payload.append("token",localStorage.getItem('token')!);
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
          that.kayitGuncelle(payload).subscribe((results)=>{
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
                that.dataGrid?.instance.refresh();
               }
            resolve(true);
          });
        });
      },
      remove: (key) => {
        let payload = new HttpParams();
        payload = payload.append("id",key);
        payload = payload.append("token",localStorage.getItem('token')!);
        return this.httpClient.delete(environment._baseUrl+'/ws/ws-tasks.php?aksiyon=sil&'+payload).toPromise().then();
      }
    });
  
    this.dataSourceGorevlendirme = new DataSource({
      store:this.dataStoreGorevlendirme,
    });

    this.saveButtonOptions = {
      icon: 'save',
      text: 'Kaydet',
      async onClick(e: ClickEvent){
        const _validate = that.formVar?.instance.validate();
        if (_validate?.isValid)
        {
          let { kullanici_id, sorumlu_id,takipci_id,tarih,bitis_tarih, aciklama} = that.formVar?.formData;
          let payload = new HttpParams();
          payload = payload.append("token",localStorage.getItem('token')!);
          payload = payload.append("kullanici_id",kullanici_id);
          payload = payload.append("sorumlu_id",sorumlu_id);
          payload = payload.append("takipci_id",takipci_id);
          payload = payload.append("tarih",formatDate(tarih, 'yyyy-MM-dd HH:mm:ss', 'en_US') );
          payload = payload.append("bitis_tarih",formatDate(bitis_tarih, 'yyyy-MM-dd HH:mm:ss', 'en_US') );
          payload = payload.append("aciklama",aciklama);
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
                  const message = 'Görevlendirme başarı ile eklendi.';
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
      DxDataGridModule,
      DxButtonModule,
      DxSelectBoxModule,
      DxScrollViewModule,
      DxFormModule,
      DxPopupModule
  ],
  declarations: [GorevlendirmeComponent],
  bootstrap: [GorevlendirmeComponent],
})
export class GorevlendirmeModule { }