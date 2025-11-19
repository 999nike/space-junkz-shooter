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

  ctx.save();
  for (const e of S.enemies) {
    // Enemy triangle rendering (we’ll replace with sprites later)
    ctx.fillStyle = e.colour;

    ctx.beginPath();
    ctx.moveTo(e.x, e.y - 12);
    ctx.lineTo(e.x - 10, e.y + 10);
    ctx.lineTo(e.x + 10, e.y + 10);
    ctx.closePath();
    ctx.fill();

    // Health bar
    ctx.fillStyle = "#7dff99";
    ctx.fillRect(e.x - 12, e.y - 20, (e.hp / e.maxhp) * 24, 3);
  }
  ctx.restore();
};
