// ----------- PLAYER RENDERING -----------

window.drawPlayer = function drawPlayer(ctx) {
  const S = window.GameState;
  const p = S.player;

  // If no sprite loaded, stop
  if (!S.shipImage) return;

  const img = S.shipImage;

  ctx.save();

  // Move to player position
  ctx.translate(p.x, p.y);

  // Banking rotation (left/right tilt)
  ctx.rotate(p.bank * 0.35); // roughly ±20°

  // Glow FX to hide cut edges
  ctx.shadowColor = "rgba(120,200,255,0.55)";
  ctx.shadowBlur = 22;

  // Scale sprite
  const scale = 0.22; // adjust this if you want bigger/smaller
  const w = img.width * scale;
  const h = img.height * scale;

  // Draw centered
  ctx.drawImage(img, -w / 2, -h / 2, w, h);

  ctx.restore();

  // Invulnerability ring
  if (p.invuln > 0) {
    ctx.strokeStyle = "#fffd8b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius + 6, 0, Math.PI * 2);
    ctx.stroke();
  }
};
