import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

# Replace riot toggle logic for flipped cars
riot_target2 = """              if (soundEnabledRef.current) {
                playCriticalAlarm();
                setTimeout(() => {
                  if (soundEnabledRef.current) {
                    const riotAudio = new Audio('/city-traffic.mp3'); // Fallback to traffic if missing
                    riotAudio.volume = 0.6;
                    riotAudio.play().catch(e => console.warn('Could not play riot audio', e));
                  }
                }, 1200);
              }"""
riot_replacement2 = """              if (soundEnabledRef.current) {
                playCriticalAlarm();
                setTimeout(() => {
                  if (soundEnabledRef.current) {
                    // Try to play user audio file if present, otherwise fallback
                    const userAudio = new Audio('/audio/riot_news_report.mp3');
                    userAudio.volume = 0.9;
                    userAudio.play().catch(() => {
                      const fallback = new Audio('/city-traffic.mp3');
                      fallback.volume = 0.6;
                      fallback.play().catch(e => console.warn('Could not play fallback riot audio', e));
                    });
                  }
                }, 1200);
              }"""
content = content.replace(riot_target2, riot_replacement2)

# Same for moving traffic
riot_target = """          if (soundEnabledRef.current) {
            playCriticalAlarm();
            setTimeout(() => {
              if (soundEnabledRef.current) {
                const riotAudio = new Audio('/audio/riot_noise.ogg');
                riotAudio.volume = 0.25;
                riotAudio.play().catch(e => console.warn('Could not play riot audio', e));
              }
            }, 1200); // Play after sirens start
          }"""
riot_replacement = """          if (soundEnabledRef.current) {
            playCriticalAlarm();
            setTimeout(() => {
              if (soundEnabledRef.current) {
                // Try to play user audio file if present, otherwise fallback
                const userAudio = new Audio('/audio/riot_news_report.mp3');
                userAudio.volume = 0.9;
                userAudio.play().catch(() => {
                  const fallback = new Audio('/city-traffic.mp3');
                  fallback.volume = 0.6;
                  fallback.play().catch(e => console.warn('Could not play fallback riot audio', e));
                });
              }
            }, 1200); // Play after sirens start
          }"""
content = content.replace(riot_target, riot_replacement)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)

print("Applied master riot audio patch")
