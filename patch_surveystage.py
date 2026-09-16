import re

with open("src/components/SurveyStage.tsx", "r") as f:
    content = f.read()

old_block = """                {/* Real-time validation indicator */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {(() => {
                    const alphaNumCount = (currentAnswer || '').replace(/[^A-Z0-9]/gi, '').length;
                    if (alphaNumCount === 0) {"""

new_block = """                {/* Real-time validation indicator */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {(() => {
                    if (currentAnswer === 'OPT_OUT') {
                      return null;
                    }
                    const alphaNumCount = (currentAnswer || '').replace(/[^A-Z0-9]/gi, '').length;
                    if (alphaNumCount === 0) {"""
content = content.replace(old_block, new_block)


old_input = """                  <input
                    type="text"
                    id="postal-code-input"
                    autoFocus
                    autoComplete="postal-code"
                    maxLength={8}
                    placeholder={currentQuestion.placeholder || "e.g. T5J 2R7"}
                    value={currentAnswer || ''}"""

new_input = """                  <input
                    type="text"
                    id="postal-code-input"
                    autoFocus
                    disabled={currentAnswer === 'OPT_OUT'}
                    autoComplete="postal-code"
                    maxLength={8}
                    placeholder={currentQuestion.placeholder || "e.g. T5J 2R7"}
                    value={currentAnswer === 'OPT_OUT' ? '' : (currentAnswer || '')}"""

content = content.replace(old_input, new_input)


old_tip = """                <div className="bg-[#193A5A]/5 border border-[#004B8D]/15 rounded-lg p-2.5 sm:p-3 text-xs text-gray-700 leading-relaxed max-w-lg mt-1">
                  <span className="font-bold text-[#004B8D] block mb-0.5">Edmonton Tip:</span>
                  Edmonton postal codes begin with <span className="font-mono font-semibold">T5</span> or <span className="font-mono font-semibold">T6</span> (for example, <span className="font-mono font-semibold">T5J 2R7</span> for Downtown, <span className="font-mono font-semibold">T6G 2R3</span> for Garneau/University, or <span className="font-mono font-semibold">T5K 1X4</span> for Oliver/Wîhkwêntôwin).
                </div>"""

new_tip = """                <div className="bg-[#193A5A]/5 border border-[#004B8D]/15 rounded-lg p-2.5 sm:p-3 text-xs text-gray-700 leading-relaxed max-w-lg mt-1">
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
                </label>"""
                
content = content.replace(old_tip, new_tip)

with open("src/components/SurveyStage.tsx", "w") as f:
    f.write(content)
