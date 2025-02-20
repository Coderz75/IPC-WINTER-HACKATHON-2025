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
		this.raw_genome = originalGenome
		this.genome = DNA.convert(originalGenome);
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

			this.raw_genome = parentGenome
			this.genome = DNA.convert(parentGenome);

			console.log(this.genome, this.raw_genome);

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
    tick(gameMap){
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

		//console.log(`${respiration}, ${capillaryAction}, ${photosynthesis}, ${growth}`);

		this.water -= respiration / this.genome.waterStorage;
		this.temperature -= respiration * this.genome.heatResistance / AgeMalus;
		this.temperature = (this.temperature * 0.95 + surroundingTemp * 0.05);
		this.water += capillaryAction * this.genome.waterAffinity * soilWater / this.genome.waterStorage / AgeMalus;
		this.water -= photosynthesis / this.genome.waterStorage;
		this.energy += photosynthesis / AgeMalus;

		this.energy -= growth;
		if (this.percentMaturity < 100)
			this.percentMaturity += growth / (0.5 + this.genome.size) * 5;
		else 
			this.seedDev += growth / (0.5 + this.genome.seedCount * this.genome.seedSize) * 10;

		//Reproduce- growing spores (sexual reproduction too complicated) (You can add mutation here if you want)
		if (this.seedDev >= 100){
			for (let i = 0; i < this.genome.seedCount; i++){
				let next = structuredClone(this.raw_genome)

				for (let key of Object.keys(next)){
					if (random(0, 10) < 3){
						next[key] = Array.from(next[key])
						console.info("MUTATION")
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
					}

				}

				const offspring = new Plant(next, this.species);
				offspring.isActive = false;
				const angle = Math.random() * Math.PI * 2;
				offspring.pos = {x: this.pos.x + Math.cos(angle) * 6, y: this.pos.y + Math.sin(angle) * 6};
				offspring.energy = this.genome.seedSize * 100;
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
	dormant(gameMap){
		//each seed lasts for 30 seconds = 30/0.015 = 2000 ticks with a size of 1. 
		//percentMaturity acts as a timer
		this.energy -= 0.05;
		if (this.energy <= 0){
			this.isAlive = false;
			return;
		}
		if (gameMap.map[gameMap.cordToIndex(this.pos.x, this.pos.y)] != 9 && this.vel.x == 0 && this.vel.y == 0){
			//germinate
			this.isActive = true;
			this.water = 50;
			this.temperature = 50;
		}

	}
}

const palms = new PlantSpecies({
	waterStorage: DNA.generate_sequence(0.7, 100),
	waterAffinity: DNA.generate_sequence(0.3, 100),
	heatResistance: DNA.generate_sequence(0.8, 100),
	anchorage: DNA.generate_sequence(0.9, 100),
	competitiveness: DNA.generate_sequence(0.9, 100),
	photosynthesisRate: DNA.generate_sequence(0.2, 100),
	size: DNA.generate_sequence(0.8, 100),
	seedSize : DNA.generate_sequence(1, 100),
	seedCount : new DNAScalar(2),
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
	seedCount : new DNAScalar(8),
});

const testSubject = new Plant({
	waterStorage: DNA.generate_sequence(0.7, 100),
	waterAffinity: DNA.generate_sequence(0.3, 100),
	heatResistance: DNA.generate_sequence(0.8, 100),
	anchorage: DNA.generate_sequence(0.9, 100),
	competitiveness: DNA.generate_sequence(0.9, 100),
	photosynthesisRate: DNA.generate_sequence(0.2, 100),
	size: DNA.generate_sequence(0.8, 100),
	seedSize : DNA.generate_sequence(0.8, 100),
	seedCount : new DNAScalar(2),
}, palms);
palms.activeMembers.push(testSubject);

pines.activeMembers.push(new Plant({
	waterStorage: DNA.generate_sequence(0.4, 100),
	waterAffinity: DNA.generate_sequence(0.6, 100),
	heatResistance: DNA.generate_sequence(0.2, 100),
	anchorage: DNA.generate_sequence(0.3, 100),
	competitiveness: DNA.generate_sequence(0.2, 100),
	photosynthesisRate: DNA.generate_sequence(0.7, 100),
	size: DNA.generate_sequence(0.7, 100),
	seedSize : DNA.generate_sequence(0.1, 100),
	seedCount : new DNAScalar(8),
}, pines));

pines.activeMembers[0].pos = {x: 310, y: 100};
testSubject.pos = {x: 62, y: 145};