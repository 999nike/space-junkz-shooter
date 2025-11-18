// ---------- ENEMY RENDER ----------

window.drawEnemies = function drawEnemies(ctx) {
  const S = window.GameState;

  for (const e of S.enemies) {
    ctx.save();
    ctx.fillStyle = e.hitFlash > 0 ? "#ffffff" : e.colour;
    ctx.beginPath();
    ctx.moveTo(e.x, e.y - e.radius);
    ctx.lineTo(e.x - e.radius * 0.8, e.y + e.radius * 0.8);
    ctx.lineTo(e.x + e.radius * 0.8, e.y + e.radius * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // HP bar if more than 1 HP
    if (e.maxHp > 1) {
      const barWidth = e.radius * 1.5;
      const barHeight = 4;
      const x = e.x - barWidth / 2;
      const y = e.y - e.radius - 8;

      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(x, y, barWidth, barHeight);

      const hpWidth = (e.hp / e.maxHp) * barWidth;
      ctx.fillStyle = "#76ff9b";
      ctx.fillRect(x, y, hpWidth, barHeight);
    }
  }
};
