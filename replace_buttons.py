import re

with open('src/components/ThankYouView.tsx', 'r') as f:
    content = f.read()

# Replace the onClick handler for Facebook
content = re.sub(
    r'onClick=\{\(\) => triggerFeedback\(\'button\'\)\}\s*id="share-facebook-button"',
    r"onClick={() => {\n                triggerFeedback('button');\n                handlePlatformClick('Facebook');\n              }}\n              id=\"share-facebook-button\"",
    content
)

# Replace the onClick handler for X
content = re.sub(
    r'onClick=\{\(\) => triggerFeedback\(\'button\'\)\}\s*id="share-x-button"',
    r"onClick={() => {\n                triggerFeedback('button');\n                handlePlatformClick('X');\n              }}\n              id=\"share-x-button\"",
    content
)

# Replace the onClick handler for Instagram
content = re.sub(
    r'onClick=\{\(\) => \{\s*triggerFeedback\(\'button\'\);\s*handleInstagramClick\(\);\s*\}\}',
    r"onClick={() => {\n                triggerFeedback('button');\n                handlePlatformClick('Instagram');\n              }}",
    content
)

# Replace the Toast section
toast_pattern = r'\{\/\*\s*Instagram Toast Notice\s*\*\/\}.*?\{\s*instagramNotice &&\s*\(\s*<div.*?</div>\s*\)\s*\}'
replacement_toast = """{/* Platform Toast Notice */}
          {platformNotice && (
            <div className={`mb-2 p-1.5 border rounded-lg text-[0.625rem] leading-snug flex items-start gap-1.5 ${
              platformNotice === 'Instagram' ? 'bg-purple-50 border-purple-200 text-purple-900' :
              platformNotice === 'Facebook' ? 'bg-blue-50 border-blue-200 text-blue-900' :
              'bg-gray-50 border-gray-200 text-gray-900'
            }`}>
              <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                platformNotice === 'Instagram' ? 'text-purple-700' :
                platformNotice === 'Facebook' ? 'text-blue-700' :
                'text-gray-700'
              }`} />
              <span>
                <strong>Share caption copied!</strong> Opening {platformNotice} so you can paste your post.
              </span>
            </div>
          )}"""

content = re.sub(toast_pattern, replacement_toast, content, flags=re.DOTALL)

with open('src/components/ThankYouView.tsx', 'w') as f:
    f.write(content)
print("Updated successfully")
