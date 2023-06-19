const express = require('express');
const Joi = require('joi');     // Outil qui sert à tester la validité d'une entrée
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json()); // Ajoute un middleware pour traiter les requêtes au format JSON
app.use(cors());

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}..`));

// Envoyer le fichier pokemonList
app.get('/cartes', (req, res) => {
    res.sendFile(path.join(__dirname, 'cartes', 'pokemonList.json'));
});

// Envoyer le fichier accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Envoyer le script
app.get('/script', (req, res) => {
    res.sendFile(path.join(__dirname, 'script', 'main.js'));
});

// ***************************************** AFFICHER UN POKEMON ********************************************

app.get('/cartes/:nom', (req, res) => {

    fs.readFile('cartes/pokemonList.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier JSON :', err);
            res.status(500).send("Une erreur est survenue lors de la lecture de l'objet JSON Pokémon.");
            return;
        }

        try {
            console.log(data);
            const nomPokemon = req.params.nom;
            const pokemonData = JSON.parse(data);
            const pokemon = pokemonData.cartesPokemon.find(objet => objet.nom == nomPokemon);

            if (!pokemon) {
                res.status(404).send("Le pokémon avec ce nom n'est pas disponible.");
                return;
            } else {
                res.send(pokemon);
            }
        } catch (error) {
            console.error('Erreur lors de l\'analyse du fichier JSON :', error);
            res.status(500).send("Une erreur est survenue lors du traitement des données des Pokémon.");
        }
    });
});

// ****************************************** AJOUTER UN POKEMON ********************************************

app.post('/cartes', (req, res) => {
    const url = "cartes/pokemonList.json";

    fs.readFile('cartes/pokemonList.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier JSON :', err);
            res.status(500).send("Une erreur est survenue lors de la lecture de l'objet JSON Pokémon.");
            return;
        }

        try {
            const nom = req.body;
            const listePokemon = JSON.parse(data);
            const cartesPokemon = listePokemon.cartesPokemon;

            const idNouveauPokemon = cartesPokemon[cartesPokemon.length - 1].id + 1;
            let newPokemon = {
                "id": idNouveauPokemon,
                "nom": req.body.nom,
                "type": req.body.type,
                "imageSrc": req.body.image
            };
            cartesPokemon.push(newPokemon);

            const nouvellesDonnees = {
                "cartesPokemon": cartesPokemon
            };

            const nouvellesDonneesJSON = JSON.stringify(nouvellesDonnees, null, 2);
            console.log(nouvellesDonneesJSON);

            fs.writeFile(url, nouvellesDonneesJSON, (err) => {
                if (err) {
                    console.error(`Une erreur s'est produite lors de l'implémentation du fichier JSON`, err);
                } else {
                    console.log(`Le fichier JSON a été modifié avec succès.`);
                }
            })

            res.send(`Le fichier JSON a été modifié avec succès.`);
        } catch (error) {
        }
    });
});

// ***************************************** SUPPRIMER UN POKEMON *******************************************

app.delete('/supprimer/:id', (req, res) => {
    fs.readFile('cartes/pokemonList.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier JSON :', err);
            res.status(500).send("Une erreur est survenue lors de la lecture de l'objet JSON Pokémon.");
            return;
        }

        try {
            const idRecherche = parseInt(req.params.id);
            const pokemonData = JSON.parse(data);
            const cartesPokemon = pokemonData.cartesPokemon;

            var index = cartesPokemon.findIndex(function (carte) {
                return carte.id === idRecherche;
            });

            if (index !== -1) {
                cartesPokemon.splice(index, 1);
            }

            const donneesApresSuppression = {
                "cartesPokemon": cartesPokemon
            };

            const nouvellesDonneesJSON = JSON.stringify(donneesApresSuppression, null, 2);

            fs.writeFile("cartes/pokemonList.json", nouvellesDonneesJSON, (err) => {
                if (err) {
                    console.error(`Une erreur s'est produite lors de l'implémentation du fichier JSON`, err);
                } else {
                    console.log(`Le fichier JSON a été modifié avec succès.`);
                }
            })

            res.send(nouvellesDonneesJSON);
        } catch (error) {
            console.error('Erreur lors de l\'analyse du fichier JSON :', error);
            res.status(500).send("Une erreur est survenue lors du traitement des données des Pokémon.");
        }
    });
});

// ***************************************** MODIFIER UN POKEMON ********************************************

app.put('/modifier/:id', (req, res) => {
    fs.readFile('cartes/pokemonList.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier JSON :', err);
            res.status(500).send("Une erreur est survenue lors de la lecture de l'objet JSON Pokémon.");
            return;
        }

        try {
            const idRecherche = parseInt(req.params.id);
            const cartesPokemon = JSON.parse(data).cartesPokemon;

            var index = cartesPokemon.findIndex(function (carte) {
                return carte.id === idRecherche;
            });

            console.log(`index : ${index}`);

            cartesPokemon[index] = req.body;

            const donneesApresModification = {
                "cartesPokemon": cartesPokemon
            };

            const nouvellesDonneesJSON = JSON.stringify(donneesApresModification, null, 2);

            fs.writeFile("cartes/pokemonList.json", nouvellesDonneesJSON, (err) => {
                if (err) {
                    console.error(`Une erreur s'est produite lors de la modification du fichier JSON`, err);
                } else {
                    console.log(`Le fichier JSON a été modifié avec succès.`);
                }
            })

            res.send(nouvellesDonneesJSON);
        } catch (error) {
            console.error('Erreur lors de l\'analyse du fichier JSON :', error);
            res.status(500).send("Une erreur est survenue lors de la modification des données des Pokémon.");
        }
    });
});

