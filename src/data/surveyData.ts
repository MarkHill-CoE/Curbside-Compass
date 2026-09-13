import { SurveyQuestion, PersonaResult, SimulationConfig } from '../types';

export const INITIAL_SIM_CONFIG: SimulationConfig = {
  householdCarsPerHome: 2.5,
  visitorPassesPerHome: 0.5,
  drivewayCapacity: 2,
  deliveriesPerHomePerWeek: 1.0,
  enforcementLevel: 'standard',
  cruisingTrafficLevel: 'moderate',
  curbsideFeeModel: 'free'
};

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'q1',
    number: 1,
    category: 'residential',
    text: 'What is most important when parking on the street in front of your home?',
    options: [
      {
        id: 'guaranteed',
        label: 'Guaranteed space for a fee',
        x: 2,
        y: 2,
        hint: 'Permit-reserved curbside zones with user funding',
        simEffects: {
          curbsideFeeModel: 'permit',
          enforcementLevel: 'strict',
          cruisingTrafficLevel: 'low',
          householdCarsPerHome: 2.0
        }
      },
      {
        id: 'free',
        label: 'Free parking, even if circling is required',
        x: -2,
        y: -2,
        hint: 'First-come open curbside access funded through general budget',
        simEffects: {
          curbsideFeeModel: 'free',
          enforcementLevel: 'lenient',
          cruisingTrafficLevel: 'high',
          householdCarsPerHome: 3.0
        }
      },
      {
        id: 'emergency',
        label: 'Prioritize emergency vehicles and deliveries',
        x: 0,
        y: 2,
        hint: 'Clear driving corridors and designated delivery stopping zones',
        simEffects: {
          enforcementLevel: 'strict',
          cruisingTrafficLevel: 'low',
          householdCarsPerHome: 2.2
        }
      }
    ]
  },
  {
    id: 'q2',
    number: 2,
    category: 'visitors',
    text: 'What is most critical when visitors come to your neighborhood?',
    options: [
      {
        id: 'freenolimit',
        label: 'Free parking with no time limit',
        x: -2,
        y: -2,
        hint: 'Unregulated guest parking across the curbside',
        simEffects: {
          visitorPassesPerHome: 1.5,
          enforcementLevel: 'lenient'
        }
      },
      {
        id: 'flexpasses',
        label: 'Flexible visitor passes',
        x: 0,
        y: 1,
        hint: 'Managed visitor passes tied to household allocation',
        simEffects: {
          visitorPassesPerHome: 0.75,
          enforcementLevel: 'standard'
        }
      },
      {
        id: 'timerestricted',
        label: 'Time-restricted free parking (e.g. 2 hrs)',
        x: -1,
        y: 1,
        hint: 'Turns over curbside spots regularly for errands and guests',
        simEffects: {
          visitorPassesPerHome: 0.5,
          enforcementLevel: 'standard'
        }
      },
      {
        id: 'strict',
        label: 'Strict enforcement against commuters',
        x: 0,
        y: 2,
        hint: 'Restricted neighborhood zone preventing spillover parkers',
        simEffects: {
          visitorPassesPerHome: 0.25,
          enforcementLevel: 'strict'
        }
      }
    ]
  },
  {
    id: 'q3',
    number: 3,
    category: 'finance',
    text: 'How should parking maintenance costs be absorbed?',
    options: [
      {
        id: 'taxpayer',
        label: 'By all taxpayers (City Operating Budget)',
        x: -2,
        y: 0,
        hint: 'Infrastructure and snow clearance subsidized by general municipal tax base',
        simEffects: {
          curbsideFeeModel: 'free'
        }
      },
      {
        id: 'user',
        label: 'Only by users (Permits and meter fees)',
        x: 2,
        y: 0,
        hint: 'Direct user-pay principle funding maintenance and enforcement',
        simEffects: {
          curbsideFeeModel: 'permit'
        }
      }
    ]
  },
  {
    id: 'q4',
    number: 4,
    category: 'commercial',
    text: 'When visiting a busy main street, what do you prefer?',
    options: [
      {
        id: 'freecircle',
        label: 'Free parking, searching 10-15 minutes',
        x: -2,
        y: -2,
        hint: 'Zero direct cost, accepting congestion and search delay',
        simEffects: {
          cruisingTrafficLevel: 'high'
        }
      },
      {
        id: 'demandprice',
        label: 'Demand-based pricing to guarantee open spots nearby',
        x: 2,
        y: 2,
        hint: 'Variable meter rates keeping 1-2 open spaces per block face',
        simEffects: {
          curbsideFeeModel: 'demand',
          cruisingTrafficLevel: 'low'
        }
      }
    ]
  },
  {
    id: 'q5',
    number: 5,
    category: 'pricing',
    text: 'How do you feel about Premium Parking spots near popular destinations?',
    options: [
      {
        id: 'allsame',
        label: 'All spots should cost the same, regardless of location',
        x: -1,
        y: -1,
        hint: 'Uniform flat-rate structure without geographic tiering',
        simEffects: {
          curbsideFeeModel: 'free'
        }
      },
      {
        id: 'closestmore',
        label: 'Closer spots should cost more than further ones',
        x: 2,
        y: 1,
        hint: 'Tiered pricing encouraging turnover closest to storefronts',
        simEffects: {
          curbsideFeeModel: 'demand'
        }
      }
    ]
  },
  {
    id: 'q6',
    number: 6,
    category: 'enforcement',
    text: 'How important is consistent enforcement of parking rules?',
    options: [
      {
        id: 'very',
        label: 'Very important',
        x: 1,
        y: 2,
        hint: 'Frequent monitoring ensuring clear sightlines and driveway access',
        simEffects: {
          enforcementLevel: 'strict'
        }
      },
      {
        id: 'somewhat',
        label: 'Somewhat important',
        x: 0.5,
        y: 1,
        hint: 'Balanced enforcement targeted at complaints and hazards',
        simEffects: {
          enforcementLevel: 'standard'
        }
      },
      {
        id: 'not',
        label: 'Not important',
        x: -1,
        y: -2,
        hint: 'Low enforcement presence, neighbor discretion',
        simEffects: {
          enforcementLevel: 'lenient'
        }
      }
    ]
  },
  {
    id: 'q7',
    number: 7,
    category: 'revenue',
    text: 'What should be done with parking revenues from public facilities?',
    options: [
      {
        id: 'recoup',
        label: 'Cover program administration costs only',
        x: 1,
        y: 0,
        hint: 'Revenues break even to fund enforcement officers and signage'
      },
      {
        id: 'reduce',
        label: 'Reduce citywide property tax burdens',
        x: 2,
        y: 0,
        hint: 'Surplus returns to general reserve to offset municipal property taxes'
      },
      {
        id: 'redirect',
        label: 'Reinvest into the specific facility',
        x: 2,
        y: 0,
        hint: 'Direct reinvestment into streetscape, transit stops, and pedestrian lighting'
      }
    ]
  }
];

export const PERSONA_PROFILES: Record<string, PersonaResult> = {
  Q1: {
    id: 'regulated-sustainable',
    quadrant: 'Q1',
    xRange: 'user',
    yRange: 'restrictive',
    title: 'The Regulated & Sustainable Profile',
    subtitle: 'Demand-Responsive • User-Pay • High Turnover',
    description:
      'You support user-funded infrastructure and active demand management. You believe curbside street space is a valuable public asset that functions best when priced to maintain availability, prevent cruising, and protect neighbourhood access.',
    keyPriorities: [
      'Demand-based curbside pricing to guarantee 15% spot vacancy',
      'User fees and paid permits rather than general tax subsidization',
      'Targeted enforcement keeping bus corridors, bike paths, and delivery zones clear',
      'Reinvestment of meter surpluses into local streetscape enhancements'
    ],
    edmontonPolicyFit:
      'Aligns with City of Edmonton Curbside Management Framework, multimodal mobility corridors, and commercial district dynamic rate pilots.',
    badgeColor: '#0081BC' // Edmonton Light Blue
  },
  Q2: {
    id: 'protective-resident',
    quadrant: 'Q2',
    xRange: 'taxpayer',
    yRange: 'restrictive',
    title: 'The Protective Resident Profile',
    subtitle: 'Residential Priority • Strong Enforcement • Publicly Funded',
    description:
      'You favor strong local restrictions funded primarily by general taxation. You believe residents should have protected, predictable access in front of their homes without paying burdensome extra fees, backed by robust enforcement against outside commuters.',
    keyPriorities: [
      'Residential Parking Permit (RPP) zones keeping commuter spillover out',
      'Strict municipal enforcement protecting driveways and school zones',
      'Costs absorbed through general city operating budgets',
      'Generous guest parking pass allowances with strict time limits'
    ],
    edmontonPolicyFit:
      'Aligns with established mature neighbourhood parking protection, transit station park-and-ride buffers, and residential safety corridors.',
    badgeColor: '#005087' // Edmonton Dark Blue
  },
  Q3: {
    id: 'free-and-easy',
    quadrant: 'Q3',
    xRange: 'taxpayer',
    yRange: 'open',
    title: 'The Free & Easy Profile',
    subtitle: 'Unrestricted Access • General Taxation • Minimal Bureaucracy',
    description:
      'You prefer open access with minimal fees and low restrictions. You value convenience and flexibility, preferring that public roads remain free and straightforward for residents, visitors, and tradespeople alike without complicated ticketing.',
    keyPriorities: [
      'Preserving universal free street parking across residential neighborhoods',
      'Minimal permits, paperwork, and digital parking apps',
      'Low enforcement footprint focusing exclusively on blatant hazards',
      'Accepting occasional search delay in exchange for zero out-of-pocket costs'
    ],
    edmontonPolicyFit:
      'Aligns with standard suburban and low-density residential parking guidelines with ample off-street garage and driveway capacity.',
    badgeColor: '#009A44' // Edmonton Green
  },
  Q4: {
    id: 'flat-rate',
    quadrant: 'Q4',
    xRange: 'user',
    yRange: 'open',
    title: 'The Flat Rate Profile',
    subtitle: 'Simple User Fees • Low Friction • Predictable Pricing',
    description:
      'You favor user fees, but prefer simple rules and flat pricing over complex restrictions. You recognize that parking has real costs and drivers should pay their share, but dislike surge pricing, time limits, and aggressive ticket enforcement.',
    keyPriorities: [
      'Transparent flat-rate fees without fluctuating peak pricing',
      'User-funded maintenance without complicated zone tiers',
      'Easy access for commercial deliveries and trades with minimal red tape',
      'Simpler signage and forgiving enforcement buffers'
    ],
    edmontonPolicyFit:
      'Aligns with predictable municipal parkade rates, standardized commercial loading pass programs, and simplified payment kiosks.',
    badgeColor: '#FFC72C' // Edmonton Yellow/Gold
  }
};

export function calculatePersona(totalX: number, totalY: number): PersonaResult {
  if (totalX >= 0 && totalY >= 0) {
    return PERSONA_PROFILES.Q1;
  } else if (totalX < 0 && totalY >= 0) {
    return PERSONA_PROFILES.Q2;
  } else if (totalX < 0 && totalY < 0) {
    return PERSONA_PROFILES.Q3;
  } else {
    return PERSONA_PROFILES.Q4;
  }
}
