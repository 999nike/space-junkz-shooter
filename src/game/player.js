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
  ctx.rotate(baseAngle + Math.PI / 2 + p.bank * 0.10);

  // ============================================================
//   THRUSTER EMBER PARTICLES (MAIN + SIDE JETS)
// ============================================================
{
  const boost = (S.keys?.["w"] || S.keys?.["arrowup"]) ? 3 : 1;

  // ===== MAIN ENGINE PARTICLES =====
  for (let i = 0; i < boost; i++) {
    S.thrustParticles.push({
      x: p.x + (Math.random() - 0.5) * 12,
      y: p.y + 46 + (Math.random() * 4),
      vx: (Math.random() - 0.5) * 55,
      vy: 140 + Math.random() * 120,
      life: 0.60 + Math.random() * 0.35,
      size: 4 + Math.random() * 4,
      colour: "#ffaa33"
    });
  }

  // ===== LEFT THRUSTER PARTICLES (A or ←) =====
  if (S.keys["a"] || S.keys["arrowleft"]) {
    for (let i = 0; i < 2; i++) {
      S.thrustParticles.push({
        x: p.x - 14 + (Math.random() - 0.5) * 6,
        y: p.y + 18 + (Math.random() * 4),
        vx: (Math.random() - 0.5) * 40,
        vy: 120 + Math.random() * 100,
        life: 0.60 + Math.random() * 0.25,
        size: 3 + Math.random() * 3,
        colour: "#ffbb33"
      });
    }
  }

  // ===== RIGHT THRUSTER PARTICLES (D or →) =====
  if (S.keys["d"] || S.keys["arrowright"]) {
    for (let i = 0; i < 2; i++) {
      S.thrustParticles.push({
        x: p.x + 14 + (Math.random() - 0.5) * 6,
        y: p.y + 18 + (Math.random() * 4),
        vx: (Math.random() - 0.5) * 40,
        vy: 120 + Math.random() * 100,
        life: 0.60 + Math.random() * 0.25,
        size: 3 + Math.random() * 3,
        colour: "#ffbb33"
      });
    }
  }
}

// ============================================================
//   PNG THRUSTER FLAME (MAIN ENGINE)
// ============================================================
{
  const frames = S.sprites.thrusterFrames;
  if (frames && frames.length === 3) {

    // Animation frame
    S.thrustFrame = (S.thrustFrame ?? 0);
    S.thrustTimer = (S.thrustTimer ?? 0) + (S.dt || 0.016);
    if (S.thrustTimer > 0.05) {
      S.thrustTimer = 0;
      S.thrustFrame = (S.thrustFrame + 1) % 3;
    }

    const flame = frames[S.thrustFrame];

    const boosting = (S.keys?.["w"] || S.keys?.["arrowup"]);
    const flameScaleX = boosting ? 0.16 : 0.15;
    const flameScaleY = boosting ? 0.10 : 0.08;

    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(Math.PI);

    const fw = flame.width * flameScaleX;
    const fh = flame.height * flameScaleY;

    ctx.drawImage(flame, -fw / 2, -fh, fw, fh);
    ctx.restore();
  }
}

// ============================================================
//   SIDE THRUSTERS (A / D) – angled 30° outward
// ============================================================
{
  const frames = S.sprites.thrusterFrames;
  if (frames && frames.length === 3) {
    const flame = frames[S.thrustFrame];

    const leftAng  = (30 * Math.PI) / 180;
    const rightAng = -(30 * Math.PI) / 180;

    const scaleX = 0.12;
    const scaleY = 0.07;

    const turningBoost =
      (S.keys["a"] || S.keys["arrowleft"] ||
       S.keys["d"]   || S.keys["arrowright"])
       ? 1.25 : 1.0;

    // LEFT FLAME
    if (S.keys["a"] || S.keys["arrowleft"]) {
      ctx.save();
      ctx.translate(-0, 2);
      ctx.rotate(Math.PI + leftAng);
      const fw = flame.width * scaleX;
      const fh = flame.height * (scaleY * turningBoost);
      ctx.drawImage(flame, -fw / 2, -fh, fw, fh);
      ctx.restore();
    }

    // RIGHT FLAME
    if (S.keys["d"] || S.keys["arrowright"]) {
      ctx.save();
      ctx.translate(0, 2);
      ctx.rotate(Math.PI + rightAng);
      const fw = flame.width * scaleX;
      const fh = flame.height * (scaleY * turningBoost);
      ctx.drawImage(flame, -fw / 2, -fh, fw, fh);
      ctx.restore();
    }
  }
}
  //
  // ============================================================
  //                    RENDER PLAYER SHIP
  // ============================================================
  //
  ctx.shadowColor = "rgba(120,200,255,0.35)";
  ctx.shadowBlur = 10;

  // Scale sprite
  const scale = 0.06;
  const w = img.width * scale;
  const h = img.height * scale;

  ctx.drawImage(
    img,
    -w * 0.50,   // center
    -h * 0.60,   // slight lift
    w,
    h
  );

  ctx.restore();

  //
  // ============================================================
  //                   INVULNERABILITY RING
  // ============================================================
  //
  if (p.invuln > 0) {
    ctx.strokeStyle = "#fffd8b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius + 6, 0, Math.PI * 2);
    ctx.stroke();
  }
};