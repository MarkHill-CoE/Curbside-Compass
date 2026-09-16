import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

# Remove policeSpawnedThisFrame audio block
content = re.sub(r"// Trigger audio precisely when the police asset.*?window\.__riotAudioPending = true;\s*}\s*}", "", content, flags=re.DOTALL)
# Remove stop audio block
content = re.sub(r"// Stop and reset audio when riot ends completely.*?window\.__riotAudioPlayed = false;\s*}", "", content, flags=re.DOTALL)
# Remove resume block
content = re.sub(r"// Resume riot audio if it was blocked by autoplay policies.*?window\.__riotAudioPending = false;\s*}", "", content, flags=re.DOTALL)

with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.write(content)
