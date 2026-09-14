import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

target = """      // Layer 3: Cars (Parked Cars in Driveways & Curb + Active Vans + Road Traffic)
      for (let i = 0; i < totalToRender; i++) {
        const car = houseCarAssignments[activeIndices[i]];
        // Visitor cars rendered in white
        const carColor = i >= activeHouseholdCars ? '#ffffff' : car.color;
        // Strict Invariant: ONLY cars on the road (y >= 90) can burn. Driveway cars (y < 70) NEVER burn.
        const isFlipped = car.y >= 90 && flippedCars.has(i);
        drawVehicle(car.x, car.y, 0, car.type, carColor, isFlipped);
        if (isFlipped) {
          spawnFireParticle(car.x + 3, car.y + 3, 4);
          spawnFireParticle(car.x + 8, car.y + 2, 4);
          if (Math.random() < 0.4) {
            spawnFireParticle(car.x + 12, car.y + 3, 3);
          }
        }
      }

      for (let i = 0; i < deliveryVansList.length; i++) {
        const van = deliveryVansList[i];
        drawVehicle(van.x, van.y, 0, van.type, van.color || '#FF5500');
      }

      for (let i = 0; i < emergencyVehicles.length; i++) {
        const v = emergencyVehicles[i];
        drawVehicle(v.x, v.y, 0, v.type, v.color || '#ffffff');
      }

      for (let i = 0; i < activeVehicles.length; i++) {
        const v = activeVehicles[i];
        const isVBurning = Boolean(v.isBurning);
        drawVehicle(v.x, v.y, 0, v.type, v.color || '#0081BC', isVBurning);
        if (isVBurning) {
          spawnFireParticle(v.x + 3, v.y + 2, 4);
          spawnFireParticle(v.x + 8, v.y + 3, 4);
        } else if ((v.honkBubbleTimer || 0) > 0) {
          drawHonkBubble(v.x, v.y, 0);
        }
      }"""

replacement = """      // Layer 3: Vehicles (Parked Cars, Vans, Emergency, Active Traffic)
      // Grouping all vehicle graphic asset layers together and sorting by depth (Y-axis) for proper collision visual overlap
      const renderQueue: any[] = [];
      
      for (let i = 0; i < totalToRender; i++) {
        const car = houseCarAssignments[activeIndices[i]];
        const carColor = i >= activeHouseholdCars ? '#ffffff' : car.color;
        const isFlipped = car.y >= 90 && flippedCars.has(i);
        renderQueue.push({ ...car, color: carColor, isFlipped, sortY: car.y });
      }
      for (let i = 0; i < deliveryVansList.length; i++) {
        const van = deliveryVansList[i];
        renderQueue.push({ ...van, color: van.color || '#FF5500', isFlipped: false, sortY: van.y });
      }
      for (let i = 0; i < emergencyVehicles.length; i++) {
        const v = emergencyVehicles[i];
        renderQueue.push({ ...v, color: v.color || '#ffffff', isFlipped: false, sortY: v.y });
      }
      for (let i = 0; i < activeVehicles.length; i++) {
        const v = activeVehicles[i];
        const isVBurning = Boolean(v.isBurning);
        renderQueue.push({ ...v, color: v.color || '#0081BC', isFlipped: isVBurning, sortY: v.y, honkBubbleTimer: v.honkBubbleTimer });
      }

      // Sort by Y-coordinate for proper isometric depth rendering (objects lower on screen drawn last)
      renderQueue.sort((a, b) => a.sortY - b.sortY);

      for (const item of renderQueue) {
        drawVehicle(item.x, item.y, 0, item.type, item.color, item.isFlipped);
        
        if (item.isFlipped) {
          spawnFireParticle(item.x + 3, item.y + 3, 4);
          spawnFireParticle(item.x + 8, item.y + 2, 4);
          if (Math.random() < 0.4) spawnFireParticle(item.x + 12, item.y + 3, 3);
        } else if (item.honkBubbleTimer && item.honkBubbleTimer > 0) {
          drawHonkBubble(item.x, item.y, 0);
        }
      }"""

content = content.replace(target, replacement)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)
print("Updated vehicle drawing logic")
