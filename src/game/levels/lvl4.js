/* ============================================================
   MISSION 3 — SHATTERED ARMADA
   Level 4 (index = 3)
   Fully rebuilt — independent logic, no intro bleed-through
   ============================================================ */

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
  function start() {
    S.active = true;
    S.time = 0;
    S.phase = 0;

    spawnBackgroundVideo();
    spawnBossPhase1();

    console.log("MISSION 3 START — SHATTERED ARMADA");
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

    S.boss = {
      x: renderer.width/2 - 200,
      y: -400,
      w: 400,
      h: 350,
      hp: 1600,
      sprite: Assets.m3Boss,
      vy: 0.4,
      entering: true,
      state: "enter",
      damageTimer: 0
    };

    spawnTurrets();
  }

  function spawnTurrets() {
    S.turrets = [];
    for (let i = 0; i < 4; i++) {
      S.turrets.push({
        parent: "BOSS",
        offsetX: (-150 + i * 90),
        offsetY: 40,
        angle: 0,
        fireCooldown: 0,
        firingRate: 900 + (i * 300),
        sprite: Assets.m3TurretFrames[i]
      });
    }
  }

  function spawnEscortWave() {
    for (let i = 0; i < 3; i++) {
      S.escorts.push({
        x: (renderer.width*0.25) + (i * 250),
        y: -200 - (i * 60),
        w: 140,
        h: 120,
        hp: 350,
        vy: 0.6,
        sprite: Assets.m3Escort,
        damageTimer: 0
      });
    }
  }

  /* ============================================================
     UPDATE LOOP
     ============================================================ */
  function update(dt) {
    if (!S.active) return;

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
      b.y += b.vy;
      if (b.y >= 150) {
        b.entering = false;
      }
    }

    updateBossDamageFx(b, dt);
    updateTurrets(dt, b);

    if (S.time > 12000) {
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
      // Rotate toward player
      if (window.Player) {
        const dx = Player.x - (boss.x + t.offsetX);
        const dy = Player.y - (boss.y + t.offsetY);
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
      if (ex.frame >= Assets.explosionFrames.length) {
        S.explosions.splice(i, 1);
      }
    }
  }

  /* ============================================================
     FINISH MISSION
     ============================================================ */
  function finishMission() {
    setTimeout(() => {
      window.unlockNextLevel(4);
      window.gotoWorld();
      stop();
    }, 2200);
  }

  /* ============================================================
     DRAW
     ============================================================ */
  function draw(ctx) {
    // Only draw when this level is active
    if (!S.active) return;

    // Reuse your existing runway / core renderer so Mission 3
    // draws consistently with other missions.
    if (typeof window.drawRunway === "function") {
      window.drawRunway(ctx);
    }

    if (typeof window.drawGameCore === "function") {
      window.drawGameCore(ctx);
    } else if (typeof window.drawGame === "function") {
      // Fallback if drawGameCore isn't available
      window.drawGame(ctx);
    }
  }

  /* ============================================================
     EXPORT API
     ============================================================ */
  return {
    start,
    stop,
    update,
    draw
  };

})();