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
