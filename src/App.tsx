import { useState, useMemo, useEffect } from 'react';
import { NeighborhoodSimulation } from './components/NeighborhoodSimulation';
import { SurveyStage } from './components/SurveyStage';
import { ResultsView } from './components/ResultsView';
import {
  SURVEY_QUESTIONS,
  INITIAL_SIM_CONFIG,
  calculatePersona
} from './data/surveyData';
import { SimulationConfig } from './types';
import { Compass, RotateCcw } from 'lucide-react';
import { feedback, triggerFeedback } from './utils/feedback';
import { ambientAudio } from './utils/ambientAudio';

export default function App() {
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
  }, [isCompleted]);
  const [policyNote, setPolicyNote] = useState<string>(
    'Default neighborhood layout active (2.5 cars/home, 0.5 visitor passes, 3 driveway spots).'
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(feedback.isSoundEnabled());
  const [fontSizePt, setFontSizePt] = useState<number>(12); // Default 12pt (16px)

  useEffect(() => {
    // 1pt = 96/72 pixels
    document.documentElement.style.fontSize = `${fontSizePt * (96 / 72)}px`;
  }, [fontSizePt]);

  useEffect(() => {
    // Sync state with feedback and ambient audio manager
    const unsubscribeFeedback = feedback.subscribe((enabled) => setSoundEnabled(enabled));
    
    // Kick off ambient audio on mount if sound is enabled
    if (feedback.isSoundEnabled() && !isCompleted) {
      ambientAudio.play();
    }

    return () => {
      unsubscribeFeedback();
    };
  }, []);

  useEffect(() => {
    if (isCompleted) {
      ambientAudio.pause();
    } else if (soundEnabled) {
      ambientAudio.play();
    }
  }, [isCompleted, soundEnabled]);

  // Calculate cumulative X and Y scores
  const { totalX, totalY } = useMemo(() => {
    let x = 0;
    let y = 0;

    SURVEY_QUESTIONS.forEach((q) => {
      const selectedOptionId = selectedAnswers[q.id];
      if (selectedOptionId) {
        const option = q.options.find((opt) => opt.id === selectedOptionId);
        if (option) {
          x += option.x;
          y += option.y;
        }
      }
    });

    return { totalX: x, totalY: y };
  }, [selectedAnswers]);

  // Derived current persona
  const currentPersona = useMemo(() => {
    return calculatePersona(totalX, totalY);
  }, [totalX, totalY]);

  // Handle option selection
  const handleSelectOption = (questionId: string, optionId: string) => {
    setShowValidationError(false);
    const newAnswers = { ...selectedAnswers, [questionId]: optionId };
    setSelectedAnswers(newAnswers);

    // Find the option to apply simulation effects
    const question = SURVEY_QUESTIONS.find((q) => q.id === questionId);
    const option = question?.options.find((opt) => opt.id === optionId);

    if (option) {
      if (option.simEffects) {
        setSimConfig((prev) => ({
          ...prev,
          ...option.simEffects
        }));
      }

      // Generate conversational policy feedback
      if (option.hint) {
        setPolicyNote(option.hint);
      } else {
        setPolicyNote('Simulation updated based on your selection.');
      }
    }
  };

  // Step Navigation
  const handleNavigate = (direction: number) => {
    if (direction === 1) {
      const currentQuestion = SURVEY_QUESTIONS[currentStep];
      if (!selectedAnswers[currentQuestion.id]) {
        setShowValidationError(true);
        return;
      }
      setShowValidationError(false);

      if (currentStep >= SURVEY_QUESTIONS.length - 1) {
        setIsCompleted(true);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      setShowValidationError(false);
      if (currentStep > 0) {
        setCurrentStep((prev) => prev - 1);
      }
    }
  };

  // Reset / Retake
  const handleRetake = () => {
    triggerFeedback('button');
    setSelectedAnswers({});
    setCurrentStep(0);
    setIsCompleted(false);
    setShowValidationError(false);
    setSimConfig(INITIAL_SIM_CONFIG);
    setPolicyNote('Simulation reset to baseline configuration.');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#f4f6f8] text-gray-800 overflow-hidden font-sans">
      {/* Top Header Navigation Bar */}
      <header className="h-10 sm:h-11 bg-[#004B8D] text-white flex items-center justify-between px-2.5 sm:px-4 z-30 shadow-xs flex-shrink-0 border-b border-[#003566]">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-[#FFC72C] flex items-center justify-center font-black text-[#11283f] text-[0.625rem] sm:text-xs shadow-xs flex-shrink-0">
            YEG
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-black tracking-wide flex items-center gap-1.5 leading-none truncate">
              <span className="text-white">Curbside</span>
              <span className="text-[#FFC72C]">Compass</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          <div className="flex items-center bg-[#003566] rounded border border-[#002244] overflow-hidden flex-shrink-0">
            <button
              onClick={() => setFontSizePt(f => Math.max(8, f - 2))}
              className="w-10 h-8 sm:w-11 sm:h-9 flex items-center justify-center text-gray-300 hover:bg-[#002244] hover:text-white active:bg-black/30 transition-all font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] focus-visible:ring-inset"
              title="Decrease font size (-2pt)"
              aria-label="Decrease font size"
            >
              A-
            </button>
            <div className="w-[1px] h-5 bg-[#002244]" />
            <button
              onClick={() => setFontSizePt(f => Math.min(24, f + 2))}
              className="w-10 h-8 sm:w-11 sm:h-9 flex items-center justify-center text-gray-300 hover:bg-[#002244] hover:text-white active:bg-black/30 transition-all font-bold text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] focus-visible:ring-inset"
              title="Increase font size (+2pt)"
              aria-label="Increase font size"
            >
              A+
            </button>
          </div>

          {/* Leaning Persona Pill */}
          <div className="hidden lg:flex items-center gap-1.5 text-[0.6875rem] bg-black/25 px-2.5 py-1 rounded-full border border-white/15">
            <Compass className="w-3.5 h-3.5 text-[#FFC72C]" />
            <span className="text-gray-300">
              {isCompleted ? 'Final Persona:' : 'Live Trend:'}
            </span>
            <span className="font-bold text-white truncate max-w-[170px]">
              {currentPersona.title.replace('The ', '').replace(' Profile', '')}
            </span>
          </div>

          {isCompleted ? (
            <button
              type="button"
              onClick={handleRetake}
              title="Retake Assessment"
              className="text-[0.6875rem] sm:text-xs font-bold flex items-center justify-center gap-1.5 bg-[#FFC72C] text-[#004B8D] hover:bg-[#ffe066] active:bg-[#f5bc20] active:scale-95 px-2.5 sm:px-3 py-1 rounded shadow-xs transition-all cursor-pointer min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] focus-visible:ring-offset-1 focus-visible:ring-offset-[#193A5A]"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Retake</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRetake}
              title="Reset Survey and Simulation"
              className="text-[0.6875rem] sm:text-xs flex items-center justify-center gap-1 bg-white/15 hover:bg-white/25 active:bg-white/30 active:scale-95 text-white px-2 sm:px-2.5 py-1 rounded transition-colors min-h-[44px] min-w-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] focus-visible:ring-offset-1 focus-visible:ring-offset-[#193A5A]"
            >
              <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline font-semibold">Reset</span>
            </button>
          )}
        </div>
      </header>

      {/* Primary Split Viewport: Stacked on mobile portrait, side-by-side on desktop, tablet, and mobile landscape */}
      <main className="flex flex-col md:flex-row [@media(orientation:landscape)_and_(max-height:540px)]:flex-row flex-grow h-[calc(100dvh-40px)] sm:h-[calc(100dvh-44px)] overflow-hidden">
        {/* Simulation Section: On mobile vertical and mobile landscape, collapsed and hidden when on Assessment Result screen */}
        <section
          id="simulation-section"
          className={`relative bg-[#193A5A] flex-shrink-0 shadow-inner overflow-hidden border-[#004B8D] border-b-2 md:border-b-0 md:border-r-2 ${isCompleted ? "hidden md:block" : "w-full h-[50vh] min-h-[250px] sm:h-[50vh]"} md:h-full md:max-h-none md:w-[48%] lg:w-[50%] xl:w-[52%] [@media(orientation:landscape)_and_(max-height:540px)]:h-full [@media(orientation:landscape)_and_(max-height:540px)]:w-1/2 [@media(orientation:landscape)_and_(max-height:540px)]:border-b-0 [@media(orientation:landscape)_and_(max-height:540px)]:border-r-2`}
          aria-label="Neighborhood Parking Simulation View"
        >
          <NeighborhoodSimulation
            config={simConfig}
            onConfigChange={(updated) => setSimConfig((prev) => ({ ...prev, ...updated }))}
            activeQuestionNumber={currentStep + 1}
            policyNote={policyNote}
            isCompleted={isCompleted}
          />
        </section>

        {/* Interactive Survey or Results View */}
        <section
          id="survey-section"
          className={`w-full flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden min-h-0 bg-[#ffffff] md:h-full [@media(orientation:landscape)_and_(max-height:540px)]:h-full ${isCompleted ? "w-full md:w-[52%] lg:w-[50%] xl:w-[48%]" : "md:w-[52%] lg:w-[50%] xl:w-[48%] [@media(orientation:landscape)_and_(max-height:540px)]:w-1/2"}`}
          aria-label="Parking Policy Persona Survey"
        >
          {!isCompleted ? (
            <SurveyStage
              questions={SURVEY_QUESTIONS}
              currentStep={currentStep}
              selectedAnswers={selectedAnswers}
              onSelectOption={handleSelectOption}
              onNavigate={handleNavigate}
              showValidationError={showValidationError}
              totalX={totalX}
              totalY={totalY}
            />
          ) : (
            <ResultsView
              persona={currentPersona}
              totalX={totalX}
              totalY={totalY}
              config={simConfig}
              onRetake={handleRetake}
            />
          )}
        </section>
      </main>
    </div>
  );
}
