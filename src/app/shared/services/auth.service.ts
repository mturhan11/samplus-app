import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import {Md5} from "md5-typescript";
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export class IMesaj {
  public status!: boolean;
  public error!: string;
  public kullanici_detay!: IUser;

  getStatus()
  {
    return this.status;
  }
  getError()
  {
    return this.error;
  }
  getKullaniciDetay()
  {
    return this.kullanici_detay;
  }
}

export class IUser {
  public id: number;
  public eposta: string;
  public token: string;
  public adisoyadi: string;
  public yetkili: boolean;
  public satinalma: boolean;
  public kullanici: boolean;
  public avatar: string;

  constructor(id:number,eposta: string,token: string,adisoyadi: string,yetkili: boolean,satinalma: boolean,kullanici: boolean,avatar: string) {
    this.id = id;
    this.eposta = eposta;
    this.token = token;
    this.adisoyadi = adisoyadi;
    this.yetkili = yetkili;
    this.satinalma = satinalma;
    this.kullanici = kullanici;
    this.avatar = avatar;
    }
}

const defaultPath = '/';

@Injectable(
  {
    providedIn: 'root'
  }
  
)

export class AuthService {
  private _user?: IUser;

  constructor(private router: Router,private httpClient : HttpClient) { }

  private _lastAuthenticatedPath: string = defaultPath;
  set lastAuthenticatedPath(value: string) {
    this._lastAuthenticatedPath = value;
  }

  removeData(){
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('email');
    localStorage.removeItem('token');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('id');
    sessionStorage.removeItem('yetki');
    sessionStorage.removeItem('satinalma');
    sessionStorage.removeItem('kullanici');
    sessionStorage.removeItem('adisoyadi');
    sessionStorage.removeItem('avatar');
    localStorage.clear;
    sessionStorage.clear;
  }

  get loggedIn(): boolean {
    var _sonuc=false;
    var _rsonuc=false;
    if (localStorage.getItem('isLoggedIn')===undefined) _sonuc=false;
    if (localStorage.getItem('isLoggedIn')===null) _sonuc=false;
    if (localStorage.getItem('isLoggedIn')=='false') _sonuc=false;
    if (localStorage.getItem('isLoggedIn')=='true') _sonuc=true;
    if (localStorage.getItem('rememberMe')===undefined) _rsonuc=false;
    if (localStorage.getItem('rememberMe')===null) _rsonuc=false;
    if (localStorage.getItem('rememberMe')=='false') _rsonuc=false;
    if (localStorage.getItem('rememberMe')=='true') _rsonuc=true;
    if (!_sonuc && !_rsonuc)
    {
      this.removeData();
      return false;
    }
    else
    {
      return _sonuc;
    }
  }

  setLogin(_status:boolean,_error:string,_kullanici_detay:IUser,rememberMe:boolean)
  {
    sessionStorage.setItem('isLoggedIn',_status?"true":"false");
    localStorage.setItem('isLoggedIn',_status?"true":"false");
    if (rememberMe == true)
    {
      localStorage.setItem('rememberMe','true');
    }
    else
    {
      localStorage.setItem('rememberMe','false');
    }
   
    if (_status==true)
    {
      localStorage.setItem('email',_kullanici_detay.eposta);
      localStorage.setItem('token', _kullanici_detay.token);
      sessionStorage.setItem('id', _kullanici_detay.id.toString());
      localStorage.setItem('adisoyadi', _kullanici_detay.adisoyadi);
      localStorage.setItem('avatar', _kullanici_detay.avatar);
      console.log(_kullanici_detay.token);
      if (_kullanici_detay.yetkili==true) sessionStorage.setItem('yetki',"true");
      if (_kullanici_detay.satinalma==true) sessionStorage.setItem('satinalma',"true");
      if (_kullanici_detay.kullanici==true) sessionStorage.setItem('kullanici',"true");
      if (_kullanici_detay.yetkili==false) sessionStorage.setItem('yetki',"false");
      if (_kullanici_detay.satinalma==false) sessionStorage.setItem('satinalma',"false");
      if (_kullanici_detay.kullanici==false) sessionStorage.setItem('kullanici',"false");
    }
  }

   logIn(email: string, password: string) {
    let payload = new HttpParams();
    payload = payload.append("eposta",email);
    payload = payload.append("password",password);
    //const result =  this.httpClient.post('../../../ws-login.php',payload);
    const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-login.php',payload);
    return result;
  }
  
  logInToken(token: string) {
    let payload = new HttpParams();
    payload = payload.append("token",token);
    //const result =  this.httpClient.post('../../../ws-login.php?token',payload);
    const result =  this.httpClient.post(environment._baseUrl+'/ws/ws-login.php?token',payload);
    return result;
  }

  async getLoginInfo(){
    return new Promise((resolve, reject) => {
      this.logInToken(localStorage.getItem('token')!).subscribe(res=>
        {
          if (res)
          {
            const _result = JSON.parse(JSON.stringify(res));
            let __result = Object.assign(new IMesaj, _result);
            
            if (!__result.getStatus()) {
               this.removeData();
               this.logOut();
               resolve(null);
             }
             else
             {
               var rememberMe=false;
               if (localStorage.getItem('rememberMe')=='true') rememberMe=true;
               this.setLogin(__result.getStatus(),__result.getError(),__result.getKullaniciDetay(),rememberMe);
               const that=this;
                setTimeout(function () {
                  console.log("3");
                  window.location.reload();
                  }, 1000);
               resolve(true);
             }
          }
        },
        (err)=>
        {
          this.removeData();
          this.logOut();
          resolve(null);
        }
      );
    });

    
  }

  async resetPassword(email: string) {
    try {
      // Send request

      return {
        isOk: true
      };
    }
    catch {
      return {
        isOk: false,
        message: "Parola sıfırlama başarısız"
      };
    }
  }

  async logOut() {
    this.removeData();
    this.router.navigate(['/giris-yap']);
  }
}

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private router: Router, private authService: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const isLoggedIn = this.authService.loggedIn;
    const isAuthForm = [
      'giris-yap',
      'parola-sifirla'
    ].includes(route.routeConfig?.path || defaultPath);

    if (isLoggedIn && isAuthForm) {
      this.authService.lastAuthenticatedPath = defaultPath;
      this.router.navigate([defaultPath]);
      return false;
    }

    if (!isLoggedIn && !isAuthForm ){
      this.authService.lastAuthenticatedPath = defaultPath;
      this.router.navigate(['/giris-yap']);
    }

    if (isLoggedIn) {
      this.authService.lastAuthenticatedPath = route.routeConfig?.path || defaultPath;
    }

    return isLoggedIn || isAuthForm;
  }
}
