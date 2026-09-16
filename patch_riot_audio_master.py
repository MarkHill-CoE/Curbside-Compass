with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "// Trigger audio precisely when the police asset is injected" in line:
        skip = True
    if skip and "      // Stop and reset audio when riot ends completely" in line:
        skip = False

    if "// Stop and reset audio when riot ends completely" in line:
        skip = True
    if skip and "      // Layer 1: Ground, Road, Sidewalks, Driveways" in line:
        skip = False

    if "// Resume riot audio if it was blocked" in line:
        skip = True
    if skip and "            const canvas = canvasRef.current;" in line:
        skip = False
        
    if not skip:
        new_lines.append(line)

with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.writelines(new_lines)
