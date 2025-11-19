// ---------- ENGINE / LOOP ----------

// Flash message
window.flashMsg = function flashMsg(text) {
  const S = window.GameState;
  if (!S.msgEl) return;
  S.msgEl.textContent = text;
  clearTimeout(S._msgTimeout);
  S._msgTimeout = setTimeout(() => {
    S.msgEl.textContent = "";
  }, 1600);
};

// ---------- BULLET SYSTEM (F-Zero 30° Diagonal) ----------

window.shoot = function shoot() {
  const S = window.GameState;
  const player = S.player;
  const spread = player.weaponLevel;
  const bulletSpeed = 380;

  // 30° diagonal (up-right)
  const angle = (30 * Math.PI) / 180;
  const dirX = Math.sin(angle);   // ~ +0.5
  const dirY = -Math.cos(angle);  // ~ -0.866

  const base = {
    x: player.x,
    y: player.y - 12,
    radius: 4,
    colour: "#a8ffff"
  };

  if (spread === 1) {
    // SINGLE SHOT (straight diagonal)
    S.bullets.push({
      ...base,
      vx: dirX * bulletSpeed,
      vy: dirY * bulletSpeed,
    });

  } else if (spread === 2) {
    // TWIN SHOT
    S.bullets.push(
      {
        ...base,
        x: player.x - 10,
        vx: dirX * bulletSpeed,
        vy: dirY * bulletSpeed,
      },
      {
        ...base,
        x: player.x + 10,
        vx: dirX * bulletSpeed,
        vy: dirY * bulletSpeed,
      }
    );

  } else {
    // 3-WAY SPREAD (angled outer shots)
    S.bullets.push(
      // CENTER
      {
        ...base,
        vx: dirX * bulletSpeed,
        vy: dirY * bulletSpeed,
        colour: "#a8ffff"
      },
      // LEFT ANGLE
      {
        ...base,
        x: player.x - 12,
        vx: dirX * bulletSpeed - 120,
        vy: dirY * bulletSpeed,
        colour: "#ff8ad4"
      },
      // RIGHT ANGLE
      {
        ...base,
        x: player.x + 12,
        vx: dirX * bulletSpeed + 120,
        vy: dirY * bulletSpeed,
        colour: "#fffd8b"
      }
    );
  }
};

// ---------- GAME RESET ----------

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

// ---------- MAIN LOOP ----------

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
