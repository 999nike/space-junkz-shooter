// ======================================================
// LEVEL 5 – VOID SWARM
// • Fast 60-sec survival mode
// • Purple void background
// • New enemy pattern: swirl + divebomb
// • Clean exit to map
// ======================================================

(function () {
  const S = window.GameState;

  const Level5 = {
    active: false,
    timer: 0,
    spawnTimer: 0,
    bg: null,
    bgLoaded: false,

    // -----------------------------
    // ENTER
    // -----------------------------
    enter() {
      console.log("🚀 ENTERING LEVEL 5 – VOID SWARM");

      this.active = true;
      this.timer = 0;
      this.spawnTimer = 0;

      if (window.resetGameState) resetGameState();
      S.running = true;
      S.currentLevel = 5;

      // Player
      S.player.x = S.W / 2;
      S.player.y = S.H - 80;
      S.player.invuln = 1.0;

      // Background (purple nebula)
      this.bg = new Image();
      this.bg.src = "./src/game/assets/void_bg.png"; // custom purple
      this.bg.onload = () => (this.bgLoaded = true);

      // Turn off map/home
      if (window.WorldMap) window.WorldMap.active = false;
      if (window.HomeBase) window.HomeBase.active = false;

      if (window.initStars) initStars();

      window.flashMsg("MISSION 5 – VOID SWARM");
      setTimeout(() => window.flashMsg("SURVIVE 60 SECONDS"), 1000);
    },

    // -----------------------------
    // UPDATE
    // -----------------------------
    update(dt) {
      if (!this.active || !S.running) return;

      this.timer += dt;
      this.spawnTimer -= dt;

      // Finish after 60 seconds
      if (this.timer >= 60) {
        this.completeLevel();
        return;
      }

      // Enemy waves
      if (this.spawnTimer <= 0) {
        this.spawnVoidWave();
        this.spawnTimer = 0.35; // VERY fast
      }

      // Use core shooter engine
      if (window.updateGameCore) window.updateGameCore(dt);
    },

    // -----------------------------
    // DRAW
    // -----------------------------
    draw(ctx) {
      if (!this.active) return;

      if (this.bgLoaded) ctx.drawImage(this.bg, 0, 0, S.W, S.H);
      else {
        ctx.fillStyle = "#120016";
        ctx.fillRect(0, 0, S.W, S.H);
      }

      if (window.drawRunway) drawRunway(ctx);
      if (window.drawGameCore) drawGameCore(ctx);
    },

    // -----------------------------
    // NEW VOID WAVE
    // -----------------------------
    spawnVoidWave() {
      const pattern = Math.random();

      // Swirl enemies (left → right curve)
      if (pattern < 0.45) {
        const ex = rand(60, S.W - 60);
        const wave = 3 + Math.floor(Math.random() * 3);

        for (let i = 0; i < wave; i++) {
          const e = {
            type: "voidSwirl",
            x: ex,
            y: -20 - i * 40,
            radius: 18,
            hp: 2,
            maxHp: 2,
            colour: "#d57bff",
            timer: Math.random() * 2,
            curveAmp: rand(40, 90)
          };
          S.enemies.push(e);
        }
      }

      // Divebombers (extreme speed)
      else {
        const count = 3 + Math.floor(Math.random() * 4);

        for (let i = 0; i < count; i++) {
          const e = {
            type: "voidDive",
            x: rand(20, S.W - 20),
            y: -20 - i * 30,
            radius: 14,
            hp: 1,
            maxHp: 1,
            colour: "#ff5be1",
            diveSpeed: rand(300, 450)
          };
          S.enemies.push(e);
        }
      }
    },

    // -----------------------------
    // COMPLETE
    // -----------------------------
    completeLevel() {
      window.flashMsg("LEVEL 5 COMPLETE!");
      S.running = false;
      this.active = false;

      if (window.unlockNextLevel) unlockNextLevel(5);

      setTimeout(() => {
        if (window.WorldMap && window.WorldMap.enter) {
          window.WorldMap.enter();
        }
      }, 1200);
    },
  };

  // ------------------------------------------------------
  // EXTEND MAIN ENGINE FOR CUSTOM VOID ENEMIES
  // ------------------------------------------------------
  const originalUpdateGame = window.updateGame;

  window.updateGame = function patchedUpdateGame(dt) {
    originalUpdateGame(dt);

    const S = window.GameState;

    for (const e of S.enemies) {
      // ----- VOID SWIRL (curving path) -----
      if (e.type === "voidSwirl") {
        e.timer += dt;
        e.y += 160 * dt;
        e.x += Math.sin(e.timer * 3) * (e.curveAmp * dt);
      }

      // ----- VOID DIVE (straight down fast) -----
      if (e.type === "voidDive") {
        e.y += e.diveSpeed * dt;
      }
    }
  };

  window.Level5 = Level5;
})();