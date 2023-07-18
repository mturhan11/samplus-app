import { Component, NgModule, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DxListModule } from 'devextreme-angular/ui/list';
import { DxContextMenuModule } from 'devextreme-angular/ui/context-menu';
import { IUser } from '../../services/auth.service';
import { environment } from 'src/environments/environment';
declare var $: any;
@Component({
  selector: 'app-user-panel',
  templateUrl: 'user-panel.component.html',
  styleUrls: ['./user-panel.component.scss']
})

export class UserPanelComponent implements OnInit {
  @Input()
  menuItems: any;

  @Input()
  menuMode!: string;

  @Input()
  user!: IUser | null;

  @Input()
  eposta!:string | null;

  @Input()
  adisoyadi!:string | null;

  @Input()
  avatar!:string | null;

  constructor() {}

  ngOnInit() {
    //this.authService.getUser();//.then((e) => console.log(e.data));
    this.eposta= localStorage.getItem('email');
    this.adisoyadi= localStorage.getItem('adisoyadi');
    this.avatar= localStorage.getItem('avatar');
    console.log(this.avatar);
    $("#userImage").css("background-size", "cover");
    $("#userImage").css("width", "100%");
    $("#userImage").css("height", "100%");
    $("#userImage").css("background-color", "#fff");
    $("#userImage").css("background-image", "url('"+environment._baseUrl+"/uploads/" + this.avatar + "')");
    $("#userImage").css("background-repeat", "no-repeat");
    
  }
}

@NgModule({
  imports: [
    DxListModule,
    DxContextMenuModule,
    CommonModule
  ],
  declarations: [ UserPanelComponent ],
  exports: [ UserPanelComponent ]
})
export class UserPanelModule { }
