// ----- PENSER À DÉFINIR L'URL RACINE EN CAS DE CHANGEMENT D'ADRESSE


// **********************************************************************************************************
// ***************************************** AJOUT DES EXTENSIONS *******************************************
// **********************************************************************************************************

const express = require('express');
const Joi = require('joi');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
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
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Envoyer le fichier CSS
app.get('/styles', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'styles', 'styles.css'));
});

// Envoyer le script
app.get('/script', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'script', 'main.js'));
});

// Envoyer la liste des Pokémons
app.get('/typesPokemon', (req, res) => {
    res.sendFile(path.join(__dirname, 'typesPokemon', 'typesPokemon.json'));
});

// Envoyer le fichier image
app.get('/image', (req, res) => {
    res.sendFile(path.join(__dirname, 'image', 'pokeball.png'));
});

// Envoyer les icones
app.get('/images/icon-small', (req, res) => {
    res.sendFile(path.join(__dirname, 'images', 'pokeball-16x16.png'));
});
app.get('/images/icon-medium', (req, res) => {
    res.sendFile(path.join(__dirname, 'images', 'pokeball-32x32.png'));
});


// **********************************************************************************************************
// ***************************************** AFFICHER UN POKEMON ********************************************
// **********************************************************************************************************

app.get('/cartes/:nom', (req, res) => {

    fs.readFile(url, 'utf8', (err, data) => {
        if (err) {                          // -- Import du fichier JSON
            console.error('Erreur lors de la lecture du fichier JSON :', err);
            res.status(500).send("Une erreur est survenue lors de la lecture de l'objet JSON Pokémon.");
            return;
        }

        try {
            const nomPokemon = req.params.nom;
            const pokemonData = JSON.parse(data);
            const pokemon = pokemonData.cartesPokemon.find(objet => objet.nom == nomPokemon);

            if (!pokemon) {                 // Si le pokémon n'est pas dans la liste
                res.status(404).send("Le pokémon avec ce nom n'est pas disponible.");
                return;
            } else {                        // Sinon, on renvoie le pokémon
                res.send(pokemon);
            }
        } catch (error) {                   // Si le fichier JSON n'a pas été lu
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
        if (err) {                          // Import du fichier JSON
            res.status(500).send("Une erreur est survenue lors de la lecture de l'objet JSON Pokémon.");
            return;
        }

        try {
            let cartesPokemon = JSON.parse(data).cartesPokemon;

            cartesPokemon.forEach(element => {
                if (element.nom === req.body.nom) {
                    res.status(400).send(`Ce pokémon existe déjà, vous l'aurez donc en doublon.`);
                    return;
                }
            });

            let idNouveauPokemon;
            // Attribution de l'ID du nouveau Pokémon
            if (cartesPokemon.length == 0) {
                idNouveauPokemon = 0;       // Si c'est le premier, il prend 0
            } else {
                idNouveauPokemon = cartesPokemon[cartesPokemon.length - 1].id + 1;
            }                               // Sinon, on l'incrémente

            let newPokemon = {              // On fabrique l'objet Pokémon à comparer avec le schéma
                "id": idNouveauPokemon,
                "nom": req.body.nom,
                "type": req.body.type,
                "imageSrc": req.body.image
            };



            let etat = verifierEntree(newPokemon, cartesPokemon);// Utilisation de Joi pour valider le formulaire
            if (etat === false) {
                res.status(400).send(`Votre formulaire n'est pas valide`);
                return;                     // Si erreur, on arrête la requête
            }

            cartesPokemon.push(newPokemon); // Sinon, on rajoute le nouveau Pokémon

            const nouvellesDonnees = {      // Création d'un nouvel objet à destination du JSON
                "cartesPokemon": cartesPokemon
            };
            const nouvellesDonneesJSON = JSON.stringify(nouvellesDonnees, null, 2);


            fs.writeFile(url, nouvellesDonneesJSON, (err) => {
                // Écrasement du JSON
                let resultat;

                if (err) {
                    resultat = `Une erreur s'est produite lors de l'implémentation du fichier JSON`;
                    console.error(err);
                } else {
                    resultat = `${newPokemon.nom} a été ajouté avec succès.`;
                }
                // Envoi du texte d'information à afficher
                res.send(resultat);
            });

        } catch (error) {
            console.log(`Il y a eu un problème lors du traitement de la requête.`);
            res.status(500).send(error);
        }
    });
});

// **********************************************************************************************************
// ***************************************** SUPPRIMER UN POKEMON *******************************************
// **********************************************************************************************************

app.delete('/supprimer/:id', (req, res) => {
    fs.readFile('cartes/pokemonList.json', 'utf8', (err, data) => {
        if (err) {                          // Import du fichier JSON
            console.error('Erreur lors de la lecture du fichier JSON :', err);
            res.status(500).send("Une erreur est survenue lors de la lecture du fichier JSON Pokémon.");
            return;
        }

        try {                               // On cherche l'ID en paramètre dans la liste des Pokémons
            // ----- Le but de ce bout de code est d'éviter les problèmes dans le cas où l'ID d'un pokémon
            // --------- ne correspond pas à sa position dans le tableau (par exemple, on a 10 éléments
            // --------- dans le tableau, mais le dernier, suite à des suppressions, a l'ID 12).

            const idRecherche = parseInt(req.params.id);
            const cartesPokemon = JSON.parse(data).cartesPokemon;

            var index = cartesPokemon.findIndex(function (carte) {
                return carte.id === idRecherche;
            });

            let pokemonEfface;              // Pour pouvoir le retourner en réponse, pour confirmation
            if (index !== -1) {
                pokemonEfface = cartesPokemon.splice(index, 1);
            }
            // Le pokémon à effacer a été enlevé de la liste
            const donneesApresSuppression = {
                "cartesPokemon": cartesPokemon
            };
            // Création des données sous format JSON
            const nouvellesDonneesJSON = JSON.stringify(donneesApresSuppression, null, 2);

            // Écriture dans le JSON
            fs.writeFile("cartes/pokemonList.json", nouvellesDonneesJSON, (err) => {
                let resultat;

                if (err) {
                    console.error(err);
                    resultat = `Une erreur s'est produite lors de la mofification du fichier JSON`;
                } else {
                    resultat = `${pokemonEfface[0].nom} a été effacé avec succès.`;
                }
                // Envoi du texte d'information à afficher
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
        if (err) {                          // Import du fichier JSON
            console.error('Erreur lors de la lecture du fichier JSON :', err);
            res.status(500).send("Une erreur est survenue lors de la lecture de l'objet JSON Pokémon.");
            return;
        }

        try {
            const idRecherche = parseInt(req.params.id);            // ID du pokémon à modifier
            const cartesPokemon = JSON.parse(data).cartesPokemon;   // Extraction de la liste des Pokémons

            var index = cartesPokemon.findIndex(function (carte) {  // Récupération de l'ID du Pokémon
                return carte.id === idRecherche;
            });

            let etat = verifierEntree(req.body);   // Utilisation de Joi pour valider le formulaire

            if (etat == false) {                    // Si Joi invalide
                res.send(`Votre modification n'est pas valide`);
                return;
            }

            cartesPokemon[index] = req.body;        // Actualisation du tableau avec les données de la req

            const donneesApresModification = {
                "cartesPokemon": cartesPokemon
            };

            // Création des données sous format JSON
            const nouvellesDonneesJSON = JSON.stringify(donneesApresModification, null, 2);

            fs.writeFile("cartes/pokemonList.json", nouvellesDonneesJSON, (err) => {
                let resultat;

                if (err) {
                    resultat = `Une erreur s'est produite lors de la modification de la base de données`;
                    console.error(err);
                } else {
                    resultat = `La modification de ${req.body.nom} a été effectuée avec succès.`;
                }
                // Envoi du texte d'information à afficher
                res.send(resultat);
            });

        } catch (error) {
            console.error('Erreur lors de l\'analyse du fichier JSON :', error);
            res.status(500).send("Une erreur est survenue lors de la modification des données des Pokémon.");
        }
    });
});

// **********************************************************************************************************
// ********************************************** FONCTIONS *************************************************
// **********************************************************************************************************

// ----- Fonction pour vérifier la validité de l'entrée
function verifierEntree(entree) {
    const schema = Joi.object({
        id: Joi.number().required(),
        nom: Joi.string().regex(/^[a-zA-ZéèêîôûàçÉÈÊÎÔÛÀÇïÏöÖüû]+$/).min(3).max(25).required(),
        type: Joi.string().regex(/^[a-zA-ZéèêîôûàçÉÈÊÎÔÛÀÇïÏöÖüû]+$/).min(3).required(),
        imageSrc: Joi.string().min(10).required()
    });


    let result = (schema.validate(entree));

    if (result.error ||     // Éviter les entrées de code XSS
        entree.nom !== escapeHtml(entree.nom) ||
        entree.type !== escapeHtml(entree.type) ||
        entree.imageSrc !== escapeHtml(entree.imageSrc)) {
        return false;
    }
}

// ----- Fonction pour échapper les entrées de code
function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}