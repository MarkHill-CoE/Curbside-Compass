import re

with open('src/components/ResultsView.tsx', 'r') as f:
    content = f.read()

target = """        {/* Next Button Footer - Lower Left */}
        <div className="mt-2 flex justify-start">"""

replacement = """        {/* Next Button Footer - Lower Right */}
        <div className="mt-2 flex justify-end">"""

content = content.replace(target, replacement)

with open('src/components/ResultsView.tsx', 'w') as f:
    f.write(content)
print("Updated successfully")
