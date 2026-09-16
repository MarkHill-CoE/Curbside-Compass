import re

with open("src/types.ts", "r") as f:
    content = f.read()

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

if "__agentArtifactAudioUrl" not in content:
    content = content + "\n" + window_extension

with open("src/types.ts", "w") as f:
    f.write(content)
