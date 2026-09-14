import re

with open('src/components/ResultsView.tsx', 'r') as f:
    content = f.read()

# Extract the feedback block
feedback_pattern = re.compile(
    r'(<div className="bg-\[#193A5A\]/5 border border-\[#004B8D\]/20 rounded-lg p-2\.5 flex flex-col">.*?</button>\s*</div>\s*</div>)',
    re.DOTALL
)
match = feedback_pattern.search(content)
if not match:
    print("Feedback block not found.")
else:
    feedback_block = match.group(1)
    
    # Remove feedback block from original location
    content = content.replace(feedback_block, '')
    
    # Wrap it to match styling if needed or keep its own container
    # Currently it was inside `<div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs flex flex-col justify-between">`
    # along with the City of Edmonton Alignment.
    
    # Let's extract the whole right column first to see how it looks.
