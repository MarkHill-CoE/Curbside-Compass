import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

target = """          // Cab 
          drawBlock(x, y, zOffset + 1, 11, 7.5, 3.2, drawTopC, '#111', '#111');
          // Windshield/Roof
          drawBlock(x + 4, y + 0.5, zOffset + 4.2, 7, 6.5, 3, drawTopC, glass, glass);"""

replacement = """          // Cab 
          drawBlock(x + 1, y, zOffset + 1, 11, 7.5, 3.2, drawTopC, '#111', '#111');
          // Windshield/Roof
          drawBlock(x + 3, y + 0.5, zOffset + 4.2, 7, 6.5, 3, drawTopC, glass, glass);"""

content = content.replace(target, replacement)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)
print("Flipped shading updated again")
