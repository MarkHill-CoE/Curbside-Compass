import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

# Replace activeQuestionRef.current >= 9 with >= 10
content = content.replace("activeQuestionRef.current >= 9", "activeQuestionRef.current >= 10")

with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.write(content)
