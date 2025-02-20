from PIL import Image
import json
im = Image.open('assets/rainfallLabled.png') # Can be many different formats.
pix = im.load()
print (im.size)  # Get the width and hight of the image for iterating over
im = im.resize((800, 410))
print (im.size)  # Get the width and hight of the image for iterating over

giggaList = []
colors = {
    "230,230,230,255": 1, # 0-24
    "190,190,190,255": 2, # 25-74
    "150,150,150,255": 3, # 75-124
    "196,192,110,255": 4, # 125-224
    "200,179,150,255":5, # 225-274
    "255,119,117,255": 6, # 275-374
    "255,255,84,255":7, # 375-474
    "145,255,153,255": 8, # 475-724
    "0,255,0,255": 9, # 725-974    
    "64,199,56,255": 10, # 975-1474
    "13,150,5,255": 11, # 1475-2474
    "5,112,94,255": 12, # 2475-4974
    "255,0,255,255": 13, # 4975-7474
    "128,255,128,255": 14, # 7475-10,004
    "0,138,255,255": 15, # 10,004+
    "0,0,0,255": 16, # "Water"
}
for i in range(432):
    for j in range(1007):
        rgbCode =",".join(str(x) for x in pix[j,i])
        if rgbCode in colors:
            giggaList.append(colors[rgbCode])
        else:
            giggaList.append(16)

with open('data.json', 'w') as f:
    json.dump(giggaList, f)