// ---------- INPUT ----------

(function () {
  const S = window.GameState;
  S.keys = {};

  window.setupInput = function setupInput() {
    const canvas = S.canvas;

    window.addEventListener("keydown", (e) => {
      S.keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", (e) => {
      S.keys[e.key.toLowerCase()] = false;
    });

    function pointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      const cx =
        (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const cy =
        (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      const p = S.player;
  // Update X/Y
const oldX = p.x;

p.x = clamp(cx, -20, S.W + 20);
p.y = clamp(cy, S.H / 2, S.H - 20);

// Banking based on pointer movement
const deltaX = p.x - oldX;

if (deltaX < -2) {
    p.bank = Math.max(p.bank - 0.12, -1); // left bank
} else if (deltaX > 2) {
    p.bank = Math.min(p.bank + 0.12, 1);  // right bank
} else {
    // return to center
    p.bank *= 0.90;
}

    canvas.addEventListener("mousemove", pointerMove);
    canvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        pointerMove(e);
      },
      { passive: false }
    );
  };
})();
