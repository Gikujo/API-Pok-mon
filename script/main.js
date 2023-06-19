const url = "http://localhost:3000";

// *************************** AFFICHAGE DES POKEMON *******************************

const tableau = document.querySelector('tbody');
let nomCarte = document.querySelector('#nomCarte');
let formulaireCarte = document.querySelector('#formulaireCarte');

// Requête GET pour afficher tous les Pokemons
$.ajax({
    url: `${url}/cartes`,
    type: 'GET',
    dataType: 'json',
    success: (data) => {
        console.log(data);
        const listePokemon = data.cartesPokemon;
        console.log(listePokemon);

        afficher(listePokemon);
    },
    error: () => {
        alert(`Il y a eu un problème lors de l'affichage des Pokémon.`);
    }


});

// Fonction pour afficher un array de Pokemons
function afficher(table) {

    table.forEach(element => {
        tableau.innerHTML +=
            `<tr>
                <th>${element.nom}</th>
                <th>${element.type}</th>
                <th><img src="${element.imageSrc}"></th>
                <th>
                    <div >
                        <button class="afficherModifications" id="modifier${element.id}">Éditer</button>
                    </div>
                    <form action="/supprimer/${element.id}" 
                    method="DELETE" 
                    class="formulaireSuppression">
                        <button type="submit">Supprimer</button>
                    </form>
                </th>
            </tr>
            <tr id="ligneFormulaireModification${element.id}" class="d-none"><th>
                <form id="formulaireModification${element.id}" action="/modifier/${element.id}" method="POST">
                        <label for="newName${element.id}">Nouveau nom</label>
                        <input name="newName${element.id}" value="${element.nom}">
                        <label for="newType${element.id}">Nouveau type</label>
                        <input name="newType${element.id}" value="${element.type}">
                        <label for="newImage${element.id}">Lien URL vers nouvelle image</label>
                        <input name="newImage${element.id}" value="${element.imageSrc}">
                        <button type="submit">Envoyer</button>
                        <th>
                        <button id="annuler${element.id}">Annuler</button>
                        </th>
                        <th></th>
                        <th></th>
                    </th>
                </form>
            </tr>`;

    });


    ajouterEcouteursSuppression();
    ajouterEcouteursModification();

}

// Gestion du formulaire de sélection d'un Pokémon
formulaireCarte.addEventListener('submit', (e) => {
    e.preventDefault();
    let nomPokemon = nomCarte.value;
    console.log(nomPokemon);

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
            },
            error: () => {
                alert(`Il y a eu un problème lors de l'affichage de ${nomPokemon}`);
            }
        });
    }
})

// ****************************** AJOUT DE POKEMON *********************************

const formulaireAjout = document.querySelector('#formulaireAjout');
const nomAjout = document.querySelector('#nom');
const typeAjout = document.querySelector('#type');
const imageAjout = document.querySelector('#imageSrc');

formulaireAjout.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
        "nom": `${nomAjout.value}`,
        "type": `${typeAjout.value}`,
        "image": `${imageAjout.value}`
    };
    $.ajax({
        type: "POST",
        url: `${url}/cartes`,
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(formData),
        dataType: "json",
        success: (data) => {
            // localStorage.setItem(cartesPokemon, data);

            // let listeCartes = localStorage.getItem(cartesPokemon);
            // console.log(listeCartes);
        },
        error: (xhr, status, error) => {
            console.log(formData);

            // Handle the error response
        }
    });
});

// ************************** SUPPRESSION D'UN POKEMON *****************************

function ajouterEcouteursSuppression() {
    const tousFormulairesSuppression = document.querySelectorAll('.formulaireSuppression');

    tousFormulairesSuppression.forEach(formulaire => {

        formulaire.addEventListener('submit', (e) => {
            e.preventDefault();
            $.ajax({
                type: "DELETE",
                url: formulaire.action,
                success: function (result) {
                    console.log('La requête DELETE a été effectuée avec succès.', result);
                },
                error: function (xhr, status, error) {
                    console.error('Une erreur s\'est produite lors de la requête DELETE:', error);
                    // Gérer l'erreur de la requête
                }
            });
        })
    });
}

// ********************************* MODIFICATION D'UN POKÉMON ***********************************

function ajouterEcouteursModification() {
    const tousBoutonsModification = document.querySelectorAll('.afficherModifications');

    tousBoutonsModification.forEach(bouton => {

        const idAModifier = parseInt(bouton.id[bouton.id.length - 1]);
        console.log(idAModifier);

        bouton.addEventListener('click', () => {

            const ligneFormulaireModification = document.querySelector(`#ligneFormulaireModification${idAModifier}`);
            ligneFormulaireModification.classList.remove('d-none');

            const formulaire = document.querySelector(`#formulaireModification${idAModifier}`);
            console.log(`Vous avez choisi le formulaire vers ${formulaire.action}`);

            formulaire.addEventListener('submit', (e) => {
                e.preventDefault();

                console.log(`Formulaire n°${idAModifier} envoyé`);

                const nouveauNom = document.querySelector(`input[name="newName${idAModifier}"]`).value;
                const nouveauType = document.querySelector(`input[name="newType${idAModifier}"]`).value;
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
                        console.log(result);
                        // Faire quelque chose avec la réponse en cas de succès
                    },
                    error: function (xhr, status, error) {
                        console.error('Une erreur s\'est produite lors de la requête PUT', error);
                        // Gérer l'erreur de la requête
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
