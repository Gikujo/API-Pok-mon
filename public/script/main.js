// ----- PENSER À DÉFINIR L'URL RACINE EN CAS DE CHANGEMENT D'ADRESSE

const url = "http://localhost:3000";

// ******************************************************************************************************************
// ***************************************** REMPLSSAGE DU MENU DÉROULANT *******************************************
// ******************************************************************************************************************

let menuDeroulant = document.querySelector('#type');

afficherTypes(menuDeroulant);



// ******************************************************************************************************************
// ******************************************** AFFICHAGE DES POKEMON ***********************************************
// ******************************************************************************************************************

const tableau = document.querySelector('tbody');
let nomCarte = document.querySelector('#nomCarte');
let formulaireCarte = document.querySelector('#formulaireCarte');

// ----- Requête GET pour afficher tous les Pokemons
$.ajax({
    url: `${url}/cartes`,
    type: 'GET',
    dataType: 'json',
    success: (data) => {
        const listePokemon = data.cartesPokemon;
        afficher(listePokemon);
    },
    error: () => {
        alert(`Il y a eu un problème lors de l'affichage des Pokémon.`);
    }
});

// ******************************************************************************************************************
// ************************************* AFFICHAGE D'UN POKEMON SUR RECHERCHE ***************************************
// ******************************************************************************************************************

formulaireCarte.addEventListener('submit', (e) => {
    e.preventDefault();
    let nomPokemon = nomCarte.value;

    if (nomPokemon == '') {
        alert('Vous devez rentrer un nom de Pokémon.');
    } else {
        $.ajax({
            url: `${url}/cartes/${nomPokemon}`,
            type: "GET",
            dataType: "json",
            success: (data) => {
                tableau.innerHTML = '';
                afficher([data]);
                let boutonAfficher = document.querySelector('#afficher');
                boutonAfficher.textContent = 'Afficher tous les Pokémons';

                boutonAfficher.addEventListener('click', () => {
                    location.reload();
                });
            },
            error: () => {
                alert(`Il y a eu un problème lors de l'affichage de ${nomPokemon}`);
            }
        });
    }
})

// ******************************************************************************************************************
// *********************************************** AJOUT DE POKEMON *************************************************
// ******************************************************************************************************************

const formulaireAjout = document.querySelector('#formulaireAjout');
const nomAjout = document.querySelector('#nom');
const typeAjout = document.querySelector('#type');
const imageAjout = document.querySelector('#imageSrc');

formulaireAjout.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
        "nom": `${nomAjout.value}`,
        "type": `${typeAjout.selectedOptions[0].textContent}`,
        "image": `${imageAjout.value}`
    };


    $.ajax({
        type: "POST",
        url: `${url}/cartes`,
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(formData),
        dataType: "json",
        success: (result) => {
            alert(result);
            console.log(result);
        },
        error: (xhr, status, error) => {
            alert(xhr.responseText);
            location.reload();
        }
    });
});

// ******************************************************************************************************************
// ******************************************* SUPPRESSION D'UN POKEMON *********************************************
// ******************************************************************************************************************


function ajouterEcouteursSuppression() {
    const tousFormulairesSuppression = document.querySelectorAll('.formulaireSuppression');

    tousFormulairesSuppression.forEach(formulaire => {

        formulaire.addEventListener('submit', (e) => {
            e.preventDefault();
            $.ajax({
                type: "DELETE",
                url: formulaire.action,
                success: function (result) {
                    alert(result);
                    location.reload();
                },
                error: function (xhr, status, error) {
                    console.error(`Une erreur s'est produite lors de la requête DELETE:`, error);
                    alert(result);
                    location.reload();
                }
            });
        });
    });
}

// ******************************************************************************************************************
// ****************************************** MODIFICATION D'UN POKÉMON *********************************************
// ******************************************************************************************************************


function ajouterEcouteursModification(table) {
    const tousBoutonsModification = document.querySelectorAll('.afficherModifications');

    tousBoutonsModification.forEach(bouton => {

        let idAModifier = parseInt(bouton.id.replace('modifier', ''));

        bouton.addEventListener('click', () => {

            const ligneFormulaireModification = document.querySelector(`#ligneFormulaireModification${idAModifier}`);
            ligneFormulaireModification.classList.remove('d-none');

            const nouveauTypeSelect = document.querySelector(`select[name="newType${idAModifier}"]`);

            for (let index = 0; index < table.length; index++) {
                const element = table[index];

                if (element.id === idAModifier) {
                    let typeActuel = element.type;
                    afficherTypes(nouveauTypeSelect, typeActuel);
                }
            }

            const formulaire = document.querySelector(`#formulaireModification${idAModifier}`);

            formulaire.addEventListener('submit', (e) => {
                e.preventDefault();

                console.log(`Formulaire n°${idAModifier} envoyé`);

                const nouveauNom = document.querySelector(`input[name="newName${idAModifier}"]`).value;
                const nouveauType = nouveauTypeSelect.selectedOptions[0].textContent;
                const nouvelleImage = document.querySelector(`input[name="newImage${idAModifier}"]`).value;

                const pokemonModifie = JSON.stringify({
                    "id": idAModifier,
                    "nom": nouveauNom,
                    "type": nouveauType,
                    "imageSrc": nouvelleImage
                });

                console.log(pokemonModifie);

                $.ajax({
                    type: "PUT",
                    url: formulaire.action,
                    data: pokemonModifie,
                    contentType: 'application/json',
                    success: function (result) {
                        alert(result);
                        location.reload();
                    },
                    error: function (xhr, status, error) {
                        alert(error);
                        location.reload();
                    }
                })

            });

            const effacerFormulaire = document.querySelector(`#annuler${idAModifier}`);
            effacerFormulaire.addEventListener('click', (e) => {
                e.preventDefault();
                ligneFormulaireModification.classList.add('d-none');
                return;
            });
        })
    });
}

// ******************************************************************************************************************
// ************************************************** FONCTIONS *****************************************************
// ******************************************************************************************************************

// ----- Fonction pour afficher les types dans les menus déroulants
function afficherTypes(balise, type) {

    $.ajax({
        type: "GET",
        url: `${url}/typesPokemon`,
        data: "data",
        dataType: "json",
        success: (data) => {
            balise.innerHTML = `<option>Ouvrez le menu déroulant</option>`;
            const listeTypes = data.types;
            listeTypes.sort();

            for (let index = 0; index < listeTypes.length; index++) {
                const element = listeTypes[index];

                if (element === type) {
                    balise.innerHTML += `<option value="${index}" selected>${element}</option>`;
                } else {
                    balise.innerHTML += `<option value="${index}">${element}</option>`;
                }
            }
        },
        error: () => {
            alert(`Il y a eu un problème lors du chargement de la liste des types.`);
        }
    });

    balise.addEventListener('click', () => {
        let premierElement = balise.querySelector(':first-child');
        premierElement.setAttribute('disabled', '');
    });
}

// ----- Fonction pour afficher un array de Pokemons
function afficher(table) {

    table.forEach(element => {
        tableau.innerHTML +=
            `<tr class="pokemon-case col-lg-4 col-6 p-5">
                <th>${element.nom}</th>
                <th class="text-center">Type :<br>${element.type}</th>
                <th><img src="${element.imageSrc}"></th>
                <th>
                    <div class="margin-auto modifier-div">
                        <button class="afficherModifications" id="modifier${element.id}">Éditer</button>
                    </div>
                    <form action="/supprimer/${element.id}" 
                    method="DELETE" 
                    class="formulaireSuppression m-auto">
                        <button type="submit" class="m-auto">Supprimer</button>
                    </form>
                </th>
            </tr>
            <tr id="ligneFormulaireModification${element.id}" class="d-none">
                <th>
                    <form id="formulaireModification${element.id}" action="/modifier/${element.id}" method="POST">
                        <label for="newName${element.id}">Nouveau nom</label>
                        <input name="newName${element.id}" value="${element.nom}">
                        <label for="newType${element.id}">Nouveau type</label>
                        <select class="form-select" 
                            aria-label="Default select example" 
                            id="newType${element.id}" 
                            name="newType${element.id}" 
                            required>
                        </select>
                        <label for="newImage${element.id}">Lien URL vers nouvelle image</label>
                        <input name="newImage${element.id}" value="${element.imageSrc}">
                        <button type="submit">Envoyer</button>
                    </form>
                </th>
                <th>
                            <button id="annuler${element.id}">Annuler</button>
                        </th>
                        <th></th>
                        <th></th>
            </tr>`;


    });


    ajouterEcouteursSuppression(table);
    ajouterEcouteursModification(table);
}