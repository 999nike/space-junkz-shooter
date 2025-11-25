// =========================================================
//  DEV CONSOLE / CHEAT ENGINE
//  • Toggle with keyboard: C
//  • Local-only cheats for testing
// =========================================================
(function () {
  const S = window.GameState || (window.GameState = {});

  const DevConsole = {
    visible: false,
    el: null,
    godBtn: null,

    init() {
      window.addEventListener("keydown", (ev) => {
        // Toggle with "C" (upper or lower)
        if (ev.key === "c" || ev.key === "C") {
          ev.preventDefault();
          this.toggle();
        }
      });
    },

    toggle() {
      if (!this.el) this.build();
      this.visible = !this.visible;
      this.el.style.display = this.visible ? "block" : "none";
    },

    build() {
      const panel = document.createElement("div");
      panel.id = "devConsolePanel";
      panel.style.position = "fixed";
      panel.style.top = "10px";
      panel.style.right = "10px";
      panel.style.zIndex = "9999";
      panel.style.background = "rgba(5,10,22,0.96)";
      panel.style.border = "1px solid #00f5ff";
      panel.style.borderRadius = "10px";
      panel.style.padding = "10px";
      panel.style.minWidth = "220px";
      panel.style.fontFamily = "system-ui, sans-serif";
      panel.style.fontSize = "12px";
      panel.style.color = "#cfefff";
      panel.style.boxShadow = "0 0 20px rgba(0,255,255,0.35)";
      panel.style.display = "none";

      const title = document.createElement("div");
      title.textContent = "DEV CONSOLE";
      title.style.fontSize = "13px";
      title.style.fontWeight = "600";
      title.style.marginBottom = "6px";
      title.style.textAlign = "center";
      panel.appendChild(title);

      const hint = document.createElement("div");
      hint.textContent = "Press C to hide/show";
      hint.style.fontSize = "11px";
      hint.style.opacity = "0.7";
      hint.style.marginBottom = "8px";
      hint.style.textAlign = "center";
      panel.appendChild(hint);

      const btnWrap = document.createElement("div");
      btnWrap.style.display = "flex";
      btnWrap.style.flexDirection = "column";
      btnWrap.style.gap = "4px";
      panel.appendChild(btnWrap);

      const makeBtn = (label, fn) => {
        const b = document.createElement("button");
        b.textContent = label;
        b.style.border = "1px solid #00f5ff";
        b.style.background = "rgba(4,18,30,0.95)";
        b.style.color = "#e3ffff";
        b.style.fontSize = "11px";
        b.style.padding = "4px 6px";
        b.style.borderRadius = "6px";
        b.style.cursor = "pointer";
        b.style.textAlign = "left";
        b.onmouseenter = () => (b.style.background = "rgba(6,26,46,1)");
        b.onmouseleave = () => (b.style.background = "rgba(4,18,30,0.95)");
        b.onclick = () => {
          try {
            fn();
          } catch (err) {
            console.error("DevConsole button error:", err);
            if (window.flashMsg) window.flashMsg("DEV ERR: " + err.message);
          }
        };
        btnWrap.appendChild(b);
        return b;
      };

      // ----- CHEATS -----
      makeBtn("Spawn Scorpion Boss", () => {
        if (window.spawnScorpionBoss) {
          window.spawnScorpionBoss();
          if (window.flashMsg) window.flashMsg("DEV: Scorpion Boss spawned");
        }
      });

      makeBtn("Spawn Gemini Boss", () => {
        if (window.spawnGeminiBoss) {
          window.spawnGeminiBoss();
          if (window.flashMsg) window.flashMsg("DEV: Gemini Boss spawned");
        }
      });

      makeBtn("Clear enemies + bullets", () => {
        const S = window.GameState;
        if (!S) return;
        S.enemies = [];
        S.enemyBullets = [];
        S.particles = [];
        if (window.flashMsg) window.flashMsg("DEV: Enemies cleared");
      });

      makeBtn("+100,000 Score", () => {
        const S = window.GameState;
        if (!S) return;
        S.score = (S.score || 0) + 100000;
        if (S.scoreEl) S.scoreEl.textContent = S.score;
        if (window.flashMsg) window.flashMsg("DEV: Score +100k");
      });

      // ------------------------------------------------------
// MAX ALL POWERS LVL 5
// ------------------------------------------------------
makeBtn("MAX POWER LVL 5", () => {
    const S = window.GameState;
    if (!S) return;

    // If you add more powers later, just include them here.
    S.laserLevel = 5;
    S.rocketLevel = 5;
    S.shieldLevel = 5;
    S.warpLevel = 5;
    S.sidekickLevel = 5;

    window.flashMsg("DEV: ALL POWERS SET TO LEVEL 5");
});

// ------------------------------------------------------
// LOAD LEVEL 2 (MISSION 1)
// ------------------------------------------------------
makeBtn("LOAD LEVEL 2 NOW", () => {
    if (window.Level2 && window.Level2.enter) {
        window.Level2.enter();
        window.flashMsg("DEV: LOADING LEVEL 2");
    } else {
        window.flashMsg("ERROR: Level2 not loaded");
    }
});

      this.godBtn = makeBtn("God Mode: OFF", () => {
        const S = window.GameState;
        S.devGodMode = !S.devGodMode;
        this.godBtn.textContent = S.devGodMode ? "God Mode: ON" : "God Mode: OFF";
        if (window.flashMsg) {
          window.flashMsg(S.devGodMode ? "DEV: GOD MODE ENABLED" : "DEV: God mode off");
        }
      });

      makeBtn("Go to World Map", () => {
        if (window.WorldMap && window.WorldMap.enter) {
          window.WorldMap.enter();
          if (window.flashMsg) window.flashMsg("DEV: World Map");
        }
      });

      makeBtn("Enter Home Base", () => {
        if (window.HomeBase && window.HomeBase.enter) {
          window.HomeBase.enter();
          if (window.flashMsg) window.flashMsg("DEV: Home Base");
        }
      });

      makeBtn("End Level (Kill Player)", () => {
        const S = window.GameState;
        if (!S) return;
        S.lives = 0;
        if (S.livesEl) S.livesEl.textContent = S.lives;
        if (window.flashMsg) window.flashMsg("DEV: Level ended");
      });

      const closeBtn = makeBtn("Close Panel", () => {
        this.toggle();
      });
      closeBtn.style.marginTop = "6px";
      closeBtn.style.textAlign = "center";

      document.body.appendChild(panel);
      this.el = panel;
    }
  };

  window.DevConsole = DevConsole;
  DevConsole.init();
})();
