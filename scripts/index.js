"use strict";
// This is our main file. Will include all other js files via accessor methods
var gameMap;
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
    gameMap.species.push(Palm);

    //Start tick
    window.setInterval(tick, 15);
}
function tick(){
    // tick function.
    gameMap.tick();
}


document.getElementById("body").onload = init;
