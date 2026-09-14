import React from 'react';
import { SurveyQuestion } from '../types';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerFeedback } from '../utils/feedback';

interface SurveyStageProps {
  questions: SurveyQuestion[];
  currentStep: number;
  selectedAnswers: Record<string, string>;
  onSelectOption: (questionId: string, optionId: string) => void;
  onNavigate: (direction: number) => void;
  showValidationError: boolean;
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
  totalX,
  totalY
}) => {
  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const progressPct = ((currentStep + 1) / questions.length) * 100;
  const currentAnswer = selectedAnswers[currentQuestion.id];

  // Dynamic grid configuration based on option count
  // In tablet horizontal (and tablet landscape), question boxes stack vertically in a single column
  const optionCount = currentQuestion.options.length;
  let gridClasses = 'grid grid-cols-1 gap-1 sm:gap-1.5 w-full';
  if (optionCount === 2) {
    gridClasses =
      'grid grid-cols-1 sm:grid-cols-2 md:landscape:grid-cols-1 [@media(min-width:768px)_and_(orientation:landscape)]:grid-cols-1 xl:grid-cols-2 gap-1 sm:gap-1.5 w-full';
  } else if (optionCount === 4) {
    gridClasses =
      'grid grid-cols-1 sm:grid-cols-2 md:landscape:grid-cols-1 [@media(min-width:768px)_and_(orientation:landscape)]:grid-cols-1 xl:grid-cols-2 gap-1 sm:gap-1.5 w-full';
  } else if (optionCount === 3) {
    gridClasses =
      'grid grid-cols-1 md:landscape:grid-cols-1 [@media(min-width:768px)_and_(orientation:landscape)]:grid-cols-1 2xl:grid-cols-3 gap-1 sm:gap-1.5 w-full';
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
            <span className="capitalize text-gray-600 truncate">{currentQuestion.category} Policy</span>
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
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#004B8D] mb-1 sm:mb-1.5 leading-snug">
              {currentQuestion.text}
            </h3>

            {/* Options List */}
            <div className={gridClasses} role="radiogroup" aria-label={`Options for ${currentQuestion.text}`}>
              {currentQuestion.options.map((option) => {
                const isSelected = currentAnswer === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      triggerFeedback('choice');
                      onSelectOption(currentQuestion.id, option.id);
                    }}
                    className={`w-full text-left p-1 sm:p-1.5 md:p-2 rounded-lg border-2 transition-all flex items-start gap-1 sm:gap-1.5 cursor-pointer relative min-h-[36px] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B8D] focus-visible:ring-offset-2 ${
                      isSelected
                        ? 'border-[#004B8D] bg-[#004B8D]/5 shadow-xs ring-1 ring-[#004B8D]'
                        : 'border-gray-200 bg-white hover:border-[#004B8D]/40 hover:bg-gray-50'
                    }`}
                  >
                    <div className="pt-0.5 flex-shrink-0">
                      <div
                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-[#004B8D] bg-[#004B8D]'
                            : 'border-gray-400 bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                      </div>
                    </div>

                    <div className="flex flex-col flex-grow min-w-0">
                      <span
                        className={`text-xs sm:text-sm md:text-base font-semibold leading-tight ${
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
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons & Validation Alert (always pinned at bottom) */}
      <div className="mt-auto pt-1 sm:pt-1.5 border-t border-gray-200 flex flex-col gap-1 flex-shrink-0">
        {showValidationError && (
          <div 
            role="alert" 
            aria-live="assertive"
            className="text-xs sm:text-sm text-[#E8552D] bg-[#E8552D]/10 border border-[#E8552D]/30 px-2 py-0.5 rounded font-semibold flex items-center gap-1.5 animate-pulse"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8552D]" aria-hidden="true" />
            Please select an option to advance.
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
            className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-md font-semibold text-xs sm:text-sm flex items-center gap-1 border transition-all min-h-[36px] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B8D] ${
              currentStep === 0
                ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 cursor-pointer shadow-xs'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Previous
          </button>

          <button
            type="button"
            id="survey-next-btn"
            onClick={() => {
              triggerFeedback(isLastQuestion ? 'submit' : 'button');
              onNavigate(1);
            }}
            className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-md font-bold text-xs sm:text-sm bg-[#004B8D] hover:bg-[#003566] active:scale-95 text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#004B8D]"
          >
            {isLastQuestion ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFC72C]" />
                Calculate Final Persona
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
