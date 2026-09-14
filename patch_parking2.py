import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

target = """    function generateHouseCarAssignments(drivewayCap: number): HouseCarAssignment[] {
      const assignments: HouseCarAssignment[] = [];
      const typesY = ['sedanY', 'suvY', 'pickupY'];
      const typesX = ['sedan', 'suv', 'pickup'];

      for (let h = 0; h < 6; h++) {
        const color = edmontonPalette[h].hex;
        const baseX = 10 + h * 55;

        // Driveways are strictly ONE CAR WIDE (width 9.5, centered at x = baseX + 35.5).
        // Cars cannot park on top of each other (non-overlapping y coordinates) and must never block sidewalk (y = 70 to 78).
        // On the private setback between garage (y = 35) and sidewalk (y = 70), depth is 35 units.
        // With car depth d = 15, a single-car driveway holds at most 2 cars in tandem:
        // - 1 Car: y = 45 (spans 45 to 60, centered with 10-unit buffers front & back)
        // - 2 Cars (Tandem): Car 1 at y = 36 (spans 36 to 51); Car 2 at y = 53 (spans 53 to 68)
        //   * 2-unit air gap between cars ensures cars NEVER park on top of each other
        //   * 2-unit air gap before sidewalk ensures cars NEVER block the sidewalk
        const effectiveCap = Math.min(2, Math.max(1, drivewayCap));
        const drivewaySpotCoords: { x: number; y: number }[] =
          effectiveCap === 1
            ? [{ x: baseX + 35.5, y: 45 }]
            : [
                { x: baseX + 35.5, y: 36 },
                { x: baseX + 35.5, y: 53 }
              ];

        for (let d = 0; d < effectiveCap; d++) {
          const spot = drivewaySpotCoords[d];
          assignments.push({
            type: typesY[(h + d) % 3],
            x: spot.x,
            y: spot.y,
            w: 7.5,
            d: 15,
            color
          });
        }

        // Curbside spots along the street (y = 94), positioned along the curb clear of driveways and hydrants
        // Fire Hydrant 5m Clearance Rule: In front of the blue house (h = 0), no parking within 5m (x = 10.5 to 43.5).
        // 1.5m Driveway Clearance Rule: Under Edmonton bylaws, no vehicles can park within 1.5m (5.0 units) of either side of a driveway.
        // For house h > 0:
        // - Left driveway ends at baseX - 10.5 -> 1.5m clearance boundary is at baseX - 5.5.
        // - Right driveway starts at baseX + 35.0 -> 1.5m clearance boundary is at baseX + 30.0.
        if (h !== 0) {
          // Spot 1: between previous driveway and this lot (clearance = 6.0 units / 1.8m >= 1.5m)
          assignments.push({
            type: typesX[h % 3],
            x: baseX - 4.5,
            y: 94,
            w: 16,
            d: 7.5,
            color
          });
          // Spot 2: approaching this lot's driveway (clearance = 6.0 units / 1.8m >= 1.5m)
          assignments.push({
            type: typesX[(h + 1) % 3],
            x: baseX + 13.0,
            y: 94,
            w: 16,
            d: 7.5,
            color
          });
        }
      }
      return assignments;
    }"""

replacement = """    function generateHouseCarAssignments(drivewayCap: number): HouseCarAssignment[] {
      const assignments: HouseCarAssignment[] = [];
      const typesY = ['sedanY', 'suvY', 'pickupY'];
      const typesX = ['sedan', 'suv', 'pickup'];

      for (let h = 0; h < 6; h++) {
        const color = edmontonPalette[h].hex;
        const baseX = 10 + h * 55;

        // Skip driveway spots for lot 5 as it has skinny infills with no front driveways
        if (h !== 5) {
          const effectiveCap = Math.min(2, Math.max(1, drivewayCap));
          const drivewaySpotCoords: { x: number; y: number }[] =
            effectiveCap === 1
              ? [{ x: baseX + 35.5, y: 45 }]
              : [
                  { x: baseX + 35.5, y: 36 },
                  { x: baseX + 35.5, y: 53 }
                ];

          for (let d = 0; d < effectiveCap; d++) {
            const spot = drivewaySpotCoords[d];
            assignments.push({
              type: typesY[(h + d) % 3],
              x: spot.x,
              y: spot.y,
              w: 7.5,
              d: 15,
              color
            });
          }
        }

        // Curbside spots
        if (h !== 0) {
          assignments.push({
            type: typesX[h % 3],
            x: baseX - 4.5,
            y: 94,
            w: 16,
            d: 7.5,
            color
          });
          
          if (h === 5) {
            // For lot 5, without a driveway, we can fit an extra curbside car!
            assignments.push({
              type: typesX[(h + 1) % 3],
              x: baseX + 13.0,
              y: 94,
              w: 16,
              d: 7.5,
              color
            });
            assignments.push({
              type: typesX[(h + 2) % 3],
              x: baseX + 30.5,
              y: 94,
              w: 16,
              d: 7.5,
              color
            });
          } else {
             // Normal driveway
            assignments.push({
              type: typesX[(h + 1) % 3],
              x: baseX + 13.0,
              y: 94,
              w: 16,
              d: 7.5,
              color
            });
          }
        }
      }
      return assignments;
    }"""

content = content.replace(target, replacement)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)
print("patched parking assignment")
