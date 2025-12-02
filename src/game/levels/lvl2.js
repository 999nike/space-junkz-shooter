// ===========================================================
//   LEVEL 2  •  MISSION 1 – DRAX GAUNTLET (FOUR-BOSS VERSION)
//   • Independent from intro level
//   • Custom waves + 4 mini-boss phases
//   • Clean exit back to WorldMap on final boss kill
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

    // 0 = opening waves
    // 1 = Boss 1 (Aries style)
    // 2 = waves
    // 3 = Boss 2 (Cancer style)
    // 4 = waves
    // 5 = Boss 3 (Taurus style)
    // 6 = waves
    // 7 = Boss 4 (Sagittarius style)
    phase: 0,

    currentBossId: null,
    _finishing: false,

    // -----------------------------
    // ENTER LEVEL
    // -----------------------------
    enter() {
      console.log("🚀 Entering LEVEL 2 (Mission 1 – Drax Gauntlet)");

      this.active = true;
      this.globalTimer = 0;
      this.phaseTimer = 0;
      this.spawnTimer = 0.5;
      this.phase = 0;
      this.currentBossId = null;
      this._finishing = false;

      // Reset core shooter state but KEEP score/coins
      if (typeof window.resetGameState === "function") {
        window.resetGameState();
      } else {
        // minimal safety fallback
        S.enemies = [];
        S.bullets = [];
        S.enemyBullets = [];
        S.rockets = [];
        S.particles = [];
        S.powerUps = [];
      }

      S.running = true;
      S.currentLevel = 2;

      if (S.player) {
        S.player.invuln = 1.2;
      }

      // Level-specific background
      this.bg = new Image();
      this.bgLoaded = false;
      this.bg.src = "./src/game/assets/mission1_bg.png";
      this.bg.onload = () => (this.bgLoaded = true);

      // Switch off other modes
      if (window.WorldMap) window.WorldMap.active = false;
      if (window.HomeBase) window.HomeBase.active = false;

      if (typeof window.initStars === "function") window.initStars();

      if (window.flashMsg) {
        window.flashMsg("MISSION 1 – DRAX SYSTEM");
        setTimeout(() => window.flashMsg("ENEMY SWARM INBOUND"), 1400);
      }
    },

    // -----------------------------
    // EXIT LEVEL → BACK TO MAP
    // -----------------------------
    exit() {
      this.active = false;
      S.running = false;

      if (window.WorldMap && typeof window.WorldMap.enter === "function") {
        window.WorldMap.enter();
      }
    },

    // =======================
    //   WAVE SPAWNER
    // =======================
    spawnWave(patternId) {
      const r = Math.random();

      if (patternId === 0) {
        // Opening light waves
        if (r < 0.5) {
          window.spawnEnemyType("zigzag");
          window.spawnEnemyType("zigzag");
        } else if (r < 0.8) {
          window.spawnEnemyType("shooter");
        } else {
          window.spawnEnemyType("tank");
        }
      } else if (patternId === 1) {
        // Heavier shooter/tank mix
        if (r < 0.35) {
          window.spawnEnemyType("tank");
          window.spawnEnemyType("shooter");
        } else if (r < 0.7) {
          window.spawnEnemyType("zigzag");
          window.spawnEnemyType("zigzag");
          window.spawnEnemyType("shooter");
        } else {
          window.spawnEnemyType("tank");
          window.spawnEnemyType("tank");
        }
      } else if (patternId === 2) {
        // Fast zigzag assault
        window.spawnEnemyType("zigzag");
        window.spawnEnemyType("zigzag");
        if (r < 0.6) window.spawnEnemyType("shooter");
      } else {
        // Late chaos mix
        window.spawnEnemyType("tank");
        window.spawnEnemyType("zigzag");
        window.spawnEnemyType("shooter");
      }

      // Rare shield part drops
      if (Math.random() < 0.0015) this.dropShieldPart("shieldA");
      if (Math.random() < 0.0015) this.dropShieldPart("shieldB");
    },

    dropShieldPart(type) {
      const px = rand(40, S.W - 40);
      S.powerUps.push({
        x: px,
        y: -24,
        radius: 20,
        speedY: 40,
        type
      });

      if (window.flashMsg) {
        window.flashMsg(
          type === "shieldA"
            ? "⚡ SHIELD PART A DETECTED"
            : "⚡ SHIELD PART B DETECTED"
        );
      }
    },

    // ============================
    //       BOSS PHASE START
    // ============================
    startBossPhase(bossId) {
      if (this._finishing) return;

      // Clear remaining normal enemies
      S.enemies = S.enemies.filter((e) => e.isLvl2Boss);

      const boss = {
        // Use existing TANK sprite so it renders without touching renderer
        type: "tank",
        isLvl2Boss: true,
        bossId,
        x: S.W / 2,
        y: -160,
        radius: 80,
        hp: 700 + bossId * 180,
        maxHp: 700 + bossId * 180,
        enterComplete: false,
        timer: 0,
        speedY: 0 // important so global homing AI doesn't NaN
      };

      S.enemies.push(boss);
      this.currentBossId = bossId;
      this.phaseTimer = 0;

      const names = {
        1: "ARIES VANGUARD",
        2: "CANCER SIEGECRAFT",
        3: "TAURUS WAR BRUTE",
        4: "SAGITTARIUS STAR LANCER"
      };

      if (window.flashMsg) {
        window.flashMsg(
          "⚠ " +
            (names[bossId] || "ELITE DREADNOUGHT") +
            " INBOUND ⚠"
        );
      }

      // Phase index mapping for bosses
      if (bossId === 1) this.phase = 1;
      else if (bossId === 2) this.phase = 3;
      else if (bossId === 3) this.phase = 5;
      else if (bossId === 4) this.phase = 7;
    },

    // ============================
    //       BOSS AI PATTERNS
    // ============================
    updateBosses(dt) {
      if (!this.active) return;
      const player = S.player;

      for (const e of S.enemies) {
        if (!e.isLvl2Boss) continue;

        // Entry descent
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

        // Boss 1 – ARIES: wide sine sweep + triple spread
        if (e.bossId === 1) {
          e.x = S.W * 0.5 + Math.sin(e.timer * 1.0) * 110;

          if (!e._shotTimer) e._shotTimer = 0;
          e._shotTimer -= dt;
          if (e._shotTimer <= 0) {
            e._shotTimer = 1.1;

            const angles = [-0.22, 0, 0.22];
            for (const a of angles) {
              const ang = a + Math.PI / 2;
              S.enemyBullets.push({
                x: e.x,
                y: e.y + 40,
                vx: Math.cos(ang) * 260,
                vy: Math.sin(ang) * 260,
                radius: 7,
                colour: "#ffb36b"
              });
            }
          }
        }

        // Boss 2 – CANCER: strafing gunship + aimed bursts
        else if (e.bossId === 2) {
          e.x = S.W * 0.5 + Math.sin(e.timer * 1.6) * 150;

          if (!e._burstTimer) e._burstTimer = 0;
          e._burstTimer -= dt;
          if (e._burstTimer <= 0) {
            e._burstTimer = 1.4;

            const dx = player.x - e.x;
            const dy = (player.y - 40) - e.y;
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
                colour: "#9bf3ff"
              });
            }
          }
        }

        // Boss 3 – TAURUS: heavy center + radial rings
        else if (e.bossId === 3) {
          e.x = S.W * 0.5 + Math.sin(e.timer * 0.8) * 40;

          if (!e._ringTimer) e._ringTimer = 0;
          e._ringTimer -= dt;
          if (e._ringTimer <= 0) {
            e._ringTimer = 1.8;

            const rings = 14;
            for (let i = 0; i < rings; i++) {
              const ang = (i / rings) * Math.PI * 2;
              S.enemyBullets.push({
                x: e.x,
                y: e.y + 20,
                vx: Math.cos(ang) * 210,
                vy: Math.sin(ang) * 210,
                radius: 5,
                colour: "#ff6b9b"
              });
            }
          }
        }

        // Boss 4 – SAGITTARIUS: tracking + bullet-hell lite
        else if (e.bossId === 4) {
          e.x += (player.x - e.x) * 0.9 * dt;
          e.y = S.H * 0.22 + Math.sin(e.timer * 1.4) * 24;

          if (!e._sprayTimer) e._sprayTimer = 0;
          if (!e._megaTimer) e._megaTimer = 0;

          e._sprayTimer -= dt;
          e._megaTimer -= dt;

          // Fast side sprays
          if (e._sprayTimer <= 0) {
            e._sprayTimer = 0.7;

            const fan = [-0.35, -0.18, 0, 0.18, 0.35];
            for (const off of fan) {
              const ang = off + Math.PI / 2;
              S.enemyBullets.push({
                x: e.x,
                y: e.y + 36,
                vx: Math.cos(ang) * 280,
                vy: Math.sin(ang) * 280,
                radius: 6,
                colour: "#ffe66b"
              });
            }
          }

          // Occasional aimed mega-burst
          if (e._megaTimer <= 0) {
            e._megaTimer = 3.5;

            const dx = player.x - e.x;
            const dy = player.y - e.y;
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
                colour: "#ff0044"
              });
            }

            if (window.flashMsg) {
              window.flashMsg("⚡ SAGITTARIUS VOLLEY");
            }
          }
        }
      }
    },

    // ============================
    //     BOSS DEATH HANDLING
    // ============================
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

      if (window.flashMsg) {
        window.flashMsg("BOSS " + id + " DESTROYED");
      }

      if (id === 1)      this.phase = 2; // waves between boss1 & boss2
      else if (id === 2) this.phase = 4;
      else if (id === 3) this.phase = 6;
      else if (id === 4) this.finishLevel();
    },

    // ============================
    //       FINISH LEVEL
    // ============================
    finishLevel() {
      if (this._finishing) return;
      this._finishing = true;

      if (window.flashMsg) {
        window.flashMsg("MISSION 1 COMPLETE!");
      }

      if (typeof window.unlockNextLevel === "function") {
        // Unlock Level 3 node on the world map
        window.unlockNextLevel(2);
      }

      S.running = false;
      this.active = false;

      setTimeout(() => {
        if (window.WorldMap && typeof window.WorldMap.enter === "function") {
          window.WorldMap.enter();
        }
      }, 1200);
    },

    // ============================
    //          UPDATE
    // ============================
    update(dt) {
      if (!this.active || !S.running) return;

      this.globalTimer += dt;
      this.phaseTimer += dt;
      this.spawnTimer -= dt;

      // ---------- PHASE CONTROL ----------
      switch (this.phase) {
        case 0: // Opening waves
          if (this.spawnTimer <= 0) {
            this.spawnWave(0);
            this.spawnTimer = rand(0.45, 0.9);
          }
          if (this.phaseTimer > 20) {
            this.startBossPhase(1);
          }
          break;

        case 1: // Boss 1
          break;

        case 2: // Between Boss 1 and 2
          if (this.spawnTimer <= 0) {
            this.spawnWave(1);
            this.spawnTimer = rand(0.4, 0.8);
          }
          if (this.phaseTimer > 18) {
            this.startBossPhase(2);
          }
          break;

        case 3: // Boss 2
          break;

        case 4: // Between Boss 2 and 3
          if (this.spawnTimer <= 0) {
            this.spawnWave(2);
            this.spawnTimer = rand(0.35, 0.7);
          }
          if (this.phaseTimer > 18) {
            this.startBossPhase(3);
          }
          break;

        case 5: // Boss 3
          break;

        case 6: // Final build-up before Boss 4
          if (this.spawnTimer <= 0) {
            this.spawnWave(3);
            this.spawnTimer = rand(0.35, 0.7);
          }
          if (this.phaseTimer > 16) {
            this.startBossPhase(4);
          }
          break;

        case 7: // Boss 4
          break;

        default:
          break;
      }

      // Core shooter engine (movement/collisions)
      if (typeof window.updateGameCore === "function") {
        window.updateGameCore(dt);
      } else if (typeof window.updateGame === "function") {
        window.updateGame(dt);
      }

      // Boss AI runs AFTER core so our movement & bullets win
      this.updateBosses(dt);
      this.checkBossStates();
    },

    // ============================
    //           DRAW
    // ============================
    draw(ctx) {
      if (!this.active) return;

      // Level-specific background behind nebula runway
      if (this.bgLoaded && this.bg) {
        ctx.drawImage(this.bg, 0, 0, S.W, S.H);
      } else {
        ctx.fillStyle = "#05010a";
        ctx.fillRect(0, 0, S.W, S.H);
      }

      if (typeof window.drawRunway === "function") {
        window.drawRunway(ctx);
      }

      if (typeof window.drawGameCore === "function") {
        window.drawGameCore(ctx);
      } else if (typeof window.drawGame === "function") {
        window.drawGame(ctx);
      }
    }
  };

  // Expose globally
  window.Level2 = Level2;
})();