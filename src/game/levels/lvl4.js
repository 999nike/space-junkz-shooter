// ======================================================
// LEVEL 4 – NEW SECTOR
// A simple standalone mission with its own waves and boss.
// • Uses the core engine updateGame()
// • Finishes after the boss is defeated and unlocks the next mission.
// ======================================================

(function() {
  const S = window.GameState;

  const Level4 = {
    active: false,
    timer: 0,
    spawnTimer: 0,
    bossSpawned: false,
    bg: null,
    bgLoaded: false,

    enter() {
      console.log("ENTERING LEVEL 4 – NEW SECTOR");
      this.active = true;
      this.timer = 0;
      this.spawnTimer = 0.5;
      this.bossSpawned = false;

      if (window.resetGameState) resetGameState();
      S.running = true;
      S.currentLevel = 4;

      // Player starting position
      if (S.player) {
        S.player.x = S.W / 2;
        S.player.y = S.H - 80;
        S.player.invuln = 1.2;
      }

      // Background
      this.bg = new Image();
      this.bg.src = "./src/game/assets/mission1_bg.png";
      this.bgLoaded = false;
      this.bg.onload = () => (this.bgLoaded = true);

      // Disable map/home
      if (window.WorldMap) WorldMap.active = false;
      if (window.HomeBase) HomeBase.active = false;

      if (window.initStars) initStars();

      window.flashMsg("MISSION 3 – NEW SECTOR");
      setTimeout(() => window.flashMsg("HOSTILE FLEET DETECTED"), 1000);
    },

    update(dt) {
      if (!this.active || !S.running) return;

      this.timer += dt;
      this.spawnTimer -= dt;

      // Spawn small waves for 30 seconds
      if (!this.bossSpawned && this.timer < 30) {
        if (this.spawnTimer <= 0) {
          this.spawnWave();
          this.spawnTimer = Math.random() * 0.4 + 0.4;
        }
      }

      // Then spawn the boss
      if (!this.bossSpawned && this.timer >= 30) {
        this.spawnBoss();
        this.bossSpawned = true;
      }

      // When boss HP ≤ 0, end mission
      if (this.bossSpawned) {
        for (const e of S.enemies) {
          if (e.type === "lvl4Boss" && e.hp <= 0) {
            this.finishLevel();
            break;
          }
        }
      }

      if (window.updateGame) updateGame(dt);
    },

    draw(ctx) {
      if (!this.active) return;
      if (this.bgLoaded) {
        ctx.drawImage(this.bg, 0, 0, S.W, S.H);
      } else {
        ctx.fillStyle = "#05010a";
        ctx.fillRect(0, 0, S.W, S.H);
      }
      if (window.drawGameCore) drawGameCore(ctx);
    },

    spawnWave() {
      const r = Math.random();
      if (r < 0.5) {
        spawnEnemyType("zigzag");
        spawnEnemyType("shooter");
      } else if (r < 0.8) {
        spawnEnemyType("tank");
        spawnEnemyType("zigzag");
      } else {
        spawnEnemyType("shooter");
        spawnEnemyType("shooter");
      }
    },

    spawnBoss() {
      const boss = {
        type: "lvl4Boss",
        x: S.W / 2,
        y: -140,
        radius: 90,
        hp: 800,
        maxHp: 800,
        enterComplete: false,
        timer: 0
      };
      S.enemies.push(boss);
      window.flashMsg("⚠ LEVEL 4 BOSS APPROACHING ⚠");
    },

    finishLevel() {
      this.active = false;
      S.running = false;
      window.flashMsg("MISSION 3 COMPLETE!");
      if (window.unlockNextLevel) unlockNextLevel(4);
      window.BlackHole.start(() => {
        if (window.WorldMap) WorldMap.enter();
      });
    },

    finish() {
      this.finishLevel();
    }
  };

  window.Level4 = Level4;
})();