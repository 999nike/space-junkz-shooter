// ---------- RENDERER ----------

// STARFIELD (draw only)
window.drawStars = function drawStars(ctx) {
  const S = window.GameState;

  ctx.save();
  for (const s of S.stars) {
    ctx.globalAlpha = s.alpha;
    ctx.fillStyle = s.color;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }
  ctx.restore();
};

// STARFIELD MOVEMENT (top-right → bottom-left, 30° tilt)
window.updateStars = function updateStars(dt) {
  const S = window.GameState;

  const angle = (30 * Math.PI) / 180;
  const dirX = -Math.sin(angle);   // left
  const dirY =  Math.cos(angle);   // down

  for (const s of S.stars) {
    s.x += dirX * s.speed * dt;
    s.y += dirY * s.speed * dt;

    if (s.y > S.H + 50 || s.x < -50) {
      s.x = rand(S.W * 0.55, S.W + 140);
      s.y = rand(-160, S.H * 0.25);
      s.size = rand(1, 3);
      s.speed = rand(30, 110);
      s.alpha = rand(0.4, 1);
    }
  }
};

// ---------- DIAGONAL / NEBULA BACKGROUND ----------
window.drawRunway = function drawRunway(ctx) {
  const S = window.GameState;
  const nebula = S.sprites.nebulaBG;

  // Nebula backdrop
  ctx.save();
  if (nebula) {
    ctx.globalAlpha = 1.0;
    ctx.drawImage(nebula, 0, 0, S.W, S.H);
  }
  ctx.restore();

  ctx.globalAlpha = 1;
};

// ---------- BULLETS ----------
window.drawBullets = function drawBullets(ctx) {
  const S = window.GameState;

  if (!S.sprites) return;

  const img = S.sprites.playerBullet;
  if (!img) return;

  const w = img.width;
  const h = img.height;

  for (const b of S.bullets) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.drawImage(img, -w * 0.5, -h * 0.5, w, h);
    ctx.restore();
  }
};

// Enemy bullets renderer
window.drawEnemyBullets = function drawEnemyBullets(ctx) {
  const S = window.GameState;
  const yellow = S.sprites.enemyBullet;
  const blue   = S.sprites.playerBullet;
  if (!yellow && !blue) return;

  for (const b of S.enemyBullets) {
    const img =
      b.type === "bossClaw"
        ? (blue || yellow)
        : (yellow || blue);

    if (!img) continue;

    const w = img.width;
    const h = img.height;

    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.drawImage(img, -w * 0.5, -h * 0.5, w, h);
    ctx.restore();
  }
};

// Power-up renderer
window.drawPowerUps = function drawPowerUps(ctx) {
  const S = window.GameState;

 //////-------POWER-UP-RENDER-------
for (const p of S.powerUps) {

  // COIN PICKUP (green)
  if (p.type === "coin") {
    ctx.fillStyle = "#7dff99";
  }

  // WEAPON PICKUP (yellow)
  else {
    ctx.fillStyle = "#ffe66b";
  }

  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius || 10, 0, Math.PI * 2);
  ctx.fill();
}
};

// Explosion renderer (sprite sheet)
window.drawParticles = function drawParticles(ctx) {
  const S = window.GameState;
  const sheet = S.sprites.explosionSheet;
  if (!sheet) return;

  const rows = 4;
  const cols = 4;   // 4x4 grid

  const frameW = sheet.width / cols;
  const frameH = sheet.height / rows;

  for (const e of S.particles) {
    const sx = e.frame * frameW;
    const sy = e.row * frameH;

    ctx.save();
    ctx.translate(e.x, e.y);

    const scale = e.scale || 1.0;

    ctx.drawImage(
      sheet,
      sx, sy, frameW, frameH,
      -frameW * 0.5 * scale,
      -frameH * 0.5 * scale,
      frameW * scale,
      frameH * scale
    );

    ctx.restore();
  }
};

// ---------- SIDEKICK RENDERER ----------
window.drawSidekicks = function drawSidekicks(ctx) {
  const S = window.GameState;
  const img = S.sprites.sideShip;
  if (!img || !S.sidekicks) return;

  const scale = 0.6;
  const w = img.width * scale;
  const h = img.height * scale;

  for (const s of S.sidekicks) {
    ctx.save();
    ctx.translate(s.x, s.y);
    // Rotate 180° so ship faces upward
    ctx.rotate(Math.PI);
    ctx.drawImage(img, -w * 0.5, -h * 0.5, w, h);
    ctx.restore();
  }
};

// ---------- ROCKET RENDERER ----------
window.drawRockets = function drawRockets(ctx) {
  const S = window.GameState;
  const img = S.sprites.rocket;
  if (!img || !S.rockets) return;

  const w = img.width;
  const h = img.height;
  const scale = 2.0; // visible

  for (const r of S.rockets) {
    ctx.save();
    ctx.translate(r.x, r.y);

    const angle = Math.atan2(r.vy, r.vx);
    ctx.rotate(angle); // rocket oriented along movement

    ctx.drawImage(
      img,
      -w * 0.5 * scale,
      -h * 0.5 * scale,
      w * scale,
      h * scale
    );

    ctx.restore();
  }
};

// ---------- BOSS RENDERER ----------
window.drawScorpionBoss = function drawScorpionBoss(ctx) {
  const S = window.GameState;

  if (!S.sprites) return;

  const img = S.sprites.bossScorpion;
  const beamImg = S.sprites.megaBeam;
  if (!img) return;

  const scale = 0.30;
  const w = img.width * scale;
  const h = img.height * scale;

  for (const e of S.enemies) {
    if (e.type !== "scorpionBoss") continue;

    // Tail laser first so boss is on top
    if ((e.laserCharging || e.laserActive) && beamImg) {
      const tailX = e.x;
      const tailY = e.y + h * 0.32;  // tail-tip anchor

      const targetX = e.laserX;
      const targetY = S.H + 60;

      const dx = targetX - tailX;
      const dy = targetY - tailY;
      const angle = Math.atan2(dy, dx);
      const length = Math.hypot(dx, dy);

      ctx.save();
      ctx.translate(tailX, tailY);
      ctx.rotate(angle);

      ctx.globalAlpha = e.laserActive ? 0.95 : 0.4;

      ctx.drawImage(
        beamImg,
        0,
        -beamImg.height * 0.5,
        length,
        beamImg.height
      );

      ctx.restore();
      ctx.globalAlpha = 1;
    }

    // Boss body
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.drawImage(
      img,
      -w * 0.5,
      -h * 0.5,
      w,
      h
    );
    ctx.restore();

    // HP bar
    const barW = 160;
    const barH = 10;
    const pct = e.hp / e.maxHp;

    const bx = e.x - barW / 2;
    const by = e.y - h / 2 - 20;

    ctx.fillStyle = "#000000";
    ctx.fillRect(bx, by, barW, barH);

    ctx.fillStyle = "#3aff6b";
    ctx.fillRect(bx, by, barW * pct, barH);
  }
};

// ------ PATCH 5: Gemini Boss Renderer (N5) ------
window.drawGeminiBoss = function drawGeminiBoss(ctx) {
  const S = window.GameState;
  if (!S.sprites) return;

  const img = S.sprites.bossGemini;
  if (!img) return;

  const scale = 0.70; 
  const w = img.width * scale;
  const h = img.height * scale;

  for (const e of S.enemies) {
    if (e.type !== "geminiBoss") continue;

    // Draw main ship
    ctx.drawImage(img, e.x - w * 0.5, e.y - h * 0.5, w, h);

    // HP bar
    if (e.maxHp) {
      const barWidth = 200;
      const barHeight = 6;
      const hpRatio = Math.max(0, Math.min(1, e.hp / e.maxHp));

      const barX = e.x - barWidth / 2;
      const barY = e.y - h * 0.5 - 20;

      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(barX, barY, barWidth, barHeight);

      ctx.fillStyle = "rgba(0, 255, 255, 0.7)";
      ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

      ctx.strokeStyle = "#00ffff";
      ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
  }
};

// ---------- MAIN GAME DRAW ----------
window.drawGame = function drawGame() {
  const S = window.GameState;
  const ctx = S.ctx;

  // WORLD MAP MODE
  if (window.WorldMap && window.WorldMap.active) {
    window.WorldMap.draw(ctx);
    return;
  }

  ctx.clearRect(0, 0, S.W, S.H);

  // Background first
  window.drawRunway(ctx);
  // Stars
  drawStars(ctx);
  // Enemies
  window.drawEnemies(ctx);

  // Boss
  window.drawScorpionBoss(ctx);
  window.drawGeminiBoss(ctx);   // PATCH 5B

  // Sidekick ships
  window.drawSidekicks(ctx);

  // Rockets
  window.drawRockets(ctx);

  // Bullets
  drawBullets(ctx);

  // Enemy bullets
  window.drawEnemyBullets(ctx);

  // Power-ups
  window.drawPowerUps(ctx);

  // Particles
  window.drawParticles(ctx);

  // Player
  window.drawPlayer(ctx);
};
