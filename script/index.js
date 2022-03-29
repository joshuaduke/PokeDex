
//Load first pokemon
window.onload = async () =>{
    let errorMsg = document.querySelector('.error__msg');

    const randomId = generateNumber();
    console.log(randomId);
    let myPokemon = createPokemon(77);
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
        // let battleMoves = [];
        // moves.forEach(item => {
        // let { move: {name} } = item;
        // let level = item["version_group_details"][0]["level_learned_at"];
        // // console.log(name, level)
        // let moveObj = {
        //     name: name,
        //     level: level
        // }
        // battleMoves.push(moveObj)
        // })

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
            value: value
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
        // let { "evolves_from_species": {name: evolvedFrom}, "flavor_text_entries": desc } = species;
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

        console.log(pokeData)
        return pokeData;



    } else {
        let errorMsg = document.querySelector('.error__msg');
        errorMsg.innerHTML = 'Invalid Search'
        const message = `An error has occured: ${pokemonResponse.status}, ${speciesResponse.status}`
        controller.abort();
        throw new Error(message);
    }


}

function populatePage(data){
    let pokeName = document.querySelector('.pokemon__name');
    let pokeHp = document.querySelector('.pokemon__hp');
    let pokeType = document.querySelector('.pokemon__type');

    console.log('This is a new pokemon', data)

    pokeName.innerHTML = (data.name).toUpperCase();
    pokeHp.innerHTML = (data.name).toUpperCase();
    pokeName.innerHTML = (data.name).toUpperCase();
}


// Search 

function generateNumber(){
    return Math.floor(Math.random() * 151)
}


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
