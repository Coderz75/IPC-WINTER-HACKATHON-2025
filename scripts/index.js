"use strict";
// This is our main file. Will include all other js files via accessor methods
var gameMap
function init(){
    // Initialize
    gameMap = new GameMap();
}
function tick(){
    // tick function.
}


document.getElementById("body").onload = init;
window.setInterval(tick, 10);