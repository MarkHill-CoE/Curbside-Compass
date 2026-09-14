with open('src/components/ThankYouView.tsx', 'r') as f:
    content = f.read()

content = content.replace('id=\\"share-facebook-button\\"', 'id="share-facebook-button"')
content = content.replace('id=\\"share-x-button\\"', 'id="share-x-button"')

with open('src/components/ThankYouView.tsx', 'w') as f:
    f.write(content)
