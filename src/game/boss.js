/* ----------------------------------------------------------
   BOSS SYSTEM – UNIFIED (PATCH 7)
   Handles ALL boss spawning + logic in ONE place.
---------------------------------------------------------- */

window.BossSystem = (function () {

  const S = window.GameState;

  /* -------------------------------------------------------
     SPRITE GETTERS
  -------------------------------------------------------- */
  function getSprites() {
    return {
      scorpion: S.sprites.bossScorpion,
      gemini:   S.sprites.bossGemini
    };
  }

  /* -------------------------------------------------------
     SPAWN: SCORPION
  -------------------------------------------------------- */
  function spawnScorpion() {
    const boss = {
      type: "scorpionBoss",
      x: S.W * 0.5,
      y: -240,
      hp: 500,
      maxHp: 500,
      radius: 90,
      enter: false,
      timer: 0,
      clawTimer: 0,
      laserTimer: 0,
      laserActive: false,
      laserX: 0
    };

    S.enemies.push(boss);
    S.bossActive = true;

    window.flashMsg("⚠ WARNING — SCORPION APPROACHING ⚠");
  }

  /* -------------------------------------------------------
     UPDATE: SCORPION
  -------------------------------------------------------- */
  function updateScorpion(e, dt) {
    const player = S.player;

    if (!e.enter) {
      e.y += 60 * dt;
      if (e.y >= 180) e.enter = true;
      return;
    }

    // Hover
    e.timer += dt;
    e.x = S.W * 0.5 + Math.sin(e.timer * 0.5) * 90;

    // CLAW bullets
    e.clawTimer -= dt;
    if (e.clawTimer <= 0) {
      e.clawTimer = 0.8;

      const fire = (offX) => {
        const dx = (player.x - (e.x + offX));
        const dy = (player.y - (e.y + 50));
        const len = Math.hypot(dx, dy) || 1;

        S.enemyBullets.push({
          x: e.x + offX,
          y: e.y + 50,
          vx: (dx / len) * 260,
          vy: (dy / len) * 260,
          radius: 6
        });
      };

      fire(-40);
      fire(+40);
    }

    // LASER cycle
    e.laserTimer += dt;
    const cycle = e.laserTimer % 6;

    if (cycle > 2.0 && cycle <= 2.8) {
      e.laserActive = false;
      e.laserX = e.x;
    }
    else if (cycle > 2.8 && cycle <= 4.0) {
      e.laserActive = true;
      e.laserX += (player.x - e.laserX) * 8 * dt;
    }
  }

  /* -------------------------------------------------------
     ON SCORPION DEATH → GEMINI
  -------------------------------------------------------- */
  function onScorpionDeath() {
    window.flashMsg("BOSS DEFEATED!");
    setTimeout(() => {
      spawnGemini();
    }, 2000);
  }

  /* -------------------------------------------------------
     SPAWN: GEMINI
  -------------------------------------------------------- */
  function spawnGemini() {
    const boss = {
      type: "geminiBoss",
      x: S.W * 0.5,
      y: -300,
      hp: 700,
      maxHp: 700,
      radius: 110,
      phase: 1,
      enter: false,
      attackTimer: 0,
      spawnTimer: 0
    };

    S.enemies.push(boss);
    S.bossActive = true;

    window.flashMsg("⚠ WARNING — GEMINI WARSHIP INBOUND ⚠");
  }

  /* -------------------------------------------------------
     UPDATE: GEMINI
  -------------------------------------------------------- */
  function updateGemini(e, dt) {

    if (!e.enter) {
      e.y += 90 * dt;
      if (e.y >= 180) e.enter = true;
      return;
    }

    // Hover oscillation
    e.x += Math.sin(performance.now() * 0.001) * 120 * dt;

    e.attackTimer += dt;

    // PHASE 1 — Dual Cannon
    if (e.phase === 1 && e.attackTimer > 1.2) {
      for (const dx of [-0.25, 0.25]) {
        S.enemyBullets.push({
          x: e.x + dx * 40,
          y: e.y + 50,
          vx: dx * 120,
          vy: 220,
          radius: 6
        });
      }
      e.attackTimer = 0;
    }

    // Switch phase
    if (e.phase === 1 && e.hp < e.maxHp * 0.5) {
      e.phase = 2;
      window.flashMsg("GEMINI — ENRAGED MODE");
    }

    // PHASE 2 — Spread Fire
    if (e.phase === 2 && e.attackTimer > 0.5) {
      for (const dx of [-0.4,-0.15,0,0.15,0.4]) {
        S.enemyBullets.push({
          x: e.x,
          y: e.y + 50,
          vx: dx * 180,
          vy: 260,
          radius: 6
        });
      }
      e.attackTimer = 0;
    }

    // Escort spawns
    e.spawnTimer += dt;
    if (e.spawnTimer > 3) {
      if (window.spawnEnemyType) {
        window.spawnEnemyType("enemyZigzag", e.x, e.y + 50);
      }
      e.spawnTimer = 0;
    }
  }

  /* -------------------------------------------------------
     PUBLIC API
  -------------------------------------------------------- */
  return {
    spawnScorpion,
    updateScorpion,
    onScorpionDeath,
    spawnGemini,
    updateGemini
  };

})();
