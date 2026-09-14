import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const saved = localStorage.getItem('curbsideCompass_step');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('curbsideCompass_answers');
    return saved ? JSON.parse(saved) : {};
  });
  const [simConfig, setSimConfig] = useState<SimulationConfig>(() => {
    const saved = localStorage.getItem('curbsideCompass_simConfig');
    return saved ? JSON.parse(saved) : INITIAL_SIM_CONFIG;
  });
  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    const saved = localStorage.getItem('curbsideCompass_completed');
    return saved === 'true';
  });"""

replacement = """export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('curbsideCompass_step');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('curbsideCompass_answers');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [simConfig, setSimConfig] = useState<SimulationConfig>(() => {
    try {
      const saved = localStorage.getItem('curbsideCompass_simConfig');
      return saved ? JSON.parse(saved) : INITIAL_SIM_CONFIG;
    } catch {
      return INITIAL_SIM_CONFIG;
    }
  });
  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('curbsideCompass_completed');
      return saved === 'true';
    } catch {
      return false;
    }
  });"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Added try/catch to App.tsx")
