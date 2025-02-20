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
    "attributes": { // changes the following:
        "sunExp": 0,
        "surroundingTemp": 0,
        "soilWat": 0,
        "windSpeed": 0,
    }
}sunExp = this.weightedAvg(sunExp,this.sunExpFunction(lat),1-latWeightSun,latWeightSun);
        surroundingTemp = this.weightedAvg(surroundingTemp,this.tempFunction(lat),1-latWeightTemp,latWeightTemp);
        soilWat = this.weightedAvg(soilWat,this.waterFunction(this.raindataAt(index)),1-rainfallWeight,rainfallWeight);
        let wind 
*/
const weatherEvents = [
    {
        "name": "Tornado",
        "desc": "Circular bust of wind",
        "icon": "<i class='fa-solid fa-tornado'></i>"
    },
    {
        "name": "Hurricane",
        "desc": "Very quickly moving thingy",
        "icon": "<i class='fa-solid fa-hurricane'></i>"
    },
    {
        "name": "Thunderstorm",
        "desc": "Low pressure environment that has lightning",
        "icon": "<i class='fa-solid fa-thunderstorm'></i>"
    },
    {
        "name": "Heatwave",
        "desc": "Intense heat in an area",
        "icon": "<i class='fa-solid fa-circle'></i>"
    },
    {
        "name": "Blizzard",
        "desc": "Lots of snow",
        "icon": "<i class='fa-solid fa-snowflake'></i>"
    },
    {
        "name": "Rain",
        "desc": "Good old fashion rain - Just be careful it can cause flash floods!",
        "icon": "<i class='fa-solid fa-cloud-rain'></i>"
    },
]

var weatherSummoned = null;

class weatherButton{
    constructor(name,description, icon){
        this.name = name;
        this.description = description;
        this.icon = icon
        // using innerHTML resets all event listeners and is just slower
        document.getElementById("weatherButtons").insertAdjacentHTML("beforeend",`
            <div id = "${this.name}" class = "weatherButton">
                <div class="icon">${icon}</div>
                <div class="right">
                    <span class="name">${name}</span>
                    <span class="description">${description}</span>
                </div>
            </div>
        `)
        document.getElementById(this.name).onclick = ()=>{
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
            this.buttons.push(new weatherButton(weatherEvents[i]["name"],weatherEvents[i]["desc"],weatherEvents[i]["icon"]));
        }
    }
    tick(){
        if(weatherSummoned == null){
            document.getElementById("weatherEvent").style.visibility = "hidden";
        }else{
            document.getElementById("weatherEvent").style.visibility = "visible";
            document.getElementById(weatherSummoned.name).classList.add("selected")
        }
    }
}

var alertsRead = true;

class Alert{
    constructor(name, description, icon){
        this.name = name;
        this.description = description;
        this.icon = icon
        const date = new Date();
        // using innerHTML resets all event listeners and is just slower
        document.getElementById("alerts").insertAdjacentHTML("beforeend",`
            <div id = "${this.name}" class = "alert">
                <div class="icon">${icon}</div>
                <div class="right">
                    <span class="name">${name}</span>
                    <span class="description">${description}</span>
                </div>
                <div class = time>${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}</div>
            </div>
        `);
        alertsRead = false;
    }
}