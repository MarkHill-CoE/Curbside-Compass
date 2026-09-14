import re

content = """
export const PERSONA_PROFILES: Record<string, PersonaResult> = {
  // Row 1: Strict / Most Rules (Y < -9)
  block_resident: {
    id: 'block-resident', quadrant: 'Q2', xRange: 'taxpayer', yRange: 'restrictive',
    title: 'Block Resident', subtitle: 'Strict Rules • General Taxation',
    description: 'You like strict parking rules to keep order. You prefer that everyone shares the costs through taxes, rather than just car owners.',
    keyPriorities: ['Strict enforcement', 'General tax funding'], edmontonPolicyFit: 'Aligns with highly regulated mature neighbourhoods.', badgeColor: '#005087'
  },
  tidy_resident: {
    id: 'tidy-resident', quadrant: 'Q2', xRange: 'taxpayer', yRange: 'restrictive',
    title: 'Tidy Resident', subtitle: 'Some Rules • General Taxation',
    description: 'You like some parking rules to keep streets neat. You feel everyone should share the costs through taxes, not just drivers.',
    keyPriorities: ['Clear guidelines', 'Shared costs'], edmontonPolicyFit: 'Aligns with standard residential parking guidelines.', badgeColor: '#005087'
  },
  picky_parker: {
    id: 'picky-parker', quadrant: 'Q1', xRange: 'user', yRange: 'restrictive',
    title: 'Picky Parker', subtitle: 'Clear Rules • User-Fee',
    description: 'You like clear parking rules. You prefer that car owners pay for parking, rather than everyone sharing the costs through taxes.',
    keyPriorities: ['Clear restrictions', 'User-pay model'], edmontonPolicyFit: 'Aligns with targeted permit zones.', badgeColor: '#0081BC'
  },
  safety_parker: {
    id: 'safety-parker', quadrant: 'Q1', xRange: 'user', yRange: 'restrictive',
    title: 'Safety Parker', subtitle: 'Strict Rules • Strong User-Fee',
    description: 'You like strict parking rules to keep streets safe. You strongly believe car owners should pay for their own parking, not everyone.',
    keyPriorities: ['Strict safety enforcement', 'Direct user fees'], edmontonPolicyFit: 'Aligns with high-traffic pedestrian safety corridors.', badgeColor: '#0081BC'
  },

  // Row 2: Clear / Fair Balance (-9 <= Y < 0)
  rule_resident: {
    id: 'rule-resident', quadrant: 'Q2', xRange: 'taxpayer', yRange: 'restrictive',
    title: 'Rule Resident', subtitle: 'Clear Rules • Shared Costs',
    description: 'You like clear parking rules. You think everyone should share the costs through taxes, not just car owners.',
    keyPriorities: ['Defined zones', 'Tax-supported maintenance'], edmontonPolicyFit: 'Aligns with protected residential areas.', badgeColor: '#005087'
  },
  balanced_resident: {
    id: 'balanced-resident', quadrant: 'Q2', xRange: 'taxpayer', yRange: 'restrictive',
    title: 'Balanced Resident', subtitle: 'Fair Balance • Shared Costs',
    description: 'You like a fair balance of parking rules. You slightly prefer that everyone shares the costs through taxes, instead of just drivers.',
    keyPriorities: ['Balanced access', 'Community funding'], edmontonPolicyFit: 'Aligns with flexible neighbourhood parking.', badgeColor: '#005087'
  },
  sensible_parker: {
    id: 'sensible-parker', quadrant: 'Q1', xRange: 'user', yRange: 'restrictive',
    title: 'Sensible Parker', subtitle: 'Fair Balance • User-Fee',
    description: 'You like a fair balance of parking rules. You prefer that drivers pay for their own parking, instead of everyone sharing the costs.',
    keyPriorities: ['Balanced enforcement', 'Driver-paid infrastructure'], edmontonPolicyFit: 'Aligns with hybrid paid-parking zones.', badgeColor: '#0081BC'
  },
  fair_parker: {
    id: 'fair-parker', quadrant: 'Q1', xRange: 'user', yRange: 'restrictive',
    title: 'Fair Parker', subtitle: 'Fair Balance • Strong User-Fee',
    description: 'You like a fair balance of parking rules. You strongly feel that drivers should pay for parking, instead of everyone.',
    keyPriorities: ['Fair access', 'Full cost-recovery from drivers'], edmontonPolicyFit: 'Aligns with self-sustaining parking districts.', badgeColor: '#0081BC'
  },

  // Row 3: Fewer / Few Rules (0 <= Y <= 9)
  easy_neighbor: {
    id: 'easy-neighbor', quadrant: 'Q3', xRange: 'taxpayer', yRange: 'open',
    title: 'Easy Neighbor', subtitle: 'Fewer Rules • Shared Costs',
    description: 'You like fewer parking rules to make things easy. You prefer that everyone shares the costs through taxes, rather than just drivers.',
    keyPriorities: ['Easy access', 'Taxpayer funding'], edmontonPolicyFit: 'Aligns with open suburban parking.', badgeColor: '#009A44'
  },
  chill_neighbour: {
    id: 'chill-neighbour', quadrant: 'Q3', xRange: 'taxpayer', yRange: 'open',
    title: 'Chill Neighbour', subtitle: 'Few Rules • Shared Costs',
    description: 'You like having few parking rules. You believe everyone should share the costs through taxes, not just car owners.',
    keyPriorities: ['Minimal restrictions', 'Publicly funded'], edmontonPolicyFit: 'Aligns with low-density residential guidelines.', badgeColor: '#009A44'
  },
  simple_driver: {
    id: 'simple-driver', quadrant: 'Q4', xRange: 'user', yRange: 'open',
    title: 'Simple Driver', subtitle: 'Fewer Rules • User-Fee',
    description: 'You like fewer parking rules to keep life simple. You slightly prefer that car owners pay for parking, rather than everyone sharing the costs.',
    keyPriorities: ['Simple access', 'Light user fees'], edmontonPolicyFit: 'Aligns with simplified flat-rate zones.', badgeColor: '#FFC72C'
  },
  casual_cruiser: {
    id: 'casual-cruiser', quadrant: 'Q4', xRange: 'user', yRange: 'open',
    title: 'Casual Cruiser', subtitle: 'Very Few Rules • Strong User-Fee',
    description: 'You like very few parking rules on our streets. You strongly believe car owners must pay for their own parking, not everyone.',
    keyPriorities: ['Unrestricted access', 'Direct user payments'], edmontonPolicyFit: 'Aligns with unregulated paid public lots.', badgeColor: '#FFC72C'
  },

  // Row 4: Almost No / Very Few Rules (Y > 9)
  happy_neighbor: {
    id: 'happy-neighbor', quadrant: 'Q3', xRange: 'taxpayer', yRange: 'open',
    title: 'Happy Neighbor', subtitle: 'Almost No Rules • Strong Taxpayer',
    description: 'You want almost no parking rules. You strongly believe everyone should share the costs through taxes, not just drivers.',
    keyPriorities: ['Complete freedom', 'Fully public funding'], edmontonPolicyFit: 'Aligns with historically unregulated rural/suburban edges.', badgeColor: '#009A44'
  },
  zen_neighbor: {
    id: 'zen-neighbor', quadrant: 'Q3', xRange: 'taxpayer', yRange: 'open',
    title: 'Zen Neighbor', subtitle: 'Very Few Rules • Shared Costs',
    description: 'You want very few parking rules for more freedom. You slightly prefer that everyone shares the costs through taxes, not just car owners.',
    keyPriorities: ['High freedom', 'Shared municipal cost'], edmontonPolicyFit: 'Aligns with unenforced open streets.', badgeColor: '#009A44'
  },
  happy_driver: {
    id: 'happy-driver', quadrant: 'Q4', xRange: 'user', yRange: 'open',
    title: 'Happy Driver', subtitle: 'Almost No Rules • User-Fee',
    description: 'You want almost no parking rules. You prefer that drivers pay for parking, rather than everyone sharing the costs through taxes.',
    keyPriorities: ['No restrictions', 'Flat user fees'], edmontonPolicyFit: 'Aligns with open flat-rate parking regions.', badgeColor: '#FFC72C'
  },
  free_wheeler: {
    id: 'free-wheeler', quadrant: 'Q4', xRange: 'user', yRange: 'open',
    title: 'Free Wheeler', subtitle: 'Almost No Rules • Strong User-Fee',
    description: 'You want almost no parking rules so people are free. You strongly believe drivers should pay for their own parking, not everyone.',
    keyPriorities: ['Absolute freedom', '100% user-funded'], edmontonPolicyFit: 'Aligns with private unregulated toll/parking models.', badgeColor: '#FFC72C'
  }
};

export function calculatePersona(totalX: number, totalY: number): PersonaResult {
  const isCol1 = totalX < -8;
  const isCol2 = totalX >= -8 && totalX < 0;
  const isCol3 = totalX >= 0 && totalX <= 8;
  const isCol4 = totalX > 8;

  const isRow1 = totalY < -9;
  const isRow2 = totalY >= -9 && totalY < 0;
  const isRow3 = totalY >= 0 && totalY <= 9;
  const isRow4 = totalY > 9;

  if (isCol1) {
    if (isRow1) return PERSONA_PROFILES.block_resident;
    if (isRow2) return PERSONA_PROFILES.rule_resident;
    if (isRow3) return PERSONA_PROFILES.easy_neighbor;
    return PERSONA_PROFILES.happy_neighbor;
  } else if (isCol2) {
    if (isRow1) return PERSONA_PROFILES.tidy_resident;
    if (isRow2) return PERSONA_PROFILES.balanced_resident;
    if (isRow3) return PERSONA_PROFILES.chill_neighbour;
    return PERSONA_PROFILES.zen_neighbor;
  } else if (isCol3) {
    if (isRow1) return PERSONA_PROFILES.picky_parker;
    if (isRow2) return PERSONA_PROFILES.sensible_parker;
    if (isRow3) return PERSONA_PROFILES.simple_driver;
    return PERSONA_PROFILES.happy_driver;
  } else {
    // Col 4
    if (isRow1) return PERSONA_PROFILES.safety_parker;
    if (isRow2) return PERSONA_PROFILES.fair_parker;
    if (isRow3) return PERSONA_PROFILES.casual_cruiser;
    return PERSONA_PROFILES.free_wheeler;
  }
}
"""

with open('src/data/surveyData.ts', 'r') as f:
    old_content = f.read()

# Replace PERSONA_PROFILES and calculatePersona
import re
new_content = re.sub(r'export const PERSONA_PROFILES: Record<string, PersonaResult> = \{.*\}', content.strip(), old_content, flags=re.DOTALL)

with open('src/data/surveyData.ts', 'w') as f:
    f.write(new_content)

print("Updated surveyData.ts")
