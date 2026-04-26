import sys
from PIL import Image, ImageDraw, ImageFont

# Load the user's gold crown image
input_path = '/Users/timcampbell/.gemini/antigravity/brain/177a3e1c-b61c-4dbc-bc04-97fbcc570088/.tempmediaStorage/media_177a3e1c-b61c-4dbc-bc04-97fbcc570088_1777239803008.png'
output_path = 'src/images/partners/BOTS-2026-Gold-Crown.png'

try:
    img = Image.open(input_path).convert("RGBA")
    draw = ImageDraw.Draw(img)
    
    width, height = img.size
    
    # We know the '2025' is on the far left. The image is 2314x1480.
    # We will clear a box that is roughly around the '5'.
    # Let's find the non-transparent pixels on the left side to get the bounds.
    # The '5' is the lowest character in the vertical '2025' stack.
    
    # We will search for the lowest non-transparent pixel in the left 15% of the image.
    left_margin = int(width * 0.15)
    
    # Simple manual box based on proportions (guess and check)
    # If the image is 2314 wide and 1480 tall:
    # 2025 is stacked. The 5 should be around x: [150, 400], y: [1100, 1300]
    
    # Let's just draw a transparent box over where the 5 likely is.
    # But to be safe, let's use a very basic OCR or pixel matching? No, too complex.
    
    # Let's make an interactive approach. We'll find the bottom-most black pixels on the left edge.
    pixels = img.load()
    bottom_y = 0
    top_y = height
    min_x = width
    max_x = 0
    
    # Scan the left 20% of the image to find the '5'
    # We'll assume the '5' is the lowest object in this vertical column.
    # First find the lowest y in the left 15%
    for x in range(0, int(width * 0.15)):
        for y in range(int(height * 0.5), height): # only look at bottom half
            r, g, b, a = pixels[x, y]
            if a > 50: # not transparent
                if y > bottom_y: bottom_y = y
                if y < top_y: top_y = y
                if x < min_x: min_x = x
                if x > max_x: max_x = x

    # Now we have the bounds of whatever is in the bottom left. 
    # It might be the '5'. Let's isolate the '5'. The stack is '2', '0', '2', '5'.
    # They are probably evenly spaced. Let's find all the letters in that column.
    
    # Let's do something simpler: The user wants it to say 2026. 
    # What if I use my previously created solid black logo as a base, but copy the gold crown onto it, and then erase the 5 and write a 6?
    # But wait, the user's gold crown image has the word "BEST" in a specific way, and a beautiful gold crown.
    # Let's just erase the bottom 25% of the left column and write a '6' in its place.
    
    # Erase the 5
    # Based on the image visual: The "5" is at the bottom left. There is a flourish below it from the word "SPRINGS".
    # I don't want to erase the flourish!
    # Let's find the exact bounding box of the '5' by searching for disconnected components? Too hard.
    
    pass

except Exception as e:
    print(f"Error: {e}")

