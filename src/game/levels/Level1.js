(function () {
  const S = () => window.GameState;

  const Level1 = {
    active: false,
    timer: 0,
    spawnTimer: 0,
    bossTimer: 0,
    bossSpawned: false,
    scorpionDefeated: false,
    geminiSpawned: false,
    finishing: false,

    enter() {
      console.log("🚀 ENTERING LEVEL 1 — INTRO MISSION");

      const state = S();
      this.active = true;
      this.timer = 0;
      this.spawnTimer = 0.4;
      this.bossTimer = 0;
      this.bossSpawned = false;
      this.scorpionDefeated = false;
      this.geminiSpawned = false;
      this.finishing = false;

      if (window.resetGameState) resetGameState();
      state.running = true;
      state.currentLevel = 1;
      state.geminiBossSpawned = false;
      if (state.player) state.player.invuln = 1.0;

      if (window.WorldMap) WorldMap.active = false;
      if (window.HomeBase) HomeBase.active = false;
      if (window.initStars) initStars();

      if (window.flashMsg) flashMsg("LEVEL 1 — DEFEND THE RUNWAY");
    },

    update(dt) {
      const state = S();
      if (!this.active || !state.running) return;

      this.timer += dt;
      this.spawnTimer -= dt;
      this.bossTimer += dt;

      if (!this.bossSpawned && this.spawnTimer <= 0) {
        if (window.spawnEnemy) spawnEnemy();
        this.spawnTimer = rand(0.4, 1.0);
      }

      if (!this.bossSpawned && this.bossTimer >= 60) {
        if (window.spawnScorpionBoss) spawnScorpionBoss();
        this.bossSpawned = true;
      }

      for (const e of state.enemies) {
        if (e.type === "scorpionBoss" && window.updateBossScorpion) {
          updateBossScorpion(e, dt);
        } else if (e.type === "geminiBoss" && window.updateBossGemini) {
          updateBossGemini(e, dt);
        }
      }

      if (this.bossSpawned && !this.scorpionDefeated) {
        const scorpionAlive = state.enemies.some((e) => e.type === "scorpionBoss");
        if (!scorpionAlive) {
          this.scorpionDefeated = true;
          if (window.flashMsg) flashMsg("BOSS DEFEATED!");

          setTimeout(() => {
            if (this.finishing || this.geminiSpawned) return;
            if (window.flashMsg) flashMsg("⚠ WARNING: GEMINI WARSHIP APPROACHING ⚠");
            if (window.spawnGeminiBoss) {
              spawnGeminiBoss();
              this.geminiSpawned = true;
            }
          }, 1500);
        }
      }

      if (window.updateStars) updateStars(dt);

      if (window.updateGame) updateGame(dt);

      if (this.geminiSpawned) {
        const geminiAlive = state.enemies.some((e) => e.type === "geminiBoss");
        if (!geminiAlive) {
          this.finish();
        }
      }
    },

    draw(ctx) {
      if (!this.active) return;

      const state = S();
      const context = ctx || state.ctx;
      if (!context) return;

      context.clearRect(0, 0, state.W, state.H);
      if (window.drawGameCore) drawGameCore(context);
    },

    finish() {
      if (this.finishing) return;
      this.finishing = true;

      if (window.flashMsg) flashMsg("LEVEL 1 COMPLETE!");

      this.active = false;
      const state = S();
      state.running = false;
      state.currentLevel = null;

      if (window.unlockNextLevel) unlockNextLevel(1);

      setTimeout(() => {
        if (window.WorldMap && window.WorldMap.enter) {
          WorldMap.enter();
        }
      }, 1200);
    },
  };

  if (window.LevelManager) {
    LevelManager.register("Level1", Level1);
  }

  window.Level1 = Level1;
})();
