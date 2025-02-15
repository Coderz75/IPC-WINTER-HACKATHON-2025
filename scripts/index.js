"use strict";
// This is our main file. Will include all other js files via accessor methods
var gameMap;
var species = []; // List all all types of species. Should be a list of "Specie" class (well anything with the tiles, name, and id attribute w/a "tick" function)
function init(){
    // Initialize
    window.counter = 0;
    const mapCanvas = document.getElementById("mapCanvas");
    gameMap = new GameMap(mapCanvas);
}
function tick(){
    // tick function.
    species.forEach(function (item,index){
        item.tick();
    })
    gameMap.tick(species);
}


document.getElementById("body").onload = init;
window.setInterval(tick, 15);