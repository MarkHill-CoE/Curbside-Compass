import re

with open('src/components/ThankYouView.tsx', 'r') as f:
    content = f.read()

target = """  const shareText = shareMode === 'with_persona'
    ? `I took Edmonton's Curbside Compass public engagement tool and got "${persona.title}"! Where do you stand on neighbourhood parking? Find your persona:`
    : `Where do you stand on Edmonton's neighbourhood parking and curbside policies? Have your say and try the Curbside Compass public engagement tool:`;"""

replacement = """  const shareText = shareMode === 'with_persona'
    ? `I took Edmonton's Curbside Compass public engagement tool and got "${persona.title}"!\\n\\nMy Curbside Preferences:\\n• Fee Model: ${config.curbsideFeeModel.charAt(0).toUpperCase() + config.curbsideFeeModel.slice(1)}\\n• Enforcement: ${config.enforcementLevel}\\n\\nWhere do you stand on neighbourhood parking? Find your persona:`
    : `Where do you stand on Edmonton's neighbourhood parking and curbside policies? Have your say and try the Curbside Compass public engagement tool:`;"""

content = content.replace(target, replacement)

with open('src/components/ThankYouView.tsx', 'w') as f:
    f.write(content)
print("Updated successfully")
