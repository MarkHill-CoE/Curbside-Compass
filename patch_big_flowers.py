import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

replacement = """      if (harmonyFlowerGrowth > 0) {
        for (let i = 0; i < flowerBeds.length; i++) {
          const f = flowerBeds[i];
          const individualGrowth = Math.max(0, Math.min(1, (harmonyFlowerGrowth * 1.5) - (i % 10) * 0.05));
          if (individualGrowth > 0) {
             const scale = Math.sin(individualGrowth * Math.PI / 2);
             const h = 4 * scale;
             // Stem
             drawBlock(f.x, f.y, 0, 1.0, 1.0, h, '#1e633a', '#144528', '#144528');
             // Flower head
             drawBlock(f.x - 1.0 * scale, f.y - 1.0 * scale, h, 3.0 * scale, 3.0 * scale, 1.5 * scale, f.color, f.color, f.color);
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
