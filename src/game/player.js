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

  //
  // ============================================================
  //   THRUSTER EMBER PARTICLES (ALWAYS ON + BOOST TRIPLE)
  // ============================================================
  //
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

  // ---- PNG THRUSTER FLAME (short, tight engine flame) ----
{
  const frames = S.sprites.thrusterFrames;

  if (frames && frames.length === 3) {
    // Animation timing
    S.thrustFrame = (S.thrustFrame ?? 0);
    S.thrustTimer = (S.thrustTimer ?? 0);
    S.thrustTimer += S.dt || 0.016;

    if (S.thrustTimer > 0.05) {
      S.thrustTimer = 0;
      S.thrustFrame = (S.thrustFrame + 1) % 3;
    }

    const flame = frames[S.thrustFrame];

    // Correct spot: directly behind the UFO
    const flameOffset = -22;

    // Tight small flame
    const flameScaleX = boosting ? 0.28 : 0.20;
    const flameScaleY = boosting ? 0.14 : 0.10;

    ctx.save();

    // Move flame under the ship
    ctx.translate(0, flameOffset);

    // Flip flame backwards (180°)
    ctx.rotate(Math.PI);

    // Apply squash scale
    const fw = flame.width * flameScaleX;
    const fh = flame.height * flameScaleY;

    // Render tight flame
    ctx.drawImage(flame, -fw / 2, 0, fw, fh);

    ctx.restore();
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