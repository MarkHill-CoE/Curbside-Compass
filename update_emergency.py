import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

# 1. Replace activeVehicles
target_vehicles = """    const activeVehicles: RoadObstacle[] = [
      { type: 'sedan', x: -30, y: 110, baseY: 110, targetY: 110, w: 15, d: 7, baseSpeed: BASE_CAR_SPEED, speed: BASE_CAR_SPEED, color: edmontonPalette[0].hex, stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0 },
      { type: 'suv', x: -160, y: 124, baseY: 124, targetY: 124, w: 16, d: 7.5, baseSpeed: 0.9, speed: 0.9, color: edmontonPalette[3].hex, stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0 },
      { type: 'pickup', x: -280, y: 110, baseY: 110, targetY: 110, w: 18, d: 7.5, baseSpeed: 1.3, speed: 1.3, color: edmontonPalette[2].hex, stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0 },
      { type: 'boxTruck', x: -420, y: 124, baseY: 124, targetY: 124, w: 24, d: 8.5, baseSpeed: 0.75, speed: 0.75, color: '', stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0 },
      { type: 'police', x: -800, y: 117, baseY: 117, targetY: 117, w: 15, d: 7, baseSpeed: 2.2, speed: 2.2, color: '#ffffff', stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0, isEmergency: true },
      { type: 'firetruck', x: -900, y: 117, baseY: 117, targetY: 117, w: 28, d: 9, baseSpeed: 2.0, speed: 2.0, color: '#cc0000', stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0, isEmergency: true }
    ];"""

replacement_vehicles = """    const activeVehicles: RoadObstacle[] = [
      { type: 'sedan', x: -30, y: 110, baseY: 110, targetY: 110, w: 15, d: 7, baseSpeed: BASE_CAR_SPEED, speed: BASE_CAR_SPEED, color: edmontonPalette[0].hex, stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0 },
      { type: 'suv', x: -160, y: 124, baseY: 124, targetY: 124, w: 16, d: 7.5, baseSpeed: 0.9, speed: 0.9, color: edmontonPalette[3].hex, stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0 },
      { type: 'pickup', x: -280, y: 110, baseY: 110, targetY: 110, w: 18, d: 7.5, baseSpeed: 1.3, speed: 1.3, color: edmontonPalette[2].hex, stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0 },
      { type: 'boxTruck', x: -420, y: 124, baseY: 124, targetY: 124, w: 24, d: 8.5, baseSpeed: 0.75, speed: 0.75, color: '', stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0 }
    ];
    let emergencyVehicles: RoadObstacle[] = [];"""

content = content.replace(target_vehicles, replacement_vehicles)

# 2. In animate(), calculate numBurning and update emergencyVehicles pool
target_pool = """      const hasBurningCars = flippedCars.size > 0 || activeVehicles.some(v => v.isBurning) || isRioting;

      // Find road positions of all burning vehicles"""

replacement_pool = """      const hasBurningCars = flippedCars.size > 0 || activeVehicles.some(v => v.isBurning) || isRioting;
      
      const numBurning = flippedCars.size + activeVehicles.filter(v => v.isBurning).length;
      while (emergencyVehicles.length < numBurning * 2) {
        const idx = Math.floor(emergencyVehicles.length / 2);
        const isPolice = emergencyVehicles.length % 2 === 0;
        if (isPolice) {
          emergencyVehicles.push({ type: 'police', x: -800 - idx * 450, y: 117, baseY: 117, targetY: 117, w: 15, d: 7, baseSpeed: 2.2, speed: 2.2, color: '#ffffff', stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0, isEmergency: true });
        } else {
          emergencyVehicles.push({ type: 'firetruck', x: -900 - idx * 450, y: 117, baseY: 117, targetY: 117, w: 28, d: 9, baseSpeed: 2.0, speed: 2.0, color: '#cc0000', stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0, isEmergency: true });
        }
      }

      // Find road positions of all burning vehicles"""

content = content.replace(target_pool, replacement_pool)

# 3. Add to allRoadObstacles
target_add = """      for (let i = 0; i < activeVehicles.length; i++) allRoadObstacles.push(activeVehicles[i]);
      for (let i = 0; i < activeMicroCount; i++) allRoadObstacles.push(microMobility[i]);"""

replacement_add = """      for (let i = 0; i < activeVehicles.length; i++) allRoadObstacles.push(activeVehicles[i]);
      for (let i = 0; i < emergencyVehicles.length; i++) allRoadObstacles.push(emergencyVehicles[i]);
      for (let i = 0; i < activeMicroCount; i++) allRoadObstacles.push(microMobility[i]);"""

content = content.replace(target_add, replacement_add)

# 4. Draw vehicles
target_draw = """      for (let i = 0; i < activeVehicles.length; i++) {
        const v = activeVehicles[i];"""

replacement_draw = """      for (let i = 0; i < emergencyVehicles.length; i++) {
        const v = emergencyVehicles[i];
        drawVehicle(v.x, v.y, 0, v.type, v.color || '#ffffff');
      }

      for (let i = 0; i < activeVehicles.length; i++) {
        const v = activeVehicles[i];"""

content = content.replace(target_draw, replacement_draw)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)
print("patched emergency logic")
