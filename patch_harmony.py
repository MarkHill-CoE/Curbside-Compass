import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

# 1. Add useState
if "const [isHarmonyActive, setIsHarmonyActive]" not in content:
    content = re.sub(
        r"(const \[isRiotActive, setIsRiotActive\] = useState<boolean>\(false\);)",
        r"\1\n  const [isHarmonyActive, setIsHarmonyActive] = useState<boolean>(false);",
        content, count=1
    )

# 2. Add harmony timer to useEffect
if "let harmonyTimer = 0;" not in content:
    content = re.sub(
        r"(let overloadTimer = 0;)",
        r"\1\n    let harmonyTimer = 0;\n    let isHarmony = false;\n    const confetti: Array<{x: number, y: number, vx: number, vy: number, color: string, size: number, angle: number, spin: number}> = [];\n    const confettiColors = ['#009A44', '#004B8D', '#FFC72C', '#E8552D', '#FFFFFF', '#0081BC'];",
        content, count=1
    )

# 3. Add harmony logic
harmony_logic = """
      // Harmony Trigger: Well-managed neighborhood
      const isGoodPlanning = gaugePercent > 10 && gaugePercent <= 90 && !hasBurningCars && !isRioting && activeVehicles.length > 0;
      if (isGoodPlanning) {
        harmonyTimer += 1 / 60;
        if (harmonyTimer >= 4.0 && !isHarmony) {
          isHarmony = true;
          setIsHarmonyActive(true);
        }
      } else {
        harmonyTimer = Math.max(0, harmonyTimer - 1 / 60);
        if (harmonyTimer <= 0 && isHarmony) {
          isHarmony = false;
          setIsHarmonyActive(false);
        }
      }
"""
if "// Harmony Trigger: Well-managed neighborhood" not in content:
    content = re.sub(
        r"(const numBurning = flippedCars.size \+ activeVehicles.filter\(v => v.isBurning\).length;)",
        r"\1\n" + harmony_logic,
        content, count=1
    )

# 4. Add confetti rendering in animate
confetti_logic = """
      // Harmony Confetti Layer
      if (isHarmony) {
         if (Math.random() < 0.2) {
             for (let i=0; i<5; i++) {
                 confetti.push({
                     x: Math.random() * 1200,
                     y: -20,
                     vx: (Math.random() - 0.5) * 2,
                     vy: Math.random() * 2 + 1,
                     color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                     size: Math.random() * 6 + 4,
                     angle: Math.random() * Math.PI * 2,
                     spin: (Math.random() - 0.5) * 0.2
                 });
             }
         }
      }
      for (let i = confetti.length - 1; i >= 0; i--) {
         const c = confetti[i];
         c.x += c.vx;
         c.y += c.vy;
         c.angle += c.spin;
         
         ctx!.save();
         ctx!.translate(c.x, c.y);
         ctx!.rotate(c.angle);
         ctx!.fillStyle = c.color;
         ctx!.fillRect(-c.size/2, -c.size/2, c.size, c.size * 0.6);
         ctx!.restore();
         
         if (c.y > 800) {
             confetti.splice(i, 1);
         }
      }
"""
if "// Harmony Confetti Layer" not in content:
    content = re.sub(
        r"(animFrameId = requestAnimationFrame\(animate\);)",
        confetti_logic + r"\n      \1",
        content, count=1
    )

# 5. Add overlay JSX
overlay_jsx = """
        {/* Good News Harmony Overlay */}
        {isHarmonyActive && !isRiotActive && (
          <div
            id="harmony-overlay"
            className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between overflow-hidden rounded-lg"
          >
            <div className="m-2 sm:m-4 flex items-center gap-2 sm:gap-3 bg-white/95 border-l-4 border-[#009A44] px-2.5 py-1 sm:px-4 sm:py-2 rounded shadow-2xl max-w-max">
              <span className="bg-[#009A44] text-white font-extrabold text-[10px] sm:text-xs px-1.5 py-0.5 rounded">
                ⭐ EXCELLENCE
              </span>
              <span className="text-[#004B8D] text-[10px] sm:text-xs md:text-sm font-bold tracking-wider">
                CITY PLANNING COMMENDATION
              </span>
            </div>

            <div className="w-full bg-[#009A44]/95 border-t-2 sm:border-t-4 border-[#FFC72C] shadow-2xl flex flex-col justify-between box-border">
              <div className="bg-[#FFC72C] text-[#111] text-[9px] sm:text-xs font-black px-2.5 py-0.5 sm:px-4 sm:py-1 tracking-widest flex items-center gap-1.5 uppercase border-b border-white/20">
                <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> AWARD: OPTIMAL CURB MANAGEMENT
              </div>
              <div className="px-2.5 py-1 sm:px-4 sm:py-1.5">
                <h4 className="text-white text-xs sm:text-sm font-black uppercase tracking-wide m-0 truncate">
                  NEIGHBORHOOD ACHIEVES PERFECT TRAFFIC HARMONY
                </h4>
                <p className="text-[#b3ffd1] text-[9px] sm:text-xs font-bold m-0 truncate">
                  SMART POLICIES KEEP STREETS CLEAR • BUSINESSES BOOMING • RESIDENTS HAPPY
                </p>
              </div>
              <div className="w-full h-5 sm:h-6 bg-white border-t border-[#004B8D] flex items-center overflow-hidden">
                <div className="bg-[#004B8D] text-white font-black text-[9px] px-2 h-full flex items-center whitespace-nowrap z-10">
                  REPORTER
                </div>
                <div className="text-[#004B8D] text-[9px] sm:text-[10px] font-bold px-2 whitespace-nowrap overflow-hidden flex-1 h-full flex items-center">
                  <span className="inline-block animate-marquee uppercase">
                    "It's beautiful out here. Delivery vans have space, visitors are finding spots easily, and the air is clear. A masterclass in urban planning!"
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
"""
if "Good News Harmony Overlay" not in content:
    content = re.sub(
        r"({\/\* Breaking News Riot Overlay)",
        overlay_jsx + r"\n        \1",
        content, count=1
    )

with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.write(content)
