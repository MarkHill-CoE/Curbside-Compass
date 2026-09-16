export interface SurveyOption {
  id: string;
  label: string;
  x: number; // fiscal axis (-2: Taxpayer ... +2: User)
  y: number; // regulatory axis (-2: Open/Unrestricted ... +2: Strict/Regulated)
  simEffects?: Partial<SimulationConfig>;
  hint?: string;
}

export interface SurveyQuestion {
  id: string;
  number: number;
  text: string;
  category: 'residential' | 'visitors' | 'finance' | 'commercial' | 'pricing' | 'enforcement' | 'revenue' | 'demographics' | 'location';
  type?: 'choice' | 'text';
  placeholder?: string;
  helperText?: string;
  options: SurveyOption[];
}

export interface SimulationConfig {
  householdCarsPerHome: number; // 0 - 5 (default 2.5)
  visitorPassesPerHome: number; // 0 - 5 (default 0.5)
  drivewayCapacity: number; // 1 - 2 (single-car wide: 1 or 2 tandem)
  deliveriesPerHomePerWeek: number; // 1 - 4 (default 1.0)
  enforcementLevel: 'strict' | 'standard' | 'lenient';
  cruisingTrafficLevel: 'low' | 'moderate' | 'high';
  curbsideFeeModel: 'free' | 'permit' | 'demand';
}

export interface PersonaResult {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  xRange: 'user' | 'taxpayer';
  yRange: 'restrictive' | 'open';
  keyPriorities: string[];
  edmontonPolicyFit: string;
  badgeColor: string;
}


declare global {
  interface Window {
    __riotAudioPlayed?: boolean;
    __riotAudioPending?: boolean;
    __riotAudio?: HTMLAudioElement;
    __agentArtifactAudioUrl?: string;
  }
}
