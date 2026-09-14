import re
with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

target = """          if (h === 5) {
            // For lot 5, without a driveway, we can fit an extra curbside car!
            assignments.push({
              type: typesX[(h + 1) % 3],
              x: baseX + 13.0,
              y: 94,
              w: 16,
              d: 7.5,
              color
            });
            assignments.push({
              type: typesX[(h + 2) % 3],
              x: baseX + 30.5,
              y: 94,
              w: 16,
              d: 7.5,
              color
            });"""

replacement = """          if (h === 5) {
            // For lot 5, without a driveway, we can fit an extra curbside car!
            assignments.push({
              type: typesX[(h + 1) % 3],
              x: baseX + 13.0,
              y: 94,
              w: 16,
              d: 7.5,
              color
            });
            assignments.push({
              type: typesX[(h + 2) % 3],
              x: baseX + 32.5,
              y: 94,
              w: 16,
              d: 7.5,
              color: edmontonPalette[3].hex // match the red house
            });"""

content = content.replace(target, replacement)
with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)
print("patched house logic")
