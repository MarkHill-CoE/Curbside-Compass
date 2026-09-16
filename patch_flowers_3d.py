import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

replacement = """      // Draw growing flower beds behind vehicles but in front of houses
      if (harmonyFlowerGrowth > 0) {
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
          }
        }
      }"""

# Replace the previous fake 3D rendering with the actual drawBlock
content = re.sub(
    r"// Draw growing flower beds behind vehicles but in front of houses.*?ctx!\.restore\(\);\s*}",
    replacement,
    content, flags=re.DOTALL
)

with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.write(content)
