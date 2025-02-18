"use strict";
// This is our main file. Will include all other js files via accessor methods
var gameMap;
var panelOpen = 0; // 0 means none, 1 means specimen, 2 means evolution
var panels = [document.getElementById("specimenPanel"),document.getElementById("evolutionPanelWrapper"),document.getElementById("weatherPanel")]
var panelWidths = [555,800,475]
var panelsOpen = [0,0,0]
var weatherPanel = new Weather();


function init(){
    //Initialize graphics
    document.getElementById("specimenPanelButton").onclick = function() {
        togglePanel(0);
    }
    document.getElementById("evolutionPanelButton").onclick = function() {
        togglePanel(1);
    }
    document.getElementById("weatherPanelButton").onclick = function() {
        togglePanel(2);
    }
    window.onresize = function(event) {
        for(let i = 0; i < panelsOpen.length; i++){
            if(panelsOpen[i]==1){
                document.getElementById("mapCanvas").style.width = `${window.innerWidth-panelWidths[i]-80}px`;
                return;
            }
        }
        document.getElementById("mapCanvas").style.width = `${window.innerWidth-80}px`;
    };
    
    // Initialize game
    window.counter = 0;
    const mapCanvas = document.getElementById("mapCanvas");
    gameMap = new GameMap(mapCanvas);
    gameMap.species.push(Palm);
    gameMap.canvas.addEventListener('mousedown', specimenChooser);
    //Start tick
    window.setInterval(tick, 15);
}
function tick(){
    // tick function.
    const globalTime = new Date().getTime();
    
    gameMap.tick();
    specimenPanel.draw(globalTime);
}
function getMouseOnCanvas(x,y){
    var rect = gameMap.canvas.getBoundingClientRect(), // abs. size of element
    scaleX = gameMap.canvas.width / rect.width,    // relationship bitmap vs. element for x
    scaleY = gameMap.canvas.height / rect.height;  // relationship bitmap vs. element for y
    let mx = (x- rect.left) * scaleX;
    let my = (y - rect.top) * scaleY;
    return[mx,my];
}

function specimenChooser(evt){
    if(evt.button == 0) {// left click
        //get mouse x,y; not that these do not correspond to canvas x and y
        let a = getMouseOnCanvas(evt.clientX, evt.clientY);
        let mx = a[0];
        let my = a[1];
        gameMap.species.forEach(specie => {
            specie.activeMembers.forEach( member =>{
                if(Math.pow(member.pos.x-mx,2)+Math.pow(member.pos.y-my,2)<=36){ // Radius 6
                    specimenPanel.choose(member, gameMap);
                    if (panelsOpen[0] != 1) togglePanel(0);
                }
            })
        });
    }
}

function togglePanel(index){
    panels[index].classList.toggle("open");
    if(panelsOpen[index] ==1){
        document.getElementById("mapCanvas").style.width = `${window.innerWidth - 80}px`;
        panelsOpen[index]=0;
        return;
    }
    document.getElementById("mapCanvas").style.width = `${window.innerWidth-panelWidths[index]-80}px`;
    for(let i = 0; i < panelsOpen.length; i++){
        if(panelsOpen[i] === 1){
            panels[i].classList.toggle("open");
            panelsOpen[i] = 0;
        }
    }
    panelsOpen[index]=1;
}

document.getElementById("body").onload = init;
