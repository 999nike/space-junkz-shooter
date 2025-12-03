// Core gameplay utilities and runtime loop used by EngineCore/LevelManager
(function () {
  const S = (window.GameState = window.GameState || {});

  // ------------------------------------------------------
  // Utility helpers
  // ------------------------------------------------------
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function circleHit(a, b, pad = 0) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = Math.hypot(dx, dy);
    return dist <= (a.radius || 0) + (b.radius || 0) + pad;
  }

  window.clamp = clamp;
  window.rand = rand;
  window.circleHit = circleHit;

  // ------------------------------------------------------
  // State bootstrap
  // ------------------------------------------------------
  function allocateState() {
    S.canvas = document.getElementById("game");
    S.ctx = S.canvas ? S.canvas.getContext("2d") : null;
    if (S.canvas) {
      S.canvas.width = window.innerWidth;
      S.canvas.height = window.innerHeight;
      S.W = S.canvas.width;
      S.H = S.canvas.height;
    }

    S.enemies = [];
    S.bullets = [];
    S.enemyBullets = [];
    S.powerUps = [];
    S.particles = [];
    S.thrustParticles = [];
    S.sidekicks = [];
    S.rockets = [];
    S.stars = [];

    S.keys = S.keys || {};
    S.player = Object.assign(
      {
        x: (S.W || 800) / 2,
        y: (S.H || 600) - 80,
        angle: -Math.PI / 2,
        speed: 260,
        bank: 0,
        weaponLevel: 1,
        invuln: 0,
      },
      S.player || {}
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

  // LEVEL 2 – HYDRA DRAX BOSS (MISSION 1)
  // On kill: unlock Level 3 and return to starmap.
  if (e.type === "mission1Boss") {
    window.flashMsg("MISSION 1 COMPLETE!");

    // Unlock lvl3 on world map
    if (window.unlockNextLevel) {
      window.unlockNextLevel(2); // 2 → unlock lvl3
    }

    // Stop shooter loop and go back to map
    S.running = false;
    if (window.WorldMap && window.WorldMap.enter) {
      setTimeout(() => {
        window.WorldMap.enter();
      }, 1200);
    }
  }

// ======================================================
  //   INTRO GEMINI BOSS → UNLOCK DRAX SYSTEM (lvl2)
  // ======================================================
  if (e.type === "geminiBoss") {

    window.flashMsg("LEVEL 1 COMPLETE!");

    // Unlock the lvl2 map node (DRAX SYSTEM)
    if (window.unlockNextLevel) {
      window.unlockNextLevel(1);   // 1 → unlock lvl2
    }

    // Hand control to the starmap instead of restarting intro
    if (window.WorldMap && window.WorldMap.enter) {
      setTimeout(() => {
        // Reactivate the update loop so WorldMap.update runs
        S.running = true;
        window.WorldMap.enter();
      }, 1200);
    } else {
      // Fallback: keep shooter paused if map is missing
      S.running = false;
    }
  }
};

// =========================================================
//  DAMAGE PLAYER (SHIELD → HULL)
// =========================================================

window.damagePlayer = function damagePlayer() {
  const S = window.GameState;

  // DEV GOD MODE – ignore all damage
  if (S.devGodMode) {
    if (window.flashMsg) window.flashMsg("GOD MODE – NO DAMAGE");
    return;
  }

  // Shield takes the hit first
  if (S.shield && S.shield > 0) {
    S.shield = Math.max(0, S.shield - 1);
    S.player.invuln = 0.5; // brief invuln
    window.flashMsg("SHIELD HIT!");
    return;
  }

  // Then hull (lives)
  S.lives = (S.lives || 0) - 1;
  if (S.livesEl) {
    S.livesEl.textContent = S.lives;
  }

  S.player.invuln = 0.5; // brief invuln
  window.flashMsg("HIT!");
};

// ===========================================================
//  LEVEL 2 CORE REDIRECTORS
// ===========================================================
window.updateGameCore = function updateGameCore(dt) {
    window.updateGame(dt);
};

if (!window.drawGameCore) {
  window.drawGameCore = function drawGameCore(ctx) {
      window.drawGame(ctx);
  };
}

// =========================================================
//  MAIN UPDATE – called from engine.js → updateGame(dt)
// =========================================================

window.updateGame = function updateGame(dt) {
  const S = window.GameState;

  // HOME BASE MODE – Alien–Egyptian chamber
  if (window.HomeBase && window.HomeBase.active) {
    window.HomeBase.update(dt);
    return;
  }

  // WORLD MAP MODE: hand off to WorldMap when active
  if (window.WorldMap && window.WorldMap.active) {
    window.WorldMap.update(dt);
    return;
  }

  if (!S.running) return;

  const player = S.player;
  // ----- Boss spawn timer (intro only) -----
  if (!S.currentLevel || S.currentLevel === 1) {
    if (!S.bossSpawned) {
      S.bossTimer = (S.bossTimer || 0) + dt;
      if (S.bossTimer >= 60) { // ~1 min
        window.spawnScorpionBoss();
        S.bossSpawned = true;
      }
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

  // Mobile analog movement
  if (S.moveX || S.moveY) {
    player.x += (S.moveX || 0) * player.speed * dt;
    player.y += (S.moveY || 0) * player.speed * dt;
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

  // ----- Spawn enemies (intro only; levels handle their own waves) -----
  if (!S.currentLevel || S.currentLevel === 1) {
    S.spawnTimer -= dt;
    if (S.spawnTimer <= 0) {
      window.spawnEnemy();
      S.spawnTimer = rand(0.4, 1.0);
    }
  }

  // ----- HOLD-TO-FIRE (shared for desktop + mobile) -----
  S.shootTimer -= dt;
  if (S.firing && S.shootTimer <= 0) {
    window.shoot();
    S.shootTimer = 0.22; // fire rate
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

        // ==========================================================
        //   NEW ENEMY AI – TRACK / CHASE / ATTACK THE PLAYER
        // ============================================================
        const px = S.player.x;
        const py = S.player.y;

        // Distance vector to player
        const dx = px - e.x;
        const dy = py - e.y;

        // Normalised (homing) direction
        const len = Math.hypot(dx, dy) || 1;
        const nx = dx / len;
        const ny = dy / len;

        // Base chase speed
        const chaseSpeed = e.speedY * 1.1;

        // HOMING MOVEMENT
        e.x += nx * chaseSpeed * dt;
        e.y += ny * chaseSpeed * dt;

        // ------- ZIGZAG VARIANT -------
        if (e.type === "zigzag") {
            e.phase += e.waveSpeed * dt;
            e.x += Math.sin(e.phase) * e.waveAmp * dt;
        }

        // ------- ALL ENEMIES SHOOT -------
e.shootTimer -= dt;
if (e.shootTimer <= 0) {

    S.enemyBullets.push({
        x: e.x,
        y: e.y + e.radius,
        vy: 260,             // fast downward
        vx: 0,               // straight
        radius: 3,           // small bullet
        colour: "#61d6ff"    // cyan-blue
    });

    e.shootTimer = 2.0;      // shoot every 2 seconds
}

        // Reset when off screen
        if (e.y > S.H + 120) {
            e.x = rand(40, S.W - 40);
            e.y = rand(-180, -40);
            e.speedY = rand(40, 90);
            e.hp = rand(1, 3);
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
          
          // === GUARANTEED SHIELD PART SYSTEM ===
const GS = window.GameState;
GS.killsSinceShieldDrop = (GS.killsSinceShieldDrop || 0) + 1;

if (GS.killsSinceShieldDrop >= 50) {

    // 50% chance A or B
    const partType = Math.random() < 0.5 ? "shieldA" : "shieldB";

    S.powerUps.push({
        x: e.x,
        y: e.y,
        radius: 20,
        speedY: 50,
        type: partType
    });

    window.flashMsg("⚡ SHIELD PART DETECTED");

    GS.killsSinceShieldDrop = 0; // reset counter
}
        }
      }
    },

    updatePlayer(dt) {
      const p = S.player;
      const k = S.keys || {};
      const accel = S.speedBoost || 1;

      const up = k["w"] || k["arrowup"];
      const down = k["s"] || k["arrowdown"];
      const left = k["a"] || k["arrowleft"];
      const right = k["d"] || k["arrowright"];

      if (up) p.y -= p.speed * accel * dt;
      if (down) p.y += p.speed * accel * dt;
      if (left) p.x -= p.speed * accel * dt;
      if (right) p.x += p.speed * accel * dt;

      p.x = clamp(p.x, 30, (S.W || 800) - 30);
      p.y = clamp(p.y, 30, (S.H || 600) - 30);

      if (p.invuln > 0) p.invuln -= dt;

      if (S.firing || k[" "] || k["space"] || k["spacebar"]) {
        this.handleShooting(dt);
      } else {
        S.shootCooldown = Math.max(0, (S.shootCooldown || 0) - dt);
      }
    },

    handleShooting(dt) {
      S.shootCooldown = (S.shootCooldown || 0) - dt;
      if (S.shootCooldown > 0) return;
      const spread = S.player.weaponLevel;
      const bulletSpeed = 520;
      const angle = typeof S.player.angle === "number" ? S.player.angle : -Math.PI / 2;

      const spawnBullet = (offset, colour) => {
        const a = angle + offset;
        S.bullets.push({
          x: S.player.x,
          y: S.player.y,
          radius: 6,
          colour,
          vx: Math.cos(a) * bulletSpeed,
          vy: Math.sin(a) * bulletSpeed,
        });
      };

      if (spread === 1) {
        spawnBullet(0, "#a8ffff");
      } else if (spread === 2) {
        spawnBullet(-0.08, "#a8ffff");
        spawnBullet(0.08, "#a8ffff");
      } else {
        spawnBullet(0, "#a8ffff");
        spawnBullet(-0.18, "#ff8ad4");
        spawnBullet(0.18, "#fffd8b");
      }

      S.shootCooldown = 0.16;
    },

    drawParticles(ctx) {
      if (!S.particles) return;
      for (const p of S.particles) {
        ctx.save();
        ctx.globalAlpha = clamp(1 - p.life, 0, 1);
        ctx.fillStyle = p.colour || "#fff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size || 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },
  };

  // ------------------------------------------------------
  // Hooks for collisions + levels
  // ------------------------------------------------------
  window.GameRuntime = GameRuntime;

  window.spawnPowerUp = function spawnPowerUp(x, y) {
    S.powerUps.push({ x, y, radius: 10, speedY: 50, type: "weapon" });
  };

  window.spawnExplosion = function spawnExplosion(x, y, colour = "#fff") {
    S.particles.push({ x, y, life: 0, size: 10, colour, decay: 0.9 });
  };

  window.handleEnemyDeath = function handleEnemyDeath(enemy) {
    S.score = (S.score || 0) + (enemy.score || 100);
    if (Math.random() < (enemy.dropChance || 0)) {
      window.spawnPowerUp(enemy.x, enemy.y);
    }
  };

  window.damagePlayer = function damagePlayer(amount = 10) {
    S.lives = (S.lives ?? 100) - amount;
    S.player.invuln = 1.2;
    if (S.livesEl) S.livesEl.textContent = S.lives;
    if (S.lives <= 0) {
      S.running = false;
      if (window.EngineCore) {
        window.EngineCore.setMode("world");
      }
    }
  };

  window.finishLevel = function finishLevel() {
    if (window.LevelManager) {
      window.LevelManager.finishLevel();
    }
  };
})();
