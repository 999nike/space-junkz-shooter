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

// ---------- DIAGONAL RUNWAY BACKGROUND ----------
window.drawRunway = function drawRunway(ctx) {
  const S = window.GameState;

  // 30° angle
  const angle = (30 * Math.PI) / 180;
  const tiltX = Math.sin(angle) * S.W;
  const tiltY = Math.cos(angle) * S.H;

  ctx.save();

  // Diagonal background gradient
  const grd = ctx.createLinearGradient(0, S.H, tiltX, 0);
  grd.addColorStop(0,   "rgba(8, 12, 28, 1)");
  grd.addColorStop(0.3, "rgba(16, 32, 70, 1)");
  grd.addColorStop(0.55,"rgba(10, 22, 48, 1)");
  grd.addColorStop(1,   "rgba(2, 8, 18, 1)");

  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, S.W, S.H);

  // Subtle streaks (F-Zero effect)
  for (let i = 0; i < 14; i++) {
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = "#5be7ff";
    const px = (i * (S.W / 14)) + Math.sin(Date.now() * 0.0008 + i) * 6;
    ctx.fillRect(px, 0, 3, S.H);
  }

  ctx.restore();
};

// ---------- BULLETS ----------
window.drawBullets = function drawBullets(ctx) {
  const S = window.GameState;

  // Safety: sprites not ready yet
  if (!S.sprites) return;

  const img = S.sprites.playerBullet;
  if (!img) return;

  const w = img.width;
  const h = img.height;

  for (const b of S.bullets) {
    ctx.save();
    ctx.translate(b.x, b.y);

    ctx.drawImage(
      img,
      -w * 0.5,
      -h * 0.5,
      w,
      h
    );

    ctx.restore();
  }
};

// ---------- MISSING FUNCTIONS (PATCH) ----------

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
    ctx.drawImage(
      img,
      -w * 0.5,
      -h * 0.5,
      w,
      h
    );
    ctx.restore();
  }
};

// Power-up renderer
window.drawPowerUps = function drawPowerUps(ctx) {
  const S = window.GameState;

  for (const p of S.powerUps) {
    ctx.fillStyle = "#ffe66b";
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
const cols = 4;   // Your texture is a 4x4 grid

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

// ---------- BOSS RENDERER ----------
window.drawScorpionBoss = function drawScorpionBoss(ctx) {
  const S = window.GameState;

// Safety: sprites may not be ready on first frames
if (!S.sprites) return;

const img = S.sprites.bossScorpion;
const beamImg = S.sprites.megaBeam;

// Safety: boss sprite not ready or boss not spawned
if (!img) return;

  const scale = 0.30;          // mega-boss scale
  const w = img.width * scale;
  const h = img.height * scale;

  for (const e of S.enemies) {
    if (e.type !== "scorpionBoss") continue;

    // Tail laser first so boss is on top
    if ((e.laserCharging || e.laserActive) && beamImg) {
        const beamX = (typeof e.laserX === "number") ? e.laserX : e.x;
        const topY = e.y - h * 0.5;
        const bottomY = S.H + 40;
        const segH = beamImg.height || 64;
        const segments = Math.ceil((bottomY - topY) / segH);

        ctx.save();
        ctx.translate(beamX, topY);
        ctx.globalAlpha = e.laserActive ? 0.9 : 0.4;

      for (let i = 0; i < segments; i++) {
        ctx.drawImage(
          beamImg,
          -beamImg.width * 0.5,
          i * segH
        );
      }

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

// ---------- MAIN GAME DRAW ----------
window.drawGame = function drawGame() {
  const S = window.GameState;
  const ctx = S.ctx;

  ctx.clearRect(0, 0, S.W, S.H);

  // Diagonal runway background
  window.drawRunway(ctx);

  // Stars
  drawStars(ctx);

  // Enemies
  window.drawEnemies(ctx);

  // Boss (Scorpion)
  window.drawScorpionBoss(ctx);

  // Bullets
  drawBullets(ctx);

  // Enemy bullets
  window.drawEnemyBullets(ctx);

  // Power-ups
  window.drawPowerUps(ctx);

  // Particles
  window.drawParticles(ctx);

  // Player ship + thruster FX
  window.drawPlayer(ctx);
};
