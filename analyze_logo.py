from PIL import Image

def find_components(image_path):
    img = Image.open(image_path).convert("RGBA")
    width, height = img.size
    data = img.load()
    
    visited = set()
    components = []
    
    for y in range(height):
        for x in range(width):
            if (x, y) not in visited and data[x, y][3] > 0: # not transparent
                # BFS to find all connected pixels
                queue = [(x, y)]
                component = []
                visited.add((x, y))
                
                while queue:
                    cx, cy = queue.pop(0)
                    component.append((cx, cy))
                    
                    # check neighbors
                    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, 1), (-1, 1), (1, -1)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < width and 0 <= ny < height:
                            if (nx, ny) not in visited and data[nx, ny][3] > 0:
                                visited.add((nx, ny))
                                queue.append((nx, ny))
                                
                # calculate bounding box
                min_x = min(p[0] for p in component)
                max_x = max(p[0] for p in component)
                min_y = min(p[1] for p in component)
                max_y = max(p[1] for p in component)
                
                components.append({
                    "points": component,
                    "bbox": (min_x, min_y, max_x, max_y)
                })
                
    # Sort components by their minimum Y coordinate
    components.sort(key=lambda c: c['bbox'][1])
    
    print(f"Found {len(components)} connected components.")
    for i, c in enumerate(components[:20]): # print top 20
        print(f"Component {i}: bbox {c['bbox']}, points: {len(c['points'])}")

find_components("src/images/partners/BOTS-2026-Logo-Black.png")
