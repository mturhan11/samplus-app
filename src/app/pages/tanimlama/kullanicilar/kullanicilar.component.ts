import {
    NgModule, Component, Pipe, PipeTransform, enableProdMode, OnInit,
  } from '@angular/core';
  import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { DxDataGridModule, DxTextBoxComponent } from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import DevExpress from "devextreme/bundles/dx.all";
import {Observable, Subject} from 'rxjs';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import {DxButtonModule, DxFileUploaderModule,DxDataGridComponent,DxSchedulerModule, DxFormModule, DxSelectBoxModule, DxAutocompleteModule, DxFormComponent, DxBoxModule, DxPopupModule} from 'devextreme-angular';
import dxButton, { ClickEvent } from 'devextreme/ui/button';
import { DxResponsiveBoxModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { ViewChild } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CellPreparedEvent } from 'devextreme/ui/pivot_grid';
import { DxiItemComponent, DxiItemModule, DxoEditingComponent, DxoEditingModule } from 'devextreme-angular/ui/nested';
import { DxiTextEditorButton } from 'devextreme-angular/ui/nested/base/text-editor-button-dxi';
import { environment } from 'src/environments/environment';
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
    templateUrl: 'kullanicilar.component.html',
    styleUrls: [ './kullanicilar.component.scss']
  })


export class TanimlamaKullanicilarComponent{
  pageTitle = "Kullanıcılar";
  pageIcon = "fa fa-users";
@ViewChild('dataGridVar', { static: false }) dataGrid?:DxDataGridComponent;
@ViewChild('formVar', { static: false }) formVar?:DxFormComponent;
@ViewChild('avatarName', { static: false }) avatar?:DxiItemComponent;
  dataSource: any = {};
  dataStore: any = {};
  priority: any[];
  value: any[] = [];
  avatarName:string = 'change';
  popupVisible = false;

  _baseUrl = environment._baseUrl;

  saveButtonOptions: any;

  closeButtonOptions: any;

  loading = false;
  formData: any = {};

  onCellPrepared(e) {
    let _aktif=true;
    let _row=0;
    if (e.rowType === "data") {
      if (e.column.dataField == "aktif")
      {
          _aktif=e.value;
          _row=e.rowIndex;
      }
      if (_aktif == false)
      {
        for (var i=1;i<=7;i++)
        {
          e.component.getCellElement(e.rowIndex,i).style.backgroundColor="gray";
        }
      } 
  }
}

onUploaded(e){
  $("[name='avatar']").val(e.file.name);
}

  getSizeQualifier(width:any) {
    if (width < 1360)
        return 'sm';
    return 'lg';
    }   
    capitalize = (text?:string) => text?.charAt(0).toUpperCase();

    click = (e: ClickEvent) => {
        this.formVar?.instance.resetValues();
        this.popupVisible = true; 
    };

    addUser(email:string,password:string, yetki:boolean, satinalma:boolean, kullanici:boolean,avatar:string,adisoyadi:string) {
      let payload = new HttpParams();
      payload = payload.append("eposta",email);
      payload = payload.append("password",'123456');
      payload = payload.append("yetki",yetki);
      payload = payload.append("satinalma",satinalma);
      payload = payload.append("kullanici",kullanici);
      payload = payload.append("avatar",avatar);
      payload = payload.append("adisoyadi",adisoyadi);
      payload = payload.append("token",localStorage.getItem('token')!);
      const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-users.php?aksiyon=kaydet',payload)
      return result;
    }

    kayitListele(){
      let payload = new HttpParams();
      let subject = new Subject();
      this.httpClient.post(environment._baseUrl+'/ws/ws-users.php?aksiyon=list',payload).subscribe((results: any) => {
        subject.next(results);
      });
      return subject;
    }

    kayitGuncelle(payload:HttpParams){
      const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-users.php?aksiyon=guncelle',payload)
      return result;
    }

    onEditorEnterKey(e){
      const _validate = this.formVar?.instance.validate();
    }
   

  constructor(private httpClient : HttpClient) {
    const that = this;
    this.dataStore = new CustomStore({
      key: "id",
      load: (loadOptions) => {
        return new Promise((resolve, reject) => {
          that.kayitListele().subscribe((results)=>{
            const data = JSON.stringify(results);
            resolve(JSON.parse(data));
          });
        });
      },
      insert: (values) => {
        return new Promise((resolve, reject) => {
          that.kayitListele().subscribe((results)=>{
            const data = JSON.stringify(results);
            resolve(JSON.parse(data));
          });
        });
      },
      remove: (key) => {
        let payload = new HttpParams();
        payload = payload.append("id",key);
        payload = payload.append("token",localStorage.getItem('token')!);
        return this.httpClient.delete(environment._baseUrl+'/ws/ws-users.php?aksiyon=sil&'+payload).toPromise().then();
      },
      update: (key, values) => {
        let payload = new HttpParams();
        payload = payload.append("id",key);
        payload = payload.append("token",localStorage.getItem('token')!);
        if (values.eposta!=null)
        {
          payload = payload.append("eposta",values.eposta);
        }
        if (values.yetkili!=null)
        {
          payload = payload.append("yetki",values.yetkili);
        }
        if (values.satinalma!=null)
        {
          payload = payload.append("satinalma",values.satinalma);
        }
        if (values.kullanici!=null)
        {
          payload = payload.append("kullanici",values.kullanici);
        }
        if (values.aktif!=null)
        {
          payload = payload.append("aktif",values.aktif);
        }
        if (values.adisoyadi!=null)
        {
          payload = payload.append("adisoyadi",values.adisoyadi);
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
                const message = 'Kullanıcı başarı ile güncellendi.';// ${that.currentEmployee.FirstName} ${that.currentEmployee.LastName}`;
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
      }
  });


    this.priority = [
      { name: 'High', value: 4 },
      { name: 'Urgent', value: 3 },
      { name: 'Normal', value: 2 },
      { name: 'Low', value: 1 }
    ];


    this.saveButtonOptions = {
      icon: 'save',
      text: 'Kaydet',
      async onClick(e: ClickEvent){
        const _validate = that.formVar?.instance.validate();
        console.log(_validate?.isValid);
        if (_validate?.isValid)
        {
          let { email, yetki, kullanici, satinalma, adisoyadi } = that.formVar?.formData;

          let avatar = $("[name='avatar']").val();
          if (yetki != true)
              {
                  yetki = false;
              }
          if (kullanici != true)
              {
                  kullanici = false;
              }
          if (satinalma != true)
              {
                  satinalma = false;
              }
              that.addUser(email,'123456',yetki,satinalma,kullanici,avatar,adisoyadi).subscribe((res)=>{
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
                  const message = 'Kullanıcı başarı ile eklendi.';// ${that.currentEmployee.FirstName} ${that.currentEmployee.LastName}`;
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
  
}

@NgModule({
    imports: [
        BrowserModule,
        DxDataGridModule,
        DxResponsiveBoxModule,
        DxButtonModule,
        DxPopupModule,
        DxFormModule,
        DxFileUploaderModule
    ],
    declarations: [TanimlamaKullanicilarComponent],
    bootstrap: [TanimlamaKullanicilarComponent],
  })
  export class TanimlamaKullanicilarModule { }
