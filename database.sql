-- Creazione database
CREATE DATABASE burracoOnline;
USE burracoOnline;

-- Tabella utenti
CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    punteggio INT NOT NULL,
    PRIMARY KEY(id)
);