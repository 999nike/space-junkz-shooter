// ---------- BOOTSTRAP ----------

(function () {
  const S = window.GameState;

  window.initGame = function initGame() {
    S.canvas = document.getElementById("game");
    S.ctx = S.canvas.getContext("2d");
    S.W = S.canvas.width;
    S.H = S.canvas.height;

    S.scoreEl = document.getElementById("score");
    S.livesEl = document.getElementById("lives");
    S.msgEl = document.getElementById("msg");
    S.startBtn = document.getElementById("startBtn");

    window.initStars();
    window.resetGameState();
    window.setupInput();
    window.flashMsg("Press START to play");

    S.startBtn.addEventListener("click", () => {
      window.resetGameState();
      S.running = true;
      window.flashMsg("GOOD LUCK, COMMANDER");
    });

    S.lastTime = performance.now();
    requestAnimationFrame(window.gameLoop);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.initGame);
  } else {
    window.initGame();
  }
})();
