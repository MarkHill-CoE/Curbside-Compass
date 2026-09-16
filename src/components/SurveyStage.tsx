import React from 'react';
import { SurveyQuestion } from '../types';
import { ChevronLeft, ChevronRight, CheckCircle2, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerFeedback } from '../utils/feedback';

interface SurveyStageProps {
  questions: SurveyQuestion[];
  currentStep: number;
  selectedAnswers: Record<string, string>;
  onSelectOption: (questionId: string, optionId: string) => void;
  onNavigate: (direction: number) => void;
  showValidationError: boolean;
  validationErrorMsg?: string | null;
  totalX: number;
  totalY: number;
}

export const SurveyStage: React.FC<SurveyStageProps> = ({
  questions,
  currentStep,
  selectedAnswers,
  onSelectOption,
  onNavigate,
  showValidationError,
  validationErrorMsg,
  totalX,
  totalY
}) => {
  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const progressPct = ((currentStep + 1) / questions.length) * 100;
  const currentAnswer = selectedAnswers[currentQuestion.id];
  const isTextQuestion = currentQuestion.type === 'text' || currentQuestion.options.length === 0;

  // Dynamic grid configuration based on option count
  // In tablet vertical (md to lg), we stack vertically to use the wider space for larger text
  const optionCount = currentQuestion.options.length;
  let gridClasses = 'grid grid-cols-1 gap-1.5 sm:gap-2 md:gap-3 lg:gap-2 w-full';
  if (optionCount === 2) {
    gridClasses =
      'grid grid-cols-1 lg:grid-cols-2 gap-1.5 sm:gap-2 md:gap-3 lg:gap-2 w-full';
  } else if (optionCount === 4) {
    gridClasses =
      'grid grid-cols-1 lg:grid-cols-2 gap-1.5 sm:gap-2 md:gap-3 lg:gap-2 w-full';
  } else if (optionCount === 3) {
    gridClasses =
      'grid grid-cols-1 xl:grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 lg:gap-2 w-full';
  }

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col justify-between p-1.5 sm:p-2 md:p-3 overflow-y-auto">
      {/* Progress & Category Header */}
      <div className="flex flex-col gap-1 flex-shrink-0 mb-0.5 sm:mb-1">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-500 gap-1">
          <span className="flex items-center gap-1.5 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-[#004B8D] flex-shrink-0" />
            <span className="uppercase tracking-wider font-bold text-[#004B8D]">
              Question {currentStep + 1} of {questions.length}
            </span>
            <span className="text-gray-300">•</span>
            <span className="capitalize text-gray-600 truncate">
              {currentQuestion.category === 'location'
                ? 'Neighbourhood Location'
                : currentQuestion.category === 'demographics'
                ? 'Demographics'
                : `${currentQuestion.category} Policy`}
            </span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#004B8D]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>
      </div>

      {/* Animated Question Card with adaptive layout */}
      <div className="relative flex-grow flex flex-col justify-start min-h-0 overflow-y-auto pt-0.5 pb-0.5 sm:pt-1 pr-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col w-full"
          >
            <h3 className="text-sm sm:text-base md:text-[16pt] lg:text-lg font-bold text-[#004B8D] mb-1.5 sm:mb-2 md:mb-3 lg:mb-1.5 leading-snug">
              {currentQuestion.text}
            </h3>

            {isTextQuestion ? (
              /* Text Input Mode for Postal Code (Q9) */
              <div className="w-full flex flex-col gap-2.5 pt-1">
                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
                  {currentQuestion.helperText || 'Please enter your 6 or 7 character alphanumeric postal code (e.g., T5J 2R7 or T5J2R7).'}
                </p>

                <div className="relative max-w-md w-full">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-[#004B8D]" />
                  </div>
                  <input
                    type="text"
                    id="postal-code-input"
                    autoFocus
                    disabled={currentAnswer === 'OPT_OUT'}
                    autoComplete="postal-code"
                    maxLength={8}
                    placeholder={currentQuestion.placeholder || "e.g. T5J 2R7"}
                    value={currentAnswer === 'OPT_OUT' ? '' : (currentAnswer || '')}
                    onChange={(e) => {
                      const raw = e.target.value.toUpperCase();
                      const sanitized = raw.replace(/[^A-Z0-9\s-]/g, '').slice(0, 8);
                      onSelectOption(currentQuestion.id, sanitized);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        triggerFeedback(isLastQuestion ? 'submit' : 'button');
                        onNavigate(1);
                      }
                    }}
                    className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-white border-2 border-gray-300 rounded-lg text-base sm:text-lg md:text-xl font-bold font-mono text-[#004B8D] tracking-widest placeholder:text-gray-400 placeholder:font-sans placeholder:tracking-normal placeholder:font-normal placeholder:text-sm focus:outline-none focus:border-[#004B8D] focus:ring-2 focus:ring-[#004B8D]/20 transition-all shadow-xs"
                    aria-label="Postal code input"
                  />
                </div>

                {/* Real-time validation indicator */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {(() => {
                    if (currentAnswer === 'OPT_OUT') {
                      return null;
                    }
                    const alphaNumCount = (currentAnswer || '').replace(/[^A-Z0-9]/gi, '').length;
                    if (alphaNumCount === 0) {
                      return (
                        <span className="text-gray-500 font-medium">
                          Expecting 6 or 7 alphanumeric characters (e.g., T5J 2R7 or T5J2R7)
                        </span>
                      );
                    }
                    if (alphaNumCount === 6 || alphaNumCount === 7) {
                      return (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Valid postal code ({alphaNumCount} alphanumeric characters)
                        </span>
                      );
                    }
                    return (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        {alphaNumCount} alphanumeric character{alphaNumCount === 1 ? '' : 's'} entered (need 6 or 7)
                      </span>
                    );
                  })()}
                </div>

                <div className="bg-[#193A5A]/5 border border-[#004B8D]/15 rounded-lg p-2.5 sm:p-3 text-xs text-gray-700 leading-relaxed max-w-lg mt-1">
                  <span className="font-bold text-[#004B8D] block mb-0.5">Edmonton Tip:</span>
                  Edmonton postal codes begin with <span className="font-mono font-semibold">T5</span> or <span className="font-mono font-semibold">T6</span> (for example, <span className="font-mono font-semibold">T5J 2R7</span> for Downtown, <span className="font-mono font-semibold">T6G 2R3</span> for Garneau/University, or <span className="font-mono font-semibold">T5K 1X4</span> for Oliver/Wîhkwêntôwin).
                </div>
                
                <label className="flex items-center gap-2 mt-2 cursor-pointer w-fit opacity-80 hover:opacity-100 transition-opacity">
                  <input
                    type="checkbox"
                    checked={currentAnswer === 'OPT_OUT'}
                    onChange={(e) => {
                      triggerFeedback('choice');
                      onSelectOption(currentQuestion.id, e.target.checked ? 'OPT_OUT' : '');
                    }}
                    className="w-4 h-4 text-[#004B8D] rounded border-gray-300 focus:ring-[#004B8D]"
                  />
                  <span className="text-sm font-semibold text-gray-700 select-none">I prefer not to provide my postal code</span>
                </label>
              </div>
            ) : (
              /* Options List with WAI-ARIA arrow key navigation */
              <div
                className={gridClasses}
                role="radiogroup"
                aria-label={`Options for ${currentQuestion.text}`}
                onKeyDown={(e) => {
                  if (['ArrowDown', 'ArrowRight'].includes(e.key)) {
                    e.preventDefault();
                    const options = currentQuestion.options || [];
                    const currentIndex = options.findIndex((o) => o.id === currentAnswer);
                    const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
                    const nextOption = options[nextIndex];
                    if (nextOption) {
                      triggerFeedback('choice');
                      onSelectOption(currentQuestion.id, nextOption.id);
                      document.getElementById(`option-btn-${nextOption.id}`)?.focus();
                    }
                  } else if (['ArrowUp', 'ArrowLeft'].includes(e.key)) {
                    e.preventDefault();
                    const options = currentQuestion.options || [];
                    const currentIndex = options.findIndex((o) => o.id === currentAnswer);
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
                    const prevOption = options[prevIndex];
                    if (prevOption) {
                      triggerFeedback('choice');
                      onSelectOption(currentQuestion.id, prevOption.id);
                      document.getElementById(`option-btn-${prevOption.id}`)?.focus();
                    }
                  }
                }}
              >
                {currentQuestion.options.map((option) => {
                  const isSelected = currentAnswer === option.id;
                  return (
                    <button
                      key={option.id}
                      id={`option-btn-${option.id}`}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={isSelected || (!currentAnswer && option === currentQuestion.options[0]) ? 0 : -1}
                      onClick={() => {
                        triggerFeedback('choice');
                        onSelectOption(currentQuestion.id, option.id);
                      }}
                      className={`w-full text-left p-2 sm:p-2.5 md:p-3.5 lg:p-2.5 rounded-lg border-2 transition-all flex items-start gap-2 sm:gap-2.5 md:gap-3 cursor-pointer relative min-h-[44px] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B8D] focus-visible:ring-offset-2 ${
                        isSelected
                          ? 'border-[#004B8D] bg-[#004B8D]/5 shadow-xs ring-1 ring-[#004B8D]'
                          : 'border-gray-200 bg-white hover:border-[#004B8D]/40 hover:bg-gray-50'
                      }`}
                    >
                      <div className="pt-0.5 flex-shrink-0">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-[#004B8D] bg-[#004B8D] scale-105'
                              : 'border-gray-400 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        </div>
                      </div>

                      <div className="flex flex-col flex-grow min-w-0">
                        <span
                          className={`text-xs sm:text-sm md:text-[16pt] lg:text-base font-semibold leading-snug ${
                            isSelected ? 'text-[#004B8D]' : 'text-gray-800'
                          }`}
                        >
                          {option.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons & Validation Alert (always pinned at bottom) */}
      <div className="mt-auto pt-1.5 sm:pt-2 border-t border-gray-200 flex flex-col gap-1.5 flex-shrink-0">
        {showValidationError && (
          <div 
            role="alert" 
            aria-live="assertive"
            className="text-xs sm:text-sm text-[#E8552D] bg-[#E8552D]/10 border border-[#E8552D]/30 px-3 py-1.5 rounded-md font-semibold flex items-center gap-2 animate-pulse"
          >
            <span className="w-2 h-2 rounded-full bg-[#E8552D] flex-shrink-0" aria-hidden="true" />
            {validationErrorMsg || (isTextQuestion ? 'Please enter a 6 or 7 character alphanumeric postal code.' : 'Please select an option to advance.')}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <button
            type="button"
            id="survey-prev-btn"
            disabled={currentStep === 0}
            onClick={() => {
              if (currentStep > 0) {
                triggerFeedback('button');
                onNavigate(-1);
              }
            }}
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-md font-semibold text-xs sm:text-sm flex items-center gap-1.5 border transition-all min-h-[44px] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B8D] ${
              currentStep === 0
                ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 cursor-pointer shadow-xs'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            type="button"
            id="survey-next-btn"
            onClick={() => {
              triggerFeedback(isLastQuestion ? 'submit' : 'button');
              onNavigate(1);
            }}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-md font-bold text-xs sm:text-sm bg-[#004B8D] hover:bg-[#003566] active:scale-95 text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#004B8D]"
          >
            {isLastQuestion ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#FFC72C]" />
                Calculate Final Persona
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
