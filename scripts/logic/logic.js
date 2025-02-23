"use strict";

//TODO: Add statistics about how this is going to work; ie damage
/*
Attributer per storm event
{
    "name": "",
    "desc": "",
    "icon": "",
    "time": 0, //duration in ticks
    "type": "",// can be wind, weather, climate
    "range": , //range of event (radius of circle)
    "attributes": { // changes the following by:
        "sunExp": 0,
        "surroundingTemp": 0,
        "soilWat": 0,
        "windSpeed": 0,
    },
    "chance": 1/100, //chance of event per tick
}
*/

var alerts = []
var autoWeather = false;
const weatherEvents = [
    {
        "name": "Tornado",
        "desc": "A violently rotating column of air touching the ground.",
        "icon": "<i class='fa-solid fa-tornado'></i>",
        "time": 60, //duration in ticks
        "type": "wind",// can be wind, weather, climate
        "range": 6, //range of event (radius of circle)
        "attributes": { // changes the following:
            "sunExp": -0.2,
            "surroundingTemp": -0.2,
            "soilWat": 0,
            "windSpeed": 120,
        },
        "chance": 1/600, //chance of event per tick
    },
    {
        "name": "Hurricane",
        "desc": "Lots of systems moving around a center really quickly",
        "icon": "<i class='fa-solid fa-hurricane'></i>",
        "time": 160, //duration in ticks
        "type": "wind",// can be wind, weather, climate
        "range": 30, //range of event (radius of circle)
        "attributes": { // changes the following:
            "sunExp": -0.2,
            "surroundingTemp": -0.2,
            "soilWat": 0,
            "windSpeed": 130,
        },
        "chance": 1/2400, //chance of event per tick
    },
    {
        "name": "Thunderstorm",
        "desc": "Low pressure environment that has lightning",
        "icon": "<i class='fa-solid fa-thunderstorm'></i>",
        "time": 30, //duration in ticks
        "type": "weather",// can be wind, weather, climate
        "range": 15, //range of event (radius of circle)
        "attributes": { // changes the following:
            "sunExp": -0.5,
            "surroundingTemp": -0.2,
            "soilWat": 0.2,
            "windSpeed": 5,
        },
        "chance": 1/600, //chance of event per tick
    },
    {
        "name": "Heatwave",
        "desc": "Intense heat in an area",
        "icon": "<i class='fa-solid fa-circle'></i>",
        "time": 480, //duration in ticks
        "type": "climate",// can be wind, weather, climate
        "range": 30, //range of event (radius of circle)
        "attributes": { // changes the following:
            "sunExp": 0,
            "surroundingTemp": 0.2,
            "soilWat": -0.2,
            "windSpeed": 0,
        },
        "chance": 1/2400, //chance of event per tick
    },
    {
        "name": "Blizzard",
        "desc": "Lots of snow",
        "icon": "<i class='fa-solid fa-snowflake'></i>",
        "time": 60, //duration in ticks
        "type": "weather",// can be wind, weather, climate
        "range": 15, //range of event (radius of circle)
        "attributes": { // changes the following:
            "sunExp": -0.2,
            "surroundingTemp": -0.2,
            "soilWat": 0.2,
            "windSpeed": 0.2,
        },
        "chance": 1/800, //chance of event per tick
    },
    {
        "name": "Rain",
        "desc": "Good old fashion rain",
        "icon": "<i class='fa-solid fa-cloud-rain'></i>",
        "time": 60, //duration in ticks
        "type": "weather",// can be wind, weather, climate
        "range": 15, //range of event (radius of circle)
        "attributes": { // changes the following:
            "sunExp": -0.1,
            "surroundingTemp": 0,
            "soilWat": 0.3,
            "windSpeed": 0,
        },
        "chance": 1/120, //chance of event per tick
    },
]

var weatherSummoned = null;

class weatherButton{
    constructor(ev){
        this.event = ev;
        this.name = ev["name"];
        this.description = ev["desc"];
        this.icon = ev["icon"];
        // using innerHTML resets all event listeners and is just slower
        document.getElementById("weatherButtons").insertAdjacentHTML("beforeend",`
            <div id = "${this.name}" class = "weatherButton">
                <div class="icon">${this.icon}</div>
                <div class="right">
                    <span class="name">${this.name}</span>
                    <span class="description">${this.description}</span>
                </div>
            </div>
        `)
        document.getElementById(this.name).onclick = ()=>{
            document.querySelectorAll(".weatherButton").forEach(e=>{
                e.classList.remove("selected")
            })
            weatherSummoned = this;
        }
    }
}

// Weather stuff
class Weather{
    buttons = {};
    constructor(){
        document.getElementById("weatherEvent").onclick = ()=>{
            document.querySelectorAll(".weatherButton").forEach(e=>{
                e.classList.remove("selected")
            })
            weatherSummoned = null;
        };
        document.getElementById("autoSwitch").onclick = ()=>{
            autoWeather = !autoWeather;
        }
        for(let i = 0; i < weatherEvents.length; i++){
            this.buttons[weatherEvents[i]["name"]] =new weatherButton(weatherEvents[i]);
        }
    }
    tick(){
        if(weatherSummoned == null){
            document.getElementById("weatherEvent").style.visibility = "hidden";
        }else{
            document.getElementById("weatherEvent").style.visibility = "visible";
            document.querySelectorAll(".weatherButton").forEach(e=>{
                e.classList.remove("selected")
            })
            document.getElementById(weatherSummoned.name).classList.add("selected")
        }
    }
    calcWeather(map){
        for(const name in this.buttons){
            let chance = Math.random();
            let ev = this.buttons[name]
            if(name == "Rain"){
                //Automatic rain
                if(chance <= ev.event["chance"]){ // should happen one every 120 ticks
                    //calc which tile (this is index in rainTiles)
                    let tile = this.weightedRandom(map.rainTilesI,map.rainTilesWeights,map.totalWeights);
                    let i = map.landTiles[tile];// index in map
                    let pos = map.indexToCord(i);
                    this.summonWeather(pos[0],pos[1],ev,map);
                }
            }else{
                //everything else
                if(chance <= ev.event["chance"]){ 
                    //calc random tile
                    let tile = Math.floor(Math.random()/(1/(800*410))) //pick random tile
                    let pos = map.indexToCord(tile);
                    this.summonWeather(pos[0],pos[1],ev,map);
                }
            }
        }
    }
    weightedRandom(vals,weights,total){// uhhhh idk im too lazy to remove things i dont need.
        let a = Math.random();
        let e = 0;
        for(let i = 0; i < vals.length; i++){
            if(a >=e && a < e+(weights[i]/total)){
                return vals[i];
            }
            e +=weights[i]/total;
        }
        return 0;
    }

    summonWeather(mx,my, evt,gameMap){
        alerts.push(new Alert(`${evt.name} began in ${gameMap.getBiomeName(mx,my)} biome`,evt.description,evt.icon, undefined, "weatherAlert"));
        console.log(`Event: ${evt.name} has been summoned at (${mx},${my})`)
        let a = {};
        Object.assign(a,evt.event);
        a["x"] = mx;
        a["y"] = my;
        gameMap.weather.push(a);
    }
}

var alertsRead = true;

class Alert{
    constructor(name, description, icon, callback=undefined, classes=""){
        this.name = name;
        this.description = description;
        this.icon = icon
        const date = new Date();
        // using innerHTML resets all event listeners and is just slower
        document.getElementById("alerts").insertAdjacentHTML("afterbegin",`
            <div id = "${this.name.replaceAll(' ', '_')}" class = "alert ${classes}">
                <div class="icon">${icon}</div>
                <div class="right">
                    <span class="name">${name}</span>
                    <span class="description">${description}</span>
                </div>
                <div class = time>${date.getHours()}:${date.getMinutes() < 10 ? 0 : ""}${date.getMinutes()}:${date.getSeconds() < 10 ? 0 : ""}${date.getSeconds()}</div>
            </div>
        `);
        alertsRead = false;

        document.getElementById(this.name.replaceAll(' ', '_')).onclick = callback
    }
}

document.getElementById("toggleMutationVisibility").onchange = ()=>{
    document.getElementById("alertPanel").classList.toggle("hideAlerts")
}

document.getElementById("weatherToggle").onchange = ()=>{
    document.getElementById("alertPanel").classList.toggle("hideWeather")
}

document.getElementById("closeImage").onclick = () => {
    document.getElementById("imageModal").style.display = 'none'
}