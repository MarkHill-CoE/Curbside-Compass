import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

target = """      } else if (type === 'pickup') {
        drawFlatRect(x - 1, y - 0.5, 20, 8.5, 'rgba(0,0,0,0.25)');
        drawBlock(x + 2, y - 0.5, zOffset, 3.5, 1, 2, tire, tire, tire);
        drawBlock(x + 13, y - 0.5, zOffset, 3.5, 1, 2, tire, tire, tire);
        drawBlock(x + 2, y + 7, zOffset, 3.5, 1, 2, tire, tire, tire);
        drawBlock(x + 13, y + 7, zOffset, 3.5, 1, 2, tire, tire, tire);
        drawBlock(x + 7, y, zOffset + 1, 11, 7.5, 3.2, drawTopC, drawLeftC, drawRightC);
        drawBlock(x + 8, y + 0.5, zOffset + 4.2, 7, 6.5, 3, drawTopC, glass, glass);
        drawBlock(x, y, zOffset + 1, 7, 7.5, 3.2, drawTopC, drawLeftC, drawRightC);
      }"""

replacement = """      } else if (type === 'pickup') {
        drawFlatRect(x - 1, y - 0.5, 20, 8.5, 'rgba(0,0,0,0.25)');
        if (!isFlipped) {
          drawBlock(x + 2, y - 0.5, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 13, y - 0.5, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 2, y + 7, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 13, y + 7, zOffset, 3.5, 1, 2, tire, tire, tire);
          // Bed (Drawn first)
          drawBlock(x, y, zOffset + 1, 7, 7.5, 3.2, drawTopC, drawLeftC, drawRightC);
          // Cab (Drawn next so it overlaps the bed slightly if needed)
          drawBlock(x + 7, y, zOffset + 1, 11, 7.5, 3.2, drawTopC, drawLeftC, drawRightC);
          // Windshield/Roof
          drawBlock(x + 8, y + 0.5, zOffset + 4.2, 7, 6.5, 3, drawTopC, glass, glass);
        } else {
          drawBlock(x + 2, y - 0.5, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 13, y - 0.5, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 2, y + 7, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 13, y + 7, zOffset, 3.5, 1, 2, tire, tire, tire);
          // Cab (Drawn first since bed is further away in the X axis)
          drawBlock(x + 1, y, zOffset + 1, 11, 7.5, 3.2, drawTopC, drawLeftC, drawRightC);
          // Windshield/Roof
          drawBlock(x + 4, y + 0.5, zOffset + 4.2, 7, 6.5, 3, drawTopC, glass, glass);
          // Bed
          drawBlock(x + 12, y, zOffset + 1, 7, 7.5, 3.2, drawTopC, drawLeftC, drawRightC);
        }
      }"""

content = content.replace(target, replacement)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)
print("Pickup truck logic updated")
