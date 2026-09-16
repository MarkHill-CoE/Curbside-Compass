import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

content = content.replace("'/audio/riot_news_report.mp3'", "typeof window !== 'undefined' && window.__agentArtifactAudioUrl ? window.__agentArtifactAudioUrl : '/audio/riot_noise.mp3'")

with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.write(content)
