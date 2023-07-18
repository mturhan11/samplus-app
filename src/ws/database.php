<?php
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: PUT, GET, POST, DELETE");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header("Content-Type: application/json; charset=UTF-8");
$db_host = 'localhost';
$db_username = 'samplus';
$db_password = 'P@ssw0rd..';
$db_name = 'erp_samplus';
$mysqli = new mysqli($db_host, $db_username, $db_password,$db_name);
$mysqli->set_charset("utf16");
$mysqli->query("SET collation_connection = utf16_turkish_ci");
?>