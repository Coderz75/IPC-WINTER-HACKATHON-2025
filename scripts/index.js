"use strict";
// This is our main file. Will include all other js files via accessor methods
var gameMap;
var panelOpen = 0; // 0 means none, 1 means specimen, 2 means evolution
function init(){
    //Initialize graphics
    document.getElementById("specimenPanelButton").onclick = function() {
        document.getElementById("specimenPanel").classList.toggle("open");
        if(panelOpen == 2){
            document.getElementById("evolutionPanelWrapper").classList.toggle("open");
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
        document.getElementById("evolutionPanelWrapper").classList.toggle("open");
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
    gameMap.canvas.addEventListener('mousedown', clicker);
    //Start tick
    window.setInterval(tick, 15);
}
function tick(){
    // tick function.
    const globalTime = new Date().getTime();
    
    gameMap.tick();
    specimenPanel.draw(globalTime);
}
function clicker(evt){
    if(evt.button == 0) {// left click
        //get mouse x,y; not that these do not correspond to canvas x and y
        let x = evt.clientX;
        let y = evt.clientY;  
        var rect = gameMap.canvas.getBoundingClientRect(), // abs. size of element
        scaleX = gameMap.canvas.width / rect.width,    // relationship bitmap vs. element for x
        scaleY = gameMap.canvas.height / rect.height;  // relationship bitmap vs. element for y
        let mx = (x- rect.left) * scaleX;
        let my = (y - rect.top) * scaleY;
        gameMap.species.forEach(specie => {
            specie.activeMembers.forEach( member =>{
                if(Math.pow(member.pos.x-mx,2)+Math.pow(member.pos.y-my,2)<=36){ // Radius 6
                    specimenPanel.choose(member);
                }
            })
        });
    }
}

document.getElementById("body").onload = init;
