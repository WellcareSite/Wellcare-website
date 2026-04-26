from PIL import Image

def apply_gold_gradient(black_logo_path, gold_logo_path, output_path):
    # Load images
    black_img = Image.open(black_logo_path).convert("RGBA")
    gold_img = Image.open(gold_logo_path).convert("RGBA")
    
    b_width, b_height = black_img.size
    g_width, g_height = gold_img.size
    
    b_data = black_img.load()
    g_data = gold_img.load()
    
    # 1. Find the crown in the black logo (using BFS)
    visited = set()
    components = []
    
    for y in range(b_height):
        for x in range(b_width):
            if (x, y) not in visited and b_data[x, y][3] > 0:
                queue = [(x, y)]
                component = []
                visited.add((x, y))
                
                while queue:
                    cx, cy = queue.pop(0)
                    component.append((cx, cy))
                    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, 1), (-1, 1), (1, -1)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < b_width and 0 <= ny < b_height:
                            if (nx, ny) not in visited and b_data[nx, ny][3] > 0:
                                visited.add((nx, ny))
                                queue.append((nx, ny))
                                
                min_y = min(p[1] for p in component)
                components.append((min_y, component))
                
    components.sort(key=lambda x: x[0])
    black_crown_points = components[0][1] # Highest component is the crown
    
    b_min_x = min(p[0] for p in black_crown_points)
    b_max_x = max(p[0] for p in black_crown_points)
    b_min_y = min(p[1] for p in black_crown_points)
    b_max_y = max(p[1] for p in black_crown_points)
    
    b_crown_w = b_max_x - b_min_x
    b_crown_h = b_max_y - b_min_y
    
    # 2. Find the crown in the gold logo
    visited.clear()
    g_components = []
    
    for y in range(g_height):
        for x in range(g_width):
            if (x, y) not in visited and g_data[x, y][3] > 50:
                queue = [(x, y)]
                component = []
                visited.add((x, y))
                
                while queue:
                    cx, cy = queue.pop(0)
                    component.append((cx, cy))
                    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, 1), (-1, 1), (1, -1)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < g_width and 0 <= ny < g_height:
                            if (nx, ny) not in visited and g_data[nx, ny][3] > 50:
                                visited.add((nx, ny))
                                queue.append((nx, ny))
                                
                min_y = min(p[1] for p in component)
                g_components.append((min_y, component))
                
    g_components.sort(key=lambda x: x[0])
    gold_crown_points = g_components[0][1]
    
    g_min_x = min(p[0] for p in gold_crown_points)
    g_max_x = max(p[0] for p in gold_crown_points)
    g_min_y = min(p[1] for p in gold_crown_points)
    g_max_y = max(p[1] for p in gold_crown_points)
    
    g_crown_w = g_max_x - g_min_x
    g_crown_h = g_max_y - g_min_y
    
    # 3. Create output image
    out_img = Image.new("RGBA", (b_width, b_height), (0, 0, 0, 0))
    out_data = out_img.load()
    
    # Copy all original black pixels first
    for y in range(b_height):
        for x in range(b_width):
            out_data[x, y] = b_data[x, y]
            
    # For every pixel in the black crown, sample the corresponding pixel from the gold crown
    for (x, y) in black_crown_points:
        # Calculate relative position 0.0 to 1.0
        rel_x = (x - b_min_x) / b_crown_w if b_crown_w > 0 else 0
        rel_y = (y - b_min_y) / b_crown_h if b_crown_h > 0 else 0
        
        # Map to gold image
        gx = min(int(g_min_x + rel_x * g_crown_w), g_width - 1)
        gy = min(int(g_min_y + rel_y * g_crown_h), g_height - 1)
        
        gold_color = g_data[gx, gy]
        
        # If the mapped gold pixel is somewhat transparent, fallback to a synthesized gradient color
        # This prevents edge artifacts where the two crowns don't perfectly overlap
        if gold_color[3] < 100:
            # Fallback gradient color based on height
            # Top: #FBE595 (251, 229, 149)
            # Bottom: #8A5A19 (138, 90, 25)
            r = int(251 + rel_y * (138 - 251))
            g = int(229 + rel_y * (90 - 229))
            b = int(149 + rel_y * (25 - 149))
            gold_color = (r, g, b, 255)
            
        # Apply the color to the output pixel, preserving the original alpha
        orig_alpha = b_data[x, y][3]
        out_data[x, y] = (gold_color[0], gold_color[1], gold_color[2], orig_alpha)
        
    out_img.save(output_path, "PNG")
    print(f"Successfully applied gradient to crown and saved to {output_path}")

apply_gold_gradient("src/images/partners/BOTS-2026-Logo-Black.png", "src/images/partners/BOTS-Gold-Crown.png", "src/images/partners/BOTS-2026-Logo-Gold-Crown-Black.png")
