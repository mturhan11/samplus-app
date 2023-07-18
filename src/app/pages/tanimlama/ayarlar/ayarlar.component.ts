import { HttpClient, HttpParams } from '@angular/common/http';
import {NgModule, Component, ViewChild} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {DxResponsiveBoxModule,DxDataGridModule, DxDataGridComponent} from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import notify from 'devextreme/ui/notify';
import { Subject } from 'rxjs';
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
  templateUrl: 'ayarlar.component.html',
  styleUrls: [ './ayarlar.component.scss' ]
})

export class TanimlamaAyarlarComponent {
  @ViewChild('dataGridSet', { static: false }) dataGrid?:DxDataGridComponent;
  dataStore: any = {};

  pageTitle = "Ayarlar";
  pageIcon = "fa fa-gears";

  kayitListele(){
    let payload = new HttpParams();
    let subject = new Subject();
    this.httpClient.post(environment._baseUrl+'/ws/ws-settings.php?aksiyon=list',payload).subscribe((results: any) => {
      subject.next(results);
    });
    return subject;
  }

  kayitGuncelle(payload:HttpParams){
    const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-settings.php?aksiyon=guncelle',payload)
    return result;
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
      update: (key, values) => {
        let payload = new HttpParams();
        console.log(values);
        payload = payload.append("id",key);
        if (values.deger!=null)
        {
          payload = payload.append("deger",values.deger);
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
                const message = 'Ayar başarı ile güncellendi.';// ${that.currentEmployee.FirstName} ${that.currentEmployee.LastName}`;
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
  ],
  declarations: [TanimlamaAyarlarComponent],
  bootstrap: [TanimlamaAyarlarComponent],
})
export class TanimlamaAyarlarModule { }