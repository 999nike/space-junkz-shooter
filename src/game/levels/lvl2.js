// ===========================================================
//   LEVEL 2  •  MISSION 1
//   Modular Shooter Level (Fully Separate From Intro Level)
//   - Harder waves
//   - Shield Part A / B drops
//   - Custom Boss (Cyclops Hydra Mini)
//   - Clean exit back to WorldMap
// ===========================================================

if (!S.sprites) {
    loadSprites();
}

(function () {
  const S = window.GameState;

  const Level2 = {
    active: false,
    bossSpawned: false,
    timer: 0,
    bg: null,
    bgLoaded: false,

    enter() {
      console.log("🚀 Entering LEVEL 2 (Mission 1)");

      this.active = true;
      this.bossSpawned = false;
      this.timer = 0;

      // Reset state
      S.running = true;
      S.enemies = [];
      S.bullets = [];
      S.enemyBullets = [];
      S.rockets = [];
      S.particles = [];
      S.powerUps = [];
      S.sidekicks = S.sidekicks || [];

      // Player setup
      S.player.x = S.W / 2;
      S.player.y = S.H - 80;
      S.player.invuln = 1.0;

      // Level-specific background
      this.bg = new Image();
      this.bg.src = "./src/game/assets/mission1_bg.png";
      this.bg.onload = () => this.bgLoaded = true;

      // Switch off other modes
      if (window.WorldMap) window.WorldMap.active = false;
      if (window.HomeBase) window.HomeBase.active = false;

      // Begin starfield fresh
      if (window.initStars) window.initStars();

      window.flashMsg("MISSION 1 – DRAX SYSTEM");
    },

    exit() {
      this.active = false;
      S.running = false;

      // Return to starmap
      if (window.WorldMap && window.WorldMap.enter) {
        window.WorldMap.enter();
      }
    },

    update(dt) {
      if (!this.active || !S.running) return;

      this.timer += dt;

      // Harder spawn rate
      S.spawnTimer -= dt;
      if (S.spawnTimer <= 0) {
        this.spawnWave();
        S.spawnTimer = rand(0.25, 0.7);
      }

      // Spawn boss after ~90 seconds
      if (!this.bossSpawned && this.timer >= 90) {
        this.spawnBoss();
        this.bossSpawned = true;
      }

      // Run core shooter loop
      if (window.updateGameCore) window.updateGameCore(dt);
    },

    draw(ctx) {
      if (!this.active) return;

      // Background
      if (this.bgLoaded) {
        ctx.drawImage(this.bg, 0, 0, S.W, S.H);
      } else {
        ctx.fillStyle = "#05010a";
        ctx.fillRect(0, 0, S.W, S.H);
      }

      // Use renderer same as intro level
      if (window.drawRunway) window.drawRunway(ctx);
      if (window.drawGameCore) window.drawGameCore(ctx);
    },

    // =======================
    //   CUSTOM WAVE PATTERN
    // =======================
    spawnWave() {
      const roll = Math.random();

      // More zigzags early
      if (roll < 0.45) {
        window.spawnEnemyType("zigzag");
        window.spawnEnemyType("zigzag");
      }
      // Shooters
      else if (roll < 0.75) {
        window.spawnEnemyType("shooter");
      }
      // Tanks & zigzag mix
      else {
        window.spawnEnemyType("tank");
        window.spawnEnemyType("zigzag");
      }

      // Tiny chance shield part drops any time
      if (Math.random() < 0.002) this.dropShieldPartA();
      if (Math.random() < 0.002) this.dropShieldPartB();
    },

    // ============================
    //    SHIELD PART DROPS
    // ============================

    dropShieldPartA() {
  const px = rand(40, S.W - 40);
  S.powerUps.push({
    x: px,
    y: -20,
    radius: 20,
    speedY: 40,
    type: "shieldA"
  });
  window.flashMsg("⚡ SHIELD PART A DETECTED");
},

dropShieldPartB() {
  const px = rand(40, S.W - 40);
  S.powerUps.push({
    x: px,
    y: -20,
    radius: 20,
    speedY: 40,
    type: "shieldB"
  });
  window.flashMsg("⚡ SHIELD PART B DETECTED");
},

    // ============================
    //       CUSTOM BOSS
    // ============================
    spawnBoss() {
      const boss = {
        type: "mission1Boss",
        x: S.W / 2,
        y: -120,
        radius: 90,
        hp: 900,
        maxHp: 900,
        enterComplete: false,
        timer: 0
      };
      S.enemies.push(boss);
      window.flashMsg("⚠ HYDRA DRAX BOSS INBOUND");
    },

    updateBoss(ctx, e, dt) {
      // Entry
      if (!e.enterComplete) {
        e.y += 40 * dt;
        if (e.y >= 180) e.enterComplete = true;
        return;
      }

      e.timer += dt;

      // Circular drift
      e.x = S.W * 0.5 + Math.sin(e.timer * 0.5) * 120;

      // Shoot patterns every 1.5 sec
      if (e.timer % 1.5 < 0.05) {
        for (let i = -2; i <= 2; i++) {
          S.enemyBullets.push({
            x: e.x,
            y: e.y + 40,
            vx: i * 150,
            vy: 240,
            radius: 7,
            colour: "#9bf3ff"
          });
        }
      }

      // Death → Level Complete
      if (!this.levelComplete && e.hp <= 0) {
        this.levelComplete = true;

        // Message + progression
        window.flashMsg("MISSION 1 COMPLETE!");
        if (window.unlockNextLevel) {
          window.unlockNextLevel(2);   // unlock LEVEL 3 on clear
        }

        // Small delay, then exit back to star map
        setTimeout(() => this.exit(), 1200);
      }
    }
  };

  // Expose globally
  window.Level2 = Level2;
})();
