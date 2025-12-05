// ======================================================
// LEVEL 4 - CLONE OF LEVEL 2 (STABLE TEST)
// ======================================================
(function () {
  const S = window.GameState;

  const Level4 = {
    active: false,
    bossSpawned: false,
    levelComplete: false,
    timer: 0,
    bg: null,
    bgLoaded: false,

    // -----------------------------
    // ENTER
    // -----------------------------
    enter() {
      console.log("💥 ENTERING LEVEL 4 (CLONE TEST) 💥");

      this.active = true;
      this.bossSpawned = false;
      this.levelComplete = false;
      this.timer = 0;

      // Reset state (same as Level2)
      S.running = true;
      S.enemies = [];
      S.bullets = [];
      S.enemyBullets = [];
      S.rockets = [];
      S.particles = [];
      S.powerUps = [];
      S.sidekicks = S.sidekicks || [];

      S.player.x = S.W / 2;
      S.player.y = S.H - 80;
      S.player.invuln = 1.0;

      this.bg = new Image();
      this.bg.src = "./src/game/assets/mission1_bg.png";
      this.bg.onload = () => (this.bgLoaded = true);

      if (window.WorldMap) window.WorldMap.active = false;
      if (window.HomeBase) window.HomeBase.active = false;
      if (window.initStars) window.initStars();

      window.flashMsg("⚠ LEVEL 4 TEST MODE ⚠");
      setTimeout(() => window.flashMsg("💥 LEVEL 4 (CLONE) ACTIVE 💥"), 1000);
    },

    // -----------------------------
    // UPDATE
    // -----------------------------
    update(dt) {
      if (!this.active || !S.running) return;

      this.timer += dt;

      // spawn waves
      S.spawnTimer -= dt;
      if (S.spawnTimer <= 0) {
        this.spawnWave();
        S.spawnTimer = rand(0.25, 0.7);
      }

      // spawn boss
      if (!this.bossSpawned && this.timer >= 45) {
        this.spawnBoss();
        this.bossSpawned = true;
      }

      // boss behaviour
      for (const e of S.enemies) {
        if (e.type === "lvl4Boss") {
          this.updateBoss(e, dt);
        }
      }

      if (window.updateGameCore) window.updateGameCore(dt);
    },

    // -----------------------------
    // DRAW
    // -----------------------------
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
    },

    // -----------------------------
    // WAVES (same style as L2)
// -----------------------------
    spawnWave() {
      const roll = Math.random();
      if (roll < 0.45) {
        window.spawnEnemyType("zigzag");
        window.spawnEnemyType("zigzag");
      } else if (roll < 0.75) {
        window.spawnEnemyType("shooter");
      } else {
        window.spawnEnemyType("tank");
        window.spawnEnemyType("zigzag");
      }
    },

    // -----------------------------
    // BOSS
    // -----------------------------
    spawnBoss() {
      const boss = {
        type: "lvl4Boss",
        x: S.W / 2,
        y: -120,
        radius: 90,
        hp: 900,
        maxHp: 900,
        enterComplete: false,
        timer: 0,
      };
      S.enemies.push(boss);
      window.flashMsg("⚠ LEVEL 4 TEST BOSS SPAWNED ⚠");
    },

    updateBoss(e, dt) {
      // entry
      if (!e.enterComplete) {
        e.y += 40 * dt;
        if (e.y >= 180) e.enterComplete = true;
        return;
      }

      e.timer += dt;

      // circular drift
      e.x = S.W * 0.5 + Math.sin(e.timer * 0.5) * 120;

      // shoot pattern every 1.5s (roughly)
      if (e.timer % 1.5 < 0.05) {
        for (let i = -2; i <= 2; i++) {
          S.enemyBullets.push({
            x: e.x,
            y: e.y + 40,
            vx: i * 150,
            vy: 240,
            radius: 7,
            colour: "#9bf3ff",
          });
        }
      }

      // death → level complete (same pattern as L2)
      if (!this.levelComplete && e.hp <= 0) {
        this.levelComplete = true;
        window.flashMsg("LEVEL 4 COMPLETE!");

        if (window.unlockNextLevel) {
          window.unlockNextLevel(4); // unlock whatever you want after this
        }

        setTimeout(() => this.exit(), 1200);
      }
    },

    // -----------------------------
    // EXIT (copy of L2 exit, adapted)
// -----------------------------
    exit() {
      console.log("Exiting Level 4 cleanly.");
      const S = window.GameState;

      this.active = false;
      S.running = false;

      S.enemies = [];
      S.bullets = [];
      S.enemyBullets = [];
      S.rockets = [];
      S.particles = [];
      S.powerUps = [];

      if (window.WorldMap && window.WorldMap.enter) {
        window.WorldMap.active = true;
        window.WorldMap.enter();
      }
    },
  };

  window.Level4 = Level4;
})();
