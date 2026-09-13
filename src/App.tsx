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
import { Compass, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { feedback, triggerFeedback } from './utils/feedback';
import { ambientAudio } from './utils/ambientAudio';

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [simConfig, setSimConfig] = useState<SimulationConfig>(INITIAL_SIM_CONFIG);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showValidationError, setShowValidationError] = useState<boolean>(false);
  const [policyNote, setPolicyNote] = useState<string>(
    'Default neighborhood layout active (2.5 cars/home, 0.5 visitor passes, 3 driveway spots).'
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(feedback.isSoundEnabled());

  useEffect(() => {
    // Sync state with feedback and ambient audio manager
    const unsubscribeFeedback = feedback.subscribe((enabled) => setSoundEnabled(enabled));
    
    // Kick off ambient audio on mount if sound is enabled
    if (feedback.isSoundEnabled()) {
      ambientAudio.play();
    }

    return () => {
      unsubscribeFeedback();
    };
  }, []);

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
      if (questionId === 'q1') {
        if (optionId === 'guaranteed') {
          setPolicyNote('Permit zone enacted: Curbside occupancy controlled to reserve spots for permitted residents.');
        } else if (optionId === 'free') {
          setPolicyNote('Unrestricted free parking: Higher curbside demand and cruising vehicles seeking spots.');
        } else {
          setPolicyNote('Emergency & delivery priority: Curbside kept clear for rapid stopping and delivery vans.');
        }
      } else if (questionId === 'q2') {
        if (optionId === 'freenolimit') {
          setPolicyNote('Free guest parking: Extra white visitor vehicles parked across curbside slots.');
        } else if (optionId === 'strict') {
          setPolicyNote('Commuter restrictions active: Strict visitor monitoring keeps street curbs clear.');
        } else {
          setPolicyNote('Visitor passes managed: Moderate visitor vehicle turnover on the block.');
        }
      } else if (questionId === 'q3') {
        setPolicyNote(
          optionId === 'user'
            ? 'User-pay model: Metered zones and permit enforcement fund street operations.'
            : 'Taxpayer model: Maintenance and snow clearing absorbed into city general operating budget.'
        );
      } else if (questionId === 'q4') {
        setPolicyNote(
          optionId === 'demandprice'
            ? 'Demand-responsive pricing: Spot turnover increases, reducing vehicle search circling.'
            : 'Free parking preference: Cruising vehicles circle looking for spots with occasional horns.'
        );
      } else if (questionId === 'q5') {
        setPolicyNote(
          optionId === 'closestmore'
            ? 'Tiered rates: Premium spots rotate frequently while standard spots absorb longer stays.'
            : 'Flat pricing: Uniform rates across all curbside slots.'
        );
      } else if (questionId === 'q6') {
        setPolicyNote(
          optionId === 'very'
            ? 'High enforcement presence: Strict clearance along crosswalks, driveways, and hydrants.'
            : optionId === 'not'
            ? 'Relaxed enforcement: Occasional double parking and neighbor discretion.'
            : 'Standard compliance: Routine parking compliance monitoring.'
        );
      } else if (questionId === 'q7') {
        setPolicyNote(`Revenue allocation preference: ${option.label}.`);
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

  const handleToggleSound = () => {
    const newState = feedback.toggleSound();
    setSoundEnabled(newState);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#f4f6f8] text-gray-800 overflow-hidden font-sans">
      {/* Top Header Navigation Bar */}
      <header className="h-10 sm:h-11 bg-[#004B8D] text-white flex items-center justify-between px-2.5 sm:px-4 z-30 shadow-xs flex-shrink-0 border-b border-[#003566]">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-[#FFC72C] flex items-center justify-center font-black text-[#11283f] text-[10px] sm:text-xs shadow-xs flex-shrink-0">
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
          {/* Sound / Ambient Traffic Audio Toggle Button */}
          <button
            type="button"
            id="ambient-sound-toggle-btn"
            onClick={handleToggleSound}
            title={
              soundEnabled
                ? 'Mute background city traffic ambient noise (5%) and sounds'
                : 'Play background city traffic ambient noise (5%) and sounds'
            }
            className="p-1 sm:px-2 sm:py-1 rounded text-white/80 hover:text-white hover:bg-white/15 active:bg-white/25 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 text-[11px] min-h-[28px]"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#FFC72C]" />
                <span className="hidden md:inline font-medium text-[10px] text-gray-200">
                  Traffic Ambience <span className="text-[#FFC72C] font-bold">5%</span>
                </span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-gray-300" />
                <span className="hidden md:inline font-medium text-[10px] text-gray-300">Ambience Muted</span>
              </>
            )}
          </button>

          {/* Leaning Persona Pill */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] bg-black/25 px-2.5 py-1 rounded-full border border-white/15">
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
              className="text-[11px] sm:text-xs font-bold flex items-center gap-1.5 bg-[#FFC72C] text-[#004B8D] hover:bg-[#ffe066] active:bg-[#f5bc20] active:scale-95 px-2.5 sm:px-3 py-1 rounded shadow-xs transition-all cursor-pointer min-h-[28px] sm:min-h-[30px]"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Retake</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRetake}
              title="Reset Survey and Simulation"
              className="text-[11px] sm:text-xs flex items-center gap-1 bg-white/15 hover:bg-white/25 active:bg-white/30 active:scale-95 text-white px-2 sm:px-2.5 py-1 rounded transition-colors min-h-[28px] sm:min-h-[30px] cursor-pointer"
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
          className={`${
            isCompleted
              ? 'hidden md:block'
              : 'w-full h-[28vh] min-h-[140px] max-h-[200px] sm:h-[30vh] sm:max-h-[225px]'
          } md:h-full md:max-h-none md:w-[48%] lg:w-[50%] xl:w-[52%] relative bg-[#193A5A] border-b-2 md:border-b-0 md:border-r-2 [@media(orientation:landscape)_and_(max-height:540px)]:h-full [@media(orientation:landscape)_and_(max-height:540px)]:w-1/2 [@media(orientation:landscape)_and_(max-height:540px)]:border-b-0 [@media(orientation:landscape)_and_(max-height:540px)]:border-r-2 border-[#004B8D] flex-shrink-0 shadow-inner overflow-hidden`}
          aria-label="Neighborhood Parking Simulation View"
        >
          <NeighborhoodSimulation
            config={simConfig}
            onConfigChange={(updated) => setSimConfig((prev) => ({ ...prev, ...updated }))}
            activeQuestionNumber={currentStep + 1}
            policyNote={policyNote}
          />
        </section>

        {/* Interactive Survey or Results View */}
        <section
          id="survey-section"
          className={`w-full flex-1 ${
            isCompleted
              ? 'w-full md:w-[52%] lg:w-[50%] xl:w-[48%]'
              : 'md:w-[52%] lg:w-[50%] xl:w-[48%] [@media(orientation:landscape)_and_(max-height:540px)]:w-1/2'
          } md:h-full [@media(orientation:landscape)_and_(max-height:540px)]:h-full bg-[#ffffff] flex flex-col justify-between overflow-hidden min-h-0`}
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
