import { formatDate } from '@angular/common';
import localeTR from "@angular/common/locales/tr";
import { registerLocaleData } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Component,NgModule, ViewChild} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxResponsiveBoxModule,DxListModule,DxButtonModule, DxListComponent,DxTextBoxModule, DxTextBoxComponent,DxPopupModule,DxScrollViewModule,DxFormModule, DxFormComponent, DxBoxModule } from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import { ClickEvent } from 'devextreme/ui/button';
import notify from 'devextreme/ui/notify';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import DataSource from 'devextreme/data/data_source';
declare var $: any;

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
  templateUrl: 'mesajlar.component.html',
  styleUrls: [ './mesajlar.component.scss' ]
})

export class MesajlarComponent {
  @ViewChild('dxListMesajlar', { static: false }) dxList?:DxListComponent;
  @ViewChild('mesajGirisi', { static: false }) mesajGirisi?:DxTextBoxComponent;
  @ViewChild('formVar', { static: false }) formVar?:DxFormComponent;
  
  _loadOptions=0;
  userID = 0;
  _disabled=true;


  pageTitle = "Mesajlar";
  pageIcon = "fa fa-commenting";
  
  dataMesajlarGrup: any = {};
  dataMesajlar: any = {};
  dataMesajlarSource: any = {};

  saveButtonOptions: any;
  closeButtonOptions: any;
  loading = false;
  formData: any = {};
  dataKullanicilar: any = {};
  popupVisible = false;
  

  loginIDAl()
  {
    this.userID =  Number(sessionStorage.getItem("id"));
  }

  mesajGonder(e){
    if (e.event.keyCode === 13) {
      const that = this;
      let mesaj = this.mesajGirisi?.value;
      this.mesajGirisi?.instance.option("value","");
      let payload = new HttpParams();
      let date = new Date();
      let now = date;//new Date(date.valueOf() + date.getTimezoneOffset() * 600000);
      let _now = formatDate(now, 'yyyy-MM-dd HH:mm:ss','tr_TR');

      payload = payload.append("token",localStorage.getItem('token')!);
      payload = payload.append("gonderen_id",this.userID);
      payload = payload.append("alici_id",this._loadOptions);
      payload = payload.append("tarih",_now);
      payload = payload.append("mesaj",mesaj!);

      console.log(payload);
      this.sendMesajlar(payload).subscribe((res)=>{
        const _result = JSON.parse(JSON.stringify(res));
        let __result = Object.assign(new IMesaj, _result);
        const isOk=__result.getStatus();
        const message=__result.getError();
        const id=__result.getID();
        console.log(_result);
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
          const message = 'Mesaj başarı ile gönderildi.';
          notify({
            message,
            position: {
              my: 'center bottom',
              at: 'center bottom',
            },
          }, 'success', 3000);
          this.dataMesajlarSource.reload();
          this.dataMesajlarSource.pageIndex(0);
          this.dxList?.instance.resetOption("dataSource");
          this.dxList?.instance.option("dataSource",this.dataMesajlarSource ); 
          this.dxList?.instance.repaint();
        }
      });
    }
  }

  getMesajlarGrup(){
    let payload = new HttpParams();
    let subject = new Subject();
    payload = payload.append("token",localStorage.getItem('token')!);
    this.httpClient.post(environment._baseUrl+'/ws/ws-message.php?aksiyon=grup',payload).subscribe((results: any) => {
      subject.next(results);
    });
    return subject;
  }

  getMesajlar(id:number){
    let payload = new HttpParams();
    let subject = new Subject();
    payload = payload.append("token",localStorage.getItem('token')!);
    payload = payload.append("_id",id);
    this.httpClient.post(environment._baseUrl+'/ws/ws-message.php?aksiyon=liste',payload).subscribe((results: any) => {
      subject.next(results);
    });
    return subject;
  }

  sendMesajlar(payload:HttpParams){
    let subject = new Subject();
    const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-message.php?aksiyon=gonder',payload)
    return result;
  }

  dataMesajlarDetay = (e: any) => {
    this._loadOptions = e.itemData.id;
    this.dataMesajlarSource.reload();
    this.dataMesajlarSource.pageIndex(0);
    this.dxList?.instance.resetOption("dataSource");
    this.dxList?.instance.option("dataSource",this.dataMesajlarSource ); 
    this.dxList?.instance.repaint();
    this._disabled = false;
  };

  kullaniciListele(){
    let payload = new HttpParams();
    let subject = new Subject();
    this.httpClient.post(environment._baseUrl+'/ws/ws-users.php?aksiyon=list',payload).subscribe((results: any) => {
      subject.next(results);
    });
    return subject;
  }

  click = (e: ClickEvent) => {
      this.formVar?.instance.resetValues();
      this.formVar?.instance.repaint();
      this.popupVisible = true;
  };

  constructor(private httpClient : HttpClient) {
    registerLocaleData(localeTR, "tr");
    const that = this;
    this.loginIDAl();

    this.dataMesajlarGrup = new CustomStore({
      key:"id",
      load: (loadoptions)=> {
        return new Promise((resolve, reject) => {
          that.getMesajlarGrup().subscribe((results)=>{
            const data = JSON.stringify(results);
            resolve(JSON.parse(data));
          });
        });
      },
      byKey: (key)=>{
        return new Promise((resolve, reject) => {
          that.getMesajlarGrup().subscribe((results)=>{
            const data = JSON.stringify(results);
            resolve(JSON.parse(data).find(item=>item.id = key));
          });
        });
      }
    });

    this.dataMesajlarSource = new DataSource({
      store: new CustomStore({
        key:"id",
        loadMode:"raw",
        load: (loadoptions)=> {
          return new Promise((resolve, reject) => {
            that.getMesajlar(that._loadOptions).subscribe((results)=>{
              const data = JSON.stringify(results);
              resolve(JSON.parse(data));
            });
          });
        }
      }),
      paginate: true,
      pageSize: 10
    });

    this.dataKullanicilar = new CustomStore({
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
            resolve(JSON.parse(data).find(item=>item.id = key));
          });
        });
      }
    });

    this.saveButtonOptions = {
      icon: 'save',
      text: 'Kaydet',
      async onClick(e: ClickEvent){
        const _validate = that.formVar?.instance.validate();
        if (_validate?.isValid)
        {
          let { gonderen_id, alici_id,mesaj} = that.formVar?.formData;
          let payload = new HttpParams();
          let date = new Date();
          let now = date;
          let _now = formatDate(now, 'yyyy-MM-dd HH:mm:ss','tr_TR');
    
          payload = payload.append("token",localStorage.getItem('token')!);
          payload = payload.append("gonderen_id",gonderen_id);
          payload = payload.append("alici_id",alici_id);
          payload = payload.append("tarih",_now);
          payload = payload.append("mesaj",mesaj!);
    
          console.log(payload);
          that.sendMesajlar(payload).subscribe((res)=>{
            const _result = JSON.parse(JSON.stringify(res));
            let __result = Object.assign(new IMesaj, _result);
            const isOk=__result.getStatus();
            const message=__result.getError();
            const id=__result.getID();
            console.log(_result);
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
              const message = 'Mesaj başarı ile gönderildi.';
              notify({
                message,
                position: {
                  my: 'center bottom',
                  at: 'center bottom',
                },
              }, 'success', 3000);
            }
          });
          that.formVar?.formData.clear;
          that.popupVisible = false;
          that.dataMesajlarGrup.load();
          that.dataMesajlarSource.reload();
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
      DxListModule,
      DxButtonModule,
      DxTextBoxModule,
      DxPopupModule,
      DxScrollViewModule,
      DxFormModule,
      DxBoxModule
  ],
  declarations: [MesajlarComponent],
  bootstrap: [MesajlarComponent],
})
export class MesajlarModule { }