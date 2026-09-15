import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

# Replace riot toggle logic again for flipped cars
riot_target2 = """              if (soundEnabledRef.current) {
                playCriticalAlarm();
                setTimeout(() => {
                  if (soundEnabledRef.current) {
                    const riotAudio = new Audio('/audio/riot_noise.ogg');
                    riotAudio.volume = 0.25;
                    riotAudio.play().catch(e => console.warn('Could not play riot audio', e));
                  }
                }, 1200);
              }"""
riot_replacement2 = """              if (soundEnabledRef.current) {
                playCriticalAlarm();
                setTimeout(() => {
                  if (soundEnabledRef.current) {
                    const riotAudio = new Audio('/city-traffic.mp3'); // Fallback to traffic if missing
                    riotAudio.volume = 0.6;
                    riotAudio.play().catch(e => console.warn('Could not play riot audio', e));
                  }
                }, 1200);
              }"""
content = content.replace(riot_target2, riot_replacement2)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)

print("Applied riot audio patch 3")
