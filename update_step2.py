import re

with open('src/components/ResultsView.tsx', 'r') as f:
    content = f.read()

step2_replacement = """  // Step 2: Policy Details & Feedback
  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col gap-3 p-2 sm:p-3 md:p-4 overflow-y-auto">
      
      {/* Compass Result Section at the very top */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-xs flex-shrink-0">
        <h3 className="text-[0.625rem] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-[#0081BC]" />
          Your Curbside Compass Result
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-1 bg-blue-50/80 border border-blue-100 rounded-lg px-3 py-3 flex items-center text-sm gap-2 h-full">
            <div className="w-8 h-8 rounded-md flex items-center justify-center text-white shadow-xs flex-shrink-0" style={{ backgroundColor: persona.badgeColor }}>
              <Award className="w-4 h-4" />
            </div>
            <span className="font-bold text-[#005087] leading-tight">
              {persona.title}
            </span>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-col justify-center">
              <span className="text-gray-500 block text-[0.625rem] sm:text-xs mb-1">Curbside Fee Model</span>
              <span className="font-bold capitalize text-gray-800 text-xs sm:text-sm">
                {config.curbsideFeeModel}
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-col justify-center">
              <span className="text-gray-500 block text-[0.625rem] sm:text-xs mb-1">Enforcement Level</span>
              <span className="font-bold capitalize text-gray-800 flex items-center gap-1.5 text-xs sm:text-sm">
                <Shield className="w-4 h-4 text-[#009A44] flex-shrink-0" />
                {config.enforcementLevel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
        <div className="bg-[#193A5A]/5 border border-[#004B8D]/20 rounded-lg p-2.5 flex flex-col">
          <label className="block text-xs sm:text-sm font-bold text-[#004B8D] mb-2.5 leading-snug">
            Do you feel this represents your view on neighbourhood parking?
          </label>
          
          <div className="flex items-center justify-between gap-1.5 mb-1">
            {[1, 2, 3, 4, 5].map((val) => {
              const isSelected = rating === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    triggerFeedback('choice');
                    setRating(val);
                  }}
                  className={`flex-1 py-1.5 rounded text-[0.6875rem] font-bold transition-all cursor-pointer border active:scale-90 ${
                    isSelected
                      ? 'bg-[#004B8D] text-white border-[#004B8D] shadow-xs'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 border-gray-300'
                  }`}
                  title={`Rating: ${val}`}
                >
                  {val}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-[0.5rem] sm:text-[0.5625rem] text-gray-500 font-medium px-0.5 mb-2">
            <span>1 - Strongly Disagree</span>
            <span>5 - Strongly Agree</span>
          </div>
          
          <div className="flex items-center justify-between text-[0.5625rem] sm:text-xs mb-1">
            <label htmlFor="why-feedback" className="font-semibold text-gray-700">
              Why or why not?
            </label>
            <span className={`text-[0.5rem] font-medium ${500 - feedback.length < 50 ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
              {500 - feedback.length} left
            </span>
          </div>
          <textarea
            id="why-feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value.slice(0, 500))}
            maxLength={500}
            rows={2}
            placeholder="Share your thoughts..."
            className="w-full text-xs sm:text-sm text-gray-800 p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0081BC] focus:border-[#0081BC] resize-none bg-white leading-tight placeholder:text-gray-400 min-h-[40px]"
          />
          
          <div className="mt-2 flex items-center justify-between">
            {submitted ? (
              <span className="text-[0.625rem] font-semibold text-[#007a36] flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-[#009A44]" />
                Response submitted.
              </span>
            ) : (
              <span className="text-[0.5625rem] text-gray-500 italic">
                {rating ? `Rating: ${rating}/5` : 'Optional feedback'}
              </span>
            )}
            <button
              type="button"
              id="submit-feedback"
              onClick={() => {
                triggerFeedback('submit');
                setSubmitted(true);
              }}
              disabled={submitted}
              className={`px-4 py-1.5 text-xs sm:text-sm font-bold rounded transition-colors shadow-2xs flex items-center justify-center gap-1 cursor-pointer active:scale-95 min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B8D] ${
                submitted
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-[#004B8D] hover:bg-[#003866] text-white cursor-pointer'
              }`}
            >
              {submitted ? 'Submitted ✓' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
        
        {/* Left Column: You Believe */}
        <div className="flex flex-col gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col h-full">
            <h4 className="text-[0.625rem] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              You Believe
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-800 w-full px-1">
              {persona.keyPriorities.map((priority, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-tight">
                  <CheckCircle className="w-4 h-4 text-[#009A44] flex-shrink-0 mt-0.5" />
                  <span>{priority}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Postscript */}
        <div className="flex flex-col gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col h-full">
            <div className="flex items-start gap-2.5 mb-2">
              <div className="w-6 h-6 rounded-md bg-[#0081BC]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#0081BC]" />
              </div>
              <div className="leading-snug min-w-0">
                <h3 className="text-[0.625rem] sm:text-[0.6875rem] font-bold uppercase tracking-wider text-[#004B8D] mb-1">
                  Did you know? — Edmonton Alignment
                </h3>
              </div>
            </div>
            <p className="text-xs sm:text-[0.8125rem] text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 flex-grow">
              {persona.edmontonPolicyFit}
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
};"""

pattern = re.compile(r'  // Step 2: Policy Details & Feedback\n  return \(\n    <div className="w-full max-w-4xl mx-auto h-full flex flex-col gap-3 p-2 sm:p-3 md:p-4 overflow-y-auto">.*?  \);\n};\n', re.DOTALL)

new_content = pattern.sub(step2_replacement + '\n', content)

with open('src/components/ResultsView.tsx', 'w') as f:
    f.write(new_content)
print("Updated successfully")
