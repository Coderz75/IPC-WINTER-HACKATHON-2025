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
  table : document.getElementById("specimenTable"),
  subject : null,
  biome : null,
  weather : null,
  choose(specimen){
    subject = specimen;
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
