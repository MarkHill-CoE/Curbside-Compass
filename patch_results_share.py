import re

with open("src/components/ResultsView.tsx", "r") as f:
    content = f.read()

# 1. Update lucide-react imports to include Share2
content = content.replace("import { Award, MapPin, CheckCircle, Shield, ChevronRight, Compass } from 'lucide-react';", "import { Award, MapPin, CheckCircle, Shield, ChevronRight, Compass, Share2 } from 'lucide-react';")

# 2. Add handleShare method and the button to Step 1
# Locate the 'if (step === 1) {' block and insert a share button next to the persona info.

new_step1 = """  // Step 1: Persona Identity
  if (step === 1) {
    const handleShare = async () => {
      triggerFeedback('button');
      const shareData = {
        title: 'Curbside Compass',
        text: `I got the ${persona.title} persona! Help shape Edmonton's parking future.`,
        url: window.location.href,
      };
      
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          console.error('Error sharing:', err);
        }
      } else {
        try {
          await navigator.clipboard.writeText(shareData.url);
          alert('Link copied to clipboard!');
        } catch (err) {
          console.error('Failed to copy text:', err);
        }
      }
    };

    return (
      <div className="w-full max-w-4xl mx-auto h-full flex flex-col justify-between p-2 sm:p-4 overflow-y-auto">
        {/* Header with Share Button */}
        <div className="flex justify-end mb-1 sm:mb-2">
           <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-50 text-[#004B8D] border border-blue-200 hover:bg-[#004B8D] hover:text-white transition-colors rounded-lg font-bold text-xs sm:text-sm active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Share</span>
          </button>
        </div>
        <div className="flex-grow flex flex-col gap-2 sm:gap-2.5 min-h-0">"""

content = content.replace("""  // Step 1: Persona Identity
  if (step === 1) {
    return (
      <div className="w-full max-w-4xl mx-auto h-full flex flex-col justify-between p-2 sm:p-4 overflow-y-auto">
        <div className="flex-grow flex flex-col gap-2 sm:gap-2.5 min-h-0">""", new_step1)


with open("src/components/ResultsView.tsx", "w") as f:
    f.write(content)
