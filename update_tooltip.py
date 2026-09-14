import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

target = """                <Tooltip 
                  contentStyle={{ backgroundColor: '#11283f', border: '1px solid #0081BC', fontSize: '10px', color: '#fff', padding: '4px' }} 
                  itemStyle={{ color: '#fff' }} 
                  labelStyle={{ display: 'none' }}
                  isAnimationActive={false}
                />"""

replacement = """                <Tooltip 
                  contentStyle={{ backgroundColor: '#11283f', border: '1px solid #0081BC', fontSize: '10px', color: '#fff', padding: '4px' }} 
                  itemStyle={{ color: '#fff' }} 
                  labelStyle={{ display: 'none' }}
                  isAnimationActive={false}
                  formatter={(value: number) => [`${value}%`, 'Occupancy']}
                />"""

content = content.replace(target, replacement)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)
print("Updated tooltip")
