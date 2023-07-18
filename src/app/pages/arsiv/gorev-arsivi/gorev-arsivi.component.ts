import {Component,NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxResponsiveBoxModule } from 'devextreme-angular';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
  templateUrl: 'gorev-arsivi.component.html',
  styleUrls: [ './gorev-arsivi.component.scss' ]
})

export class ArsivGorevArsiviComponent {

  pageTitle = "Görevlendirme Arşivi";
  pageIcon = "fa fa-list-ul";
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
  declarations: [ArsivGorevArsiviComponent],
  bootstrap: [ArsivGorevArsiviComponent],
})
export class ArsivGorevArsiviModule { }