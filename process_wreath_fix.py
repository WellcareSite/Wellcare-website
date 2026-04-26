import sys
from PIL import Image

wreath = Image.open("src/images/partners/wreath-blank.png")
data = wreath.getdata()
new_data = []

width, height = wreath.size
for y in range(height):
    for x in range(width):
        r, g, b, a = data[y * width + x]
        # Erase the center bounding box where "2025" and text lives
        if 70 < x < 300 and 20 < y < 330:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append((r,g,b,a))

wreath.putdata(new_data)
wreath.save("src/images/partners/wreath-blank.png", "PNG")
