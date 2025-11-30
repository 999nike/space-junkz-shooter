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

      this.active = true;
      this.timer = 0;
      this.spawnTimer = 0;

      // EXACT SAME START LOGIC AS LEVEL 2 (AUTO START)
      if (window.resetGameState) window.resetGameState();
      S.running = true;                      // ★ AUTO START FLAG ★
      S.currentLevel = 99;                   // ★ Unique level number
      window.WorldMap.active = false;        // ★ Disable map
      window.HomeBase && (window.HomeBase.active = false);

      // Background (use any image)
      this.bg = new Image();
      this.bg.src = "./src/game/assets/mission1_bg.png";
      this.bg.onload = () => (this.bgLoaded = true);

      if (window.initStars) window.initStars();

      // GIANT OBVIOUS WARNING
      window.flashMsg("⚠ WARNING ⚠");
      setTimeout(() => window.flashMsg("🚨 TEST ZONE OMEGA ACTIVE 🚨"), 1200);
    },

    // ------------------------------
    // UPDATE LOOP
    // ------------------------------
    update(dt) {
      if (!this.active || !S.running) return;

      this.timer += dt;
      this.spawnTimer -= dt;

      // Spawn behaviour (unique so you KNOW it's this level)
      if (this.spawnTimer <= 0) {
        this.spawnTestWave();
        this.spawnTimer = 0.7; // predictable
      }

      if (window.updateGameCore) window.updateGameCore(dt);
    },

    // ------------------------------
    // DRAW LOOP
    // ------------------------------
    draw(ctx) {
      if (!this.active) return;

      if (this.bgLoaded) {
        ctx.drawImage(this.bg, 0, 0, S.W, S.H);
      } else {
        ctx.fillStyle = "#220011";
        ctx.fillRect(0, 0, S.W, S.H);
      }

      if (window.drawRunway) window.drawRunway(ctx);
      if (window.drawGameCore) window.drawGameCore(ctx);
    },

    // ------------------------------
    // TEST WAVE (obvious pattern)
    // ------------------------------
    spawnTestWave() {
      // These enemies *zigzag aggressively* so you know it's this level
      window.spawnEnemyType("zigzag");
      window.spawnEnemyType("zigzag");
      window.spawnEnemyType("zigzag");

      // Add a shooter every few seconds
      if (Math.random() < 0.33) {
        window.spawnEnemyType("shooter");
      }
    },
  };

  window.LevelX = LevelX;
})();