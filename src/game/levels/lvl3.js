// ======================================================
// LEVEL 3 - TEMPLATE (CLONE OF LEVEL 2)
// ======================================================

window.Level3 = {

  enter() {
    // Called by the World Map
    console.log("LEVEL 3 ENTER");
    this.start();
  },

  start() {
    // Reset game state like Level 2
    if (window.resetGameState) {
      window.resetGameState();
    }

    const S = window.GameState;
    S.running = true;
    S.currentLevel = 3;

    // Same spawn settings as Level 2 (modify later)
    this.spawnTimer = 0;
  },

  update(dt) {
    if (!window.GameState.running) return;
    window.updateGame(dt);

    // Level progression → send back to World Map when boss is dead
    if (window.Level2 && window.Level2.checkLevelClear) {
      if (window.Level2.checkLevelClear()) {
        window.WorldMap.enter();
      }
    }
  }
};
