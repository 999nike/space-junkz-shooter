// =============================================================
// LEVEL 2 — MISSION 1 (STANDALONE)
// • 20s of simple enemy waves
// • Unique single boss (no intro assets or Level 1 references)
// • No engine hijacking; keeps updateGame bound to Level2.update
// =============================================================

(function () {
  const S = window.GameState;

  const Level2 = {
    active: false,
    timer: 0,
    spawnTimer: 0,
    bossSpawned: false,
    bossDefeated: false,
    bg: null,
    bgLoaded: false,
    _updateBinding: null,
    _previousUpdate: null,
    _finishing: false,

    // ---------------------------------------------------------
    // ENTER
    // ---------------------------------------------------------
    enter() {
      console.log("🚀 ENTERING LEVEL 2 — MISSION 1 (STANDALONE)");

      this.active = true;
      this.timer = 0;
      this.spawnTimer = 0.5;
      this.bossSpawned = false;
      this.bossDefeated = false;
      this._finishing = false;

      // Persist our update binding for the entire mission
      this._updateBinding = (dt) => Level2.update(dt);
      this._previousUpdate = window.updateGame;
      window.updateGame = this._updateBinding;

      // Reset playfield
      if (window.resetGameState) resetGameState();
      S.running = true;
      S.currentLevel = 2;
      if (S.player) S.player.invuln = 1.0;

      // Visuals
      this.bg = new Image();
      this.bgLoaded = false;
      this.bg.src = "./src/game/assets/mission1_bg.png";
      this.bg.onload = () => (this.bgLoaded = true);

      // Disable map/home modes during the mission
      if (window.WorldMap) WorldMap.active = false;
      if (window.HomeBase) HomeBase.active = false;
      if (window.initStars) initStars();

      window.flashMsg("MISSION 1 — DRAX OUTSKIRTS");
      setTimeout(() => window.flashMsg("ENEMY PATROL DETECTED"), 1200);
    },

    // ---------------------------------------------------------
    // UPDATE
    // ---------------------------------------------------------
    update(dt) {
      if (!this.active || !S.running) return;

      // Enforce our update binding so engine/logic cannot overwrite it mid-mission
      if (window.updateGame !== this._updateBinding) {
        window.updateGame = this._updateBinding;
      }

      this.timer += dt;
      this.spawnTimer -= dt;

      // 20 seconds of simple waves
      if (this.timer < 20) {
        if (this.spawnTimer <= 0) {
          this.spawnWave();
          this.spawnTimer = Math.random() * 0.6 + 0.6;
        }
      } else if (!this.bossSpawned) {
        this.spawnBoss();
        this.bossSpawned = true;
      }

      // Boss behavior and completion
      this.updateBoss(dt);
      this.checkForCompletion();

      // Run core shooter systems
      if (window.updateGameCore) updateGameCore(dt);
    },

    // ---------------------------------------------------------
    // WAVES
    // ---------------------------------------------------------
    spawnWave() {
      const roll = Math.random();

      if (roll < 0.45) {
        spawnEnemyType("zigzag");
        spawnEnemyType("zigzag");
      } else if (roll < 0.8) {
        spawnEnemyType("shooter");
        spawnEnemyType("zigzag");
      } else {
        spawnEnemyType("tank");
      }
    },

    // ---------------------------------------------------------
    // BOSS
    // ---------------------------------------------------------
    spawnBoss() {
      window.flashMsg("⚠ RIFT SENTINEL APPROACHING");

      S.enemies.push({
        type: "lvl2RiftSentinel",
        x: S.W / 2,
        y: -160,
        radius: 90,
        hp: 950,
        maxHp: 950,
        timer: 0,
        enterComplete: false,
      });
    },

    updateBoss(dt) {
      for (const enemy of S.enemies) {
        if (enemy.type !== "lvl2RiftSentinel") continue;

        if (!enemy.enterComplete) {
          enemy.y += 70 * dt;
          if (enemy.y >= 200) enemy.enterComplete = true;
          continue;
        }

        enemy.timer += dt;
        enemy.x = S.W / 2 + Math.sin(enemy.timer * 0.8) * 140;

        // Fire paired shots every 1.6s
        if (enemy.timer % 1.6 < dt) {
          for (let i = -1; i <= 1; i += 2) {
            S.enemyBullets.push({
              x: enemy.x + i * 30,
              y: enemy.y + 20,
              vx: i * 80,
              vy: 240,
              radius: 10,
              colour: "#8ef",
            });
          }
        }
      }
    },

    checkForCompletion() {
      if (this._finishing) return;

      const bossAlive = S.enemies.some(
        (e) => e.type === "lvl2RiftSentinel" && e.hp > 0
      );

      if (this.bossSpawned && !bossAlive) {
        this.finishLevel();
      }
    },

    // ---------------------------------------------------------
    // FINISH
    // ---------------------------------------------------------
    finishLevel() {
      if (this._finishing) return;
      this._finishing = true;

      window.flashMsg("LEVEL 2 COMPLETE!");
      this.active = false;
      this.bossDefeated = true;
      S.running = false;
      S.currentLevel = null;

      if (window.unlockNextLevel) unlockNextLevel(2);

      setTimeout(() => {
        // Restore default update handling now that the mission is done
        if (this._previousUpdate) {
          window.updateGame = this._previousUpdate;
          this._previousUpdate = null;
        }

        if (window.WorldMap && window.WorldMap.enter) {
          WorldMap.enter();
        }
      }, 1200);
    },
  };

  window.Level2 = Level2;
})();
