import re

with open('src/components/SurveyStage.tsx', 'r') as f:
    content = f.read()

# Scale down text sizes slightly to ensure they fit vertically
content = content.replace('text-base [@media(orientation:landscape)_and_(max-height:540px)]:text-sm sm:text-lg md:text-xl', 'text-sm sm:text-base md:text-lg')
content = content.replace('text-sm sm:text-base md:text-lg font-semibold', 'text-xs sm:text-sm md:text-base font-semibold')
content = content.replace('px-3.5 py-1 sm:px-5 sm:py-2 rounded-md font-bold text-sm sm:text-base', 'px-3 py-1 sm:px-4 sm:py-1.5 rounded-md font-bold text-xs sm:text-sm')
content = content.replace('px-3 py-1 sm:px-4 sm:py-2 rounded-md font-semibold text-sm sm:text-base', 'px-3 py-1 sm:px-4 sm:py-1.5 rounded-md font-semibold text-xs sm:text-sm')

with open('src/components/SurveyStage.tsx', 'w') as f:
    f.write(content)

with open('src/components/ResultsView.tsx', 'r') as f:
    content = f.read()

# Scale down text sizes slightly
content = content.replace('text-base sm:text-lg md:text-xl font-black', 'text-sm sm:text-base md:text-lg font-black')
content = content.replace('text-base sm:text-lg md:text-xl font-medium', 'text-sm sm:text-base md:text-lg font-medium')
content = content.replace('text-xs sm:text-sm text-gray-800 w-full', 'text-[0.6875rem] sm:text-xs text-gray-800 w-full')
content = content.replace('text-xs sm:text-[0.8125rem] text-gray-600', 'text-[0.6875rem] sm:text-xs text-gray-600')

with open('src/components/ResultsView.tsx', 'w') as f:
    f.write(content)

print("Scaled down text sizes")
