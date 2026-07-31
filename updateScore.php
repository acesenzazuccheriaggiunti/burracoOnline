<?php
session_start();
include "db.php";

header("Content-Type: application/json");

// solo utenti loggati possono aggiornare il proprio punteggio
if(!isset($_SESSION['user_id'])){
    http_response_code(401);
    echo json_encode(["error" => "Non autenticato"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$puntiPartita = isset($data['punteggio']) ? intval($data['punteggio']) : 0;

if($puntiPartita <= 0){
    echo json_encode(["ok" => false, "reason" => "Punteggio non valido"]);
    exit();
}

$user_id = $_SESSION['user_id'];

// sommo i punti della partita al punteggio totale già salvato
$stmt = $conn->prepare("UPDATE users SET punteggio = punteggio + ? WHERE id = ?");
$stmt->bind_param("ii", $puntiPartita, $user_id);

if($stmt->execute()){
    echo json_encode(["ok" => true]);
} else {
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => $conn->error]);
}
