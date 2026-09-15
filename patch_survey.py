import re

with open('src/components/SurveyStage.tsx', 'r') as f:
    content = f.read()

# Update grid classes
grid_target = """  // Dynamic grid configuration based on option count
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
  }"""

grid_replacement = """  // Dynamic grid configuration based on option count
  // In tablet vertical (md to lg), we stack vertically to use the wider space for larger text
  const optionCount = currentQuestion.options.length;
  let gridClasses = 'grid grid-cols-1 gap-1.5 sm:gap-2 md:gap-3 lg:gap-2 w-full';
  if (optionCount === 2) {
    gridClasses =
      'grid grid-cols-1 lg:grid-cols-2 gap-1.5 sm:gap-2 md:gap-3 lg:gap-2 w-full';
  } else if (optionCount === 4) {
    gridClasses =
      'grid grid-cols-1 lg:grid-cols-2 gap-1.5 sm:gap-2 md:gap-3 lg:gap-2 w-full';
  } else if (optionCount === 3) {
    gridClasses =
      'grid grid-cols-1 xl:grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 lg:gap-2 w-full';
  }"""

content = content.replace(grid_target, grid_replacement)

# Update question font size
q_font_target = """<h3 className="text-sm sm:text-base md:text-lg font-bold text-[#004B8D] mb-1 sm:mb-1.5 leading-snug">"""
q_font_replacement = """<h3 className="text-sm sm:text-base md:text-xl lg:text-lg font-bold text-[#004B8D] mb-1.5 sm:mb-2 md:mb-3 lg:mb-1.5 leading-snug">"""
content = content.replace(q_font_target, q_font_replacement)

# Update answer font size
a_font_target = """className={`text-xs sm:text-sm md:text-base font-semibold leading-tight ${"""
a_font_replacement = """className={`text-xs sm:text-sm md:text-lg lg:text-base font-semibold leading-tight ${"""
content = content.replace(a_font_target, a_font_replacement)

# Update answer button padding
btn_target = """className={`w-full text-left p-1 sm:p-1.5 md:p-2 rounded-lg border-2 transition-all flex items-start gap-1 sm:gap-1.5 cursor-pointer relative min-h-[36px] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B8D] focus-visible:ring-offset-2 ${"""
btn_replacement = """className={`w-full text-left p-1.5 sm:p-2 md:p-4 lg:p-2 rounded-lg border-2 transition-all flex items-start gap-1.5 sm:gap-2 md:gap-3 lg:gap-2 cursor-pointer relative min-h-[36px] md:min-h-[48px] lg:min-h-[36px] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B8D] focus-visible:ring-offset-2 ${"""
content = content.replace(btn_target, btn_replacement)

with open('src/components/SurveyStage.tsx', 'w') as f:
    f.write(content)

print("Applied survey patch")
