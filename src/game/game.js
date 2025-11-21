// ---------- BOOTSTRAP ----------

(function () {
  const S = window.GameState;

  window.initGame = function initGame() {
    S.canvas = document.getElementById("game");
    S.ctx = S.canvas.getContext("2d");

    // ---- FULL LANDSCAPE CANVAS (90% fullscreen) ----
    S.canvas.width = window.innerWidth * 0.90;
    S.canvas.height = window.innerHeight * 0.90;
    S.W = S.canvas.width;
    S.H = S.canvas.height;

    // Load ship sprite
    S.shipImage = new Image();
    S.shipImage.src = "./src/game/AlphaFighter.png";

    // HUD
    S.scoreEl = document.getElementById("score");
    S.livesEl = document.getElementById("lives");
    S.msgEl = document.getElementById("msg");
    S.startBtn = document.getElementById("startBtn");

    // -------------------------
    // PLAYER SELECT INIT
    // -------------------------
    if (window.PlayerSystem) {
      window.PlayerSystem.init();
    }

    // Basic engine init
    window.initStars();
    window.resetGameState();
    window.setupInput();
    window.flashMsg("Press START to play");

    // -------------------------
    // START BUTTON HANDLER
    // -------------------------
    S.startBtn.addEventListener("click", () => {
      window.resetGameState();
      S.running = true;

      window.flashMsg("GOOD LUCK, COMMANDER");

      // ---- MUSIC ----
      const bgm = document.getElementById("bgm");
      if (bgm) {
        bgm.volume = 0.35;
        bgm.play().catch(() => {
          console.warn("Music blocked until user interacts again.");
        });
      }
    });

    // Start game loop
    S.lastTime = performance.now();
    requestAnimationFrame(window.gameLoop);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.initGame);
  } else {
    window.initGame();
  }
})();
