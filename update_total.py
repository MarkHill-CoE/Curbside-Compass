import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

target = """    let houseCarAssignments = generateHouseCarAssignments(currentDrivewayCap);"""

replacement = """    const TOTAL_LEGAL_CURBSIDE_STALLS = 11;
    let houseCarAssignments = generateHouseCarAssignments(currentDrivewayCap);"""

# wait, it is a global constant...
