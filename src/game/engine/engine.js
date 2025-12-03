// Core loop + mode switching
(function () {
  const EngineCore = {
    mode: "intro",
    lastTime: 0,

    init() {
      const S = (window.GameState = window.GameState || {});
      S.canvas = document.getElementById("game");
      S.ctx = S.canvas.getContext("2d");
      S.canvas.width = window.innerWidth;
      S.canvas.height = window.innerHeight;
      S.W = S.canvas.width;
      S.H = S.canvas.height;

      S.scoreEl = document.getElementById("score");
      S.livesEl = document.getElementById("lives");
      S.coinsEl = document.getElementById("coins");
      S.msgEl = document.getElementById("msg");
      S.startBtn = document.getElementById("startBtn");

      S.player = Object.assign(
        {
          x: S.W / 2,
          y: S.H - 80,
          angle: 0,
          speed: 260,
          weaponLevel: 1,
          invuln: 0,
        },
        S.player || {}
      );

      S.enemies = [];
      S.bullets = [];
      S.enemyBullets = [];
      S.powerUps = [];
      S.sidekicks = [];
      S.rockets = [];
      S.particles = [];
      S.spawnTimer = 0;
      S.shootTimer = 0;
      S.running = false;

      if (typeof window.loadSprites === "function") {
        window.loadSprites();
      }

      if (typeof window.initStars === "function") {
        window.initStars();
      }

      if (typeof window.setupInput === "function") {
        window.setupInput();
      }

      this.bindStartButton();
      this.setMode("world");
    },

    bindStartButton() {
      const S = window.GameState;
      if (!S.startBtn) return;
      S.startBtn.addEventListener("click", () => {
        if (this.mode === "level" || (window.WorldMap && window.WorldMap.active)) {
          console.log("Start ignored while level/map active");
          return;
        }
        this.startIntro();
      });
    },

    setMode(mode) {
      this.mode = mode;
      const S = window.GameState;
      if (mode === "world") {
        S.running = true;
        if (window.WorldMap && window.WorldMap.enter) {
          window.WorldMap.enter();
        }
      } else if (mode === "intro") {
        S.currentLevel = null;
        S.bossSpawned = false;
        S.bossTimer = 0;
        S.spawnTimer = 0.5;
        S.running = true;
        if (window.WorldMap) window.WorldMap.active = false;
      } else if (mode === "level") {
        if (window.WorldMap) window.WorldMap.active = false;
      }
    },

    startIntro() {
      window.resetGameState();
      this.setMode("intro");
      this.ensureLoop();
      window.flashMsg("GOOD LUCK, COMMANDER");
    },

    startLevel(name) {
      this.setMode("level");
      if (window.LevelManager) {
        window.LevelManager.startLevel(name);
      }
      this.ensureLoop();
    },

    ensureLoop() {
      if (this._loopActive) return;
      this.lastTime = performance.now();
      this._loopActive = true;
      requestAnimationFrame(this.gameLoop.bind(this));
    },

    gameLoop(timestamp) {
      const S = window.GameState;
      const dt = (timestamp - this.lastTime) / 1000 || 0;
      this.lastTime = timestamp;

      this.update(dt);
      this.draw();
      requestAnimationFrame(this.gameLoop.bind(this));
    },

    update(dt) {
      if (this.mode === "level" && window.LevelManager && window.LevelManager.hasActiveLevel()) {
        window.LevelManager.update(dt);
        return;
      }

      if (this.mode === "world" && window.WorldMap && window.WorldMap.active) {
        window.WorldMap.update(dt);
        return;
      }

      if (this.mode === "intro") {
        window.updateIntro(dt);
      }
    },

    draw() {
      const S = window.GameState;
      const ctx = S.ctx;
      if (this.mode === "level" && window.LevelManager && window.LevelManager.hasActiveLevel()) {
        window.LevelManager.draw(ctx);
        return;
      }
      window.drawGame();
    },
  };

  window.EngineCore = EngineCore;
})();
