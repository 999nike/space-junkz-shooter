// GLOBAL FLASH MESSAGE SYSTEM
window.flashMsg = function flashMsg(text, duration = 1200) {
  const el = document.getElementById("flashMsg");
  if (!el) return;

  el.textContent = text;
  el.style.opacity = 1;

  clearTimeout(window._flashTimer);
  window._flashTimer = setTimeout(() => {
    el.style.opacity = 0;
  }, duration);
};

// Entry surface that boots the EngineCore lifecycle
(function () {
  function bindStartButton() {
    const startBtn = document.getElementById("startBtn");
    if (!startBtn) return;
    startBtn.addEventListener("click", () => {
      window.EngineCore?.startIntro();
    });
  }

  window.addEventListener("load", () => {
    window.EngineCore?.init();
    window.EngineCore?.ensureLoop();
    bindStartButton();
  });

  // --- FIXED START BUTTON (STARTS INTRO ONLY) ---
  window.GameState.startBtn.addEventListener("click", () => {
    const S = window.GameState;

    // 🛑 If ANY level is active → ignore the Start button
    if (
      (window.Level2 && window.Level2.active) ||
      (window.Level3 && window.Level3.active) ||
      (window.Level4 && window.Level4.active) ||
      (window.WorldMap && window.WorldMap.active)
    ) {
      console.log("Start ignored — level already active.");
      return;
    }

    // ✅ Only runs when NO level is active → proper intro start
    const active = localStorage.getItem("sj_active_player");

    if (
      active &&
      (S.score > 0 || S.wizzCoins > 0) &&
      typeof window.syncStats === "function"
    ) {
      window.syncStats(active, S.wizzCoins, S.score);
    }

    window.resetGameState();
    S.running = true;
    window.flashMsg("GOOD LUCK, COMMANDER");

    const bgm = document.getElementById("bgm");
    if (bgm) {
      bgm.volume = 0.35;
      bgm.play().catch(() => {
        console.warn("Music blocked until user interacts again.");
      });
    }
  });

  window.flashMsg("Press START to play");
});

// =========================================================
//  MAIN LOOP
// =========================================================
window.gameLoop = function gameLoop(timestamp) {
  const S = window.GameState;
  const dt = (timestamp - S.lastTime) / 1000 || 0;
  S.lastTime = timestamp;

  if (S.running) {
    window.updateGame(dt);
  }

  window.drawGame();
  requestAnimationFrame(window.gameLoop);
};
