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
  canvas : null,
  subject : null,
  biome : null,
  weather : null,
  choose(specimen){
    subject = specimen;
  },
  draw(time){
    if (this.canvas == null) return;
    if (this.subject == null) return; //or draw "no subject selected" on the panel
    //draw specimen according to time
  },
};
