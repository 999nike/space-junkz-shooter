// ----------- PLAYER RENDERING (PATCHED CLEAN VERSION) -----------

window.drawPlayer = function drawPlayer(ctx) {
  const S = window.GameState;
  const p = S.player;

  // If no sprite loaded, stop
  if (!S.shipImage) return;

  const img = S.shipImage;

  ctx.save();

  // Move to player position
  ctx.translate(p.x, p.y);

  // 🔥 reduced banking tilt (cleaner, less wild)
  ctx.rotate(p.bank * 0.15);

  // 🔥 cleaner glow for 4K
  ctx.shadowColor = "rgba(120,200,255,0.35)";
  ctx.shadowBlur = 10;

  // ⭐ PERFECT scale for your current setup
  const scale = 0.06;
  const w = img.width * scale;
  const h = img.height * scale;

  // ⭐ centered nicely + lifted slightly to fix "zoom" feeling
  ctx.drawImage(
    img,
    -w * 0.50,  // centered horizontally
    -h * 0.60,  // lifted to compensate for jet nose length
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
