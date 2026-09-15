import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

# Fix the moving vehicle riot toggle which also had the setTimeout
moving_target = """          if (v.isBurning) {
            v.speed = 0;
            isRioting = true;
            setIsRiotActive(true);
            if (soundEnabledRef.current) {
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
            }
          } else {"""
moving_replacement = """          if (v.isBurning) {
            v.speed = 0;
            isRioting = true;
            setIsRiotActive(true);
            if (soundEnabledRef.current) playCriticalAlarm();
          } else {"""
content = content.replace(moving_target, moving_replacement)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)
print("Removed remaining redundant timeouts for audio")
