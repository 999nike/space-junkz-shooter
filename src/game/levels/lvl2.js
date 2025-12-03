// Mission 1 – standalone level using the modular engine
(function () {
  const S = () => window.GameState;

  const Level2 = {
    clock: 0,
    waveTimer: 0,
    boss: null,
    bossSpawned: false,

    enter() {
      this.clock = 0;
      this.waveTimer = 0;
      this.boss = null;
      this.bossSpawned = false;

      window.GameRuntime?.resetFrameState();
      window.updateGame = this.update.bind(this);

      const state = S();
      state.currentLevel = "Level2";
    },

    spawnWave(dt) {
      this.waveTimer -= dt;
      if (this.waveTimer > 0) return;
      const state = S();
      const count = 6;
      for (let i = 0; i < count; i++) {
        state.enemies.push({
          type: "grunt",
          x: 40 + (i / count) * (state.W - 80),
          y: -30 - i * 18,
          radius: 14,
          speedY: 140,
          hp: 1,
          maxHp: 1,
          colour: "#6bffb2",
          score: 100,
          dropChance: 0.05,
        });
      }
      this.waveTimer = 2.8;
    },

    spawnBoss() {
      const state = S();
      this.boss = {
        type: "riftSentinel",
        x: state.W / 2,
        y: 140,
        radius: 48,
        hp: 160,
        maxHp: 160,
        cooldown: 1.2,
        phase: 0,
        manualUpdate: true,
        update: (dt) => this.updateBoss(dt),
      };
      state.enemies.push(this.boss);
      this.bossSpawned = true;
    },

    updateBoss(dt) {
      if (!this.boss) return;
      const state = S();
      this.boss.phase += dt;
      this.boss.x = state.W / 2 + Math.sin(this.boss.phase * 1.5) * 180;
      this.boss.y = 140 + Math.cos(this.boss.phase) * 30;

      this.boss.cooldown -= dt;
      if (this.boss.cooldown <= 0) {
        for (let i = -1; i <= 1; i++) {
          state.enemyBullets.push({
            x: this.boss.x + i * 18,
            y: this.boss.y + 10,
            vx: i * 90,
            vy: 260,
            radius: 6,
            colour: "#fba4ff",
          });
        }
        this.boss.cooldown = 1.0;
      }

      if (this.boss.hp <= 0) {
        window.finishLevel();
      }
    },

    update(dt) {
      this.clock += dt;
      window.GameRuntime?.updateCore(dt);

      if (this.clock < 20) {
        this.spawnWave(dt);
      } else if (!this.bossSpawned) {
        this.spawnBoss();
      }
    },

    draw(ctx) {
      window.GameRuntime?.drawCore(ctx);
      if (ctx && this.boss) {
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.fillText("RIFT SENTINEL", 20, 40);
        const pct = Math.max(0, this.boss.hp) / this.boss.maxHp;
        ctx.fillStyle = "#ff69b4";
        ctx.fillRect(20, 50, pct * 240, 12);
        ctx.restore();
      }
    },

    cleanup() {
      if (window.updateGame === this.update) {
        window.updateGame = null;
      }
    },

    finish() {
      const state = S();
      state.enemies = [];
      this.boss = null;
    },
  };

  if (window.LevelManager) {
    window.LevelManager.register("Level2", Level2);
  }

  window.Level2 = Level2;
})();
