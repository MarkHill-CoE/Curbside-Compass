import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

replacement = """      const isAfterQ8 = (activeQuestionRef.current !== undefined && activeQuestionRef.current >= 9) || isCompletedRef.current;

      // Reset triggers if we are no longer after Q8 (e.g. user hits Retake)
      if (!isAfterQ8) {
        if (isRioting || flippedCars.size > 0 || activeVehicles.some(v => v.isBurning)) {
            isRioting = false;
            setIsRiotActive(false);
            flippedCars.clear();
            for (let v of activeVehicles) {
              v.isBurning = false;
              v.speed = v.baseSpeed || 1.0;
            }
        }
        overloadTimer = 0;
        
        if (isHarmony || harmonyFlowerGrowth > 0) {
            isHarmony = false;
            setIsHarmonyActive(false);
            harmonyTimer = 0;
            harmonyFlowerGrowth = 0;
            for (let r of residents) {
                r.state = 'inside';
                r.x = r.homeX;
                r.y = 35;
            }
        }
      }
      
      // Overload Trigger"""

content = re.sub(
    r"\s*const isAfterQ8 = [^\n]+;\s*// Overload Trigger",
    "\n" + replacement,
    content
)

with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.write(content)
