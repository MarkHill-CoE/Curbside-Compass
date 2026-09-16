import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

replacement = """      if (harmonyFlowerGrowth > 0) {
        for (let i = 0; i < flowerBeds.length; i++) {
          const f = flowerBeds[i];
          const individualGrowth = Math.max(0, Math.min(1, (harmonyFlowerGrowth * 1.5) - (i % 10) * 0.05));
          if (individualGrowth > 0) {
             const scale = Math.sin(individualGrowth * Math.PI / 2);
             const h = 2 * scale;
             // Stem
             drawBlock(f.x, f.y, 0, 0.4, 0.4, h, '#1e633a', '#144528', '#144528');
             // Flower head
             drawBlock(f.x - 0.5 * scale, f.y - 0.5 * scale, h, 1.4 * scale, 1.4 * scale, 0.6 * scale, f.color, f.color, f.color);
             
             // DEBUG
             const p = project(f.x, f.y, h);
             ctx!.fillStyle = '#ff00ff';
             ctx!.fillRect(p.x, p.y, 5, 5);
          }
        }
      }"""

content = re.sub(
    r"      if \(harmonyFlowerGrowth > 0\) {.*?// Layer 3: Vehicles",
    replacement + "\n      // Layer 3: Vehicles",
    content,
    flags=re.DOTALL
)

with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.write(content)
