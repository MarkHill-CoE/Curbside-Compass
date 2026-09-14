import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Abstract the landscape media query
landscape_mq = '[@media(orientation:landscape)_and_(max-height:540px)]'

# Replace in simulation section
sim_target = r'\{`\$\{\n\s*isCompleted\n\s*\?\s*\'hidden md:block\'\n\s*:\s*\'w-full h-\[50vh\] min-h-\[250px\] sm:h-\[50vh\]\'\n\s*\} md:h-full md:max-h-none md:w-\[48%\] lg:w-\[50%\] xl:w-\[52%\] relative bg-\[#193A5A\] border-b-2 md:border-b-0 md:border-r-2 \[@media\(orientation:landscape\)_and_\(max-height:540px\)\]:h-full \[@media\(orientation:landscape\)_and_\(max-height:540px\)\]:w-1/2 \[@media\(orientation:landscape\)_and_\(max-height:540px\)\]:border-b-0 \[@media\(orientation:landscape\)_and_\(max-height:540px\)\]:border-r-2 border-\[#004B8D\] flex-shrink-0 shadow-inner overflow-hidden`\}'
sim_replacement = r'{`relative bg-[#193A5A] flex-shrink-0 shadow-inner overflow-hidden border-[#004B8D] border-b-2 md:border-b-0 md:border-r-2 ${isCompleted ? "hidden md:block" : "w-full h-[50vh] min-h-[250px] sm:h-[50vh]"} md:h-full md:max-h-none md:w-[48%] lg:w-[50%] xl:w-[52%] ' + landscape_mq + ':h-full ' + landscape_mq + ':w-1/2 ' + landscape_mq + ':border-b-0 ' + landscape_mq + ':border-r-2`}'

content = re.sub(sim_target, sim_replacement, content)

# Replace in survey section
survey_target = r'\{`w-full flex-1 \$\{\n\s*isCompleted\n\s*\?\s*\'w-full md:w-\[52%\] lg:w-\[50%\] xl:w-\[48%\]\'\n\s*:\s*\'md:w-\[52%\] lg:w-\[50%\] xl:w-\[48%\] \[@media\(orientation:landscape\)_and_\(max-height:540px\)\]:w-1/2\'\n\s*\} md:h-full \[@media\(orientation:landscape\)_and_\(max-height:540px\)\]:h-full bg-\[#ffffff\] flex flex-col justify-between overflow-y-auto overflow-x-hidden min-h-0`\}'
survey_replacement = r'{`w-full flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden min-h-0 bg-[#ffffff] md:h-full ' + landscape_mq + ':h-full ${isCompleted ? "w-full md:w-[52%] lg:w-[50%] xl:w-[48%]" : "md:w-[52%] lg:w-[50%] xl:w-[48%] ' + landscape_mq + ':w-1/2"}`}'

content = re.sub(survey_target, survey_replacement, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Updated App.tsx")
