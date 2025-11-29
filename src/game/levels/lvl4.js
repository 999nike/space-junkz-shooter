// ======================================================
// LEVEL 4 - TEMPLATE
// ======================================================

window.Level4 = {

  enter() {
    console.log("LEVEL 4 ENTER");
    this.start();
  },

  start() {
    if (window.resetGameState) {
      window.resetGameState();
    }

    const S = window.GameState;
    S.running = true;
    S.currentLevel = 4;

    this.spawnTimer = 0;
  },

  update(dt) {
    if (!window.GameState.running) return;
    window.updateGame(dt);

    if (window.Level2 && window.Level2.checkLevelClear) {
      if (window.Level2.checkLevelClear()) {
        window.WorldMap.enter();
      }
    }
  }
};
