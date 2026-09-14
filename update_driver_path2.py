import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

target = """      } else if (van.state === 'STOPPED') {
        van.speed = 0;
        const d = van.driver;
        const dx = d.targetDoorX - d.x;
        const dy = d.targetDoorY - d.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 1.5) {
          d.x += (dx / dist) * 0.45;
          d.y += (dy / dist) * 0.45;
        } else {
          van.state = 'AT_DOOR';
          van.stopTimer = 0;
        }
      } else if (van.state === 'AT_DOOR') {
        van.speed = 0;
        van.stopTimer++;
        if (van.stopTimer > 65) {
          van.state = 'RETURNING';
          van.driver.hasPackage = false;
        }
      } else if (van.state === 'RETURNING') {
        van.speed = 0;
        const d = van.driver;
        const vdx = (van.x + 10) - d.x;
        const vdy = (van.y - 2) - d.y;
        const dist = Math.hypot(vdx, vdy);

        if (dist > 1.5) {
          d.x += (vdx / dist) * 0.45;
          d.y += (vdy / dist) * 0.45;
        } else {"""

replacement = """      } else if (van.state === 'STOPPED') {
        van.speed = 0;
        const d = van.driver;
        
        const sidewalkY = 74; // main long sidewalk (between 70 and 78)
        let walkTargetX = d.targetDoorX; // front house door X
        let walkTargetY = d.targetDoorY; // front house door Y
        
        // Path logic (Van to Door):
        // 1. Move straight up (decrease Y) from van to the sidewalk.
        // 2. Move laterally (along X) on the sidewalk until aligned with the house walkway.
        // 3. Move straight up (decrease Y) along the house walkway to the door.
        
        if (d.y > sidewalkY + 2) {
            // Step 1: Still near street, move straight back to sidewalk
            walkTargetX = d.x;
            walkTargetY = sidewalkY;
        } else if (Math.abs(d.x - d.targetDoorX) > 1.5 && d.y > d.targetDoorY + 5) {
            // Step 2: On sidewalk (or close), but not aligned with walkway X. Move laterally.
            walkTargetX = d.targetDoorX;
            walkTargetY = sidewalkY;
        }
        
        const dx = walkTargetX - d.x;
        const dy = walkTargetY - d.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 1.0) {
          d.x += (dx / dist) * 0.65;
          d.y += (dy / dist) * 0.65;
        } else {
          // Check final destination
          if (Math.hypot(d.targetDoorX - d.x, d.targetDoorY - d.y) <= 1.5) {
            van.state = 'AT_DOOR';
            van.stopTimer = 0;
          }
        }
      } else if (van.state === 'AT_DOOR') {
        van.speed = 0;
        van.stopTimer++;
        if (van.stopTimer > 65) {
          van.state = 'RETURNING';
          van.driver.hasPackage = false;
        }
      } else if (van.state === 'RETURNING') {
        van.speed = 0;
        const d = van.driver;
        
        const vanDoorX = van.x + 10;
        const vanDoorY = van.y - 2;
        const sidewalkY = 74; // main long sidewalk
        
        let walkTargetX = vanDoorX;
        let walkTargetY = vanDoorY;
        
        // Path logic (Door to Van):
        // 1. Move straight down (increase Y) from door to the sidewalk.
        // 2. Move laterally (along X) on the sidewalk until aligned with the van.
        // 3. Move straight down (increase Y) from the sidewalk to the van.
        
        if (d.y < sidewalkY - 2) {
            // Step 1: Near house, move straight down to sidewalk
            walkTargetX = d.targetDoorX;
            walkTargetY = sidewalkY;
        } else if (Math.abs(d.x - vanDoorX) > 1.5 && d.y < vanDoorY - 2) {
            // Step 2: On sidewalk, move laterally until aligned with van
            walkTargetX = vanDoorX;
            walkTargetY = sidewalkY;
        }
        
        const vdx = walkTargetX - d.x;
        const vdy = walkTargetY - d.y;
        const dist = Math.hypot(vdx, vdy);

        if (dist > 1.0) {
          d.x += (vdx / dist) * 0.65;
          d.y += (vdy / dist) * 0.65;
        } else {"""

content = content.replace(target, replacement)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)
print("Delivery driver route fixed")
