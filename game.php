<?php
session_start();
include "db.php";

// Se l'utente non è loggato, rimanda al login (stesso pattern di home.php)
if(!isset($_SESSION['user_id'])){
    header("Location: login.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="it">

<head>
    <meta charset="UTF-8">
    <title>Burraco Online</title>
    <link rel="stylesheet" href="gamestyle.css">
</head>

<body>
    <h1 style="font-size: 35px; text-align: center; color: rgb(255, 255, 255)">BURRACO ONLINE</h1>

    <div id="turno-indicator"></div>

    <div class="game-board">

        <div class="zone bot-zone">
            <div class="label">Bot</div>
            <div id="bot-hand" class="hand"></div>
            <div id="bot-table" class="table-combos"></div>
        </div>

        <div class="zone center-zone">
            <div class="pile-group">
                <div class="pile-label">Mazzo</div>
                <div id="stack-pile" class="pile"></div>
            </div>
            <div class="pile-group">
                <div class="pile-label">Scarti</div>
                <div id="discard-pile" class="pile"></div>
            </div>
            <div class="pile-group">
                <div class="pile-label">Pozzetto Bot</div>
                <div id="bot-pozzetto" class="pile"></div>
            </div>
            <div class="pile-group">
                <div class="pile-label">Pozzetto Player</div>
                <div id="player-pozzetto" class="pile"></div>
            </div>
        </div>

        <div class="zone player-zone">
            <div id="player-table" class="table-combos"></div>
            <div id="player-hand" class="hand"></div>
        </div>

    </div>

    <div class="actions-bar">
        <button id="btn-pesca-mazzo">Pesca dal mazzo</button>
        <button id="btn-pesca-scarti">Pesca dagli scarti</button>
        <button id="btn-crea-combinazione">Crea combinazione</button>
        <button id="btn-scarta">Scarta</button>
        <button id="btnRestart">Nuova partita</button>
        <a href="home.php" style="color:white; align-self:center;">Torna alla Home</a>
    </div>

    <div class="score-bar">
        <span id="score-player"></span>
        <span id="score-bot"></span>
    </div>

    <script src="gamestate.js"></script>
    <script src="bot.js"></script>
    <script src="burraco.js"></script>
</body>

</html>
