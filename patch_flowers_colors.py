import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

# Replace flowerColors and edmontonPalette usage in flowerBeds initialization
old_flower_colors = """    const flowerColors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#f368e0', '#ff9f43', '#0abde3', '#e17055', '#fdcb6e'];"""
new_flower_colors = """    const flowerColors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#f368e0', '#ff9f43', '#0abde3', '#e17055', '#fdcb6e'];
    const compColors = ['#FF8C00', '#8A2BE2', '#FF1493', '#00FFFF', '#FFD700', '#ADFF2F']; // Complementary colors to the 6 house colors"""

content = content.replace(old_flower_colors, new_flower_colors)

# Replace the color assignment in flowerBeds push
# It looks like: color: flowerColors[Math.floor(Math.random() * flowerColors.length)]
# We want to replace it with: color: compColors[h]
content = re.sub(
    r"color: flowerColors\[Math\.floor\(Math\.random\(\) \* flowerColors\.length\)\]",
    r"color: compColors[h]",
    content
)

with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.write(content)
