
//Load first pokemon
window.onload = async () =>{
    let errorMsg = document.querySelector('.error__msg');

    const randomId = generateNumber();
    console.log(randomId);
    let myPokemon = await createPokemon(randomId);
    populatePage(myPokemon)
}

async function getSprite(id){
    if(id !== null) {
        const spriteResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const sprite = await spriteResponse.json();
    
        let { 
            sprites: {
                    other: { 
                        "official-artwork": 
                            { "front_default": imageLink } 
                            } 
                    } 
            } = sprite;
    
            return imageLink; 
    } else {
        return null;
    }
}

async function createPokemon(nameOrId){
    const  controller = new AbortController();
    const [pokemonResponse, speciesResponse] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`, {signal: controller.signal}),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${nameOrId}`, {signal: controller.signal})
    ]);

    if(pokemonResponse.ok && speciesResponse.ok){
        const pokemon = await pokemonResponse.json();
        const species = await speciesResponse.json();
    
        // GENERAL DETAILS
        let { id, name, height, weight, abilities, moves, stats, types } = pokemon;
        // console.log(id, name, height, weight, abilities, moves)

        // ABILITIES
        let pokeAbilities = [];
        abilities.forEach(item =>{
        let { ability: {name}} = item;
        pokeAbilities.push(name)
        })

        // MOVES
        let battleMoves = moves.filter( (item) =>{
            let level = item["version_group_details"][0]["level_learned_at"];
            let { move: {name} } = item;
            
            if(level !== 0){
              return item;
            }
        }).map((item)=>{
            let { move: {name} } = item;
            let level = item["version_group_details"][0]["level_learned_at"];
            // console.log(name, level)
            let moveObj = {
              name: name,
              level: level
            }
            return moveObj;
        })        

        // STATS
        let pokeStats = []
        stats.forEach(item => {
        let {"base_stat": value , stat: {name} } = item; 
        let statObj = {
            name: name,
            value: value,
        }
        pokeStats.push(statObj)
        })

        // TYPES
        let pokeTypes = [];
        types.forEach(item => {
        let { type: { name }} = item;
        pokeTypes.push(name);
        })

        // IMAGE
        let { 
            sprites: {
                    other: { 
                        "official-artwork": 
                            { "front_default": imageLink } 
                            } 
                    } 
            } = pokemon;

        // Evolved From
        let { "flavor_text_entries": desc } = species;

        let evolvedFrom;
        let { "evolves_from_species":  isExist } = species;
        if(isExist === null ){
          evolvedFrom = null;
        } else {
          evolvedFrom = isExist.name;
        }

        let pokeData = {
        id: id,
        name: name,
        height: height,
        weight: weight,
        moves: battleMoves,
        stats: pokeStats,
        abilities: pokeAbilities,
        types: pokeTypes,
        image: imageLink,
        evolvedFrom: evolvedFrom,
        description: desc[0]["flavor_text"]
        }

        // console.log(pokeData)
        return pokeData;



    } else {
        let errorMsg = document.querySelector('.error__msg');
        errorMsg.innerHTML = 'Invalid Search'
        const message = `An error has occured: ${pokemonResponse.status}, ${speciesResponse.status}`
        controller.abort();
        throw new Error(message);
    }


}

async function populatePage(data){
    let pokemonCard = document.querySelector('.pokemon-card');
    let title = document.querySelector('.title');
    let pokeName = document.querySelector('.pokemon-header__name');
    let pokeHp = document.querySelector('.pokemon-header__hp');
    let pokeType = document.querySelector('.pokemon-header__type');
    let pokeImage = document.querySelector('.pokemon-card-image__img')
    let evolvedFromName = document.querySelector('.evolvedFrom-name');
    let pokeId = document.querySelector('.pokemon-char-id');
    let pokeHeight = document.querySelector('.pokemon-char-height');
    let pokeWeight = document.querySelector('.pokemon-char-weight');

    console.log('This is a new pokemon', data)
    
    // Evolved From image
    const evolvedFromImgDiv = document.createElement('div');
    evolvedFromImgDiv.classList.add('evolvedFrom-img')

    const previousFormImg = document.createElement('img');
    let imageUrl = await getSprite(data.evolvedFrom);
    
    console.log(imageUrl)
    if(imageUrl !== null){
        title.style.marginLeft = '50px';
        pokemonCard.appendChild(evolvedFromImgDiv);
        previousFormImg.src = await getSprite(data.evolvedFrom);
        evolvedFromImgDiv.appendChild(previousFormImg);
         //Evolved From name
        evolvedFromName.innerHTML = `Evolves from ${data.evolvedFrom}`;
    }

    // Pokemon Details
    pokeName.innerHTML = (data.name).toUpperCase();
    pokeHp.innerHTML = `${(data.stats[0].value)} HP`;
    pokeType.innerHTML = data.types[0]
    pokeImage.src = data.image;
    pokeId.innerHTML = `ID: ${data.id}`;
    pokeHeight.innerHTML = `Height: ${data.height * 0.33} feet`;
    pokeWeight.innerHTML = `Weight: ${data.weight * 0.22} lbs`;

    let pokeAbilities = document.querySelector('.pokemon-abilities__list');

    data.abilities.forEach(ability =>{
        const listItem = document.createElement('li');
        listItem.innerHTML = ability;
        pokeAbilities.appendChild(listItem);
    })
    
    let pokeStats = document.querySelector('.pokemon-stats');
    let [, atk, def, spAtk, spDef ,] = data.stats;
    let statsArr = [];

    statsArr.push(atk, def,spAtk, spDef)

    statsArr.forEach(item => {
        console.log(item)
        // let statsItem = document.createElement('div');
        // let statsParagraph = document.createElement('p');
        // let statName = Object.keys(item)

        // statsParagraph.innerHTML = `${statName}: `;
        // statsItem.appendChild(statsParagraph);
        // statsItem.classList.add('pokemon-stats__item');
        // pokeStats.appendChild(statsItem);


    })

       
}


// Search 

function generateNumber(){
    return Math.floor(Math.random() * 150 + 1)
}


/*
abilities: (3) ['synchronize', 'inner-focus', 'magic-guard']
description: "It emits special\nalpha waves from\nits body that\finduce headaches\njust by being\nclose by."
evolvedFrom: "abra"
height: 13
id: 64
image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/64.png"
moves: (16) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
name: "kadabra"
stats: (6) [{…}, {…}, {…}, {…}, {…}, {…}]
types: ['psychic']
weight: 565
*/



/* DATA To retrieve from APIs
https://pokeapi.co/api/v2/pokemon/{name or Id}
    Abilities - check
    height - check
    id - check
    name - check
    Sprites -> other -> official-artwork -> front_default - check
    stats - check
        HP
        ATK
        DEF
        SP-ATK
        SP-DEF
        SPEED
    Types - check
    Weight - check
    moves - check

https://pokeapi.co/api/v2/pokemon-species/{name or id}
    evolution_chain
    evolves_from_species  -> name or null
    flavor_text
    name
    id

*/







// const myBtn = document.querySelector('button');
// function loadDoc(){
//     const xhttp = new XMLHttpRequest();

//     xhttp.onload = ()=>{
//         console.log(JSON.parse(xhttp.responseText))
//     }
    
//     xhttp.open('GET', 'https://pokeapi.co/api/v2/pokemon/ditto')
//     xhttp.send();
// }

// function loadWithFetch(){
//     fetch('https://pokeapi.co/api/v2/pokemon/ditto')
//         .then( resp =>  resp.json() )
//         .then(data => console.log(data))
// }

// myBtn.addEventListener('click', loadWithFetch)
