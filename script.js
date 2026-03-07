// --- Profilo cerchio ---
const profileCircle = document.getElementById('profile-circle');
const profileDropdown = document.getElementById('profile-dropdown');

if(profileCircle){
    profileCircle.addEventListener('click', (e) => {
        e.stopPropagation(); // impedisce chiusura immediata
        profileDropdown.classList.toggle('show');
    });
}

//Chiudi dropdown cliccando fuori
document.addEventListener('click', (e) => {
    if(profileDropdown.classList.contains('show') && !profileDropdown.contains(e.target) && e.target !== profileCircle){
        profileDropdown.classList.remove('show');
    }
});

// --- Logout ---
const logoutBtn = document.getElementById('logout-btn');
if(logoutBtn){
    logoutBtn.addEventListener('click', () => {
        window.location.href = 'logout.php';
    });
}

// --- Avvia partita ---
const startGameBtn = document.getElementById('start-game-btn');
if(startGameBtn){
    startGameBtn.addEventListener('click', () => {
        window.location.href = 'game.html'; // NUOVA PAGINA PER PARTITA
    });
}

// --- Pulsante GIOCA in burraco.html ---
const playBtn = document.getElementById('play-btn');
if(playBtn){
    playBtn.addEventListener('click', function(){
        window.location.href = 'login.php';
    });
}

// --- Salva dati profilo (demo) ---
const saveProfileBtn = document.getElementById('save-profile');
if(saveProfileBtn){
    saveProfileBtn.addEventListener('click', () => {
        alert('Qui in futuro aggiorneremo i dati nel DB tramite updateProfile.php');
    });
}
