<?php
function logKaydet($mysqli_2,$tablo_adi,$token,$id,$yeni_veri,$sorgu='id',$proje_id=0) {

	$sql_select="select * from $tablo_adi where $sorgu=$id";
	$result_select = mysqli_query($mysqli_2,$sql_select);
    	$rows = [];
	while($row = mysqli_fetch_assoc($result_select)) {
	    $rows[] = $row;
	}
	$eski_veri = json_encode($rows);
	$expire = date('Y-m-d',strtotime('today')-1);
	$sql_user = "SELECT kullanici_id,token FROM token where token='$token' and expire>'$expire'";
	$result_user = mysqli_query($mysqli_2,$sql_user);
	if(mysqli_num_rows($result_user)>0)
	{
		$row_user = $result_user->fetch_row();
		$kullanici_id = $row_user[0];
		$yeni_veri = str_replace("'","\"",$yeni_veri);
		$eski_veri = str_replace("'","\"",$eski_veri);
		$tarih = date('Y-m-d H:i:s',strtotime('now'));
		$sql = "INSERT INTO log (tarih,anahtar,deger,proje_id,kullanici_id,tablo_adi,eski_veri,yeni_veri,aktif) values ('$tarih','$sorgu','$id',$proje_id,$kullanici_id,'$tablo_adi','$eski_veri','$yeni_veri',true)";
		//echo $sql;
		$result = mysqli_query($mysqli_2,$sql);
		return true;
	} 
	else return false;

}
?>
