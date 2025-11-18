// ---------- PLAYER RENDER ----------

window.drawPlayer = function drawPlayer(ctx) {
  const player = window.GameState.player;

  // Glow
  ctx.save();
  ctx.shadowColor = "#5be7ff";
  ctx.shadowBlur = 16;

  // Body
  ctx.fillStyle = "#dff3ff";
  ctx.beginPath();
  ctx.moveTo(player.x, player.y - 18);
  ctx.lineTo(player.x - 10, player.y + 10);
  ctx.lineTo(player.x + 10, player.y + 10);
  ctx.closePath();
  ctx.fill();

  // Cockpit
  ctx.fillStyle = "#7be4ff";
  ctx.beginPath();
  ctx.arc(player.x, player.y - 6, 5, 0, Math.PI * 2);
  ctx.fill();

  // Thrusters
  const flameColors = ["#fffd8b", "#ff9b4b", "#ff4b6e"];
  for (let i = -1; i <= 1; i += 2) {
    ctx.beginPath();
    ctx.moveTo(player.x + i * 6, player.y + 10);
    ctx.lineTo(player.x + i * 4, player.y + 24 + Math.random() * 6);
    ctx.lineTo(player.x + i * 2, player.y + 10);
    ctx.fillStyle =
      flameColors[Math.floor(Math.random() * flameColors.length)];
    ctx.fill();
  }

  ctx.restore();

  // Invuln ring
  if (player.invuln > 0) {
    ctx.strokeStyle = "#fffd8b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + 4, 0, Math.PI * 2);
    ctx.stroke();
  }
};
