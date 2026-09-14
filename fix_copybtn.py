import re

with open('src/components/ThankYouView.tsx', 'r') as f:
    content = f.read()

# Replace the Direct Copy Link Button area
target_bottom = """          {/* Direct Copy Link Button */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
            <span className="text-[0.625rem] text-gray-500 font-medium truncate max-w-[200px] sm:max-w-[280px]">
              {shareUrl}
            </span>
            <button
              type="button"
              id="copy-share-link-button"
              onClick={() => {
                triggerFeedback('button');
                handleCopyLink();
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[0.65625rem] font-bold transition-all cursor-pointer flex-shrink-0 active:scale-95 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-600" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>"""

replacement_bottom = """          {/* Direct Copy Full Text Button */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              id="copy-share-text-button"
              onClick={() => {
                triggerFeedback('button');
                handleCopyLink();
              }}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[0.75rem] font-bold transition-all cursor-pointer active:scale-95 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-600" />
                  <span>Copy Full Post Text to Clipboard</span>
                </>
              )}
            </button>
            <p className="text-center text-[0.5625rem] text-gray-500 mt-1.5">
              Copies your Persona result and the survey link to paste anywhere.
            </p>
          </div>"""

content = content.replace(target_bottom, replacement_bottom)

with open('src/components/ThankYouView.tsx', 'w') as f:
    f.write(content)
print("Updated successfully")
