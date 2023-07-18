<?php
include_once("database.php");
$rootPath = $_SERVER['DOCUMENT_ROOT'];
$mesaj = array('status'=>true,'error'=>'','id'=>null);
$FileItems=array();

if ($mysqli->connect_error) {
    $mesaj['status']=false;
    $mesaj['error']="Veritabanı bağlantısı sağlanamadı";
    die(json_encode($mesaj));
}

$postdata = $_POST;
$getdata= $_GET;
$aksiyon = 'list';

if(isset($getdata) && !empty($getdata))
{
	$aksiyon = mysqli_real_escape_string($mysqli, trim($getdata['aksiyon']));
}

if($aksiyon=='ekle')
{
	if(isset($postdata) && !empty($postdata))
	{
	    $token = mysqli_real_escape_string($mysqli, trim($postdata['token']));
	    $proje_id = mysqli_real_escape_string($mysqli, trim($postdata['proje_id']));
	    $path = mysqli_real_escape_string($mysqli, trim($postdata['destinationDirectory']));
	    if ($path != '') $target_dir = $rootPath.'/uploads/projeler/'.$proje_id.'/'.$path.'/'; else $target_dir = $rootPath.'/uploads/projeler/'.$proje_id.'/';
		$target_file = $target_dir . basename($_FILES["chunkBlob"]["name"]);
		$uploadOk = 1;
		move_uploaded_file($_FILES['chunkBlob']['tmp_name'], $target_file);	
		//echo $target_file;    
            echo true;
	}
	else
	{
	    echo false;
	}  
}else if($aksiyon=='indir')
{
	if(isset($postdata) && !empty($postdata))
	{
	    $token = mysqli_real_escape_string($mysqli, trim($postdata['token']));
	    $proje_id = mysqli_real_escape_string($mysqli, trim($postdata['proje_id']));
	    $path=mysqli_real_escape_string($mysqli, trim($postdata['path']));
	    $name=mysqli_real_escape_string($mysqli, trim($postdata['name']));
	    if ($path != '') $structure = '/uploads/projeler/'.$proje_id.'/'.$path.'/'.$name; else $structure = '/uploads/projeler/'.$proje_id.'/'.$name;
            $mesaj2 = array('status'=>true,'url'=>$structure);
            echo json_encode($mesaj2);
	}
	else
	{
	    echo false;
	}  
}else if($aksiyon=='ekle_klasor')
{
	if(isset($postdata) && !empty($postdata))
	{
	    $token = mysqli_real_escape_string($mysqli, trim($postdata['token']));
	    $proje_id = mysqli_real_escape_string($mysqli, trim($postdata['proje_id']));
	    $path=mysqli_real_escape_string($mysqli, trim($postdata['path']));
	    $name=mysqli_real_escape_string($mysqli, trim($postdata['name']));
	    if ($path != '') $structure = $rootPath.'/uploads/projeler/'.$proje_id.'/'.$path.'/'.$name; else $structure = $rootPath.'/uploads/projeler/'.$proje_id.'/'.$name;
            echo mkdir($structure, 0777,true);
	}
	else
	{
	    echo false;
	}  
}else if($aksiyon=='sil')
{
	if(isset($postdata) && !empty($postdata))
	{
	    $token = mysqli_real_escape_string($mysqli, trim($postdata['token']));
	    $proje_id = mysqli_real_escape_string($mysqli, trim($postdata['proje_id']));
	    $path=mysqli_real_escape_string($mysqli, trim($postdata['path']));
	    $name=mysqli_real_escape_string($mysqli, trim($postdata['name']));
	    $isDirectory=mysqli_real_escape_string($mysqli, trim($postdata['isDirectory']));
	    
	    if ($path != '') $structure = $rootPath.'/uploads/projeler/'.$proje_id.'/'.$path; else $structure = $rootPath.'/uploads/projeler/'.$proje_id;
	    error_reporting(E_ALL);
		ini_set('display_errors', '1');
	    if ($isDirectory=="false")
	    {
	    	unlink($structure.'/'.$name);
	    }
	    else
	    {
	    	delTree($structure.'/'.$name);
	    	//rmdir($structure.'/'.$name);
	    }
	    
	    //print_r($postdata);
	    
            echo true;
	}
	else
	{
	    echo false;
	}  
}else if ($aksiyon=='list')
{
	$json = json_encode("");
	$token=mysqli_real_escape_string($mysqli, trim($postdata['token']));
	$path=mysqli_real_escape_string($mysqli, trim($postdata['path']));
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
			$structure = $rootPath.'/uploads/projeler/'.$proje_id;
			if (!file_exists($structure)) {
    				mkdir($structure, 0777,true);
			}	
			$json = json_encode(convertDirectoryToArray( new DirectoryIterator( '../uploads/projeler/'.$proje_id.'/'.$path ) ));
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


function convertDirectoryToArray( DirectoryIterator $dir )
{
  $data = array();
  foreach ( $dir as $node )
  {
    if ( $node->isDir() && !$node->isDot() )
    {
      $test = array();
      $test['name'] = $node->getFilename();
      $test['isDirectory']=true;
      $test['items'] = convertDirectoryToArray( new DirectoryIterator( $node->getPathname() ) );
      $data[] = $test;
    }
    else if ( $node->isFile() )
    {
      $test= array();
      $test['name'] = $node->getFilename();
      $test['isDirectory']=false;
      $test['size']=$node->getSize();
      $data[] = $test;
    }
  }
  return $data;
}

function delTree($dir) { 
    $files = glob( $dir . '*', GLOB_MARK ); 
    foreach( $files as $file ){ 
        if( substr( $file, -1 ) == '/' ) 
            delTree( $file ); 
        else 
            unlink( $file ); 
    } 

    if (is_dir($dir)) rmdir( $dir ); 

} 


?>
