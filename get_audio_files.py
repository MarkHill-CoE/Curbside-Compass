import os
def get_files():
    for root, dirs, files in os.walk('/'):
        for file in files:
            if file.endswith('.mp3'):
                print(os.path.join(root, file))
get_files()
