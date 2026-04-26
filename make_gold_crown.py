import sys
from PIL import Image

def find_crown(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    width, height = img.size
    
    # We want to change the crown to gold (#C89F43)
    # The crown is the top element of the image.
    # The text "BEST OF THE SPRINGS" is below it.
    # Let's find the split point by checking horizontal lines of empty pixels?
    # Or just say everything in the top 35% of the image that isn't transparent is the crown?
    
    new_data = []
    gold = (200, 159, 67, 255) # approximate gold color
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = img.getpixel((x, y))
            
            # The crown usually sits above the main text. Let's color everything above y=110 gold.
            # (Assuming 360 height, 110 is about top 30%)
            # I will use a simple heuristic: y < 140 -> gold
            
            if a > 0:
                if y < 155:
                    # Let's make it gold but keep the alpha
                    new_data.append((gold[0], gold[1], gold[2], a))
                else:
                    new_data.append((r, g, b, a)) # keep black
            else:
                new_data.append((r, g, b, a))
                
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Saved gold-crowned logo to {output_path}")

find_crown("src/images/partners/BOTS-2026-Logo-Black.png", "src/images/partners/BOTS-2026-Logo-Gold-Crown-Black.png")
