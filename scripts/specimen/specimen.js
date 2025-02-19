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

const specimenPanel = {
  panel : document.getElementById("specimenPanel"),
  canvas : document.getElementById("specimenCanvas"),
  ctx : document.getElementById("specimenCanvas").getContext("2d"),
  geneTable : document.getElementById("specimenGenome"),
  attrTable : document.getElementById("specimenAttributes"),
  subject : null,
  subjectPos : {
    x : 0,
    y : 0,
  },
  biome : null,
  weather : null,
  choose(specimen, gameMap){
    this.subject = specimen;
    this.subjectPos = this.subject.pos;
    this.biome = gameMap.map[gameMap.cordToIndex(this.subjectPos.x, this.subjectPos.y)]; //number from 1 to 9
    if (this.biome == 9) console.log("uh oh, specimen is in the ocean");
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

    const randNum = splitmix32(this.subject.randomSeed);

    this.ctx.fillStyle = "aqua";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    //surfaceFill = color based on biome
    //bottomfill = darkercolor, maybe black

    const surfaceY = this.canvas.height / 2;
    const centerX = this.canvas.width / 2; 

    const surfaceFill = "yellow";
    const bottomfill = "brown";
    const earthfill = this.ctx.createLinearGradient(0, surfaceY, 0, this.canvas.height);
    earthfill.addColorStop(0, surfaceFill); earthfill.addColorStop(1, bottomfill);
    this.ctx.fillStyle = earthfill;
    this.ctx.fillRect(0, surfaceY, this.canvas.width, this.canvas.height - surfaceY);

    const sizeCoefficient = this.subject.genome.size * this.subject.percentMaturity;
    const thickness = this.subject.water * this.subject.genome.waterStorage * this.subject.percentMaturity / 100;
    
    //shoots
    this.ctx.fillStyle = `rgb(${100 - this.subject.water},${this.subject.water*4+50},${this.subject.water / 2})`;
    //binary tree generation????
    //dfs lets go
    //actually no, bfs 
    this.ctx.beginPath();
    let queue = new Queue(); //Array <Node <BranchAngle, StartPosX, StartPosY, Thickness, countleft>>
    const branchCount = Math.floor(this.subject.genome.photosynthesisRate / 0.25) + 1
    queue.enqueue([-Math.PI/2, centerX, surfaceY, thickness/2, branchCount * this.subject.percentMaturity / 100]);
    while (!queue.isEmpty()){
      const node = queue.dequeue();
      if (node[4] <= 0){
        //draw a leaf
        const leafSize = this.subject.genome.photosynthesisRate * this.subject.genome.size * 8;
        this.ctx.beginPath();
        this.ctx.ellipse(node[1] + Math.cos(node[0])*leafSize * 7, node[2] + Math.sin(node[0])*leafSize * 7, leafSize * 2.5, leafSize * 7, node[0] + Math.PI / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();
        continue;
      }
      this.ctx.moveTo(node[1] + Math.sin(node[0]) * node[3], node[2] - Math.cos(node[0]) * node[3]);
      const branchLength = this.subject.genome.size * 200 / Math.floor(this.subject.genome.photosynthesisRate / 0.25 + 1) * Math.min(1, node[4]);
      const nextX = node[1] + Math.cos(node[0]) * branchLength;
      const nextY = node[2] + Math.sin(node[0]) * branchLength;
      const AngleCoefficient = Math.PI / 2 * (30 - Math.min(20, this.subject.water))/10;
      const nextAngle1 = node[0] + (randNum() - 0.5) * AngleCoefficient;
      const nextAngle2 = node[0] + (randNum() - 0.5) * AngleCoefficient;
      const nextThick = node[3] * 0.8;
      this.ctx.lineTo(nextX + Math.sin(node[0]) * nextThick, nextY - Math.cos(node[0]) * nextThick);
      this.ctx.lineTo(nextX - Math.sin(node[0]) * nextThick, nextY + Math.cos(node[0]) * nextThick);
      this.ctx.lineTo(node[1] - Math.sin(node[0]) * node[3], node[2] + Math.cos(node[0]) * node[3]);
      this.ctx.lineTo(node[1] + Math.sin(node[0]) * node[3], node[2] - Math.cos(node[0]) * node[3]);
      queue.enqueue([nextAngle1, nextX, nextY, nextThick, node[4]-1]);
      queue.enqueue([nextAngle2, nextX, nextY, nextThick, node[4]-1]);
      if (node[4] < 1){
        //draw a leaf
        this.ctx.fill();
        this.ctx.closePath();
        continue;
      }
    }//edit later
    
    
    //roots

    this.ctx.fillStyle = "beige";
    const taprootLength = this.subject.genome.anchorage * sizeCoefficient * 2;
    const lateralRootLength = this.subject.genome.waterAffinity * sizeCoefficient / this.subject.genome.anchorage;

    //taproot
    this.ctx.beginPath();
    this.ctx.moveTo(centerX + thickness/2, surfaceY);
    this.ctx.lineTo(centerX, surfaceY + taprootLength);
    this.ctx.lineTo(centerX - thickness/2, surfaceY);
    this.ctx.lineTo(centerX + thickness/2, surfaceY);
    this.ctx.fill();
    this.ctx.closePath();

    //lateral roots
    this.ctx.beginPath();
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = "beige";
    for (let i = 0; i < Math.floor(taprootLength / 25); i++){
      let rootY1 = 25 * (randNum() + i);
      let rootY2 = 25 * (randNum() + i);
      const rootLength1 = lateralRootLength * (randNum() + 0.5) * (-(25 * (i+1) / taprootLength) + 1)**2 * 2;
      const rootLength2 = lateralRootLength * (randNum() + 0.5) * (-(25 * (i+1) / taprootLength) + 1)**2 * 2;

      rootY1 += surfaceY; rootY2 += surfaceY;

      this.ctx.moveTo(centerX, rootY1);
      this.ctx.lineTo(centerX + rootLength1, rootY1);
      this.ctx.moveTo(centerX, rootY2),
      this.ctx.lineTo(centerX - rootLength2, rootY2);
    }
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.restore();



    //list out attributes
    this.update();
    
    
  },
  update(){
    
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
  }
};
