window.drawPlayer = function drawPlayer(ctx) {
  const S = window.GameState;
  const p = S.player;

  if (!S.shipImage) return;

  const img = S.shipImage;

  // tilt banking angle (left = -15°, right = +15°)
  const bankAngle = p.bank * 0.35;

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(bankAngle);

  const scale = 0.22; // adjust size
  const w = img.width * scale;
  const h = img.height * scale;

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
