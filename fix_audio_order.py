import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

# Pattern for the audio block that was inserted before Harmony
audio_pattern = r"\s*// Trigger audio precisely when the police asset.*?// Stop and reset audio when riot ends completely.*?window\.__riotAudioPlayed = false;\s*if \(window\.__riotAudio\) \{\s*window\.__riotAudio\.pause\(\);\s*window\.__riotAudio\.currentTime = 0;\s*\}\s*\}"

match = re.search(audio_pattern, content, flags=re.DOTALL)
if match:
    audio_block_text = match.group(0)
    # Remove from current location
    content = content.replace(audio_block_text, "")
    
    # Find insertion point: after the while loop for emergency vehicles
    insertion_point = r"emergencyVehicles\.push\(\{ type: 'firetruck'.*?isEmergency: true \}\);\s*\}\s*\}"
    
    match2 = re.search(insertion_point, content, flags=re.DOTALL)
    if match2:
        insert_after = match2.group(0)
        content = content.replace(insert_after, insert_after + "\n" + audio_block_text)
        
        with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
            f.write(content)
        print("Successfully moved audio block")
    else:
        print("Could not find insertion point")
else:
    print("Could not find audio block")

