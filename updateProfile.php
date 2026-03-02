<?php
session_start();
include "db.php";

//se l'utente non è loggato, rimanda al login
if(!isset($_SESSION['user_id'])){
    header("Location: login.php");
    exit();
}

//variabile per messaggio
$error = "";
$success = "";

//se il form è stato inviato
if(!empty($password) || !empty($passwordCheck)){
    if($password !== $passwordCheck){
        $error = "Le password non corrispondono.";
    } else {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE users SET nome=?, email=?, password=? WHERE id=?");
        $stmt->bind_param("sssi", $nome, $email, $hashed_password, $user_id);
    }
} else {
    $stmt = $conn->prepare("UPDATE users SET nome=?, email=? WHERE id=?");
    $stmt->bind_param("ssi", $nome, $email, $user_id);
}

if($error == ""){
    if($stmt->execute()){
        $success = "Profilo aggiornato correttamente.";
        $_SESSION['user_nome'] = $nome;
    } else {
        $error = "Errore durante l'aggiornamento: " . $conn->error;
    }
}

//recupero dati utente per precompilare il form
$user_id = $_SESSION['user_id'];
$stmt_sel = $conn->prepare("SELECT nome, email FROM users WHERE id=?");
$stmt_sel->bind_param("i", $user_id);
$stmt_sel->execute();
$result = $stmt_sel->get_result();
$row = $result->fetch_assoc();
?>

<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Profilo - Burraco Online</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
<h1 style="text-align:center;">Profilo Utente</h1>

<div class="form-container">

    <!-- Messaggi -->
    <?php
    if($error != ""){
        echo '<p class="error-message">'.$error.'</p>';
    }
    if($success != ""){
        echo '<p class="success-message">'.$success.'</p>';
    }
    ?>

    <form action="updateProfile.php" method="POST">
        <div class="input-group">
            <label for="nome">Nome</label>
            <input type="text" id="nome" name="nome" value="<?php echo htmlspecialchars($row['nome']); ?>" required>
        </div>
        <div class="input-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($row['email']); ?>" required>
        </div>
        <div class="input-group">
            <label for="password">Nuova Password</label>
            <input type="password" id="password" name="password" placeholder="Lascia vuoto per non cambiare">
        </div>
        <div class="input-group">
            <label for="passwordCheck">Conferma Password</label>
            <input type="password" id="passwordCheck" name="passwordCheck" placeholder="Lascia vuoto per non cambiare">
        </div>
        <button type="submit" class="submit-button">Aggiorna Profilo</button>
    </form>

</div>

<a href="home.php" style="display:block; text-align:center; margin-top:20px;">Torna alla Home</a>

</body>
</html>