import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

flowers_init = """
    let harmonyFlowerGrowth = 0;
    const flowerBeds: Array<{x: number, y: number, color: string, z: number}> = [];
    const flowerColors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#f368e0', '#ff9f43', '#0abde3', '#e17055', '#fdcb6e'];
    const _lotWidth = 55;
    for (let h = 0; h < 6; h++) {
      const startX = 10 + h * _lotWidth;
      if (h === 5) {
        for (let j = 0; j < 10; j++) {
          flowerBeds.push({ x: startX + 2 + Math.random() * 5, y: 40 + Math.random() * 25, z: Math.random() * 3, color: flowerColors[Math.floor(Math.random() * flowerColors.length)] });
          flowerBeds.push({ x: startX + 15 + Math.random() * 10, y: 40 + Math.random() * 25, z: Math.random() * 3, color: flowerColors[Math.floor(Math.random() * flowerColors.length)] });
        }
      } else {
        for (let j = 0; j < 25; j++) {
          flowerBeds.push({ x: startX + 5 + Math.random() * 25, y: 40 + Math.random() * 25, z: Math.random() * 3, color: flowerColors[Math.floor(Math.random() * flowerColors.length)] });
        }
      }
    }
"""

content = re.sub(
    r"(let isHarmony = false;)",
    r"\1" + flowers_init,
    content, count=1
)

harmony_logic = """
      if (isHarmony) {
        harmonyFlowerGrowth = Math.min(1.0, harmonyFlowerGrowth + 0.005);
      } else {
        harmonyFlowerGrowth = Math.max(0.0, harmonyFlowerGrowth - 0.02);
      }
      
      // Draw growing flower beds behind vehicles but in front of houses
      if (harmonyFlowerGrowth > 0) {
        ctx!.save();
        for (let i = 0; i < flowerBeds.length; i++) {
          const f = flowerBeds[i];
          // Determine the scale using a springy/bouncy effect based on growth and index
          const individualGrowth = Math.max(0, Math.min(1, (harmonyFlowerGrowth * 1.5) - (i % 10) * 0.05));
          if (individualGrowth > 0) {
             const scale = Math.sin(individualGrowth * Math.PI / 2);
             // Use 2.5D projection roughly matching the Isometric setup
             // For flat ground rendering, we simply draw them at their (x, y). 
             // But NeighborhoodSimulation draws vehicles in 2.5D using `drawVehicle`.
             // Is there an isometric transform, or is it fake isometric using drawBlock?
             // Ah, it's a direct drawBlock! Let's check how vehicles are drawn.
             
             // Flowers can just be small blocks or circles
             const w = 1.5 * scale;
             const h = 1.5 * scale;
             // Fake 3D flower rendering
             ctx!.fillStyle = '#1e633a'; // stem/leaves
             ctx!.fillRect(f.x, f.y - (f.z * scale), w, h);
             ctx!.fillStyle = f.color;
             ctx!.fillRect(f.x - w*0.2, f.y - (f.z * scale) - h, w*1.4, h*1.4);
          }
        }
        ctx!.restore();
      }
"""

content = re.sub(
    r"(// Layer 3: Vehicles \(Parked Cars, Vans, Emergency, Active Traffic\))",
    harmony_logic + r"\n      \1",
    content, count=1
)

with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.write(content)
