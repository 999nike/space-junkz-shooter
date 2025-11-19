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

// ---------- BULLET SYSTEM (Angle-based — fires where the ship faces) ----------

window.shoot = function shoot() {
  const S = window.GameState;
  const player = S.player;
  const spread = player.weaponLevel;
  const bulletSpeed = 520;

  // Fallback angle = straight up if we don't have a mouse angle yet
  const baseAngle =
    typeof player.angle === "number" ? player.angle : -Math.PI / 2;

function makeBullet(angleOffset, colour) {
  const a = baseAngle + angleOffset;
  return {
    x: player.x,
    y: player.y,

    // collision radius slightly bigger for sprite
    radius: 6,

    colour,

    // movement
    vx: Math.cos(a) * bulletSpeed,
    vy: Math.sin(a) * bulletSpeed,

    // --- SPRITE ANIMATION DATA ---
    frame: 0,
    frameTimer: 0,
    frameSpeed: 0.06,    // how fast it animates
    frameCount: 4        // Bullet_player.png = 4 frames wide
  };
}

  if (spread === 1) {
    // SINGLE SHOT
    S.bullets.push(makeBullet(0, "#a8ffff"));
  } else if (spread === 2) {
    // TWIN SHOT (slight angle split)
    S.bullets.push(
      makeBullet(-0.08, "#a8ffff"),
      makeBullet(0.08, "#a8ffff")
    );
  } else {
    // 3-WAY SPREAD (center + two coloured side shots)
    S.bullets.push(
      makeBullet(0, "#a8ffff"),
      makeBullet(-0.18, "#ff8ad4"),
      makeBullet(0.18, "#fffd8b")
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
