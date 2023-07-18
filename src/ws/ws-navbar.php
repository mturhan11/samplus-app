<?php
include_once("database.php");
$mesaj = array('status'=>true,'error'=>'','id'=>null);

if ($mysqli->connect_error) {
    $mesaj['status']=false;
    $mesaj['error']="Veritabanı bağlantısı sağlanamadı";
    die(json_encode($mesaj));
}

$postdata = $_POST;
$getdata= $_GET;
$aksiyon = 'liste';

if(isset($getdata) && !empty($getdata))
{
$aksiyon = mysqli_real_escape_string($mysqli, trim($getdata['aksiyon']));
}

if ($aksiyon=='list')
{
	$menu=array();
	$token=mysqli_real_escape_string($mysqli, trim($postdata['token']));
	$expire = date('Y-m-d',strtotime('today')-1);
	$sql = "SELECT kullanici_id,token FROM token where token='$token' and expire>'$expire'";
	$result = mysqli_query($mysqli,$sql);
	if($result->num_rows==1)
	{
	   	$row = $result->fetch_row();
	   	$sql2 = "SELECT yetkili,satinalma,kullanici,aktif FROM tan_kullanicilar where id=$row[0]";
	   	$result2 = mysqli_query($mysqli,$sql2);
		if($result2->num_rows==1)
		{
			$row2 = $result2->fetch_row();
			$kullanici_id=$row[0];
			$yetkili=false;
			$satinalma=false;
			$kullanici=false;
			if ($row2[0]==1) $yetkili=true;
			if ($row2[1]==1) $satinalma=true;
			if ($row2[2]==1) $kullanici=true;

			if ($yetkili==true)
			{
				$menu_seviye_1 = array();
				$menu_seviye_1['text']="Anasayfa";
				$menu_seviye_1['path']="/anasayfa";
				$menu_seviye_1['icon']="fa fa-home";
				$menu[] = $menu_seviye_1;
				
				$menu_seviye_1 = array();
				$menu_seviye_1['text']="Mesajlar";
				$menu_seviye_1['path']="/mesajlar";
				$menu_seviye_1['icon']="fa fa-commenting";
				$menu[] = $menu_seviye_1;
				
				$menu_seviye_1 = array();
				$menu_seviye_1['text']="Projeler";
				$menu_seviye_1['icon']="fa fa-briefcase";
				
					$menu_seviye_2=array();
					$menu_seviye_2_alt=array();
					$menu_seviye_2_alt['text']="Projeler";
					$menu_seviye_2_alt['path']="/projeler/projeler";
					$menu_seviye_2[]=$menu_seviye_2_alt;
					
					$menu_seviye_2_alt=array();
					$menu_seviye_2_alt['text']="B Projesi";
					$menu_seviye_2_alt['path']="/proje/1";
					$menu_seviye_2[]=$menu_seviye_2_alt;
					
					$menu_seviye_2_alt=array();
					$menu_seviye_2_alt['text']="A Projesi";
					
						$menu_seviye_3=array();
						$menu_seviye_3_alt=array();
						$menu_seviye_3_alt['text']="Alt 1";
						$menu_seviye_3_alt['path']="/proje/1/1";
						$menu_seviye_3_alt['icon']="1";
						$menu_seviye_3[]=$menu_seviye_3_alt;
						
						$menu_seviye_2_alt['items']=$menu_seviye_3;
					$menu_seviye_2[]=$menu_seviye_2_alt;
				
				$menu_seviye_1['items']=$menu_seviye_2;
				$menu[] = $menu_seviye_1;
				
				$menu_seviye_1 = array();
				$menu_seviye_1['text']="Satınalma";
				$menu_seviye_1['path']="/satinalma";
				$menu_seviye_1['icon']="fa fa-shopping-cart";
				$menu[] = $menu_seviye_1;
				
				$menu_seviye_1 = array();
				$menu_seviye_1['text']="Görevlendirme";
				$menu_seviye_1['path']="/gorevlendirme";
				$menu_seviye_1['icon']="fa fa-list-ul";
				$menu[] = $menu_seviye_1;
				
				$menu_seviye_1 = array();
				$menu_seviye_1['text']="Tanımlamalar";
				$menu_seviye_1['icon']="fa fa-gears";
				
					$menu_seviye_2=array();
					$menu_seviye_2_alt=array();
					$menu_seviye_2_alt['text']="Ayarlar";
					$menu_seviye_2_alt['path']="/tanimlama/ayarlar";
					$menu_seviye_2[]=$menu_seviye_2_alt;
					
					$menu_seviye_2_alt=array();
					$menu_seviye_2_alt['text']="Kullanıcılar";
					$menu_seviye_2_alt['path']="/tanimlama/kullanicilar";
					$menu_seviye_2[]=$menu_seviye_2_alt;
					
					$menu_seviye_2_alt=array();
					$menu_seviye_2_alt['text']="Müşteriler";
					$menu_seviye_2_alt['path']="/tanimlama/musteriler";
					$menu_seviye_2[]=$menu_seviye_2_alt;
					
					$menu_seviye_2_alt=array();
					$menu_seviye_2_alt['text']="Ürün Grubu";
					$menu_seviye_2_alt['path']="/tanimlama/urun-grubu";
					$menu_seviye_2[]=$menu_seviye_2_alt;
					
					$menu_seviye_2_alt=array();
					$menu_seviye_2_alt['text']="Kontrol Listesi";
					$menu_seviye_2_alt['path']="/tanimlama/kontrol-listesi";
					$menu_seviye_2[]=$menu_seviye_2_alt;

				$menu_seviye_1['items']=$menu_seviye_2;
				$menu[] = $menu_seviye_1;
				
				$menu_seviye_1 = array();
				$menu_seviye_1['text']="Arşiv";
				$menu_seviye_1['icon']="fa fa-archive";
				
					$menu_seviye_2=array();
					$menu_seviye_2_alt=array();
					$menu_seviye_2_alt['text']="Log Arşivi";
					$menu_seviye_2_alt['path']="/arsiv/log-arsivi";
					$menu_seviye_2[]=$menu_seviye_2_alt;
					
					$menu_seviye_2_alt=array();
					$menu_seviye_2_alt['text']="Proje Arşivi";
					$menu_seviye_2_alt['path']="/arsiv/proje-arsivi";
					$menu_seviye_2[]=$menu_seviye_2_alt;
					
					$menu_seviye_2_alt=array();
					$menu_seviye_2_alt['text']="Görevlendirme Arşivi";
					$menu_seviye_2_alt['path']="/arsiv/gorev-arsivi";
					$menu_seviye_2[]=$menu_seviye_2_alt;

				$menu_seviye_1['items']=$menu_seviye_2;
				$menu[] = $menu_seviye_1;
	
			}			
			$mysqli->close();
		}
	}
	
    echo json_encode($menu);
}
else
{
	$mesaj['status']=false;
	$mesaj['error']='Yetkisiz erişim.';
	$mesaj['id']='';
	echo json_encode($mesaj);
}
?>
