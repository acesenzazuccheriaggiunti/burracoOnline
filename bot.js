// ===== TURNO =====
function turnoBot(){
    pescaBot();

    giocaBot();

    scartaBot();
}

function giocaBot(){
    if (!game.hasPickedPozzetto.bot) {
        strategiaPozzetto();
    } else if (!game.hasDoneBurraco.bot) {
        strategiaBurraco();
    } else {
        strategiaChiusura();
    }
}

// ===== PESCA =====
function pescaBot(){
    let numeroCarteScarti = game.discardPile.length;
    let numeroCarteUtili = contaCarteUtiliScarti();

    if (numeroCarteUtili >= numeroCarteScarti/2) {
        pescaCarta("scarti");
    } else {
        pescaCarta("mazzo");
    }
}

function contaCarteUtiliScarti(){
    let carteUtili = 0;
    //analizza gli scarti
    //conta quante carte permetterebbero di fare un tris
    for (let i = 0; i < game.discardPile.length; i++) {
        for (let j = 0; j < game.hand.bot.length - 1; j++) {
            for (let k = j + 1; k < game.hand.bot.length; k++) {

                let tris = [game.discardPile[i], game.hand.bot[j], game.hand.bot[k]];

                if (controllaCombinazione(tris)){
                    carteUtili++;
                    break;
                }
            }
        }
    }
    //o completare una combinazione
    for (let i=0; i<game.discardPile.length; i++){
        for (let j=0; j<game.table.bot.length; j++){
            let tris = game.table.bot[j].slice();
            tris.push(game.discardPile[i]);
            if(controllaCombinazione(tris)){
                carteUtili++;
                break;
            }
        }
    }

    return carteUtili;
}

// ===== STRATEGIE =====
function strategiaPozzetto(){
    giocaPerSvuotareMano();
}

function strategiaBurraco(){
    let aggiunta = true;

    while (!game.hasDoneBurraco.bot && aggiunta) {
        aggiunta = aggiungiCartePossibili();
    }
}

function strategiaChiusura(){
    giocaPerSvuotareMano();
}

function giocaPerSvuotareMano(){
    //prima provo ad aggiungere carte alle combinazioni già presenti
    aggiungiCartePossibili();

    //poi provo a creare nuovi tris
    creaTrisPossibili();
}

// ===== SUPPORTO =====
function aggiungiCartePossibili(){
    for (let i = 0; i < game.hand.bot.length; i++){
        let carta = game.hand.bot[i];

        for (let j = 0; j < game.table.bot.length; j++){
            let combinazione = game.table.bot[j];
            let prova = combinazione.slice();
            prova.push(carta);

            if (controllaCombinazione(prova)){
                aggiungiCombinazione(carta, combinazione);
                break;
            }
        }
    }
}


function creaTrisPossibili(){
    for (let i = 0; i < game.hand.bot.length-2; i++){
        for (let j = i + 1; j < game.hand.bot.length - 1; j++){
            for (let k = j + 1; k < game.hand.bot.length; k++){
                let carta1 = game.hand.bot[i];
                let carta2 = game.hand.bot[j];
                let carta3 = game.hand.bot[k];

                let tris = [carta1, carta2, carta3];

                if (controllaCombinazione(tris)) {
                    creaCombinazione(carta1, carta2, carta3);
                    return;
                }
            }
        }
    }
}

// ===== SCARTO =====
function scartaBot(){
     let cartaDaScartare = scegliScarto();
    scartaCarta(cartaDaScartare);
}

function scegliScarto(){
    let cartaPeggiore = null;
    let valorePeggiore = Infinity;

    for (let i = 0; i < game.hand.bot.length; i++){
        let carta = game.hand.bot[i];
        let valore = valutaCartaDaScartare(carta);

        if (valore < valorePeggiore){
            valorePeggiore = valore;
            cartaPeggiore = carta;
        }
    }

    return cartaPeggiore;
}

function valutaCartaDaScartare(carta){
    let valore = 0;

    //quanto è utile per il bot
    valore += contaPossibilitaBot(carta);

    //quanto è utile al player
    valore += contaPericoloPlayer(carta);

    return valore;
}

function contaPericoloPlayer(carta){
    let pericolo = 0;

    for (let i = 0; i < game.table.player.length; i++){
        let scala = game.table.player[i];

        if (scala.length >= 5 && scala.length <= 7){
            //controllo se la carta può essere aggiunta
            let prova = scala.slice();
            prova.push(carta);

            if (controllaCombinazione(prova)){
                pericolo += 100;
            }
        }
    }

    return pericolo;
}

function contaPossibilitaBot(carta){
    let valore = 0;

    //controllo se può formare un nuovo tris
    for (let i = 0; i < game.hand.bot.length - 1; i++){
        for (let j = i + 1; j < game.hand.bot.length; j++){
            if (game.hand.bot[i] == carta || game.hand.bot[j] == carta){
                continue;
            }

            let tris = [carta, game.hand.bot[i], game.hand.bot[j]];

            if (controllaCombinazione(tris)){
                valore += 20;
            }
        }
    }

    return valore;
}