// Level lifecycle coordinator
(function () {
  const LevelManager = {
    registry: {},
    current: null,
    currentName: null,

    register(name, level) {
      this.registry[name] = level;
    },

    hasActiveLevel() {
      return !!this.current;
    },

    loadLevel(name, options = {}) {
      const level = this.registry[name] || window[name];
      if (!level) {
        console.warn("Level not found:", name);
        return;
      }

      if (this.current?.cleanup) {
        this.current.cleanup();
      }

      this.current = level;
      this.currentName = name;
      if (level.enter) level.enter(options);
    },

    update(dt) {
      this.current?.update?.(dt);
    },

    draw(ctx) {
      this.current?.draw?.(ctx);
    },

    finishLevel() {
      if (!this.current) return;
      this.current.finish?.();
      this.current.cleanup?.();
      this.current = null;
      this.currentName = null;
      if (window.EngineCore) {
        window.EngineCore.startWorld();
      }
    },
  };

  window.LevelManager = LevelManager;
})();
