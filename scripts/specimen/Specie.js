"use strict";
// Specie default class: Any subtypes of species should extend this arguably
class Specie{
    constructor(){
        this.tiles = [] // list of tiles the species are on (a tile is one pixel on the map, and is cordinated with a single digit.)
        this.name = ""
    }
}