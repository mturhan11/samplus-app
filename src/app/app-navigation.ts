export const navigation_yonetici = [
  {
    text: 'Anasayfa',
    path: '/anasayfa',
    icon: 'fa fa-home'
  },
  {
    text: 'Mesajlar',
    path: '/mesajlar',
    icon: 'fa fa-commenting'
  },
  {
    text: 'Projeler',
    icon: 'fa fa-briefcase',
    items: [
      {
        text: 'Projeler',
        path: '/projeler/projeler'
      },
      {
        text: 'A Projesi',
        items:[
          {
            text : 'A Projesi - 1',
            path : '/projeler/1',
            icon : '1'
          },
          {
            text : 'A Projesi - 2',
            path : '/projeler/2',
            icon : '1'
          },
        ]
      },
      {
        text: 'B Projesi',
        path: '/projeler/3'
      }
    ]
  },
  {
    text: 'Satınalma',
    icon: 'fa fa-shopping-cart',
    path: '/satinalma'
  },
  {
    text: 'Görevlendirme',
    icon: 'fa fa-list-ul',
    path: '/gorevlendirme'
  },
  {
    text: 'Tanımlamalar',
    icon: 'fa fa-gears',
    items: [
      {
        text: 'Ayarlar',
        path: '/tanimlama/ayarlar',

      },
      {
        text: 'Kullanıcılar',
        path: '/tanimlama/kullanicilar',

      },
      {
        text: 'Müşteriler',
        path: '/tanimlama/musteriler',

      },
      {
        text: 'Ürün Grubu',
        path: '/tanimlama/urun-grubu',

      },
      {
        text: 'Kontrol Listesi',
        path: '/tanimlama/kontrol-listesi',

      },
    ]
  },
  {
    text: 'Arşiv',
    icon: 'fa fa-archive',
    items: [
      {
        text: 'Log Arşivi',
        path: '/arsiv/log-arsivi',

      },
      {
        text: 'Proje Arşivi',
        path: '/arsiv/proje-arsivi',

      },
      {
        text: 'Görevlendirme Arşivi',
        path: '/arsiv/gorev-arsivi',

      },
    ]
  }
];



export const navigation_kullanici = [
  {
    text: 'Anasayfa',
    path: '/anasayfa',
    icon: 'fa fa-home'
  },
  {
    text: 'Mesajlar',
    path: '/mesajlar',
    icon: 'fa fa-commenting'
  },
  {
    text: 'Satınalma',
    path: '/satinalma',
    icon: 'fa fa-shopping-cart'
  },
  {
    text: 'Projeler',
    icon: 'fa fa-briefcase',
    items: [
      {
        text: 'A Projesi',
        items:[
          {
            text : 'A Projesi - 1',
            path : '/aa-alt',
            icon : '1'
          },
          {
            text : 'A Projesi - 2',
            path : '/aa-alt2',
            icon : '1'
          },
        ]
      },
      {
        text: 'B Projesi',
        path: '/b-projesi'
      }
    ]
  }
];


export const navigation_satinalma = [
  {
    text: 'Anasayfa',
    path: '/anasayfa',
    icon: 'fa fa-home'
  },
  {
    text: 'Mesajlar',
    path: '/mesajlar',
    icon: 'fa fa-commenting'
  },
  {
    text: 'Satınalma',
    path: '/satinalma',
    icon: 'fa fa-shopping-cart'
  }
];