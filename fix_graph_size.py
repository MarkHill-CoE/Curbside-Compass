import re

with open('src/components/PolicyCompassGraph.tsx', 'r') as f:
    content = f.read()

# Make the outer container expand
content = content.replace('<div className={`flex flex-col items-center justify-center w-full select-none ${className}`}>', '<div className={`flex flex-col items-center justify-center w-full h-full select-none ${className}`}>')

# Make the middle row expand
content = content.replace('<div className="flex items-center justify-center w-full gap-1 sm:gap-2">', '<div className="flex items-center justify-center w-full gap-1 sm:gap-2 flex-grow min-h-0">')

# Make the center plane responsive
old_plane = 'className="relative w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] md:w-[210px] md:h-[210px] bg-slate-50 border-2 border-gray-300 rounded-xl overflow-hidden shadow-inner flex-shrink-0"'
new_plane = 'className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[380px] max-h-[40vh] aspect-square bg-slate-50 border-2 border-gray-300 rounded-xl overflow-hidden shadow-inner flex-shrink-0"'
content = content.replace(old_plane, new_plane)

with open('src/components/PolicyCompassGraph.tsx', 'w') as f:
    f.write(content)
print("Graph updated")
