import sys
from PIL import Image

def find_crown_bbox(image_path):
    img = Image.open(image_path).convert("RGBA")
    width, height = img.size
    data = img.load()
    
    visited = set()
    components = []
    
    for y in range(height):
        for x in range(width):
            if (x, y) not in visited and data[x, y][3] > 0:
                queue = [(x, y)]
                component = []
                visited.add((x, y))
                
                while queue:
                    cx, cy = queue.pop(0)
                    component.append((cx, cy))
                    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, 1), (-1, 1), (1, -1)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < width and 0 <= ny < height:
                            if (nx, ny) not in visited and data[nx, ny][3] > 50:
                                visited.add((nx, ny))
                                queue.append((nx, ny))
                                
                min_y = min(p[1] for p in component)
                components.append((min_y, component))
                
    components.sort(key=lambda x: x[0])
    
    # The crown should be the first component (highest up)
    crown_points = components[0][1]
    min_x = min(p[0] for p in crown_points)
    max_x = max(p[0] for p in crown_points)
    min_y = min(p[1] for p in crown_points)
    max_y = max(p[1] for p in crown_points)
    
    print(f"Crown bbox in {image_path}: {(min_x, min_y, max_x, max_y)}")

find_crown_bbox("src/images/partners/BOTS-Gold-Crown.png")
