import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

target = """          // Cab (Red)
          drawBlock(x + 1, y + 0.5, zOffset + 1, 7, 7, 5, '#d94136', '#111', '#111');
          // Windshield
          drawBlock(x + 4, y + 1, zOffset + 3.5, 3, 6, 2.5, '#d94136', glass, glass);"""

replacement = """          // Cab (Red)
          drawBlock(x + 1, y + 0.5, zOffset + 1, 7, 7, 5, '#d94136', '#111', '#111');
          // Windshield
          drawBlock(x + 1, y + 1, zOffset + 3.5, 3, 6, 2.5, '#d94136', glass, glass);"""

content = content.replace(target, replacement)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)
print("Flipped windshield fixed")
