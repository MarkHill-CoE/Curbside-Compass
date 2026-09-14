import re

with open('src/components/ThankYouView.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { PersonaResult } from '../types';", "import { PersonaResult, SimulationConfig } from '../types';")

props_target = """interface ThankYouViewProps {
  persona: PersonaResult;
  onViewResults: () => void;
  onRetake?: () => void;
}"""
props_replacement = """interface ThankYouViewProps {
  persona: PersonaResult;
  config: SimulationConfig;
  onViewResults: () => void;
  onRetake?: () => void;
}"""
content = content.replace(props_target, props_replacement)

func_target = """export const ThankYouView: React.FC<ThankYouViewProps> = ({
  persona,
  onViewResults,
  onRetake
}) => {"""
func_replacement = """export const ThankYouView: React.FC<ThankYouViewProps> = ({
  persona,
  config,
  onViewResults,
  onRetake
}) => {"""
content = content.replace(func_target, func_replacement)

with open('src/components/ThankYouView.tsx', 'w') as f:
    f.write(content)
print("Updated successfully")
