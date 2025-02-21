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
    }
}
*/
const weatherEvents = [
    {
        "name": "Tornado",
        "desc": "Circular bust of wind",
        "icon": "<i class='fa-solid fa-tornado'></i>",
        "time": 20, //duration in ticks
        "type": "wind",// can be wind, weather, climate
        "range": 6, //range of event (radius of circle)
        "attributes": { // changes the following:
            "sunExp": -0.2,
            "surroundingTemp": -0.2,
            "soilWat": 0,
            "windSpeed": 10,
        }
    },
    {
        "name": "Hurricane",
        "desc": "Very quickly moving thingy",
        "icon": "<i class='fa-solid fa-hurricane'></i>",
        "time": 80, //duration in ticks
        "type": "wind",// can be wind, weather, climate
        "range": 70, //range of event (radius of circle)
        "attributes": { // changes the following:
            "sunExp": -0.5,
            "surroundingTemp": -0.2,
            "soilWat": 0,
            "windSpeed": 30,
        }
    },
    {
        "name": "Thunderstorm",
        "desc": "Low pressure environment that has lightning",
        "icon": "<i class='fa-solid fa-thunderstorm'></i>",
        "time": 20, //duration in ticks
        "type": "weather",// can be wind, weather, climate
        "range": 15, //range of event (radius of circle)
        "attributes": { // changes the following:
            "sunExp": -0.5,
            "surroundingTemp": -0.2,
            "soilWat": 0.2,
            "windSpeed": 5,
        }
    },
    {
        "name": "Heatwave",
        "desc": "Intense heat in an area",
        "icon": "<i class='fa-solid fa-circle'></i>",
        "time": 240, //duration in ticks
        "type": "climate",// can be wind, weather, climate
        "range": 60, //range of event (radius of circle)
        "attributes": { // changes the following:
            "sunExp": 0,
            "surroundingTemp": 0.4,
            "soilWat": -0.2,
            "windSpeed": 0,
        }
    },
    {
        "name": "Blizzard",
        "desc": "Lots of snow",
        "icon": "<i class='fa-solid fa-snowflake'></i>",
        "time": 20, //duration in ticks
        "type": "weather",// can be wind, weather, climate
        "range": 15, //range of event (radius of circle)
        "attributes": { // changes the following:
            "sunExp": -0.5,
            "surroundingTemp": -0.5,
            "soilWat": 0.2,
            "windSpeed": 0.2,
        }
    },
    {
        "name": "Rain",
        "desc": "Good old fashion rain - Just be careful it can cause flash floods!",
        "icon": "<i class='fa-solid fa-cloud-rain'></i>",
        "time": 20, //duration in ticks
        "type": "weather",// can be wind, weather, climate
        "range": 15, //range of event (radius of circle)
        "attributes": { // changes the following:
            "sunExp": -0.2,
            "surroundingTemp": 0,
            "soilWat": 0.3,
            "windSpeed": 0,
        }
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
    buttons = [];
    constructor(){
        document.getElementById("weatherEvent").onclick = ()=>{
            document.querySelectorAll(".weatherButton").forEach(e=>{
                e.classList.remove("selected")
            })
            weatherSummoned = null;
        };
        for(let i = 0; i < weatherEvents.length; i++){
            this.buttons.push(new weatherButton(weatherEvents[i]));
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
}

var alertsRead = true;

class Alert{
    constructor(name, description, icon, callback=undefined){
        this.name = name;
        this.description = description;
        this.icon = icon
        const date = new Date();
        // using innerHTML resets all event listeners and is just slower
        document.getElementById("alerts").insertAdjacentHTML("beforeend",`
            <div id = "${this.name.replaceAll(' ', '_')}" class = "alert">
                <div class="icon">${icon}</div>
                <div class="right">
                    <span class="name">${name}</span>
                    <span class="description">${description}</span>
                </div>
                <div class = time>${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}</div>
            </div>
        `);
        alertsRead = false;

        document.getElementById(this.name.replaceAll(' ', '_')).onclick = callback
    }
}