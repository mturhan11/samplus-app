import {Component,NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxResponsiveBoxModule } from 'devextreme-angular';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
  templateUrl: 'proje-arsivi.component.html',
  styleUrls: [ './proje-arsivi.component.scss' ]
})

export class ArsivProjeArsiviComponent {

  pageTitle = "Proje Arşivi";
  pageIcon = "fa fa-briefcase";
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
  declarations: [ArsivProjeArsiviComponent],
  bootstrap: [ArsivProjeArsiviComponent],
})
export class ArsivProjeArsiviModule { }