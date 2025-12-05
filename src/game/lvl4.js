// ======================================================
// LEVEL X – TEST ZONE OMEGA
// A guaranteed-working test level with:
// • Huge warning
// • Obvious enemy behaviour
// • Level2-style auto-start
// ======================================================

(function () {
  const S = window.GameState;

  const LevelX = {
    active: false,
    timer: 0,
    spawnTimer: 0,
    bg: null,
    bgLoaded: false,

    // ------------------------------
    // ENTER LEVEL
    // ------------------------------
    enter() {
      console.log("🚨 ENTERING TEST ZONE OMEGA 🚨");

      // ======================================================
// LEVEL 4 - CLONE OF LEVEL 2 (TEST MODE)
// ======================================================

(function () {
  const S = window.GameState;

  const Level4 = {
    active: false,
    bossSpawned: false,
    timer: 0,
    bg: null,
    bgLoaded: false,

    // -----------------------------
    // ENTER LEVEL
    // -----------------------------
    enter() {
      console.log("💥 ENTERING LEVEL 4 (CLONE TEST) 💥");

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

      // Player position
      S.player.x = S.W / 2;
      S.player.y = S.H - 80;
      S.player.invuln = 1.0;

      // Background
      this.bg = new Image();
      this.bg.src = "./src/game/assets/mission1_bg.png"; 
      this.bg.onload = () => (this.bgLoaded = true);

      // Turn off map + home
      if (window.WorldMap) window.WorldMap.active = false;
      if (window.HomeBase) window.HomeBase.active = false;

      if (window.initStars) window.initStars();

      // BIG WARNING SO YOU KNOW IT LOADED
      window.flashMsg("⚠ LEVEL 4 TEST MODE ⚠");
      setTimeout(() => window.flashMsg("💥 LEVEL 4 (CLONE) ACTIVE 💥"), 1000);
    },

    // -----------------------------
    // UPDATE
    // -----------------------------
    update(dt) {
      if (!this.active || !S.running) return;

      this.timer += dt;

      // Same wave logic as Level 2
      S.spawnTimer -= dt;
      if (S.spawnTimer <= 0) {
        this.spawnWave();
        S.spawnTimer = rand(0.25, 0.7);
      }

      // Spawn boss after 45 sec (shorter for testing)
      if (!this.bossSpawned && this.timer >= 45) {
        this.spawnBoss();
        this.bossSpawned = true;
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

      // Render same as Level 2
      if (window.drawRunway) window.drawRunway(ctx);
      if (window.drawGameCore) window.drawGameCore(ctx);
    },

    // -----------------------------
    // WAVES (copied from Level 2)
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
    // BOSS (copied from Level 2)
    // -----------------------------
    spawnBoss() {
      const boss = {
        type: "lvl4Boss",
        x: S.W / 2,
        y: -120,
        radius: 90,
        hp: 400, // small for test
        maxHp: 400,
        enterComplete: false,
        timer: 0
      };
      S.enemies.push(boss);
      window.flashMsg("⚠ LEVEL 4 TEST BOSS SPAWNED ⚠");
    },
  };

  window.Level4 = Level4;
})();