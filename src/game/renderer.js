// ----------- RENDERER -----------

window.drawStars = function drawStars(ctx) {
  const S = window.GameState;

  ctx.save();
  ctx.fillStyle = "#ffffff";

  for (const s of S.stars) {
    ctx.globalAlpha = s.alpha;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }

  ctx.restore();
};

// ----------- UPDATE STARS (DIAGONAL 30° FLOW) -----------

window.updateStars = function updateStars(dt) {
  const S = window.GameState;

  // 30° diagonal movement (top-right → bottom-left)
  const angle = (30 * Math.PI) / 180;
  const dirX = -Math.sin(angle);   // ~ -0.5
  const dirY =  Math.cos(angle);   // ~ +0.866

  for (const s of S.stars) {
    s.x += dirX * s.speed * dt;
    s.y += dirY * s.speed * dt;

    // Respawn if off-screen (bottom-left area)
    if (s.y > S.H + 40 || s.x < -40) {
      // Spawn top-right area
      s.x = rand(S.W * 0.55, S.W + 100);
      s.y = rand(-120, S.H * 0.25);

      s.size = rand(1, 3);
      s.alpha = rand(0.4, 1);
      s.speed = rand(25, 90);
    }
  }
};

// ----------- MAIN GAME RENDER -----------

window.renderGame = function renderGame(dt) {
  const S = window.GameState;
  const ctx = S.ctx;

  ctx.clearRect(0, 0, S.W, S.H);

  // Background stars
  drawStars(ctx);

  // Bullets
  window.drawBullets(ctx);

  // Enemies
  window.drawEnemies(ctx);

  // Player
  window.drawPlayer(ctx);

  // Power-ups
  window.drawPowerUps(ctx);
};
