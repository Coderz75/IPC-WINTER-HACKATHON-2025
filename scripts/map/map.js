"use strict";
// Everything pertaining to map generation, rendering
//Assuming 800*410 map
class GameMap{
    constructor(canvas){
        //init
        this.canvas = canvas
        this.ctx = this.canvas.getContext("2d");
        this.map = window.mapData;
        console.log(this.map)
        this.specieTiles = new Array(800*410).fill([]);
        this.species = []
    }
    tick(species){
        // tick
        this.species = 0
        let newTiles = new Array(800*410).fill([]);
        species.forEach(specie => {
            specie.tiles.forEach(tile =>{
                forEach[tile].push(specie.id)
            })
        });
        this.render();
    }
    render(){
        //render map.
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for(let i = 0; i < this.map.length; i+=5){
            switch(this.map[i]){                
                case 1: // Rainforest
                    this.ctx.fillStyle = "rgb(0,64,0)";
                    break;
                case 2: // Savanna
                    this.ctx.fillStyle = "rgb(128,128,0)";
                    break;
                case 3: //Desert
                    this.ctx.fillStyle = "rgb(255,255,64)";
                    break;
                case 4: //Temperate forest
                    this.ctx.fillStyle = "rgb(0,192,0)";
                    break;
                case 5: //Grasslands
                    this.ctx.fillStyle = "rgb(64,64,0)";
                    break;
                case 6: //Tundra
                    this.ctx.fillStyle = "rgb(64,255,255)";
                    break;
                case 7: //Taiga
                    this.ctx.fillStyle = "rgb(0,64,64)";
                    break;
                case 8: //Ice
                    this.ctx.fillStyle = "rgb(255,255,255)";
                    break;
                default: //Water
                    this.ctx.fillStyle = "rgb(28,163,236)";
            }
            let pos = this.indexToCord(i);
            this.ctx.fillRect(pos[0],pos[1], 5,1);
        }
    }

    cordToIndex(x,y){
        return 800*y + x;
    }

    indexToCord(index){
        let x = index % 800;
        let y = Math.floor(index/800);
        return [x,y]
    }
}