import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

content = re.sub(
    r"\s*// DEBUG\s*const p = project\(f\.x, f\.y, h\);\s*ctx!\.fillStyle = '#ff00ff';\s*ctx!\.fillRect\(p\.x, p\.y, 5, 5\);",
    "",
    content,
    flags=re.DOTALL
)

with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.write(content)
