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
        species.forEach(specie => {
            specie.tiles.forEach(tile =>{
                this.specieTiles[tile].push(specie.id)
            })
        });
        this.render();
    }
    render(){
        //render map.
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for(let i = 0; i < this.map.length; i+=5){
            if (this.map[i] ==1){ // Rainforest
                this.ctx.fillStyle = "rgb(0,64,0)";

            } else if (this.map[i] ==2){ // Savanna
                this.ctx.fillStyle = "rgb(128,128,0)";

            } else if (this.map[i] ==3){ //Desert
                this.ctx.fillStyle = "rgb(255,255,64)";

            } else if (this.map[i] ==4){ //Temperate forest
                this.ctx.fillStyle = "rgb(0,192,0)";

            } else if (this.map[i] ==5){ //Grasslands
                this.ctx.fillStyle = "rgb(64,64,0)";

            } else if (this.map[i] ==6){ //Tundra
                this.ctx.fillStyle = "rgb(64,255,255)";

            } else if (this.map[i] ==7){ //Taiga
                this.ctx.fillStyle = "rgb(0,64,64)";

            } else if (this.map[i] ==8){ //Ice
                this.ctx.fillStyle = "rgb(255,255,255)";

            } else { //Water
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