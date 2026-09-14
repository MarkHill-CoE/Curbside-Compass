import re

with open('src/components/ResultsView.tsx', 'r') as f:
    content = f.read()

# Make gap-3 to gap-1.5 sm:gap-2
content = content.replace('gap-3 p-2 sm:p-3 md:p-4', 'gap-1.5 sm:gap-2 p-1.5 sm:p-2.5 md:p-3')

# p-3 sm:p-4 to p-2 sm:p-2.5
content = content.replace('p-3 sm:p-4', 'p-2 sm:p-2.5')

# gap-3 (grid gap) to gap-1.5 sm:gap-2
content = content.replace('grid-cols-3 gap-3', 'grid-cols-3 gap-1.5 sm:gap-2')
content = content.replace('grid-cols-2 gap-3', 'grid-cols-2 gap-1.5 sm:gap-2')

# px-3 py-3 to px-2 py-2
content = content.replace('px-3 py-3', 'px-2 py-2')
content = content.replace('p-3 rounded-lg', 'p-2 rounded-lg')

# mb-3 to mb-1.5 sm:mb-2
content = content.replace('mb-3', 'mb-1.5 sm:mb-2')

# mb-2.5 to mb-1.5
content = content.replace('mb-2.5', 'mb-1.5')

# rows={2} to rows={1}
content = content.replace('rows={2}', 'rows={1}')

# textarea min-h-[40px] to just default or smaller
content = content.replace('min-h-[40px]', 'min-h-[32px]')

# min-h-[44px] to min-h-[36px] for buttons inside feedback
content = content.replace('min-h-[44px]', 'min-h-[36px]')

with open('src/components/ResultsView.tsx', 'w') as f:
    f.write(content)
print("Patched ResultsView.tsx")
