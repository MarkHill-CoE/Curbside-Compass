import re

with open('src/components/ResultsView.tsx', 'r') as f:
    content = f.read()

# Remove unused lucide-react imports Car and UserCircle
content = content.replace("Award, MapPin, CheckCircle, Car, Shield, UserCircle, ChevronRight, Compass", "Award, MapPin, CheckCircle, Shield, ChevronRight, Compass")

with open('src/components/ResultsView.tsx', 'w') as f:
    f.write(content)
print("ResultsView imports cleaned")
