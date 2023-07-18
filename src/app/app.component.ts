import { Component, HostBinding } from '@angular/core';
import { AuthService, ScreenService, AppInfoService } from './shared/services';
import trMessages from "../app/localization/tr.json";
import { Router, RouterModule } from '@angular/router';
import { locale, loadMessages } from "devextreme/localization";
import themes from "devextreme/ui/themes";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  {
  @HostBinding('class') get getClass() {
    return Object.keys(this.screen.sizes).filter(cl => this.screen.sizes[cl]).join(' ');
  }

  async delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  async getLoginInfo()
  {
    const result = this.authService.getLoginInfo();
    return result;
  }

  constructor(private authService: AuthService, private screen: ScreenService, public appInfo: AppInfoService, private router: Router) {
    loadMessages(trMessages);
    locale("tr");
    //themes.current('theme.additional');
    if ((sessionStorage.getItem('isLoggedIn')=== undefined) || (sessionStorage.getItem('isLoggedIn')=== null))
    {
      if (localStorage.getItem('rememberMe')=='false')
      {
        console.log(localStorage.getItem('rememberMe'));
        this.authService.logOut();
      }else{
        this.getLoginInfo();
      }
    }  
   }

  isAuthenticated() {
    return this.authService.loggedIn;
  }
}
