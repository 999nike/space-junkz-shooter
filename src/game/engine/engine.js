// EngineCore drives the state machine and frame loop
(function () {
  const EngineCore = {
    mode: "world",
    lastTime: 0,
    _loopActive: false,

    init() {
      if (!window.GameRuntime) return;
      window.GameRuntime.init();

      if (window.InputManager?.init) {
        window.InputManager.init();
      }

      this.setMode("world");
    },

    ensureLoop() {
      if (this._loopActive) return;
      this.lastTime = performance.now();
      this._loopActive = true;
      requestAnimationFrame(this.gameLoop.bind(this));
    },

    setMode(mode) {
      this.mode = mode;
      if (mode === "world" && window.WorldMap?.enter) {
        window.WorldMap.enter();
      }
      if (mode === "intro" && window.Intro?.enter) {
        window.Intro.enter();
      }
    },

    startIntro() {
      this.setMode("intro");
      this.ensureLoop();
    },

    startWorld() {
      this.setMode("world");
      this.ensureLoop();
    },

    startLevel(name) {
      this.mode = "level";
      if (window.LevelManager?.loadLevel) {
        window.LevelManager.loadLevel(name);
      }
      this.ensureLoop();
    },

    gameLoop(timestamp) {
      const dt = (timestamp - this.lastTime) / 1000 || 0;
      this.lastTime = timestamp;

      this.update(dt);
      this.draw();

      requestAnimationFrame(this.gameLoop.bind(this));
    },

    update(dt) {
      if (this.mode === "level" && window.LevelManager?.hasActiveLevel()) {
        window.LevelManager.update(dt);
        return;
      }

      if (this.mode === "world" && window.WorldMap?.active) {
        window.WorldMap.update?.(dt);
        return;
      }

      if (this.mode === "intro" && window.Intro) {
        window.Intro.update?.(dt);
        return;
      }
    },

    draw() {
      const ctx = window.GameState?.ctx;
      if (this.mode === "level" && window.LevelManager?.hasActiveLevel()) {
        window.LevelManager.draw(ctx);
        return;
      }

      if (this.mode === "world" && window.WorldMap?.draw) {
        window.WorldMap.draw(ctx);
        return;
      }

      if (this.mode === "intro" && window.Intro?.draw) {
        window.Intro.draw(ctx);
      }
    },
  };

  window.EngineCore = EngineCore;
})();
