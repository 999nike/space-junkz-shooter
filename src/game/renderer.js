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

// STARFIELD MOVEMENT — DISABLED (LOGIC.JS VERSION ACTIVE)
window.updateStars = function updateStars() {
  // Renderer version disabled to prevent double starfield updates.
};

// ---------- DIAGONAL / NEBULA BACKGROUND ----------
window.drawRunway = function drawRunway(ctx) {
  const S = window.GameState || {};
  const sprites = S.sprites || null;

  ctx.save();

  if (sprites && sprites.nebulaBG) {
    const nebula = sprites.nebulaBG;

    ctx.globalAlpha = 1.0;
    ctx.drawImage(
      nebula,
      0,
      0,
      S.W || ctx.canvas.width,
      S.H || ctx.canvas.height
    );
  } else {
    // Fallback – simple gradient so the game never hard-crashes
    const w = S.W || ctx.canvas.width;
    const h = S.H || ctx.canvas.height;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#02030a");
    g.addColorStop(1, "#050018");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.restore();
  ctx.globalAlpha = 1;
};

/// ---------- BULLETS ----------
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

    // Glow bloom behind bullet
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(0,255,255,0.35)";
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Motion trail (elongated streak)
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.scale(1.4, 0.55);

    // ✔ FIXED: true centered bullet
    ctx.drawImage(img, -w / 2, -h / 2, w, h);

    ctx.restore();

    // Original bullet sprite (centered)
    ctx.drawImage(img, -w / 2, -h / 2, w, h);

    ctx.restore();
  }
};


// ----------- ENEMY BULLETS -----------
window.drawEnemyBullets = function drawEnemyBullets(ctx) {
  const S = window.GameState || {};
  const sprites = S.sprites || null;

  if (!sprites || !sprites.enemyBullet || !S.enemyBullets) return;

  const img = sprites.enemyBullet;
  const w = img.width;
  const h = img.height;

  for (const b of S.enemyBullets) {
    if (!img) continue;

    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.scale(1.1, 1.1);

    // Glow
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(255,180,50,0.35)";
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Centered draw
    ctx.drawImage(img, -w/2, -h/2, w, h);
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
  const S = window.GameState || {};
  const sprites = S.sprites || null;

  // Hard guard – if sprites not ready or particles not set, do nothing
  if (!sprites || !sprites.explosionSheet || !Array.isArray(S.particles) || S.particles.length === 0) {
    return;
  }

  const sheet = sprites.explosionSheet;

  const rows = 4;
  const cols = 4; // 4x4 grid

  const frameW = sheet.width / cols;
  const frameH = sheet.height / rows;

  for (const e of S.particles) {
    const sx = e.frame * frameW;
    const sy = e.row * frameH;

    ctx.save();
    ctx.translate(e.x, e.y);

    const scale = e.scale || 1.0;

    // ---- CORE FLASH ----
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.arc(0, 0, frameW * scale * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ---- SHOCKWAVE RING ----
    ctx.save();
    ctx.strokeStyle = "rgba(0,255,255,0.35)";
    ctx.lineWidth = frameW * scale * 0.20;
    ctx.beginPath();
    ctx.arc(0, 0, frameW * scale * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // ---- SPRITE EXPLOSION FRAME ----
    ctx.drawImage(
      sheet,
      sx, sy, frameW, frameH,
      -frameW * 0.5 * scale,
      -frameH * 0.5 * scale,
      frameW * scale,
      frameH * scale
    );

    // ---- NEON BLOOM ----
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(0,180,255,0.25)";
    ctx.beginPath();
    ctx.arc(0, 0, frameW * scale * 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }
};

// ---------- SIDEKICK RENDERER ----------
window.drawSidekicks = function drawSidekicks(ctx) {
  const S = window.GameState || {};
  const sprites = S.sprites || null;

  // No renderer errors before assets load
  if (!sprites || !sprites.sideShip || !S.sidekicks) return;

  const img = sprites.sideShip;
  const scale = 0.6;
  const w = img.width * scale;
  const h = img.height * scale;

  for (const s of S.sidekicks) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(Math.PI); // face upward
    ctx.drawImage(img, -w * 0.5, -h * 0.5, w, h);
    ctx.restore();
  }
};

// ---------- ROCKET RENDERER ----------
window.drawRockets = function drawRockets(ctx) {
  const S = window.GameState || {};
  const sprites = S.sprites || null;

  // Prevent crashes before assets load
  if (!sprites || !sprites.rocket || !S.rockets) return;

  const img = sprites.rocket;
  const w = img.width;
  const h = img.height;
  const scale = 2.0;

  for (const r of S.rockets) {
    ctx.save();
    ctx.translate(r.x, r.y);

    const angle = Math.atan2(r.vy, r.vx);
    ctx.rotate(angle);

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

// ----------- PLAYER RENDERING (ANGLE + BANK) -----------
window.drawPlayer = function drawPlayer(ctx) {
  const S = window.GameState;
  const p = S.player;

  // HARD GUARD — stop until ship.png is fully decoded
  if (!S.shipImage || S.shipImage.naturalWidth === 0) {
    return;
  }

  const img = S.shipImage;

  ctx.save();

  // Move to player position
  ctx.translate(p.x, p.y);

  // Default facing angle (Nova patch fix — face upward)
  const baseAngle = typeof p.angle === "number" ? p.angle : -Math.PI / 2;

  // Rotate so ship nose points in movement direction
  ctx.rotate(baseAngle + Math.PI / 2 + (p.bank || 0) * 0.10);

  // ---- THRUSTER GLOW (Nova Style) ----
  const speed = Math.hypot(p.vx || 0, p.vy || 0);
  const thrusterSize = Math.min(40, 12 + speed * 0.05);

  ctx.save();
  ctx.rotate(baseAngle + Math.PI / 2);

  const grad = ctx.createRadialGradient(
    0, 30, 0,
    0, 30, thrusterSize
  );
  grad.addColorStop(0, "rgba(0,255,255,0.7)");
  grad.addColorStop(1, "rgba(0,100,255,0.0)");

  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 30, thrusterSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ---- DRAW SHIP IMAGE ----
  const w = img.width;
  const h = img.height;
  ctx.drawImage(img, -w * 0.5, -h * 0.5, w, h);

  ctx.restore();
};

// --------------------------------------------------------
//  PLAYER HEALTH + SHIELD BARS (LERP ANIMATED)
// --------------------------------------------------------
window.drawPlayerBars = function drawPlayerBars(ctx, S) {
  const p = S.player;
  if (!p) return;

  // Limits
  const maxHP = S.maxLives  || 100;
  const maxSH = S.maxShield || 100;
  const hp    = Math.max(0, S.lives);
  const sh    = Math.max(0, S.shield || 0);

  // Short bar width
  const BAR_W = 40;
  const BAR_H = 4;
  const GAP   = 6;

  // Position
  const X = p.x - BAR_W / 2;
  let   Y = p.y + 32;

  // ---- HEALTH BAR (GREEN) ----
  S._hpLerp = S._hpLerp ?? hp;
  S._hpLerp += (hp - S._hpLerp) * 0.18;

  ctx.fillStyle = "#00ff44"; // neon green
  ctx.fillRect(X, Y, (S._hpLerp / maxHP) * BAR_W, BAR_H);

  // ---- SHIELD BAR (BLUE) ----
  if (S.shieldUnlocked) {
    Y += BAR_H + 2;  // small gap

    S._shLerp = S._shLerp ?? sh;
    S._shLerp += (sh - S._shLerp) * 0.18;

    ctx.fillStyle = "#00c8ff"; // neon blue
    ctx.fillRect(X, Y, (S._shLerp / maxSH) * BAR_W, BAR_H);
  }
};

// --------------------------------------------------------
//  SIMPLE STARFIELD SYSTEM (RESTORE)
// --------------------------------------------------------
let _stars = [];

window.initStars = function initStars() {
  const S = window.GameState;
  _stars = [];
  for (let i = 0; i < 120; i++) {
    _stars.push({
      x: Math.random() * S.W,
      y: Math.random() * S.H,
      s: Math.random() * 2 + 1,
      v: 0.2 + Math.random() * 0.4
    });
  }
};

window.drawStars = function drawStars(ctx) {
  const S = window.GameState;
  ctx.fillStyle = "#ffffff";

  for (const s of _stars) {
    ctx.globalAlpha = 0.5 + Math.random() * 0.5;
    ctx.fillRect(s.x, s.y, s.s, s.s);

    s.y += s.v;
    if (s.y > S.H) {
      s.y = 0;
      s.x = Math.random() * S.W;
    }
  }

  ctx.globalAlpha = 1;
};

// ---------- MAIN GAME DRAW ----------
window.drawGame = function drawGame() {
  const S = window.GameState;
  const ctx = S.ctx;

  // HOME BASE MODE
  if (window.HomeBase && window.HomeBase.active) {
    window.HomeBase.draw(ctx);
    return;
  }

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

// ------- PLAYER HEALTH + SHIELD BARS (N5) -------
if (window.drawPlayerBars && S) {
  window.drawPlayerBars(ctx, S);
}
};

