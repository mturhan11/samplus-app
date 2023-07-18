<?php
$target_dir = "uploads/";
$target_file = $target_dir . basename($_FILES["avatarFile"]["name"]);
$uploadOk = 1;
$imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));
// Check if image file is a actual image or fake image
  $check = getimagesize($_FILES["avatarFile"]["tmp_name"]);
  if($check !== false) {
    echo "File is an image - " . $check["mime"] . ".";
    move_uploaded_file($_FILES['avatarFile']['tmp_name'], $target_file);
    $uploadOk = 1;
  } else {
    echo "File is not an image.";
    $uploadOk = 0;
  }
?>
