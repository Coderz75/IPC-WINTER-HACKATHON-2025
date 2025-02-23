"use strict";
// All scripts pertaining to the specimen menu.

//const specimenCanvas = document.getElementById("specimenCanvas");

/*
Our plants have several attributes:
  genome : {
    waterStorage (storing water)
    waterAffinity (collecting water)
    Anchorage (reduced probability of being uprooted)
      Taproot
      Fibrous roots
    Competitiveness (better at fighting other plants)
      Height (helps gather more sunlight)
      Allelopathy (kills other plants)
    PhotosynthesisRate 
    //genes for seeds will not be coded, for simplicity. Every seed will float on water and roll a certain distance on land.
  }
  water: int
  maxWater: int
  sun: int
  energy: int //used for growth, represents sugar levels
  percentMaturity: int [0, 1]
  randomSeed: used to draw the plant

*/

function splitmix32(a) { //stack overflow, generates a random number based on seed a
  return function() {
    a |= 0;
    a = a + 0x9e3779b9 | 0;
    let t = a ^ a >>> 16;
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ t >>> 15;
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
  }
}

function drawSpecimen(canvas, subject, setMature=false, ignoreEnvironment=false){
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = "aqua";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  //surfaceFill = color based on biome
  //bottomfill = darkercolor, maybe black

  let maturity = subject.percentMaturity;
  if (setMature) maturity = 100;

  let environment = subject.environment;
  if (ignoreEnvironment){
    environment = {}
    Object.assign(environment, {
      soilWater: 0.5,
      surroundingTemp: 50,
      sunExposure: 0.5, 
      windx: 0,
      windy: 0,
    });
  }

  const surfaceY = canvas.height / 2;
  const centerX = canvas.width / 2; 

  const surfaceFill = `rgb(${255*(1-environment.soilWater)+100-environment.surroundingTemp}, ${155 + 100*(1-environment.soilWater)}, ${200*(1-environment.surroundingTemp/100)})`;
  const bottomfill = "brown";
  const earthfill = ctx.createLinearGradient(0, surfaceY*0.9, 0, canvas.height);
  earthfill.addColorStop(0, surfaceFill); earthfill.addColorStop(1, bottomfill);
  ctx.fillStyle = earthfill;
  ctx.fillRect(0, surfaceY, canvas.width, canvas.height - surfaceY);
  const background = ctx.createLinearGradient(0, 0, 0, surfaceY*0.75);
  background.addColorStop(1, surfaceFill); background.addColorStop(0, "aqua");
  ctx.fillStyle = background;
  ctx.fillRect(0, surfaceY/2, canvas.width, surfaceY/2+1);
  if (subject.rooted){
  const sizeCoefficient = subject.genome.size * maturity;
  const thickness = subject.water * subject.genome.waterStorage * maturity / 100;
  
  //roots
  const randNumRoot = splitmix32(subject.randomSeed);
  ctx.fillStyle = "beige";
  const taprootLength = subject.genome.anchorage * sizeCoefficient * 2;
  const lateralRootLength = subject.genome.waterAffinity * sizeCoefficient / subject.genome.anchorage;

  //taproot
  ctx.beginPath();
  ctx.moveTo(centerX + thickness/2, surfaceY);
  ctx.lineTo(centerX, surfaceY + taprootLength);
  ctx.lineTo(centerX - thickness/2, surfaceY);
  ctx.lineTo(centerX + thickness/2, surfaceY);
  ctx.fill();
  ctx.closePath();

  //lateral roots
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "beige";
  for (let i = 0; i < Math.floor(taprootLength / 25); i++){
    let rootY1 = 25 * (randNumRoot() + i);
    let rootY2 = 25 * (randNumRoot() + i);
    const rootLength1 = lateralRootLength * (randNumRoot() + 0.5) * (-(25 * (i+1) / taprootLength) + 1)**2 * 2;
    const rootLength2 = lateralRootLength * (randNumRoot() + 0.5) * (-(25 * (i+1) / taprootLength) + 1)**2 * 2;

    rootY1 += surfaceY; rootY2 += surfaceY;

    ctx.moveTo(centerX, rootY1);
    ctx.lineTo(centerX + rootLength1, rootY1);
    ctx.moveTo(centerX, rootY2),
    ctx.lineTo(centerX - rootLength2, rootY2);
  }
  ctx.stroke();
  ctx.closePath();

  //shoots
  let seedsLeft = subject.genome.seedCount;
  //binary tree generation????
  //dfs lets go
  //actually no, bfs 
  const windSpeed = (environment.windx + environment.windy)/1.41;
  const randNumShoot = splitmix32(subject.randomSeed);
  let seeds = [];
  let queue = new Queue(); //Array <Node <BranchAngle, StartPosX, StartPosY, Thickness, countleft>>
  const branchCount = Math.floor(subject.genome.photosynthesisRate / 0.25) + 1
  queue.enqueue([-Math.PI/2, centerX, surfaceY, thickness/2, branchCount * maturity / 100]);
  ctx.fillStyle = `rgb(${100 - subject.water},${subject.water*4+50},${subject.water / 2})`;
  while (!queue.isEmpty()){
    const node = queue.dequeue();
    node[0] += windSpeed * Math.sin(node[0]) * 0.01 / (1+node[3]);

    if (node[4] <= 0){
      //draw a leaf
      const leafSize = subject.genome.photosynthesisRate * subject.genome.size * 8;
      ctx.beginPath();
      ctx.ellipse(node[1] + Math.cos(node[0])*leafSize * 7, node[2] + Math.sin(node[0])*leafSize * 7, leafSize * 2.5, leafSize * 7, node[0] + Math.PI / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(node[1] + Math.sin(node[0]) * node[3], node[2] - Math.cos(node[0]) * node[3]);
    const branchLength = subject.genome.size * 200 / Math.floor(subject.genome.photosynthesisRate / 0.25 + 1) * Math.min(1, node[4]);
    const nextX = node[1] + Math.cos(node[0]) * branchLength;
    const nextY = node[2] + Math.sin(node[0]) * branchLength;
    const AngleCoefficient = Math.PI / 2 * (30 - Math.min(20, subject.water))/10 + subject.genome.photosynthesisRate;
    const nextAngle1 = node[0] + (randNumShoot() - 0.5) * AngleCoefficient;
    const nextAngle2 = node[0] + (randNumShoot() - 0.5) * AngleCoefficient;
    const nextThick = node[3] * 0.8;
    ctx.lineTo(nextX + Math.sin(node[0]) * nextThick, nextY - Math.cos(node[0]) * nextThick);
    ctx.lineTo(nextX - Math.sin(node[0]) * nextThick, nextY + Math.cos(node[0]) * nextThick);
    ctx.lineTo(node[1] - Math.sin(node[0]) * node[3], node[2] + Math.cos(node[0]) * node[3]);
    ctx.lineTo(node[1] + Math.sin(node[0]) * node[3], node[2] - Math.cos(node[0]) * node[3]);
    queue.enqueue([nextAngle1, nextX, nextY, nextThick, node[4]-1]);
    queue.enqueue([nextAngle2, nextX, nextY, nextThick, node[4]-1]);

    ctx.fill();
    ctx.closePath();
    if (node[4] <= 1 && maturity >= 100 && seedsLeft > 0){
      seeds.push([nextX, nextY]);
    }
  }//edit later

  const seedSize = subject.genome.seedSize * subject.seedDev * 0.1;
  for (const seed of seeds){
    if (seedsLeft == 0) break;
    ctx.beginPath();
    ctx.fillStyle = 'brown';
    ctx.ellipse(seed[0], seed[1], seedSize, seedSize, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    seedsLeft--;
  }
  
  ctx.fillStyle = `rgba(0, 0, 0, ${0.5*(1-environment.sunExposure)})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
  }
}

const specimenPanel = {
  panel : document.getElementById("specimenPanel"),
  canvas : document.getElementById("specimenCanvas"),
  ctx : document.getElementById("specimenCanvas").getContext("2d"),
  speciesLabel : document.getElementById("specimenSpecies"),
  geneTable : document.getElementById("specimenGenome"),
  attrTable : document.getElementById("specimenAttributes"),
  envTable: document.getElementById("specimenEnvironment"),
  colorLabel: document.getElementById("specimenColor"),
  subject : null,
  subjectPos : {
    x : 0,
    y : 0,
  },
  weather : null,
  choose(specimen, gameMap){
    this.subject = specimen;
    this.subjectPos = this.subject.pos;
    this.speciesLabel.innerHTML = `${this.subject.species.name}`;
    this.colorLabel.style.background = this.subject.color
    this.geneTable.innerHTML = null;
    this.geneTable.createTHead().innerHTML = "GENOME";
    for (const gene in specimen.genome){
      const val = specimen.genome[gene];
      const row = this.geneTable.insertRow();
      const cell1 = row.insertCell(0);
      const cell2 = row.insertCell(1);
      cell1.width = cell2.width = this.canvas.width / 2;
      cell1.innerHTML = gene;
      cell2.innerHTML = val;
    }
    this.attrTable.innerHTML = null;
    this.attrTable.createTHead().innerHTML = "ATTRIBUTES";
    for (const attr in specimen.attributes){
      const val = specimen.attributes[attr]();
      const row = this.attrTable.insertRow();
      const cell1 = row.insertCell(0);
      const cell2 = row.insertCell(1);
      cell1.width = cell2.width = this.canvas.width / 2;
      cell1.innerHTML = attr;
      cell2.innerHTML = val;
    }
    this.envTable.innerHTML = null;
    this.envTable.createTHead().innerHTML = "ENVIRONMENT";
    for (const [name,val] in specimen.environment){
      const row = this.envTable.insertRow();
      const cell1 = row.insertCell(0);
      const cell2 = row.insertCell(1);
      cell1.width = cell2.width = this.canvas.width / 2;
      cell1.innerHTML = name;
      cell2.innerHTML = val;
    }

  },
  draw(time){
    if (!this.panel.classList.contains("open")) return;
    this.ctx.save();
    if (this.subject == null){
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = "red";
      this.ctx.font = "20px serif";
      this.ctx.fillText("No plant selected, please click on one", 0, this.canvas.height / 2);
      this.ctx.restore();
      return;
    }
    //draw specimen according to time on canvas, specimen's own genome, it's attributes, the biome, and the weather
    drawSpecimen(this.canvas, this.subject, false);
    this.update();
  },
  update(){
    this.speciesLabel.innerHTML = `${this.subject.species.name}`;
    this.colorLabel.style.background = this.subject.color
    let i = 0;
    for (const gene in this.subject.genome){
      const val = this.subject.genome[gene];
      const row = this.geneTable.rows.item(i);

      const cell1 = row.cells.item(0);
      const cell2 = row.cells.item(1);
      cell1.innerHTML = gene;
      cell2.innerHTML = val;
      i++;
    }
    
    i = 0;
    for (const attr in this.subject.attributes){
      const val = this.subject.attributes[attr]();
      const row = this.attrTable.rows.item(i);
      const cell1 = row.cells.item(0);
      const cell2 = row.cells.item(1);

      cell1.innerHTML = attr;
      cell2.innerHTML = val;
      i++;
    }

    i = 0;
    for (const name in this.subject.environment){
      let val = "";
      if(name == "weather"){
        for (const a in this.subject.environment["weather"]){
          val += this.subject.environment["weather"][a]["name"] + ", ";
        }
        val = val.slice(0, -2); 
        if(val == ""){
          val = "None";
        }
      }else{
        val = this.subject.environment[name];
      }
      const row = this.envTable.rows.item(i);
      const cell1 = row.cells.item(0);
      const cell2 = row.cells.item(1);

      cell1.innerHTML = name;
      cell2.innerHTML = val;
      i++
    }
  }
};
