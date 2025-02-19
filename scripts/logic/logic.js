"use strict";

//TODO: Do some css magic to make this actually look nice
/*
Attributer per storm event
{
    "name": "",
    "desc": "",
    "icon": ""
}
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
    }
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
            document.getElementById(weatherSummoned.name).style.background = "whitesmoke";
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
            document.getElementById(weatherSummoned.name).style.background = "lightgoldenrodyellow";
        }
    }
}