"use strict";

const copy = (obj) =>{
	return JSON.parse(JSON.stringify(obj))
}


function sigmoid(x){
	return 1 / (1 + Math.E ** -x);
}

let numMutations = 1

let MUTATIONRATE = 300; // 1 in MutationRate

function dataURItoBlob(dataURI) {
	// convert base64 to raw binary data held in a string
	// doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
	var byteString = atob(dataURI.split(',')[1]);

	// separate out the mime component
	var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

	// write the bytes of the string to an ArrayBuffer
	var ab = new ArrayBuffer(byteString.length);

	// create a view into the buffer
	var ia = new Uint8Array(ab);

	// set the bytes of the buffer to the correct values
	for (var i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}

	// write the ArrayBuffer to a blob, and you're done
	var blob = new Blob([ab], {type: mimeString});
	return blob;

}

var specieColors = {}
var specieNum = 0;
class PlantSpecies {
	constructor(originalGenome, parent){
		this.activeMembers = [];
		this.seedMembers = [];
		this.name = "";
		this.gameMap = null;//make sure to set into a reference of gameMap
		this.raw_genome = originalGenome;
		this.genome = DNA.convert(copy(originalGenome));
		this.parent = parent;
		this.drawn = false;
		this.extinct = false;
		this.id = specieNum
		specieColors[specieNum] = `rgb(${Math.floor(Math.random() * 155)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 155)})` // Values should lean to green side
		specieNum += 1;
	}

	connect_to_parent(){
		let date = new Date()
		let str = `${date.getHours()}:${date.getMinutes() < 10 ? 0 : ""}${date.getMinutes()}:${date.getSeconds() < 10 ? 0 : ""}${date.getSeconds()}`
		this.me = {
			text: {name: this.name, title: "Evolved at " + str},
			image: this.image,
			children: []
		}

		//{
		// 				text: { name:  str},
		// 				HTMLclass: "marker",
		// 				children: [this.me]
		// 			}
		this.parent.children.push(
			this.me
		)

		this.node = this.parent.children.at(-1)
		redrawTree()
		setTimeout(redrawTree, 1000)
	}

	drawAndAdd(member){
		drawSpecimen(document.getElementById("whiteboard"), member, true, true)
		this.image = URL.createObjectURL(dataURItoBlob(document.getElementById("whiteboard").toDataURL()))
		console.log(this.image)
	}

	draw(mapCanvasContext){ //draws species members
		for (const aM of this.activeMembers){
			mapCanvasContext.save();
			//draw competitive tile
			mapCanvasContext.beginPath();
			//Math.floor(member.pos.x/10) + Math.floor(member.pos.y/10) * 80
			mapCanvasContext.rect(Math.floor(aM.pos.x/10)*10, Math.floor(aM.pos.y/10)*10, 10, 10);
			let c = aM.color.replace("rgb(","rgba(");
			c = c.replace(")",",0.6)");
			mapCanvasContext.fillStyle = c;
			mapCanvasContext.fill();
			mapCanvasContext.closePath();

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
	compareGemomes(genome1, genome2){
		let variance = 0;
		for (const gene in genome1){
			variance += Math.abs(genome1[gene] - genome2[gene]);
		}
		return variance > 1;
	}
	tick(){
		if (!this.drawn && this.activeMembers.length){
			if (this.activeMembers.length){
				this.drawAndAdd(this.activeMembers[0])
			}else{
				this.drawAndAdd(this.seedMembers[0])
			}
			this.drawn = true
		}
		if (!this.name && this.drawn){
			this.name = generate_name()
			this.connect_to_parent(this.parent)
		}
		this.activeMembers.forEach(member => member.tick(this.gameMap));
		this.seedMembers.forEach(member => member.dormant(this.gameMap));
		{
			let activeMembersNext = [];
			let seedMembersNext = [];
			this.activeMembers.forEach(member => {if (member.isAlive) activeMembersNext.push(member)});
			this.seedMembers.forEach(member => {
				if (this.compareGemomes(this.genome, member.genome)){
					const newSpecies = new PlantSpecies(member.raw_genome, this.node);
					this.gameMap.addSpecies(newSpecies);
					newSpecies.seedMembers.push(member);

					if (!newSpecies.drawn){
						newSpecies.drawAndAdd(newSpecies.seedMembers[0])
						newSpecies.drawn = true
					}
					newSpecies.name = generate_name()
					newSpecies.connect_to_parent(newSpecies.parent)

					alerts.push(new Alert("Speciation Occured", "A new species has emerged.", "<i class='fa-solid fa-tree'></i>"));
				}
				else if (member.isActive) {
					member.competitionQuadrat = this.gameMap.specieTiles[Math.floor(member.pos.x/10) + Math.floor(member.pos.y/10) * 80];
					if (member.competitionQuadrat != undefined){
						member.competitionQuadrat.push(member);
						activeMembersNext.push(member); 
					}
					
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

		if (!this.drawn){
			this.drawAndAdd(this.activeMembers[0])
			this.drawn = true
		}
		if (!this.name && this.drawn){
			this.name = generate_name()
			this.connect_to_parent(this.parent)
		}

	}
	addSeed(parentGenome, energy, xpos, ypos){
		const seed = new Plant(parentGenome, this);
		seed.isActive = false;
		seed.pos = {x: xpos, y: ypos};
		seed.energy = energy;
		this.seedMembers.push(seed);
		seed.height = 20;

		if (!this.drawn){
			this.drawAndAdd(this.seedMembers[0])
			this.drawn = true
		}
		if (!this.name && this.drawn){
			this.name = generate_name()
			this.connect_to_parent(this.parent)
		}
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
			this.bioAge = 0;
			this.rooted = true;			
			{
				const this_ = this;
				this.attributes = {
					water : function(){return `${Math.round(this_.water)}%`},
					energy : function(){return `${Math.round(this_.energy)}%`},
					maturity : function(){return `${Math.round(this_.percentMaturity)}%`},
					temperature : function(){return `${Math.round(this_.temperature)}%`},
					"seed development" : function(){return `${Math.round(this_.seedDev)}%`},
					age : function(){return `${Math.round(this_.age * 0.034)} s`},
					"biological age" : function(){return `${Math.round(this_.bioAge)}/${Math.round(1000 * this_.genome.size)}`},
				}; 
			}

			let percentWhole = 0;
			for (const val in this.genome) percentWhole += this.genome[val];
			percentWhole /= 255;
				
			this.color = specieColors[species.id];
				
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

		const AgeMalus = 1 + Math.max(0, (this.bioAge - 1000 * this.genome.size) * 0.2);
		
		let competitionAmount = 0;
		for (const competitor of this.competitionQuadrat){
			if (!competitor.isAlive) {continue;}
			if (competitor == this) continue;
			competitionAmount += competitor.genome.competitiveness * competitor.percentMaturity;
		}
		competitionAmount /= this.genome.competitiveness * 1;
		const competitionMalus = (1-Math.tanh(competitionAmount));
		this.environment.competitionMalus = competitionMalus;
		this.environment.sunExposure *= competitionMalus;
		this.environment.soilWater *= competitionMalus;
		this.environment.biomeName = gameMap.getBiomeName(Math.round(this.pos.x),Math.round(this.pos.y));

		
		//respire- using water and cooling self down
		const respiration = 10/(50+tempDifference) * this.water / 100;
		const heating = (tempDifference)**2/2500 * (tempDifference > 0);
		//draw water, draw minerals with the water
		const capillaryAction = Math.sqrt(waterDifference) / 5;
		//Be blown in the wind
		const blow = Math.sqrt(this.environment.windx**2 + this.environment.windy**2) * this.genome.size * this.genome.photosynthesisRate;
		if (blow - (this.genome.anchorage * this.water * this.genome.waterStorage + 1)*5 >= Math.random() + 2){
			this.isAlive = false;
			this.rooted = false;
		}
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
		this.energy -= growth * (1 + this.genome.waterAffinity + this.genome.waterStorage + this.genome.competitiveness + this.genome.heatResistance + this.genome.anchorage) * timeMultiplier;
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

					if (random(0, MUTATIONRATE) === 0){
						let before_genome = copy(next[key])
						next[key] = Array.from(next[key])

						let before = DNA.process(next[key])

						let type = random(0, 3)
						let location = random(4, next[key].length - 8)
						let base = random(0, 4)
						let name = ""
						if (type === MutationType.PointInsertion){ // insertion
							next[key].splice(location, 0, DNA.bases[base])
							name="Insertion"
						}else if (type === MutationType.PointDeletion){ // deletion
							next[key].splice(location, 1)
							name="Deletion"
						}else{ // substitution
							next[key][location] = DNA.bases[base]
							name="Substitution"
						}

						next[key] = next[key].join("")


						alerts.push(new Alert(`Mutation Occurred in Plant (#${numMutations})`, `${name} Mutation in ${key} (${before.toFixed(2)} -> ${DNA.process(next[key]).toFixed(2)})`, "<i class='fa-solid fa-dna'></i>", async ()=>{
							document.getElementById("evolutionPanelButton").click();
							//console.log(type, key, before_genome, location, base, before_genome.substring(location - 4, location + 5), "to", next[key].substring(location - 4, location + 5))
							document.querySelectorAll("svg:has(#MutationW)").forEach(e=>e.remove())
							await (new MutationWizard(type, key, before_genome, location, base)).run()
						}, "mutationAlert"))

						numMutations += 1

					}

				}

				const angle = Math.random() * Math.PI * 2;
				this.species.addSeed(next, this.genome.seedSize * 100, this.pos.x + Math.cos(angle) * 6, this.pos.y + Math.sin(angle) * 6)
			}
			this.seedDev = 0;
		}
		//aging and Death
		this.age += timeMultiplier;
		this.bioAge += growth + 0.01;
		

		if (this.temperature >= 80 || this.temperature <= 20 || this.water <= 5 || this.energy <= 1){
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
		this.height -= this.genome.seedSize**2;

		//blown about by the wind
		this.environment = gameMap.getBiomeStatistics(gameMap.cordToIndex(this.pos.x,this.pos.y));
		this.vel.x = this.vel.x * 0.5 + Math.tanh(this.environment.windx/2)*2;
		this.vel.y = this.vel.y * 0.5 + Math.tanh(this.environment.windy/2)*2;

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
