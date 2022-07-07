
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
    pokeHeight.innerHTML = `Height: ${(data.height * 0.33).toPrecision(3)} feet`;
    pokeWeight.innerHTML = `Weight: ${(data.weight * 0.22).toPrecision(3)} lbs`;

    let pokeAbilities = document.querySelector('.pokemon-abilities__list');

    data.abilities.forEach(ability =>{
        const listItem = document.createElement('li');
        listItem.innerHTML = ability;
        pokeAbilities.appendChild(listItem);
    })
    
    //atk def sp atck sp def
    let pokeStats = document.querySelector('.pokemon-stats');
    let pokeStatItem = document.querySelectorAll('.pokemon-stats__item span');

    let [, atk, def, spAtk, spDef ,] = data.stats;
    let statsArr = [];

    statsArr.push(atk, def,spAtk, spDef)
    
    console.log(statsArr)

    let instance = 0;

    pokeStatItem.forEach((statItem) => {
        console.log('first loop');
        statItem.innerHTML = statsArr[instance].value;
        instance++
    })

    //displaying pokemon types
    /*
        call generateTypes function
        assign proper type and color to an object
        retun object from function

    */

    const pokemonTypesColoursArr = generateTypes(data.types)
    console.log('Types and colours');
    console.log(pokemonTypesColoursArr);

        //target section w pokemon-types class
        let sectionPokemonTypes = document.querySelector('.pokemon-types');
    
        //create a new ul element
        const pokeList = document.createElement('ul');

        //for each item in the pokemontypescoloursarr 
        pokemonTypesColoursArr.forEach((item)=>{
            let pokeListItem = document.createElement('li');
            pokeListItem.classList.add('pokemon-types__list')
            pokeListItem.style.backgroundColor = item.color;
            let node = document.createTextNode(item.type);
            pokeListItem.appendChild(node);
            pokeList.appendChild(pokeListItem);
        })

        sectionPokemonTypes.appendChild(pokeList);

        //append a child list element with a class of //'pokemon-header__type'
        //add the text and colour to each list item


    let pokemonMovesArr = await retrieveMoves(data.moves)
       
}

function generateTypes(pokemonTypes){
    let myArr = [];
    const allPokemonTypes = [
        {type: 'normal', color:'#A8A878'},
        {type: 'flying', color:'#A68FEB'},
        {type: 'fire', color:'#F08030'},
        {type: 'psychic', color:'#F85888'},
        {type: 'water', color:'#6890F0'},
        {type: 'bug', color:'#A8B820'},
        {type: 'grass', color:'#78C850'},
        {type: 'rock', color:'#B8A038'},
        {type: 'electric', color:'#F8D030'},
        {type: 'ghost', color:'#705898'},
        {type: 'ice', color:'#98D8D8'},
        {type: 'dark', color:'#705848'},
        {type: 'fighting', color:'#C03028'},
        {type: 'dragon', color:'#7038F8'},
        {type: 'poison', color:'#A040A0'},
        {type: 'steel', color:'#B8B8D0'},
        {type: 'ground', color:'#E0C068'},
        {type: 'fairy', color:'#F0B6BC'}
    ]

    pokemonTypes.forEach((pokeType) => {
        const found = allPokemonTypes.find((item) => item.type === pokeType )
        // console.log(found);
        myArr.push(found);
    })

    myArr.forEach(item => console.log(item));

    return myArr;
}


// create a seperate function to retrieve the type for each move.
async function retrieveMoves(moveArr){
    let testArr = [];
    for(let i = 0; i < moveArr.length; i++){
        let response = await fetch(`https://pokeapi.co/api/v2/move/${moveArr[i].name}/`);
        let data = await response.json();
        let moveObj = {
            movePP: data.pp,
            moveName: data.name,
            moveType: data.type.name,
            moveLevel: moveArr[i].level
        }

        testArr.push(moveObj)
        // console.log(moveObj);
    }

    console.log(testArr)

    // moveArr.forEach((move) => {
    //     let moveResponse = fetch(`https://pokeapi.co/api/v2/move/${move.name}/`);
    //     let data = await moveResponse.json();
    //     console.log(data);
    // })
    
    // for(let i = 0; i < 5; i++){
    //     let moveResponse = fetch(`https://pokeapi.co/api/v2/move/ember/`);
    //     let data = await (await moveResponse).json();
    //     console.log(data);
    // }
    
    // let testArr = [];
    // moveArr.forEach((move) => {
    //     fetch(`https://pokeapi.co/api/v2/move/${move.name}/`)
    //         .then((response)=> {return response.json()})
    //         .then((data => {
    //             console.log(data)
    //         }))
    //     // const data =  moveResponse.json();  
    // })
    

    /*
        array contains move name 
        for each move name 
        make an api call to https://pokeapi.co/api/v2/move/{id or name}/
        from the call data retrieve:
        pp, type -> name
        call the type function and input the retrieved type

        
        store these values into an object
        let movesObj = {
            powerPoint: pp,
            moveType: type
        }
    */


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


// function for assigning type colour 
/*
    function checkType(){
        function takes in an array of types
        for each type check through switch statement

        switch fire:
         case : 'fire'
            backgroundColor = red;


        return array [red, pink]
    }
*/




// retrieve pokemon type icon function


// Add some more text to test