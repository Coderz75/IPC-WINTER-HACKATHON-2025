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
        console.log(this.map)
        this.specieTiles = new Array(800*410).fill([]);
        this.species = []; //stores the classes for the plant species

        this.loadMap(); 
    }
    addSpecies(specie){
        this.species.push(specie);
        specie.gameMap = this;
    }
    tick(){
        // tick
        this.species.forEach(specie => specie.tick());
        this.render();
    }
    render(){
        //render map.
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.mapCanvas, 0, 0);
        this.species.forEach(specie => {
            specie.draw(this.ctx)});
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
                    this.mapCtx.fillStyle = "rgb(0,64,0)";
                    break;
                case 2: // Savanna
                    this.mapCtx.fillStyle = "rgb(128,128,0)";
                    break;
                case 3: //Desert
                    this.mapCtx.fillStyle = "rgb(255,255,64)";
                    break;
                case 4: //Temperate forest
                    this.mapCtx.fillStyle = "rgb(0,192,0)";
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
}