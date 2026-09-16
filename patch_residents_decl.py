import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

residents_init = """
    let harmonyFlowerGrowth = 0;
    const flowerBeds: Array<{x: number, y: number, color: string, z: number, id: number}> = [];
    const residents: Array<{x: number, y: number, state: 'inside' | 'walking_to_garden' | 'planting' | 'visiting', targetX: number, targetY: number, color: string, homeX: number, timer: number, friendIdx: number}> = [];
    const flowerColors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#f368e0', '#ff9f43', '#0abde3', '#e17055', '#fdcb6e'];
    const shirtColors = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#e67e22', '#1abc9c'];
    const _lotWidth = 55;
    let flowerIdCounter = 0;
    for (let h = 0; h < 6; h++) {
      const startX = 10 + h * _lotWidth;
      
      const numResidents = (h === 5) ? 4 : 2;
      for (let r = 0; r < numResidents; r++) {
         const homeDoorX = (h === 5) ? (startX + (r % 2 === 0 ? 5 : 25)) : (startX + 28);
         residents.push({
             x: homeDoorX,
             y: 35,
             state: 'inside',
             targetX: homeDoorX,
             targetY: 35,
             color: shirtColors[Math.floor(Math.random() * shirtColors.length)],
             homeX: homeDoorX,
             timer: Math.random() * 2,
             friendIdx: -1
         });
      }

      if (h === 5) {
        for (let j = 0; j < 10; j++) {
          flowerBeds.push({ x: startX + 2 + Math.random() * 5, y: 40 + Math.random() * 25, z: Math.random() * 3, color: flowerColors[Math.floor(Math.random() * flowerColors.length)], id: flowerIdCounter++ });
          flowerBeds.push({ x: startX + 15 + Math.random() * 10, y: 40 + Math.random() * 25, z: Math.random() * 3, color: flowerColors[Math.floor(Math.random() * flowerColors.length)], id: flowerIdCounter++ });
        }
      } else {
        for (let j = 0; j < 25; j++) {
          flowerBeds.push({ x: startX + 5 + Math.random() * 25, y: 40 + Math.random() * 25, z: Math.random() * 3, color: flowerColors[Math.floor(Math.random() * flowerColors.length)], id: flowerIdCounter++ });
        }
      }
    }
"""

content = re.sub(
    r"let harmonyFlowerGrowth = 0;.*?for \(let j = 0; j < 25; j\+\+\) {[^}]+}\s*}\s*}",
    residents_init,
    content,
    flags=re.DOTALL, count=1
)

with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.write(content)
