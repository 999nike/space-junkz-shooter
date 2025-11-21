// ----------- ENEMIES -----------

window.updateEnemies = function updateEnemies(dt) {
  const S = window.GameState;

  // 30° diagonal movement (top-right → bottom-left)
  const angle = (30 * Math.PI) / 180;
  const dirX = -Math.sin(angle);
  const dirY =  Math.cos(angle);

  for (const e of S.enemies) {

    // Skip boss — handled in logic.js
    if (e.type === "scorpionBoss") {
      continue;
    }

    // Move enemy along diagonal lane
    e.x += dirX * e.speed * dt;
    e.y += dirY * e.speed * dt;

    // If off-screen → respawn top-right
    if (e.y > S.H + 120 || e.x < -120) {
      e.x = rand(S.W * 0.55, S.W + 150);
      e.y = rand(-160, S.H * 0.25);

      e.speed = rand(40, 90);
      e.hp = rand(1, 3);
    }
  }
};

// ----------- RENDER -----------

window.drawEnemies = function drawEnemies(ctx) {
  const S = window.GameState;
  if (!S.sprites) return;

  ctx.save();

  for (const e of S.enemies) {
    if (e.type === "scorpionBoss") continue;

    let img = null;
    let scale = 1.0;
    
// -------- SHIP SPRITE ASSIGNMENT --------
switch (e.type) {
  case "grunt":       // fast weak ship
    img = S.sprites.enemyGrunt;
    scale = 0.30;   // was 0.38
    break;

  case "zigzag":      // winged zig-zag ship
    img = S.sprites.enemyZigzag;
    scale = 0.36;   // was 0.45
    break;

  case "shooter":     // fires bullets
    img = S.sprites.enemyShooter;
    scale = 0.38;   // was 0.48
    break;

  case "tank":        // big cruiser (DO NOT CHANGE)
    img = S.sprites.enemyTank;
    scale = 0.62;    // exact size you like
    break;
}

    // Skip if sprite missing
    if (!img) continue;

    const w = img.width * scale;
    const h = img.height * scale;

    ctx.save();
    ctx.translate(e.x, e.y);

    // Enemies face downward
    ctx.rotate(Math.PI);

    // Hit flash tint
    if (e.hitFlash > 0) {
      ctx.globalAlpha = 0.45 + Math.sin(Date.now() * 0.03) * 0.25;
    }

    ctx.drawImage(
      img,
      -w * 0.5,
      -h * 0.5,
      w,
      h
    );

    ctx.restore();

    // -------- HEALTH BAR --------
    if (e.maxhp > 1) {
      const barW = 28;
      const pct = e.hp / e.maxhp;

      ctx.fillStyle = "#000000";
      ctx.fillRect(
        e.x - barW / 2,
        e.y + h * 0.55,
        barW,
        4
      );

      ctx.fillStyle = "#7dff99";
      ctx.fillRect(
        e.x - barW / 2,
        e.y + h * 0.55,
        barW * pct,
        4
      );
    }
  }

  ctx.restore();
};
