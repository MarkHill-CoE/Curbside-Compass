import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [simConfig, setSimConfig] = useState<SimulationConfig>(INITIAL_SIM_CONFIG);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showValidationError, setShowValidationError] = useState<boolean>(false);"""

replacement = """export default function App() {
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
  });
  const [showValidationError, setShowValidationError] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('curbsideCompass_step', currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem('curbsideCompass_answers', JSON.stringify(selectedAnswers));
  }, [selectedAnswers]);

  useEffect(() => {
    localStorage.setItem('curbsideCompass_simConfig', JSON.stringify(simConfig));
  }, [simConfig]);

  useEffect(() => {
    localStorage.setItem('curbsideCompass_completed', isCompleted.toString());
  }, [isCompleted]);"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Added localStorage to App.tsx")
