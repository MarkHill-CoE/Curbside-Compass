import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Change handleNavigate
old_nav = """      if (currentStep >= SURVEY_QUESTIONS.length - 1) {
        setIsCompleted(true);
      } else {
        setCurrentStep((prev) => prev + 1);
      }"""
new_nav = """      if (currentStep >= SURVEY_QUESTIONS.length) {
        setIsCompleted(true);
      } else {
        setCurrentStep((prev) => prev + 1);
      }"""
content = content.replace(old_nav, new_nav)

# Render Watch the Street state
old_render = """          {!isCompleted ? (
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
          ) : ("""

new_render = """          {!isCompleted ? (
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
                 <h2 className="text-2xl sm:text-3xl font-black text-[#004B8D]">Watch the Street!</h2>
                 <p className="text-gray-600 max-w-md text-sm sm:text-base">
                   Based on your policy choices, the neighborhood parking demand has been set. Observe the simulation to see if your policies lead to harmony or chaos!
                 </p>
                 <div className="flex gap-4 pt-4">
                   <button onClick={() => setCurrentStep(prev => prev - 1)} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-200 transition-all border border-gray-300">Back</button>
                   <button onClick={() => setIsCompleted(true)} className="px-6 py-2.5 bg-[#004B8D] text-white font-bold rounded-lg shadow-md hover:bg-[#003566] transition-all flex items-center gap-2">
                     See Final Results
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                   </button>
                 </div>
              </div>
            )
          ) : ("""

content = content.replace(old_render, new_render)

with open("src/App.tsx", "w") as f:
    f.write(content)
