import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

approaching_target = """        // Check if protesters ahead on the road are blocking the van
        const isBlockedByProtester = activeRoadProtesters.some(
          p => Math.abs(van.y - p.y) < 8.5 && p.x > van.x && p.x - (van.x + van.w) < 14
        );
        if (isBlockedByProtester) {
          van.speed = 0;
        } else {
          van.x += van.speed || 1;
        }"""

approaching_replacement = """        // Check if protesters ahead on the road are blocking the van
        const isBlockedByProtester = activeRoadProtesters.some(
          p => Math.abs(van.y - p.y) < 8.5 && p.x > van.x && p.x - (van.x + van.w) < 14
        );
        
        // Check if another van is ahead
        let isBlockedByVan = false;
        for (let j = 0; j < deliveryVansList.length; j++) {
          const otherVan = deliveryVansList[j];
          if (otherVan === van || otherVan.x < van.x) continue;
          if (Math.abs(van.y - otherVan.y) < 8.5 && otherVan.x - (van.x + van.w) < 20) {
             isBlockedByVan = true;
             break;
          }
        }

        if (isBlockedByProtester || isBlockedByVan) {
          van.speed = 0;
        } else {
          van.x += van.speed || 1;
        }"""

leaving_target = """        const isBlockedByProtester = activeRoadProtesters.some(
          p => Math.abs(van.y - p.y) < 8.5 && p.x > van.x && p.x - (van.x + van.w) < 14
        );
        if (isBlockedByProtester) {
          van.speed = 0;
        } else {
          van.x += van.speed || 1;
        }"""

content = content.replace(approaching_target, approaching_replacement)
content = content.replace(leaving_target, approaching_replacement) # The replacement logic is exactly the same for LEAVING

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)

print("Patched van collisions")
