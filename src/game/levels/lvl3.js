// ======================================================
// LEVEL 3 - DRAX SYSTEM (STABLE CLEAN VERSION)
// • Mid Boss + Final Boss
// • Clean enter/exit
// • No global overrides
// • No cross-level contamination
// ======================================================

(function () {
  const S = window.GameState;

  window.Level3 = {
    active: false,
    timer: 0,
    spawnTimer: 0,
    midBossSpawned: false,
    finalBossSpawned: false,
    bg: null,
    bgLoaded: false,
    bossLogicAttached: false,

    // -----------------------------
    // ENTER
    // -----------------------------
    enter() {
      console.log("🚀 LEVEL 3 — DRAX SYSTEM");

      this.active = true;
      this.timer = 0;
      this.spawnTimer = 0;
      this.midBossSpawned = false;
      this.finalBossSpawned = false;

      // Reset shooter core
      if (window.resetGameState) resetGameState();
      S.running = true;
      S.currentLevel = 3;

      // Player
      S.player.invuln = 1.3;

      // Background
      this.bg = new Image();
      this.bg.src = "./src/game/assets/mission1_bg.png";
      this.bg.onload = () => (this.bgLoaded = true);

      // Disable map/home
      if (window.WorldMap) WorldMap.active = false;
      if (window.HomeBase) HomeBase.active = false;

      if (window.initStars) initStars();

      window.flashMsg("MISSION 2 – DRAX SYSTEM");
      setTimeout(() => window.flashMsg("ENEMY FLEET INBOUND"), 1400);

      // Attach safe boss logic once
      if (!this.bossLogicAttached) {
        this.attachBossLogic();
        this.bossLogicAttached = true;
      }
    },

    // -----------------------------
    // UPDATE
    // -----------------------------
    update(dt) {
      if (!this.active || !S.running) return;

      this.timer += dt;
      this.spawnTimer -= dt;

      // ---- PRE-BOSS WAVES ----
      if (!this.midBossSpawned && this.timer < 45) {
        if (this.spawnTimer <= 0) {
          this.spawnWave();
          this.spawnTimer = Math.random() * 0.5 + 0.35;
        }
      }

      // ---- MID BOSS ----
      if (!this.midBossSpawned && this.timer >= 45) {
        this.spawnMidBoss();
        this.midBossSpawned = true;
      }

      // ---- FINAL BOSS ----
      if (this.midBossSpawned && !this.finalBossSpawned && this.timer >= 90) {
        this.spawnFinalBoss();
        this.finalBossSpawned = true;
      }

      // Core engine
      if (window.updateGameCore) updateGameCore(dt);

      // Level completion
      for (const e of S.enemies) {
        if (e.type === "draxFinalBoss" && e.hp <= 0) {
          this.finishLevel();
        }
      }
    },

    // -----------------------------
    // DRAW
    // -----------------------------
    draw(ctx) {
      if (!this.active) return;

      if (this.bgLoaded) ctx.drawImage(this.bg, 0, 0, S.W, S.H);
      else {
        ctx.fillStyle = "#05010a";
        ctx.fillRect(0, 0, S.W, S.H);
      }

      if (window.drawRunway) drawRunway(ctx);
      if (window.drawGameCore) drawGameCore(ctx);
    },

    // -----------------------------
    // WAVES
    // -----------------------------
    spawnWave() {
      const roll = Math.random();

      if (roll < 0.40) {
        spawnEnemyType("zigzag");
        spawnEnemyType("shooter");
      } else if (roll < 0.70) {
        spawnEnemyType("tank");
        spawnEnemyType("shooter");
      } else {
        spawnEnemyType("zigzag");
        spawnEnemyType("zigzag");
        spawnEnemyType("shooter");
      }
    },

    // -----------------------------
    // MID BOSS
    // -----------------------------
    spawnMidBoss() {
      window.flashMsg("⚠ DRAX GUNSHIP DETECTED");

      S.enemies.push({
        type: "draxGunship",
        x: S.W / 2,
        y: -160,
        radius: 85,
        hp: 600,
        maxHp: 600,
        enterComplete: false,
        timer: 0,
      });
    },

    // -----------------------------
    // FINAL BOSS
    // -----------------------------
    spawnFinalBoss() {
      window.flashMsg("⚠⚠ DRAX OVERSEER ARRIVING ⚠⚠");

      S.enemies.push({
        type: "draxFinalBoss",
        x: S.W / 2,
        y: -200,
        radius: 120,
        hp: 1300,
        maxHp: 1300,
        enterComplete: false,
        timer: 0,
        laserTimer: 0,
      });
    },

    // -----------------------------
    // CLEAN BOSS LOGIC (NON-GLOBAL)
    // -----------------------------
    attachBossLogic() {
      const original = window.updateGame;

      window.updateGame = function patchedUpdateGame(dt) {
        original(dt);

        const p = S.player;

        for (const e of S.enemies) {
          // GUNSHIP
          if (e.type === "draxGunship") {
            if (!e.enterComplete) {
              e.y += 60 * dt;
              if (e.y >= 200) e.enterComplete = true;
              continue;
            }

            e.timer += dt;
            e.x = S.W / 2 + Math.sin(e.timer * 1.2) * 130;

            if (e.timer % 1.3 < 0.05) {
              for (let i = -2; i <= 2; i++) {
                S.enemyBullets.push({
                  x: e.x,
                  y: e.y + 40,
                  vx: i * 110,
                  vy: 260,
                  radius: 7,
                  colour: "#9bf3ff",
                });
              }
            }
          }

          // OVERSEER
          if (e.type === "draxFinalBoss") {
            if (!e.enterComplete) {
              e.y += 55 * dt;
              if (e.y >= 160) e.enterComplete = true;
              continue;
            }

            e.timer += dt;
            e.laserTimer += dt;

            // Follow player
            e.x += (p.x - e.x) * 0.9 * dt;

            // Spread shots
            if (e.timer % 1 < 0.05) {
              const spread = [-0.25, 0, 0.25];
              for (const a of spread) {
                S.enemyBullets.push({
                  x: e.x,
                  y: e.y + 40,
                  vx: a * 280,
                  vy: 280,
                  radius: 8,
                  colour: "#ff9977",
                });
              }
            }

            // Laser sweep
            if (e.laserTimer >= 8) {
              e.laserTimer = 0;

              S.enemyBullets.push({
                x: e.x,
                y: e.y + 80,
                vx: 0,
                vy: 500,
                radius: 20,
                colour: "#ff0044",
                beam: true,
              });

              window.flashMsg("⚡ OVERSEER LASER STRIKE");
            }
          }
        }
      };
    },

    // -----------------------------
    // FINISH
    // -----------------------------
    finishLevel() {
      if (this._finishing) return;
      this._finishing = true;

      window.flashMsg("LEVEL 3 COMPLETE!");
      this.active = false;
      S.running = false;

      if (window.unlockNextLevel) unlockNextLevel(3);

      setTimeout(() => {
        if (window.WorldMap) WorldMap.enter();
      }, 1200);
    },
  };
})();