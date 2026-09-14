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
        
        // Ensure driver stays on sidewalk/walkway by walking to sidewalk Y (82) first, 
        // then laterally to house X, then up the walkway.
        // d.targetDoorX is the house door X (10 + houseIdx * 55 + 13)
        // d.targetDoorY is the house door Y (40)
        // van.x is the van X. Sidewalk Y is ~82.
        
        const sidewalkY = 82;
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
        } else {
          if (Math.hypot(vanDoorX - d.x, vanDoorY - d.y) <= 1.5) {"""

content = content.replace(target, replacement)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)
print("Updated delivery driver pathing")
