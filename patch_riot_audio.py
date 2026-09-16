with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

# Add the audio logic back in
# Find the harmony trigger, and insert before it
audio_block = """
      // Trigger audio precisely when the police asset is injected into the rendering pipeline (asset mounting event)
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
      }
"""

content = content.replace("      // Harmony Trigger: Well-managed neighborhood", audio_block + "\n      // Harmony Trigger: Well-managed neighborhood")

# Add the resume block in the onClick handler
resume_block = """          onClick={(e) => {
            getAudioContext();
            // Resume riot audio if it was blocked by autoplay policies
            if (window.__riotAudioPending && window.__riotAudio) {
              window.__riotAudio.play().catch(err => console.warn('Riot audio still blocked', err));
              window.__riotAudioPending = false;
            }"""

content = content.replace("          onClick={(e) => {\n            getAudioContext();", resume_block)


with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.write(content)
