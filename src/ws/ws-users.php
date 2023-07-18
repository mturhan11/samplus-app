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

if(isset($getdata) && !empty($getdata))
{
$aksiyon = mysqli_real_escape_string($mysqli, trim($getdata['aksiyon']));
}

if($aksiyon=='sil' && $_SERVER['REQUEST_METHOD'] === 'DELETE')
{
	if(isset($getdata) && !empty($getdata))
	{
	    $token = mysqli_real_escape_string($mysqli, trim($getdata['token']));
	    $id = mysqli_real_escape_string($mysqli, trim($getdata['id']));
	    
	    $sql = "DELETE FROM tan_kullanicilar WHERE id=$id";
	    logKaydet($mysqli,"tan_kullanicilar",$token,$id,$sql);
	    
	    $mysqli->query($sql);
        echo true;
	}
	else
	{
	    echo false;
	}  
} else if($aksiyon=='kaydet')
{
	if(isset($postdata) && !empty($postdata))
	{
	    $eposta = mysqli_real_escape_string($mysqli, trim($postdata['eposta']));
	    $yetki = mysqli_real_escape_string($mysqli, trim($postdata['yetki']));
	    $satinalma = mysqli_real_escape_string($mysqli, trim($postdata['satinalma']));
	    $kullanici = mysqli_real_escape_string($mysqli, trim($postdata['kullanici'])); 
	    $avatar = mysqli_real_escape_string($mysqli, trim($postdata['avatar']));
	    $adisoyadi = mysqli_real_escape_string($mysqli, trim($postdata['adisoyadi'])); 
	    if ($eposta==undefined) {
		    $mesaj['status']=false;
		    $mesaj['error']="e-Posta adresi boş olamaz.";
		    die(json_encode($mesaj));
	    }  
	    $sql = "INSERT INTO tan_kullanicilar (eposta,sifre,yetkili,satinalma,kullanici,aktif,avatar,adisoyadi) values ('$eposta','123456',$yetki,$satinalma,$kullanici,true,'$avatar','$adisoyadi')";
	    $token = mysqli_real_escape_string($mysqli, trim($postdata['token']));
	    logKaydet($mysqli,"tan_kullanicilar",$token,$id,$sql);
	    
	    if ($mysqli->query($sql)) {
               	$mesaj['status']=true;
		$mesaj['error']='';
		$mesaj['id']=$mysqli->insert_id;
            }
            if ($mysqli->errno) {
                $mesaj['status']=false;
		$mesaj['error']='Kullanıcı eklenemedi.';
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
	$sql = "SELECT id,eposta,yetkili,satinalma,kullanici,aktif,avatar,adisoyadi FROM tan_kullanicilar";
    	//echo $sql;
    	$result = mysqli_query($mysqli,$sql);
    	$rows = [];
	while($row = mysqli_fetch_assoc($result)) {
	    $rows[] = $row;
	}
	$json = json_encode($rows);
	$json = str_replace("\"yetkili\":\"1\"","\"yetkili\":true",$json);
	$json = str_replace("\"satinalma\":\"1\"","\"satinalma\":true",$json);
	$json = str_replace("\"kullanici\":\"1\"","\"kullanici\":true",$json);
	$json = str_replace("\"aktif\":\"1\"","\"aktif\":true",$json);
	$json = str_replace("\"yetkili\":\"0\"","\"yetkili\":false",$json);
	$json = str_replace("\"satinalma\":\"0\"","\"satinalma\":false",$json);
	$json = str_replace("\"kullanici\":\"0\"","\"kullanici\":false",$json);
	$json = str_replace("\"aktif\":\"0\"","\"aktif\":false",$json);
	echo $json;
}
else if ($aksiyon=='guncelle')
{
	if(isset($postdata) && !empty($postdata))
	{
	    $id = mysqli_real_escape_string($mysqli, trim($postdata['id']));
	    $eposta = mysqli_real_escape_string($mysqli, trim($postdata['eposta']));
	    $yetki = mysqli_real_escape_string($mysqli, trim($postdata['yetki']));
	    $satinalma = mysqli_real_escape_string($mysqli, trim($postdata['satinalma']));
	    $kullanici = mysqli_real_escape_string($mysqli, trim($postdata['kullanici'])); 
	    $aktif = mysqli_real_escape_string($mysqli, trim($postdata['aktif'])); 
	    $avatar = mysqli_real_escape_string($mysqli, trim($postdata['avatar']));
	    $adisoyadi = mysqli_real_escape_string($mysqli, trim($postdata['adisoyadi'])); 
	    
	    if ($eposta!='') $eposta="eposta='$eposta',";
	    if ($yetki!='') $yetki="yetkili=$yetki,";
	    if ($satinalma!='') $satinalma="satinalma=$satinalma,";
	    if ($kullanici!='') $kullanici="kullanici=$kullanici,";
	    if ($aktif!='') $aktif="aktif=$aktif,";
	    if ($avatar!='') $avatar="avatar='$avatar',";
	    if ($adisoyadi!='') $adisoyadi="adisoyadi='$adisoyadi',";
	    $params = rtrim($eposta.$yetki.$satinalma.$kullanici.$aktif.$avatar.$adisoyadi, ",");
	    $sql = "UPDATE tan_kullanicilar set $params WHERE id=$id";
	    $token = mysqli_real_escape_string($mysqli, trim($postdata['token']));
	    logKaydet($mysqli,"tan_kullanicilar",$token,$id,$sql);
	    
	    if ($mysqli->query($sql)) {
               	$mesaj['status']=true;
		$mesaj['error']='';
		$mesaj['id']=$id;
            }
            if (($mysqli->errno) || ($mysqli->affected_rows<1)) {
                $mesaj['status']=false;
		$mesaj['error']='Kullanıcı güncellenemedi.';
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
else
{
	$mesaj['status']=false;
	$mesaj['error']='Yetkisiz erişim.';
	$mesaj['id']='';
	echo json_encode($mesaj);
}



?>
