// ======================================================
// LEVEL 6 – METEOR STORM
// Stand‑alone survival level.
// • Random meteor showers and enemy waves
// • Survive for 60 seconds to clear the mission.
// ======================================================

(function() {
  const S = window.GameState;

  const Level6 = {
    active: false,
    timer: 0,
    spawnTimer: 0,
    bg: null,
    bgLoaded: false,

    enter() {
      console.log("ENTERING LEVEL 6 – METEOR STORM");
      this.active = true;
      this.timer = 0;
      this.spawnTimer = 0.4;

      if (window.resetGameState) resetGameState();
      S.running = true;
      S.currentLevel = 6;

      if (S.player) {
        S.player.x = S.W / 2;
        S.player.y = S.H - 100;
        S.player.invuln = 1.5;
      }

      // Background (reuse existing asset)
      this.bg = new Image();
      this.bg.src = "./src/game/assets/mission1_bg.png";
      this.bgLoaded = false;
      this.bg.onload = () => (this.bgLoaded = true);

      if (window.WorldMap) WorldMap.active = false;
      if (window.HomeBase) HomeBase.active = false;

      if (window.initStars) {
        initStars();
        // Dim stars for dark ambiance
        S.stars.forEach((s) => {
          s.speed *= 0.6;
          s.color = "#ffebcd";
        });
      }

      window.flashMsg("MISSION 5 – METEOR STORM");
      setTimeout(() => window.flashMsg("SURVIVE 60 SECONDS"), 1200);
    },

    update(dt) {
      if (!this.active || !S.running) return;

      this.timer += dt;
      this.spawnTimer -= dt;

      // Level completes after 60 seconds
      if (this.timer >= 60) {
        this.complete();
        return;
      }

      // Spawn meteor waves every ~0.4–0.9 seconds
      if (this.spawnTimer <= 0) {
        this.spawnMeteorWave();
        this.spawnTimer = 0.4 + Math.random() * 0.5;
      }

      if (window.updateGameCore) updateGameCore(dt);
    },

    draw(ctx) {
      if (!this.active) return;
      if (this.bgLoaded) {
        ctx.drawImage(this.bg, 0, 0, S.W, S.H);
      } else {
        ctx.fillStyle = "#02040f";
        ctx.fillRect(0, 0, S.W, S.H);
      }

      // Light haze overlay
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.fillRect(0, 0, S.W, S.H);

      if (window.drawGameCore) drawGameCore(ctx);
    },

    spawnMeteorWave() {
      const roll = Math.random();
      if (roll < 0.4) {
        // Large meteor shower
        for (let i = 0; i < 3; i++) {
          const e = {
            type: "meteor",
            x: rand(40, S.W - 40),
            y: -30 - i * 25,
            radius: 20,
            hp: 3,
            maxHp: 3,
            vy: rand(150, 220),
            colour: "#d67d00"
          };
          S.enemies.push(e);
        }
      } else if (roll < 0.7) {
        // Fast shooters
        spawnEnemyType("shooter");
        spawnEnemyType("shooter");
      } else {
        // Zigzag cluster
        spawnEnemyType("zigzag");
        spawnEnemyType("zigzag");
        spawnEnemyType("zigzag");
      }
    },

    complete() {
      this.active = false;
      S.running = false;
      window.flashMsg("METEOR STORM SURVIVED!");
      if (window.unlockNextLevel) unlockNextLevel(6);
      setTimeout(() => {
        if (window.WorldMap) WorldMap.enter();
      }, 1200);
    }
  };

  window.Level6 = Level6;
})();