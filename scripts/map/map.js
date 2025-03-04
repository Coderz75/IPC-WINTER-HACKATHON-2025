"use strict";
// Everything pertaining to map generation, rendering
//Assuming 800*410 map
class GameMap{
    constructor(canvas){
        //init
        this.canvas = canvas
        this.ctx = this.canvas.getContext("2d");
        this.mapCanvas = new OffscreenCanvas(800,410);
        this.mapCtx = this.mapCanvas.getContext("2d");
        this.map = window.mapData;
        this.specieTiles = [];
        for (let i = 0; i < 80*41; i++)
            this.specieTiles.push([]);
        this.species = []; //stores the classes for the plant species

        this.rainData = window.rainData;

        this.weather = [];
        this.loadMap(); 
        //lemme cook: trust the process
        this.rainTiles = [];
        this.rainTilesI = [];
        this.rainTilesWeights=[];
        this.totalWeights = 0;
        this.landTiles = []
        let b = 0;
        for(let i =0; i <this.rainData.length;i++){
            let w = this.raindataAt(i);
            if(w != null){
                this.rainTiles.push(i);
                this.rainTilesI.push(b);
                this.rainTilesWeights.push(w);
                this.totalWeights+=1;
                b+=1;
            }
            if(this.map[i] != 9){
                this.landTiles.push(i)
            }
        }
    }
    addSpecies(specie){
        this.species.push(specie);
        specie.gameMap = this;
    }
    tick(mx,my){
        // tick
        {//species tick
            let speciesNext = [];
            this.species.forEach(specie => {
                specie.tick();
                if (!specie.extinct && specie.seedMembers.length + specie.activeMembers.length === 0) {
                    specie.extinct = true;
                    specie.me.text.title = "Extinct"
                    specie.me.HTMLclass += " extinct"
                    alerts.push(new Alert("Extinction Event", `${specie.name} has gone extinct`, "<i class='fa-solid fa-skull'></i>", ()=>{
                        document.getElementById("evolutionPanelButton").click()
                    }));
                    redrawTree()
                    setTimeout(redrawTree, 1000)
                }
                speciesNext.push(specie);
            });
            this.species = speciesNext;
        }
        //competition tile cleanup
        this.specieTiles.forEach(tile => {
            let tileNext = [];
            tile.forEach(plant => {if (plant.isAlive) tileNext.push(plant)});
            tile = tileNext;
        });
        
        for(let i = 0; i < this.weather.length; i++){
            if(this.weather[i]["time"] == 0){
                this.weather.splice(i,1);
                i-=1;
            }else{
                this.weather[i]["time"] -=1;
            }
        }
        this.render(mx,my);
    }
    render(mx,my){
        //render map.
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.mapCanvas, 0, 0);
        let weatherCanvas = new OffscreenCanvas(800,410);
        let weatherctx = weatherCanvas.getContext("2d");
        if(weatherSummoned != null){
            weatherctx.beginPath();
            weatherctx.arc(mx, my, weatherSummoned.event["range"], 0, 2 * Math.PI);
            weatherctx.fillStyle = "rgba(255,0,0,0.5)";
            weatherctx.fill();
        }
        this.weather.forEach(w=>{
            weatherctx.beginPath();
            weatherctx.arc(w["x"], w["y"], w["range"], 0, 2 * Math.PI);
            weatherctx.fillStyle = "rgba(84, 80, 80, 0.5)";
            weatherctx.fill();
            if(Math.sqrt(Math.pow(w["x"]-mx,2)+Math.pow(w["y"]-my,2)) <= w["range"]){
                weatherctx.fillStyle="rgb(255,255,255)";
                weatherctx.fillText(w["name"],w["x"],w["y"]);
            }
        });
        weatherctx.stroke();
        this.species.forEach(specie => {
            specie.draw(this.ctx)});
        this.ctx.drawImage(weatherCanvas, 0, 0);
    }

    cordToIndex(x,y){
        return 800*y + x;
    }

    indexToCord(index){
        let x = index % 800;
        let y = Math.floor(index/800);
        return [x,y];
    }
    loadMap(){
        this.mapCtx.clearRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);
        for(let i = 0; i < this.map.length; i+=1){
            switch(this.map[i]){                
                case 1: // Rainforest
                    this.mapCtx.fillStyle = "rgb(0, 153, 0)";
                    break;
                case 2: // Savanna
                    this.mapCtx.fillStyle = "rgb(128,128,0)";
                    break;
                case 3: //Desert
                    this.mapCtx.fillStyle = "rgb(255,255,64)";
                    break;
                case 4: //Temperate forest
                    this.mapCtx.fillStyle = "rgb(0, 255, 0)";
                    break;
                case 5: //Grasslands
                    this.mapCtx.fillStyle = "rgb(64,64,0)";
                    break;
                case 6: //Tundra
                    this.mapCtx.fillStyle = "rgb(64,255,255)";
                    break;
                case 7: //Taiga
                    this.mapCtx.fillStyle = "rgb(0,64,64)";
                    break;
                case 8: //Ice
                    this.mapCtx.fillStyle = "rgb(255,255,255)";
                    break;
                default: //Water
                    this.mapCtx.fillStyle = "rgb(28,163,236)";
            }
            let pos = this.indexToCord(i);
            this.mapCtx.fillRect(pos[0],pos[1], 1,1);
        }
    }

    getBiomeName (x,y){
        let index = this.cordToIndex(x,y);
        let r = "";
        switch(this.map[index]){                
            case 1: // Rainforest
                r="Rainforest";
                break;
            case 2: // Savanna
                r="Savanna";
                break;
            case 3: //Desert
                r="Desert";
                break;
            case 4: //Temperate forest
                r="Temperate Forest";
                break;
            case 5: //Grasslands
                r="Grasslands";
                break;
            case 6: //Tundra
                r="Tundra";
                break;
            case 7: //Taiga
                r="Taiga";
                break;
            case 8: //Ice
                r="Ice";
                break;
            default: //Water
                r="Water";
        }
        return r;
    }
    //Currently going to do average cause too lazy
    //NOTE: IN MILLIMITERS 
    raindataAt(index){
        let a = this.rainData[index];
        let num = 0;
        switch (a){
            case 1:
                num = (0+24)/2;
                break;
            case 2:
                num = (25+74)/2;
                break;
            case 3:
                num = (75+124)/2;
                break;
            case 4:
                num = (125+224)/2;
                break;
            case 5:
                num = (225+274)/2;
                break;
            case 6:
                num = (275+274)/2;
                break;
            case 7:
                num = (375+474)/2;
                break;
            case 8:
                num = (475+724)/2;
                break;
            case 9:
                num = (725+924)/2;
                break;
            case 10:
                num = (975+1474)/2;
                break;
            case 11:
                num = (1475+2474)/2;
                break;
            case 12:
                num = (2475+4974)/2;
                break;
            case 13:
                num = (4975+7474)/2;
                break;
            case 14:
                num = (7475+10004)/2;
                break;
            case 15:
                num = 12000; // idk arbitary number for something this high
                break;
            default:
                num = null
        }
        return num;
    }
    // Note: THings are calculated via weighted average
    getBiomeStatistics(index){
        let biome = this.map[index];
        let sunExp = 0;
        let surroundingTemp = 0;
        let soilWat = 0;
        let lat = Math.abs(this.indexToCord(index)[1]-205);
        let latWeightSun = 0.2
        let latWeightTemp = 0.2;
        let rainfallWeight = 0.8;
        
        switch (biome){
            case 1: // Rainforest
                sunExp = 1;
                surroundingTemp = 0.5;
                soilWat = 0.9;
                break;
            case 2: // Savanna
                sunExp = 0.8;
                surroundingTemp = 0.5;
                soilWat = 0.3;
                break;
            case 3: //Desert
                sunExp = 1;
                surroundingTemp = 0.9;
                soilWat = 0.2;
                break;
            case 4: //Temperate forest
                sunExp = 0.7;
                surroundingTemp = 0.5;
                soilWat = 0.8;
                break;
            case 5: //Grasslands
                sunExp = 0.8;
                surroundingTemp = 0.8;
                soilWat = 0.4;
                break;
            case 6: //Tundra
                sunExp = 0.3;
                surroundingTemp = 0.3;
                soilWat = 0.6;
                break;
            case 7: //Taiga
                sunExp = 0.2;
                surroundingTemp = 0.4;
                soilWat = 0.5;
                break;
            case 8: //Ice
                sunExp = 0.1;
                surroundingTemp = 0.1;
                soilWat = 0.2;
                break;
            case 9: //Water
                sunExp = 0.8;
                surroundingTemp = 0.8;
                soilWat = 0.4;
                break;
        } 
        sunExp = this.weightedAvg(sunExp,this.sunExpFunction(lat),1-latWeightSun,latWeightSun);
        surroundingTemp = this.weightedAvg(surroundingTemp,this.tempFunction(lat),1-latWeightTemp,latWeightTemp);
        //soilWat = this.weightedAvg(soilWat,this.waterFunction(this.raindataAt(index)),1-rainfallWeight,rainfallWeight);
        let windSpeed = 1; //this.windSpeedFunction(lat); 
        let wind = [(Math.random()-0.5) * 5 *windSpeed,(Math.random()-0.5) * 5 *windSpeed]
        let events = [];
        for(let i = 0; i < this.weather.length; i++){
            let wx = this.weather[i]["x"];
            let wy = this.weather[i]["y"];
            let pos = this.indexToCord(index);
            if(Math.sqrt(Math.pow(wx-pos[0],2)+Math.pow(wy-pos[1],2)) <= this.weather[i]["range"]){
                events.push(this.weather[i]);
                for(const attr in this.weather[i]["attributes"]){
                    let val = this.weather[i]["attributes"][attr];
                    eval(`${attr} += ${val};`);
                    if(attr != "windSpeed"){
                        eval(`if(${attr} < 0.001) ${attr} = 0.001;`);//Note that it shouldnt be 0               
                        eval(`if(${attr} > 1) ${attr} = 1;`);     
                    }               
                }
                if(this.weather[i]["type"] == "wind"){
                    let theta = Math.atan(1/((pos[1]-wy)/(pos[0]-wx)));
                    wind = [Math.cos(theta)*windSpeed, Math.sin(theta)*windSpeed];
                }
            }
        }
        return {
            "sunExposure":sunExp,
            "surroundingTemp":surroundingTemp *100,
            "soilWater":soilWat,
            "windx": wind[0],
            "windy": wind[1],
            "weather": events,
        };
    }

    weightedAvg(v1,v2,w1,w2){
        return (v1*w1 + v2*w2)/(w1+w2)
    }

    sunExpFunction(lat){
        return 22.77778/(lat+22.77778);
    }

    tempFunction(lat){
        return (24.6)/(lat + 41);
    }

    waterFunction(level){
        return (0.0000750751*level)+0.0990991;
    }

    windSpeedFunction(lat){
        return Math.sin(0.00766*lat);
    }
}