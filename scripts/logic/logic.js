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
        "icon": "https://cdn-icons-png.flaticon.com/512/803/803497.png"
    },
    {
        "name": "Hurricane",
        "desc": "Very quickly moving thingy",
        "icon": "https://banner2.cleanpng.com/20180328/vyw/avjsu27or.webp"
    }
]

class weatherButton{
    constructor(name,description, icon){
        this.name = name;
        this.description = description;
        this.icon = icon
        document.getElementById("weatherButtons").innerHTML +=
        `
            <div id = "${this.name}" class = "weatherButton fa-solid" data-name="${this.description}"><img src = "${this.icon}"><br>${name}</div>
        `;
    }
}

// Weather stuff
class Weather{
    buttons = [];
    constructor(){
        for(let i = 0; i < weatherEvents.length; i++){
            this.buttons.push(new weatherButton(weatherEvents[i]["name"],weatherEvents[i]["desc"],weatherEvents[i]["icon"]));
        }
    }
}