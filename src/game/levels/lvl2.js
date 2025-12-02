// ===========================================================
//   LEVEL 2  •  MISSION 1 – DRAX GAUNTLET (FOUR-BOSS VERSION)
//   CLEAN REBUILD – NO ENGINE HIJACKING
//   • Unique waves
//   • 4 custom bosses
//   • Uses updateGameCore (same as Level3/5)
//   • Restores engine safely on exit
// ===========================================================

(function () {
  const S = window.GameState;

  const Level2 = {
    active: false,
    bg: null,
    bgLoaded: false,

    globalTimer: 0,
    phaseTimer: 0,
    spawnTimer: 0,

    // PHASES:
    // 0 = waves
    // 1 = Boss 1 Aries
    // 2 = waves
    // 3 = Boss 2 Cancer
    // 4 = waves
    // 5 = Boss 3 Taurus
    // 6 = waves
    // 7 = Boss 4 Sagittarius
    phase: 0,

    currentBossId: null,
    _finishing: false,

    // -----------------------------------------------------------
    // ENTER LEVEL
    // -----------------------------------------------------------
    enter() {
      console.log("🚀 ENTERING LEVEL 2 — DRAX GAUNTLET");

      this.active = true;
      this.globalTimer = 0;
      this.phaseTimer = 0;
      this.spawnTimer = 0.5;
      this.phase = 0;
      this.currentBossId = null;
      this._finishing = false;

      // Mark mission for logic.js (disables intro waves)
      S.currentLevel = 2;

      // Save original engine once
      if (!S._oldUpdateGame) {
        S._oldUpdateGame = window.updateGame;
      }

      // Core shooter engine stays the same
      window.updateGameCore = function updateGameCore(dt) {
        if (S._oldUpdateGame) S._oldUpdateGame(dt);
      };

      // Main level loop
      window.updateGame = (dt) => {
        Level2.update(dt);
      };

      // Reset shooter objects but keep score/coins
      if (window.resetGameState) {
        window.resetGameState();
      } else {
        S.enemies      = [];
        S.bullets      = [];
        S.enemyBullets = [];
        S.rockets      = [];
        S.particles    = [];
        S.powerUps     = [];
      }

      S.running = true;
      S.spawnTimer = 0.5;
      S.shootTimer = 0;

      if (S.player) S.player.invuln = 1.2;

      // Background
      this.bg = new Image();
      this.bgLoaded = false;
      this.bg.src = "./src/game/assets/mission1_bg.png";
      this.bg.onload = () => (this.bgLoaded = true);

      // Disable map/home
      if (window.WorldMap) window.WorldMap.active = false;
      if (window.HomeBase) window.HomeBase.active = false;

      if (window.initStars) window.initStars();

      window.flashMsg("MISSION 1 — DRAX SYSTEM");
      setTimeout(() => window.flashMsg("ENEMY SWARM INBOUND"), 1300);
    },

    // -----------------------------------------------------------
    // EXIT LEVEL
    // -----------------------------------------------------------
    exit() {
      this.active = false;
      S.running = false;
      S.currentLevel = null;

      // Restore original engine
      if (S._oldUpdateGame) {
        window.updateGame = S._oldUpdateGame;
        S._oldUpdateGame = null;
      }

      // Default redirect
      window.updateGameCore = function (dt) {
        window.updateGame(dt);
      };

      if (window.WorldMap && window.WorldMap.enter) {
        window.WorldMap.enter();
      }
    },

    // -----------------------------------------------------------
    // SPAWN WAVES
    // -----------------------------------------------------------
    spawnWave(pattern) {
      const r = Math.random();

      if (pattern === 0) {
        // opening waves
        if (r < 0.5) {
          spawnEnemyType("zigzag");
          spawnEnemyType("zigzag");
        } else if (r < 0.8) {
          spawnEnemyType("shooter");
        } else {
          spawnEnemyType("tank");
        }
      } else if (pattern === 1) {
        // heavy mid waves
        if (r < 0.4) {
          spawnEnemyType("tank");
          spawnEnemyType("shooter");
        } else if (r < 0.7) {
          spawnEnemyType("zigzag");
          spawnEnemyType("zigzag");
          spawnEnemyType("shooter");
        } else {
          spawnEnemyType("tank");
          spawnEnemyType("tank");
        }
      } else if (pattern === 2) {
        // fast zigzag assault
        spawnEnemyType("zigzag");
        spawnEnemyType("zigzag");
        if (r < 0.6) spawnEnemyType("shooter");
      } else {
        // late-game chaos
        spawnEnemyType("tank");
        spawnEnemyType("zigzag");
        spawnEnemyType("shooter");
      }
    },

    // -----------------------------------------------------------
    // START BOSS PHASE
    // -----------------------------------------------------------
    startBossPhase(bossId) {
      const names = {
        1: "ARIES VANGUARD",
        2: "CANCER SIEGECRAFT",
        3: "TAURUS WAR BRUTE",
        4: "SAGITTARIUS STAR LANCER",
      };

      window.flashMsg("⚠ " + names[bossId] + " APPROACHING");

      // Clear non-boss enemies
      S.enemies = S.enemies.filter((e) => e.isLvl2Boss);

      const boss = {
        type: "lvl2Boss",
        isLvl2Boss: true,
        bossId,
        x: S.W / 2,
        y: -150,
        radius: 80,
        hp: 700 + bossId * 200,
        maxHp: 700 + bossId * 200,
        enterComplete: false,
        timer: 0,
      };

      S.enemies.push(boss);
      this.currentBossId = bossId;
      this.phaseTimer = 0;

      // Phase map
      this.phase = {
        1: 1,
        2: 3,
        3: 5,
        4: 7,
      }[bossId];
    },

    // -----------------------------------------------------------
    // BOSS AI
    // -----------------------------------------------------------
    updateBossAI(dt) {
      const p = S.player;

      for (const e of S.enemies) {
        if (!e.isLvl2Boss) continue;

        // ENTRY
        if (!e.enterComplete) {
          e.y += 50 * dt;
          if (e.y >= S.H * 0.23) {
            e.y = S.H * 0.23;
            e.enterComplete = true;
            e.timer = 0;
          }
          continue;
        }

        e.timer += dt;

        // ------- ARIES -------
        if (e.bossId === 1) {
          e.x = S.W * 0.5 + Math.sin(e.timer) * 110;

          if (!e._t) e._t = 0;
          e._t -= dt;
          if (e._t <= 0) {
            e._t = 1.1;
            const fan = [-0.22, 0, 0.22];
            for (const a of fan) {
              const ang = a + Math.PI / 2;
              S.enemyBullets.push({
                x: e.x,
                y: e.y + 40,
                vx: Math.cos(ang) * 260,
                vy: Math.sin(ang) * 260,
                radius: 7,
                colour: "#ffb36b",
              });
            }
          }
        }

        // ------- CANCER -------
        else if (e.bossId === 2) {
          e.x = S.W * 0.5 + Math.sin(e.timer * 1.6) * 150;

          if (!e._t) e._t = 0;
          e._t -= dt;
          if (e._t <= 0) {
            e._t = 1.4;

            const dx = p.x - e.x;
            const dy = (p.y - 40) - e.y;
            const baseAng = Math.atan2(dy, dx);
            const spread = [-0.25, -0.12, 0, 0.12, 0.25];

            for (const off of spread) {
              const ang = baseAng + off;
              S.enemyBullets.push({
                x: e.x,
                y: e.y + 30,
                vx: Math.cos(ang) * 260,
                vy: Math.sin(ang) * 260,
                radius: 6,
                colour: "#9bf3ff",
              });
            }
          }
        }

        // ------- TAURUS -------
        else if (e.bossId === 3) {
          e.x = S.W * 0.5 + Math.sin(e.timer * 0.8) * 40;

          if (!e._t) e._t = 0;
          e._t -= dt;
          if (e._t <= 0) {
            e._t = 1.8;

            const rings = 14;
            for (let i = 0; i < rings; i++) {
              const ang = (i / rings) * Math.PI * 2;
              S.enemyBullets.push({
                x: e.x,
                y: e.y + 20,
                vx: Math.cos(ang) * 210,
                vy: Math.sin(ang) * 210,
                radius: 5,
                colour: "#ff6b9b",
              });
            }
          }
        }

        // ------- SAGITTARIUS -------
        else if (e.bossId === 4) {
          e.x += (p.x - e.x) * 0.9 * dt;
          e.y = S.H * 0.22 + Math.sin(e.timer * 1.4) * 24;

          if (!e._spray) e._spray = 0;
          if (!e._mega) e._mega = 0;

          e._spray -= dt;
          e._mega -= dt;

          // spray
          if (e._spray <= 0) {
            e._spray = 0.7;
            const fan = [-0.35, -0.18, 0, 0.18, 0.35];
            for (const off of fan) {
              const ang = off + Math.PI / 2;
              S.enemyBullets.push({
                x: e.x,
                y: e.y + 36,
                vx: Math.cos(ang) * 280,
                vy: Math.sin(ang) * 280,
                radius: 6,
                colour: "#ffe66b",
              });
            }
          }

          // mega burst
          if (e._mega <= 0) {
            e._mega = 3.2;

            const dx = p.x - e.x;
            const dy = p.y - e.y;
            const baseAng = Math.atan2(dy, dx);
            const spread = [-0.4, -0.2, 0, 0.2, 0.4];

            for (const off of spread) {
              const ang = baseAng + off;
              S.enemyBullets.push({
                x: e.x,
                y: e.y + 30,
                vx: Math.cos(ang) * 340,
                vy: Math.sin(ang) * 340,
                radius: 8,
                colour: "#ff0044",
              });
            }

            window.flashMsg("⚡ SAGITTARIUS VOLLEY");
          }
        }
      }
    },

    // -----------------------------------------------------------
    // CHECK BOSS STATES
    // -----------------------------------------------------------
    checkBossStates() {
      if (!this.currentBossId) return;

      const alive = S.enemies.some(
        (e) =>
          e.isLvl2Boss &&
          e.bossId === this.currentBossId &&
          e.hp > 0
      );

      if (alive) return;

      const id = this.currentBossId;
      this.currentBossId = null;
      this.phaseTimer = 0;
      this.spawnTimer = 0.5;

      window.flashMsg("BOSS " + id + " DESTROYED");

      if (id === 1) this.phase = 2;
      else if (id === 2) this.phase = 4;
      else if (id === 3) this.phase = 6;
      else if (id === 4) this.finishLevel();
    },

    // -----------------------------------------------------------
    // FINISH LEVEL
    // -----------------------------------------------------------
    finishLevel() {
      if (this._finishing) return;
      this._finishing = true;

      window.flashMsg("MISSION 1 COMPLETE!");
      if (window.unlockNextLevel) unlockNextLevel(2);

      const self = this;
      setTimeout(() => {
        self.exit();
      }, 1200);
    },

    // -----------------------------------------------------------
    // UPDATE LOOP
    // -----------------------------------------------------------
    update(dt) {
      if (!this.active || !S.running) return;

      this.globalTimer += dt;
      this.phaseTimer += dt;
      this.spawnTimer -= dt;

      // ---- PHASE CONTROL ----
      switch (this.phase) {
        case 0:
          if (this.spawnTimer <= 0) {
            this.spawnWave(0);
            this.spawnTimer = rand(0.45, 0.9);
          }
          if (this.phaseTimer > 20) this.startBossPhase(1);
          break;

        case 1:
          break;

        case 2:
          if (this.spawnTimer <= 0) {
            this.spawnWave(1);
            this.spawnTimer = rand(0.4, 0.8);
          }
          if (this.phaseTimer > 18) this.startBossPhase(2);
          break;

        case 3:
          break;

        case 4:
          if (this.spawnTimer <= 0) {
            this.spawnWave(2);
            this.spawnTimer = rand(0.35, 0.7);
          }
          if (this.phaseTimer > 18) this.startBossPhase(3);
          break;

        case 5:
          break;

        case 6:
          if (this.spawnTimer <= 0) {
            this.spawnWave(3);
            this.spawnTimer = rand(0.35, 0.7);
          }
          if (this.phaseTimer > 16) this.startBossPhase(4);
          break;

        case 7:
          break;
      }

      // Core engine: movement/collisions/etc
      if (window.updateGameCore) updateGameCore(dt);

      // Boss logic
      this.updateBossAI(dt);

      // Boss death checks
      this.checkBossStates();
    },

    // -----------------------------------------------------------
    // DRAW
    // -----------------------------------------------------------
    draw(ctx) {
      if (!this.active) return;

      if (this.bgLoaded) {
        ctx.drawImage(this.bg, 0, 0, S.W, S.H);
      } else {
        ctx.fillStyle = "#05010a";
        ctx.fillRect(0, 0, S.W, S.H);
      }

      if (window.drawRunway) window.drawRunway(ctx);
      if (window.drawGameCore) window.drawGameCore(ctx);
    }
  };

  window.Level2 = Level2;
})();