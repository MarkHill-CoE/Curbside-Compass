with open("src/data/surveyData.ts", "r") as f:
    content = f.read()

old_func = """export function validatePostalCode(val: string): { isValid: boolean; message?: string } {
  if (!val || !val.trim()) {"""

new_func = """export function validatePostalCode(val: string): { isValid: boolean; message?: string } {
  if (val === 'OPT_OUT') return { isValid: true };
  if (!val || !val.trim()) {"""

content = content.replace(old_func, new_func)

with open("src/data/surveyData.ts", "w") as f:
    f.write(content)
