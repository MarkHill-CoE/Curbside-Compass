import re

with open('src/components/ResultsView.tsx', 'r') as f:
    content = f.read()

# Make graph container 50vh
content = content.replace(
    '<div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">',
    '<div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs h-[45vh] sm:h-[50vh] flex flex-col items-center justify-center">'
)

# Increase font size for persona description
content = content.replace(
    '<p className="text-sm sm:text-base text-gray-700 leading-relaxed">',
    '<p className="text-base sm:text-lg md:text-xl font-medium text-gray-800 leading-snug">'
)

# Also let's adjust the Next Button Footer spacing so it doesn't push down too much
content = content.replace(
    '<div className="mt-4 flex justify-start">',
    '<div className="mt-2 flex justify-start">'
)

# Make gap tighter to avoid fold
content = content.replace(
    '<div className="flex-grow flex flex-col gap-4">',
    '<div className="flex-grow flex flex-col gap-2">'
)

# Adjust padding for the persona info card
content = content.replace(
    '<div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs">',
    '<div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-xs flex-1 flex flex-col justify-center">'
)
content = content.replace(
    '<div className="flex items-center gap-3 mb-3">',
    '<div className="flex items-center gap-2 mb-2">'
)

with open('src/components/ResultsView.tsx', 'w') as f:
    f.write(content)
print("Updated successfully")
