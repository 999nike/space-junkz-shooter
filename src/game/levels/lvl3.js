// ======================================================
// LEVEL 3 - DRAX SYSTEM (FULL CUSTOM LEVEL)
// • Harder waves
// • All enemies shoot
// • Mid-Boss: DRAX GUNSHIP
// • Final Boss: DRAX OVERSEER
// • Clean exit to WorldMap
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

    // -----------------------------
    // ENTER LEVEL
    // -----------------------------
    enter() {
      console.log("🚀 Entering LEVEL 3 (DRAX SYSTEM)");

      this.active = true;
      this.timer = 0;
      this.spawnTimer = 0;
      this.midBossSpawned = false;
      this.finalBossSpawned = false;

      // Reset everything
      if (window.resetGameState) {
        window.resetGameState();
      }

      S.running = true;
      S.currentLevel = 3;
      S.player.invuln = 1.3;

      // Background
      this.bg = new Image();
      this.bg.src = "./src/game/assets/mission1_bg.png"; // reuse Drax BG
      this.bg.onload = () => (this.bgLoaded = true);

      // Turn off map/home
      if (window.WorldMap) window.WorldMap.active = false;
      if (window.HomeBase) window.HomeBase.active = false;

      if (window.initStars) window.initStars();

      window.flashMsg("MISSION 2 – DRAX SYSTEM");
      setTimeout(() => window.flashMsg("ENEMY FLEET INBOUND"), 1500);
    },

    // -----------------------------
    // UPDATE
    // -----------------------------
    update(dt) {
      if (!this.active || !S.running) return;

      this.timer += dt;
      this.spawnTimer -= dt;

      // ---- WAVES BEFORE MID-BOSS ----
      if (!this.midBossSpawned && this.timer < 45) {
        if (this.spawnTimer <= 0) {
          this.spawnWave();
          this.spawnTimer = Math.random() * 0.5 + 0.35;
        }
      }

      // ---- MID-BOSS ----
      if (!this.midBossSpawned && this.timer >= 45) {
        this.spawnMidBoss();
        this.midBossSpawned = true;
      }

      // ---- FINAL BOSS ----
      if (this.midBossSpawned && !this.finalBossSpawned && this.timer >= 90) {
        this.spawnFinalBoss();
        this.finalBossSpawned = true;
      }

      // ---- SHOOTER ENGINE ----
      if (window.updateGameCore) {
        window.updateGameCore(dt);
      }

      // ---- FINAL BOSS DEFEATED → EXIT ----
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

      if (window.drawRunway) window.drawRunway(ctx);
      if (window.drawGameCore) window.drawGameCore(ctx);
    },

    // -----------------------------
    // WAVES
    // -----------------------------
    spawnWave() {
      const roll = Math.random();

      // More aggressive than Level 2
      if (roll < 0.40) {
        window.spawnEnemyType("zigzag");
        window.spawnEnemyType("shooter");
      } else if (roll < 0.70) {
        window.spawnEnemyType("tank");
        window.spawnEnemyType("shooter");
      } else {
        window.spawnEnemyType("zigzag");
        window.spawnEnemyType("zigzag");
        window.spawnEnemyType("shooter");
      }
    },

    // -----------------------------
    // MID-BOSS
    // -----------------------------
    spawnMidBoss() {
      window.flashMsg("⚠ DRAX GUNSHIP DETECTED");

      const boss = {
        type: "draxGunship",
        x: S.W / 2,
        y: -160,
        radius: 85,
        hp: 600,
        maxHp: 600,
        enterComplete: false,
        timer: 0,
      };

      S.enemies.push(boss);

      // Custom behaviour handled in logic.js update loop via type
      this.extendBossLogic();
    },

    // -----------------------------
    // FINAL BOSS
    // -----------------------------
    spawnFinalBoss() {
      window.flashMsg("⚠⚠ DRAX OVERSEER ARRIVING ⚠⚠");

      const boss = {
        type: "draxFinalBoss",
        x: S.W / 2,
        y: -200,
        radius: 120,
        hp: 1300,
        maxHp: 1300,
        enterComplete: false,
        timer: 0,
        laserTimer: 0,
      };

      S.enemies.push(boss);

      this.extendBossLogic();
    },

    // -----------------------------
    // EXTEND GAME LOGIC FOR CUSTOM BOSSES
    // -----------------------------
    extendBossLogic() {
      const original = window.updateGame;

      if (this._extended) return; // prevent double patch
      this._extended = true;

      window.updateGame = function patchedUpdateGame(dt) {
        original(dt);

        const S = window.GameState;
        const p = S.player;

        for (const e of S.enemies) {
          // ----- MID-BOSS: GUNSHIP -----
          if (e.type === "draxGunship") {
            if (!e.enterComplete) {
              e.y += 60 * dt;
              if (e.y >= 200) e.enterComplete = true;
              continue;
            }

            e.timer += dt;

            // Hover + sway
            e.x = S.W / 2 + Math.sin(e.timer * 1.2) * 130;

            // Burst fire
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

          // ----- FINAL BOSS: OVERSEER -----
          if (e.type === "draxFinalBoss") {
            if (!e.enterComplete) {
              e.y += 55 * dt;
              if (e.y >= 160) e.enterComplete = true;
              continue;
            }

            e.timer += dt;
            e.laserTimer += dt;

            // Track player horizontally
            e.x += (p.x - e.x) * 0.9 * dt;

            // Triple spread every second
            if (e.timer % 1 < 0.05) {
              const angles = [-0.25, 0, 0.25];
              for (const a of angles) {
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

            // Laser sweep every 8 seconds
            if (e.laserTimer >= 8) {
              e.laserTimer = 0;

              // Massive beam
              const beamX = e.x;
              const topY = e.y + 80;
              const bottomY = S.H + 50;

              S.enemyBullets.push({
                x: beamX,
                y: topY,
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
    // FINISH LEVEL
    // -----------------------------
    finishLevel() {
      if (this._finishing) return;
      this._finishing = true;

      window.flashMsg("LEVEL 3 COMPLETE!");
      S.running = false;

      setTimeout(() => {
        if (window.WorldMap && window.WorldMap.enter) {
          window.WorldMap.enter();
        }
      }, 1200);
    },
  };
})();
