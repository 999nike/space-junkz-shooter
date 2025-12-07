// ===========================================================
//   LEVEL 4  •  MISSION 3 – CANCER WARSHIP
//   • Uses Backblaze B2 sprite for the boss
//   • Simple wave → boss → back to WorldMap
// ===========================================================
(function () {
  const S = window.GameState;
  const B2_ASSET_BASE =
    "https://f003.backblazeb2.com/file/space-junkz-assets";

  const Level4 = {
    active: false,
    bg: null,
    bgLoaded: false,

    bossSprite: null,
    bossSpriteLoaded: false,
    _prevTankSprite: null,

    timer: 0,
    spawnTimer: 0,
    bossSpawned: false,
    _finishing: false,

    // -----------------------------
    // ENTER LEVEL
    // -----------------------------
    enter() {
      console.log("💥 ENTERING LEVEL 4 – CANCER WARSHIP 💥");

      this.active = true;
      this.timer = 0;
      this.spawnTimer = 0.6;
      this.bossSpawned = false;
      this._finishing = false;

      // Reset shooter state but keep score/coins
      if (typeof window.resetGameState === "function") {
        window.resetGameState();
      } else {
        S.enemies = [];
        S.bullets = [];
        S.enemyBullets = [];
        S.rockets = [];
        S.particles = [];
        S.powerUps = [];
      }

      // Core run flags
      S.running = true;
      S.currentLevel = 4;

      // Player position
      if (S.player) {
        S.player.x = S.W / 2;
        S.player.y = S.H - 90;
        S.player.invuln = 1.2;
      }

      // Background – reuse mission1_bg for now
      this.bg = new Image();
      this.bgLoaded = false;
      this.bg.src = "./src/game/assets/mission1_bg.png";
      this.bg.onload = () => {
        this.bgLoaded = true;
      };

      // Disable map / home
      if (window.WorldMap) window.WorldMap.active = false;
      if (window.HomeBase) window.HomeBase.active = false;

      if (typeof window.initStars === "function") {
        window.initStars();
      }

      // --- Boss sprite from Backblaze B2 ---
      this._prevTankSprite = S.sprites && S.sprites.enemyTank
        ? S.sprites.enemyTank
        : null;

      this.bossSprite = new Image();
      this.bossSpriteLoaded = false;
      this.bossSprite.onload = () => {
        this.bossSpriteLoaded = true;
        if (S.sprites) {
          // Temporarily use this sprite for all "tank" enemies
          S.sprites.enemyTank = this.bossSprite;
        }
      };
      this.bossSprite.src =
        B2_ASSET_BASE + "/junkz-assets/oldCANCER2.png";

      if (window.flashMsg) {
        window.flashMsg("MISSION 3 – CANCER WARSHIP");
        setTimeout(
          () => window.flashMsg("ENEMY VANGUARD INBOUND"),
          1400
        );
      }
    },

    // -----------------------------
    // EXIT → BACK TO MAP
    // -----------------------------
    exit() {
      this.active = false;
      S.running = false;

      // Restore original tank sprite if we replaced it
      if (this._prevTankSprite && S.sprites) {
        S.sprites.enemyTank = this._prevTankSprite;
      }

      if (window.WorldMap && typeof window.WorldMap.enter === "function") {
        window.WorldMap.enter();
      }
    },

    // -----------------------------
    // SPAWN WAVES (PRE-BOSS)
    // -----------------------------
    spawnWave() {
      const r = Math.random();

      if (r < 0.3) {
        window.spawnEnemyType("grunt");
        window.spawnEnemyType("grunt");
      } else if (r < 0.6) {
        window.spawnEnemyType("zigzag");
        window.spawnEnemyType("shooter");
      } else if (r < 0.85) {
        window.spawnEnemyType("tank");
      } else {
        // heavier mini-pack
        window.spawnEnemyType("grunt");
        window.spawnEnemyType("zigzag");
        window.spawnEnemyType("tank");
      }
    },

    // -----------------------------
    // SPAWN BOSS (BIG TANK VARIANT)
    // -----------------------------
    spawnBoss() {
      if (this.bossSpawned) return;

      const S = window.GameState;
      // Spawn as "tank" and tag it as Level4 boss
      window.spawnEnemyType("tank", S.W / 2, -120);

      const boss = S.enemies[S.enemies.length - 1];
      if (boss) {
        boss.hp = 40;
        boss.maxHp = 40;
        boss._isLevel4Boss = true;
        boss.speedY = 35;
        boss.score = 750;
      }

      this.bossSpawned = true;

      if (window.flashMsg) {
        window.flashMsg("⚠ CANCER WARSHIP APPROACHING ⚠");
        setTimeout(
          () => window.flashMsg("DESTROY THE FLAGSHIP"),
          1600
        );
      }
    },

    // -----------------------------
    // HANDLE BOSS DEATH
    // -----------------------------
    _checkBossDefeated() {
      if (!this.bossSpawned || this._finishing) return;

      const S = window.GameState;
      const bossAlive = S.enemies.some((e) => e._isLevel4Boss);

      if (!bossAlive) {
        this._finishing = true;

        if (window.flashMsg) {
          window.flashMsg("MISSION 3 COMPLETE!");
        }

        // Optional: unlock lvl5 on map (node id "lvl5")
        if (window.unlockNextLevel) {
          window.unlockNextLevel(4); // 4 → unlock lvl5 node
        }

        S.running = false;
        setTimeout(() => this.exit(), 1400);
      }
    },

    // -----------------------------
    // UPDATE
    // -----------------------------
    update(dt) {
      if (!this.active || !S.running) return;

      this.timer += dt;

      // Pre-boss waves for ~25 seconds
      if (!this.bossSpawned) {
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
          this.spawnWave();
          this.spawnTimer = rand(0.4, 1.0);
        }

        if (this.timer >= 25) {
          this.spawnBoss();
        }
      }

      // Run generic shooter core (player, bullets, collisions)
      if (typeof window.updateGameCore === "function") {
        // Reuse shared shooter core (no intro logic)
window.runCore(dt);
      } else if (typeof window.updateGame === "function") {
        window.updateGame(dt);
      }

      // Check if boss died
      this._checkBossDefeated();
    },

    // -----------------------------
    // DRAW
    // -----------------------------
    draw(ctx) {
      if (!this.active) return;

      // Background
      if (this.bgLoaded && this.bg) {
        ctx.drawImage(this.bg, 0, 0, S.W, S.H);
      } else {
        ctx.fillStyle = "#05010a";
        ctx.fillRect(0, 0, S.W, S.H);
      }

      if (typeof window.drawRunway === "function") {
        window.drawRunway(ctx);
      }

      if (typeof window.drawGameCore === "function") {
        window.drawGameCore(ctx);
      } else if (typeof window.drawGame === "function") {
        window.drawGame(ctx);
      }
    },
  };

  window.Level4 = Level4;
})();