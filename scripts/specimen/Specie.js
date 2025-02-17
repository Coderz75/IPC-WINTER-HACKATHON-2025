"use strict";


function sigmoid(x){
	return 1 / (1 + Math.E ** -x)
}

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
		for (const sM of this.seedMembers){
			mapCanvasContext.save();
			mapCanvasContext.beginPath();
			mapCanvasContext.ellipse(sM.pos.x, sM.pos.y, 2, 2, 0, 0, Math.PI*2);
			mapCanvasContext.fillStyle = sM.color;
			mapCanvasContext.strokeStyle = "brown";
			mapCanvasContext.fill(); mapCanvasContext.stroke();
			mapCanvasContext.closePath();
			mapCanvasContext.restore();
		}
	}
	static tick(globalTime){
		this.activeMembers.forEach(member => member.tick(globalTime));
	}
    constructor(parentGenome){
			this.genome = {
			  waterStorage: 0.5,
			  waterAffinity: 0.5,
			  anchorage: 0.5,
			  competitiveness: 0.5,
			  photosynthesisRate: 0.5,
			  heatResistance : 0.5, 
			  reproduction : 0.5, 
			};
			Object.assign(this.genome, parentGenome);
			
			this.water = 50; //affects actual anchorage, competitiveness, heatResistance, photosynthesisRate, dies when it reaches 0
			this.energy = 50; //affects growth capacity, competitiveness, waterAffinity dies when it reaches 0
			this.temperature = 50; //affects competitveness, photosynthesisRate, dies when it reaches 0 or 100
			this.percentMaturity = 0;
			this.seedDev = 0;
			this.randomSeed = Math.random();
			this.isActive = true; //change to start at false later. When this switches to true, remove the reference from the seed list and push it to the active list
			this.isAlive = true; //set this to false when it dies, then remove reference from the list
			
			{
				const this_ = this;
				this.attributes = {
					water : function(){return `${Math.round(this_.water)}%`},
					energy : function(){return `${Math.round(this_.energy)}%`},
					maturity : function(){return `${Math.round(this_.percentMaturity)}%`},
					temperature : function(){return `${Math.round(this_.temperature)}%`},
					"seed development" : function(){return `${this_.seedDev}%`},
				}; 
			}

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
    tick(globalTime){
		const tempDifference = 50 - this.temperature;
		const waterDifference = 100 - this.water; 
		const energyDifference = 100 - this.energy;
		const sunExposure = 0.5; // change this according to weather and latitude later
		const surroundingTemp = 50;
		const soilWater = 0.5; 
		
		//respire- using water and cooling self down
		const respiration = sigmoid(tempDifference/20) * this.water / 100;
		//draw water, draw minerals with the water
		const capillaryAction = Math.sqrt(waterDifference) / 5;
		//Be blown in the wind
		//Photosynthesis- making energy in the sun
		const photosynthesis = respiration * this.water / 100 * sunExposure * this.genome.photosynthesisRate;
		//Growth- using water and energy
		const growth = sigmoid(-energyDifference/10) * (this.percentMaturity < 100);

		this.water -= respiration / this.genome.waterStorage;
		this.temperature -= respiration * this.genome.heatResistance;
		this.temperature = (this.temperature * 0.95 + surroundingTemp * 0.05);
		this.water += capillaryAction * this.genome.waterAffinity * soilWater / this.genome.waterStorage;
		this.water -= photosynthesis / this.genome.waterStorage;
		this.energy += photosynthesis;
		this.energy -= growth;
		this.percentMaturity += growth / 10;
		//Reproduce- growing spores (sexual reproduction too complicated)
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
testSubject.pos= {x: 62, y:145};
