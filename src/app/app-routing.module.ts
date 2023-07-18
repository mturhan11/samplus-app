import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginFormComponent, ResetPasswordFormComponent } from './shared/components';
import { AuthGuardService } from './shared/services';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { SatinalmaComponent } from './pages/satinalma/satinalma.component';
import { ArsivGorevArsiviComponent } from './pages/arsiv/gorev-arsivi/gorev-arsivi.component';
import { DxDataGridModule, DxFormModule } from 'devextreme-angular';
import { ArsivProjeArsiviComponent } from './pages/arsiv/proje-arsivi/proje-arsivi.component';
import { TanimlamaAyarlarComponent } from './pages/tanimlama/ayarlar/ayarlar.component';
import { TanimlamaKullanicilarComponent } from './pages/tanimlama/kullanicilar/kullanicilar.component';
import { TanimlamaKontrolListesiComponent } from './pages/tanimlama/kontrol-listesi/kontrol-listesi.component';
import { TanimlamaMusterilerComponent } from './pages/tanimlama/musteriler/musteriler.component';
import { TanimlamaUrunGrubuComponent } from './pages/tanimlama/urun-grubu/urun-grubu.component';
import { GorevlendirmeComponent } from './pages/gorevlendirme/gorevlendirme.component';
import { MesajlarComponent } from './pages/mesajlar/mesajlar.component';
import { ProjelerComponent } from './pages/projeler/projeler.component';
import { ProjeComponent } from './pages/projeler/proje.component';

const routes: Routes = [
  {
    path: 'tasks',
    component: TasksComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'anasayfa',
    component: HomeComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'mesajlar',
    component: MesajlarComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'satinalma',
    component: SatinalmaComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'gorevlendirme',
    component: GorevlendirmeComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'projeler/projeler',
    component: ProjelerComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'proje/:id/:ust_proje',
    component: ProjeComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'proje/:id',
    component: ProjeComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'tanimlama/ayarlar',
    component: TanimlamaAyarlarComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'tanimlama/kullanicilar',
    component: TanimlamaKullanicilarComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'tanimlama/musteriler',
    component: TanimlamaMusterilerComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'tanimlama/urun-grubu',
    component: TanimlamaUrunGrubuComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'tanimlama/kontrol-listesi',
    component: TanimlamaKontrolListesiComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'arsiv/proje-arsivi',
    component: ArsivProjeArsiviComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'arsiv/gorev-arsivi',
    component: ArsivGorevArsiviComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'giris-yap',
    component: LoginFormComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'parola-sifirla',
    component: ResetPasswordFormComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: '**',
    redirectTo: 'anasayfa'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true }), DxDataGridModule, DxFormModule],
  providers: [AuthGuardService],
  exports: [RouterModule],
  declarations: [
    ProfileComponent,
    TasksComponent
  ]
})
export class AppRoutingModule { }
