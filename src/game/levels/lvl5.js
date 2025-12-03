// ======================================================
// LEVEL 5 – THE VOID
// • Total visual refresh
// • Purple nebula background
// • Void enemies (black + neon)
// • Silent drift + ambient debris
// • 45-sec survival
// ======================================================

(function () {
  const S = window.GameState;

  const Level5 = {
    active: false,
    timer: 0,
    spawnTimer: 0,
    bg: null,
    bgLoaded: false,

    enter() {
      console.log("🌌 ENTERING LEVEL 5 — THE VOID");

      this.active = true;
      this.timer = 0;
      this.spawnTimer = 0;

      if (window.resetGameState) resetGameState();
      S.running = true;
      S.currentLevel = 5;

      // Player
      S.player.x = S.W / 2;
      S.player.y = S.H - 90;
      S.player.invuln = 1.2;

      // NEW: Purple void BG
      this.bg = new Image();
      this.bg.src = "./src/game/assets/voidpurple.jpg";
      this.bg.onload = () => (this.bgLoaded = true);

      // Disable map + homebase
      if (window.WorldMap) WorldMap.active = false;
      if (window.HomeBase) HomeBase.active = false;

      // Reset stars → slower for void effect
      if (window.initStars) {
        initStars();
        S.stars.forEach((s) => {
          s.speed *= 0.45;
          s.color = "#b56bff";
        });
      }

      window.flashMsg("MISSION 5 — THE VOID");
      setTimeout(() => window.flashMsg("SURVIVE 45 SECONDS"), 1200);
    },

    update(dt) {
      if (!this.active || !S.running) return;

      this.timer += dt;
      this.spawnTimer -= dt;

      // 45-second survival goal
      if (this.timer >= 45) {
        this.complete();
        return;
      }

      // Unique Void waves
      if (this.spawnTimer <= 0) {
        this.spawnVoidWave();
        this.spawnTimer = 0.5;
      }

      if (window.updateGame) updateGame(dt);
    },

    draw(ctx) {
      if (!this.active) return;

      // BG: deep purple
      if (this.bgLoaded) {
        ctx.drawImage(this.bg, 0, 0, S.W, S.H);
      } else {
        ctx.fillStyle = "#15001d";
        ctx.fillRect(0, 0, S.W, S.H);
      }

      // Void fog overlay
      ctx.fillStyle = "rgba(120,0,180,0.15)";
      ctx.fillRect(0, 0, S.W, S.H);

      // Render normally
      if (window.drawGameCore) drawGameCore(ctx);
    },

    // ---------------------------------------------------
    // VOID WAVES — totally different behaviour
    // ---------------------------------------------------
    spawnVoidWave() {
      const roll = Math.random();

      // Shadow ghosts (fade in at random)
      if (roll < 0.33) {
        const x = rand(40, S.W - 40);
        const e = {
          type: "voidGhost",
          x,
          y: -40,
          radius: 20,
          hp: 2,
          maxHp: 2,
          alpha: 0,
          drift: rand(-20, 20),
          colour: "#ffffff",
        };
        S.enemies.push(e);
      }

      // Portal spit (cluster burst)
      else if (roll < 0.66) {
        for (let i = 0; i < 5; i++) {
          const e = {
            type: "voidSpit",
            x: rand(40, S.W - 40),
            y: -20 - i * 20,
            radius: 14,
            hp: 1,
            maxHp: 1,
            vy: rand(180, 260),
            colour: "#ff63d1",
          };
          S.enemies.push(e);
        }
      }

      // Sidewinders (zigzag from the sides)
      else {
        const side = Math.random() < 0.5 ? -20 : S.W + 20;
        const e = {
          type: "voidSide",
          x: side,
          y: rand(40, S.H / 2),
          radius: 16,
          hp: 2,
          maxHp: 2,
          speed: rand(200, 260),
          colour: "#6cfffa",
          dir: side < 0 ? 1 : -1,
        };
        S.enemies.push(e);
      }
    },

    // ---------------------------------------------------
    // COMPLETE LEVEL
    // ---------------------------------------------------
    complete() {
      this.active = false;
      S.running = false;

      window.flashMsg("LEVEL 5 COMPLETE!");

      if (window.unlockNextLevel) unlockNextLevel(5);

      setTimeout(() => {
        if (window.WorldMap) WorldMap.enter();
      }, 1200);
    },

    finish() {
      this.complete();
    },
  };

  window.Level5 = Level5;
})();