//oggetto principale: il tavolo
let game = {
    stack: [], //mazzo
    discardPile: [], //scarti

    hand: {
        player: [], //carte del giocatore
        bot: [] //carte del bot
    },

    pozzetto: {
        player: [], //pozzetto giocatore
        bot: [] //pozzetto bot
    },

    hasPickedPozzetto: {
        player: false,
        bot: false
    },

    hasDoneBurraco: {
        player: false,
        bot: false
    },

    table: { //combinazioni carte(array di array)
        player: [],
        bot: []
    },

    punteggio: {
        player: 0,
        bot: 0,
    },

    turno: "player", //capire chi sta giocando
};

//-------------------------------------------------------------------------------------

//funzione per preparare il tavolo di gioco
function inizializzaPartita(){
    game = {
        stack: [],
        discardPile: [],

        hand: {
            player: [],
            bot: []
        },

        pozzetto: {
            player: [],
            bot: []
        },

        hasPickedPozzetto: {
            player: false,
            bot: false
        },

        hasDoneBurraco: {
            player: false,
            bot: false
        },

        table: {
            player: [],
            bot: []
        },

        punteggio: {
            player: 0,
            bot: 0,
        },

        turno: "player",
    }

    let idCounter = 0;

    //creo il mazzo con le carte
    const semi = ["cuori", "quadri", "fiori", "picche"];

    for(let j = 1; j < 3; j++){ //doppio mazzo
        for(let i = 0; i < semi.length; i++){
            for(let valore = 1; valore < 14; valore++){
                let seme = semi[i];

                let card = {
                    id: idCounter++,
                    seme: seme,
                    valore: valore,
                    isJolly: (valore == 2)
                };

                game.stack.push(card);
            }
        } 
    }

    for(let i = 0; i < 5; i++){
        let card = {
                id: idCounter++,
                seme: "jolly",
                valore: null,
                isJolly: true
        };
        
        game.stack.push(card);
    }

    //mescolo il mazzo
    for(let i = game.stack.length-1; i > 0; i--){
        let j = Math.floor(Math.random() * (i + 1));
        [game.stack[i], game.stack[j]] = [game.stack[j], game.stack[i]];
    }

    //do i pozzetti
    for(let i = 0; i < 12; i++){
        game.pozzetto.player.push(game.stack.pop());
        game.pozzetto.bot.push(game.stack.pop());
    }

    //do le carte
    for(let i = 0; i < 12; i++){
        game.hand.player.push(game.stack.pop());
        game.hand.bot.push(game.stack.pop());
    }

    //giro la prima carta degli scarti
    game.discardPile.push(game.stack.pop());
}

//-------------------------------------------------------------------------------------

//funzione per pescare
function pescaCarta(from){
    let who = game.turno;
    if(from == "mazzo"){
        game.hand[who].push(game.stack.pop());
    }else{
        while(game.discardPile.length > 0){
            game.hand[who].push(game.discardPile.pop());
        }
    }
}

//-------------------------------------------------------------------------------------

//funzione per scartare
function scartaCarta(which){
    let who = game.turno;
    if(game.hand[who].length == 1){
        if(!game.hasPickedPozzetto[who]){
            for(let i = 0; i < game.hand[who].length; i++){
                if (game.hand[who][i] == which) {
                    game.hand[who].splice(i, 1);
                    break;
                }
            }

            game.discardPile.push(which);

            game.hand[who] = game.pozzetto[who];
            game.hasPickedPozzetto[who] = true;
        }else if(game.hasDoneBurraco[who] && !which.isJolly){ //caso vittoria
            for(let i = 0; i < game.hand[who].length; i++){
                if (game.hand[who][i] == which) {
                    game.hand[who].splice(i, 1);
                    break;
                }
            }

            game.discardPile.push(which);
            game.punteggio[who] += 100;

            if(who === "player"){
                fetch("updateScore.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ punteggio: game.punteggio.player })
                });
            }

            inizializzaPartita();
            return;
        }else{
            return;
        }
    }else{
        for(let i = 0; i < game.hand[who].length; i++){
            if (game.hand[who][i] == which) {
                game.hand[who].splice(i, 1);
                break;
            }
        }

        game.discardPile.push(which);
    }

    if(game.turno == "player"){
        game.turno = "bot";
    }else{
        game.turno = "player";
    }
}

//-------------------------------------------------------------------------------------

//funzione per fare i tris
function creaCombinazione(carta1, carta2, carta3){
    let who = game.turno;
    let tris = [carta1, carta2, carta3];

    let analisi = analizzaCombinazione(tris);

    if(analisi.valida){
        //rimuovo le carte dalla mano (bug: prima non venivano mai rimosse)
        for(let i = 0; i < tris.length; i++){
            let idx = game.hand[who].indexOf(tris[i]);
            if(idx !== -1){
                game.hand[who].splice(idx, 1);
            }
        }

        game.table[who].push(analisi.carte); //ordinata
        game.punteggio[who] += calcolaPunteggio(analisi.carte);
    }
}

//-------------------------------------------------------------------------------------

//funzione per aggiungere carte ai tris (se è di 7 carte diventa burraco (specificare il tipo))
function aggiungiCombinazione(carta, tris){
    let who = game.turno;
    let copy;
    for(let i = 0; i < game.table[who].length; i++){
        if (game.table[who][i] == tris) {
            copy = game.table[who].splice(i, 1)[0];
            break;
        }
    }

    game.punteggio[who] -= calcolaPunteggio(copy);

    let prova = copy.concat([carta]);
    let analisi = analizzaCombinazione(prova);

    if(analisi.valida){
        game.table[who].push(analisi.carte); //ordinata

        let idx = game.hand[who].indexOf(carta);
        if(idx !== -1){
            game.hand[who].splice(idx, 1);
        }

        game.punteggio[who] += calcolaPunteggio(analisi.carte);
    }else{
        game.table[who].push(copy);
        game.punteggio[who] += calcolaPunteggio(copy);
    }
}

//-------------------------------------------------------------------------------------

//funzione per controllare la validità del tris
function controllaCombinazione(tris){
    return analizzaCombinazione(tris).valida;
}

//analizza la combinazione: verifica se è valida come gruppo o scala,
//gestendo i "2" che possono fare sia da jolly che da carta naturale,
//e restituisce anche le carte ORDINATE correttamente
function analizzaCombinazione(tris){
    if(tris.length < 3){
        return { valida: false };
    }

    let jollyVeri = tris.filter(c => c.seme === "jolly");
    if(jollyVeri.length > 1){
        return { valida: false };
    }

    let due = tris.filter(c => c.valore === 2 && c.seme !== "jolly");
    let altre = tris.filter(c => c.valore !== 2 && c.seme !== "jolly");

    let n = due.length;

    for(let mask = 0; mask < (1 << n); mask++){
        let dueNaturali = [];
        let dueJolly = [];
        let jollyUsati = jollyVeri.length;

        for(let i = 0; i < n; i++){
            if(mask & (1 << i)){
                dueNaturali.push(due[i]);
            } else {
                dueJolly.push(due[i]);
                jollyUsati++;
            }
        }

        if(jollyUsati > 1){
            continue;
        }

        let carteNormali = altre.concat(dueNaturali);
        let carteJolly = jollyVeri.concat(dueJolly);

        if(carteNormali.length === 0){
            continue;
        }

        if(controllaGruppo(carteNormali, jollyUsati)){
            let ordinate = carteNormali.slice().sort((a, b) => a.seme.localeCompare(b.seme));
            return { valida: true, tipo: "gruppo", carte: ordinate.concat(carteJolly) };
        }

        let risultatoScala = provaScala(carteNormali, jollyUsati, carteJolly);
        if(risultatoScala){
            return { valida: true, tipo: "scala", carte: risultatoScala };
        }
    }

    return { valida: false };
}

//gruppo: stesso valore. Essendo un mazzo doppio, al massimo 2 carte identiche
//(stesso seme) possono coesistere nello stesso gruppo (es. 3 fiori + 3 fiori + jolly)
function controllaGruppo(carteNormali, jollyCount){
    let valore = carteNormali[0].valore;
    let conteggioSemi = {};

    for(let i = 0; i < carteNormali.length; i++){
        if(carteNormali[i].valore !== valore){
            return false;
        }
        let seme = carteNormali[i].seme;
        conteggioSemi[seme] = (conteggioSemi[seme] || 0) + 1;
        if(conteggioSemi[seme] > 2){ //il doppio mazzo ne contiene al massimo 2 per seme
            return false;
        }
    }

    //massimo teorico: 4 semi x 2 copie + 1 jolly
    return (carteNormali.length + jollyCount) <= 9;
}

//scala: stesso seme, valori consecutivi. L'Asso può fare da carta bassa (1,
//adiacente al 2-3) o da carta alta (14, adiacente al Re) a seconda del
//contesto della scala specifica: proviamo entrambi i ruoli per ogni Asso
//presente e vediamo se una delle combinazioni rende la scala valida.
//Il/i jolly possono riempire un buco interno OPPURE estendere la scala oltre
//il bordo (basso o alto), purché il risultato finale resti dentro il range
//valido 2 (il "2" può fare da carta bassa) .. 14 (Asso, carta più alta).
//Ritorna le carte ordinate se valida, altrimenti null.
function provaScala(carteNormali, jollyCount, carteJolly){
    let seme = carteNormali[0].seme;
    for(let i = 0; i < carteNormali.length; i++){
        if(carteNormali[i].seme !== seme){
            return null;
        }
    }

    //indici delle carte Asso presenti (ambiguità di ruolo: basso o alto)
    let assiIdx = [];
    carteNormali.forEach((c, i) => { if(c.valore === 1) assiIdx.push(i); });
    let k = assiIdx.length;

    for(let mask = 0; mask < (1 << k); mask++){
        let valoriAssegnati = carteNormali.map(c => c.valore);
        for(let j = 0; j < k; j++){
            valoriAssegnati[assiIdx[j]] = (mask & (1 << j)) ? 14 : 1;
        }

        let coppie = carteNormali.map((c, i) => ({ card: c, eff: valoriAssegnati[i] }));
        coppie.sort((a, b) => a.eff - b.eff);

        let duplicato = false;
        for(let i = 1; i < coppie.length; i++){
            if(coppie[i].eff === coppie[i - 1].eff){
                duplicato = true;
                break;
            }
        }
        if(duplicato){
            continue;
        }

        let min = coppie[0].eff;
        let max = coppie[coppie.length - 1].eff;

        let buchiInterni = (max - min + 1) - coppie.length;
        if(buchiInterni > jollyCount){
            continue;
        }

        let jollyResidui = jollyCount - buchiInterni;
        let spazioSotto = min - 2;
        let spazioSopra = 14 - max;

        if(jollyResidui > (spazioSotto + spazioSopra)){
            continue;
        }

        //questa assegnazione di ruoli è valida: costruisco l'ordine finale
        let jollyDisponibili = carteJolly.slice();
        let risultato = [];
        let atteso = min;
        let idx = 0;

        while(idx < coppie.length){
            if(coppie[idx].eff === atteso){
                risultato.push(coppie[idx].card);
                idx++;
            } else if(jollyDisponibili.length > 0){
                risultato.push(jollyDisponibili.pop());
            } else {
                break;
            }
            atteso++;
        }

        while(jollyDisponibili.length > 0){
            if(atteso <= 14){
                risultato.push(jollyDisponibili.pop());
                atteso++;
            } else {
                risultato.unshift(jollyDisponibili.pop());
            }
        }

        return risultato;
    }

    return null;
}

//-------------------------------------------------------------------------------------

//funzione per calcolare il punteggio del player
function calcolaPunteggio(tris){
    let who = game.turno;
    let tot = 0;
    let foundJolly = false;

    for(let i = 0 ; i < tris.length; i++){
        if(tris[i].seme == "jolly"){
            tot += 30;
        }
        
        if(tris[i].valore == 1){
            tot += 15;
        }

        if(tris[i].valore == 2){
            tot += 20;
        }

        if(tris[i].valore > 7){
            tot += 10;
        }else{
            tot += 5;
        }
        
        if(tris[i].isJolly){
            foundJolly = true;
        }
    }

    if(tris.length >= 7){
        game.hasDoneBurraco[who] = true;
        if(foundJolly){
            tot += 100;
        }else{
            tot += 200;
        }
    }

    return tot;
}

//-------------------------------------------------------------------------------------

//per una nuova partita
document.getElementById('btnRestart').addEventListener('click', function() {
    inizializzaPartita();
});
