import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

target = """         // Play riot news report right after police car spawns
         const userAudio = new Audio('/audio/riot_news_report.mp3');
         userAudio.volume = 0.9;
         userAudio.play().catch(() => {
           const fallback = new Audio('/city-traffic.mp3');
           fallback.volume = 0.6;
           fallback.play().catch(e => console.warn('Could not play fallback riot audio', e));
         });"""

replacement = """         // Play riot news report right after police car spawns
         const userAudio = new Audio('/audio/riot_news_report.mp3');
         userAudio.volume = 0.8;
         userAudio.play().catch(e => console.warn('Could not play riot audio', e));"""

content = content.replace(target, replacement)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)

print("Simplified audio playback")
