import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

target = """      } else if (type === 'suv') {"""

replacement = """      } else if (type === 'police') {
        const white = '#ffffff';
        const black = '#111111';
        drawFlatRect(x - 1, y - 0.5, 17, 8, 'rgba(0,0,0,0.25)');
        if (!isFlipped) {
          drawBlock(x + 2, y - 0.5, zOffset, 3, 1, 1.5, tire, tire, tire);
          drawBlock(x + 11, y - 0.5, zOffset, 3, 1, 1.5, tire, tire, tire);
          drawBlock(x + 2, y + 6.5, zOffset, 3, 1, 1.5, tire, tire, tire);
          drawBlock(x + 11, y + 6.5, zOffset, 3, 1, 1.5, tire, tire, tire);
          drawBlock(x, y, zOffset + 0.8, 15, 7, 2.5, white, '#dddddd', '#cccccc');
          // black doors
          drawBlock(x + 3, y - 0.2, zOffset + 1, 7, 7.4, 2.3, black, black, black);
          drawBlock(x + 3, y + 0.5, zOffset + 3.3, 8, 6, 2.2, white, glass, glass);
          // lights
          const lightColor = (Date.now() % 400 > 200) ? '#ff0000' : '#0000ff';
          drawBlock(x + 6, y + 2.5, zOffset + 5.5, 2, 2, 0.8, lightColor, lightColor, lightColor);
        } else {
          drawBlock(x + 3, y + 0.5, zOffset, 8, 6, 2.2, white, '#111', '#111');
          drawBlock(x, y, zOffset + 2.2, 15, 7, 2.5, white, '#dddddd', '#cccccc');
          drawBlock(x + 3, y - 0.2, zOffset + 2.4, 7, 7.4, 2.3, black, black, black);
          drawBlock(x + 2, y - 1, zOffset + 4.7, 3, 1, 2, tire, tire, tire);
          drawBlock(x + 11, y - 1, zOffset + 4.7, 3, 1, 2, tire, tire, tire);
        }
      } else if (type === 'firetruck') {
        const red = '#cc0000';
        const redDark = '#990000';
        const chrome = '#eeeeee';
        drawFlatRect(x - 1, y - 0.5, 26, 10, 'rgba(0,0,0,0.3)');
        if (!isFlipped) {
          drawBlock(x + 2, y - 0.5, zOffset, 4, 1.5, 2.5, tire, tire, tire);
          drawBlock(x + 16, y - 0.5, zOffset, 4, 1.5, 2.5, tire, tire, tire);
          drawBlock(x + 2, y + 8, zOffset, 4, 1.5, 2.5, tire, tire, tire);
          drawBlock(x + 16, y + 8, zOffset, 4, 1.5, 2.5, tire, tire, tire);
          drawBlock(x, y, zOffset + 1.2, 24, 9, 7.5, red, redDark, redDark);
          drawBlock(x + 18, y + 0.5, zOffset + 4.2, 6, 8, 4.8, red, glass, glass); // cab
          drawBlock(x + 24, y + 1.5, zOffset + 2, 0.5, 6, 2, chrome, chrome, chrome); // grill
          
          // flashing lights
          const lightColor = (Date.now() % 300 > 150) ? '#ff0000' : '#ffffff';
          drawBlock(x + 19, y + 1, zOffset + 9, 3, 7, 1.0, lightColor, lightColor, lightColor);
        } else {
          drawBlock(x, y, zOffset + 2, 24, 9, 7.5, red, redDark, redDark);
          drawBlock(x + 2, y - 1, zOffset + 9.7, 4, 1.5, 2.5, tire, tire, tire);
          drawBlock(x + 16, y - 1, zOffset + 9.7, 4, 1.5, 2.5, tire, tire, tire);
        }
      } else if (type === 'suv') {"""

content = content.replace(target, replacement)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)
print("patched drawing")
