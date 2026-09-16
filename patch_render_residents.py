import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

# Replace rendering residents
old_render = """      // Draw Residents if outside
      ctx!.save();
      for (let i = 0; i < residents.length; i++) {
         const r = residents[i];
         if (r.state !== 'inside') {
             drawPedestrian(r.x, r.y, 0, r.color, r.state === 'planting' ? 'bystander' : 'normal');
         }
      }
      ctx!.restore();"""

new_render = """      // Draw Residents if outside
      ctx!.save();
      for (let i = 0; i < residents.length; i++) {
         const r = residents[i];
         if (r.state !== 'inside') {
             // If visiting and close to target, trigger talking animation
             const isTalking = r.state === 'visiting' && (Math.abs(r.targetX - r.x) < 2.0) && (Math.abs(r.targetY - r.y) < 2.0);
             const zBob = isTalking && (Date.now() % 600 < 300) ? 1.0 : 0; // Simple bobbing animation
             
             drawPedestrian(r.x, r.y, zBob, r.color, isTalking ? 'bystander' : 'normal');
             
             if (isTalking) {
                 drawSpeechBubble(r.x, r.y, zBob);
             }
         }
      }
      ctx!.restore();"""

content = content.replace(old_render, new_render)

speech_bubble = """    function drawHonkBubble(x: number, y: number, z: number) {
      const pos = project(x + 5, y + 2, z + 8);
      ctx!.save();
      ctx!.fillStyle = '#FFC72C';
      ctx!.strokeStyle = '#193A5A';
      ctx!.lineWidth = 1.5;

      ctx!.beginPath();
      ctx!.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.moveTo(pos.x - 4, pos.y + 12);
      ctx!.lineTo(pos.x - 8, pos.y + 20);
      ctx!.lineTo(pos.x + 2, pos.y + 14);
      ctx!.fillStyle = '#FFC72C';
      ctx!.fill();
      ctx!.stroke();
      
      // Honk lines
      ctx!.strokeStyle = '#193A5A';
      ctx!.beginPath();
      ctx!.moveTo(pos.x - 6, pos.y - 2);
      ctx!.lineTo(pos.x - 2, pos.y + 2);
      ctx!.moveTo(pos.x + 2, pos.y - 2);
      ctx!.lineTo(pos.x + 6, pos.y + 2);
      ctx!.stroke();

      ctx!.restore();
    }

    function drawSpeechBubble(x: number, y: number, z: number) {
      const pos = project(x + 1, y - 1, z + 6);
      ctx!.save();
      ctx!.fillStyle = '#FFFFFF';
      ctx!.strokeStyle = '#193A5A';
      ctx!.lineWidth = 1.0;

      ctx!.beginPath();
      ctx!.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.stroke();

      // little dot inside
      ctx!.fillStyle = '#193A5A';
      ctx!.beginPath();
      ctx!.arc(pos.x - 2, pos.y, 1, 0, Math.PI * 2);
      ctx!.arc(pos.x + 2, pos.y, 1, 0, Math.PI * 2);
      ctx!.fill();

      // tail
      ctx!.beginPath();
      ctx!.moveTo(pos.x - 2, pos.y + 7);
      ctx!.lineTo(pos.x - 4, pos.y + 12);
      ctx!.lineTo(pos.x + 1, pos.y + 7);
      ctx!.fillStyle = '#FFFFFF';
      ctx!.fill();
      ctx!.stroke();

      ctx!.restore();
    }"""

# Actually, replacing the existing drawHonkBubble function entirely is safer
content = re.sub(
    r"    function drawHonkBubble\(x: number, y: number, z: number\) \{.*?ctx!\.restore\(\);\s*\}",
    speech_bubble,
    content,
    flags=re.DOTALL,
    count=1
)

with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.write(content)
