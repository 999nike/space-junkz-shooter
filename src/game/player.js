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

  // ---- THRUSTER GLOW (Nova Style) ----
  const speed = Math.hypot(p.vx, p.vy);
  const thrusterSize = Math.min(40, 12 + speed * 0.05);

  ctx.save();
  ctx.rotate(baseAngle + Math.PI / 2);

  const grad = ctx.createRadialGradient(
    0, 30, 0,
    0, 30, thrusterSize
  );
  grad.addColorStop(0.0, "rgba(0, 255, 255, 0.9)");
  grad.addColorStop(0.4, "rgba(0, 180, 255, 0.5)");
  grad.addColorStop(1.0, "rgba(0, 80, 255, 0)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 30, thrusterSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ---- SHIP SPRITE (with glow) ----
  ctx.shadowColor = "rgba(120,200,255,0.45)";
  ctx.shadowBlur = 12;

  const scale = 0.06;
  const w = img.width * scale;
  const h = img.height * scale;

  ctx.drawImage(
    img,
    -w * 0.50,
    -h * 0.60,
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
