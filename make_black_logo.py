import sys
from PIL import Image

def make_logo_black(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for r, g, b, a in data:
        # Keep transparency, but make visible pixels black
        if a > 0:
            new_data.append((0, 0, 0, a))
        else:
            new_data.append((255, 255, 255, 0))
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Saved black logo to {output_path}")

make_logo_black("src/images/partners/BOTS-2026-Logo-Transparent.png", "src/images/partners/BOTS-2026-Logo-Black.png")
