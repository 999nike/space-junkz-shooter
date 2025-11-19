

---

🛸 Space Junkz Shooter — README (Short Version)

Overview

Space Junkz Shooter is a fast-paced neon arcade shooter built for mobile + desktop.
You pilot a glowing plasma UFO through an endless field of geometric enemies, dodging and blasting your way to the highest score.

The game runs entirely in the browser using HTML5 Canvas + vanilla JS.
No frameworks, no bloat — just raw arcade energy.


---

Features

🛸 New Plasma UFO Player Ship
Smooth rotation, no jitter, clean 360° shooting.

🎯 Mouse-Aim + Movement
Move the ship by guiding the cursor. Optional “anchor mode” coming soon.

💥 Auto-Shoot System
Rapid laser fire, directional aiming, smart cooldown.

👾 Enemy System
Multiple enemy shapes, colors, speeds, and spawn patterns.

🌌 Neon Galaxy Visuals
Parallax stars, glowing grid, plasma effects.

📱 Responsive Layout
Scales to any screen, including full landscape mode.



---

Current Structure

/public
    AlphaFighter.png     ← player sprite (UFO)
/src
    game.js              ← main logic
    engine.js            ← loop + update
    player.js            ← player state
    renderer.js          ← drawing
    enemies.js           ← spawns + patterns
    input.js             ← key + mouse controls
    assets.js            ← image loading
    game.css             ← styles
game.html                ← main page
README.md


---

How to Update the Player Ship

Replace:

public/AlphaFighter.png

with your new UFO image
(same name, same path)
then deploy.


---

How to Run Locally

open game.html

or via small web server:

npx serve .


---

Deployment

Push to GitHub → Vercel auto-deploy
(Manual uploads limited on free tier)


---




