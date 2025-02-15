from PIL import Image
import json
im = Image.open('assets/BiomesMapUnlabled.png') # Can be many different formats.
pix = im.load()
print (im.size)  # Get the width and hight of the image for iterating over

giggaList = []
biomes = {
    "0,64,0,255": 1, # Rainforest
    "128,128,0,255": 2, # Savanna
    "255,255,64,255": 3, # Desert
    "0,192,0,255": 4, # Temperate Forest
    "64,64,0,255":5, # Grassland
    "64,255,255,255":6, # Tundra
    "0,64,64,255":7, # Taiga Forest
    "192,192,192,255": 8, # Ice
    "255,255,255,255": 9 # Water
}
for i in range(410):
    for j in range(800):
        rgbCode =",".join(str(x) for x in pix[j,i])
        if rgbCode in biomes:
            giggaList.append(biomes[rgbCode])
        else:
            giggaList.append(9)

with open('data.json', 'w') as f:
    json.dump(giggaList, f)