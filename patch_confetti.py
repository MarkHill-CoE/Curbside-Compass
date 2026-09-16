with open("src/components/NeighborhoodSimulation.tsx", "r") as f:
    content = f.read()

marker = "let isRioting = false;"

if marker in content:
    new_content = content.replace(marker, """
    const confetti: Array<{x: number, y: number, vx: number, vy: number, color: string, size: number, angle: number, spin: number}> = [];
    const confettiColors = ['#009A44', '#004B8D', '#FFC72C', '#E8552D', '#FFFFFF', '#0081BC'];
    let isRioting = false;
""")
    with open("src/components/NeighborhoodSimulation.tsx", "w") as f:
        f.write(new_content)
