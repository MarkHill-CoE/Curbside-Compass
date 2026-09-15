import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

state_target = """  const [fontSizePt, setFontSizePt] = useState<number>(12); // Default 12pt (16px)"""
state_replacement = """  const [hasManuallyChangedFont, setHasManuallyChangedFont] = useState(false);
  const [fontSizePt, setFontSizePt] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const isTabletPortrait = window.matchMedia('(min-width: 768px) and (max-width: 1023px) and (orientation: portrait)').matches;
      return isTabletPortrait ? 14 : 12;
    }
    return 12;
  }); // Default 12pt, or 14pt on tablet portrait

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(min-width: 768px) and (max-width: 1023px) and (orientation: portrait)');
    const handler = (e: MediaQueryListEvent) => {
      if (!hasManuallyChangedFont) {
        setFontSizePt(e.matches ? 14 : 12);
      }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [hasManuallyChangedFont]);"""

content = content.replace(state_target, state_replacement)

# Fix onClick handlers for A- and A+
decrease_target = """onClick={() => setFontSizePt(f => Math.max(8, f - 2))}"""
decrease_replacement = """onClick={() => { setHasManuallyChangedFont(true); setFontSizePt(f => Math.max(8, f - 2)); }}"""
content = content.replace(decrease_target, decrease_replacement)

increase_target = """onClick={() => setFontSizePt(f => Math.min(24, f + 2))}"""
increase_replacement = """onClick={() => { setHasManuallyChangedFont(true); setFontSizePt(f => Math.min(24, f + 2)); }}"""
content = content.replace(increase_target, increase_replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Applied font size patch")
