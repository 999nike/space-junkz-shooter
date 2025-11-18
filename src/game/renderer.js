// ---------- RENDERER ----------

window.drawStars = function drawStars(ctx) {
  const S = window.GameState;
  for (const s of S.stars) {
    ctx.fillStyle = s.color;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
};

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

window.drawEnemyBullets = function drawEnemyBullets(ctx) {
  const S = window.GameState;
  for (const b of S.enemyBullets) {
    ctx.fillStyle = b.colour;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  }
};

window.drawPowerUps = function drawPowerUps(ctx) {
  const S = window.GameState;
  for (const p of S.powerUps) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.4, "#80ffdf");
    g.addColorStop(1, "#00c6a6");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }
};

window.drawParticles = function drawParticles(ctx) {
  const S = window.GameState;
  for (const p of S.particles) {
    ctx.globalAlpha = Math.max(p.life, 0);
    ctx.fillStyle = p.colour;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
};

window.drawGame = function drawGame() {
  const S = window.GameState;
  const ctx = S.ctx;

  // Clear
  ctx.clearRect(0, 0, S.W, S.H);

  // Background gradient
  const grd = ctx.createLinearGradient(0, 0, 0, S.H);
  grd.addColorStop(0, "rgba(20,35,80,0.9)");
  grd.addColorStop(1, "rgba(2,5,18,1)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, S.W, S.H);

  drawStars(ctx);
  window.drawEnemies(ctx);
  drawBullets(ctx);
  drawEnemyBullets(ctx);
  drawPowerUps(ctx);
  drawParticles(ctx);
  window.drawPlayer(ctx);
};
