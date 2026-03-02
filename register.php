<?php
session_start();
include "db.php"; //connessione al database

//variabile per messaggio di errore
$error = "";

//se il form è stato inviato
if($_SERVER['REQUEST_METHOD'] == 'POST'){
    $nome = $_POST['nome'];
    $email = $_POST['mail'];
    $password = $_POST['password'];
    $passwordCheck = $_POST['passwordCheck'];

    //controllo se password e conferma corrispondono
    if($password !== $passwordCheck){
        $error = "Le password non corrispondono.";
    } else {
        //controllo se l'email è già registrata
        $stmt_check = $conn->prepare("SELECT * FROM users WHERE email=?");
        $stmt_check->bind_param("s", $email);
        $stmt_check->execute();
        $result = $stmt_check->get_result();

        if($result->num_rows > 0){
            $error = "Email già registrata.";
        } else {
            //cripto la password
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);

            //inserisco l'utente
            $stmt_insert = $conn->prepare("INSERT INTO users (nome, email, password, punteggio) VALUES (?, ?, ?, 0)");
            $stmt_insert->bind_param("sss", $nome, $email, $hashed_password);
            if($stmt_insert->execute()){
                //registrazione avvenuta: puoi andare al login
                header("Location: login.php");
                exit();
            } else {
                $error = "Errore durante la registrazione: " . $conn->error;
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Burraco Online - Registrazione</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
<h1 style="font-size: 35px; text-align: center; color: black">BURRACO ONLINE</h1>

<div class="form-container">
    <h2 style="text-align:center; margin-bottom:20px;">Sign up:</h2>

    <!-- Mostra messaggio di errore se presente -->
    <?php
    if($error != ""){
        echo '<p class="error-message">'.$error.'</p>';
    }
    ?>

    <form action="register.php" method="POST">
        <div class="input-group">
            <label for="mail">Mail</label>
            <input type="text" id="mail" name="mail" placeholder="Inserisci la tua mail" required>
        </div>
        <div class="input-group">
            <label for="nome">Nome</label>
            <input type="text" id="nome" name="nome" placeholder="Inserisci il tuo nome" required>
        </div>
        <div class="input-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Inserisci la tua password" required>
        </div>
        <div class="input-group">
            <label for="passwordCheck">Conferma password</label>
            <input type="password" id="passwordCheck" name="passwordCheck" placeholder="Inserisci di nuovo la tua password" required>
        </div>
        <button type="submit" class="submit-button" id="access-btn">Registrati</button>
    </form>
</div>

<p>Hai già un account? <a href="login.php">Accedi</a></p>

</body>
</html>