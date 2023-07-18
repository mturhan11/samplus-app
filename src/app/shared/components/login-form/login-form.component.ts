import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import notify from 'devextreme/ui/notify';
import { AuthService,IMesaj } from '../../services';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  loading = false;
  formData: any = {};

  constructor(private authService: AuthService, private router: Router) { }


  async onSubmit(e: Event) {
    e.preventDefault();
    const { email, password, rememberMe } = this.formData;
    this.loading = true;


    this.authService.logIn(email, password).subscribe(res=>
      {
        if (res)
        {
          const _result = JSON.parse(JSON.stringify(res));
          let __result = Object.assign(new IMesaj, _result);
          
          if (!__result.getStatus()) {
            this.loading = false;
              notify(__result.getError(), 'error', 2000);
           }
           else
           {
            console.log(__result.getKullaniciDetay());
             this.authService.setLogin(__result.getStatus(),__result.getError(),__result.getKullaniciDetay(),rememberMe);
             this.router.navigate(["/anasayfa"]);
           }
        }
      },
      (err)=>
      {
        notify("Bağlantı sağlanamadı.", 'error', 2000);
      }
    );

    

/*
    if (!_sonuc.detail.isOk) {
      this.loading = false;
        notify(_sonuc.detail.message, 'error', 2000);
     }
     else
     {
       this.router.navigate(["/anasayfa"]);
     }*/

  }
}
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    DxFormModule,
    DxLoadIndicatorModule
  ],
  declarations: [ LoginFormComponent ],
  exports: [ LoginFormComponent ]
})
export class LoginFormModule { }
