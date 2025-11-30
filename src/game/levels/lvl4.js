// ======================================================
// LEVEL 4 - TITAN FORGE
// • Heavy mech enemies
// • Missile volleys & beam turrets
// • Mid-Boss: FORGE GUNSHIP
// • Final Boss: FORGE TITAN
// • Clean exit back to WorldMap when boss dies
// ======================================================

(function () {
  const S = window.GameState;

  const Level4 = {
    active: false,
    timer: 0,
    spawnTimer: 0,
    midBossSpawned: false,
    finalBossSpawned: false,
    levelComplete: false,

    bg: null,
    bgLoaded: false,

    // -----------------------------
    // ENTER
    // -----------------------------
    enter() {
      console.log("🚀 Entering LEVEL 4 (TITAN FORGE)");

      this.active = true;
      this.timer = 0;
      this.spawnTimer = 0;
      this.midBossSpawned = false;
      this.finalBossSpawned = false;
      this.levelComplete = false;

      // Reset full game state
      if (window.resetGameState) {
        window.resetGameState();
      }

      S.running = true;
      S.currentLevel = 4;
      S.player.invuln = 1.5;

      // Background (reuse mission1 or swap later)
      this.bg = new Image();
      this.bg.src = "./src/game/assets/mission1_bg.png";
      this.bg.onload = () => (this.bgLoaded = true);

      // Turn off map / home
      if (window.WorldMap) window.WorldMap.active = false;
      if (window.HomeBase) window.HomeBase.active = false;

      // Starfield reset
      if (window.initStars) window.initStars();

      window.flashMsg("LEVEL 4 – TITAN FORGE");
      setTimeout(() => window.flashMsg("HEAVY MECH UNITS INBOUND"), 1400);
    },

    // -----------------------------
    // UPDATE
    // -----------------------------
    update(dt) {
      if (!this.active || !S.running) return;

      this.timer += dt;
      this.spawnTimer -= dt;

      // ---------- WAVE LOGIC BEFORE BOSSES ----------
      if (!this.midBossSpawned && this.timer < 45) {
        if (this.spawnTimer <= 0) {
          this.spawnWave();
          this.spawnTimer = Math.random() * 0.5 + 0.35; // 0.35–0.85s
        }
      }

      // ---------- MID-BOSS SPAWN ----------
      if (!this.midBossSpawned && this.timer >= 45) {
        this.spawnMidBoss();
        this.midBossSpawned = true;
      }

      // ---------- FINAL BOSS SPAWN ----------
      if (this.midBossSpawned && !this.finalBossSpawned && this.timer >= 90) {
        this.spawnFinalBoss();
        this.finalBossSpawned = true;
      }

      // ---------- CORE SHOOTER LOOP ----------
      if (window.updateGameCore) {
        window.updateGameCore(dt);
      } else if (window.updateGame) {
        window.updateGame(dt);
      }

      // ---------- CUSTOM BOSS BEHAVIOUR ----------
      for (const e of S.enemies) {
        if (e.type === "forgeGunship") {
          this.updateMidBoss(e, dt);
        } else if (e.type === "forgeTitan") {
          this.updateFinalBoss(e, dt);
        }
      }

      // ---------- LEVEL COMPLETE CHECK ----------
      if (this.finalBossSpawned && !this.levelComplete) {
        const bossAlive = S.enemies.some((e) => e.type === "forgeTitan");
        if (!bossAlive) {
          this.finishLevel();
        }
      }
    },

    // -----------------------------
    // DRAW
    // -----------------------------
    draw(ctx) {
      if (!this.active) return;

      // Background
      if (this.bgLoaded && this.bg) {
        ctx.drawImage(this.bg, 0, 0, S.W, S.H);
      } else {
        ctx.fillStyle = "#05030a";
        ctx.fillRect(0, 0, S.W, S.H);
      }

      // Existing runway + full renderer
      if (window.drawRunway) window.drawRunway(ctx);
      if (window.drawGameCore) window.drawGameCore(ctx);
      else if (window.drawGame) window.drawGame(ctx);
    },

    // =================================================
    //   ENEMY WAVES – HEAVY MECH + SHOOTERS
    // =================================================
    spawnWave() {
      const roll = Math.random();

      // Heavier than Level 2/3 – lots of shooters & tanks
      if (roll < 0.35) {
        // double zigzag escort
        window.spawnEnemyType("zigzag");
        window.spawnEnemyType("zigzag");
      } else if (roll < 0.65) {
        // shooter + grunt screen pressure
        window.spawnEnemyType("shooter");
        window.spawnEnemyType("grunt");
        window.spawnEnemyType("grunt");
      } else {
        // tank + shooter – mini-elite pack
        window.spawnEnemyType("tank");
        window.spawnEnemyType("shooter");
        window.spawnEnemyType("zigzag");
      }

      // Tiny chance to drop shield parts as you go
      if (Math.random() < 0.0015) {
        this.dropShieldPart("A");
      }
      if (Math.random() < 0.0015) {
        this.dropShieldPart("B");
      }
    },

    dropShieldPart(kind) {
      const px = rand(40, S.W - 40);
      S.powerUps.push({
        x: px,
        y: -20,
        radius: 20,
        speedY: 42,
        type: kind === "A" ? "shieldA" : "shieldB",
      });
      window.flashMsg(
        kind === "A"
          ? "⚡ SHIELD PART A DETECTED"
          : "⚡ SHIELD PART B DETECTED"
      );
    },

    // =================================================
    //   MID-BOSS – FORGE GUNSHIP
    // =================================================
    spawnMidBoss() {
      window.flashMsg("⚠ FORGE GUNSHIP APPROACHING");

      const boss = {
        type: "forgeGunship",
        x: S.W / 2,
        y: -160,
        radius: 90,
        hp: 700,
        maxHp: 700,
        enterComplete: false,
        timer: 0,
        volleyTimer: 0,
      };

      S.enemies.push(boss);
    },

    updateMidBoss(e, dt) {
      // Entry from top
      if (!e.enterComplete) {
        e.y += 50 * dt;
        if (e.y >= S.H * 0.25) {
          e.y = S.H * 0.25;
          e.enterComplete = true;
          e.timer = 0;
          e.volleyTimer = 0;
        }
        return;
      }

      e.timer += dt;
      e.volleyTimer += dt;

      // Sway sideways over the forge
      e.x = S.W * 0.5 + Math.sin(e.timer * 0.8) * 200;

      // Missile volley every ~1.6s
      if (e.volleyTimer >= 1.6) {
        e.volleyTimer = 0;

        const shots = [-2, -1, 0, 1, 2];
        for (const i of shots) {
          S.enemyBullets.push({
            x: e.x + i * 12,
            y: e.y + 40,
            vx: i * 90,
            vy: 260,
            radius: 7,
            colour: "#ffcc88",
          });
        }
      }
    },

    // =================================================
    //   FINAL BOSS – FORGE TITAN
    // =================================================
    spawnFinalBoss() {
      window.flashMsg("⚠⚠ FORGE TITAN ONLINE ⚠⚠");

      const boss = {
        type: "forgeTitan",
        x: S.W / 2,
        y: -220,
        radius: 130,
        hp: 1500,
        maxHp: 1500,
        enterComplete: false,
        timer: 0,
        phase: 1,
        spreadTimer: 0,
        beamTimer: 0,
      };

      S.enemies.push(boss);
    },

    updateFinalBoss(e, dt) {
      const player = S.player;

      // Entry
      if (!e.enterComplete) {
        e.y += 45 * dt;
        if (e.y >= S.H * 0.22) {
          e.y = S.H * 0.22;
          e.enterComplete = true;
          e.timer = 0;
          e.spreadTimer = 0;
          e.beamTimer = 0;
        }
        return;
      }

      e.timer += dt;
      e.spreadTimer += dt;
      e.beamTimer += dt;

      // Phase shift
      if (e.phase === 1 && e.hp <= e.maxHp * 0.5) {
        e.phase = 2;
        window.flashMsg("FORGE TITAN – ENRAGED");
      }

      // ---- MOVEMENT ----
      if (e.phase === 1) {
        // Slow, heavy tracking
        e.x += (player.x - e.x) * 0.8 * dt;
      } else {
        // Faster lateral sweeps
        e.x = S.W * 0.5 + Math.sin(e.timer * 0.9) * 260;
      }

      // ---- SPREAD FIRE ----
      const spreadEvery = e.phase === 1 ? 1.2 : 0.7;
      if (e.spreadTimer >= spreadEvery) {
        e.spreadTimer = 0;

        const baseSpeed = e.phase === 1 ? 260 : 320;
        const angles =
          e.phase === 1
            ? [-0.30, -0.15, 0, 0.15, 0.30]
            : [-0.40, -0.25, -0.1, 0.1, 0.25, 0.40];

        for (const a of angles) {
          S.enemyBullets.push({
            x: e.x,
            y: e.y + 50,
            vx: a * baseSpeed,
            vy: baseSpeed,
            radius: 8,
            colour: "#ff9977",
          });
        }
      }

      // ---- VERTICAL BEAM SWEEP ----
      const beamEvery = e.phase === 1 ? 9 : 6;
      if (e.beamTimer >= beamEvery) {
        e.beamTimer = 0;

        const beamX = e.x;
        const topY = e.y + 80;

        // Represent beam as a "fat" bullet – core engine still handles collision
        S.enemyBullets.push({
          x: beamX,
          y: topY,
          vx: 0,
          vy: 500,
          radius: 24,
          colour: "#ff0044",
          beam: true,
        });

        window.flashMsg("⚡ FORGE TITAN BEAM STRIKE");
      }
    },

    // =================================================
    //   FINISH LEVEL
    // =================================================
    finishLevel() {
      if (this.levelComplete) return;
      this.levelComplete = true;

      window.flashMsg("LEVEL 4 COMPLETE!");
      S.running = false;

      setTimeout(() => {
        if (window.WorldMap && window.WorldMap.enter) {
          window.WorldMap.enter();
        } else {
          window.flashMsg("RETURNING TO STARMAP FAILED");
        }
      }, 1200);
    },
  };

  // Expose globally
  window.Level4 = Level4;
})();