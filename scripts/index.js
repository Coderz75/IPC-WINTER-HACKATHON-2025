"use strict";
// This is our main file. Will include all other js files via accessor methods
var gameMap;
var species = []; // List all all types of species. Should be a list of "Specie" classes (not objects)(static variables: tiles, name, and id attribute w/a "tick" function)
var panelOpen = 0; // 0 means none, 1 means specimen, 2 means evolution
function init(){
    //Initialize graphics
    document.getElementById("specimenPanelButton").onclick = function() {
        document.getElementById("specimenPanel").classList.toggle("open");
        if(panelOpen == 2){
            document.getElementById("evolutionPanel").classList.toggle("open");
            panelOpen = 1;
        }else if(panelOpen == 1){
            panelOpen = 0;
            document.getElementById("mapCanvas").classList.toggle("part");
        }else{
            document.getElementById("mapCanvas").classList.toggle("part");
            panelOpen = 1;
        }
    }
    document.getElementById("evolutionPanelButton").onclick = function() {
        document.getElementById("evolutionPanel").classList.toggle("open");
        if(panelOpen == 1){
            document.getElementById("specimenPanel").classList.toggle("open");
            panelOpen = 2;
        }else if(panelOpen == 2){
            panelOpen = 0;
            document.getElementById("mapCanvas").classList.toggle("part");
        }else{
            panelOpen = 2;
            document.getElementById("mapCanvas").classList.toggle("part");
        }
    }
    
    // Initialize game
    window.counter = 0;
    const mapCanvas = document.getElementById("mapCanvas");
    gameMap = new GameMap(mapCanvas);

    //Start tick
    window.setInterval(tick, 15);
}
function tick(){
    // tick function.
    
    species.forEach(function (item,index){
        item.tick();
    })
    gameMap.tick(species);
}


document.getElementById("body").onload = init;
