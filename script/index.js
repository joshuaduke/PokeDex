const myBtn = document.querySelector('button');

function loadDoc(){
    const xhttp = new XMLHttpRequest();

    xhttp.onload = ()=>{
        console.log(JSON.parse(xhttp.responseText))
    }
    
    xhttp.open('GET', 'https://pokeapi.co/api/v2/pokemon/ditto')
    xhttp.send();
}

function loadWithFetch(){
    fetch('https://pokeapi.co/api/v2/pokemon/ditto')
        .then( resp =>  resp.json() )
        .then(data => console.log(data))
}

myBtn.addEventListener('click', loadWithFetch)
