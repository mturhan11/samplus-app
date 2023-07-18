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


$sql = "SELECT * FROM gorevlendirme g 
		WHERE g.durum NOT IN (0,2,3)";
$result = mysqli_query($mysqli,$sql);
if($result->num_rows>0)
{
	while($row = mysqli_fetch_row($result)) {
		$_bitis_tarih = null;
		$_tamam_tarih = null;
		if (($row[6]!=null || trim($row[6])!=""))
		{
		
			$_bitis_tarih = strtotime($row[6]);  
			if (($row[7]!=null || trim($row[7])!=""))
			{
				$_tamam_tarih= strtotime($row[7]); 
			}
			else
			{
				$_tamam_tarih=strtotime("now");
			}
			if ($_bitis_tarih<=$_tamam_tarih)
			{
				$params2 = rtrim("durum=2");
		    		$sql2 = "UPDATE gorevlendirme set $params2 WHERE id=$row[0]";
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
	    
	    $sql = "DELETE FROM projeler WHERE id=$id";
	    $mysqli->query($sql);
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
	    
	    $ust_proje = mysqli_real_escape_string($mysqli, trim($postdata['ust_proje']));
	    $proje_adi = mysqli_real_escape_string($mysqli, trim($postdata['proje_adi']));
	    $urun_grubu = mysqli_real_escape_string($mysqli, trim($postdata['urun_grubu'])); 
	    $musteri_id = mysqli_real_escape_string($mysqli, trim($postdata['musteri_id']));
	    $baslangic_tarih = mysqli_real_escape_string($mysqli, trim($postdata['baslangic_tarih']));
	    $teslim_tarih = mysqli_real_escape_string($mysqli, trim($postdata['teslim_tarih']));
	    $aciklama = mysqli_real_escape_string($mysqli, trim($postdata['aciklama']));
	    $sorumlu_personeller = mysqli_real_escape_string($mysqli, trim($postdata['sorumlu_personeller']));
	    //if ($ust_proje=="0") $ust_proje="null";
	    $sql = "INSERT INTO projeler (durum,aktif,ust_proje, proje_adi,urun_grubu,musteri_id,baslangic_tarih,teslim_tarih,aciklama,sorumlu_personeller) values (0,1,$ust_proje,'$proje_adi',$urun_grubu, $musteri_id,'$baslangic_tarih','$teslim_tarih','$aciklama','$sorumlu_personeller')";
	    //echo $sql;
	    
	    if ($mysqli->query($sql)) {
               	$mesaj['status']=true;
				$mesaj['error']='';
				$mesaj['id']=$mysqli->insert_id;
            }
            if ($mysqli->errno) {
                $mesaj['status']=false;
				$mesaj['error']='Proje eklenemedi.';
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
	$ProjeID=mysqli_real_escape_string($mysqli, trim($postdata['ProjeID']));
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
				$where="WHERE 1=1 AND p.ust_proje is null AND p.durum IN ($tur)";
			}else if($kullanici==true)
			{
				$where="WHERE 1=1 AND p.ust_proje is null AND  p.durum IN ($tur)";
			}
			else
			{
				$where="WHERE 1<>1 AND p.durum IN ($tur)";
			}
			if ($ProjeID!="") {
				$where="WHERE 1=1 AND p.ust_proje=".$ProjeID;
				//echo $where;
			}
			//echo $where;
			$sql = "select p.*,count(pp.ust_proje) as alt_proje from projeler p LEFT JOIN projeler pp ON pp.ust_proje = p.id ".$where." GROUP BY p.id ORDER BY baslangic_tarih DESC";		
			//echo $sql;
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
else if ($aksiyon=='list_kullanici')
{
	$json = json_encode("");
	$token=mysqli_real_escape_string($mysqli, trim($postdata['token']));
	$tur = mysqli_real_escape_string($mysqli, trim($postdata['tur']));
	
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
				$where="WHERE 1=1 AND g.durum IN ($tur)";
			}else
			{
				$where="WHERE 1=1 AND g.durum IN ($tur) and g.kullanici_id=$kullanici_id";
			}
			$sql = "select g.id,g.proje_id,g.kullanici_id,g.sorumlu_id,g.takipci_id,g.tarih,g.bitis_tarih,g.basla_tarih, g.tamam_tarih, g.aciklama , g.durum ,g.aktif ,tk.adisoyadi from gorevlendirme g INNER JOIN tan_kullanicilar tk ON tk.id=g.kullanici_id ".$where." ORDER BY tarih DESC";
				//echo $sql;	
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
	    $durum = mysqli_real_escape_string($mysqli, trim($postdata['durum']));
	    $tarih = mysqli_real_escape_string($mysqli, trim($postdata['tarih']));
	    $bitis_tarih = mysqli_real_escape_string($mysqli, trim($postdata['bitis_tarih']));
		$basla_tarih = mysqli_real_escape_string($mysqli, trim($postdata['basla_tarih']));
		$tamam_tarih = mysqli_real_escape_string($mysqli, trim($postdata['tamam_tarih']));
	    $aciklama = mysqli_real_escape_string($mysqli, trim($postdata['aciklama']));
	    
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
		    if (($row2[3]==true || $row2[0]==true || $row2[1]==true))
			{
				
	    			if ($durum!='') $durum="durum=$durum,";
	    			if ($tarih!='') $tarih="tarih='$tarih',";
	    			if ($bitis_tarih!='') $bitis_tarih="bitis_tarih='$bitis_tarih',";
					if ($basla_tarih!='') $basla_tarih="basla_tarih='$basla_tarih',";
					if ($tamam_tarih!='') $tamam_tarih="tamam_tarih='$tamam_tarih',";
	    			if ($aciklama!='') $aciklama="aciklama='$aciklama',";
	    			
	    			$params = rtrim($durum.$tarih.$bitis_tarih.$aciklama.$basla_tarih.$tamam_tarih, ",");
	    			$sql3 = "UPDATE gorevlendirme set $params WHERE id=$id";
	    			//echo $sql3;
	    			if ($mysqli->query($sql3)) {
				       	$mesaj['status']=true;
					$mesaj['error']='';
					$mesaj['id']=$id;
				}
				if (($mysqli->errno) || ($mysqli->affected_rows<1)) {
					$mesaj['status']=false;
					$mesaj['error']='Görevlendirme güncellenemedi.';
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
else
{
	$mesaj['status']=false;
	$mesaj['error']='Yetkisiz erişim.';
	$mesaj['id']='';
	echo json_encode($mesaj);
}
?>