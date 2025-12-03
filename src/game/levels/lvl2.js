// Level 2 – standalone Mission 1 using the new level lifecycle
(function () {
  const Level2 = {
    name: "Level2",
    active: false,
    elapsed: 0,
    waveTimer: 0,
    boss: null,

    enter() {
      this.active = true;
      this.elapsed = 0;
      this.waveTimer = 1.2;
      this.boss = null;

      if (window.resetGameState) {
        window.resetGameState();
      }

      const S = window.GameState;
      S.currentLevel = this.name;
      S.running = true;
      if (window.WorldMap) {
        window.WorldMap.active = false;
      }
    },

    update(dt) {
      if (!this.active) return;
      this.elapsed += dt;

      this.runWaves(dt);
      if (!this.boss && this.elapsed >= 20) {
        this.spawnBoss();
      }

      window.updateCoreGameplay(dt, { allowIntroWaves: false });

      if (this.boss && this.boss.hp <= 0) {
        this.finishLevel();
      }
    },

    draw(ctx) {
      if (typeof window.drawGame === "function") {
        window.drawGame(ctx);
      }
    },

    cleanup() {
      this.active = false;
      this.boss = null;
    },

    finishLevel() {
      this.active = false;
      if (window.LevelManager) {
        window.LevelManager.finishLevel();
      }
    },

    runWaves(dt) {
      if (this.elapsed >= 20 || !this.active) return;
      this.waveTimer -= dt;
      if (this.waveTimer > 0) return;

      const S = window.GameState;
      const lanes = [S.W * 0.2, S.W * 0.4, S.W * 0.6, S.W * 0.8];
      for (let i = 0; i < lanes.length; i++) {
        window.spawnEnemyType("grunt", lanes[i], -40 - i * 20);
      }

      this.waveTimer = 2.5;
    },

    spawnBoss() {
      const S = window.GameState;
      const boss = {
        type: "riftSentinel",
        manualUpdate: true,
        x: S.W / 2,
        y: -80,
        vx: 120,
        radius: 60,
        hp: 80,
        maxHp: 80,
        colour: "#9bf3ff",
        fireTimer: 1.0,
        phase: 0,
        update: (dt) => {
          boss.y = Math.min(S.H * 0.25, boss.y + 80 * dt);
          boss.x += boss.vx * dt;
          if (boss.x < 80 || boss.x > S.W - 80) {
            boss.vx *= -1;
          }

          boss.phase += dt * 2.2;
          const spread = Math.sin(boss.phase) * 120;

          boss.fireTimer -= dt;
          if (boss.fireTimer <= 0) {
            const shots = [-spread, 0, spread];
            shots.forEach((offset) => {
              S.enemyBullets.push({
                x: boss.x + offset * 0.25,
                y: boss.y + boss.radius,
                vx: offset * 0.4,
                vy: 180,
                radius: 6,
                colour: "#ff9bf5",
              });
            });
            boss.fireTimer = 1.1;
          }
        },
      };

      this.boss = boss;
      window.GameState.enemies.push(boss);
    },
  };

  if (window.LevelManager) {
    window.LevelManager.register("Level2", Level2);
  }

  window.Level2 = Level2;
})();
