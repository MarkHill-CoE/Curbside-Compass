import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace main container
content = content.replace(
    """<main className="flex flex-col md:flex-row [@media(orientation:landscape)_and_(max-height:540px)]:flex-row flex-grow h-[calc(100dvh-40px)] sm:h-[calc(100dvh-44px)] overflow-hidden">""",
    """<main className="flex flex-col lg:flex-row [@media(orientation:landscape)_and_(max-height:540px)]:flex-row flex-grow h-[calc(100dvh-40px)] sm:h-[calc(100dvh-44px)] overflow-hidden">"""
)

# Replace simulation-section
content = content.replace(
    """className={`relative bg-[#193A5A] flex-shrink-0 shadow-inner overflow-hidden border-[#004B8D] border-b-2 md:border-b-0 md:border-r-2 ${isCompleted ? "hidden md:block" : "w-full h-[50vh] min-h-[250px] sm:h-[50vh]"} md:h-full md:max-h-none md:w-[48%] lg:w-[50%] xl:w-[52%] [@media(orientation:landscape)_and_(max-height:540px)]:h-full [@media(orientation:landscape)_and_(max-height:540px)]:w-1/2 [@media(orientation:landscape)_and_(max-height:540px)]:border-b-0 [@media(orientation:landscape)_and_(max-height:540px)]:border-r-2`}""",
    """className={`relative bg-[#193A5A] flex-shrink-0 shadow-inner overflow-hidden border-[#004B8D] border-b-2 lg:border-b-0 lg:border-r-2 ${isCompleted ? "hidden lg:block" : "w-full h-[50vh] min-h-[250px] sm:h-[50vh]"} lg:h-full lg:max-h-none lg:w-[48%] xl:w-[50%] 2xl:w-[52%] [@media(orientation:landscape)_and_(max-height:540px)]:h-full [@media(orientation:landscape)_and_(max-height:540px)]:w-1/2 [@media(orientation:landscape)_and_(max-height:540px)]:border-b-0 [@media(orientation:landscape)_and_(max-height:540px)]:border-r-2`}"""
)

# Replace survey-section
content = content.replace(
    """className={`w-full flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden min-h-0 bg-[#ffffff] md:h-full [@media(orientation:landscape)_and_(max-height:540px)]:h-full ${isCompleted ? "w-full md:w-[52%] lg:w-[50%] xl:w-[48%]" : "md:w-[52%] lg:w-[50%] xl:w-[48%] [@media(orientation:landscape)_and_(max-height:540px)]:w-1/2"}`}""",
    """className={`w-full flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden min-h-0 bg-[#ffffff] lg:h-full [@media(orientation:landscape)_and_(max-height:540px)]:h-full ${isCompleted ? "w-full lg:w-[52%] xl:w-[50%] 2xl:w-[48%]" : "lg:w-[52%] xl:w-[50%] 2xl:w-[48%] [@media(orientation:landscape)_and_(max-height:540px)]:w-1/2"}`}"""
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Applied layout patch")
