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

  function seedStars() {
    if (!S.W || !S.H) return;
    S.stars = Array.from({ length: 90 }, () => ({
      x: rand(0, S.W),
      y: rand(0, S.H),
      size: rand(1, 3),
      speed: rand(40, 120),
      alpha: rand(0.45, 1),
      color: Math.random() < 0.5 ? "#6bf7ff" : "#f2f2ff",
    }));
  }

  // ------------------------------------------------------
  // Core gameplay runtime
  // ------------------------------------------------------
  const GameRuntime = {
    init() {
      allocateState();
      seedStars();
    },

    resetFrameState() {
      S.enemies.length = 0;
      S.bullets.length = 0;
      S.enemyBullets.length = 0;
      S.powerUps.length = 0;
      S.particles.length = 0;
      S.thrustParticles.length = 0;
      S.sidekicks.length = 0;
      S.rockets.length = 0;
      seedStars();

      S.player.x = (S.W || 800) / 2;
      S.player.y = (S.H || 600) - 80;
      S.player.bank = 0;
      S.player.invuln = 0;
    },

    updateCore(dt) {
      this.updateStars(dt);
      this.updatePlayer(dt);
      if (window.Collisions) {
        window.Collisions.updateEnemies(dt);
        window.Collisions.updatePlayerBullets(dt);
        window.Collisions.updateEnemyBullets(dt);
        window.Collisions.updatePowerUps(dt);
        window.Collisions.updateParticles(dt);
      }
    },

    drawCore(ctx) {
      if (!ctx) return;
      window.drawRunway?.(ctx);
      window.drawStars?.(ctx);
      window.drawPowerUps?.(ctx);
      window.drawEnemies?.(ctx);
      window.drawEnemyBullets?.(ctx);
      window.drawBullets?.(ctx);
      window.drawPlayer?.(ctx);
      this.drawParticles(ctx);
    },

    updateStars(dt) {
      if (!S.stars.length) return;
      const angle = (30 * Math.PI) / 180;
      const dirX = -Math.sin(angle);
      const dirY = Math.cos(angle);
      for (const star of S.stars) {
        star.x += dirX * star.speed * dt;
        star.y += dirY * star.speed * dt;
        if (star.y > S.H + 40 || star.x < -40) {
          star.x = rand(S.W * 0.6, S.W + 80);
          star.y = rand(-80, S.H * 0.3);
          star.speed = rand(40, 120);
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
