import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

target = """        if (A.x > blockLength + 80) {
          let respawnX = -60;
          for (let j = staticObstacleCount; j < roadObstacleCount; j++) {
            const B = allRoadObstacles[j];
            if (A === B) continue;
            if (Math.abs(A.y - B.y) < 8 && B.x < 0 && B.x > respawnX - A.w - 15) {
              respawnX = Math.min(respawnX, B.x - A.w - 15);
            }
          }
          A.x = respawnX;"""

replacement = """        if (A.x > blockLength + 80) {
          if (A.isEmergency && !isRioting) {
            A.x = -800;
            continue;
          }
          let respawnX = -60;
          for (let j = staticObstacleCount; j < roadObstacleCount; j++) {
            const B = allRoadObstacles[j];
            if (A === B) continue;
            if (Math.abs(A.y - B.y) < 8 && B.x < 0 && B.x > respawnX - A.w - 15) {
              respawnX = Math.min(respawnX, B.x - A.w - 15);
            }
          }
          A.x = respawnX;"""

content = content.replace(target, replacement)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)
print("patched respawn")
