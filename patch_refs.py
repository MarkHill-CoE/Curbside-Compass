import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

# Add refs
refs_code = """
  const configRef = useRef<SimulationConfig>(config);
  configRef.current = config;
  
  const activeQuestionRef = useRef(activeQuestionNumber);
  activeQuestionRef.current = activeQuestionNumber;
  
  const isCompletedRef = useRef(isCompleted);
  isCompletedRef.current = isCompleted;
"""

content = re.sub(
    r"const configRef = useRef<SimulationConfig>\(config\);\s*configRef\.current = config;",
    refs_code,
    content, count=1
)

# Modify Riot condition
# Original: if (gaugePercent >= 160) {
riot_condition = """
      const isAfterQ8 = (activeQuestionRef.current !== undefined && activeQuestionRef.current >= 9) || isCompletedRef.current;
      
      // Overload Trigger: vehicles on the road catch fire under critical curbside parking overload
      if (gaugePercent >= 160 && isAfterQ8) {
"""

content = re.sub(
    r"// Overload Trigger: vehicles on the road catch fire under critical curbside parking overload\s*if \(gaugePercent >= 160\) {",
    riot_condition,
    content, count=1
)

# Modify Harmony condition
# Original: const isGoodPlanning = gaugePercent > 10 && gaugePercent <= 90 && !hasBurningCars && !isRioting && activeVehicles.length > 0;
harmony_condition = """
      const isGoodPlanning = isAfterQ8 && gaugePercent > 10 && gaugePercent <= 90 && !hasBurningCars && !isRioting && activeVehicles.length > 0;
"""

content = re.sub(
    r"const isGoodPlanning = gaugePercent > 10 && gaugePercent <= 90 && !hasBurningCars && !isRioting && activeVehicles\.length > 0;",
    harmony_condition,
    content, count=1
)

with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.write(content)
