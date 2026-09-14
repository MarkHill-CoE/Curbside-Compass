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
          van.driver.hasPackage = false;
          van.state = 'RETURNING';
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
        
        // Path logic: Van -> Sidewalk -> Door
        const sidewalkY = 74;
        let walkTargetX = d.targetDoorX;
        let walkTargetY = d.targetDoorY;
        
        if (d.y > sidewalkY + 2) {
            walkTargetX = d.x;
            walkTargetY = sidewalkY;
        } else if (Math.abs(d.x - d.targetDoorX) > 1.5 && d.y > d.targetDoorY + 5) {
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
          if (Math.hypot(d.targetDoorX - d.x, d.targetDoorY - d.y) <= 1.5) {
            van.state = 'AT_DOOR';
            van.stopTimer = 0;
          }
        }
      } else if (van.state === 'AT_DOOR') {
        van.speed = 0;
        van.stopTimer++;
        if (van.stopTimer > 65) {
          van.driver.hasPackage = false;
          van.state = 'RETURNING';
        }
      } else if (van.state === 'RETURNING') {
        van.speed = 0;
        const d = van.driver;
        const vanDoorX = van.x + 10;
        const vanDoorY = van.y - 2;
        const sidewalkY = 74;
        
        // Path logic: Door -> Sidewalk -> Van
        let walkTargetX = vanDoorX;
        let walkTargetY = vanDoorY;
        
        if (d.y < sidewalkY - 2) {
            walkTargetX = d.targetDoorX;
            walkTargetY = sidewalkY;
        } else if (Math.abs(d.x - vanDoorX) > 1.5 && d.y < vanDoorY - 2) {
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
