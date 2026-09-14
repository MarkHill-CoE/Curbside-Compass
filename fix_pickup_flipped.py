import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

target = """          // Bed (Drawn first since cab overlaps it from the front)
          drawBlock(x + 12, y, zOffset + 1, 7, 7.5, 3.2, drawTopC, drawLeftC, drawRightC);
          // Cab 
          drawBlock(x + 1, y, zOffset + 1, 11, 7.5, 3.2, drawTopC, '#111', '#111');"""

replacement = """          // Bed (Drawn first since cab overlaps it from the front)
          drawBlock(x + 11, y, zOffset + 1, 7, 7.5, 3.2, drawTopC, drawLeftC, drawRightC);
          // Cab 
          drawBlock(x, y, zOffset + 1, 11, 7.5, 3.2, drawTopC, '#111', '#111');"""

content = content.replace(target, replacement)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)
print("Flipped positions updated")
