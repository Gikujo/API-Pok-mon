// ----- PENSER À DÉFINIR L'URL RACINE EN CAS DE CHANGEMENT D'ADRESSE


// **********************************************************************************************************
// ***************************************** AJOUT DES EXTENSIONS *******************************************
// **********************************************************************************************************

const express = require('express');
const Joi = require('joi');     // Outil qui sert à tester la validité d'une entrée
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json()); // Ajoute un middleware pour traiter les requêtes au format JSON
app.use(cors());


const url = "cartes/pokemonList.json";
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}..`));

// **********************************************************************************************************
// ********************************** ENVOI DES FICHIERS SUR LE SERVEUR *************************************
// **********************************************************************************************************

// Envoyer le fichier pokemonList
app.get('/cartes', (req, res) => {
    res.sendFile(path.join(__dirname, 'cartes', 'pokemonList.json'));
});

// Envoyer le fichier accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Envoyer le fichier CSS
app.get('/styles', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles', 'styles.css'));
});

// Envoyer le script
app.get('/script', (req, res) => {
    res.sendFile(path.join(__dirname, 'script', 'main.js'));
});

// **********************************************************************************************************
// ********************************************** FONCTIONS *************************************************
// **********************************************************************************************************

function verifierEntree(entree) {
    const schema = Joi.object({
        id: Joi.number().required(),
        nom: Joi.string().min(3).required(),
        type: Joi.string().min(3).required(),
        imageSrc: Joi.string().min(10).required()
    });


    let result = (schema.validate(entree));

    if (result.error) {
        // res.send(`Votre formulaire n'est pas valide.`);
        return false;
    }
}

// **********************************************************************************************************
// ***************************************** AFFICHER UN POKEMON ********************************************
// **********************************************************************************************************

app.get('/cartes/:nom', (req, res) => {

    fs.readFile('cartes/pokemonList.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier JSON :', err);
            res.status(500).send("Une erreur est survenue lors de la lecture de l'objet JSON Pokémon.");
            return;
        }

        try {
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

// **********************************************************************************************************
// ****************************************** AJOUTER UN POKEMON ********************************************
// **********************************************************************************************************

app.post('/cartes', (req, res) => {

    fs.readFile('cartes/pokemonList.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send("Une erreur est survenue lors de la lecture de l'objet JSON Pokémon.");
            return;
        }

        try {
            let cartesPokemon = JSON.parse(data).cartesPokemon;
            let idNouveauPokemon;

            if (cartesPokemon.length == 0) {
                idNouveauPokemon = 0;
            } else {
                idNouveauPokemon = cartesPokemon[cartesPokemon.length - 1].id + 1;
            }

            let newPokemon = {
                "id": idNouveauPokemon,
                "nom": req.body.nom,
                "type": req.body.type,
                "imageSrc": req.body.image
            };

            let etat = verifierEntree(newPokemon);

            if (etat == false) {
                res.status(400).send(`Votre formulaire n'est pas valide`);
                return;
            }    // Utilisation de Joi pour valider le formulaire

            cartesPokemon.push(newPokemon);

            const nouvellesDonnees = {
                "cartesPokemon": cartesPokemon
            };

            const nouvellesDonneesJSON = JSON.stringify(nouvellesDonnees, null, 2);
            console.log(nouvellesDonneesJSON);

            fs.writeFile(url, nouvellesDonneesJSON, (err) => {
                let resultat;

                if (err) {
                    resultat = `Une erreur s'est produite lors de l'implémentation du fichier JSON`;
                    console.error(err);
                    console.log(`errreur`);
                } else {
                    resultat = `Le fichier JSON a été modifié avec succès.`;
                    console.log(`succès`);
                }

                res.send(resultat);
            });

        } catch (error) {
            console.log(`Il y a eu un problème lors de l'envoi du fichier JSON.`);
            res.status(500).send(error);
        }
    });
});

// **********************************************************************************************************
// ***************************************** SUPPRIMER UN POKEMON *******************************************
// **********************************************************************************************************

app.delete('/supprimer/:id', (req, res) => {
    fs.readFile('cartes/pokemonList.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier JSON :', err);
            res.status(500).send("Une erreur est survenue lors de la lecture du fichier JSON Pokémon.");
            return;
        }

        try {
            const idRecherche = parseInt(req.params.id);
            const cartesPokemon = JSON.parse(data).cartesPokemon;

            var index = cartesPokemon.findIndex(function (carte) {
                return carte.id === idRecherche;
            });

            let pokemonEfface;
            if (index !== -1) {
                pokemonEfface = cartesPokemon.splice(index, 1);
            }

            console.log(pokemonEfface[0].nom);

            const donneesApresSuppression = {
                "cartesPokemon": cartesPokemon
            };

            const nouvellesDonneesJSON = JSON.stringify(donneesApresSuppression, null, 2);

            fs.writeFile("cartes/pokemonList.json", nouvellesDonneesJSON, (err) => {
                let resultat;

                if (err) {
                    console.error(err);
                    resultat = `Une erreur s'est produite lors de la mofification du fichier JSON`;
                } else {
                    resultat = `${pokemonEfface[0].nom} a été effacé avec succès.`;
                }

                res.send(resultat);
            });

        } catch (error) {
            console.error('Erreur lors de l\'analyse du fichier JSON :', error);
            res.status(500).send("Une erreur est survenue lors du traitement des données des Pokémon.");
        }
    });
});

// **********************************************************************************************************
// ***************************************** MODIFIER UN POKEMON ********************************************
// **********************************************************************************************************

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

            let etat = verifierEntree(req.body);   // Utilisation de Joi pour valider le formulaire

            if (etat == false) {
                console.log(`mauvaise saisie`);
                res.status(400).send(`Votre formulaire n'est pas valide`);
                return;
            }

            cartesPokemon[index] = req.body;

            const donneesApresModification = {
                "cartesPokemon": cartesPokemon
            };

            const nouvellesDonneesJSON = JSON.stringify(donneesApresModification, null, 2);

            fs.writeFile("cartes/pokemonList.json", nouvellesDonneesJSON, (err) => {
                let resultat;

                if (err) {
                    resultat = `Une erreur s'est produite lors de la modification de la base de données`;
                    console.error(err);
                } else {
                    resultat = `La modification de ${req.body.nom} a été effectuée avec succès.`;
                }

                res.send(resultat);
            });

        } catch (error) {
            console.error('Erreur lors de l\'analyse du fichier JSON :', error);
            res.status(500).send("Une erreur est survenue lors de la modification des données des Pokémon.");
        }
    });
});



