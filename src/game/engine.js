// Entry surface that boots the EngineCore lifecycle
window.flashMsg = function flashMsg(text, duration = 1200) {
  const el = document.getElementById("flashMsg");
  if (!el) {
    console.warn("flashMsg: missing #flashMsg element");
    return;
  }

  el.textContent = text;
  el.style.opacity = 1;

  clearTimeout(window._flashTimer);
  window._flashTimer = setTimeout(() => {
    el.style.opacity = 0;
  }, duration);
};

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
