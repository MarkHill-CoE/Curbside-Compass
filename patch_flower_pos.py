import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

# Replace flowerBeds initialization
old_flower_gen = """      if (h === 5) {
        for (let j = 0; j < 10; j++) {
          flowerBeds.push({ x: startX + 2 + Math.random() * 5, y: 40 + Math.random() * 25, z: Math.random() * 3, color: flowerColors[Math.floor(Math.random() * flowerColors.length)], id: flowerIdCounter++ });
          flowerBeds.push({ x: startX + 15 + Math.random() * 10, y: 40 + Math.random() * 25, z: Math.random() * 3, color: flowerColors[Math.floor(Math.random() * flowerColors.length)], id: flowerIdCounter++ });
        }
      } else {
        for (let j = 0; j < 25; j++) {
          flowerBeds.push({ x: startX + 5 + Math.random() * 25, y: 40 + Math.random() * 25, z: Math.random() * 3, color: flowerColors[Math.floor(Math.random() * flowerColors.length)], id: flowerIdCounter++ });
        }
      }"""

new_flower_gen = """      if (h === 5) {
        for (let j = 0; j < 15; j++) {
          // Skinny 1 (x: startX+5 to startX+20, door at startX+10, width 3)
          // Front edge y = 36 to 39
          let fx1 = startX + 5 + Math.random() * 15;
          while (fx1 > startX + 9 && fx1 < startX + 14) {
              fx1 = startX + 5 + Math.random() * 15;
          }
          flowerBeds.push({ x: fx1, y: 36 + Math.random() * 3, z: Math.random() * 1.5, color: flowerColors[Math.floor(Math.random() * flowerColors.length)], id: flowerIdCounter++ });
          
          // Skinny 2 (x: startX+25 to startX+40, door at startX+30, width 3)
          let fx2 = startX + 25 + Math.random() * 15;
          while (fx2 > startX + 29 && fx2 < startX + 34) {
              fx2 = startX + 25 + Math.random() * 15;
          }
          flowerBeds.push({ x: fx2, y: 36 + Math.random() * 3, z: Math.random() * 1.5, color: flowerColors[Math.floor(Math.random() * flowerColors.length)], id: flowerIdCounter++ });
        }
      } else {
        for (let j = 0; j < 30; j++) {
          // Standard (x: startX+5 to startX+33, door at startX+13, width 4)
          // Garage starts at startX+33, so we stop before the driveway
          let fx = startX + 5 + Math.random() * 27;
          while (fx > startX + 12 && fx < startX + 18) { // wider berth for the door
              fx = startX + 5 + Math.random() * 27;
          }
          flowerBeds.push({ x: fx, y: 36 + Math.random() * 3, z: Math.random() * 1.5, color: flowerColors[Math.floor(Math.random() * flowerColors.length)], id: flowerIdCounter++ });
        }
      }"""

content = content.replace(old_flower_gen, new_flower_gen)

with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.write(content)
