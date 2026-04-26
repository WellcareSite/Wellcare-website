import sys
from PIL import Image

if __name__ == "__main__":
    mockup_path = "/Users/timcampbell/.gemini/antigravity/brain/177a3e1c-b61c-4dbc-bc04-97fbcc570088/awards_option_b_trophies.png"
    mockup = Image.open(mockup_path)
    
    # Crop the laurel wreath area (left side)
    # The mockup is 1024x1024. Wreath is roughly x:100 to 450, y:150 to 500
    wreath_crop = mockup.crop((80, 150, 470, 520))
    wreath_crop.save("src/images/partners/wreath-original.png")
    
    print("Saved wreath crop.")
