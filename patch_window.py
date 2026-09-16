import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

# Add Window interface extension at the top
window_extension = """
declare global {
  interface Window {
    __riotAudioPlayed?: boolean;
    __riotAudioPending?: boolean;
    __riotAudio?: HTMLAudioElement;
    __agentArtifactAudioUrl?: string;
  }
}
"""

if "declare global {" not in content:
    content = content.replace("import { ambientAudio } from '../utils/ambientAudio';", "import { ambientAudio } from '../utils/ambientAudio';\n" + window_extension)

with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.write(content)
