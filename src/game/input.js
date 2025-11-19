// ----------- INPUT -----------

(function () {
  const S = window.GameState;
  S.keys = {};

  window.setupInput = function setupInput() {
    const canvas = S.canvas;

    // Keyboard (still works, optional)
    window.addEventListener("keydown", (e) => {
      S.keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", (e) => {
      S.keys[e.key.toLowerCase()] = false;
    });

    // Pointer (mouse + touch)
    function pointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      const cx =
        (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const cy =
        (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

      const p = S.player;
      const oldX = p.x;

      // Convert pointer to in-game coords
      const targetX = clamp(cx, -50, S.W + 50);
      const targetY = clamp(cy, S.H * 0.45, S.H - 30);

      // Update player position
      p.x = targetX;
      p.y = targetY;

      // BANKING – left / right tilt based on movement
      const deltaX = p.x - oldX;

      if (deltaX < -2) {
        p.bank = Math.max(p.bank - 0.10, -1); // bank left
      } else if (deltaX > 2) {
        p.bank = Math.min(p.bank + 0.10, 1);  // bank right
      } else {
        p.bank *= 0.92; // return to center smoothly
      }
    }

    // MOUSE
    canvas.addEventListener("mousemove", pointerMove);

    // TOUCH
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
