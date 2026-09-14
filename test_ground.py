import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

target = """      const lotWidth = 55;
      for (let h = 0; h < 6; h++) {
        const i = 10 + h * lotWidth;

        // Concrete single-car-wide driveway on private lot down to sidewalk (width 9.5, y = 35 to 70)
        drawFlatRect(i + 35, 35, 9.5, 35, '#9ca0a4', bgGroundCtx);
        drawFlatRect(i + 35, 53, 9.5, 0.4, '#7e8387', bgGroundCtx);

        // Driveway apron across boulevard (y = 78 to 93)
        drawFlatRect(i + 35, 78, 9.5, 15, '#9ca0a4', bgGroundCtx);
        drawFlatRect(i + 35, 86, 9.5, 0.4, '#7e8387', bgGroundCtx);

        // Front walkway from front door (y = 35) to sidewalk (y = 70)
        drawFlatRect(i + 13, 35, 4, 35, '#d0d4d8', bgGroundCtx);
        // Walkway connection branch to single-car driveway
        drawFlatRect(i + 17, 51, 18, 2.5, '#d0d4d8', bgGroundCtx);

        // Driveway dropped curb apron cut
        drawFlatRect(i + 34.8, 92.4, 9.9, 1.2, '#8e9398', bgGroundCtx);
      }"""

replacement = """      const lotWidth = 55;
      for (let h = 0; h < 6; h++) {
        const i = 10 + h * lotWidth;

        if (h === 5) {
          // Skinny Lots (No front driveway)
          // Front walkway for Skinny 1 (x: i + 5)
          drawFlatRect(i + 9, 35, 3, 35, '#d0d4d8', bgGroundCtx);
          // Front walkway for Skinny 2 (x: i + 25)
          drawFlatRect(i + 29, 35, 3, 35, '#d0d4d8', bgGroundCtx);
        } else {
          // Standard Single-Family
          // Concrete single-car-wide driveway on private lot down to sidewalk (width 9.5, y = 35 to 70)
          drawFlatRect(i + 35, 35, 9.5, 35, '#9ca0a4', bgGroundCtx);
          drawFlatRect(i + 35, 53, 9.5, 0.4, '#7e8387', bgGroundCtx);

          // Driveway apron across boulevard (y = 78 to 93)
          drawFlatRect(i + 35, 78, 9.5, 15, '#9ca0a4', bgGroundCtx);
          drawFlatRect(i + 35, 86, 9.5, 0.4, '#7e8387', bgGroundCtx);

          // Front walkway from front door (y = 35) to sidewalk (y = 70)
          drawFlatRect(i + 13, 35, 4, 35, '#d0d4d8', bgGroundCtx);
          // Walkway connection branch to single-car driveway
          drawFlatRect(i + 17, 51, 18, 2.5, '#d0d4d8', bgGroundCtx);

          // Driveway dropped curb apron cut
          drawFlatRect(i + 34.8, 92.4, 9.9, 1.2, '#8e9398', bgGroundCtx);
        }
      }"""

content = content.replace(target, replacement)

# Fix clearance zones to ignore house 5 driveways
target_curbs = """      for (let h = 0; h < 6; h++) {
        const i = 10 + h * lotWidth;
        // 1.5m No-Parking Driveway Clearance Zones (1.5m = 5.0 simulation units)
        // Left 1.5m clearance zone: [i + 30, i + 35]
        // Right 1.5m clearance zone: [i + 44.5, i + 49.5]
        if (h !== 0) {
          // Left 1.5m yellow curb
          drawFlatRect(i + 30, 92.4, 5.0, 1.2, '#FBBF24', bgGroundCtx);
          // Left boundary limit line (white)
          drawFlatRect(i + 29.7, 91.5, 0.6, 2.8, '#FFFFFF', bgGroundCtx);
          // Left yellow road edge clearance stripe
          drawFlatRect(i + 30.5, 93.7, 4.0, 0.6, 'rgba(251, 191, 36, 0.75)', bgGroundCtx);
        }

        // Right 1.5m yellow curb (applies to all driveways h = 0 to 5)
        drawFlatRect(i + 44.5, 92.4, 5.0, 1.2, '#FBBF24', bgGroundCtx);
        // Right boundary limit line (white)
        drawFlatRect(i + 49.5, 91.5, 0.6, 2.8, '#FFFFFF', bgGroundCtx);
        // Right yellow road edge clearance stripe
        drawFlatRect(i + 45.0, 93.7, 4.0, 0.6, 'rgba(251, 191, 36, 0.75)', bgGroundCtx);

        // Stenciled "1.5m" curb labels
        const curbLabelPosR = project(i + 47.0, 95.0, 0);
        bgGroundCtx.save();
        bgGroundCtx.fillStyle = '#FBBF24';
        bgGroundCtx.font = 'bold 6px "Open Sans", sans-serif';
        bgGroundCtx.textAlign = 'center';
        bgGroundCtx.fillText('1.5m', curbLabelPosR.x, curbLabelPosR.y);
        if (h !== 0) {
          const curbLabelPosL = project(i + 32.5, 95.0, 0);
          bgGroundCtx.fillText('1.5m', curbLabelPosL.x, curbLabelPosL.y);
        }
        bgGroundCtx.restore();
      }"""

replacement_curbs = """      for (let h = 0; h < 6; h++) {
        const i = 10 + h * lotWidth;
        
        if (h !== 5) { // Skip driveway logic for house 5 which doesn't have a front driveway
          // 1.5m No-Parking Driveway Clearance Zones (1.5m = 5.0 simulation units)
          // Left 1.5m clearance zone: [i + 30, i + 35]
          // Right 1.5m clearance zone: [i + 44.5, i + 49.5]
          if (h !== 0) {
            // Left 1.5m yellow curb
            drawFlatRect(i + 30, 92.4, 5.0, 1.2, '#FBBF24', bgGroundCtx);
            // Left boundary limit line (white)
            drawFlatRect(i + 29.7, 91.5, 0.6, 2.8, '#FFFFFF', bgGroundCtx);
            // Left yellow road edge clearance stripe
            drawFlatRect(i + 30.5, 93.7, 4.0, 0.6, 'rgba(251, 191, 36, 0.75)', bgGroundCtx);
          }

          // Right 1.5m yellow curb (applies to all driveways h = 0 to 5)
          drawFlatRect(i + 44.5, 92.4, 5.0, 1.2, '#FBBF24', bgGroundCtx);
          // Right boundary limit line (white)
          drawFlatRect(i + 49.5, 91.5, 0.6, 2.8, '#FFFFFF', bgGroundCtx);
          // Right yellow road edge clearance stripe
          drawFlatRect(i + 45.0, 93.7, 4.0, 0.6, 'rgba(251, 191, 36, 0.75)', bgGroundCtx);

          // Stenciled "1.5m" curb labels
          const curbLabelPosR = project(i + 47.0, 95.0, 0);
          bgGroundCtx.save();
          bgGroundCtx.fillStyle = '#FBBF24';
          bgGroundCtx.font = 'bold 6px "Open Sans", sans-serif';
          bgGroundCtx.textAlign = 'center';
          bgGroundCtx.fillText('1.5m', curbLabelPosR.x, curbLabelPosR.y);
          if (h !== 0) {
            const curbLabelPosL = project(i + 32.5, 95.0, 0);
            bgGroundCtx.fillText('1.5m', curbLabelPosL.x, curbLabelPosL.y);
          }
          bgGroundCtx.restore();
        }
      }"""

content = content.replace(target_curbs, replacement_curbs)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)
print("patched ground")
