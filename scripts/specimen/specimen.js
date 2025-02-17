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

const specimenPanel = {
  panel : document.getElementById("specimenPanel"),
  canvas : document.getElementById("specimenCanvas"),
  ctx : document.getElementById("specimenCanvas").getContext("2d"),
  geneTable : document.getElementById("specimenGenome"),
  attrTable : document.getElementById("specimenAttributes"),
  subject : null,
  biome : null,
  weather : null,
  choose(specimen){
    this.subject = specimen;
    this.geneTable.innerHTML = null;
    for (const gene in specimen.genome){
      const val = specimen.genome[gene];
      const row = this.geneTable.insertRow();
      const cell1 = row.insertCell(0);
      const cell2 = row.insertCell(1);
      cell1.width = cell2.width = this.panel.width / 2;
      cell1.innerHTML = gene;
      cell2.innerHTML = val;
    }
    this.attrTable.innerHTML = null;
    for (const attr in specimen.attributes){
      const val = specimen.attributes[attr];
      const row = this.attrTable.insertRow();
      const cell1 = row.insertCell(0);
      const cell2 = row.insertCell(1);
      cell1.width = cell2.width = this.panel.width / 2;
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
    //draw specimen according to time on canvas

    //list out attributes
    
    
  },
};
