import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

residents_logic = """
      // Handle Residents
      for (let i = 0; i < residents.length; i++) {
        const r = residents[i];
        
        if (isHarmony) {
          if (r.state === 'inside') {
             if (Math.random() < 0.05) {
                 r.state = 'walking_to_garden';
                 r.targetX = r.homeX - 15 + Math.random() * 30;
                 r.targetY = 45 + Math.random() * 20;
             }
          } else if (r.state === 'walking_to_garden') {
             const dx = r.targetX - r.x;
             const dy = r.targetY - r.y;
             const dist = Math.sqrt(dx*dx + dy*dy);
             if (dist > 1.0) {
                 r.x += (dx/dist) * 0.3;
                 r.y += (dy/dist) * 0.3;
             } else {
                 if (harmonyFlowerGrowth >= 0.9 && Math.random() < 0.05) {
                     r.state = 'visiting';
                     // Find a random neighbor to visit
                     r.friendIdx = Math.floor(Math.random() * residents.length);
                     const friend = residents[r.friendIdx];
                     r.targetX = friend.homeX - 10 + Math.random() * 20;
                     r.targetY = 55 + Math.random() * 15;
                 } else {
                     r.state = 'planting';
                     r.timer = 1.0 + Math.random() * 2.0;
                 }
             }
          } else if (r.state === 'planting') {
             r.timer -= 1/60;
             if (r.timer <= 0) {
                 if (harmonyFlowerGrowth >= 0.9 && Math.random() < 0.3) {
                     r.state = 'visiting';
                     r.friendIdx = Math.floor(Math.random() * residents.length);
                     const friend = residents[r.friendIdx];
                     r.targetX = friend.homeX - 10 + Math.random() * 20;
                     r.targetY = 55 + Math.random() * 15;
                 } else {
                     r.state = 'walking_to_garden';
                     r.targetX = r.homeX - 15 + Math.random() * 30;
                     r.targetY = 45 + Math.random() * 20;
                 }
             }
          } else if (r.state === 'visiting') {
             const dx = r.targetX - r.x;
             const dy = r.targetY - r.y;
             const dist = Math.sqrt(dx*dx + dy*dy);
             if (dist > 1.0) {
                 r.x += (dx/dist) * 0.4;
                 r.y += (dy/dist) * 0.4;
             } else {
                 if (Math.random() < 0.01) {
                     // Go back to own garden
                     r.state = 'walking_to_garden';
                     r.targetX = r.homeX - 15 + Math.random() * 30;
                     r.targetY = 45 + Math.random() * 20;
                 }
             }
          }
        } else {
          // Go back inside
          if (r.state !== 'inside') {
             const dx = r.homeX - r.x;
             const dy = 35 - r.y;
             const dist = Math.sqrt(dx*dx + dy*dy);
             if (dist > 1.0) {
                 r.x += (dx/dist) * 0.6;
                 r.y += (dy/dist) * 0.6;
                 r.state = 'walking_to_garden'; // just using this state to mean 'moving'
             } else {
                 r.x = r.homeX;
                 r.y = 35;
                 r.state = 'inside';
             }
          }
        }
      }
"""

# Find where flowers are rendered
# and insert residents logic before it, then render residents

residents_render = """
      // Draw Residents if outside
      ctx!.save();
      for (let i = 0; i < residents.length; i++) {
         const r = residents[i];
         if (r.state !== 'inside') {
             drawPedestrian(r.x, r.y, 0, r.color, r.state === 'planting' ? 'bystander' : 'normal');
         }
      }
      ctx!.restore();
"""

content = content.replace("      if (isHarmony) {\n        harmonyFlowerGrowth = Math.min(1.0, harmonyFlowerGrowth + 0.005);",
                          residents_logic + "\n      if (isHarmony) {\n        harmonyFlowerGrowth = Math.min(1.0, harmonyFlowerGrowth + 0.005);")

content = content.replace("      if (harmonyFlowerGrowth > 0) {",
                          residents_render + "\n      if (harmonyFlowerGrowth > 0) {")

with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.write(content)
