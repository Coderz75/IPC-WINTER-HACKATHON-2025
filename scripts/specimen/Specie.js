"use strict";


function sigmoid(x){
	return 1 / (1 + Math.E ** -x);
}

class PlantSpecies {
	constructor(originalGenome){
		this.activeMembers = [];
		this.seedMembers = [];
		this.name = "";
		this.gameMap = null;//make sure to set into a reference of gameMap
		this.genome = originalGenome;
	}
	draw(mapCanvasContext){ //draws species members
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
	tick(globalTime, gameMap){
		this.activeMembers.forEach(member => member.tick(globalTime, gameMap));
		this.seedMembers.forEach(member => member.dormant(globalTime, gameMap));
		{
			let activeMembersNext = [];
			let seedMembersNext = [];
			this.activeMembers.forEach(member => {if (member.isAlive) activeMembersNext.push(member)});
			this.seedMembers.forEach(member => {
				if (member.isActive) activeMembersNext.push(member);
				else if (member.isAlive) seedMembersNext.push(member);
			});
			this.activeMembers = activeMembersNext;
			this.seedMembers = seedMembersNext;
		}
	}
}

class Plant { 
    constructor(parentGenome, species){
			this.species = species; //reference to species
			this.genome = {
			  waterStorage: 0.5,
			  waterAffinity: 0.5,
			  anchorage: 0.5,
			  competitiveness: 0.5,
			  size: 0.5, 
			  photosynthesisRate: 0.5,
			  heatResistance : 0.5, 
			  seedSize : 0.5,
			  seedCount : 2,  
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
			this.age = 0;
			
			{
				const this_ = this;
				this.attributes = {
					water : function(){return `${Math.round(this_.water)}%`},
					energy : function(){return `${Math.round(this_.energy)}%`},
					maturity : function(){return `${Math.round(this_.percentMaturity)}%`},
					temperature : function(){return `${Math.round(this_.temperature)}%`},
					"seed development" : function(){return `${Math.round(this_.seedDev)}%`},
					age : function(){return `${Math.round(this_.age * 0.015)} s`},
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
    tick(globalTime, gameMap){
		const tempDifference = 50 - this.temperature;
		const waterDifference = 100 - this.water; 
		const energyDifference = 100 - this.energy;
		const sunExposure = 0.5; // change this according to weather and latitude later
		const surroundingTemp = 50; //change this according to weather and latitude and biome
		const soilWater = 0.5;  //change this according to weather and biome
		const AgeMalus = 1 + Math.max(0, (this.age - 10000 * this.genome.size) * 0.02);
		
		//respire- using water and cooling self down
		const respiration = sigmoid(tempDifference/20) * this.water / 100;
		//draw water, draw minerals with the water
		const capillaryAction = Math.sqrt(waterDifference) / 5;
		//Be blown in the wind
		//Photosynthesis- making energy in the sun
		const photosynthesis = respiration * this.water / 100 * sunExposure * this.genome.photosynthesisRate;
		//Growth- using water and energy
		const growth = sigmoid(-energyDifference/10);

		this.water -= respiration / this.genome.waterStorage;
		this.temperature -= respiration * this.genome.heatResistance / AgeMalus;
		this.temperature = (this.temperature * 0.95 + surroundingTemp * 0.05);
		this.water += capillaryAction * this.genome.waterAffinity * soilWater / this.genome.waterStorage / AgeMalus;
		this.water -= photosynthesis / this.genome.waterStorage;
		this.energy += photosynthesis / AgeMalus;

		this.energy -= growth;
		if (this.percentMaturity < 100)
			this.percentMaturity += growth / (0.5 + this.genome.size) * 10;
		else 
			this.seedDev += growth / (0.5 + this.genome.seedCount * this.genome.seedSize) * 20 ;

		//Reproduce- growing spores (sexual reproduction too complicated) (You can add mutation here if you want)
		if (this.seedDev >= 100){
			for (let i = 0; i < this.genome.seedCount; i++){
				const offspring = new Plant(this.genome, this.species);
				offspring.isActive = false;
				const angle = Math.random() * Math.PI * 2;
				offspring.pos = {x: this.pos.x + Math.cos(angle) * 6, y: this.pos.y + Math.sin(angle) * 6};
				this.species.seedMembers.push(offspring);
			}
			this.seedDev = 0;
		}
		//aging and Death
		this.age++;

		if (this.temperature >= 95 || this.temperature <= 5 || this.water <= 5 || this.energy <= 1){
			this.isAlive = false;
		}		
	}
	dormant(globalTime, gameMap){
		//each seed lasts for 30 seconds = 30/0.015 = 2000 ticks with a size of 1. 
		//percentMaturity acts as a timer
		this.percentMaturity++;
		if (this.percentMaturity >= 2000 * this.genome.seedSize){
			this.isAlive = false;
			return;
		}

	}
}

const palms = new PlantSpecies({
	waterStorage: 0.7,
	waterAffinity: 0.3,
	anchorage: 0.9,
	competitiveness: 0.9,
	photosynthesisRate: 0.2,
	size: 0.8,
	seedSize : 0.8,
	seedCount : 2,
});

const pines = new PlantSpecies({
	waterStorage: 0.4,
	waterAffinity: 0.5,
	anchorage: 0.3,
	competitiveness: 0.4,
	photosynthesisRate: 0.8,
	size: 0.7,
	seedSize : 0.2, 
	seedCount : 8,
});

palms.activeMembers.push(new Plant({
	waterStorage: 0.7,
	waterAffinity: 0.3,
	anchorage: 0.9,
	competitiveness: 0.9,
	photosynthesisRate: 0.2,
	size: 0.8,
	seedSize : 0.8,
	seedCount : 2,
}, palms));

pines.activeMembers.push(new Plant({
	waterStorage: 0.4,
	waterAffinity: 0.6,
	anchorage: 0.7,
	competitiveness: 0.6,
	photosynthesisRate: 0.8,
	size: 0.7,
	seedSize : 0.2, 
	seedCount : 8,
}, palms));

palms.activeMembers[0].pos = {x: 62, y:145};
pines.activeMembers[0].pos = {x: 310, y:100};

/*
Pine genome: 
{
	waterStorage: 0.4,
	waterAffinity: 0.6,
	anchorage: 0.7,
	competitiveness: 0.6,
	photosynthesisRate: 0.8,
	size: 0.7,
	seedSize : 0.2, 
}


*/