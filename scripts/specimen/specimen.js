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

class Fruit {
  constructor (parentGenome){
    this.genome = {
      waterStorage: 0.5,
      waterAffinity: 0.5,
      anchorage: 0.5,
      competitiveness: 0.5,
      photosynthesisRate: 0.5,
    };
    Object.assign(parentGenome, this.genome);
    this.xpos = 0;
    this.ypos = 0;
    this.xvel = 0;
    this.yvel = 0;
  }
}

class Plant {
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
  }
}

const specimenPanel = {
  canvas : null,
  subject : null,
  biome : null,
  weather : null,
  select(specimen){
    subject = specimen;
  },
  draw(time){
    if (this.canvas == null) return;
    if (this.subject == null) return; //or draw "no subject selected" on the panel
    //draw specimen according to time
  },
};
