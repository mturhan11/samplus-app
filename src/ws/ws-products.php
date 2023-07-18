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
	    
	    $sql = "DELETE FROM tan_urungrubu WHERE id=$id";
	    logKaydet($mysqli,"tan_urungrubu",$token,$id,$sql);
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
	    
	    $grup_adi = mysqli_real_escape_string($mysqli, trim($postdata['grup_adi']));

	    $sql = "INSERT INTO tan_urungrubu (grup_adi,aktif) values ('$grup_adi',true)";
	    $token = mysqli_real_escape_string($mysqli, trim($postdata['token']));
	    logKaydet($mysqli,"tan_urungrubu",$token,$id,$sql);
	    
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
	$sql = "SELECT * FROM tan_urungrubu";
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
	    $id = mysqli_real_escape_string($mysqli, trim($postdata['id']));
	    $grup_adi = mysqli_real_escape_string($mysqli, trim($postdata['grup_adi']));
	    $aktif = mysqli_real_escape_string($mysqli, trim($postdata['aktif']));
	    
	    if ($grup_adi!='') $grup_adi="grup_adi='$grup_adi',";
	    if ($aktif=='true') $aktif="aktif=1,";
	    if ($aktif=='false') $aktif="aktif=0,";
	    $params = rtrim($grup_adi.$aktif, ",");
	    $sql = "UPDATE tan_urungrubu set $params WHERE id=$id";
	    $token = mysqli_real_escape_string($mysqli, trim($postdata['token']));
	    logKaydet($mysqli,"tan_urungrubu",$token,$id,$sql);
	    
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
