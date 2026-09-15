import re

with open('src/components/SurveyStage.tsx', 'r') as f:
    content = f.read()

# Replace question font size
q_font_target = """<h3 className="text-sm sm:text-base md:text-xl lg:text-lg font-bold text-[#004B8D] mb-1.5 sm:mb-2 md:mb-3 lg:mb-1.5 leading-snug">"""
q_font_replacement = """<h3 className="text-sm sm:text-base md:text-[16pt] lg:text-lg font-bold text-[#004B8D] mb-1.5 sm:mb-2 md:mb-3 lg:mb-1.5 leading-snug">"""
content = content.replace(q_font_target, q_font_replacement)

# Replace answer font size
a_font_target = """className={`text-xs sm:text-sm md:text-lg lg:text-base font-semibold leading-tight ${"""
a_font_replacement = """className={`text-xs sm:text-sm md:text-[16pt] lg:text-base font-semibold leading-tight ${"""
content = content.replace(a_font_target, a_font_replacement)

with open('src/components/SurveyStage.tsx', 'w') as f:
    f.write(content)

print("Applied 16pt font patch")
