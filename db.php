<?php
$host = "localhost"; //il server del database
$user = "root"; //utente MySQL
$pass = ""; //password MySQL
$db = "burracoOnline"; //nome del database

$conn = new mysqli($host, $user, $pass, $db);

//controlla se la connessione ha avuto successo
if ($conn->connect_error) {
    die("Errore di connessione: " . $conn->connect_error);
}
?>