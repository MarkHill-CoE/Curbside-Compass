import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

target = """        const sidewalkY = 82;
        let walkTargetX = d.targetDoorX;
        let walkTargetY = d.targetDoorY;
        
        // If driver is far from door Y and still near the street, move straight back to sidewalk first
        if (d.y > sidewalkY + 2) {
            walkTargetX = d.x; // go straight back
            walkTargetY = sidewalkY;
        } 
        // Once on sidewalk, if not aligned with house walk, move laterally along sidewalk
        else if (Math.abs(d.x - d.targetDoorX) > 1.5 && d.y > 60) {
            walkTargetX = d.targetDoorX; // move laterally
            walkTargetY = sidewalkY;     // stay on sidewalk Y
        }
        
        const dx = walkTargetX - d.x;
        const dy = walkTargetY - d.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 1.0) {
          d.x += (dx / dist) * 0.65;
          d.y += (dy / dist) * 0.65;
        } else {
          // If we reached the final door target
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
        const sidewalkY = 82;
        
        let walkTargetX = vanDoorX;
        let walkTargetY = vanDoorY;
        
        // Return path: Walkway down to sidewalk, lateral along sidewalk, straight down to van
        // If near house, move straight down to sidewalk
        if (d.y < sidewalkY - 2) {
            walkTargetX = d.targetDoorX; // stay on walkway X
            walkTargetY = sidewalkY;
        } 
        // If on sidewalk but not aligned with van, move laterally along sidewalk
        else if (Math.abs(d.x - vanDoorX) > 1.5 && d.y < vanDoorY - 2) {
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

replacement = """        const sidewalkY = 74; // main long sidewalk (between 70 and 78)
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
