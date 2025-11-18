// ---------- STARS ----------
window.initStars = function initStars() {
  const S = window.GameState;
  S.stars = [];
  for (let i = 0; i < 80; i++) {
    S.stars.push({
      x: Math.random() * S.W,
      y: Math.random() * S.H,
      speed: rand(20, 80),
      size: Math.random() * 2 + 0.5,
      color:
        Math.random() < 0.4
          ? "#4df0ff"
          : Math.random() < 0.7
            ? "#ff83e6"
            : "#f9f871"
    });
  }
};

window.updateStars = function updateStars(dt) {
  const S = window.GameState;
  for (const s of S.stars) {
    s.y += s.speed * dt;
    if (s.y > S.H) {
      s.y = -10;
      s.x = Math.random() * S.W;
    }
  }
};

// ---------- POWER-UPS ----------
window.spawnPowerUp = function spawnPowerUp(x, y) {
  const S = window.GameState;
  S.powerUps.push({
    x,
    y,
    radius: 10,
    speedY: 50,
    type: "weapon"
  });
};

// ---------- PARTICLES ----------
window.spawnExplosion = function spawnExplosion(x, y, colour) {
  const S = window.GameState;
  for (let i = 0; i < 14; i++) {
    S.particles.push({
      x,
      y,
      vx: rand(-120, 120),
      vy: rand(-120, 120),
      life: rand(0.3, 0.7),
      colour
    });
  }
};

// ---------- ENEMY TYPES / SPAWN ----------
window.spawnEnemy = function spawnEnemy() {
  const S = window.GameState;
  const roll = Math.random();
  let e;

  if (roll < 0.55) {
    // GRUNT – small, fast, 1 HP
    const size = rand(10, 16);
    e = {
      type: "grunt",
      x: rand(size, S.W - size),
      y: -size,
      radius: size,
      speedY: rand(120, 200),
      hp: 1,
      maxHp: 1,
      hitFlash: 0,
      colour: "#6bffb2",
      score: 100,
      dropChance: 0.05
    };
  } else if (roll < 0.85) {
    // ZIGZAG – medium, wavy path, 2 HP
    const size = rand(14, 20);
    const baseX = rand(size, S.W - size);
    e = {
      type: "zigzag",
      x: baseX,
      y: -size,
      baseX,
      radius: size,
      speedY: rand(80, 140),
      hp: 2,
      maxHp: 2,
      colour: "#ff9bf5",
      score: 200,
      dropChance: 0.08,
      phase: Math.random() * Math.PI * 2,
      waveAmp: rand(18, 32),
      waveSpeed: rand(3, 5),
      hitFlash: 0
    };
  } else if (roll < 0.95) {
    // SHOOTER – fires bullets downward
    const size = rand(16, 24);
    e = {
      type: "shooter",
      x: rand(size, S.W - size),
      y: -size,
      radius: size,
      speedY: rand(70, 110),
      hp: 2,
      maxHp: 2,
      hitFlash: 0,
      colour: "#ffd36b",
      score: 250,
      dropChance: 0.08,
      shootTimer: rand(1.0, 2.2)
    };
  } else {
    // TANK – big, slow, 3 HP, better drop
    const size = rand(22, 30);
    e = {
      type: "tank",
      x: rand(size, S.W - size),
      y: -size,
      radius: size,
      speedY: rand(40, 70),
      hp: 3,
      maxHp: 3,
      hitFlash: 0,
      colour: "#ff6b7b",
      score: 350,
      dropChance: 0.15
    };
  }

  S.enemies.push(e);
};

// ---------- ENEMY DEATH ----------
window.handleEnemyDeath = function handleEnemyDeath(e) {
  const S = window.GameState;
  S.score += e.score;
  S.scoreEl.textContent = S.score;

  if (Math.random() < e.dropChance) {
    spawnPowerUp(e.x, e.y);
  }
};

// ---------- DAMAGE ----------
window.damagePlayer = function damagePlayer() {
  const S = window.GameState;
  S.lives--;
  S.livesEl.textContent = S.lives;
  S.player.invuln = 2.0;
  window.flashMsg("HIT!");
};

// Main update function (called from engine.js)
window.updateGame = function updateGame(dt) {
  const S = window.GameState;
  if (!S.running) return;

  const player = S.player;

  // ----- Player movement -----
  let dx = 0;
  let dy = 0;
  const keys = S.keys || {};
  if (keys["arrowleft"] || keys["a"]) dx -= 1;
  if (keys["arrowright"] || keys["d"]) dx += 1;
  if (keys["arrowup"] || keys["w"]) dy -= 1;
  if (keys["arrowdown"] || keys["s"]) dy += 1;

  if (dx || dy) {
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    player.x += dx * player.speed * dt;
    player.y += dy * player.speed * dt;
  }
  player.x = clamp(player.x, 18, S.W - 18);
  player.y = clamp(player.y, S.H / 2, S.H - 20);
  if (player.invuln > 0) player.invuln -= dt;

  // Stars
  updateStars(dt);

  // Spawn enemies
  S.spawnTimer -= dt;
  if (S.spawnTimer <= 0) {
    spawnEnemy();
    S.spawnTimer = rand(0.4, 1.0);
  }

  // Auto-fire
  S.shootTimer -= dt;
  if (S.shootTimer <= 0) {
    window.shoot();
    S.shootTimer = 0.22;
  }

  // ----- Update enemies -----
  for (let i = S.enemies.length - 1; i >= 0; i--) {
    const e = S.enemies[i];

    // Base downward movement
    e.y += e.speedY * dt;

    // ZigZag
    if (e.type === "zigzag") {
      e.phase += e.waveSpeed * dt;
      e.x = e.baseX + Math.sin(e.phase) * e.waveAmp;
    }

    // Shooter bullets
    if (e.type === "shooter") {
      e.shootTimer -= dt;
      if (e.shootTimer <= 0) {
        S.enemyBullets.push({
          x: e.x,
          y: e.y + e.radius,
          vy: rand(140, 220),
          radius: 4,
          colour: "#ffae4b"
        });
        e.shootTimer = rand(1.0, 2.2);
      }
    }

    // Flash fade
    if (e.hitFlash > 0) e.hitFlash -= dt;

    // Off-screen
    if (e.y > S.H + 40) {
      S.enemies.splice(i, 1);
      continue;
    }

    // Collide with player
    if (player.invuln <= 0 && circleHit(player, e, -4)) {
      S.enemies.splice(i, 1);
      spawnExplosion(e.x, e.y, "#ff9977");
      damagePlayer();
    }
  }

  // ----- Player bullets -----
  for (let i = S.bullets.length - 1; i >= 0; i--) {
    const b = S.bullets[i];
    b.y += b.vy * dt;
    b.x += (b.vx || 0) * dt;

    // Off-screen
    if (b.y < -20 || b.x < -20 || b.x > S.W + 20) {
      S.bullets.splice(i, 1);
      continue;
    }

    // Collision with enemies (multi-HP)
    let hit = false;
    for (let j = S.enemies.length - 1; j >= 0; j--) {
      const e = S.enemies[j];
      if (circleHit(b, e)) {
        hit = true;
        S.bullets.splice(i, 1);

        e.hp -= 1;
        e.hitFlash = 0.1;

        spawnExplosion(b.x, b.y, e.colour);

        if (e.hp <= 0) {
          S.enemies.splice(j, 1);
          handleEnemyDeath(e);
        }
        break;
      }
    }

    if (hit) continue;
  }

  // ----- Enemy bullets -----
  for (let i = S.enemyBullets.length - 1; i >= 0; i--) {
    const b = S.enemyBullets[i];
    b.y += b.vy * dt;

    if (b.y > S.H + 20) {
      S.enemyBullets.splice(i, 1);
      continue;
    }

    if (player.invuln <= 0 && circleHit(b, player)) {
      S.enemyBullets.splice(i, 1);
      spawnExplosion(player.x, player.y + 10, "#ff9977");
      damagePlayer();
    }
  }

  // ----- Power-ups -----
  for (let i = S.powerUps.length - 1; i >= 0; i--) {
    const p = S.powerUps[i];
    p.y += p.speedY * dt;

    if (p.y > S.H + 20) {
      S.powerUps.splice(i, 1);
      continue;
    }

    if (circleHit(player, p)) {
      S.powerUps.splice(i, 1);
      if (player.weaponLevel < 3) {
        player.weaponLevel++;
        window.flashMsg("WEAPON UPGRADE!");
      } else {
        window.flashMsg("MAX POWER");
      }
    }
  }

  // ----- Particles -----
  for (let i = S.particles.length - 1; i >= 0; i--) {
    const p = S.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) S.particles.splice(i, 1);
  }

  // Lose condition
  if (S.lives <= 0) {
    S.running = false;
    window.flashMsg("GAME OVER — TAP START");
  }
};
