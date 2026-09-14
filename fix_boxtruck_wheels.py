import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

target = """      } else if (type === 'boxTruck') {
        drawFlatRect(x - 1, y - 0.5, 25, 9, 'rgba(0,0,0,0.3)');
        if (!isFlipped) {
          // Tires
          drawBlock(x + 2, y - 0.5, zOffset, 4, 1, 2, tire, tire, tire);
          drawBlock(x + 17, y - 0.5, zOffset, 3, 1, 2, tire, tire, tire);
          drawBlock(x + 2, y + 7.5, zOffset, 4, 1, 2, tire, tire, tire);
          drawBlock(x + 17, y + 7.5, zOffset, 3, 1, 2, tire, tire, tire);
          // Cab (Red)
          drawBlock(x + 16, y + 0.5, zOffset + 1, 7, 7, 5, '#d94136', adjustColor('#d94136', -15), adjustColor('#d94136', -30));
          // Windshield
          drawBlock(x + 20, y + 1, zOffset + 3.5, 3, 6, 2.5, '#d94136', glass, glass);
          // Box (White) with slight overhang over the cab
          drawBlock(x, y, zOffset + 1.5, 17, 8, 9.5, '#f0f2f5', '#dcdfe3', '#c8cbcf');
        } else {
          // Tires
          drawBlock(x + 3, y - 0.5, zOffset, 3, 1, 2, tire, tire, tire);
          drawBlock(x + 18, y - 0.5, zOffset, 4, 1, 2, tire, tire, tire);
          drawBlock(x + 3, y + 7.5, zOffset, 3, 1, 2, tire, tire, tire);
          drawBlock(x + 18, y + 7.5, zOffset, 4, 1, 2, tire, tire, tire);
          // Cab (Red)
          drawBlock(x + 1, y + 0.5, zOffset + 1, 7, 7, 5, '#d94136', '#111', '#111');
          // Windshield
          drawBlock(x + 1, y + 1, zOffset + 3.5, 3, 6, 2.5, '#d94136', glass, glass);
          // Box (White)
          drawBlock(x + 7, y, zOffset + 1.5, 17, 8, 9.5, '#f0f2f5', '#dcdfe3', '#c8cbcf');
        }
      }"""

replacement = """      } else if (type === 'boxTruck') {
        drawFlatRect(x - 1, y - 0.5, 25, 9, 'rgba(0,0,0,0.3)');
        if (!isFlipped) {
          // Tires
          drawBlock(x + 2, y - 0.5, zOffset, 4, 1, 2, tire, tire, tire);
          drawBlock(x + 19, y - 0.5, zOffset, 3, 1, 2, tire, tire, tire);
          drawBlock(x + 2, y + 7.5, zOffset, 4, 1, 2, tire, tire, tire);
          drawBlock(x + 19, y + 7.5, zOffset, 3, 1, 2, tire, tire, tire);
          // Cab (Red)
          drawBlock(x + 16, y + 0.5, zOffset + 1, 7, 7, 5, '#d94136', adjustColor('#d94136', -15), adjustColor('#d94136', -30));
          // Windshield
          drawBlock(x + 20, y + 1, zOffset + 3.5, 3, 6, 2.5, '#d94136', glass, glass);
          // Box (White) with slight overhang over the cab
          drawBlock(x, y, zOffset + 1.5, 17, 8, 9.5, '#f0f2f5', '#dcdfe3', '#c8cbcf');
        } else {
          // Tires
          drawBlock(x + 2, y - 0.5, zOffset, 3, 1, 2, tire, tire, tire);
          drawBlock(x + 18, y - 0.5, zOffset, 4, 1, 2, tire, tire, tire);
          drawBlock(x + 2, y + 7.5, zOffset, 3, 1, 2, tire, tire, tire);
          drawBlock(x + 18, y + 7.5, zOffset, 4, 1, 2, tire, tire, tire);
          // Cab (Red)
          drawBlock(x + 1, y + 0.5, zOffset + 1, 7, 7, 5, '#d94136', '#111', '#111');
          // Windshield
          drawBlock(x + 1, y + 1, zOffset + 3.5, 3, 6, 2.5, '#d94136', glass, glass);
          // Box (White)
          drawBlock(x + 7, y, zOffset + 1.5, 17, 8, 9.5, '#f0f2f5', '#dcdfe3', '#c8cbcf');
        }
      }"""

content = content.replace(target, replacement)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)
print("Wheels adjusted")
