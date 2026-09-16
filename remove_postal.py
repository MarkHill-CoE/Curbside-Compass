import re

# Update ThankYouView.tsx
with open("src/components/ThankYouView.tsx", "r") as f:
    thank_you_content = f.read()

thank_you_content = re.sub(r"\s*postalCode\?: string;", "", thank_you_content)
thank_you_content = re.sub(r"\s*postalCode,", "", thank_you_content)
thank_you_content = re.sub(
    r"\{postalCode && \(\s*<span[^>]+>\s*Postal Code: \{postalCode\}\s*</span>\s*\)\}",
    "",
    thank_you_content
)

with open("src/components/ThankYouView.tsx", "w") as f:
    f.write(thank_you_content)

# Update ResultsView.tsx
with open("src/components/ResultsView.tsx", "r") as f:
    results_content = f.read()

results_content = re.sub(r"\s*postalCode\?: string;", "", results_content)
results_content = re.sub(r"\s*postalCode,", "", results_content)
results_content = re.sub(r"\s*postalCode=\{postalCode\}", "", results_content)

with open("src/components/ResultsView.tsx", "w") as f:
    f.write(results_content)

# Update App.tsx
with open("src/App.tsx", "r") as f:
    app_content = f.read()

app_content = re.sub(r"\s*postalCode=\{selectedAnswers\['q9'\]\}", "", app_content)

with open("src/App.tsx", "w") as f:
    f.write(app_content)

