import React from 'react';
import { PersonaResult, SimulationConfig } from '../types';
import { Award, MapPin, CheckCircle, Car, Shield, Compass } from 'lucide-react';
import { ThankYouView } from './ThankYouView';
import { PolicyCompassGraph } from './PolicyCompassGraph';
import { triggerFeedback } from '../utils/feedback';

interface ResultsViewProps {
  persona: PersonaResult;
  totalX: number;
  totalY: number;
  config: SimulationConfig;
  onRetake?: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  persona,
  totalX,
  totalY,
  config,
  onRetake
}) => {
  const [rating, setRating] = React.useState<number | null>(null);
  const [feedback, setFeedback] = React.useState<string>('');
  const [submitted, setSubmitted] = React.useState<boolean>(false);

  // If user submitted final question, show Thank You screen with social sharing
  if (submitted) {
    return (
      <ThankYouView
        persona={persona}
        onViewResults={() => setSubmitted(false)}
        onRetake={onRetake}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col justify-between p-1.5 sm:p-2.5 md:p-3 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-grow min-h-0 flex flex-col justify-start py-0.5 sm:py-1 overflow-y-auto">
        {/* Desktop / Tablet View (md and up): 1. Persona, 2. You Believe, 3. Policy Compass, 4. Simulated Outcome, 5. City of Edmonton Alignment (very last) */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-2.5 items-stretch my-0">
          {/* 1. User's Parking Persona Result (5 cols) */}
          <div className="md:col-span-5 flex flex-col">
            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs flex flex-col justify-center h-full">
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-white shadow-xs flex-shrink-0"
                  style={{ backgroundColor: persona.badgeColor }}
                >
                  <Award className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
                  {persona.title}
                </h3>
              </div>
              <p className="text-xs text-gray-700 leading-normal">
                {persona.description}
              </p>
            </div>
          </div>

          {/* 2. You Believe (7 cols) */}
          <div className="md:col-span-7 flex flex-col">
            <div className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-xs flex flex-col justify-between h-full">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  You Believe
                </h3>
                <ul className="grid grid-cols-1 gap-1 mb-1.5">
                  {persona.keyPriorities.map((priority, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-[10.5px] text-gray-800 leading-snug">
                      <CheckCircle className="w-3.5 h-3.5 text-[#009A44] flex-shrink-0 mt-0.5" />
                      <span>{priority}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Shaded Sub-container for Question, Textarea, and Submit Button */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-2 mt-1">
                <label className="block text-[10px] font-semibold text-gray-800 mb-1 leading-snug">
                  Do you feel this represents your view on neighbourhood parking?
                </label>
                
                {/* 1 - 5 Ranking Scale */}
                <div className="flex items-center justify-between gap-1 mb-0.5">
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
                        className={`flex-1 py-1 rounded text-[11px] font-bold transition-all cursor-pointer border active:scale-90 ${
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
                
                {/* Labels for 1 and 5 */}
                <div className="flex justify-between text-[8px] text-gray-500 font-medium px-0.5 mb-1">
                  <span>1 - Strongly Disagree</span>
                  <span>5 - Strongly Agree</span>
                </div>

                {/* Why or why not textarea */}
                <div>
                  <div className="flex items-center justify-between text-[9.5px] mb-0.5">
                    <label htmlFor="why-feedback-desktop" className="font-semibold text-gray-700">
                      Why or why not?
                    </label>
                    <span className={`text-[8.5px] font-medium ${500 - feedback.length < 50 ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
                      {500 - feedback.length} characters left
                    </span>
                  </div>
                  <textarea
                    id="why-feedback-desktop"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value.slice(0, 500))}
                    maxLength={500}
                    rows={1}
                    placeholder="Share your thoughts..."
                    className="w-full text-[10px] text-gray-800 p-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0081BC] focus:border-[#0081BC] resize-none bg-white leading-tight placeholder:text-gray-400 min-h-[30px] max-h-[46px]"
                  />

                  {/* Submit Button */}
                  <div className="mt-1 flex items-center justify-between">
                    {submitted ? (
                      <span className="text-[9.5px] font-semibold text-[#007a36] flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-[#009A44] flex-shrink-0" />
                        Response submitted. Thank you!
                      </span>
                    ) : (
                      <span className="text-[8.5px] text-gray-500 italic">
                        {rating ? `Rating: ${rating}/5` : 'Optional feedback'}
                      </span>
                    )}
                    <button
                      type="button"
                      id="submit-feedback-desktop"
                      onClick={() => {
                        triggerFeedback('submit');
                        setSubmitted(true);
                      }}
                      disabled={submitted}
                      className={`px-3 py-1 text-[10.5px] font-bold rounded-md transition-colors shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95 ${
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
            </div>
          </div>

          {/* 3. Policy Compass (5 cols) - Second Last of 2x2 grid */}
          <div className="md:col-span-5 flex flex-col">
            <div className="bg-white border border-gray-200 rounded-xl p-2.5 sm:p-3 shadow-xs flex flex-col justify-between h-full">
              {/* Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 mb-1 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#0081BC]" />
                  <h4 className="text-[10.5px] font-bold text-gray-800 uppercase tracking-wide">
                    Policy Compass
                  </h4>
                </div>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-50 text-[#004B8D] border border-blue-200 shadow-2xs">
                  X: {totalX > 0 ? `+${totalX}` : totalX} | Y: {totalY > 0 ? `+${totalY}` : totalY}
                </span>
              </div>

              {/* Quadrant Graph filling available container space with outside labels */}
              <div className="flex-grow flex items-center justify-center py-1">
                <PolicyCompassGraph persona={persona} totalX={totalX} totalY={totalY} />
              </div>
            </div>
          </div>

          {/* 4. Simulated Outcome (7 cols) */}
          <div className="md:col-span-7 flex flex-col">
            <div className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-xs text-xs flex flex-col justify-between h-full">
              <h4 className="font-bold text-gray-700 flex items-center gap-1 mb-1 text-[10px]">
                <Car className="w-3 h-3 text-[#0081BC]" />
                Simulated Outcome
              </h4>

              {/* Policy Compass Result Text */}
              <div className="bg-blue-50/80 border border-blue-100 rounded-md px-2 py-1 mb-1.5 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Compass className="w-3.5 h-3.5 text-[#0081BC] flex-shrink-0" />
                  <span className="font-bold text-[#005087] whitespace-nowrap">Policy Compass:</span>
                  <span className="text-gray-700 font-semibold truncate">
                    {persona.quadrant} • {persona.quadrant === 'Q1' ? 'Regulated' : persona.quadrant === 'Q2' ? 'Protective' : persona.quadrant === 'Q3' ? 'Free/Open' : 'Flat Rate'}
                  </span>
                </div>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-white text-[#004B8D] border border-blue-200 shadow-2xs flex-shrink-0 ml-1">
                  X: {totalX > 0 ? `+${totalX}` : totalX} | Y: {totalY > 0 ? `+${totalY}` : totalY}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="bg-gray-50 p-1.5 rounded border border-gray-200">
                  <span className="text-gray-500 block text-[9px]">Curbside Fee Model</span>
                  <span className="font-bold capitalize text-gray-800 truncate block text-[11px]">
                    {config.curbsideFeeModel}
                  </span>
                </div>
                <div className="bg-gray-50 p-1.5 rounded border border-gray-200">
                  <span className="text-gray-500 block text-[9px]">Enforcement Level</span>
                  <span className="font-bold capitalize text-gray-800 flex items-center gap-1 truncate text-[11px]">
                    <Shield className="w-2.5 h-2.5 text-[#009A44] flex-shrink-0" />
                    {config.enforcementLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. City of Edmonton Alignment (12 cols) - Very Last Container */}
          <div className="md:col-span-12 flex flex-col">
            <div className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-xs flex items-start gap-2.5 bg-blue-50/40">
              <div className="w-6 h-6 rounded-md bg-[#0081BC]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#0081BC]" />
              </div>
              <div className="leading-snug min-w-0">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#004B8D] mb-0.5">
                  City of Edmonton Alignment
                </h3>
                <p className="text-xs text-gray-700 leading-snug">
                  {persona.edmontonPolicyFit}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View (< md) - Sequential flow: 1. Your Parking Persona (with Beliefs & Feedback submit), 2. Policy Compass, 3. Simulated Outcome, 4. City of Edmonton Alignment */}
        <div className="flex md:hidden flex-col justify-start h-full gap-2 overflow-y-auto pr-0.5 py-1">
          {/* 1. Your Parking Persona Container */}
          <div
            id="your-parking-persona-container"
            className="bg-white border border-gray-200 rounded-xl p-2.5 sm:p-3 shadow-xs flex-shrink-0"
          >
            <div className="grid grid-cols-1 [@media(orientation:landscape)_and_(max-height:540px)]:grid-cols-2 gap-2">
              {/* Left Column in landscape, Top section in portrait */}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-white shadow-xs flex-shrink-0"
                      style={{ backgroundColor: persona.badgeColor }}
                    >
                      <Award className="w-3 h-3" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
                      {persona.title}
                    </h3>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-700 leading-snug mb-1.5">
                    {persona.description}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-1.5 [@media(orientation:landscape)_and_(max-height:540px)]:border-t-0 [@media(orientation:landscape)_and_(max-height:540px)]:pt-0">
                  <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    You Believe
                  </h4>
                  <ul className="space-y-1 text-[10px] sm:text-[10.5px] text-gray-800">
                    {persona.keyPriorities.map((priority, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-tight">
                        <CheckCircle className="w-3.5 h-3.5 text-[#009A44] flex-shrink-0 mt-0.5" />
                        <span>{priority}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column in landscape, Bottom section in portrait */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-2 flex flex-col justify-between">
                <div>
                  <label className="block text-[9.5px] sm:text-[10px] font-semibold text-gray-800 mb-1 leading-snug">
                    Do you feel this represents your view on neighbourhood parking?
                  </label>
                  
                  {/* 1 - 5 Ranking Scale */}
                  <div className="flex items-center justify-between gap-1 mb-0.5">
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
                          className={`flex-1 py-1 rounded text-[10.5px] sm:text-[11px] font-bold transition-all cursor-pointer border active:scale-90 ${
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
                  
                  {/* Labels for 1 and 5 */}
                  <div className="flex justify-between text-[7.5px] sm:text-[8px] text-gray-500 font-medium px-0.5 mb-1">
                    <span>1 - Strongly Disagree</span>
                    <span>5 - Strongly Agree</span>
                  </div>

                  {/* Why or why not textarea */}
                  <div className="flex items-center justify-between text-[9px] mb-0.5">
                    <label htmlFor="why-feedback-mobile" className="font-semibold text-gray-700">
                      Why or why not?
                    </label>
                    <span className={`text-[8px] font-medium ${500 - feedback.length < 50 ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
                      {500 - feedback.length} left
                    </span>
                  </div>
                  <textarea
                    id="why-feedback-mobile"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value.slice(0, 500))}
                    maxLength={500}
                    rows={1}
                    placeholder="Share your thoughts..."
                    className="w-full text-[10px] sm:text-[10.5px] text-gray-800 p-1 sm:p-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0081BC] focus:border-[#0081BC] resize-none bg-white leading-tight placeholder:text-gray-400 min-h-[30px]"
                  />
                </div>

                {/* Submit Button */}
                <div className="mt-1 flex items-center justify-between">
                  {submitted ? (
                    <span className="text-[9.5px] font-semibold text-[#007a36] flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-[#009A44]" />
                      Response submitted. Thank you!
                    </span>
                  ) : (
                    <span className="text-[8.5px] text-gray-500 italic">
                      {rating ? `Rating: ${rating}/5` : 'Optional feedback'}
                    </span>
                  )}
                  <button
                    type="button"
                    id="submit-feedback-mobile"
                    onClick={() => {
                      triggerFeedback('submit');
                      setSubmitted(true);
                    }}
                    disabled={submitted}
                    className={`px-3 py-1 text-[10px] sm:text-[10.5px] font-bold rounded transition-colors shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95 ${
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
          </div>

          {/* 3. Policy Compass */}
          <div className="bg-white border border-gray-200 rounded-xl p-2.5 sm:p-3 shadow-xs flex flex-col flex-shrink-0">
            {/* Header */}
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 mb-1">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#0081BC]" />
                <h4 className="text-[10.5px] font-bold text-gray-800 uppercase tracking-wide">
                  Policy Compass
                </h4>
              </div>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-50 text-[#004B8D] border border-blue-200 shadow-2xs">
                X: {totalX > 0 ? `+${totalX}` : totalX} | Y: {totalY > 0 ? `+${totalY}` : totalY}
              </span>
            </div>

            {/* Quadrant Graph */}
            <div className="w-full flex items-center justify-center py-1">
              <PolicyCompassGraph persona={persona} totalX={totalX} totalY={totalY} />
            </div>
          </div>

          {/* 4. Simulated Outcome */}
          <div className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-xs flex-shrink-0">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1">
              <Car className="w-3.5 h-3.5 text-[#0081BC]" />
              Simulated Outcome
            </h3>

            {/* Policy Compass Result Text */}
            <div className="bg-blue-50/80 border border-blue-100 rounded-lg px-2.5 py-1.5 mb-2 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <Compass className="w-3.5 h-3.5 text-[#0081BC] flex-shrink-0" />
                <span className="font-bold text-[#005087] whitespace-nowrap">Policy Compass:</span>
                <span className="text-gray-700 font-semibold truncate">
                  {persona.quadrant} • {persona.quadrant === 'Q1' ? 'Regulated' : persona.quadrant === 'Q2' ? 'Protective' : persona.quadrant === 'Q3' ? 'Free/Open' : 'Flat Rate'}
                </span>
              </div>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-white text-[#004B8D] border border-blue-200 shadow-2xs flex-shrink-0 ml-1">
                X: {totalX > 0 ? `+${totalX}` : totalX} | Y: {totalY > 0 ? `+${totalY}` : totalY}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                <span className="text-gray-500 block text-[9px]">Curbside Fee Model</span>
                <span className="font-bold capitalize text-gray-800 truncate block text-[11px]">
                  {config.curbsideFeeModel}
                </span>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                <span className="text-gray-500 block text-[9px]">Enforcement Level</span>
                <span className="font-bold capitalize text-gray-800 flex items-center gap-1 truncate text-[11px]">
                  <Shield className="w-3 h-3 text-[#009A44] flex-shrink-0" />
                  {config.enforcementLevel}
                </span>
              </div>
            </div>
          </div>

          {/* 5. City of Edmonton Alignment - Very Last Container */}
          <div className="bg-white border border-gray-200 rounded-xl p-2.5 sm:p-3 shadow-xs flex items-start gap-2.5 bg-blue-50/40 flex-shrink-0">
            <div className="w-6 h-6 rounded-md bg-[#0081BC]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#0081BC]" />
            </div>
            <div className="leading-snug min-w-0">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#004B8D] mb-0.5">
                City of Edmonton Alignment
              </h3>
              <p className="text-xs text-gray-700 leading-snug">
                {persona.edmontonPolicyFit}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
