import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

replacement = """      if (harmonyFlowerGrowth > 0) {
        for (let i = 0; i < flowerBeds.length; i++) {
          const f = flowerBeds[i];
          const individualGrowth = Math.max(0, Math.min(1, (harmonyFlowerGrowth * 1.5) - (i % 10) * 0.05));
          if (individualGrowth > 0) {
             const scaleAnim = Math.sin(individualGrowth * Math.PI / 2);
             const h = 10 * scaleAnim;
             // Stem 
             drawBlock(f.x, f.y, 0, 2.0, 2.0, h, '#1e633a', '#144528', '#144528');
             // Flower head (very large, 8x8 wide in simulation units)
             drawBlock(f.x - 3.0 * scaleAnim, f.y - 3.0 * scaleAnim, h, 8.0 * scaleAnim, 8.0 * scaleAnim, 4.0 * scaleAnim, f.color, f.color, f.color);
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
