import sys
from PIL import Image

mockup_path = "/Users/timcampbell/.gemini/antigravity/brain/177a3e1c-b61c-4dbc-bc04-97fbcc570088/awards_option_b_trophies.png"
mockup = Image.open(mockup_path)

# The wreath is at roughly x:90 to 460, y:170 to 500
wreath = mockup.crop((90, 160, 460, 520))
bg_color = wreath.getpixel((0,0))

data = wreath.getdata()
new_data = []

width, height = wreath.size
for y in range(height):
    for x in range(width):
        r, g, b = data[y * width + x][:3]
        
        # Define the center area where the text is
        in_text_area = (70 < x < 300) and (20 < y < 330)
        
        if in_text_area:
            # If the pixel is dark (text) or different from bg, replace it with background
            diff = abs(r - bg_color[0]) + abs(g - bg_color[1]) + abs(b - bg_color[2])
            if diff > 20:
                new_data.append(bg_color)
            else:
                new_data.append((r,g,b))
        else:
            new_data.append((r,g,b))

wreath.putdata(new_data)

# Let's make the background transparent
wreath = wreath.convert("RGBA")
data = wreath.getdata()
new_data = []
for item in data:
    r, g, b, a = item
    if abs(r - bg_color[0]) < 15 and abs(g - bg_color[1]) < 15 and abs(b - bg_color[2]) < 15:
        new_data.append((255, 255, 255, 0))
    else:
        new_data.append(item)

wreath.putdata(new_data)
wreath.save("src/images/partners/wreath-blank.png", "PNG")
print("Saved blank wreath.")
