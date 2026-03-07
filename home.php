<?php
session_start();
include "db.php"; // Connessione al database

// Se l'utente non è loggato, rimanda al login
if(!isset($_SESSION['user_id'])){
    header("Location: login.php");
    exit();
}

// Recupero dati utente dal DB
$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare("SELECT nome, email FROM users WHERE id=?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
?>

<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Home - Burraco Online</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
<header>
    <h1 style="text-align:center; font-size:35px;">Benvenuto al Gioco Online</h1>

    <!-- Profilo cerchio in alto a destra -->
    <div class="profile-circle-container" style="position:relative;">
        <div id="profile-circle">
            <?php echo strtoupper($row['nome'][0]); ?>
        </div>
        <div class="profile-dropdown" id="profile-dropdown">
            <form id="profile-form" action="updateProfile.php" method="POST">
                <label for="user-name">Nome:</label>
                <input type="text" id="user-name" name="nome" value="<?php echo htmlspecialchars($row['nome']); ?>">

                <label for="user-email">Email:</label>
                <input type="email" id="user-email" name="email" value="<?php echo htmlspecialchars($row['email']); ?>">

                <label for="user-password">Password:</label>
                <input type="password" id="user-password" name="password" placeholder="Nuova password">

                <label for="user-passwordCheck">Conferma Password:</label>
                <input type="password" id="user-passwordCheck" name="passwordCheck" placeholder="Conferma nuova password">

                <button type="submit" id="save-profile">Salva</button>
                <button type="button" id="logout-btn">Logout</button>
            </form>
        </div>
    </div>
</header>

<main class="home-container">
    <!-- Classifica Top 10 -->
    <div class="ranking-section">
        <h2>Top 10 Giocatori</h2>
        <table id="ranking-table">
            <thead>
                <tr>
                    <th>Posizione</th>
                    <th>Nome</th>
                    <th>Punti</th>
                </tr>
            </thead>
            <tbody>
                <?php
                $sql_rank = "SELECT nome, punteggio FROM users ORDER BY punteggio DESC LIMIT 10";
                $result_rank = $conn->query($sql_rank);
                $pos = 1;
                while($r = $result_rank->fetch_assoc()){
                    echo "<tr><td>$pos</td><td>{$r['nome']}</td><td>{$r['punteggio']}</td></tr>";
                    $pos++;
                }
                ?>
            </tbody>
        </table>
    </div>

    <!-- Avvia Partita -->
    <div class="start-game-section">
        <button class="submit-button" id="start-game-btn">Inizia Partita</button>
    </div>
</main>

<script src="script.js"></script>
