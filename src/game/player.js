// ----------- PLAYER RENDERING (ANGLE + BANK) -----------

window.drawPlayer = function drawPlayer(ctx) {
  const S = window.GameState;
  const p = S.player;

  // If no sprite loaded, stop
  if (!S.shipImage) return;

  const img = S.shipImage;

  ctx.save();

  // Move to player position
  ctx.translate(p.x, p.y);

  // Base facing angle (defaults to "up")
  const baseAngle = typeof p.angle === "number" ? p.angle : -Math.PI / 2;

  // Rotate so sprite nose points in the movement direction
  //   - Image is drawn pointing up by default (−90° in our angle system)
  //   - We add bank as a small roll for nice lean
  ctx.rotate(baseAngle + Math.PI / 2 + p.bank * 0.10);
  
// ---- THRUSTER EMBER PARTICLES ----
{
  const boost = (S.keys?.["w"] || S.keys?.["arrowup"]) ? 3 : 1;

  for (let i = 0; i < boost; i++) {
    S.thrustParticles.push({
      x: p.x + (Math.random() - 0.5) * 6,
      y: p.y + 40,
      vx: (Math.random() - 0.5) * 30,
      vy: 120 + Math.random() * 80,
      life: 0.35 + Math.random() * 0.15,
      size: 1.5 + Math.random() * 2.0
    });
  }
}

// ----- THRUSTER FLAME V2 (big hot core) -----
{
  const flameOffset = 42;      // further behind ship for your scale
  const jitter = (Math.random() - 0.5) * 6;

  ctx.save();
  ctx.translate(0, flameOffset + jitter);

  // flame length scales when moving forward
  const isBoost = (S.keys?.["w"] || S.keys?.["arrowup"]);
  const flameLen = isBoost ? 110 : 70;
  const flameWidth = isBoost ? 28 : 20;

  // white-hot to orange gradient
  const g = ctx.createLinearGradient(0, 0, 0, flameLen);
  g.addColorStop(0.0, "rgba(255,255,220,1)");
  g.addColorStop(0.2, "rgba(255,200,90,1)");
  g.addColorStop(0.6, "rgba(255,120,40,0.8)");
  g.addColorStop(1.0, "rgba(255,80,20,0)");

  ctx.fillStyle = g;

  // cone shape
  ctx.beginPath();
  ctx.moveTo(-flameWidth, 0);
  ctx.lineTo(flameWidth, 0);
  ctx.lineTo(0, flameLen);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
// ----- END THRUSTER -----

  // Glow FX to hide cut edges / look nice in 4K
  ctx.shadowColor = "rgba(120,200,255,0.35)";
  ctx.shadowBlur = 10;

  // Scale sprite
  const scale = 0.06; // tweak if you want bigger/smaller
  const w = img.width * scale;
  const h = img.height * scale;

  // Centered nicely + slightly lifted to compensate for long nose
  ctx.drawImage(
    img,
    -w * 0.50,  // centered horizontally
    -h * 0.60,  // lifted a bit
    w,
    h
  );

  ctx.restore();

  // Invulnerability ring (unchanged)
  if (p.invuln > 0) {
    ctx.strokeStyle = "#fffd8b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius + 6, 0, Math.PI * 2);
    ctx.stroke();
  }
};
