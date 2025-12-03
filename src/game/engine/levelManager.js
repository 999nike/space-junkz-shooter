// Level registry + lifecycle handler
(function () {
  const LevelManager = {
    levels: {},
    current: null,
    currentName: null,

    register(name, level) {
      this.levels[name] = level;
    },

    hasActiveLevel() {
      return !!this.current;
    },

    startLevel(name, options = {}) {
      let level = this.levels[name];
      if (!level && window[name]) {
        level = window[name];
      }
      if (!level) {
        console.warn("Level not found:", name);
        return;
      }

      if (this.current && this.current.cleanup) {
        this.current.cleanup();
      }

      const S = window.GameState;
      S.currentLevel = name;
      S.running = true;

      this.current = level;
      this.currentName = name;

      if (level.enter) level.enter(options);
    },

    update(dt) {
      if (!this.current || !this.current.update) return;
      this.current.update(dt);
    },

    draw(ctx) {
      if (!this.current || !this.current.draw) return;
      this.current.draw(ctx);
    },

    finishLevel() {
      if (!this.current) return;
      if (this.current.finish) this.current.finish();
      if (this.current.cleanup) this.current.cleanup();

      this.current = null;
      this.currentName = null;

      if (window.EngineCore && window.EngineCore.setMode) {
        window.EngineCore.setMode("world");
      } else if (window.WorldMap && window.WorldMap.enter) {
        window.WorldMap.enter();
      }
    },
  };

  window.LevelManager = LevelManager;
})();
