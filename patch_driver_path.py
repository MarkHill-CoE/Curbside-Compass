import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

# 1. Update interface
interface_target = """      driver: {
        x: number;
        y: number;
        targetDoorX: number;
        targetDoorY: number;
        hasPackage: boolean;
        active: boolean;
      };"""
interface_replacement = """      driver: {
        x: number;
        y: number;
        targetDoorX: number;
        targetDoorY: number;
        hasPackage: boolean;
        active: boolean;
        path?: {x: number; y: number}[];
        pathIdx?: number;
      };"""
content = content.replace(interface_target, interface_replacement)

# 2. Update 'APPROACHING' transition to 'STOPPED'
approach_target = """        if (van.x >= van.targetStopX) {
          van.x = van.targetStopX;
          van.speed = 0;
          van.state = 'STOPPED';
          van.driver.active = true;
          van.driver.x = van.x + 10;
          van.driver.y = van.y - 2;
          van.driver.hasPackage = true;
        }"""
approach_replacement = """        if (van.x >= van.targetStopX) {
          van.x = van.targetStopX;
          van.speed = 0;
          van.state = 'STOPPED';
          van.driver.active = true;
          van.driver.x = van.x + 10;
          van.driver.y = van.y - 2;
          van.driver.hasPackage = true;
          
          const targetHouse = van.targetHouse;
          const houseBaseX = 10 + targetHouse * 55;
          let apronX = houseBaseX + 39.75;
          if (targetHouse === 5) {
             apronX = 10 + 4 * 55 + 39.75; // Use neighbor's driveway for skinny lot
          }
          
          van.driver.path = [
            { x: van.driver.x, y: van.driver.y },
            { x: apronX, y: van.driver.y },
            { x: apronX, y: 74 },
            { x: van.driver.targetDoorX, y: 74 },
            { x: van.driver.targetDoorX, y: 35 }
          ];
          van.driver.pathIdx = 1;
        }"""
content = content.replace(approach_target, approach_replacement)

# 3. Update 'STOPPED' movement
stopped_target = """      } else if (van.state === 'STOPPED') {
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
      }"""
stopped_replacement = """      } else if (van.state === 'STOPPED') {
        van.speed = 0;
        const d = van.driver;
        if (d.path && d.pathIdx !== undefined && d.pathIdx < d.path.length) {
          const target = d.path[d.pathIdx];
          const dx = target.x - d.x;
          const dy = target.y - d.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 1.5) {
            d.x += (dx / dist) * 0.45;
            d.y += (dy / dist) * 0.45;
          } else {
            d.x = target.x;
            d.y = target.y;
            d.pathIdx++;
          }
        } else {
          van.state = 'AT_DOOR';
          van.stopTimer = 0;
        }
      }"""
content = content.replace(stopped_target, stopped_replacement)

# 4. Update 'AT_DOOR' transition to 'RETURNING'
at_door_target = """      } else if (van.state === 'AT_DOOR') {
        van.speed = 0;
        van.stopTimer++;
        if (van.stopTimer > 65) {
          van.driver.hasPackage = false;
          van.state = 'RETURNING';
        }
      }"""
at_door_replacement = """      } else if (van.state === 'AT_DOOR') {
        van.speed = 0;
        van.stopTimer++;
        if (van.stopTimer > 65) {
          van.driver.hasPackage = false;
          van.state = 'RETURNING';

          const targetHouse = van.targetHouse;
          const houseBaseX = 10 + targetHouse * 55;
          let apronX = houseBaseX + 39.75;
          if (targetHouse === 5) {
             apronX = 10 + 4 * 55 + 39.75;
          }
          const vanDoorX = van.x + 10;
          const vanDoorY = van.y - 2;
          
          van.driver.path = [
            { x: van.driver.targetDoorX, y: 35 },
            { x: van.driver.targetDoorX, y: 74 },
            { x: apronX, y: 74 },
            { x: apronX, y: vanDoorY },
            { x: vanDoorX, y: vanDoorY }
          ];
          van.driver.pathIdx = 1;
        }
      }"""
content = content.replace(at_door_target, at_door_replacement)

# 5. Update 'RETURNING' movement
returning_target = """      } else if (van.state === 'RETURNING') {
        van.speed = 0;
        const d = van.driver;
        const targetX = van.x + 10;
        const targetY = van.y - 2;
        const dx = targetX - d.x;
        const dy = targetY - d.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 1.5) {
          d.x += (dx / dist) * 0.45;
          d.y += (dy / dist) * 0.45;
        } else {
          d.active = false;
          van.state = 'LEAVING';
        }
      }"""
returning_replacement = """      } else if (van.state === 'RETURNING') {
        van.speed = 0;
        const d = van.driver;
        if (d.path && d.pathIdx !== undefined && d.pathIdx < d.path.length) {
          const target = d.path[d.pathIdx];
          const dx = target.x - d.x;
          const dy = target.y - d.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 1.5) {
            d.x += (dx / dist) * 0.45;
            d.y += (dy / dist) * 0.45;
          } else {
            d.x = target.x;
            d.y = target.y;
            d.pathIdx++;
          }
        } else {
          d.active = false;
          van.state = 'LEAVING';
        }
      }"""
content = content.replace(returning_target, returning_replacement)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)

print("Applied driver pathing patch")
