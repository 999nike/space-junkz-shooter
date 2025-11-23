// =========================================================
//  LOGIC CORE – CLEAN REBUILD
//  Stars, enemies, bosses, WizzCoin, updateGame()
// =========================================================

// ---------- STARS ----------
window.initStars = function initStars() {
  const S = window.GameState;
  S.stars = [];
  for (let i = 0; i < 80; i++) {
    S.stars.push({
      x: rand(0, S.W + 60),
      y: rand(-60, S.H),
      speed: rand(40, 120),
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

  // 30° tilt from vertical, moving top-right → bottom-left
  const angle = (30 * Math.PI) / 180;
  const dirX = -Math.sin(angle); // ~ -0.5
  const dirY =  Math.cos(angle); // ~ 0.866

  for (const s of S.stars) {
    s.x += dirX * s.speed * dt;
    s.y += dirY * s.speed * dt;

    // Respawn when off-screen (bottom-left)
    if (s.y > S.H + 40 || s.x < -40) {
      s.x = rand(S.W * 0.6, S.W + 80);
      s.y = rand(-80, S.H * 0.4);
      s.speed = rand(40, 120);
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

// ---------- EXPLOSIONS (SPRITE SHEET) ----------
window.spawnExplosion = function spawnExplosion(x, y, colour) {
  const S = window.GameState;

  // pick row based on colour tint
  let row = 0; // default yellow
  if (colour === "#6bffb2") row = 1;        // green enemies
  else if (colour === "#9bf3ff") row = 2;   // cyan bullets/explosions
  else if (colour === "#4db9ff") row = 3;   // deep blue (if needed)

  S.particles.push({
    x,
    y,
    row,
    frame: 0,
    frameCount: 4,    // 4 frames per row (Explo01.png is 4x4)
    frameSpeed: 0.08, // animation speed
    frameTimer: 0,
    done: false,
    // Big blast scale (row 2 = cyan/green row)
    scale: row === 2 ? 2.2 : 1.0
  });
};

// =========================================================
//  ENEMY SPAWNING
// =========================================================

// Random spawn (normal wave enemies)
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

// Direct spawner for scripts / bosses
window.spawnEnemyType = function spawnEnemyType(type, x, y) {
  const S = window.GameState;
  let e = null;

  // Helper to keep enemies safely on-screen
  function clampX(px, size) {
    return clamp(px ?? rand(size, S.W - size), size, S.W - size);
  }

  switch (type) {
    // ---------------- GRUNT ----------------
    case "grunt":
    case "enemyGrunt": {
      const size = rand(10, 16);
      const ex = clampX(x, size);
      const ey = y ?? -size;

      e = {
        type: "grunt",
        x: ex,
        y: ey,
        radius: size,
        speedY: rand(120, 200),
        hp: 1,
        maxHp: 1,
        hitFlash: 0,
        colour: "#6bffb2",
        score: 100,
        dropChance: 0.05
      };
      break;
    }

    // ---------------- ZIGZAG (ESCORT) ----------------
    case "zigzag":
    case "enemyZigzag": {
      const size = rand(14, 20);
      const baseX = clampX(x, size);
      const ey = y ?? -size;

      e = {
        type: "zigzag",
        x: baseX,
        y: ey,
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
      break;
    }

    // ---------------- SHOOTER ----------------
    case "shooter":
    case "enemyShooter": {
      const size = rand(16, 24);
      const ex = clampX(x, size);
      const ey = y ?? -size;

      e = {
        type: "shooter",
        x: ex,
        y: ey,
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
      break;
    }

    // ---------------- TANK ----------------
    case "tank":
    case "enemyTank": {
      const size = rand(22, 30);
      const ex = clampX(x, size);
      const ey = y ?? -size;

      e = {
        type: "tank",
        x: ex,
        y: ey,
        radius: size,
        speedY: rand(40, 70),
        hp: 3,
        maxHp: 3,
        hitFlash: 0,
        colour: "#ff6b7b",
        score: 350,
        dropChance: 0.15
      };
      break;
    }

    default:
      return;
  }

  if (e) {
    S.enemies.push(e);
  }
};

// =========================================================
//  BOSS SPAWNERS
// =========================================================

window.spawnScorpionBoss = function spawnScorpionBoss() {
  const S = window.GameState;

  const boss = {
    type: "scorpionBoss",
    x: S.W * 0.5,
    y: -220,          // enters from above screen
    radius: 80,       // big collision bodyT
    hp: 500,
    maxHp: 500,
    dropChance: 0.6,

    // entry + attack state
    enterComplete: false,
    attackTimer: 0,
    clawTimer: 0,
    laserTimer: 0,
    laserActive: false,
    laserCharging: false,
    laserX: 0
  };

  S.enemies.push(boss);
};

window.spawnGeminiBoss = function spawnGeminiBoss() {
  const S = window.GameState;

  const boss = {
    type: "geminiBoss",
    x: S.W * 0.5,
    y: -260,          // comes in from above
    radius: 110,
    hp: 700,
    maxHp: 700,
    dropChance: 0.8,

    enterComplete: false,
    phase: 1,
    attackTimer: 0,
    spawnTimer: 0,
    orbitAngle: 0
  };

  S.enemies.push(boss);
};

// =========================================================
//  BOSS LOGIC
// =========================================================

// Scorpion – hover, claws, tail laser
window.updateBossScorpion = function updateBossScorpion(e, dt) {
  const S = window.GameState;
  const player = S.player;

  // Entry phase
  if (!e.enterComplete) {
    e.y += 40 * dt;
    if (e.y >= 180) e.enterComplete = true;
    return;
  }

  // Hover
  e.attackTimer = (e.attackTimer || 0) + dt;
  e.x = S.W * 0.5 + Math.sin(e.attackTimer * 0.5) * 80;

  // ---------- CLAW BULLETS ----------
  e.clawTimer = (e.clawTimer || 0) - dt;
  if (e.clawTimer <= 0) {
    e.clawTimer = 0.7;

    const baseY = e.y + 10;
    const leftX = e.x - 40;
    const rightX = e.x + 40;

    const dy = player.y - baseY;
    const dxL = player.x - leftX;
    const dxR = player.x - rightX;

    const lenL = Math.hypot(dxL, dy) || 1;
    const lenR = Math.hypot(dxR, dy) || 1;

    const speed = 260;

    S.enemyBullets.push(
      {
        x: leftX,
        y: baseY,
        vx: (dxL / lenL) * speed,
        vy: (dy / lenL) * speed,
        radius: 6,
        colour: "#9bf3ff",
        type: "bossClaw"
      },
      {
        x: rightX,
        y: baseY,
        vx: (dxR / lenR) * speed,
        vy: (dy / lenR) * speed,
        radius: 6,
        colour: "#9bf3ff",
        type: "bossClaw"
      }
    );
  }

  // ---------- TAIL LASER ----------
  e.laserTimer = (e.laserTimer || 0) + dt;
  const cycle = 6.0;
  const t = e.laserTimer % cycle;

  e.laserCharging = false;
  e.laserActive = false;

  e.laserX = typeof e.laserX === "number" ? e.laserX : e.x;

  const bossScale = 0.30;
  const bossSprite = S.sprites.bossScorpion;
  const bossH = bossSprite ? bossSprite.height * bossScale : 160;

  // CHARGE
  if (t > 2.0 && t <= 2.8) {
    e.laserCharging = true;
    e.laserX = e.x;

  // ACTIVE
  } else if (t > 2.8 && t <= 4.2) {
    e.laserActive = true;
    const followSpeed = 6.5;
    e.laserX += (player.x - e.laserX) * followSpeed * dt;

    const topY = e.y + bossH * 0.32;
    const bottomY = S.H + 40;
    const halfWidth = 28;

    if (
      player.invuln <= 0 &&
      player.x > e.laserX - halfWidth &&
      player.x < e.laserX + halfWidth &&
      player.y > topY &&
      player.y < bottomY
    ) {
      window.damagePlayer();
      player.invuln = 1.0;
      window.spawnExplosion(player.x, player.y + 10, "#ff9977");
    }
  }
};

// Gemini – orbit + spread + rage
window.updateBossGemini = function updateBossGemini(e, dt) {
  const S = window.GameState;
  const player = S.player;

  // Entry from top
  if (!e.enterComplete) {
    e.y += 80 * dt;
    if (e.y >= S.H * 0.25) {
      e.y = S.H * 0.25;
      e.enterComplete = true;
      e.attackTimer = 0;
      e.spawnTimer = 0;
    }
    return;
  }

  // PHASE 1 – orbit around player
  if (e.phase === 1) {
    e.orbitAngle += 0.6 * dt; // speed of orbit
    const radius = 260;

    const targetX = player.x + Math.cos(e.orbitAngle) * radius;
    const targetY = player.y - 120 + Math.sin(e.orbitAngle) * 40;

    e.x += (targetX - e.x) * 3.0 * dt;
    e.y += (targetY - e.y) * 3.0 * dt;

    e.attackTimer += dt;
    if (e.attackTimer >= 1.3) {
      e.attackTimer = 0;

      // radial 5-shot spread aimed roughly downward
      const spread = [-0.35, -0.18, 0, 0.18, 0.35];
      for (const sx of spread) {
        S.enemyBullets.push({
          x: e.x,
          y: e.y + 40,
          vx: sx * 260,
          vy: 260,
          radius: 6
        });
      }
    }

    // Rage trigger
    if (e.hp <= e.maxHp * 0.45) {
      e.phase = 2;
      window.flashMsg("GEMINI – ENRAGED MODE");
      e.attackTimer = 0;
    }
  }

  // PHASE 2 – aggressive tracking + faster spreads
  else if (e.phase === 2) {
    // Chase player horizontally
    const targetX = player.x;
    e.x += (targetX - e.x) * 4.0 * dt;

    // bob vertically
    e.y = S.H * 0.22 + Math.sin(performance.now() * 0.003) * 24;

    e.attackTimer += dt;

    // fast triple spread
    if (e.attackTimer >= 0.7) {
      e.attackTimer = 0;

      const angles = [-0.25, 0, 0.25];
      for (const a of angles) {
        S.enemyBullets.push({
          x: e.x,
          y: e.y + 40,
          vx: a * 320,
          vy: 320,
          radius: 7
        });
      }
    }
  }

  // Escort spawns (both phases)
  e.spawnTimer += dt;
  if (e.spawnTimer > 3) {
    if (window.spawnEnemyType) {
      window.spawnEnemyType("enemyZigzag", e.x, e.y + 50);
    }
    e.spawnTimer = 0;
  }
};

// =========================================================
//  ENEMY DEATH + WIZZCOIN patch11
// =========================================================

window.handleEnemyDeath = function handleEnemyDeath(e) {
  const S = window.GameState;

  // SAFE SCORE GAIN
  const gainedScore = Number(e.score) || 0;
  S.score += gainedScore;
  if (S.scoreEl) S.scoreEl.textContent = S.score;

  // --- WIZZCOIN DROPS ---
  let coinGain = 0;

  // ---------- POWER-UP DROP (N5 RESTORE) ----------
if (e.dropChance && Math.random() < e.dropChance) {

  // 80% = weapon power-up
  if (Math.random() < 0.8) {
    window.spawnPowerUp(e.x, e.y);
  }

  // 20% = coin orb
  else {
    S.powerUps.push({
      x: e.x,
      y: e.y,
      radius: 10,
      speedY: 50,
      type: "coin",
      amount: 1
    });
  }
}

  // 0.1% chance from normal enemies
  if (Math.random() < 0.001) {
    coinGain = 1;
  }

  // Bosses = guaranteed 1 coin
  if (e.type === "scorpionBoss" || e.type === "geminiBoss") {
    coinGain = 1;
  }

  if (coinGain > 0) {
    S.wizzCoins += coinGain;
    if (S.coinsEl) S.coinsEl.textContent = S.wizzCoins;
    window.flashMsg("+" + coinGain + " WIZZCOIN");
  }

  // --- BOSS SPECIALS ---

  // Scorpion → Gemini chain
  if (e.type === "scorpionBoss" && !S.geminiBossSpawned) {
    S.geminiBossSpawned = true;

    window.flashMsg("BOSS DEFEATED!");

    setTimeout(() => {
      setTimeout(
        () => window.flashMsg("⚠ WARNING: GEMINI WARSHIP APPROACHING ⚠"),
        200
      );
      window.spawnGeminiBoss();
    }, 1500);

    // Power-up drop chance on boss kill
    if (Math.random() < (e.dropChance || 0)) {
      window.spawnPowerUp(e.x, e.y);
    }
  }

 // Gemini defeated → jump to world map (temp hook)
    if (e.type === "geminiBoss") {
        S.running = false;
        window.flashMsg("LEVEL COMPLETE!");

        if (window.WorldMap && window.WorldMap.enter) {
            setTimeout(() => {
                window.WorldMap.enter();
            }, 1200);
        }
    }
};

// =========================================================
//  DAMAGE PLAYER
// =========================================================

window.damagePlayer = function damagePlayer() {
  const S = window.GameState;

  S.lives--;
  if (S.livesEl) {
    S.livesEl.textContent = S.lives;
  }

  S.player.invuln = 0.5; // brief invuln
  window.flashMsg("HIT!");
};

// =========================================================
//  MAIN UPDATE – called from engine.js → updateGame(dt)
// =========================================================

window.updateGame = function updateGame(dt) {
  const S = window.GameState;

  // WORLD MAP MODE: hand off to WorldMap when active
  if (window.WorldMap && window.WorldMap.active) {
    window.WorldMap.update(dt);
    return;
  }

  if (!S.running) return;

  const player = S.player;
  // ----- Boss spawn timer -----
  if (!S.bossSpawned) {
    S.bossTimer = (S.bossTimer || 0) + dt;
    if (S.bossTimer >= 60) { // ~1 min
      window.spawnScorpionBoss();
      S.bossSpawned = true;
    }
  }

  // ----- Player movement (keyboard on top of pointer) -----
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

  // Full-screen movement with a small safe border
  player.x = clamp(player.x, 24, S.W - 24);
  player.y = clamp(player.y, 24, S.H - 24);

  if (player.invuln > 0) player.invuln -= dt;

  // Stars
  window.updateStars(dt);

  // -------- SIDEKICKS (FOLLOW + ROCKET FIRE) --------
  for (const s of S.sidekicks) {
    // Follow player
    s.x = S.player.x + s.offsetX;
    s.y = S.player.y + s.yOff;

    // Fire rockets
    s.fireTimer -= dt;
    if (s.fireTimer <= 0) {
      // Level 4 → straight rockets
      if (S.player.weaponLevel === 4) {
        S.rockets.push({
          x: s.x,
          y: s.y,
          vx: 0,
          vy: -200,
          radius: 8,
          homing: false
        });
      }

      // Level 5 → homing rockets
      if (S.player.weaponLevel >= 5) {
        S.rockets.push({
          x: s.x,
          y: s.y,
          vx: 0,
          vy: -200,
          radius: 8,
          homing: true
        });
      }

      s.fireTimer = 0.65; // balanced rate
    }
  }

  // ----- Spawn enemies -----
  S.spawnTimer -= dt;
  if (S.spawnTimer <= 0) {
    window.spawnEnemy();
    S.spawnTimer = rand(0.4, 1.0);
  }

  // ----- Auto-fire -----
  S.shootTimer -= dt;
  if (S.shootTimer <= 0) {
    window.shoot();
    S.shootTimer = 0.22;
  }

  // ----- Update enemies -----
  for (let i = S.enemies.length - 1; i >= 0; i--) {
    const e = S.enemies[i];

    // Bosses handled in their own functions
    if (e.type === "scorpionBoss") {
      window.updateBossScorpion(e, dt);
      continue;
    }
    if (e.type === "geminiBoss") {
      window.updateBossGemini(e, dt);
      continue;
    }

    // Base downward movement with 30° diagonal
    const angle = (30 * Math.PI) / 180;
    e.x += -Math.sin(angle) * e.speedY * dt;
    e.y +=  Math.cos(angle) * e.speedY * dt;

    // ZigZag path
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
      window.spawnExplosion(e.x, e.y, "#ff9977");
      window.damagePlayer();
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

    // Collision with enemies (including bosses)
    let hit = false;
    for (let j = S.enemies.length - 1; j >= 0; j--) {
      const e = S.enemies[j];
      if (circleHit(b, e)) {
        hit = true;
        S.bullets.splice(i, 1);

        e.hp -= 1;
        e.hitFlash = 0.1;

        window.spawnExplosion(b.x, b.y, e.colour);

        if (e.hp <= 0) {
          S.enemies.splice(j, 1);
          window.handleEnemyDeath(e);
        }
        break;
      }
    }

    if (hit) continue;
  }

  // ----- Enemy bullets -----
  for (let i = S.enemyBullets.length - 1; i >= 0; i--) {
    const b = S.enemyBullets[i];

    // Two styles: vx/vy (boss) and vy-only (grunts/shooters)
    b.y += b.vy ? b.vy * dt : (b.speed || 220) * dt;
    if (b.vx) b.x += b.vx * dt;

    if (b.y > S.H + 40 || b.x < -40 || b.x > S.W + 40) {
      S.enemyBullets.splice(i, 1);
      continue;
    }

    if (player.invuln <= 0 && circleHit(b, player)) {
      S.enemyBullets.splice(i, 1);
      window.spawnExplosion(player.x, player.y + 10, "#ff9977");
      window.damagePlayer();
    }
  }

  // -------- ROCKETS --------
  for (let i = S.rockets.length - 1; i >= 0; i--) {
    const r = S.rockets[i];

    // HOMING MODE
    if (r.homing) {
      let nearest = null;
      let dist = 99999;

      for (const e of S.enemies) {
        if (e.type === "scorpionBoss") continue; // don't home on scorpion if you like
        const dx = e.x - r.x;
        const dy = e.y - r.y;
        const d = dx * dx + dy * dy;
        if (d < dist) {
          dist = d;
          nearest = e;
        }
      }

      if (nearest) {
        const ang = Math.atan2(nearest.y - r.y, nearest.x - r.x);
        r.vx = Math.cos(ang) * 300;
        r.vy = Math.sin(ang) * 300;
      }
    }

    // Move
    r.x += r.vx * dt;
    r.y += r.vy * dt;

    // Off screen
    if (r.y < -40 || r.x < -40 || r.x > S.W + 40) {
      S.rockets.splice(i, 1);
      continue;
    }

    // Collision
    for (let j = S.enemies.length - 1; j >= 0; j--) {
      const e = S.enemies[j];
      if (circleHit(r, e)) {
        S.rockets.splice(i, 1);
        e.hp -= 2; // stronger than bullets
        window.spawnExplosion(r.x, r.y, e.colour);
        if (e.hp <= 0) {
          S.enemies.splice(j, 1);
          window.handleEnemyDeath(e);
        }
        break;
      }
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

    // Pickup
    if (circleHit(player, p)) {
      S.powerUps.splice(i, 1);

      // COIN PICKUP
      if (p.type === "coin") {
        S.wizzCoins += p.amount;
        if (S.coinsEl) S.coinsEl.textContent = S.wizzCoins;
        window.flashMsg("+" + p.amount + " WIZZCOIN");
        continue;
      }

      // WEAPON PICKUP
      if (player.weaponLevel < 5) {
        player.weaponLevel++;

        // LEVEL 4 → first ally ship (left)
        if (player.weaponLevel === 4) {
          S.sidekicks.push({
            offsetX: -50,
            yOff: -40,
            fireTimer: 0
          });
          window.flashMsg("ALLY SHIP DEPLOYED!");
        }

        // LEVEL 5 → second ally ship (right)
        else if (player.weaponLevel === 5) {
          S.sidekicks.push({
            offsetX: 50,
            yOff: -40,
            fireTimer: 0
          });
          window.flashMsg("ALLY SHIP 2 DEPLOYED!");
        }
      } else {
        window.flashMsg("MAX POWER");
      }
    }
  }

  // ----- Explosions (sprite animation) -----
  for (let i = S.particles.length - 1; i >= 0; i--) {
    const e = S.particles[i];

    e.frameTimer += dt;
    if (e.frameTimer >= e.frameSpeed) {
      e.frameTimer = 0;
      e.frame++;

      if (e.frame >= e.frameCount) {
        S.particles.splice(i, 1);
        continue;
      }
    }
  }

  // ---------- Lose condition ----------
  if (S.lives <= 0) {
    S.running = false;
    window.flashMsg("GAME OVER — TAP START");
  }
};
