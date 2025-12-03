// ======================================================
// LEVEL 7 - TEMPLATE
// ======================================================

window.Level7 = {

  active: false,

  enter() {
    console.log("LEVEL 7 ENTER");
    this.start();
  },

  start() {
    if (window.resetGameState) {
      window.resetGameState();
    }

    const S = window.GameState;
    S.running = true;
    S.currentLevel = 7;

    this.active = true;
    this.spawnTimer = 0;
  },

  update(dt) {
    if (!this.active || !window.GameState.running) return;
    window.updateGame(dt);

    if (window.Level2 && window.Level2.checkLevelClear) {
      if (window.Level2.checkLevelClear()) {
        window.WorldMap.enter();
      }
    }
  },

  draw(ctx) {
    if (!this.active) return;
    const context = ctx || window.GameState.ctx;
    if (context && window.drawGameCore) {
      window.drawGameCore(context);
    }
  },

  finish() {
    this.active = false;
    window.GameState.running = false;
  }
};
