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

      // Raw screen coords inside the canvas element
      const px =
        (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const py =
        (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

      // Convert from CSS pixels → game-space using scaling factors
      const gx = (px / rect.width) * S.W;
      const gy = (py / rect.height) * S.H;

      const p = S.player;
      const oldX = p.x;

      // Store mouse in game-space for other systems (angle, etc.)
      S.mouseX = gx;
      S.mouseY = gy;

      // Target position: allow full-screen movement with a small border
      const targetX = clamp(gx, 24, S.W - 24);
      const targetY = clamp(gy, 24, S.H - 24);

      // Update facing angle toward pointer
      const dx = gx - p.x;
      const dy = gy - p.y;
      if (dx !== 0 || dy !== 0) {
        p.angle = Math.atan2(dy, dx);
      }

      // Update player position
      p.x = targetX;
      p.y = targetY;

      // BANKING – left / right tilt based on movement (keeps nice lean)
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
