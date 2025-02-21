"use strict";

const copy = (obj) =>{
	return JSON.parse(JSON.stringify(obj))
}


function sigmoid(x){
	return 1 / (1 + Math.E ** -x);
}

class PlantSpecies {
	constructor(originalGenome){
		this.activeMembers = [];
		this.seedMembers = [];
		this.name = "";
		this.gameMap = null;//make sure to set into a reference of gameMap
		this.raw_genome = originalGenome;
		this.genome = DNA.convert(copy(originalGenome));
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
	tick(){
		this.activeMembers.forEach(member => member.tick(this.gameMap));
		this.seedMembers.forEach(member => member.dormant(this.gameMap));
		{
			let activeMembersNext = [];
			let seedMembersNext = [];
			this.activeMembers.forEach(member => {if (member.isAlive) activeMembersNext.push(member)});
			this.seedMembers.forEach(member => {
				if (member.isActive) {
					activeMembersNext.push(member); 
					member.competitionQuadrat = this.gameMap.specieTiles[Math.round(member.pos.x/10) + Math.round(member.pos.y/10) * 80];
					member.competitionQuadrat.push(member);
				}
				else if (member.isAlive) seedMembersNext.push(member);
			});
			this.activeMembers = activeMembersNext;
			this.seedMembers = seedMembersNext;
		}
	}
	addPlant(xpos, ypos){
		const plant = new Plant(this.raw_genome, this);
		plant.isActive = true;
		plant.pos = {x: xpos, y: ypos};
		this.activeMembers.push(plant);
		plant.competitionQuadrat = this.gameMap.specieTiles[Math.round(xpos/10) + Math.round(ypos/10) * 80];
		plant.competitionQuadrat.push(plant);
	}
	addSeed(parentGenome, energy, xpos, ypos){
		const seed = new Plant(parentGenome, this);
		seed.isActive = false;
		seed.pos = {x: xpos, y: ypos};
		seed.energy = energy;
		this.seedMembers.push(seed);
		seed.height = 5;
	}
}

class Plant { 
    constructor(parentGenome, species){
			this.species = species; //reference to species

			this.raw_genome = parentGenome;
			this.genome = DNA.convert(copy(parentGenome));

			this.competitionQuadrat = null;

			for (const key in this.genome){ //prevents divide by 0 errors
				if (this.genome[key] == 0)
					this.genome[key] = 0.001;
			}
			
			this.water = 50; //affects actual anchorage, competitiveness, heatResistance, photosynthesisRate, dies when it reaches 0
			this.energy = 50; //affects growth capacity, competitiveness, waterAffinity dies when it reaches 0
			this.temperature = 50; //affects competitveness, photosynthesisRate, dies when it reaches 0 or 100
			this.percentMaturity = 0;
			this.seedDev = 0;
			this.randomSeed = new Date().getTime();
			this.isActive = false; 
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
					age : function(){return `${Math.round(this_.age * 0.034)} s`},
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
	
    tick(gameMap){
		const timeMultiplier = 5;

		const tempDifference = 50 - this.temperature;
		const waterDifference = 100 - this.water; 
		const energyDifference = 100 - this.energy;

		this.environment = gameMap.getBiomeStatistics(gameMap.cordToIndex(Math.round(this.pos.x), Math.round(this.pos.y)));

		const AgeMalus = 1; //+ Math.max(0, (this.age - 13000 * this.genome.size) * 0.02);
		
		let competitionAmount = 0;
		for (const competitor of this.competitionQuadrat){
			if (!competitor.isAlive) continue;
			if (competitor == this) continue;
			competitionAmount += competitor.genome.competitiveness * competitor.percentMaturity;
		}
		competitionAmount = Math.max(0, competitionAmount - this.genome.competitiveness * this.percentMaturity);
		const competitionMalus = (1-Math.tanh(competitionAmount));
		this.environment.competitionMalus = competitionMalus;
		this.environment.sunExposure *= competitionMalus;
		this.environment.soilWater *= competitionMalus;
		this.environment.biomeName = gameMap.getBiomeName(Math.round(this.pos.x),Math.round(this.pos.y));

		
		//respire- using water and cooling self down
		const respiration = sigmoid(tempDifference/20) * this.water / 100;
		const heating = (tempDifference)**2/2500 * (tempDifference > 0);
		//draw water, draw minerals with the water
		const capillaryAction = Math.sqrt(waterDifference) / 5;
		//Be blown in the wind
		//Photosynthesis- making energy in the sun
		const photosynthesis = respiration * this.water / 100 * this.environment.sunExposure * this.genome.photosynthesisRate;
		//Growth- using water and energy
		const growth = sigmoid(-energyDifference/10);
		
		

		this.water -= respiration / this.genome.waterStorage * timeMultiplier;
		this.temperature -= respiration * this.genome.heatResistance / AgeMalus * timeMultiplier;
		this.temperature += heating * this.genome.heatResistance;
		this.energy -= heating;
		const heatExchangeRate = 0.1 * timeMultiplier * this.genome.photosynthesisRate;
		this.temperature = (this.temperature + this.environment.surroundingTemp * heatExchangeRate) / (1 + heatExchangeRate);
		this.temperature += this.environment.sunExposure * this.genome.photosynthesisRate * timeMultiplier; 
		this.water += capillaryAction * this.genome.waterAffinity * this.environment.soilWater / this.genome.waterStorage / AgeMalus * timeMultiplier;
		this.water -= photosynthesis / this.genome.waterStorage * timeMultiplier;
		this.energy += photosynthesis / AgeMalus * timeMultiplier;
		this.energy -= growth * timeMultiplier;
		if (this.percentMaturity < 100)
			this.percentMaturity += growth / (0.5 + this.genome.size) * timeMultiplier;
		else 
			this.seedDev += growth / (0.5 + this.genome.seedCount * this.genome.seedSize) * timeMultiplier;

		//Reproduce- growing spores (sexual reproduction too complicated) (You can add mutation here if you want)
		if (this.seedDev >= 100){
			for (let i = 0; i < this.genome.seedCount; i++){
				let next = copy(this.raw_genome)

				for (let key of Object.keys(next)){
					//console.log(key, next[key].scalar)
					if (next[key].scalar){
						continue
					}

					if (random(0, 50) < 3){
						next[key] = Array.from(next[key])
						let type = random(0, 3)
						let location = random(4, next[key].length - 8)
						let base = random(0, 4)
						if (type === MutationType.PointInsertion){ // insertion
							next[key].splice(location, 0, DNA.codons[base])
						}else if (type === MutationType.PointDeletion){ // deletion
							next[key].splice(location, 1)
						}else{ // substitution
							next[key][location] = DNA.codons[base]
						}
						next[key] = next[key].join("")

						alerts.push(new Alert("Mutation Occured"))

					}

				}

				const angle = Math.random() * Math.PI * 2;
				this.species.addSeed(next, this.genome.seedSize * 100, this.pos.x + Math.cos(angle) * 6, this.pos.y + Math.sin(angle) * 6)
			}
			this.seedDev = 0;
		}
		//aging and Death
		this.age += timeMultiplier;

		if (this.temperature >= 80 || this.temperature <= 20 || this.water <= 5 || this.energy <= 1){
			this.isAlive = false;
			console.log(this.environment.surroundingTemp);
		}		
	}
	dormant(gameMap){
		//each seed lasts for 30 seconds = 30/0.015 = 2000 ticks with a size of 1. 
		//percentMaturity acts as a timer
		this.energy -= 0.05;
		if (this.energy <= 0){
			this.isAlive = false;
			return;
		}
		this.height -= this.genome.seedSize**2;

		//blown about by the wind
		this.environment = gameMap.getBiomeStatistics(gameMap.cordToIndex(this.pos.x,this.pos.y));
		this.vel.x = (this.vel.x + this.environment.windx) / (2);
		this.vel.y = (this.vel.y + this.environment.windy) / (2);

		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;

		this.pos.x %= 800;
		this.pos.y %= 410;


		if (gameMap.map[gameMap.cordToIndex(Math.round(this.pos.x), Math.round(this.pos.y))] != 9 && (Math.abs(this.vel.x) <= 0.5 && Math.abs(this.vel.y) <= 0.5 || this.height <= 0)){
			//germinate
			this.isActive = true;
			this.water = 50;
			this.temperature = 50;
			this.percentMaturity = 0;
		}

	}
}

const palms = new PlantSpecies({
	waterStorage: DNA.generate_sequence(0.7, 100),
	waterAffinity: DNA.generate_sequence(0.7, 100),
	heatResistance: DNA.generate_sequence(0.8, 100),
	anchorage: DNA.generate_sequence(0.9, 100),
	competitiveness: DNA.generate_sequence(0.9, 100),
	photosynthesisRate: DNA.generate_sequence(0.5, 100),
	size: DNA.generate_sequence(0.6, 100),
	seedSize : DNA.generate_sequence(1, 100),
	seedCount : DNAScalar(1),
});

const pines = new PlantSpecies({
	waterStorage: DNA.generate_sequence(0.4, 100),
	waterAffinity: DNA.generate_sequence(0.6, 100),
	heatResistance: DNA.generate_sequence(0.2, 100),
	anchorage: DNA.generate_sequence(0.3, 100),
	competitiveness: DNA.generate_sequence(0.2, 100),
	photosynthesisRate: DNA.generate_sequence(0.7, 100),
	size: DNA.generate_sequence(0.7, 100),
	seedSize : DNA.generate_sequence(0.1, 100),
	seedCount : DNAScalar(4),
});