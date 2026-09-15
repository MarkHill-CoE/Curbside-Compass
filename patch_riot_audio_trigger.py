import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

# 1. Remove the setTimeout logic from the click handlers (the audio will be triggered centrally)
# For road vehicles
click_target_1 = """              if (soundEnabledRef.current) {
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
click_replacement_1 = """              if (soundEnabledRef.current) playCriticalAlarm();"""
content = content.replace(click_target_1, click_replacement_1)

# 2. Modify the emergency vehicle spawn loop to trigger the audio when the first police car appears
emergency_spawn_target = """      while (emergencyVehicles.length < numBurning * 2) {
        const idx = Math.floor(emergencyVehicles.length / 2);
        const isPolice = emergencyVehicles.length % 2 === 0;
        if (isPolice) {
          emergencyVehicles.push({ type: 'police', x: -800 - idx * 450, y: 117, baseY: 117, targetY: 117, w: 15, d: 7, baseSpeed: 2.2, speed: 2.2, color: '#ffffff', stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0, isEmergency: true });
        } else {
          emergencyVehicles.push({ type: 'firetruck', x: -900 - idx * 450, y: 117, baseY: 117, targetY: 117, w: 28, d: 9, baseSpeed: 2.0, speed: 2.0, color: '#cc0000', stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0, isEmergency: true });
        }
      }"""

emergency_spawn_replacement = """      // Flag to track if we need to trigger audio
      let policeSpawnedThisFrame = false;
      while (emergencyVehicles.length < numBurning * 2) {
        const idx = Math.floor(emergencyVehicles.length / 2);
        const isPolice = emergencyVehicles.length % 2 === 0;
        if (isPolice) {
          if (emergencyVehicles.length === 0) policeSpawnedThisFrame = true;
          emergencyVehicles.push({ type: 'police', x: -800 - idx * 450, y: 117, baseY: 117, targetY: 117, w: 15, d: 7, baseSpeed: 2.2, speed: 2.2, color: '#ffffff', stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0, isEmergency: true });
        } else {
          emergencyVehicles.push({ type: 'firetruck', x: -900 - idx * 450, y: 117, baseY: 117, targetY: 117, w: 28, d: 9, baseSpeed: 2.0, speed: 2.0, color: '#cc0000', stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0, isEmergency: true });
        }
      }
      
      if (policeSpawnedThisFrame && soundEnabledRef.current && !window.__riotAudioPlayed) {
         window.__riotAudioPlayed = true;
         // Play riot news report right after police car spawns
         const userAudio = new Audio('/audio/riot_news_report.mp3');
         userAudio.volume = 0.9;
         userAudio.play().catch(() => {
           const fallback = new Audio('/city-traffic.mp3');
           fallback.volume = 0.6;
           fallback.play().catch(e => console.warn('Could not play fallback riot audio', e));
         });
      }
      
      // Reset the audio flag when the riot ends completely
      if (numBurning === 0) {
        window.__riotAudioPlayed = false;
      }"""
content = content.replace(emergency_spawn_target, emergency_spawn_replacement)

# To ensure type safety, let's inject `declare global { interface Window { __riotAudioPlayed?: boolean; } }` if not present
if "interface Window { __riotAudioPlayed" not in content:
    content = "declare global { interface Window { __riotAudioPlayed?: boolean; } }\n\n" + content

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)

print("Applied centralized riot audio trigger based on police vehicle spawn.")
