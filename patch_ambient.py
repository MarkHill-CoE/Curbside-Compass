with open("src/utils/ambientAudio.ts", "r") as f:
    content = f.read()
content = content.replace("this.soundEnabled = true;", "this.soundEnabled = false;")
content = content.replace("public play(): void {", "public play(): void {\n    return;")
content = content.replace("private startWebAudioLoop(): void {", "private startWebAudioLoop(): void {\n    return;")
with open("src/utils/ambientAudio.ts", "w") as f:
    f.write(content)
