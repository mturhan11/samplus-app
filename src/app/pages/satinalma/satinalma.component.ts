import {NgModule, Component} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import CustomStore from 'devextreme/data/custom_store';
import {Subject} from 'rxjs';
import {DxResponsiveBoxModule,DxScrollViewModule,DxSelectBoxModule, DxDataGridModule, DxLookupModule,DxDateBoxModule, DxButtonModule, DxFileUploaderModule,DxDataGridComponent, DxFormModule,  DxFormComponent, DxPopupModule} from 'devextreme-angular';
import { ClickEvent } from 'devextreme/ui/button';
import notify from 'devextreme/ui/notify';
import { ViewChild } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DxiItemComponent } from 'devextreme-angular/ui/nested';
import { environment } from 'src/environments/environment';
import { formatDate } from '@angular/common';
import { AppComponent } from 'src/app/app.component';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import LocalStore from 'devextreme/data/local_store';
import { ready } from 'jquery';
import { isNull } from '@angular/compiler/src/output/output_ast';
import { Console } from 'console';
declare var $: any;

export class Durumlar {
  id!: number;
  DurumText!: string;
}

export class KayitDetay {
  id!:number;
  tarih!:string;
  durum!:number;
  kullanici_id!:number;
  istek!:string;
  aciklama!:string;
  sorumlu_id!:number;
  takipci_id!:number;
  kullanilacagi_yer!:string;
  satinalma_sip_tarih!:string;
  detay_aciklama!:string;
  gelis_tarih!:string;
  temrin!:string;

  constructor(id:number,tarih:string,durum:number,kullanici_id:number,istek:string,aciklama:string,sorumlu_id:number,takipci_id:number,kullanilacagi_yer:string,satinalma_sip_tarih:string,detay_aciklama:string,gelis_tarih:string,temrin:string) {
    this.id=id;
    this.tarih=tarih;
    this.durum=durum;
    this.kullanici_id=kullanici_id;
    this.istek=istek;
    this.aciklama=aciklama;
    this.sorumlu_id=sorumlu_id;
    this.takipci_id=takipci_id;
    this.kullanilacagi_yer=kullanilacagi_yer;
    this.satinalma_sip_tarih=satinalma_sip_tarih;
    this.detay_aciklama=detay_aciklama;
    this.gelis_tarih=gelis_tarih;
    this.temrin=temrin;
    }
}

export class KayitDetay2 {
  id!:number;
  tarih!:string;
  durum!:number;
  kullanici_id!:number;
  istek!:string;
  aciklama!:string;
  sorumlu_id!:number;
  takipci_id!:number;
  kullanilacagi_yer!:string;
  satinalma_sip_tarih!:string;
  detay_aciklama!:string;
  gelis_tarih!:string;
  temrin!:string;
}

export class AciklamaDetay {
  id!: number;
  adet!: number;
  malzeme_adi!: string;
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
  templateUrl: 'satinalma.component.html',
  styleUrls: [ './satinalma.component.scss' ]
})


export class SatinalmaComponent{
  pageTitle = "Satınalma";
  pageIcon = "fa fa-shopping-cart";
  now = new Date();
  //kullanici_id = 1;
  loggedInId = 0;
  satinalma_id = 0;
  satinalma_sip_tarih = 0;
  satinalma_durum = 0;
  satinalma_aciklama = '';
  gonderim_tarih = 0;
  termin=0;
  durum_detay=0;
  guncelleYetki = false;
  yetkili = false;
  kullanici = false;
  satinalma = false;
  userID = 0;
  satinalma_sip_tarih_clear = 0;
  gonderim_tarih_clear = 0;
  termin_clear=0;

@ViewChild('dataGridBuy', { static: false }) dataGrid?:DxDataGridComponent;
@ViewChild('gridAciklamaDetay', { static: false }) gridAciklamaDetay?:DxDataGridComponent;
@ViewChild('formVar', { static: false }) formVar?:DxFormComponent;
@ViewChild('formVarDetay', { static: false }) formVarDetay?:DxFormComponent;
@ViewChild('avatarName', { static: false }) avatar?:DxiItemComponent;
@ViewChild('kullanici_id', { static: false }) kullanici_id?:DxiItemComponent;

dataSource: any = {};
dataAciklamaDetay: DataSource = new DataSource({});
dataAciklamaDetayLocalArray: any = {};
dataAciklamaDetayArray: AciklamaDetay[] = [];


dataKullanicilar: any = {};
dataStore: any = {};
priority: any[];
value: any[] = [];
avatarName:string = 'change';
popupVisible = false;

saveButtonOptions: any;

closeButtonOptions: any;

detayPopupVisible = false;

detaySaveButtonOptions: any;

detayCloseButtonOptions: any;

loading = false;
formData: any = {};
formDataDetay: any = {};
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

kayitDetay: KayitDetay2 = new KayitDetay2;

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


checkDetayGridData(params) {
  var _validateGrid;
  if (this.dataAciklamaDetay.items().length>0) _validateGrid = true;
  return _validateGrid;
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

  getRecordCount() {
    const ds = this.gridAciklamaDetay?.instance.getDataSource();
    return ds?.items().length;
  }

  onValueChangedSipTarih(e: any) {  
    if (e.value === null) {  
      this.formVarDetay?.instance.updateData("satinalma_sip_tarih",null);
      this.satinalma_sip_tarih_clear = 1;
      
    }  
  } 
  onValueChangedGelTarih(e: any) {  
    if (e.value === null) {  
      this.formVarDetay?.instance.updateData("gelis_tarih",null);
      this.gonderim_tarih_clear = 1;
      
    }  
  }
  onValueChangedTemrin(e: any) {  
    if (e.value === null) {  
      this.formVarDetay?.instance.updateData("temrin",null);
      this.termin_clear=1;
    }  
  } 

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

  click = (e: ClickEvent) => {
      this.formVarDetay?.instance._refresh();
      this.dataAciklamaDetayLocalArray.clear();
      this.formVar?.instance.resetValues();
      this.formVar?.instance.repaint();
      this.popupVisible = true;
  };

  detayIconClick = (e) => {
    
    this.formVarDetay?.instance.resetValues();
    this.formVarDetay?.instance.repaint();

    localStorage.removeItem("dx-data-localStore-dataAciklamaDetay");
    this.dataAciklamaDetayArray = JSON.parse(JSON.stringify(this.dataGrid?.instance.cellValue(e.row.rowIndex,"aciklama")));
    localStorage.setItem("dx-data-localStore-dataAciklamaDetay",this.dataAciklamaDetayArray.toString());
    this.dataAciklamaDetay.reload();

    this.kayitDetay.id=e.row.key;
    this.kayitDetay.tarih=this.dataGrid?.instance.cellValue(e.row.rowIndex,"tarih"); 
    this.kayitDetay.durum=this.dataGrid?.instance.cellValue(e.row.rowIndex,"durum"); 
    this.kayitDetay.kullanici_id=this.dataGrid?.instance.cellValue(e.row.rowIndex,"kullanici_id"); 
    this.kayitDetay.istek=this.dataGrid?.instance.cellValue(e.row.rowIndex,"istek"); 
    this.kayitDetay.sorumlu_id=this.dataGrid?.instance.cellValue(e.row.rowIndex,"sorumlu_id"); 
    this.kayitDetay.takipci_id=this.dataGrid?.instance.cellValue(e.row.rowIndex,"takipci_id"); 
    this.kayitDetay.kullanilacagi_yer=this.dataGrid?.instance.cellValue(e.row.rowIndex,"kullanilacagi_yer"); 
    this.kayitDetay.satinalma_sip_tarih=this.dataGrid?.instance.cellValue(e.row.rowIndex,"satinalma_sip_tarih"); 
    this.kayitDetay.detay_aciklama=this.dataGrid?.instance.cellValue(e.row.rowIndex,"detay_aciklama");
    this.kayitDetay.gelis_tarih=this.dataGrid?.instance.cellValue(e.row.rowIndex,"gelis_tarih");
    this.kayitDetay.temrin=this.dataGrid?.instance.cellValue(e.row.rowIndex,"temrin");

    if (this.userID == Number(this.kayitDetay.sorumlu_id))
    {
      this.guncelleYetki = true;
    } else if (this.satinalma == true || this.yetkili == true)
    {
      this.guncelleYetki = true;
    }
    else
    {
      this.guncelleYetki = false;
    }
    //this.formVarDetay?.instance._refresh();
    this.formVarDetay?.instance.updateData("id",this.kayitDetay.id);
    this.formVarDetay?.instance.updateData("tarih",this.kayitDetay.tarih);
    this.formVarDetay?.instance.updateData("durum",this.kayitDetay.durum);
    this.formVarDetay?.instance.updateData("kullanici_id",this.kayitDetay.kullanici_id);
    this.formVarDetay?.instance.updateData("istek",this.kayitDetay.istek);
    this.formVarDetay?.instance.updateData("sorumlu_id",this.kayitDetay.sorumlu_id);
    this.formVarDetay?.instance.updateData("takipci_id",this.kayitDetay.takipci_id);
    this.formVarDetay?.instance.updateData("kullanilacagi_yer",this.kayitDetay.kullanilacagi_yer);
    this.formVarDetay?.instance.updateData("satinalma_sip_tarih",this.kayitDetay.satinalma_sip_tarih);
    this.formVarDetay?.instance.updateData("detay_aciklama",this.kayitDetay.detay_aciklama);
    this.formVarDetay?.instance.updateData("gelis_tarih",this.kayitDetay.gelis_tarih);
    this.formVarDetay?.instance.updateData("temrin",this.kayitDetay.temrin);
    this.satinalma_sip_tarih_clear = 0;
    this.gonderim_tarih_clear = 0;
    this.termin_clear=0;
    this.detayPopupVisible = true; 
    //console.log(this.kayitDetay);
  };

  isDetayIconVisible(e) {
    return !e.row.isEditing;
  }
  
  private static isChief(position) {
    return position && ['CEO', 'CMO'].indexOf(position.trim().toUpperCase()) >= 0;
  }

  isDetayIconDisabled(e) {
    return SatinalmaComponent.isChief(e.row.data.Position);
  }
  
  SatinalmaEkle(tarih:Date, kullanici_id:number, sorumlu_id:number,takipci_id:number,aciklama:string,kullanilacagi_yer:string,istek:string) {
    let payload = new HttpParams();
    payload = payload.append("token",localStorage.getItem('token')!);
    payload = payload.append("tarih",formatDate(tarih, 'yyyy-MM-dd hh:mm:ss', 'en_US'));
    payload = payload.append("kullanici_id",kullanici_id);
    payload = payload.append("sorumlu_id",sorumlu_id);
    payload = payload.append("takipci_id",takipci_id);
    payload = payload.append("aciklama",aciklama);
    payload = payload.append("kullanilacagi_yer",kullanilacagi_yer);
    payload = payload.append("istek",istek);
    const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-buyers.php?aksiyon=kaydet',payload)
    return result;
  }

  

  SatinalmaDetayGuncelle(id:string,durum:string,kullanici_id:string,istek:string,kullanilacagi_yer:string,satinalma_sip_tarih:string,detay_aciklama:string,gelis_tarih:string,temrin:string,aciklama:string) {
    let payload = new HttpParams();
    payload = payload.append("id",id);
    payload = payload.append("durum",durum);
    payload = payload.append("kullanici_id",kullanici_id);
    payload = payload.append("istek",istek);
    payload = payload.append("kullanilacagi_yer",kullanilacagi_yer);
    payload = payload.append("satinalma_sip_tarih",satinalma_sip_tarih);
    payload = payload.append("detay_aciklama",detay_aciklama);
    payload = payload.append("gelis_tarih",gelis_tarih);
    payload = payload.append("temrin",temrin);
    payload = payload.append("aciklama",aciklama);
    payload = payload.append("token",localStorage.getItem('token')!);
    console.log(payload);
    const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-buyers.php?aksiyon=detay_guncelle',payload)
    return result;
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
    this.httpClient.post(environment._baseUrl+'/ws/ws-buyers.php?aksiyon=list'+tur_param,payload).subscribe((results: any) => {
      subject.next(results);
    });
    return subject;
  }

  kullaniciListele(){
    let payload = new HttpParams();
    let subject = new Subject();
    this.httpClient.post(environment._baseUrl+'/ws/ws-users.php?aksiyon=list',payload).subscribe((results: any) => {
      subject.next(results);
    });
    return subject;
  }

  kayitGuncelle(payload:HttpParams){
    const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-buyers.php?aksiyon=guncelle',payload)
    return result;
  }

  kayitSil(payload:HttpParams){
    const result =  this.httpClient.delete(environment._baseUrl+'/ws/ws-buyers.php?aksiyon=sil&'+payload)
    return result;
  }

  onEditorEnterKey(e){
    const _validate = this.formVar?.instance.validate();
  }

  loginIDAl()
  {
    this.userID =  Number(sessionStorage.getItem("id"));
    if (sessionStorage.getItem("yetki")=="true") this.yetkili=true; else this.yetkili=false;
    if (sessionStorage.getItem("satinalma")=="true") this.satinalma=true; else this.satinalma=false;
    if (sessionStorage.getItem("kullanici")=="true") this.kullanici=true; else this.kullanici=false;
  }

  dataAciklamaDetayKeyDown(e) {
    if (e.event.keyCode === 45) {
      e.component.addRow();
  }
}
 

constructor(private httpClient : HttpClient) {
  const that = this;
  this.loginIDAl();

  this.dataAciklamaDetayLocalArray = new LocalStore({
    key: "id",
    immediate: true,
    data: that.dataAciklamaDetayArray,
    name: "dataAciklamaDetay",
    errorHandler: function (error) {
      console.log(error.message);
    }
  });

  this.dataAciklamaDetay = new DataSource({
    store: that.dataAciklamaDetayLocalArray
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

  this.dataStore = new CustomStore({
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
      return this.httpClient.delete(environment._baseUrl+'/ws/ws-buyers.php?aksiyon=sil&'+payload).toPromise().then();
    }
  });

  this.dataSource = new DataSource({
    store:this.dataStore,
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
      
      if (_validate?.isValid && that.checkDetayGridData(null))
      {
        let { tarih, kullanici_id, sorumlu_id,takipci_id,istek,kullanilacagi_yer} = that.formVar?.formData;
        let aciklama2 = JSON.stringify(that.dataAciklamaDetay.items());
        console.log(aciklama2);
            that.SatinalmaEkle(tarih, kullanici_id, sorumlu_id,takipci_id,aciklama2,kullanilacagi_yer,istek).subscribe((res)=>{
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
                const message = 'Satınalma isteği başarı ile eklendi.';
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
      else if (!that.checkDetayGridData(null))
      {
        notify({
          message: 'Sipariş detay bilgisi boş olamaz',
          position: {
            my: 'center center',
            at: 'center center',
          },
        }, 'error', 3000);
      }
      else
      {
        notify({
          message: 'Boş alanlar var lütfen kontrol ediniz.',
          position: {
            my: 'center center',
            at: 'center center',
          },
        }, 'error', 3000);
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

  this.detaySaveButtonOptions = {
    icon: 'save',
    text: 'Kaydet',
    async onClick(e: ClickEvent){
      const _validate = that.formVarDetay?.instance.validate();
      if (_validate?.isValid)
      {
        let { id,durum,kullanici_id,istek,kullanilacagi_yer,satinalma_sip_tarih,detay_aciklama,gelis_tarih,temrin } = that.formVarDetay?.formData;
          console.log(that.formVarDetay?.formData);
            id=that.kayitDetay.id;

            if (typeof durum == 'undefined' || durum==null) 
            {
              durum=that.kayitDetay.durum;
            }
            else
            {
              durum=durum; 
            }

            if (typeof satinalma_sip_tarih == 'undefined' || satinalma_sip_tarih==null || this.satinalma_sip_tarih_clear ==1) 
            {
              satinalma_sip_tarih=null;
            }
            else
            {
              satinalma_sip_tarih=formatDate(satinalma_sip_tarih, 'yyyy-MM-dd HH:mm:ss', 'en_US'); 
            }
            
            if (typeof gelis_tarih == 'undefined' || gelis_tarih==null || this.satinalma_gelis_tarih_clear ==1) 
            {
              gelis_tarih=null;
            }
            else
            {
              gelis_tarih=formatDate(gelis_tarih, 'yyyy-MM-dd HH:mm:ss', 'en_US'); 
            }

            if (typeof temrin == 'undefined' || temrin==null || this.satinalma_temrin_clear ==1) 
            {
              temrin=null;
            }
            else
            {
              temrin=formatDate(temrin, 'yyyy-MM-dd HH:mm:ss', 'en_US'); 
            }

            if (typeof istek == 'undefined' || istek==null) 
            {
              istek=that.kayitDetay.istek;
            }
            else
            {
              istek=istek; 
            }

            let aciklama=JSON.stringify(that.dataAciklamaDetay.items()); 
            
            if (typeof detay_aciklama == 'undefined' || detay_aciklama==null) 
            {
              detay_aciklama=that.kayitDetay.detay_aciklama;
            }
            else
            {
              detay_aciklama=detay_aciklama; 
            }

            kullanici_id=that.kayitDetay.kullanici_id;

            if (typeof kullanilacagi_yer == 'undefined' || kullanilacagi_yer==null) 
            {
              kullanilacagi_yer=that.kayitDetay.kullanilacagi_yer;
            }
            else
            {
              kullanilacagi_yer=kullanilacagi_yer; 
            }

            that.SatinalmaDetayGuncelle(id,durum,kullanici_id,istek,kullanilacagi_yer,satinalma_sip_tarih,detay_aciklama,gelis_tarih,temrin,aciklama).subscribe((res)=>{
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
                that.dataGrid?.instance.refresh();
              }
            });
        
        that.formVarDetay?.formData.clear;
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
      that.formVarDetay?.formData.clear;
      that.detayPopupVisible = false;
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
      DxFileUploaderModule,
      DxDateBoxModule,
      DxSelectBoxModule,
      DxLookupModule,
      DxScrollViewModule
  ],
  declarations: [SatinalmaComponent],
  bootstrap: [SatinalmaComponent],
})
export class SatinalmaModule { }
