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
  grd.addColorStop(0, "rgba(8, 12, 28, 1)");
  grd.addColorStop(0.3, "rgba(16, 32, 70, 1)");
  grd.addColorStop(0.55, "rgba(10, 22, 48, 1)");
  grd.addColorStop(1, "rgba(2, 8, 18, 1)");

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

  for (const b of S.bullets) {
    const grad = ctx.createLinearGradient(b.x, b.y + 10, b.x, b.y - 10);
    grad.addColorStop(0, "rgba(10,10,20,0)");
    grad.addColorStop(0.4, b.colour);
    grad.addColorStop(1, "#ffffff");

    ctx.strokeStyle = grad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y + 6);
    ctx.lineTo(b.x, b.y - 10);
    ctx.stroke();
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

  // Bullets
  drawBullets(ctx);

  // Enemy bullets
  window.drawEnemyBullets(ctx);

  // Power-ups
  window.drawPowerUps(ctx);

  // Particles
  window.drawParticles(ctx);

  // Player
// ----------- THRUSTER FLAME FX -----------
ctx.save();
const p = S.player;

// Flame origin (slightly behind ship)
const angle = (30 * Math.PI) / 180;
const fx = p.x - Math.cos(angle) * 14;
const fy = p.y + Math.sin(angle) * 14;

// Flickering plasma flame
ctx.globalAlpha = 0.45 + Math.random() * 0.25;
ctx.fillStyle = "rgba(120,200,255,0.8)";
ctx.beginPath();
ctx.ellipse(
  fx + (p.bank * 6),
  fy + 22,
  6 + Math.random() * 2,
  18 + Math.random() * 6,
  0,
  0,
  Math.PI * 2
);
ctx.fill();

// Inner core
ctx.globalAlpha = 0.75;
ctx.fillStyle = "#ffffff";
ctx.beginPath();
ctx.ellipse(
  fx + (p.bank * 6),
  fy + 16,
  2.4,
  7,
  0,
  0,
  Math.PI * 2
);
ctx.fill();

// Subtle motion blur
ctx.globalAlpha = 0.18;
ctx.fillStyle = "rgba(100,200,255,0.4)";
ctx.beginPath();
ctx.moveTo(p.x - 20, p.y + 30);
ctx.lineTo(p.x - 55, p.y + 70);
ctx.lineTo(p.x - 8, p.y + 45);
ctx.closePath();
ctx.fill();

ctx.restore();
};
