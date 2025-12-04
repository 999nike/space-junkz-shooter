// ======================================================
// LEVEL 11 - DARK NEBULA RAID
// ======================================================

const Level11 = {
  active: false,
  timer: 0,
  waveTimer: 0,
  bossTimer: 0,
  bossSpawned: false,
  finishing: false,

  enter() {
    const S = window.GameState;
    this.active = true;
    this.timer = 0;
    this.waveTimer = 1.0;
    this.bossTimer = 0;
    this.bossSpawned = false;
    this.finishing = false;
    if (window.resetGameState) resetGameState();
    S.running = true;
    S.currentLevel = 11;
    if (window.flashMessage) window.flashMessage("LEVEL 11 — DARK NEBULA RAID");
    if (window.WorldMap) WorldMap.active = false;
    if (window.HomeBase) HomeBase.active = false;
  },

  update(dt) {
    if (!this.active) return;
    const S = window.GameState;
    this.timer += dt;
    this.waveTimer -= dt;
    this.bossTimer += dt;

    // Enemy wave logic
    if (this.waveTimer <= 0) {
      if (window.spawnEnemy) spawnEnemy();
      this.waveTimer = rand(0.3, 0.9);
    }

    // Boss
    if (!this.bossSpawned && this.bossTimer >= 50) {
      const spawnSpectreBoss =
        typeof window.spawnBossSpectre === "function"
          ? window.spawnBossSpectre
          : function placeholderSpectreSpawn() {
              console.warn("spawnBossSpectre is not defined; using placeholder.");
            };

      spawnSpectreBoss(); // If this function doesn't exist, create placeholder
      this.bossSpawned = true;
    }

    // Core engine systems
    updateGame(dt);

    // Detect boss defeat
    if (this.bossSpawned) {
      const alive = S.enemies.some(e => e.type === "spectreBoss");
      if (!alive) this.finish();
    }
  },

  draw(ctx) {
    if (!this.active) return;
    if (window.drawRunway) drawRunway(ctx);
    if (window.drawStars) drawStars(ctx);
    if (window.drawEnemies) drawEnemies(ctx);
    if (window.drawBossSpectre) drawBossSpectre(ctx);
    if (window.drawPlayer) drawPlayer(ctx);
    if (window.drawPlayerBars) drawPlayerBars(ctx, window.GameState);
    if (window.drawBullets) drawBullets(ctx);
    if (window.drawEnemyBullets) drawEnemyBullets(ctx);
    if (window.drawParticles) drawParticles(ctx);
  },

  finish() {
    if (this.finishing) return;
    this.finishing = true;
    if (window.flashMessage) window.flashMessage("LEVEL 11 COMPLETE!");

    setTimeout(() => {
      if (window.BlackHole?.start) {
        window.BlackHole.start(() => {
          if (window.WorldMap?.enter) WorldMap.enter();
        });
      } else {
        if (window.WorldMap?.enter) WorldMap.enter();
      }
    }, 1200);

    this.active = false;
    window.GameState.running = false;
    window.GameState.currentLevel = null;
  }
};

if (window.LevelManager) {
  LevelManager.register("Level11", Level11);
}
window.Level11 = Level11;
