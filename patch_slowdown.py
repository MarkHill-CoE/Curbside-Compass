import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

target = """        if (emergencyApproaching) {
          targetLane = 100; // Pull over to the left
        } else {"""

replacement = """        let isPullingOver = false;
        if (emergencyApproaching) {
          targetLane = 100; // Pull over to the left
          isPullingOver = true;
        } else {"""

content = content.replace(target, replacement)

target2 = """        A.speed = A.baseSpeed || BASE_CAR_SPEED;
        let targetX = A.x + A.speed;"""

replacement2 = """        A.speed = isPullingOver ? 0.3 : (A.baseSpeed || BASE_CAR_SPEED); // Slow down significantly when pulling over
        let targetX = A.x + A.speed;"""

content = content.replace(target2, replacement2)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)
print("patched pullover slowdown")
