"use strict";

class Plant { // Specie default class: Any subtypes of species should extend this arguably
	static tiles = []; //we could remove this if it's unnecessary
	static activeMembers = []; //contains references to member objects that have germinated
	static seedMembers = []; //contains referecnes to member objects that are seeds
	static name = "";
	static id = 0;
	
	static draw(mapCanvasContext){ //draws species members
		for (const aM of this.activeMembers){
			mapCanvasContext.save();
			mapCanvasContext.beginPath();
			mapCanvasContext.ellipse(aM.pos.x, aM.pos.y, 3, 3, 0, 0, Math.PI*2);
			mapCanvasContext.fillStyle = aM.color;
			mapCanvasContext.strokeStyle = "#00FF00";
			mapCanvasContext.fill(); mapCanvasContext.stroke();
			mapCanvasContext.closePath();
			mapCanvasContext.restore();
		}
		for (const aM of this.seedMembers){
			mapCanvasContext.save();
			mapCanvasContext.beginPath();
			mapCanvasContext.ellipse(aM.pos.x, aM.pos.y, 2, 2, 0, 0, Math.PI*2);
			mapCanvasContext.fillStyle = aM.color;
			mapCanvasContext.strokeStyle = "brown";
			mapCanvasContext.fill(); mapCanvasContext.stroke();
			mapCanvasContext.closePath();
			mapCanvasContext.restore();
		}
	}
	static tick(){
		this.activeMembers.forEach(member => member.tick());
	}
    constructor(parentGenome){
			this.genome = {
			  waterStorage: 0.5,
			  waterAffinity: 0.5,
			  anchorage: 0.5,
			  competitiveness: 0.5,
			  photosynthesisRate: 0.5,
			};
			Object.assign(parentGenome, this.genome);
			this.water = 0;
			this.maxWater = 0;
			this.energy = 0;
			this.percentMaturity = 0;
			this.randomSeed = Math.random();
	
			let percentWhole = 0;
			for (const val in this.genome) percentWhole += this.genome[val];
			percentWhole /= 255;
				
			this.color = `rgb(${(this.genome.competitiveness + this.genome.anchorage)/percentWhole},${(this.genome.photosynthesisRate+this.genome.waterAffinity+this.genome.waterStorage)/percentWhole}, ${(this.genome.waterStorage)/percentWhole})`;
				
			this.pos = { //Coordinates on the map
				x : 0,
				y : 0,
			};
			
			this.vel = { //Velocity vector; used for seeds
				x : 0,
				y : 0,
			};
			
    }
    tick(){
			
		}
}

class Palm extends Plant {
	static name = "Palm";
	static id = 1;
	constructor(parentGenome){
		super(parentGenome);
	}
}

const testSubject = new Palm({
															 waterStorage: 0.7,
															 waterAffinity: 0.3,
															 anchorage: 0.9,
															 competitiveness: 0.9,
															 photosynthesisRate: 0.2,
														 }); Palm.activeMembers.push(testSubject);
testSubject.pos= {x: 63, y:145};
