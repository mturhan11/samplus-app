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
	$sql = "SELECT id,ayar_adi,aciklama,deger,aktif FROM ayarlar order by ayar_adi DESC";
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
	    $id = mysqli_real_escape_string($mysqli, trim($postdata['id']));
	    $deger = mysqli_real_escape_string($mysqli, trim($postdata['deger']));
	    
	    if ($deger!='') $deger="deger='$deger',";

	    $params = rtrim($deger, ",");
	    $sql = "UPDATE ayarlar set $params WHERE id=$id";
	    //echo $sql;
	    
	    if ($mysqli->query($sql)) {
               	$mesaj['status']=true;
		        $mesaj['error']='';
		        $mesaj['id']=$id;
        }
        if (($mysqli->errno) || ($mysqli->affected_rows<1)) {
                $mesaj['status']=false;
		        $mesaj['error']='Ayar güncellenemedi.';
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
