"use strict";
// All js pertaining to evolution!

const get_svg = async (path) => {
    let res = await fetch(path)
    res = await res.text()
    return res
}

let MutationWizardSVG;
let words;

const MutationType = {
    PointInsertion: 0,
    PointDeletion: 1,
    PointSubstitution: 2
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const random = (min, max) => {
    return Math.floor(Math.random() * (max - min) ) + min;
}

let phylo = {
    chart: {
        container: "#phylogeny",
        levelSeparation:    200,
        siblingSeparation:  10,
        subTeeSeparation:   10,
        nodeAlign: "BOTTOM",
        padding: 35,
        node: { HTMLclass: "evolution-tree" },
        connectors: {
            type: "curve",
            style: {
                "stroke-width": 2,
                "stroke-linecap": "round",
                "stroke": "#00a19a"
            }
        }
    },
    nodeStructure: {
        text: { name: "LIFE" },
        HTMLclass: "marker",
        children: []
    }
}

let life = phylo.nodeStructure

let encoding = {}
let hash_base;

function DNAScalar(value){
    return {
        "scalar": value
    }
}

class DNA{
    static bases = ["C", "G", "A", "U"]
    static stop_codons = ["UAA", "UAG", "UGG"]
    static codons =  {
        'UUU': 'Phenylalanine', 'UUC': 'Phenylalanine', 'UUA': 'Leucine', 'UUG': 'Leucine',
        'UCU': 'Serine', 'UCC': 'Serine', 'UCA': 'Serine', 'UCG': 'Serine',
        'UAU': 'Tyrosine', 'UAC': 'Tyrosine', 'UAA': 'STOP', 'UAG': 'STOP',
        'UGU': 'Cysteine', 'UGC': 'Cysteine', 'UGA': 'STOP', 'UGG': 'Tryptophan',

        'CUU': 'Leucine', 'CUC': 'Leucine', 'CUA': 'Leucine', 'CUG': 'Leucine',
        'CCU': 'Proline', 'CCC': 'Proline', 'CCA': 'Proline', 'CCG': 'Proline',
        'CAU': 'Histidine', 'CAC': 'Histidine', 'CAA': 'Glutamine', 'CAG': 'Glutamine',
        'CGU': 'Arginine', 'CGC': 'Arginine', 'CGA': 'Arginine', 'CGG': 'Arginine',

        'AUU': 'Isoleucine', 'AUC': 'Isoleucine', 'AUA': 'Isoleucine', 'AUG': 'Methionine',
        'ACU': 'Threonine', 'ACC': 'Threonine', 'ACA': 'Threonine', 'ACG': 'Threonine',
        'AAU': 'Asparagine', 'AAC': 'Asparagine', 'AAA': 'Lysine', 'AAG': 'Lysine',
        'AGU': 'Serine', 'AGC': 'Serine', 'AGA': 'Arginine', 'AGG': 'Arginine',

        'GUU': 'Valine', 'GUC': 'Valine', 'GUA': 'Valine', 'GUG': 'Valine',
        'GCU': 'Alanine', 'GCC': 'Alanine', 'GCA': 'Alanine', 'GCG': 'Alanine',
        'GAU': 'Aspartic', 'GAC': 'Aspartic', 'GAA': 'Glutamic', 'GAG': 'Glutamic',
        'GGU': 'Glycine', 'GGC': 'Glycine', 'GGA': 'Glycine', 'GGG': 'Glycine'
    };

    static process = (genome) => { // ignores any "loose nucleotides" at the end
        if (genome.scalar){
            return genome.scalar
        }

        let split = []
        for (let i = 0; i < genome.length - genome.length%3; i += 3){
            split.push(genome[i] + genome[i + 1] + genome[i + 2])
        }


        // Polynomial Hasher
        let res = 0
        let mod = 1000000007;

        let pow = 1;
        for (let i = 0; i < split.length; i++){
            res += (encoding[split[i]] * pow)%mod
            res %= mod

            //console.log(split[i], encoding[split[i]], encoding)

            pow = (pow * hash_base) % mod
        }


        return res / mod
    }

    static hash = (str) => {
        let res = 0;
        let mod = 1e5;
        for (let i = 0; i < str.length; i++){
            res += str[i].charCodeAt(0) * (hash_base << i)
            res %= mod
        }

        return res / mod
    }

    static is_valid = (genome) => {
        if (genome.length <= 3){
            return false
        }
        if (!genome.startsWith("AUG")){
            return false
        }
        genome = genome.substring(0, genome.length - genome.length % 3)

        let ends = false
        for (let codon of DNA.stop_codons){
            if (genome.endsWith(codon)){
                ends = true
            }
        }
        return ends
    }

    static generate_sequence(result, length){
        let attempts = 0
        let res = ""
        let codons = Object.keys(DNA.codons)
        do{
            if (attempts > 1000){
                throw Error("Too many attempts")
            }
            res = ""
            for (let i = 0; i < length; i++){
                res += codons[random(0, 64)]
            }
        }while(Math.abs(DNA.process(res) - result) > 0.02)

        return res
    }

    static convert(obj){
        let res = obj

        for (let key of Object.keys(obj)){
            res[key] = DNA.process(obj[key])
        }

        return res
    }
}

class MutationWizard{
    constructor(type, trait, genome, location, next=undefined){
        this.type = type
        this.trait = trait
        this.genome = genome
        this.location = location
        this.next = next
    }

    run = async ()=> {
        document.getElementById("evolutionPanelWrapper").insertAdjacentHTML("beforeend",MutationWizardSVG)

        let svg = document.querySelector("#MutationW:last-of-type")

        svg.querySelector("#Trait_name tspan").innerHTML = this.trait
        svg.querySelector("#Mutation_Type tspan").innerHTML = "mutation!"

        svg.querySelector("#close").onclick = () =>{
            document.querySelectorAll("svg:has(#MutationW)").forEach(e=>e.remove())
        }

        this.bases = [
            svg.querySelector("#Cytosine").outerHTML,
            svg.querySelector("#Guanine").outerHTML,
            svg.querySelector("#Adenine").outerHTML,
            svg.querySelector("#Uracil").outerHTML
        ]


        svg.querySelectorAll("#Cytosine, #Guanine, #Adenine, #Uracil").forEach(e=>e.remove())


        this.sequence = Array.from(this.genome.substring(this.location - 4, this.location + 8)).map(e=>DNA.bases.indexOf(e))
        // -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8,

        let cur = 39;
        let num = this.location - 4
        for (let i = 0; i < 12; i++){
            svg.insertAdjacentHTML("beforeend", this.bases[this.sequence[i]])
            svg.querySelector(":is(#Cytosine, #Guanine, #Adenine, #Uracil):last-of-type").style.transform = `translate(${cur}px, 225px)`
            svg.querySelector(":is(#Cytosine, #Guanine, #Adenine, #Uracil):last-of-type").classList.add("num"+i)
            svg.querySelector(":is(#Cytosine, #Guanine, #Adenine, #Uracil):last-of-type :is(#Number, #Number_2, #Number_3, #Number_4) tspan").innerHTML = num+i
            cur += 85
        }

        let bases = DNA.bases
        let codons = DNA.codons

        let declare_codons = ()=>{
            svg.querySelector("#Name1 tspan").innerHTML = codons[bases[this.sequence[0]] + bases[this.sequence[1]] +  bases[this.sequence[2]]]
            svg.querySelector("#Name2 tspan").innerHTML = codons[bases[this.sequence[3]] + bases[this.sequence[4]] +  bases[this.sequence[5]]]
            svg.querySelector("#Name3 tspan").innerHTML = codons[bases[this.sequence[6]] + bases[this.sequence[7]] +  bases[this.sequence[8]]]
        }

        declare_codons()

        await timeout(1000)

        if (this.type === MutationType.PointDeletion){
            let point = 4
            let rate = 5
            for (let i = 0; i < 50; i++){
                svg.querySelector(`.num${point}`).style.transform = `translate(${39 + point*85}px, ${225-rate*i}px)`
                await timeout(5)
                rate += 3
            }

            rate = 5
            while (rate < 85){
                for (let j = point + 1; j < 12; j++){
                    svg.querySelector(`.num${j}`).style.transform = `translate(${39 + j*85-rate}px, 225px)`
                }
                rate += 3
                await timeout(5)
            }

            this.sequence.splice(point, 1)
            declare_codons()

        }
        else if (this.type === MutationType.PointInsertion){
            let point =4
            let base = this.next
            svg.insertAdjacentHTML("beforeend", this.bases[base])
            svg.querySelector(":is(#Cytosine, #Guanine, #Adenine, #Uracil):last-of-type").classList.add("num13")
            svg.querySelector(":is(#Cytosine, #Guanine, #Adenine, #Uracil):last-of-type :is(#Number, #Number_2, #Number_3, #Number_4) tspan").innerHTML = "???"
            let rate = -10
            while (rate < 225){
                svg.querySelector(`.num13`).style.transform = `translate(${39 + point*85}px, ${rate}px)`
                await timeout(5)
                rate += 10
            }
            svg.querySelector(`.num13`).style.transform = `translate(${39 + point*85}px, 225px)`

            rate = 5
            while (rate < 85){
                for (let j = point; j < 12; j++){
                    svg.querySelector(`.num${j}`).style.transform = `translate(${39 + j*85+rate}px, 225px)`
                }
                rate += 3
                await timeout(5)
            }

            //console.log(this.sequence)
            this.sequence.splice(point, 0,base)
            declare_codons()
        } else if (this.type === MutationType.PointSubstitution){
            let point = 4
            let base = this.next
            svg.insertAdjacentHTML("beforeend", this.bases[base])
            svg.querySelector(":is(#Cytosine, #Guanine, #Adenine, #Uracil):last-of-type").classList.add("num13")
            svg.querySelector(":is(#Cytosine, #Guanine, #Adenine, #Uracil):last-of-type :is(#Number, #Number_2, #Number_3, #Number_4) tspan").innerHTML = "???"
            let rate = 0
            while (rate < 225){
                svg.querySelector(`.num13`).style.transform = `translate(${39 + point*85}px, ${rate}px)`
                svg.querySelector(`.num${point}`).style.transform = `translate(${39 + point*85}px, ${225 + rate}px)`
                await timeout(5)
                rate += 10
            }
            svg.querySelector(`.num13`).style.transform = `translate(${39 + point*85}px, 225px)`
            
            this.sequence[point] = base
            declare_codons()
        }

        let new_genome = Array.from(this.genome)

        new_genome.splice(this.location - 4, 12, ...this.sequence.map(e=>bases[e]))


        svg.querySelector("#Trait_value tspan").innerHTML = DNA.process(new_genome).toFixed(2) + " (prev: " + DNA.process(this.genome).toFixed(2) + ")"

        return new_genome
    }
}

async function redrawTree(){
    document.getElementById("phylogeny").innerHTML = ""

    await new Treant(phylo)

    document.getElementById("phylogeny").querySelectorAll("img").forEach(e => {
        e.src = e.src.split("?")[0]
    })

    document.querySelectorAll("#phylogeny img").forEach(e=> {
        e.onclick = () => {
            document.getElementById("imageModal").style.display = "flex"
            document.getElementById("imageModalImage").src = e.src
        }
    })
}

async function init_evolution() {

     hash_base = 17

    //console.log((new MutationWizard(random(0, 3), "AA")).run())

    let i = 1
    for (let a of DNA.bases){
        for (let b of DNA.bases) {
            for (let c of DNA.bases) {
                encoding[a+b+c] = i
                i++
            }
        }
    }


    redrawTree()

    setTimeout(redrawTree, 1000)

    try {
        MutationWizardSVG = await get_svg("assets/MutationW.svg")
    } catch{
        MutationWizardSVG = await get_svg("https://coderz75.github.io/IPC-WINTER-HACKATHON-2025/assets/MutationW.svg")
    }
}

let capitalize = (word) => {
    word = Array.from(word)
    word[0] = word[0].toUpperCase()
    return word.join("")
}

let generate_name = () => {
    return capitalize(faker.food.vegetable()) + " " + faker.science.unit().name
}

init_evolution()

