/* ============================================================
   MISSION 3 — SHATTERED ARMADA
   Level 4 (index = 3)
   Fully rebuilt — independent logic, no intro bleed-through
   ============================================================ */

   console.log("LVL4 ARMADA FILE LOADED v1.0");

window.Level4 = (function() {
  const S = {
    active: false,
    time: 0,
    phase: 0,
    boss: null,
    turrets: [],
    escorts: [],
    explosions: [],
    damageFx: [],
    bgVideo: null
  };

  /* ============================================================
     INITIALIZE LEVEL
     ============================================================ */

  // Entry point used by the world map when you click MISSION 3
  function enter() {
    const GS = window.GameState || {};

    console.log("Entering LEVEL 4 — Mission 3 (Shattered Armada)");

    // Reset shared shooter state (enemies, bullets, timers, etc.)
    if (typeof window.resetGameState === "function") {
      window.resetGameState();
    }

    // Mark mission as running
    GS.running = true;
    GS.currentLevel = 4;

    // Spawn player near bottom centre if we have one
    if (GS.player) {
      GS.player.x = GS.W * 0.5;
      GS.player.y = GS.H - 90;
      GS.player.invuln = 1.3;
    }

    // Hide world map / home base while in the mission
    if (window.WorldMap) window.WorldMap.active = false;
    if (window.HomeBase) window.HomeBase.active = false;

    // Refresh parallax stars if available
    if (typeof window.initStars === "function") {
      window.initStars();
    }

    // Now start the internal boss state machine
    start();
  }

  function start() {
    S.active = true;
    S.time = 0;
    S.phase = 0;

    spawnBackgroundVideo();
    spawnBossPhase1();

    console.log("MISSION 3 START — SHATTERED ARMADA");

    // Make sure logic.js sees this level as active
    if (window.Level4) {
      window.Level4.active = true;
    }
  }

  function stop() {
    S.active = false;
    stopBackgroundVideo();
    clearAll();
  }

  function clearAll() {
    S.boss = null;
    S.turrets = [];
    S.escorts = [];
    S.explosions = [];
    S.damageFx = [];
  }

  /* ============================================================
     BACKGROUND VIDEO
     ============================================================ */
  function spawnBackgroundVideo() {
    const url = window.Assets.mission3Video;
    if (!url) return;

    const vid = document.createElement("video");
    vid.src = url;
    vid.autoplay = true;
    vid.loop = true;
    vid.muted = true;
    vid.style.position = "absolute";
    vid.style.top = "0px";
    vid.style.left = "0px";
    vid.style.width = "100%";
    vid.style.height = "100%";
    vid.style.zIndex = "-10";

    document.body.appendChild(vid);
    S.bgVideo = vid;
  }

  function stopBackgroundVideo() {
    if (S.bgVideo) {
      S.bgVideo.pause();
      S.bgVideo.remove();
      S.bgVideo = null;
    }
  }

  /* ============================================================
     SPAWN FUNCTIONS
     ============================================================ */

  function spawnBossPhase1() {
    S.phase = 1;

    const GS = window.GameState || {};
    const W = GS.W || (GS.canvas ? GS.canvas.width : 1280);
    const A = window.Assets || {};

    S.boss = {
      x: W * 0.5 - 200,
      y: -400,
      w: 400,
      h: 350,
      hp: 1600,
      sprite: A.m3Boss || null,
      vy: 80, // pixels per second (similar to other bosses)
      entering: true,
      state: "enter",
      damageTimer: 0
    };

    spawnTurrets();
  }

  function spawnTurrets() {
    const A = window.Assets || {};
    const frames = A.m3TurretFrames || [];

    S.turrets = [];
    for (let i = 0; i < 4; i++) {
      S.turrets.push({
        parent: "BOSS",
        offsetX: (-150 + i * 90),
        offsetY: 40,
        angle: 0,
        fireCooldown: 0,
        firingRate: 900 + (i * 300),
        sprite: frames[i] || null
      });
    }
  }

  function spawnEscortWave() {
    const GS = window.GameState || {};
    const W = GS.W || (GS.canvas ? GS.canvas.width : 1280);
    const A = window.Assets || {};

    for (let i = 0; i < 3; i++) {
      S.escorts.push({
        x: W * 0.25 + (i * 250),
        y: -200 - (i * 60),
        w: 140,
        h: 120,
        hp: 350,
        vy: 0.6,
        sprite: A.m3Escort || null,
        damageTimer: 0
      });
    }
  }

  /* ============================================================
     UPDATE LOOP
     ============================================================ */
  function update(dt) {
    if (!S.active) return;

    const GS = window.GameState || {};

    // Run shared core (player, bullets, enemies, powerups, etc.)
    if (GS.running && typeof window.updateGameCore === "function") {
      window.updateGameCore(dt);
    }

    S.time += dt;

    if (S.phase === 1) updatePhase1(dt);
    if (S.phase === 2) updatePhase2(dt);
    if (S.phase === 3) updatePhase3(dt);
    if (S.phase === 4) updatePhase4(dt);

    updateExplosions(dt);
    updateDamageFx(dt);
  }

  /* ============================================================
     PHASE 1 — Entry + Hull Fight
     ============================================================ */
  function updatePhase1(dt) {
    const b = S.boss;
    if (!b) return;

    if (b.entering) {
      // Move boss down at vy pixels per second
      b.y += b.vy * dt;
      if (b.y >= 150) {
        b.y = 150;
        b.entering = false;
      }
    }

    updateBossDamageFx(b, dt);
    updateTurrets(dt, b);

    // After ~12 seconds in phase 1, bring in the escort wave
    if (S.time > 12) {
      spawnEscortWave();
      S.phase = 2;
    }
  }

  /* ============================================================
     PHASE 2 — Escorts Join
     ============================================================ */
  function updatePhase2(dt) {
    const b = S.boss;
    if (!b) return;

    updateBossDamageFx(b, dt);
    updateTurrets(dt, b);
    updateEscorts(dt);

    if (b.hp < 1000) {
      S.phase = 3;
    }
  }

  /* ============================================================
     PHASE 3 — Core Awakens
     ============================================================ */
  function updatePhase3(dt) {
    const b = S.boss;
    if (!b) return;

    updateBossDamageFx(b, dt);
    updateTurrets(dt, b);

    if (b.hp < 500) {
      S.phase = 4;
    }
  }

  /* ============================================================
     PHASE 4 — Rage Mode
     ============================================================ */
  function updatePhase4(dt) {
    const b = S.boss;
    if (!b) return;

    updateBossDamageFx(b, dt);
    updateTurrets(dt, b, true);

    if (b.hp <= 0) {
      spawnBossDeathChain(b);
      finishMission();
    }
  }

  /* ============================================================
     ESCORT LOGIC
     ============================================================ */
  function updateEscorts(dt) {
    for (let i = S.escorts.length - 1; i >= 0; i--) {
      const e = S.escorts[i];
      e.y += e.vy;

      updateEscortDamageFx(e, dt);

      if (e.hp <= 0) {
        spawnExplosion(e.x, e.y, true);
        S.escorts.splice(i, 1);
      }
    }
  }

  /* ============================================================
     TURRET LOGIC
     ============================================================ */
  function updateTurrets(dt, boss, rage=false) {
    S.turrets.forEach(t => {
      // Rotate toward player (GameState.player)
      const GS = window.GameState || {};
      const P = GS.player;
      if (P) {
        const dx = P.x - (boss.x + t.offsetX);
        const dy = P.y - (boss.y + t.offsetY);
        t.angle = Math.atan2(dy, dx);
      }

      // Fire
      t.fireCooldown -= dt;
      if (t.fireCooldown <= 0) {
        fireTurretRocket(boss, t, rage);
        t.fireCooldown = rage ? t.firingRate * 0.55 : t.firingRate;
      }
    });
  }

  function fireTurretRocket(boss, turret, rage) {
    const px = boss.x + turret.offsetX;
    const py = boss.y + turret.offsetY;
    const spd = rage ? 1.5 : 1.0;

    window.spawnEnemyBullet(px, py, turret.angle, "m3Rocket", spd);
  }

  /* ============================================================
     DAMAGE FX
     ============================================================ */
  function updateBossDamageFx(boss, dt) {
    if (!boss) return;
    if (boss.damageTimer > 0) boss.damageTimer -= dt;

    if (boss.hp < 900 && Math.random() < 0.02) {
      S.damageFx.push({
        x: boss.x + (Math.random()*boss.w),
        y: boss.y + (Math.random()*boss.h),
        frame: 0,
        timer: 0
      });
    }
  }

  function updateEscortDamageFx(e, dt) {
    if (!e) return;
    if (e.damageTimer > 0) e.damageTimer -= dt;
  }

  function updateDamageFx(dt) {
    for (let i = S.damageFx.length - 1; i >= 0; i--) {
      const fx = S.damageFx[i];
      fx.timer += dt;

      if (fx.timer > 90) {
        S.damageFx.splice(i, 1);
      }
    }
  }

  /* ============================================================
     EXPLOSIONS (boss kill chain)
     ============================================================ */
  function spawnBossDeathChain(b) {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        spawnExplosion(
          b.x + (Math.random()*b.w),
          b.y + (Math.random()*b.h),
          false,
          2.5 // scale for mega boss
        );
      }, i * 180);
    }
  }

  function spawnExplosion(x, y, small=false, scale=1) {
    S.explosions.push({
      x, y, frame: 0,
      small, scale,
      timer: 0
    });
  }

  function updateExplosions(dt) {
    for (let i = S.explosions.length - 1; i >= 0; i--) {
      const ex = S.explosions[i];
      ex.timer += dt;
      if (ex.timer > 60) {
        ex.frame++;
        ex.timer = 0;
      }
      const A = window.Assets || {};
      const frames = A.explosionFrames || [];
      if (!frames.length || ex.frame >= frames.length) {
        S.explosions.splice(i, 1);
      }
    }
  }

  /* ============================================================
     FINISH MISSION
     ============================================================ */
  function finishMission() {
    const GS = window.GameState || {};
    setTimeout(() => {

      // Unlock next level on galaxy map
      if (typeof window.unlockNextLevel === "function") {
        window.unlockNextLevel(4);
      }

      // Stop mission 3
      GS.running = false;

      // Return to world map
      if (window.WorldMap && typeof window.WorldMap.enter === "function") {
        window.WorldMap.enter();
      }

      stop();
    }, 2200);
  }

  /* ============================================================
     DRAW
     ============================================================ */
  function draw(ctx) {
    // Only draw when this level is active
    if (!S.active) return;

    const A = window.Assets || {};

    // --- Base runway + shared core (player, normal enemies, bullets) ---
    if (typeof window.drawRunway === "function") {
      window.drawRunway(ctx);
    }

    if (typeof window.drawGameCore === "function") {
      window.drawGameCore(ctx);
    } else if (typeof window.drawGame === "function") {
      // Fallback if drawGameCore isn't available
      window.drawGame(ctx);
    }

    ctx.save();

    // --- Boss hull ---
    const b = S.boss;
    if (b) {
      if (b.sprite) {
        ctx.drawImage(b.sprite, b.x, b.y, b.w, b.h);
      } else {
        // simple fallback box so we can SEE the boss even if sprite fails
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = "#ff3355";
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.globalAlpha = 1;
      }
    }

    // --- Turrets mounted on the boss ---
    if (b && S.turrets && S.turrets.length) {
      for (const t of S.turrets) {
        const sprite = t.sprite || null;
        const cx = b.x + t.offsetX;
        const cy = b.y + t.offsetY;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t.angle || 0);

        if (sprite) {
          const w = sprite.width  || 64;
          const h = sprite.height || 64;
          ctx.drawImage(sprite, -w / 2, -h / 2, w, h);
        } else {
          ctx.fillStyle = "#ffaa00";
          ctx.fillRect(-14, -14, 28, 28);
        }

        ctx.restore();
      }
    }

    // --- Escort ships ---
    if (S.escorts && S.escorts.length) {
      for (const e of S.escorts) {
        const sprite = e.sprite || null;
        const x = e.x - e.w / 2;
        const y = e.y - e.h / 2;

        if (sprite) {
          ctx.drawImage(sprite, x, y, e.w, e.h);
        } else {
          ctx.fillStyle = "#00ffff";
          ctx.fillRect(x, y, e.w, e.h);
        }
      }
    }

    // --- Explosions (boss death chain, escort kills) ---
    const frames = A.explosionFrames || [];
    if (S.explosions && S.explosions.length) {
      for (const ex of S.explosions) {
        const size = ex.small ? 80 * (ex.scale || 0.8)
                              : 140 * (ex.scale || 1.1);
        const half = size / 2;
        const frameImg = frames[ex.frame] || null;

        if (frameImg) {
          ctx.drawImage(frameImg, ex.x - half, ex.y - half, size, size);
        } else {
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.arc(ex.x, ex.y, size / 2, 0, Math.PI * 2);
          ctx.fillStyle = "#ffdd55";
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
    }

    // --- Simple damage FX flickers on hull/escorts ---
    if (S.damageFx && S.damageFx.length) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#ffffff";
      for (const fx of S.damageFx) {
        ctx.fillRect(fx.x - 8, fx.y - 8, 16, 16);
      }
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  /* ============================================================
     EXPORT API
     ============================================================ */
  return {
    // main controls
    enter,
    start,
    stop,
    update,
    draw,

    // bridge active flag to internal state S.active
    get active() {
      return S.active;
    },
    set active(v) {
      S.active = !!v;
    }
  };

})();