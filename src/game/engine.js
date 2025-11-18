// ---------- ENGINE / LOOP ----------

window.flashMsg = function flashMsg(text) {
  const S = window.GameState;
  if (!S.msgEl) return;
  S.msgEl.textContent = text;
  clearTimeout(S._msgTimeout);
  S._msgTimeout = setTimeout(() => {
    S.msgEl.textContent = "";
  }, 1600);
};

window.shoot = function shoot() {
  const S = window.GameState;
  const player = S.player;
  const spread = player.weaponLevel;
  const bulletSpeed = 380;
  const base = { y: player.y - 18, radius: 4, colour: "#5be7ff" };

  if (spread === 1) {
    S.bullets.push({
      x: player.x,
      vy: -bulletSpeed,
      vx: 0,
      ...base
    });
  } else if (spread === 2) {
    S.bullets.push(
      {
        x: player.x - 9,
        vy: -bulletSpeed,
        vx: 0,
        ...base
      },
      {
        x: player.x + 9,
        vy: -bulletSpeed,
        vx: 0,
        ...base
      }
    );
  } else {
    // 3-way spread
    S.bullets.push(
      {
        x: player.x,
        vy: -bulletSpeed,
        vx: 0,
        ...base,
        colour: "#8effff"
      },
      {
        x: player.x - 8,
        vy: -bulletSpeed,
        vx: -90,
        ...base,
        colour: "#ff8ad4"
      },
      {
        x: player.x + 8,
        vy: -bulletSpeed,
        vx: 90,
        ...base,
        colour: "#fffd8b"
      }
    );
  }
};

window.resetGameState = function resetGameState() {
  const S = window.GameState;

  S.enemies = [];
  S.bullets = [];
  S.enemyBullets = [];
  S.powerUps = [];
  S.particles = [];
  S.spawnTimer = 0;
  S.shootTimer = 0;
  S.score = 0;
  S.lives = 3;

  S.player.x = S.W / 2;
  S.player.y = S.H - 80;
  S.player.weaponLevel = 1;
  S.player.invuln = 0;

  S.scoreEl.textContent = S.score;
  S.livesEl.textContent = S.lives;
};

window.gameLoop = function gameLoop(timestamp) {
  const S = window.GameState;
  const dt = (timestamp - S.lastTime) / 1000 || 0;
  S.lastTime = timestamp;

  if (S.running) {
    window.updateGame(dt);
  }

  window.drawGame();
  requestAnimationFrame(window.gameLoop);
};
