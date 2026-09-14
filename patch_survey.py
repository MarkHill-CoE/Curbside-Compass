import re

with open('src/components/SurveyStage.tsx', 'r') as f:
    content = f.read()

content = content.replace('p-2 sm:p-3 md:p-4', 'p-1.5 sm:p-2 md:p-3')
content = content.replace('mb-1 sm:mb-1.5', 'mb-0.5 sm:mb-1')
content = content.replace('pt-1 pb-1 sm:pt-1.5', 'pt-0.5 pb-0.5 sm:pt-1')
content = content.replace('mb-1.5 sm:mb-2', 'mb-1 sm:mb-1.5')

# gap-1.5 sm:gap-2 -> gap-1 sm:gap-1.5
content = content.replace('gap-1.5 sm:gap-2', 'gap-1 sm:gap-1.5')

# option button padding: p-1.5 sm:p-2 md:p-2.5 -> p-1 sm:p-1.5 md:p-2
content = content.replace('p-1.5 sm:p-2 md:p-2.5', 'p-1 sm:p-1.5 md:p-2')

# button min-h-[44px] -> min-h-[36px]
content = content.replace('min-h-[44px]', 'min-h-[36px]')

with open('src/components/SurveyStage.tsx', 'w') as f:
    f.write(content)
print("Patched SurveyStage.tsx")
