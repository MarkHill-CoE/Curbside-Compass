import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

target = """          <div
            id="hud-gauge-widget"
            className={`bg-[#193A5A]/90 backdrop-blur-md border border-[#0081BC]/40 p-0.5 sm:p-2 rounded-md sm:rounded-lg shadow-lg flex flex-col items-center transition-all ${"""

replacement = """          <div
            id="hud-gauge-widget"
            className={`bg-[#193A5A]/90 backdrop-blur-md border border-[#0081BC]/40 p-0.5 sm:p-2 rounded-md sm:rounded-lg shadow-lg flex flex-col items-center transition-all landscape:max-sm:scale-50 landscape:max-sm:origin-top-right landscape:max-sm:-mb-[35px] ${"""

content = content.replace(target, replacement)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)

print("Patched gauge")
