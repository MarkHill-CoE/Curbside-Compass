import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

replacement = """      // Bystanders on sidewalk: when cars start burning, bystanders gather on the sidewalk while protesters block the road
      const burningRoadLocations = activeVehicles.filter(v => v.isBurning).map(v => v.x).concat(Array.from(flippedCars).map(idx => houseCarAssignments[activeIndices[idx]]?.x || 160));
"""

content = content.replace("      // Bystanders on sidewalk: when cars start burning, bystanders gather on the sidewalk while protesters block the road\n", replacement)

with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.write(content)
