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

if ($aksiyon=='okunmamis')
{
	$_id=mysqli_real_escape_string($mysqli, trim($postdata['_id']));
	$token=mysqli_real_escape_string($mysqli, trim($postdata['token']));
   	$expire = date('Y-m-d',strtotime('today')-1);
	$sql = "SELECT kullanici_id,token FROM token where token='$token' and expire>'$expire'";
	$result = mysqli_query($mysqli,$sql);
	if($result->num_rows==1)
	{
		$row = $result->fetch_row();
		$kullanici_id=$row[0];
		$sql = "SELECT count(case okuma_tarih  when null then 1 else 0 end) as Okunmamis from mesajlar m where m.gonderen_id=$_id and m.alici_id =$kullanici_id";
		$result = mysqli_query($mysqli,$sql);
			if($result->num_rows==1)
			{
				$row = $result->fetch_row();
				$mesaj['status']=true;
				$mesaj['error']='';
				$mesaj['id']=$row[0];			
			}
			else
			{
				$mesaj['status']=true;
				$mesaj['error']='';
				$mesaj['id']='0';
			}
	}
	else
	{
		$mesaj['status']=true;
		$mesaj['error']='';
		$mesaj['id']='0';
	}
	$mysqli->close();
	$json = json_encode($mesaj);
	echo $json;
}
else if ($aksiyon=='grup')
{
$json="";
    $token=mysqli_real_escape_string($mysqli, trim($postdata['token']));

    $expire = date('Y-m-d',strtotime('today')-1);
	$sql = "SELECT kullanici_id,token FROM token where token='$token' and expire>'$expire'";
	$result = mysqli_query($mysqli,$sql);
	if($result->num_rows==1)
	{
        $row = $result->fetch_row();
        $kullanici_id=$row[0];
        $sql = "SELECT m.alici_id as Hedef,m.gonderen_id as Kaynak from mesajlar m where m.gonderen_id=$kullanici_id group by m.gonderen_id,m.alici_id
        UNION (SELECT m.gonderen_id as Hedef,m.alici_id  as Kaynak from mesajlar m where m.alici_id=$kullanici_id group by m.alici_id,m.gonderen_id)".$where;
					
			$result = mysqli_query($mysqli,$sql);
			$rows = [];
			while($row = mysqli_fetch_row($result)) {
				$sql2 = "SELECT id,adisoyadi,avatar,gorevi,eposta from tan_kullanicilar where id=$row[0]";
				$result2 = mysqli_query($mysqli,$sql2);
				while($row2 = mysqli_fetch_assoc($result2)) {
				
					
					$sql3 = "SELECT SUM(case when m.okuma_tarih is null then 1 else 0 end) as Okunmamis from mesajlar m where m.gonderen_id=$row[0] and m.alici_id =$kullanici_id";
					//echo $sql3;
					$result3 = mysqli_query($mysqli,$sql3);
					$row3 = $result3->fetch_assoc();
				
					$rows[] = array('id'=>$row2["id"],'adisoyadi'=>$row2["adisoyadi"],'okunmamis'=>$row3["Okunmamis"],'avatar'=>$row2["avatar"],'gorevi'=>$row2["gorevi"],'eposta'=>$row2["eposta"]);
					//$rows[] = $row3;
					
					//print_r($row2);
					//$rows[$row[0]] = $row;
				}
				//$rows[] = $row;
			}
			$json = json_encode($rows);				
			$mysqli->close();
    }
	echo $json;
} else if ($aksiyon=='liste')
{
    	$_id=mysqli_real_escape_string($mysqli, trim($postdata['_id']));
	$token=mysqli_real_escape_string($mysqli, trim($postdata['token']));

    $expire = date('Y-m-d',strtotime('today')-1);
	$sql = "SELECT kullanici_id,token FROM token where token='$token' and expire>'$expire'";
	$result = mysqli_query($mysqli,$sql);
	if($result->num_rows==1)
	{
        $row = $result->fetch_row();
        $kullanici_id=$row[0];
        $tarih = date("Y-m-d H:i:s");
        $sql2 = "UPDATE mesajlar SET okuma_tarih='$tarih' WHERE alici_id=$kullanici_id and okuma_tarih is null";
        
        $result2 = mysqli_query($mysqli,$sql2);
        $sql = "SELECT m.id as id,gonderen_id,tk.adisoyadi as gonderen,alici_id,tk2.adisoyadi as alici,tarih,okuma_tarih ,mesaj,m.aktif as aktif from mesajlar m 
        INNER JOIN tan_kullanicilar tk on tk.id=m.gonderen_id
        INNER JOIN tan_kullanicilar tk2 on tk2.id=m.alici_id
        where (m.gonderen_id=$kullanici_id and m.alici_id=$_id) or (m.gonderen_id=$_id and m.alici_id=$kullanici_id) order BY m.tarih desc";
					
			$result = mysqli_query($mysqli,$sql);
			$rows = [];
			while($row = mysqli_fetch_assoc($result)) {
				
				$rows[] = $row;
			}
			$json = json_encode($rows);				
			$mysqli->close();
    }
	echo $json;
} else if ($aksiyon=='gonder')
{
	if(isset($postdata) && !empty($postdata))
	{
	    $token=mysqli_real_escape_string($mysqli, trim($postdata['token']));
	    $gonderen_id = mysqli_real_escape_string($mysqli, trim($postdata['gonderen_id']));
	    $alici_id = mysqli_real_escape_string($mysqli, trim($postdata['alici_id']));
	    $tarih = mysqli_real_escape_string($mysqli, trim($postdata['tarih']));
	    $msg = mysqli_real_escape_string($mysqli, trim($postdata['mesaj']));
	    $sql = "INSERT INTO mesajlar (gonderen_id, alici_id, tarih,mesaj) values ($gonderen_id,$alici_id, '$tarih','$msg')";

	    if ($mysqli->query($sql)) {
                $mesaj['status']=true;
		$mesaj['error']='';
		$mesaj['id']=$mysqli->insert_id;
            }
            if ($mysqli->errno) {
                $mesaj['status']=false;
		$mesaj['error']='Mesaj gönderilemedi.';
		$mesaj['id']='';
            }
            $mysqli->close();
       }
       else
       {
       		$mesaj['status']=false;
		$mesaj['error']='Mesaj gönderilemedi.';
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

