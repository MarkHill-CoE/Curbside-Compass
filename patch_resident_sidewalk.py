import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

# Replace residents logic
old_logic = """
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
"""

new_logic = """
        if (isHarmony) {
          if (r.state === 'inside') {
             if (Math.random() < 0.05) {
                 r.state = 'walking_to_garden';
                 r.targetX = r.homeX - 10 + Math.random() * 20;
                 r.targetY = 75 + Math.random() * 6; // Sidewalk Y
             }
          } else if (r.state === 'walking_to_garden') {
             const dx = r.targetX - r.x;
             const dy = r.targetY - r.y;
             const dist = Math.sqrt(dx*dx + dy*dy);
             if (dist > 1.0) {
                 r.x += (dx/dist) * 0.3;
                 r.y += (dy/dist) * 0.3;
             } else {
                 if (harmonyFlowerGrowth >= 0.3 && Math.random() < 0.5) {
                     r.state = 'visiting';
                     // Find a random neighbor to visit
                     r.friendIdx = Math.floor(Math.random() * residents.length);
                     const friend = residents[r.friendIdx];
                     r.targetX = friend.x - 5 + Math.random() * 10;
                     r.targetY = 75 + Math.random() * 6;
                 } else {
                     r.state = 'planting';
                     r.timer = 1.0 + Math.random() * 2.0;
                 }
             }
          } else if (r.state === 'planting') {
             r.timer -= 1/60;
             if (r.timer <= 0) {
                 if (harmonyFlowerGrowth >= 0.3 && Math.random() < 0.8) {
                     r.state = 'visiting';
                     r.friendIdx = Math.floor(Math.random() * residents.length);
                     const friend = residents[r.friendIdx];
                     r.targetX = friend.x - 5 + Math.random() * 10;
                     r.targetY = 75 + Math.random() * 6;
                 } else {
                     r.state = 'walking_to_garden';
                     r.targetX = r.homeX - 15 + Math.random() * 30;
                     r.targetY = 75 + Math.random() * 6;
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
                 if (Math.random() < 0.02) {
                     // Go back to own sidewalk area
                     r.state = 'walking_to_garden';
                     r.targetX = r.homeX - 10 + Math.random() * 20;
                     r.targetY = 75 + Math.random() * 6;
                 }
             }
          }
"""

content = content.replace(old_logic, new_logic)

with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.write(content)
