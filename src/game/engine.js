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
})();
