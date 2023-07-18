<?php
include_once("database.php");
require_once("log.php");
$mesaj = array('status'=>true,'error'=>'','id'=>null);

if ($mysqli->connect_error) {
    $mesaj['status']=false;
    $mesaj['error']="Veritabanı bağlantısı sağlanamadı";
    die(json_encode($mesaj));
}

$postdata = $_POST;
$getdata= $_GET;
$aksiyon = 'liste';
$tur = '';

if(isset($getdata) && !empty($getdata))
{
$aksiyon = mysqli_real_escape_string($mysqli, trim($getdata['aksiyon']));
$tur = mysqli_real_escape_string($mysqli, trim($getdata['tur']));

if ($tur =='' || $tur==null)
	{
		$tur = '0,1,2,3';
	}
}


$sql = "SELECT s.id,s.durum,st.termin,st.gonderim_tarih FROM satinalma s 
		left outer join satinalma_detay st on st.satinalma_id=s.id
		WHERE s.durum NOT IN (0,2,3)";
$result = mysqli_query($mysqli,$sql);
if($result->num_rows>0)
{
	while($row = mysqli_fetch_row($result)) {
		$_termin_tarih = null;
		$_gonderim_tarih = null;
		if (($row[2]!=null || trim($row[2])!=""))
		{
		
			$_termin_tarih = strtotime($row[2]);  
			if (($row[3]!=null || trim($row[3])!=""))
			{
				$_gonderim_tarih= strtotime($row[3]); 
			}
			else
			{
				$_gonderim_tarih=strtotime("now");
			}
			//echo $_termin_tarih." ".$_gonderim_tarih;
			if ($_termin_tarih<=$_gonderim_tarih)
			{
				$params2 = rtrim("durum=2");
		    	$sql2 = "UPDATE satinalma set $params2 WHERE id=$row[0]";
		    	$mysqli->query($sql2);
			}
		}
	}
	
	
}
if($aksiyon=='sil' && $_SERVER['REQUEST_METHOD'] === 'DELETE')
{
	if(isset($getdata) && !empty($getdata))
	{
	    $token = mysqli_real_escape_string($mysqli, trim($getdata['token']));
	    $id = mysqli_real_escape_string($mysqli, trim($getdata['id']));
	    $proje_id=mysqli_real_escape_string($mysqli, trim($getdata['proje_id']));
	    if ($proje_id=='' || $proje_id==null) $proje_id="0";
	    
	    $sql = "DELETE FROM satinalma WHERE id=$id";
	    logKaydet($mysqli,"satinalma",$token,$id,$sql,'id',$proje_id);
	    $mysqli->query($sql);
	    $sql = "DELETE FROM satinalma_detay WHERE satinalma_id=$id";
	    logKaydet($mysqli,"satinalma_detay",$token,$id,$sql,'satinalma_id',$proje_id);
	    
            $mysqli->close();
            echo true;
	}
	else
	{
	    echo false;
	}  
}else if($aksiyon=='kaydet')
{
	if(isset($postdata) && !empty($postdata))
	{
	    $tarih = mysqli_real_escape_string($mysqli, trim($postdata['tarih']));
	    $kullanici_id = mysqli_real_escape_string($mysqli, trim($postdata['kullanici_id']));
	    $sorumlu_id = mysqli_real_escape_string($mysqli, trim($postdata['sorumlu_id']));
	    $takipci_id = mysqli_real_escape_string($mysqli, trim($postdata['takipci_id'])); 
	    $aciklama = mysqli_real_escape_string($mysqli, trim($postdata['aciklama']));
	    $kullanilacagi_yer = mysqli_real_escape_string($mysqli, trim($postdata['kullanilacagi_yer'])); 
	    $proje_id=mysqli_real_escape_string($mysqli, trim($postdata['proje_id']));
	    $istek = mysqli_real_escape_string($mysqli, trim($postdata['istek'])); 
	     if ($proje_id=='' || $proje_id==null) $proje_id="null";
	     if ($sorumlu_id=='' || $sorumlu_id==null) $sorumlu_id="null";
	    if ($takipci_id=='' || $takipci_id==null) $takipci_id="null";
	    if ($aciklama=='' || $aciklama==null) $aciklama="null";

	    $sql = "INSERT INTO satinalma (tarih, kullanici_id, sorumlu_id,takipci_id,aciklama,kullanilacagi_yer,istek,proje_id) values ('$tarih',$kullanici_id, $sorumlu_id,$takipci_id,'$aciklama','$kullanilacagi_yer','$istek',$proje_id)";
	    $token = mysqli_real_escape_string($mysqli, trim($postdata['token']));
	    logKaydet($mysqli,"satinalma",$token,$id,$sql,'id',$proje_id);
	    
	    if ($mysqli->query($sql)) {
               	$mesaj['status']=true;
		$mesaj['error']='';
		$mesaj['id']=$mysqli->insert_id;
            }
            if ($mysqli->errno) {
                $mesaj['status']=false;
		$mesaj['error']='Satınalma eklenemedi.';
		$mesaj['id']='';
            }
            $mysqli->close();
            echo json_encode($mesaj);
	}
	else
	{
	    $mesaj['status']=false;
	    $mesaj['error']='Yetkisiz erişim.';
	    $mesaj['id']='';
	    echo json_encode($mesaj);
	}  
}
else if ($aksiyon=='list')
{
	$json = json_encode("");
	$token=mysqli_real_escape_string($mysqli, trim($postdata['token']));
	$proje_id=mysqli_real_escape_string($mysqli, trim($postdata['proje_id']));
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

			if ($satinalma==true || $yetkili==true)
			{
				$where="WHERE 1=1 AND s.durum IN ($tur)";
			}else if($kullanici==true)
			{
				$where="WHERE 1=1 AND s.durum IN ($tur) AND (s.kullanici_id=".$kullanici_id." OR s.sorumlu_id=".$kullanici_id." OR s.takipci_id=".$kullanici_id.")";
			}else
			{
				$where="WHERE 1<>1 AND s.durum IN ($tur)";
			}
			if ($proje_id!='' || $proje_id!=null) $where="WHERE 1=1 AND s.durum IN ($tur) AND s.proje_id=".$proje_id;
			
			$sql = "select s.id as id, s.tarih as tarih, s.durum as durum,s.durum as durum_sayisal, 
					s.kullanici_id as kullanici_id,
					s.istek as istek,
					s.aciklama  as aciklama,
					s.sorumlu_id as sorumlu_id,
					s.takipci_id as takipci_id,
					s.kullanilacagi_yer as kullanilacagi_yer,
					s.satinalma_sip_tarih as satinalma_sip_tarih,
					st.aciklama as detay_aciklama,
					st.gonderim_tarih as gelis_tarih,
					st.termin as temrin
					from satinalma s
					left outer join satinalma_detay st on st.satinalma_id=s.id ".$where." ORDER BY tarih DESC";
		
			$result = mysqli_query($mysqli,$sql);
			$rows = [];
			while($row = mysqli_fetch_assoc($result)) {
				$rows[] = $row;
			}
			$json = json_encode($rows);				
			$mysqli->close();
		}
	}
	
    echo $json;
}
else if ($aksiyon=='guncelle')
{
	if(isset($postdata) && !empty($postdata))
	{
	    $token=mysqli_real_escape_string($mysqli, trim($postdata['token']));
	    $id = mysqli_real_escape_string($mysqli, trim($postdata['id']));
	    $tarih = mysqli_real_escape_string($mysqli, trim($postdata['tarih']));
	    $kullanici_id = mysqli_real_escape_string($mysqli, trim($postdata['kullanici_id']));
	    $kullanilacagi_yer = mysqli_real_escape_string($mysqli, trim($postdata['kullanilacagi_yer'])); 
	    $istek = mysqli_real_escape_string($mysqli, trim($postdata['istek'])); 
	    $durum = mysqli_real_escape_string($mysqli, trim($postdata['durum']));
	    $proje_id=mysqli_real_escape_string($mysqli, trim($postdata['proje_id']));
	     if ($proje_id=='' || $proje_id==null) $proje_id="null";
	     
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
		    if (($row2[3]==true))
			{
				if ($tarih!='') $tarih="tarih='$tarih',";
				if ($kullanici_id!='') $kullanici_id="kullanici_id=$kullanici_id,";
				if ($kullanilacagi_yer!='') $kullanilacagi_yer="kullanilacagi_yer='$kullanilacagi_yer',";
				if ($istek!='') $istek="istek='$istek',";
	    			if ($durum!='') $durum="durum=$durum,";
	    			$params = rtrim($tarih.$kullanilacagi_yer.$istek, ",");
	    			$sql3 = "UPDATE satinalma set $params WHERE id=$id";
	    			$token = mysqli_real_escape_string($mysqli, trim($postdata['token']));
	    			logKaydet($mysqli,"satinalma",$token,$id,$sql3,'id',$proje_id);
	    			//echo $sql3;
	    			if ($mysqli->query($sql3)) {
				       	$mesaj['status']=true;
					$mesaj['error']='';
					$mesaj['id']=$id;
				}
				if (($mysqli->errno) || ($mysqli->affected_rows<1)) {
					$mesaj['status']=false;
					$mesaj['error']='Satınalma güncellenemedi.';
					$mesaj['id']='';
				}
			}
			else
			{
				$mesaj['status']=false;
				$mesaj['error']='Kullanıcı pasif durumdadır.';
				$mesaj['id']='';
			}
		}
	    }
	    else
	    {
	    	$mesaj['status']=false;
		$mesaj['error']='Yetkisiz işlem.';
		$mesaj['id']='';
	    }
	    
	    $mysqli->close();
            echo json_encode($mesaj);
	}
	else
	{
	    $mesaj['status']=false;
	    $mesaj['error']='Yetkisiz erişim.';
	    $mesaj['id']='';
	    echo json_encode($mesaj);
	}  
}
else if ($aksiyon=='aciklama_guncelle')
{
	if(isset($postdata) && !empty($postdata))
	{
	    $token=mysqli_real_escape_string($mysqli, trim($postdata['token']));
	    $id = mysqli_real_escape_string($mysqli, trim($postdata['id']));
	    $aciklama = mysqli_real_escape_string($mysqli, trim($postdata['aciklama']));
	    $proje_id=mysqli_real_escape_string($mysqli, trim($postdata['proje_id']));
	     if ($proje_id=='' || $proje_id==null) $proje_id="null";
	     
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
		    if (($row2[3]==true))
			{
				if ($aciklama!='') $aciklama="aciklama='$aciklama',";
	    			$params = rtrim($aciklama, ",");
	    			$sql3 = "UPDATE satinalma set $params WHERE id=$id";
	    			$token = mysqli_real_escape_string($mysqli, trim($postdata['token']));
	    			logKaydet($mysqli,"satinalma",$token,$id,$sql3,'id',$proje_id);
	    			if ($mysqli->query($sql3)) {
				       	$mesaj['status']=true;
					$mesaj['error']='';
					$mesaj['id']=$id;
				}
				if (($mysqli->errno) || ($mysqli->affected_rows<1)) {
					$mesaj['status']=false;
					$mesaj['error']='Satınalma güncellenemedi.';
					$mesaj['id']='';
				}
			}
			else
			{
				$mesaj['status']=false;
				$mesaj['error']='Kullanıcı pasif durumdadır.';
				$mesaj['id']='';
			}
		}
	    }
	    else
	    {
	    	$mesaj['status']=false;
		$mesaj['error']='Yetkisiz işlem.';
		$mesaj['id']='';
	    }
	    
	    $mysqli->close();
            echo json_encode($mesaj);
	}
	else
	{
	    $mesaj['status']=false;
	    $mesaj['error']='Yetkisiz erişim.';
	    $mesaj['id']='';
	    echo json_encode($mesaj);
	}  
}
else if ($aksiyon=='detay_guncelle')
{
	if(isset($postdata) && !empty($postdata))
	{
		//print_r($postdata);
	    $token=mysqli_real_escape_string($mysqli, trim($postdata['token']));
	    $id = mysqli_real_escape_string($mysqli, trim($postdata['id']));
	    $durum = mysqli_real_escape_string($mysqli, trim($postdata['durum']));
	    $satinalma_sip_tarih = mysqli_real_escape_string($mysqli, trim($postdata['satinalma_sip_tarih']));
	    $gelis_tarih= mysqli_real_escape_string($mysqli, trim($postdata['gelis_tarih']));
	    $temrin= mysqli_real_escape_string($mysqli, trim($postdata['temrin']));
	    $istek= mysqli_real_escape_string($mysqli, trim($postdata['istek']));
	    $aciklama= mysqli_real_escape_string($mysqli, trim($postdata['aciklama']));
	    $detay_aciklama= mysqli_real_escape_string($mysqli, trim($postdata['detay_aciklama']));
	    $kullanici_id= mysqli_real_escape_string($mysqli, trim($postdata['kullanici_id']));
	    $kullanilacagi_yer= mysqli_real_escape_string($mysqli, trim($postdata['kullanilacagi_yer']));
	    $proje_id=mysqli_real_escape_string($mysqli, trim($postdata['proje_id']));
	     if ($proje_id=='' || $proje_id==null) $proje_id="null";
	     
	    /*if ($durum=='null' || $durum=='undefined') $durum = null;
	    if ($satinalma_sip_tarih=='null' || $satinalma_sip_tarih=='undefined') $satinalma_sip_tarih = null;
	    if ($gelis_tarih=='null' || $gelis_tarih=='undefined') $gelis_tarih = null;
	    if ($temrin=='null' || $temrin=='undefined') $temrin = null;
	    if ($aciklama=='null' || $aciklama=='undefined') $aciklama = null;
	    if ($detay_aciklama=='null' || $detay_aciklama=='undefined') $detay_aciklama = null;
	    if ($kullanilacagi_yer=='null' || $kullanilacagi_yer=='undefined') $kullanilacagi_yer = null;*/
		
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
	
				if ($satinalma==true || $yetkili==true)
				{
					$sql_detay = "select s.id as id, 
						s.tarih as tarih, 
						s.durum as durum,
						s.durum as durum_sayisal, 
						s.kullanici_id as kullanici_id,
						s.istek as istek,
						s.aciklama  as aciklama,
						s.sorumlu_id as sorumlu_id,
						s.takipci_id as takipci_id,
						s.kullanilacagi_yer as kullanilacagi_yer,
						s.satinalma_sip_tarih as satinalma_sip_tarih,
						st.aciklama as detay_aciklama,
						st.gonderim_tarih as gelis_tarih,
						st.termin as temrin,
						st.kullanici_id as st_kul_id
						from satinalma s
						left outer join satinalma_detay st on st.satinalma_id=s.id WHERE s.id=$id";
					
					$result_detay = mysqli_query($mysqli,$sql_detay);
					$row_detay = $result_detay->fetch_row();

					if ($kullanilacagi_yer!='null') $kullanilacagi_yer="kullanilacagi_yer='$kullanilacagi_yer',"; else $kullanilacagi_yer="kullanilacagi_yer=null,";
					if ($detay_aciklama!='null') $detay_aciklama="aciklama='$detay_aciklama',"; else $detay_aciklama="aciklama=null,";
					if ($aciklama!='null') $aciklama="aciklama='$aciklama',"; else  $aciklama="aciklama=null,";
					if ($istek!='null') $istek="istek='$istek',"; else $istek="istek=null,";
					if ($temrin!='null') $temrin="termin='$temrin',"; else $temrin="termin=null,";
					if ($gelis_tarih!='null') $gelis_tarih="gonderim_tarih='$gelis_tarih',"; else $gelis_tarih="gonderim_tarih=null,";
					if ($satinalma_sip_tarih!='null') $satinalma_sip_tarih="satinalma_sip_tarih='$satinalma_sip_tarih',"; else $satinalma_sip_tarih="satinalma_sip_tarih=null,";
					$durum="durum=$durum,";
					// satinalma
					$params = rtrim($aciklama.$satinalma_sip_tarih.$durum.$kullanilacagi_yer.$istek, ","); 
					//echo $params."\r\n";
					// satinalma_detay
					$params_detay = rtrim($detay_aciklama.$temrin.$gelis_tarih, ",");
					//echo $params_detay."\r\n";
					if(!$row_detay[14])
					{
						$sql_detay = "INSERT INTO satinalma_detay (satinalma_id,kullanici_id) values ($id,$kullanici_id)";
	    					$mysqli->query($sql_detay);
	    					$token = mysqli_real_escape_string($mysqli, trim($postdata['token']));
	    					logKaydet($mysqli,"satinalma",$token,$id,$sql_detay,'id',$proje_id);
					}
						if ($params!='')
						{
							$sql_detay = "UPDATE satinalma set $params   WHERE id=$id";
							$token = mysqli_real_escape_string($mysqli, trim($postdata['token']));
	    						logKaydet($mysqli,"satinalma",$token,$id,$sql_detay,'id',$proje_id);
	    						
							if (!$mysqli->query($sql_detay)) 
							{
								$mesaj['status']=false;
								$mesaj['error']='2Satınalma detayı güncellenemedi.';
								$mesaj['id']='';
							}	
						}
						if ($params_detay!='')
								{
									$sql_detay = "UPDATE satinalma_detay set $params_detay WHERE satinalma_id=$id";
									$token = mysqli_real_escape_string($mysqli, trim($postdata['token']));
	    								logKaydet($mysqli,"satinalma_detay",$token,$id,$sql_detay,"satinalma_id",$proje_id);
									if ($mysqli->query($sql_detay)) {
											$mesaj['status']=true;
											$mesaj['error']='';
											$mesaj['id']=$id;
									}
									else
									{
										$mesaj['status']=false;
										$mesaj['error']='1Satınalma detayı güncellenemedi.';
										$mesaj['id']='';
									}	
								}
						
						else
						{
							$mesaj['status']=false;
							$mesaj['error']='Güncellenecek bir şey bulunamadı.';
							$mesaj['id']='';
						}
						$mysqli->close();
					}
					else
					{
						$mesaj['status']=false;
						$mesaj['error']='3Satınalma detayı güncellenemedi.';
						$mesaj['id']='';
					}
			}
			else
			{
				$mesaj['status']=false;
				$mesaj['error']='4Satınalma detayı güncellenemedi.';
				$mesaj['id']='';
			}
		}
	    else
	    {
	    	$mesaj['status']=false;
			$mesaj['error']='Yetkisiz işlem.';
			$mesaj['id']='';
	    }
	}
	else
	{
	    $mesaj['status']=false;
	    $mesaj['error']='Yetkisiz erişim.';
	    $mesaj['id']='';
	}  
	echo json_encode($mesaj);
}
else
{
	$mesaj['status']=false;
	$mesaj['error']='Yetkisiz erişim.';
	$mesaj['id']='';
	echo json_encode($mesaj);
}
?>
