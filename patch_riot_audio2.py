import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

# Replace riot toggle logic again for flipped cars
riot_target2 = """            if (flippedCars.has(i)) {
              flippedCars.delete(i);
              if (flippedCars.size === 0 && !activeVehicles.some(v => v.isBurning)) {
                isRioting = false;
                setIsRiotActive(false);
              }
            } else {
              flippedCars.add(i);
              isRioting = true;
              setIsRiotActive(true);
              if (soundEnabledRef.current) playCriticalAlarm();
            }"""
riot_replacement2 = """            if (flippedCars.has(i)) {
              flippedCars.delete(i);
              if (flippedCars.size === 0 && !activeVehicles.some(v => v.isBurning)) {
                isRioting = false;
                setIsRiotActive(false);
              }
            } else {
              flippedCars.add(i);
              isRioting = true;
              setIsRiotActive(true);
              
              if (soundEnabledRef.current) {
                playCriticalAlarm();
                setTimeout(() => {
                  if (soundEnabledRef.current) {
                    const riotAudio = new Audio('/audio/riot_noise.ogg');
                    riotAudio.volume = 0.25;
                    riotAudio.play().catch(e => console.warn('Could not play riot audio', e));
                  }
                }, 1200);
              }
            }"""
content = content.replace(riot_target2, riot_replacement2)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)

print("Applied riot audio patch 2")
