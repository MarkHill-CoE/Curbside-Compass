import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

target = """        let targetLane = A.baseY || 110;
        const isCar_A = carTypes.includes(A.type);
        const detectionBuffer_A = BASE_BUFFER + (isCar_A ? CAR_EXTRA_BUFFER : MICRO_EXTRA_BUFFER);

        let isBlockedInLane = false;
        for (let j = 0; j < roadObstacleCount; j++) {
          const B = allRoadObstacles[j];
          if (A === B || (B.speed || 0) > 0.2) continue;
          if (Math.abs(A.y - B.y) < 8 && B.x > A.x && B.x - (A.x + A.w) < 45) {
            isBlockedInLane = true;
            break;
          }
        }

        if (isBlockedInLane) {
          const altLane = (A.baseY || 110) < 115 ? 124 : 110;
          let altClear = true;
          for (let j = staticObstacleCount; j < roadObstacleCount; j++) {
            const B = allRoadObstacles[j];
            if (A === B) continue;
            if (Math.abs(B.y - altLane) < 8 && Math.abs(B.x - A.x) < 28) {
              altClear = false;
              break;
            }
          }
          // Also check if altLane is blocked by protesters
          if (hasBurningCars) {
            for (const rp of activeRoadProtesters) {
              if (Math.abs(rp.y - altLane) < 8 && Math.abs(rp.x - A.x) < 32) {
                altClear = false;
                break;
              }
            }
          }
          if (altClear) targetLane = altLane;
        }"""

replacement = """        if (A.isEmergency && !isRioting && A.x < -100) {
          A.x = -800; // Park them
          continue;
        }

        let emergencyApproaching = false;
        if (!A.isEmergency) {
          for (let j = staticObstacleCount; j < roadObstacleCount; j++) {
            const E = allRoadObstacles[j];
            if (E.isEmergency && E.x > -400 && E.x < blockLength) {
              emergencyApproaching = true;
              break;
            }
          }
        }

        let targetLane = A.baseY || 110;
        const isCar_A = carTypes.includes(A.type);
        const detectionBuffer_A = BASE_BUFFER + (isCar_A ? CAR_EXTRA_BUFFER : MICRO_EXTRA_BUFFER);

        if (emergencyApproaching) {
          targetLane = 100; // Pull over to the left
        } else {
          let isBlockedInLane = false;
          for (let j = 0; j < roadObstacleCount; j++) {
            const B = allRoadObstacles[j];
            if (A === B || (B.speed || 0) > 0.2) continue;
            if (Math.abs(A.y - B.y) < 8 && B.x > A.x && B.x - (A.x + A.w) < 45) {
              isBlockedInLane = true;
              break;
            }
          }

          if (isBlockedInLane) {
            const altLane = (A.baseY || 110) < 115 ? 124 : 110;
            let altClear = true;
            for (let j = staticObstacleCount; j < roadObstacleCount; j++) {
              const B = allRoadObstacles[j];
              if (A === B) continue;
              if (Math.abs(B.y - altLane) < 8 && Math.abs(B.x - A.x) < 28) {
                altClear = false;
                break;
              }
            }
            // Also check if altLane is blocked by protesters
            if (hasBurningCars) {
              for (const rp of activeRoadProtesters) {
                if (Math.abs(rp.y - altLane) < 8 && Math.abs(rp.x - A.x) < 32) {
                  altClear = false;
                  break;
                }
              }
            }
            if (altClear) targetLane = altLane;
          }
        }"""

content = content.replace(target, replacement)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)
print("patched movement")
