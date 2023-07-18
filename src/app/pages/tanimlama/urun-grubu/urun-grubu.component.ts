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
  templateUrl: 'urun-grubu.component.html',
  styleUrls: [ './urun-grubu.component.scss' ]
})

export class TanimlamaUrunGrubuComponent {

  pageTitle = "Ürün Grubu";
  pageIcon = "fa fa-industry";

  @ViewChild('dataGridVar', { static: false }) dataGrid?:DxDataGridComponent;
  @ViewChild('formVar', { static: false }) formVar?:DxFormComponent;

  dataStoreMusteriler: any = {};
  popupVisible = false;
  saveButtonOptions: any;
  closeButtonOptions: any;
  loading = false;
  formData: any = {};

  yeniUrunGrubuClick = (e: ClickEvent) => {
    this.formVar?.instance.resetValues();
    this.popupVisible = true; 
  };

  kayitListele(){
    let payload = new HttpParams();
    let subject = new Subject();
    this.httpClient.post(environment._baseUrl+'/ws/ws-products.php?aksiyon=list',payload).subscribe((results: any) => {
      subject.next(results);
    });
    return subject;
  }

  kayitGuncelle(payload:HttpParams){
    const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-products.php?aksiyon=guncelle',payload)
    return result;
  }

  kayitEkle(payload:HttpParams){
    const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-products.php?aksiyon=kaydet',payload)
    return result;
  }

  constructor(private httpClient : HttpClient) {
    const that = this;
    this.dataStoreMusteriler = new CustomStore({
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
        let payload = new HttpParams();
        payload = payload.append("token",localStorage.getItem('token')!);
        if (values.grup_adi!=null)
        {
          payload = payload.append("grup_adi",values.grup_adi);
        } 
        if (values.aktif != null)
        {
          payload = payload.append("aktif",values.aktif);
        }
        return new Promise((resolve, reject) => {
          that.kayitEkle(payload).subscribe((results)=>{
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
                const message = 'Ürün grubu başarı ile güncellendi.';// ${that.currentEmployee.FirstName} ${that.currentEmployee.LastName}`;
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
        return this.httpClient.delete(environment._baseUrl+'/ws/ws-products.php?aksiyon=sil&'+payload).toPromise().then();
      },
      update: (key, values) => {
        let payload = new HttpParams();
        payload = payload.append("id",key);
        payload = payload.append("token",localStorage.getItem('token')!);
        if (values.grup_adi!=null)
        {
          payload = payload.append("grup_adi",values.grup_adi);
        } 
        if (values.aktif != null)
        {
          payload = payload.append("aktif",values.aktif);
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
                const message = 'Ürün Grubu başarı ile güncellendi.';// ${that.currentEmployee.FirstName} ${that.currentEmployee.LastName}`;
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

  this.saveButtonOptions = {
    icon: 'save',
    text: 'Kaydet',
    async onClick(e: ClickEvent){
      const _validate = that.formVar?.instance.validate();
      
      if (_validate?.isValid)
      {
        let { aktif, grup_adi} = that.formVar?.formData;
        let payload = new HttpParams();
        payload = payload.append("token",localStorage.getItem('token')!);
        if (grup_adi!=null)
        {
          payload = payload.append("grup_adi",grup_adi);
        } 
        if (aktif != null)
        {
          payload = payload.append("aktif",aktif);
        }
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
                const message = 'Müşteri başarı ile eklendi.';
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
    DxDataGridModule,
    DxResponsiveBoxModule,
    DxButtonModule,
    DxPopupModule,
    DxFormModule,
    DxFileUploaderModule
  ],
  declarations: [TanimlamaUrunGrubuComponent],
  bootstrap: [TanimlamaUrunGrubuComponent],
})
export class TanimlamaUrunGrubuModule { }