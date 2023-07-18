<?php
include_once("database.php");

$mesaj = array('status'=>true,'error'=>'','kullanici_detay'=>array('eposta'=>'','yetkili'=>false,'satinalma'=>false,'kullanici'=>false));

if ($mysqli->connect_error) {
    $mesaj['status']=false;
    $mesaj['error']="Veritabanı bağlantısı sağlanamadı";
    $mesaj['kullanici_detay']=null;
    die(json_encode($mesaj));
}

$postdata = $_POST;
$getdata = $_GET;
if(isset($getdata) && !empty($getdata))
{
	if(isset($getdata['token']))
	{
		if (isset($postdata) && !empty($postdata))
		{
			$token = mysqli_real_escape_string($mysqli, trim($postdata['token']));
			$expire = date('Y-m-d',strtotime('today')-1);
			$sql = "SELECT kullanici_id,token FROM token where token='$token' and expire>'$expire'";
			
			$result = mysqli_query($mysqli,$sql);
			if($result->num_rows==1)
	    		{
	    			$row = $result->fetch_row();
	    			$sql2 = "SELECT eposta,yetkili,satinalma,kullanici,aktif,adisoyadi,avatar FROM tan_kullanicilar where id=$row[0]";
	    			//echo $sql2;
	    			$result2 = mysqli_query($mysqli,$sql2);
				if($result2->num_rows==1)
		    		{
		    			$row2 = $result2->fetch_row();
		    			if ($row2[4]==true)
					{
			    			$mesaj['status']=true;
						$mesaj['error']='';
						$mesaj['kullanici_detay']=array('eposta'=>$row2[0],'yetkili'=>$row2[1],'satinalma'=>$row2[2],'kullanici'=>$row2[3],'adisoyadi'=>$row2[5],'avatar'=>$row2[6],'token'=>$token);
					}
					else
					{
						$mesaj['status']=false;
						$mesaj['error']='Kullanıcı pasif durumdadır.';
						$mesaj['kullanici_detay']=null;
					}
		    		}
		    		else
				{
					$mesaj['status']=false;
					$mesaj['error']='Kullanıcı bulunamadı.';
					$mesaj['kullanici_detay']=null;
				}
	    				
	    		}
	    		else
	    		{
	    			$mesaj['status']=false;
				$mesaj['error']='Oturum süresi doldu. Çıkış yapılıyor.';
				$mesaj['kullanici_detay']=null;
	    		}
	    	}else
	    	{
	    		$mesaj['status']=false;
			$mesaj['error']='Token bilgisi eksik.';
			$mesaj['kullanici_detay']=null;
	    	}		
	}else
	{
	    	$mesaj['status']=false;
		$mesaj['error']='Hatalı istek.';
		$mesaj['kullanici_detay']=null;
	}
	echo json_encode($mesaj);
	
}
else if(isset($postdata) && !empty($postdata))
{
    $sifre = mysqli_real_escape_string($mysqli, trim($postdata['password']));
    $eposta = mysqli_real_escape_string($mysqli, trim($postdata['eposta']));
    $sql = "SELECT eposta,yetkili,satinalma,kullanici,aktif,sifre,adisoyadi,avatar,id FROM tan_kullanicilar where eposta='$eposta'";
    //echo $sql;
    $result = mysqli_query($mysqli,$sql);
    if($result->num_rows==1)
    {
        $row = $result->fetch_row();
        if ($row[5]==$sifre)
        {
		if ($row[4]==true)
		{
			$token = bin2hex(random_bytes(16));
			$expire = date('Y-m-d H:i:s', strtotime('tomorrow') - 1);
			$sql2 = "INSERT INTO token (token,expire,kullanici_id) values ('$token','$expire',$row[8])";
		    
			if ($mysqli->query($sql2)) {
		       		$mesaj['status']=true;
				$mesaj['error']='';
				$mesaj['kullanici_detay']=array('id'=>$row[8],'eposta'=>$row[0],'yetkili'=>$row[1],'satinalma'=>$row[2],'kullanici'=>$row[3],'adisoyadi'=>$row[6],'avatar'=>$row[7],'token'=>$token);
			}
			if ($mysqli->errno) {
		        	$mesaj['status']=false;
				$mesaj['error']='Kullanıcı giriş yapılamadı.';
				$mesaj['id']='';
			}			
		}
		else
		{
			$mesaj['status']=false;
			$mesaj['error']='Kullanıcı pasif durumdadır.';
			$mesaj['kullanici_detay']=null;
		}
        }
        else
        {
        $mesaj['status']=false;
        $mesaj['error']='Şifre yanlış.';
        $mesaj['kullanici_detay']=null;
        }
        
        echo json_encode($mesaj);
    }
    else
    {
        $mesaj['status']=false;
        $mesaj['error']='e-Posta adresi yanlış.';
        $mesaj['kullanici_detay']=null;
        echo json_encode($mesaj);
    }
}
else
{
    $mesaj['status']=false;
    $mesaj['error']='Yetkisiz erişim.';
    $mesaj['kullanici_detay']=null;
    echo json_encode($mesaj);
}
?>
