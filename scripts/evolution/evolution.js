"use strict";
// All js pertaining to evolution!

const get_svg = async (path) => {
    let res = await fetch(path)
    res = await res.text()
    return res
}

let MutationWizardSVG;

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

const codons = {
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

class MutationWizard{
    constructor(type, trait){
        this.type = type
        this.trait = trait
    }

    run = async ()=> {
        document.body.insertAdjacentHTML("beforeend", MutationWizardSVG)

        let svg = document.querySelector("#MutationW")

        svg.querySelector("#Trait_name tspan").innerHTML = this.trait

        this.bases = [
            svg.querySelector("#Cytosine").outerHTML,
            svg.querySelector("#Guanine").outerHTML,
            svg.querySelector("#Adenine").outerHTML,
            svg.querySelector("#Uracil").outerHTML
        ]

        this.base_convert = ["C", "G", "A", "U"]

        svg.querySelectorAll("#Cytosine, #Guanine, #Adenine, #Uracil").forEach(e=>e.remove())


        this.sequence = []

        for (let i = 0; i < 12; i++){
            this.sequence.push(random(0, 4))
        }

        let cur = 39;
        let num = random(0, 1000)
        for (let i = 0; i < 12; i++){
            svg.insertAdjacentHTML("beforeend", this.bases[this.sequence[i]])
            svg.querySelector(":is(#Cytosine, #Guanine, #Adenine, #Uracil):last-of-type").style.transform = `translate(${cur}px, 225px)`
            svg.querySelector(":is(#Cytosine, #Guanine, #Adenine, #Uracil):last-of-type").classList.add("num"+i)
            svg.querySelector(":is(#Cytosine, #Guanine, #Adenine, #Uracil):last-of-type :is(#Number, #Number_2, #Number_3, #Number_4) tspan").innerHTML = num+i
            cur += 85
        }

        let declare_codons = ()=>{
            svg.querySelector("#Name1 tspan").innerHTML = codons[this.base_convert[this.sequence[0]] + this.base_convert[this.sequence[1]] +  this.base_convert[this.sequence[2]]]
            svg.querySelector("#Name2 tspan").innerHTML = codons[this.base_convert[this.sequence[3]] + this.base_convert[this.sequence[4]] +  this.base_convert[this.sequence[5]]]
            svg.querySelector("#Name3 tspan").innerHTML = codons[this.base_convert[this.sequence[6]] + this.base_convert[this.sequence[7]] +  this.base_convert[this.sequence[8]]]
        }

        declare_codons()

        await timeout(1000)

        if (this.type === MutationType.PointDeletion){
            let point = random(0, 8)
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
            let point = random(0, 8)
            let base = random(0, 4)
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

            console.log(this.sequence)
            this.sequence.splice(point, 0,base)
            declare_codons()
        } else if (this.type === MutationType.PointSubstitution){
            let point = random(0, 8)
            let base = random(0, 4)
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
    }
}

async function init_evolution() {
    MutationWizardSVG = await get_svg("assets/MutationW.svg")

    console.log((new MutationWizard(random(0, 3), "AA")).run())

}

init_evolution()

