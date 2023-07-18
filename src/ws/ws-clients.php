<?php
include_once("database.php");
require_once("log.php");
$mesaj = array('status'=>true,'error'=>'','id'=>null);

error_reporting(E_ALL);
error_reporting(-1);
ini_set('error_reporting', E_ALL);

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
	    
	    $sql = "DELETE FROM tan_musteri WHERE id=$id";
	    logKaydet($mysqli,"tan_musteri",$token,$id,$sql);
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
	    $musteri_adi = mysqli_real_escape_string($mysqli, trim($postdata['musteri_adi']));
	    $token = mysqli_real_escape_string($mysqli, trim($postdata['token']));
	    
	    $sql = "INSERT INTO tan_musteri (musteri_adi,aktif) values ('$musteri_adi',true)";
	    //echo $sql;
	    logKaydet($mysqli,"tan_musteri",$token,0,$sql);
		    if ($mysqli->query($sql)) {
		       	$mesaj['status']=true;
			$mesaj['error']='';
			$mesaj['id']=$mysqli->insert_id;
		    }
		    if ($mysqli->errno) {
		        $mesaj['status']=false;
			$mesaj['error']='Müşteri eklenemedi.';
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
	$sql = "SELECT * FROM tan_musteri";
    	//echo $sql;
    	$result = mysqli_query($mysqli,$sql);
    	$rows = [];
	while($row = mysqli_fetch_assoc($result)) {
	    $rows[] = $row;
	}
	$json = json_encode($rows);
	$json = str_replace("\"aktif\":\"1\"","\"aktif\":true",$json);
	$json = str_replace("\"aktif\":\"0\"","\"aktif\":false",$json);
	echo $json;
}
else if ($aksiyon=='guncelle')
{
	if(isset($postdata) && !empty($postdata))
	{
	    $token = mysqli_real_escape_string($mysqli, trim($postdata['token']));
	    $id = mysqli_real_escape_string($mysqli, trim($postdata['id']));
	    $musteri_adi = mysqli_real_escape_string($mysqli, trim($postdata['musteri_adi']));
	    $aktif = mysqli_real_escape_string($mysqli, trim($postdata['aktif']));
	    
	    if ($musteri_adi!='') $musteri_adi="musteri_adi='$musteri_adi',";
	    if ($aktif=='true') $aktif="aktif=true,";
	    if ($aktif=='false') $aktif="aktif=false,";
	    $params = rtrim($musteri_adi.$aktif, ",");

	    $sql = "UPDATE tan_musteri set $params WHERE id=$id";
	    //echo $sql;
	    logKaydet($mysqli,"tan_musteri",$token,$id,$sql);
	    if ($mysqli->query($sql)) {
               	$mesaj['status']=true;
		$mesaj['error']='';
		$mesaj['id']=$id;
            }
            if (($mysqli->errno) || ($mysqli->affected_rows<1)) {
                $mesaj['status']=false;
		$mesaj['error']='Müşteri güncellenemedi.';
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
