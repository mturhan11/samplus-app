import {NgModule, Component,enableProdMode} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import {DxButtonModule,DxSchedulerModule, DxFormModule, DxSelectBoxModule, DxAutocompleteModule, DxFormComponent, DxBoxModule, DxListModule, DxLookupModule} from 'devextreme-angular';
import { Appointment, Service } from '../../../app/shared/services/app.service';
import notify from 'devextreme/ui/notify';
import dxButton, { ClickEvent } from 'devextreme/ui/button';
import { DxResponsiveBoxModule } from 'devextreme-angular';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import CustomStore from 'devextreme/data/custom_store';
import { HttpClient, HttpParams } from '@angular/common/http';
import DataSource from 'devextreme/data/data_source';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { confirm } from 'devextreme/ui/dialog';
import { formatDate } from '@angular/common';

export class Durumlar {
  text!: string;
  id!: string;
  color!: string;
  forecolor!: string;
}

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
  providers: [Service],
})

export class HomeComponent {
  appointmentsData: Appointment[];
  currentDate: Date = new Date;

  dataStoreKullanicilar: any = {};

  dataStoreGorevlendirme: any = {};
  dataSourceGorevlendirme: any = {};
  dataStoreGorevlendirmeYaklasan: any = {};
  dataSourceGorevlendirmeYaklasan: any = {};
  countGorevlendirmeYaklasan: number = 0;
  dataSourceGorevlendirmeDevamEden: any = {};
  dataStoreGorevlendirmeDevamEden: any = {};
  countGorevlendirmeDevamEden: number = 0;
  dataStoreGorevlendirmeGeciken: any = {};
  dataSourceGorevlendirmeGeciken: any = {};
  countGorevlendirmeGeciken: number = 0;
  dataStoreGorevlendirmeTamamlanan: any = {};
  dataSourceGorevlendirmeTamamlanan: any = {};
  countGorevlendirmeTamamlanan: number = 0;
 

  durumlar: Durumlar[] = [
    {
      text: 'Bekleyen',
      id: "0",
      color: '#FFDAB9',
      forecolor: '#0000',
    }, {
      text: 'Devam Eden',
      id: "1",
      color: '#FFFFE0',
      forecolor: '#0000',
    }, {
      text: 'Gecikmede',
      id: "2",
      color: '#DC143C',
      forecolor: '#0000',
    }, {
      text: 'Tamamlandı',
      id: "3",
      color: 'lightgreen',
      forecolor: '#0000',
    }
  ];

  getSizeQualifier(width:any) {
      if (width < 1360)
          return 'sm';
      return 'lg';
  }

  yaklasanGorevBaslat = (e: any) => {
    let result = confirm("Görevi başlatmak istediğinize emin misiniz?","Görev Başlatma");
        result.then((dialogResult) => {
            if (dialogResult===true)
            {
              console.log(e);
              let payload = new HttpParams();
              let subject = new Subject();
              payload = payload.append("id",e.itemData.id.toString());
              payload = payload.append("token",localStorage.getItem('token')!);
              payload = payload.append("durum","1");
              let tarih = new Date();
              payload = payload.append("basla_tarih",formatDate(tarih, 'yyyy-MM-dd HH:mm:ss', 'en_US') );
              this.httpClient.post(environment._baseUrl+'/ws/ws-tasks.php?aksiyon=guncelle',payload).subscribe((results: any) => {
                subject.next(results);
              });
              window.location.reload();
            }
        });
  };

  devamEdenGorevBitir = (e: any) => {
    let result = confirm("Görevi bitirmek istediğinize emin misiniz?","Görev Bitirme");
        result.then((dialogResult) => {
            if (dialogResult===true)
            {
              console.log(e);
              let payload = new HttpParams();
              let subject = new Subject();
              payload = payload.append("id",e.itemData.id.toString());
              payload = payload.append("token",localStorage.getItem('token')!);
              payload = payload.append("durum","3");
              let tarih = new Date();
              payload = payload.append("tamam_tarih",formatDate(tarih, 'yyyy-MM-dd HH:mm:ss', 'en_US') );
              this.httpClient.post(environment._baseUrl+'/ws/ws-tasks.php?aksiyon=guncelle',payload).subscribe((results: any) => {
                subject.next(results);
              });
              window.location.reload();
            }
        });
  };

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
    payload = payload.append("token",localStorage.getItem('token')!);
    if (tur>-1)
    {
      payload = payload.append("tur",tur.toString());
    }
    else
    {
      payload = payload.append("tur","0,1,2,3");
    }
    //console.log(tur_param);
    this.httpClient.post(environment._baseUrl+'/ws/ws-tasks.php?aksiyon=list_kullanici',payload).subscribe((results: any) => {
      subject.next(results);
    });
    return subject;
  }

  constructor(private router: Router,service: Service,private httpClient : HttpClient) {
    this.appointmentsData = service.getAppointments();
    const that=this;

    this.dataStoreKullanicilar = new CustomStore({
      key:"kullanici_id",
      load: (loadoptions)=> {
        return new Promise((resolve, reject) => {
          that.kullaniciListele().subscribe((results)=>{
            const data = JSON.stringify(results);
            resolve(JSON.parse(data));
          });
        });
      },
      byKey: (key)=>{
        console.log(key);
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
        return new Promise((resolve, reject) => {
          that.kayitListele(-1).subscribe((results)=>{
            const data = JSON.stringify(results);
            resolve(JSON.parse(data));
          });
        });
      }
    });
  
    this.dataSourceGorevlendirme = new DataSource({
      store:this.dataStoreGorevlendirme,
    });

    this.dataStoreGorevlendirmeYaklasan = new CustomStore({
      key: "id",
      load: (loadOptions) => {
        return new Promise((resolve, reject) => {
          that.kayitListele(0).subscribe((results)=>{
            const data = JSON.stringify(results);
            that.countGorevlendirmeYaklasan = Object.keys(JSON.parse(data)).length;
            resolve(JSON.parse(data));
          });
        });
      }
    });
  
    this.dataSourceGorevlendirmeYaklasan = new DataSource({
      store:this.dataStoreGorevlendirmeYaklasan,
    });

    this.dataStoreGorevlendirmeDevamEden = new CustomStore({
      key: "id",
      load: (loadOptions) => {
        return new Promise((resolve, reject) => {
          that.kayitListele(1).subscribe((results)=>{
            const data = JSON.stringify(results);
            that.countGorevlendirmeDevamEden = Object.keys(JSON.parse(data)).length;
            resolve(JSON.parse(data));
          });
        });
      }
    });
  
    this.dataSourceGorevlendirmeDevamEden = new DataSource({
      store:this.dataStoreGorevlendirmeDevamEden,
    });

    this.dataStoreGorevlendirmeGeciken = new CustomStore({
      key: "id",
      load: (loadOptions) => {
        return new Promise((resolve, reject) => {
          that.kayitListele(2).subscribe((results)=>{
            const data = JSON.stringify(results);
            that.countGorevlendirmeGeciken = Object.keys(JSON.parse(data)).length;
            resolve(JSON.parse(data));
          });
        });
      }
    });
  
    this.dataSourceGorevlendirmeGeciken = new DataSource({
      store:this.dataStoreGorevlendirmeGeciken,
    });

    this.dataStoreGorevlendirmeTamamlanan = new CustomStore({
      key: "id",
      load: (loadOptions) => {
        return new Promise((resolve, reject) => {
          that.kayitListele(3).subscribe((results)=>{
            const data = JSON.stringify(results);
            that.countGorevlendirmeTamamlanan = Object.keys(JSON.parse(data)).length;
            resolve(JSON.parse(data));
          });
        });
      }
    });
  
    this.dataSourceGorevlendirmeTamamlanan = new DataSource({
      store:this.dataStoreGorevlendirmeTamamlanan,
    });


  }
  capitalize = (text?:string) => text?.charAt(0).toUpperCase();
  click = (e: ClickEvent) => {
    notify(`The ${this.capitalize(e.component.option('text'))} button was clicked`);
  };

}

@NgModule({
  imports: [ 
    DxResponsiveBoxModule,
    BrowserModule,
    DxSchedulerModule, 
    DxButtonModule, 
    DxFormModule, 
    DxSelectBoxModule, 
    DxAutocompleteModule,
    DxListModule,
    DxBoxModule,
    DxLookupModule
   ],
  declarations: [ HomeComponent ],
  bootstrap: [ HomeComponent ]
})
export class HomeModule { }
//platformBrowserDynamic().bootstrapModule(HomeModule);