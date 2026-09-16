import re

with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

# 1. Remove riot news report audio logic
content = re.sub(
    r"\s*// Trigger audio precisely when the police asset.*?window\.__riotAudioPending = true;\s*}\s*}",
    "",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"\s*// Stop and reset audio when riot ends completely.*?window\.__riotAudioPlayed = false;\s*}",
    "",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"\s*// Resume riot audio if it was blocked by autoplay policies.*?window\.__riotAudioPending = false;\s*}",
    "",
    content,
    flags=re.DOTALL
)

# 2. Add placards to protesters
old_protester_draw = """      } else if (pose === 'protester') {
        // Protester standing on the road blocking traffic (demonstrating / arms raised in demonstration without placards)
        drawBlock(x - 0.3, y + 0.2, z + 3.6, 0.7, 0.7, 2.0, shirtColor, adjustColor(shirtColor, -15), adjustColor(shirtColor, -30));
        drawBlock(x + 0.8, y + 0.2, z + 3.6, 0.7, 0.7, 2.0, shirtColor, adjustColor(shirtColor, -15), adjustColor(shirtColor, -30));
      }"""

new_protester_draw = """      } else if (pose === 'protester') {
        // Protester standing on the road blocking traffic (demonstrating / arms raised in demonstration without placards)
        drawBlock(x - 0.3, y + 0.2, z + 3.6, 0.7, 0.7, 2.0, shirtColor, adjustColor(shirtColor, -15), adjustColor(shirtColor, -30));
        drawBlock(x + 0.8, y + 0.2, z + 3.6, 0.7, 0.7, 2.0, shirtColor, adjustColor(shirtColor, -15), adjustColor(shirtColor, -30));
        
        // Stick
        drawBlock(x + 0.5, y + 0.2, z + 4.0, 0.4, 0.4, 6.0, '#8b5a2b', '#6b4226', '#4a2e1b');
        // Cardboard
        drawBlock(x - 1.5, y + 0.1, z + 8.5, 3.5, 0.5, 2.5, '#f4ece1', '#e8dfd3', '#dbd0c1');
        
        // Text on Placard (Isometric Projection)
        const textPos = project(x + 0.25, y + 0.35, z + 9.75);
        ctx!.save();
        ctx!.font = 'bold ' + (1.2 * scale) + 'px sans-serif';
        ctx!.fillStyle = '#9e0000';
        ctx!.textAlign = 'center';
        ctx!.textBaseline = 'middle';
        
        const signText = Math.abs(Math.floor(x * 10)) % 2 === 0 ? 'MORE PARKING' : 'HOMES FOR CARS';
        if (signText === 'MORE PARKING') {
            ctx!.fillText('MORE', textPos.x, textPos.y - 1.5 * scale);
            ctx!.fillText('PARKING', textPos.x, textPos.y + 0.5 * scale);
        } else {
            ctx!.fillText('HOMES', textPos.x, textPos.y - 1.5 * scale);
            ctx!.fillText('FOR CARS', textPos.x, textPos.y + 0.5 * scale);
        }
        ctx!.restore();
      }"""

content = content.replace(old_protester_draw, new_protester_draw)

with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
    f.write(content)

