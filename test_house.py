import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

target = """    function renderHousesBackground() {
      bgHousesCtx.clearRect(0, 0, bgHousesCanvas.width, bgHousesCanvas.height);
      bgTreesCtx.clearRect(0, 0, bgTreesCanvas.width, bgTreesCanvas.height);
      const lotWidth = 55;

      for (let h = 0; h < 6; h++) {
        const i = 10 + h * lotWidth;
        const brand = edmontonPalette[h];
        const topC = brand.hex;
        const leftC = adjustColor(brand.hex, -15);
        const rightC = adjustColor(brand.hex, -30);
        const roofC = adjustColor(brand.hex, -45);

        // Main House Structure
        drawBlock(i + 5, 0, 0, 28, 35, 18, topC, leftC, rightC, bgHousesCtx);
        drawPitchedRoof(i + 3, -2, 18, 32, 39, 15, roofC, rightC, bgHousesCtx);
        drawBlock(i + 8, 15, 18, 3, 3, 18, '#193A5A', '#11283f', '#0a1726', bgHousesCtx);

        // Attached Single-Car Garage on the right side of the lot (aligned with single-car driveway)
        drawBlock(i + 33, 10, 0, 11.5, 25, 11, adjustColor(topC, -5), leftC, rightC, bgHousesCtx);
        drawBlock(i + 32.5, 8, 11, 12.5, 27, 2, roofC, rightC, rightC, bgHousesCtx);

        // Single-Car Garage Door (front face at y = 35)
        drawBlock(i + 35, 35, 0, 8.5, 0.5, 9, '#e2e8f0', '#cbd5e1', '#94a3b8', bgHousesCtx);
        drawBlock(i + 35.5, 35.1, 3.0, 7.5, 0.2, 0.3, '#94a3b8', '#64748b', '#475569', bgHousesCtx);
        drawBlock(i + 35.5, 35.1, 6.0, 7.5, 0.2, 0.3, '#94a3b8', '#64748b', '#475569', bgHousesCtx);

        // Front Entry Door (main house facade, y = 35)
        drawBlock(i + 13, 35, 0, 4, 0.5, 7, '#ffffff', '#e0e0e0', '#cccccc', bgHousesCtx);
        drawBlock(i + 12.5, 35.1, 0, 5, 0.5, 0.8, '#cbd5e1', '#94a3b8', '#64748b', bgHousesCtx);

        // Front Windows (left and right living areas on main house, y = 35)
        drawBlock(i + 6.5, 35, 5, 5, 0.5, 6, '#eef5f9', '#a2c8e0', '#6ba1c4', bgHousesCtx);
        drawBlock(i + 20, 35, 5, 5, 0.5, 6, '#eef5f9', '#a2c8e0', '#6ba1c4', bgHousesCtx);
      }"""

replacement = """    function renderHousesBackground() {
      bgHousesCtx.clearRect(0, 0, bgHousesCanvas.width, bgHousesCanvas.height);
      bgTreesCtx.clearRect(0, 0, bgTreesCanvas.width, bgTreesCanvas.height);
      const lotWidth = 55;

      for (let h = 0; h < 6; h++) {
        const i = 10 + h * lotWidth;
        const brand = edmontonPalette[h];
        const topC = brand.hex;
        const leftC = adjustColor(brand.hex, -15);
        const rightC = adjustColor(brand.hex, -30);
        const roofC = adjustColor(brand.hex, -45);
        
        // Example: If it's the last house, draw something different like a skinny split lot
        if (h === 5) {
            // Draw two skinny homes
            const skinny1X = i + 5;
            const skinny2X = i + 25;
            
            // Skinny 1
            drawBlock(skinny1X, 0, 0, 15, 35, 24, topC, leftC, rightC, bgHousesCtx);
            drawPitchedRoof(skinny1X - 1, -2, 24, 17, 39, 10, roofC, rightC, bgHousesCtx);
            drawBlock(skinny1X + 5, 35, 0, 3, 0.5, 7, '#ffffff', '#e0e0e0', '#cccccc', bgHousesCtx); // Door
            drawBlock(skinny1X + 2, 35, 10, 4, 0.5, 8, '#eef5f9', '#a2c8e0', '#6ba1c4', bgHousesCtx); // Window
            
            // Skinny 2
            const topC2 = edmontonPalette[3].hex; // Red
            const leftC2 = adjustColor(topC2, -15);
            const rightC2 = adjustColor(topC2, -30);
            drawBlock(skinny2X, 0, 0, 15, 35, 24, topC2, leftC2, rightC2, bgHousesCtx);
            drawPitchedRoof(skinny2X - 1, -2, 24, 17, 39, 10, roofC, rightC, bgHousesCtx);
            drawBlock(skinny2X + 5, 35, 0, 3, 0.5, 7, '#ffffff', '#e0e0e0', '#cccccc', bgHousesCtx); // Door
            drawBlock(skinny2X + 2, 35, 10, 4, 0.5, 8, '#eef5f9', '#a2c8e0', '#6ba1c4', bgHousesCtx); // Window
            
            // Note: Currently, the background rendering (driveway) will still draw the standard driveway for lot 5.
            // We would need to update `renderGroundBackground()` to handle these dynamic lot layouts too.
        } else {
            // Standard Single-Family Home
            drawBlock(i + 5, 0, 0, 28, 35, 18, topC, leftC, rightC, bgHousesCtx);
            drawPitchedRoof(i + 3, -2, 18, 32, 39, 15, roofC, rightC, bgHousesCtx);
            drawBlock(i + 8, 15, 18, 3, 3, 18, '#193A5A', '#11283f', '#0a1726', bgHousesCtx);

            drawBlock(i + 33, 10, 0, 11.5, 25, 11, adjustColor(topC, -5), leftC, rightC, bgHousesCtx);
            drawBlock(i + 32.5, 8, 11, 12.5, 27, 2, roofC, rightC, rightC, bgHousesCtx);

            drawBlock(i + 35, 35, 0, 8.5, 0.5, 9, '#e2e8f0', '#cbd5e1', '#94a3b8', bgHousesCtx);
            drawBlock(i + 35.5, 35.1, 3.0, 7.5, 0.2, 0.3, '#94a3b8', '#64748b', '#475569', bgHousesCtx);
            drawBlock(i + 35.5, 35.1, 6.0, 7.5, 0.2, 0.3, '#94a3b8', '#64748b', '#475569', bgHousesCtx);

            drawBlock(i + 13, 35, 0, 4, 0.5, 7, '#ffffff', '#e0e0e0', '#cccccc', bgHousesCtx);
            drawBlock(i + 12.5, 35.1, 0, 5, 0.5, 0.8, '#cbd5e1', '#94a3b8', '#64748b', bgHousesCtx);

            drawBlock(i + 6.5, 35, 5, 5, 0.5, 6, '#eef5f9', '#a2c8e0', '#6ba1c4', bgHousesCtx);
            drawBlock(i + 20, 35, 5, 5, 0.5, 6, '#eef5f9', '#a2c8e0', '#6ba1c4', bgHousesCtx);
        }
      }"""

content = content.replace(target, replacement)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)
print("patched houses")
