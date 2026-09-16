import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

content = content.replace("if (gaugePercent >= 160 && isAfterQ8)", "if (gaugePercent > 150 && isAfterQ8)")

with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.write(content)
