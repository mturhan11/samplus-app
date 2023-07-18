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

			if ($yetkili==true)
			{
				if ($proje_id!='' || $proje_id!=null) 
					{
						$where = "WHERE 1=1 AND l.proje_id=".$proje_id;
					}else
					{
						$where = "WHERE 1=1";
					}
				$sql = "select * from log l $where order by tarih";
				$result = mysqli_query($mysqli,$sql);
				$rows = [];
				while($row = mysqli_fetch_assoc($result)) {
					$rows[] = $row;
				}
				$json = json_encode($rows);
				
			}
						
			$mysqli->close();
		}
	}
	
    echo $json;
}
else
{
	$mesaj['status']=false;
	$mesaj['error']='Yetkisiz erişim.';
	$mesaj['id']='';
	echo json_encode($mesaj);
}
?>
