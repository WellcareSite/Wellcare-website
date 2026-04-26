import sys
from PIL import Image

# Re-crop the wreath from the original mockup
mockup = Image.open("/Users/timcampbell/.gemini/antigravity/brain/177a3e1c-b61c-4dbc-bc04-97fbcc570088/awards_option_b_trophies.png")
wreath = mockup.crop((90, 160, 460, 520))

# Convert to RGBA
wreath = wreath.convert("RGBA")
data = wreath.getdata()
new_data = []

width, height = wreath.size
for y in range(height):
    for x in range(width):
        r, g, b, a = data[y * width + x]
        
        # We only want the dark blue laurel leaves.
        # The leaves are very dark: R<50, G<60, B<80 or similar.
        # Everything else should be transparent.
        # Let's be generous: if it's dark blue/black, keep it. Else transparent.
        if r < 100 and g < 100 and b < 120 and b > r:
            # It's a dark blue leaf
            # Let's keep it but make it pure dark blue #112a46 to be safe
            new_data.append((17, 42, 70, 255))
        else:
            # Background or text
            new_data.append((255, 255, 255, 0))

wreath.putdata(new_data)
wreath.save("src/images/partners/wreath-blank.png", "PNG")
