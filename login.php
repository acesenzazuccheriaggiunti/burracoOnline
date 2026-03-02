<?php
session_start(); //serve per memorizzare eventuali dati utente

include "db.php"; //connessione al database

//variabile per messaggio di errore
$error = "";

//se il form è stato inviato
if($_SERVER['REQUEST_METHOD'] == 'POST'){
    $nome = $_POST['nome'];
    $password = $_POST['password'];

    //cerco l'utente nel database
    $stmt = $conn->prepare("SELECT * FROM users WHERE nome=?");
    $stmt = $conn->prepare("SELECT * FROM users WHERE nome=?");
    $stmt->bind_param("s", $nome);
    $stmt->execute();
    $result = $stmt->get_result();

    if($result->num_rows == 1){
        $row = $result->fetch_assoc();
        //verifico password
        if(password_verify($password, $row['password'])){
            //login corretto: memorizzo ID o nome in sessione
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['user_nome'] = $row['nome'];
            header("Location: home.php"); //vai alla home
            exit();
        } else {
            $error = "Password errata.";
        }
    } else {
        $error = "Utente non trovato.";
    }
}
?>

<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Burraco Online - Login</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
<h1 style="font-size: 35px; text-align: center; color: black">BURRACO ONLINE</h1>

<div class="form-container">
    <h2 style="text-align:center; margin-bottom:20px;">Login:</h2>

    <!-- Mostra messaggio di errore se presente -->
    <?php
    if($error != ""){
        echo '<p style="color:red; text-align:center; font-weight:bold;">'.$error.'</p>';
    }
    ?>

    <form action="login.php" method="POST">
        <div class="input-group">
            <label for="nome">Nome</label>
            <input type="text" id="nome" name="nome" placeholder="Inserisci il tuo nome" required>
        </div>
        <div class="input-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Inserisci la tua password" required>
        </div>
        <button type="submit" class="submit-button" id="access-btn">Accedi</button>
    </form>
</div>

<p>Se non hai un account <a href="register.php">sign up</a></p>

</body>
</html>