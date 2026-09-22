import { useState, useMemo, useEffect, useCallback } from 'react';
import { NeighborhoodSimulation } from './components/NeighborhoodSimulation';
import { SurveyStage } from './components/SurveyStage';
import { ResultsView } from './components/ResultsView';
import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';
import { useAppText } from './context/TextContentContext';
import {
  SURVEY_QUESTIONS,
  INITIAL_SIM_CONFIG,
  calculatePersona,
  validatePostalCode
} from './data/surveyData';
import { SimulationConfig } from './types';
import { Compass, RotateCcw, FileSpreadsheet } from 'lucide-react';
import { feedback, triggerFeedback } from './utils/feedback';
import { ambientAudio } from './utils/ambientAudio';

export default function App() {
  const { t, isCustomActive, itemCount } = useAppText();
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
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
  const [validationErrorMsg, setValidationErrorMsg] = useState<string | null>(null);

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
  const [hasManuallyChangedFont, setHasManuallyChangedFont] = useState(false);
  const [fontSizePt, setFontSizePt] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const isTabletPortrait = window.matchMedia('(min-width: 768px) and (max-width: 1023px) and (orientation: portrait)').matches;
      return isTabletPortrait ? 14 : 12;
    }
    return 12;
  }); // Default 12pt, or 14pt on tablet portrait

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(min-width: 768px) and (max-width: 1023px) and (orientation: portrait)');
    const handler = (e: MediaQueryListEvent) => {
      if (!hasManuallyChangedFont) {
        setFontSizePt(e.matches ? 14 : 12);
      }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [hasManuallyChangedFont]);

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
  const handleSelectOption = useCallback((questionId: string, optionId: string) => {
    setShowValidationError(false);
    setValidationErrorMsg(null);
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));

    const question = SURVEY_QUESTIONS.find((q) => q.id === questionId);
    if (question?.type === 'text' || questionId === 'q9') {
      const trimmed = optionId.trim();
      if (trimmed) {
        setPolicyNote(`Edmonton postal code ${trimmed.toUpperCase()} recorded for local neighbourhood spatial analysis.`);
      }
      return;
    }

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
  }, []);

  // Step Navigation
  const handleNavigate = useCallback((direction: number) => {
    if (direction === 1) {
      const currentQuestion = SURVEY_QUESTIONS[currentStep];
      const answer = selectedAnswers[currentQuestion.id];

      if (currentQuestion.type === 'text' || currentQuestion.id === 'q9') {
        const valResult = validatePostalCode(answer || '');
        if (!valResult.isValid) {
          setValidationErrorMsg(valResult.message || 'Please enter a 6 or 7 character alphanumeric postal code.');
          setShowValidationError(true);
          return;
        }
      } else if (!answer) {
        setValidationErrorMsg('Please select an option to advance.');
        setShowValidationError(true);
        return;
      }

      setShowValidationError(false);
      setValidationErrorMsg(null);

      if (currentStep >= SURVEY_QUESTIONS.length) {
        setIsCompleted(true);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      setShowValidationError(false);
      setValidationErrorMsg(null);
      if (currentStep > 0) {
        setCurrentStep((prev) => prev - 1);
      }
    }
  }, [currentStep, selectedAnswers]);

  // Reset / Retake
  const handleRetake = useCallback(() => {
    triggerFeedback('button');
    setSelectedAnswers({});
    setCurrentStep(0);
    setIsCompleted(false);
    setShowValidationError(false);
    setValidationErrorMsg(null);
    setSimConfig(INITIAL_SIM_CONFIG);
    setPolicyNote('Simulation reset to baseline configuration.');
  }, []);

  const handleConfigChange = useCallback((updated: Partial<SimulationConfig>) => {
    setSimConfig((prev) => ({ ...prev, ...updated }));
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#f4f6f8] text-gray-800 overflow-hidden font-sans">
      {/* Top Header Navigation Bar */}
      <header className="h-10 sm:h-11 bg-[#004B8D] text-white flex items-center justify-between px-2.5 sm:px-4 z-30 shadow-xs flex-shrink-0 border-b border-[#003566]">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <img
            id="header-safemobility-compass-logo"
            src="/SafeMobility_Compass.png"
            alt={t('header_logo_alt', 'SafeMobility Compass')}
            className="w-6 h-6 sm:w-7 sm:h-7 object-contain flex-shrink-0 drop-shadow-xs"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-black tracking-wide flex items-center gap-1.5 leading-none truncate">
              <span className="text-white">{t('header_title_curbside', 'Curbside')}</span>
              <span className="text-[#FFC72C]">{t('header_title_compass', 'Compass')}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* Google Sheets Sync Button */}
          <button
            type="button"
            onClick={() => setIsSyncModalOpen(true)}
            title={isCustomActive ? `Google Sheet Synced (${itemCount} items) - Click to Manage` : 'Sync Copy from Google Sheets'}
            aria-label="Google Sheet Content Sync"
            className={`text-[0.6875rem] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded transition-all min-h-[44px] cursor-pointer border ${
              isCustomActive
                ? 'bg-emerald-700/80 hover:bg-emerald-600 text-white border-emerald-400'
                : 'bg-white/10 hover:bg-white/20 text-gray-200 border-white/20'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#FFC72C]" />
            <span className="hidden sm:inline font-bold">
              {isCustomActive ? 'Sheet Synced' : 'Sync Sheet'}
            </span>
            {isCustomActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            )}
          </button>

          <div className="flex items-center bg-[#003566] rounded-md border border-[#002244] overflow-hidden flex-shrink-0">
            <button
              onClick={() => { setHasManuallyChangedFont(true); setFontSizePt(f => Math.max(8, f - 2)); }}
              className="w-11 h-11 flex items-center justify-center text-gray-300 hover:bg-[#002244] hover:text-white active:bg-black/30 transition-all font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] focus-visible:ring-inset cursor-pointer"
              title="Decrease font size (-2pt)"
              aria-label="Decrease font size"
            >
              A-
            </button>
            <div className="w-[1px] h-6 bg-[#002244]" />
            <button
              onClick={() => { setHasManuallyChangedFont(true); setFontSizePt(f => Math.min(24, f + 2)); }}
              className="w-11 h-11 flex items-center justify-center text-gray-300 hover:bg-[#002244] hover:text-white active:bg-black/30 transition-all font-bold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] focus-visible:ring-inset cursor-pointer"
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
              {isCompleted ? t('header_final_persona', 'Final Persona:') : t('header_live_trend', 'Live Trend:')}
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
              <span>{t('header_retake_btn', 'Retake')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRetake}
              title="Reset Survey and Simulation"
              className="text-[0.6875rem] sm:text-xs flex items-center justify-center gap-1 bg-white/15 hover:bg-white/25 active:bg-white/30 active:scale-95 text-white px-2 sm:px-2.5 py-1 rounded transition-colors min-h-[44px] min-w-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] focus-visible:ring-offset-1 focus-visible:ring-offset-[#193A5A]"
            >
              <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline font-semibold">{t('header_reset_btn', 'Reset')}</span>
            </button>
          )}
        </div>
      </header>

      {/* Primary Split Viewport: Stacked on mobile portrait, side-by-side on desktop, tablet, and mobile landscape */}
      <main className="flex flex-col lg:flex-row [@media(orientation:landscape)_and_(max-height:540px)]:flex-row flex-grow h-[calc(100dvh-40px)] sm:h-[calc(100dvh-44px)] overflow-hidden">
        {/* Simulation Section: Ergonomic mobile height (38vh max 320px on small screens) to give survey plenty of room */}
        <section
          id="simulation-section"
          className={`relative bg-[#193A5A] flex-shrink-0 shadow-inner overflow-hidden border-[#004B8D] border-b-2 lg:border-b-0 lg:border-r-2 ${
            isCompleted
              ? "hidden lg:block"
              : "w-full h-[38vh] min-h-[190px] max-h-[320px] sm:h-[45vh] sm:max-h-none"
          } lg:h-full lg:max-h-none lg:w-[48%] xl:w-[50%] 2xl:w-[52%] [@media(orientation:landscape)_and_(max-height:540px)]:h-full [@media(orientation:landscape)_and_(max-height:540px)]:w-1/2 [@media(orientation:landscape)_and_(max-height:540px)]:border-b-0 [@media(orientation:landscape)_and_(max-height:540px)]:border-r-2`}
          aria-label="Neighborhood Parking Simulation View"
        >
          <NeighborhoodSimulation
            config={simConfig}
            onConfigChange={handleConfigChange}
            activeQuestionNumber={currentStep + 1}
            policyNote={policyNote}
            isCompleted={isCompleted}
          />
        </section>

        {/* Interactive Survey or Results View */}
        <section
          id="survey-section"
          className={`w-full flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden min-h-0 bg-[#ffffff] lg:h-full [@media(orientation:landscape)_and_(max-height:540px)]:h-full ${isCompleted ? "w-full lg:w-[52%] xl:w-[50%] 2xl:w-[48%]" : "lg:w-[52%] xl:w-[50%] 2xl:w-[48%] [@media(orientation:landscape)_and_(max-height:540px)]:w-1/2"}`}
          aria-label="Parking Policy Persona Survey"
        >
          {!isCompleted ? (
            currentStep < SURVEY_QUESTIONS.length ? (
              <SurveyStage
                questions={SURVEY_QUESTIONS}
                currentStep={currentStep}
                selectedAnswers={selectedAnswers}
                onSelectOption={handleSelectOption}
                onNavigate={handleNavigate}
                showValidationError={showValidationError}
                validationErrorMsg={validationErrorMsg}
                totalX={totalX}
                totalY={totalY}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                 <h2 className="text-2xl sm:text-3xl font-black text-[#004B8D]">
                   {t('watch_title', 'Watch the Street!')}
                 </h2>
                 <p className="text-gray-600 max-w-md text-sm sm:text-base">
                   {t('watch_desc', 'Based on your policy choices, the neighborhood parking demand has been set. Observe the simulation to see if your policies lead to harmony or chaos!')}
                 </p>
                 <div className="flex gap-4 pt-4">
                   <button onClick={() => setCurrentStep(prev => prev - 1)} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-200 transition-all border border-gray-300 cursor-pointer">
                     {t('watch_btn_back', 'Back')}
                   </button>
                   <button onClick={() => setIsCompleted(true)} className="px-6 py-2.5 bg-[#004B8D] text-white font-bold rounded-lg shadow-md hover:bg-[#003566] transition-all flex items-center gap-2 cursor-pointer">
                     {t('watch_btn_results', 'See Final Results')}
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                   </button>
                 </div>
              </div>
            )
          ) : (
            <ResultsView
              persona={currentPersona}
              totalX={totalX}
              totalY={totalY}
              config={simConfig}
              answers={selectedAnswers}
              onRetake={handleRetake}
            />
          )}
        </section>
      </main>

      {/* Google Sheets Sync Modal */}
      <GoogleSheetSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
}
