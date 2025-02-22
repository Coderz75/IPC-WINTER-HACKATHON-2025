"use strict";
// This is our main file. Will include all other js files via accessor methods
var gameMap;
var panels = [document.getElementById("specimenPanel"),document.getElementById("evolutionPanelWrapper"),document.getElementById("weatherPanel"),document.getElementById("alertPanel")]
var panelWidths = [555,800,475,475]
var panelsOpen = [0,0,0,0]
var weatherPanel = new Weather();
var MOUSEX = 0;
var MOUSEY = 0;
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
    document.getElementById("alertPanelButton").onclick = function() {
        togglePanel(3);
        alertsRead = true;
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
    
    document.onmousemove = function(event){
        MOUSEX = event.clientX;
        MOUSEY = event.clientY;
    }

    // Initialize game
    window.counter = 0;
    const mapCanvas = document.getElementById("mapCanvas");
    gameMap = new GameMap(mapCanvas);
    gameMap.addSpecies(palms); gameMap.addSpecies(pines); gameMap.addSpecies(cacti);
    palms.addPlant(136, 145); palms.addPlant(600, 145); 
    pines.addPlant(310, 100); pines.addPlant(180, 240); pines.addPlant(90, 100); pines.addPlant(620, 298); pines.addPlant(610, 100); pines.addPlant(510, 80); pines.addPlant(370, 200);
    cacti.addPlant(350, 150); cacti.addPlant(370, 290); cacti.addPlant(510, 120); 

    gameMap.canvas.addEventListener('mousedown', mouseDownEvent);
    //Start tick
    window.setInterval(tick, 34); // 30 fps
}
function tick(){
    // tick function.
    const globalTime = new Date().getTime();
    
    if(!alertsRead){
        document.getElementById("alertPanelButton").style.color = "red";
    }else{
        document.getElementById("alertPanelButton").style.color = "#818181";
    }

    if(autoWeather){
        weatherPanel.calcWeather(gameMap);
    }

    let a = getMouseOnCanvas(MOUSEX,MOUSEY);
    weatherPanel.tick()
    gameMap.tick(a[0],a[1]);
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

function mouseDownEvent(evt){
    if(evt.button == 0) {// left click
        let a = getMouseOnCanvas(evt.clientX, evt.clientY);
        let mx = a[0];
        let my = a[1];
        if(weatherSummoned != null){
            //Summon weather event at location
            mx = Math.round(mx);
            my = Math.round(my);
            weatherPanel.summonWeather(mx,my,weatherSummoned,gameMap)
            document.getElementById(weatherSummoned.name).classList.remove("selected");
            weatherSummoned = null;
        }
        else{
            //Chooses specimen
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

document.getElementById("dismissinfo").onclick = () => {
    document.getElementById("info_wrapper").style.display = "none"
    localStorage.viwedInfo = "true"
}

if (!localStorage.viwedInfo){
    document.getElementById("info_wrapper").style.display = "block"
}

document.getElementById("infoButton").onclick = () => {
    document.getElementById("info_wrapper").style.display = "block"
}
const palms = new PlantSpecies({
    waterStorage: DNA.generate_sequence(0.7, 100),
    waterAffinity: DNA.generate_sequence(0.7, 100),
    heatResistance: DNA.generate_sequence(0.8, 100),
    anchorage: DNA.generate_sequence(0.9, 100),
    competitiveness: DNA.generate_sequence(0.9, 100),
    photosynthesisRate: DNA.generate_sequence(0.5, 100),
    size: DNA.generate_sequence(0.6, 100),
    seedSize : DNA.generate_sequence(1, 100),
    seedCount : DNAScalar(1),
}, life);

const pines = new PlantSpecies({
    waterStorage: DNA.generate_sequence(0.4, 100),
    waterAffinity: DNA.generate_sequence(0.6, 100),
    heatResistance: DNA.generate_sequence(0.2, 100),
    anchorage: DNA.generate_sequence(0.3, 100),
    competitiveness: DNA.generate_sequence(0.2, 100),
    photosynthesisRate: DNA.generate_sequence(0.7, 100),
    size: DNA.generate_sequence(0.7, 100),
    seedSize : DNA.generate_sequence(0.1, 100),
    seedCount : DNAScalar(4),
}, life);

const cacti = new PlantSpecies({
    waterStorage: DNA.generate_sequence(0.9, 100),
    waterAffinity: DNA.generate_sequence(0.9, 100),
    heatResistance: DNA.generate_sequence(0.9, 100),
    anchorage: DNA.generate_sequence(0.01, 100),
    competitiveness: DNA.generate_sequence(0.01, 100),
    photosynthesisRate: DNA.generate_sequence(0.2, 100),
    size: DNA.generate_sequence(0.8, 100),
    seedSize : DNA.generate_sequence(0.5, 100),
    seedCount : DNAScalar(1),
}, life);