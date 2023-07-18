import {Component,NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxResponsiveBoxModule } from 'devextreme-angular';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
  templateUrl: 'kontrol-listesi.component.html',
  styleUrls: [ './kontrol-listesi.component.scss' ]
})

export class TanimlamaKontrolListesiComponent {

  pageTitle = "Kontrol Listesi";
  pageIcon = "fa fa-list";
  constructor() {
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
  ],
  declarations: [TanimlamaKontrolListesiComponent],
  bootstrap: [TanimlamaKontrolListesiComponent],
})
export class TanimlamaKontrolListesiModule { }