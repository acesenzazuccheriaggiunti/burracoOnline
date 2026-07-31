// ===== STATO SELEZIONE =====
let selectedIds = []; // id delle carte in mano al player attualmente selezionate

// ===== HELPER CARTE =====
function isRed(seme) {
    return seme == "cuori" || seme == "quadri";
}

function suitSymbol(seme) {
    switch (seme) {
        case "cuori": return "♥";
        case "quadri": return "♦";
        case "fiori": return "♣";
        case "picche": return "♠";
        default: return "★";
    }
}

function cardLabel(card) {
    if (card.seme == "jolly") return "JOLLY";
    if (card.valore == 1) return "A";
    if (card.valore == 11) return "J";
    if (card.valore == 12) return "Q";
    if (card.valore == 13) return "K";
    return String(card.valore);
}

// ===== CREAZIONE ELEMENTO CARTA =====
function createCardElement(card, options) {
    options = options || {};
    const el = document.createElement("div");
    el.classList.add("card");
    el.dataset.id = card.id;

    if (options.faceDown) {
        el.classList.add("face-down");
    } else {
        el.classList.add(card.isJolly ? "jolly" : (isRed(card.seme) ? "red" : "black"));

        if (card.isJolly) {
            el.textContent = "JOLLY";
        } else {
            const top = document.createElement("div");
            top.className = "corner top";
            top.textContent = cardLabel(card) + suitSymbol(card.seme);

            const center = document.createElement("div");
            center.className = "suit-center";
            center.textContent = suitSymbol(card.seme);

            const bottom = document.createElement("div");
            bottom.className = "corner bottom";
            bottom.textContent = cardLabel(card) + suitSymbol(card.seme);

            el.appendChild(top);
            el.appendChild(center);
            el.appendChild(bottom);
        }
    }

    //ventaglio: rotazione e sollevamento in base alla posizione nella mano
    if (options.fanIndex !== undefined && options.fanTotal !== undefined) {
        const mid = (options.fanTotal - 1) / 2;
        const offset = options.fanIndex - mid;
        const angle = offset * 5; // gradi per carta di distanza dal centro
        const lift = Math.abs(offset) * 3; // le carte ai bordi scendono leggermente

        el.style.setProperty("--rot", angle + "deg");
        el.style.setProperty("--ty", lift + "px");
    }

    if (options.clickable) {
        if (selectedIds.includes(card.id)) {
            el.classList.add("selected");
        }
        el.addEventListener("click", () => onCardClick(card));
    }

    return el;
}

// ===== EVENTI =====
function onCardClick(card) {
    if (game.turno !== "player") return;

    const idx = selectedIds.indexOf(card.id);
    if (idx === -1) {
        selectedIds.push(card.id);
    } else {
        selectedIds.splice(idx, 1);
    }
    render();
}

function onComboClick(who, combo) {
    if (game.turno !== "player" || who !== "player") return;
    if (selectedIds.length !== 1) return;

    const carta = game.hand.player.find(c => c.id === selectedIds[0]);
    if (!carta) return;

    aggiungiCombinazione(carta, combo);
    selectedIds = [];
    render();
}

function onPescaMazzo() {
    if (game.turno !== "player") return;
    pescaCarta("mazzo");
    selectedIds = [];
    gameLoop();
}

function onPescaScarti() {
    if (game.turno !== "player") return;
    pescaCarta("scarti");
    selectedIds = [];
    gameLoop();
}

function onCreaCombinazione() {
    if (game.turno !== "player" || selectedIds.length !== 3) return;
    const carte = selectedIds.map(id => game.hand.player.find(c => c.id === id));
    creaCombinazione(carte[0], carte[1], carte[2]);
    selectedIds = [];
    render();
}

function onScarta() {
    if (game.turno !== "player" || selectedIds.length !== 1) return;
    const carta = game.hand.player.find(c => c.id === selectedIds[0]);
    scartaCarta(carta);
    selectedIds = [];
    gameLoop();
}

// ===== ANIMAZIONE FLIP (posizione prima/dopo il render) =====
// usa --flip-x/--flip-y invece di transform diretto, per non entrare
// in conflitto con la rotazione a ventaglio (--rot/--ty)
function catturaPosizioni() {
    const rects = {};
    document.querySelectorAll(".card[data-id]").forEach(el => {
        rects[el.dataset.id] = el.getBoundingClientRect();
    });
    return rects;
}

function applicaFlip(vecchiePosizioni) {
    document.querySelectorAll(".card[data-id]").forEach(el => {
        const old = vecchiePosizioni[el.dataset.id];
        if (!old) return; // carta nuova, appare senza slide

        const nuova = el.getBoundingClientRect();
        const dx = old.left - nuova.left;
        const dy = old.top - nuova.top;

        if (dx === 0 && dy === 0) return;

        el.style.transition = "none";
        el.style.setProperty("--flip-x", dx + "px");
        el.style.setProperty("--flip-y", dy + "px");

        el.getBoundingClientRect(); // forzo il reflow

        requestAnimationFrame(() => {
            el.style.transition = "transform 0.35s ease";
            el.style.setProperty("--flip-x", "0px");
            el.style.setProperty("--flip-y", "0px");
        });
    });
}

// ===== UI: STATO PULSANTI =====
function aggiornaPulsanti() {
    const isPlayerTurn = game.turno === "player";

    document.getElementById("btn-pesca-mazzo").disabled = !isPlayerTurn;
    document.getElementById("btn-pesca-scarti").disabled = !isPlayerTurn || game.discardPile.length === 0;
    document.getElementById("btn-crea-combinazione").disabled = !isPlayerTurn || selectedIds.length !== 3;
    document.getElementById("btn-scarta").disabled = !isPlayerTurn || selectedIds.length !== 1;

    document.getElementById("turno-indicator").textContent =
        isPlayerTurn ? "Turno: Player" : "Turno: Bot";

    document.getElementById("score-player").textContent = "Player: " + (game.punteggio.player || 0);
    document.getElementById("score-bot").textContent = "Bot: " + (game.punteggio.bot || 0);
}

// ===== RENDER =====
function renderPila(containerId, cardsArray, faceDown) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    cardsArray.forEach(card => {
        container.appendChild(createCardElement(card, { faceDown: faceDown, clickable: false }));
    });
}

function renderMano(containerId, cardsArray, faceDown, clickable) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    const totale = cardsArray.length;
    cardsArray.forEach((card, i) => {
        container.appendChild(createCardElement(card, {
            faceDown: faceDown,
            clickable: clickable,
            fanIndex: i,
            fanTotal: totale
        }));
    });
}

function renderCombinazioni(containerId, combos, who) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    combos.forEach(combo => {
        const comboEl = document.createElement("div");
        comboEl.className = "combo";
        combo.forEach(card => {
            comboEl.appendChild(createCardElement(card, { faceDown: false, clickable: false }));
        });
        comboEl.addEventListener("click", () => onComboClick(who, combo));
        container.appendChild(comboEl);
    });
}

function render() {
    const vecchiePosizioni = catturaPosizioni();

    //mazzo: mostro il dorso di una carta rappresentativa (se il mazzo non è vuoto)
    renderPila("stack-pile", game.stack.length > 0 ? game.stack.slice(-1) : [], true);

    //scarti: mostro tutta la pila scoperta
    renderPila("discard-pile", game.discardPile, false);

    //pozzetti: mostro coperti finché non presi
    renderPila("bot-pozzetto", game.hasPickedPozzetto.bot ? [] : game.pozzetto.bot.slice(-1), true);
    renderPila("player-pozzetto", game.hasPickedPozzetto.player ? [] : game.pozzetto.player.slice(-1), true);

    //mani: player scoperta e cliccabile a ventaglio, bot coperta e compatta
    renderMano("player-hand", game.hand.player, false, true);
    renderMano("bot-hand", game.hand.bot, true, false);

    //combinazioni sul tavolo, ciascuno nella propria metà
    renderCombinazioni("player-table", game.table.player, "player");
    renderCombinazioni("bot-table", game.table.bot, "bot");

    aggiornaPulsanti();

    applicaFlip(vecchiePosizioni);
}

// ===== LOOP =====
function gameLoop() {
    render();

    if (game.turno === "bot") {
        setTimeout(() => {
            turnoBot();
            gameLoop();
        }, 900);
    }
}

// ===== AVVIO =====
document.getElementById("btn-pesca-mazzo").addEventListener("click", onPescaMazzo);
document.getElementById("btn-pesca-scarti").addEventListener("click", onPescaScarti);
document.getElementById("btn-crea-combinazione").addEventListener("click", onCreaCombinazione);
document.getElementById("btn-scarta").addEventListener("click", onScarta);

inizializzaPartita();
gameLoop();
