import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

# 1. Update the animate() logic to properly handle Audio context state globally
target1 = """      if (policeSpawnedThisFrame && soundEnabledRef.current && !window.__riotAudioPlayed) {
         window.__riotAudioPlayed = true;
         // Play riot news report right after police car spawns
         const userAudio = new Audio('/audio/riot_news_report.mp3');
         userAudio.volume = 0.8;
         userAudio.play().catch(e => console.warn('Could not play riot audio', e));
      }
      
      // Reset the audio flag when the riot ends completely
      if (numBurning === 0) {
        window.__riotAudioPlayed = false;
      }"""

replacement1 = """      // Trigger audio precisely when the police asset is injected into the rendering pipeline (asset mounting event)
      if (policeSpawnedThisFrame && soundEnabledRef.current && !window.__riotAudioPlayed) {
         window.__riotAudioPlayed = true;
         
         if (!window.__riotAudio) {
           window.__riotAudio = new Audio('/audio/riot_news_report.mp3');
           window.__riotAudio.volume = 0.8;
           window.__riotAudio.loop = true;
         }
         
         window.__riotAudio.currentTime = 0;
         const playPromise = window.__riotAudio.play();
         if (playPromise !== undefined) {
           playPromise.catch(e => {
             console.warn('Riot audio playback blocked by browser autoplay policy. Pending user interaction.', e);
             window.__riotAudioPending = true;
           });
         }
      }
      
      // Stop and reset audio when riot ends completely
      if (numBurning === 0) {
        window.__riotAudioPlayed = false;
        if (window.__riotAudio) {
          window.__riotAudio.pause();
          window.__riotAudio.currentTime = 0;
        }
      }"""

content = content.replace(target1, replacement1)

# 2. Add the global interface declarations
target2 = """declare global { interface Window { __riotAudioPlayed?: boolean; } }"""
replacement2 = """declare global { 
  interface Window { 
    __riotAudioPlayed?: boolean; 
    __riotAudioPending?: boolean;
    __riotAudio?: HTMLAudioElement;
  } 
}"""

content = content.replace(target2, replacement2)

# 3. Add the resume-on-click logic
target3 = """          onClick={(e) => {
            getAudioContext();
            const canvas = canvasRef.current;"""
replacement3 = """          onClick={(e) => {
            getAudioContext();
            // Resume riot audio if it was blocked by autoplay policies
            if (window.__riotAudioPending && window.__riotAudio) {
              window.__riotAudio.play().catch(err => console.warn('Riot audio still blocked', err));
              window.__riotAudioPending = false;
            }
            const canvas = canvasRef.current;"""

content = content.replace(target3, replacement3)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)

print("Applied robust asset-mount audio triggering and autoplay policy handling")
