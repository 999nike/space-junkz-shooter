// ----------- INPUT -----------

(function () {
  const S = window.GameState;
  S.keys = {};

  window.setupInput = function setupInput() {
    const canvas = S.canvas;

    // Keyboard (still works, optional)
    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      S.keys[k] = true;

      // SHIFT HOLD-POSITION MODE
      if (k === "shift") S.keys["shift"] = true;
    });

    window.addEventListener("keyup", (e) => {
      const k = e.key.toLowerCase();
      S.keys[k] = false;

      // SHIFT RELEASE
      if (k === "shift") S.keys["shift"] = false;
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

      // HOLD-POSITION MODE (SHIFT)
      if (!S.keys["shift"]) {
        // Update player position normally
        p.x = targetX;
        p.y = targetY;
      }

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
    // ⭐ Don’t globally block touch behaviour; just track movement
    pointerMove(e);
  },
  { passive: true }
);

    // -----------------------------------
    // FIRE BUTTON (Tap & Hold – all platforms)
    // -----------------------------------
    const fireEl = document.getElementById("btnFire");

    function startFire(e) {
      if (e && e.preventDefault) e.preventDefault();
      S.firing = true;
    }

    function stopFire(e) {
      if (e && e.preventDefault) e.preventDefault();
      S.firing = false;
    }

    if (fireEl) {
      // Desktop mouse
      fireEl.addEventListener("mousedown", startFire);
      fireEl.addEventListener("mouseup", stopFire);
      fireEl.addEventListener("mouseleave", stopFire);

      /* ---- MOBILE TOUCHMOVE (FINAL FIX) ---- */
// Only block touchmove INSIDE the canvas rectangle
canvas.addEventListener(
  "touchmove",
  (e) => {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();

    // Check if touch is INSIDE canvas boundaries
    const insideCanvas =
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom;

    if (insideCanvas) {
      // This is actual gameplay movement
      e.preventDefault();
      pointerMove(e);
    }
    // If OUTSIDE canvas → DO NOT block touches.
  },
  { passive: false }
);
      fireEl.addEventListener("touchend", stopFire);
      fireEl.addEventListener("touchcancel", stopFire);
    }

    // Safety: release fire if finger/mouse leaves button area
    window.addEventListener("mouseup", stopFire);
    window.addEventListener("touchend", stopFire);

// ---------------------------------------------------------
// ANALOG JOYSTICK (Mobile movement only)
// ---------------------------------------------------------
const joyOuter = document.getElementById("joyOuter");
const joyInner = document.getElementById("joyInner");

let joyActive = false;
let joyStartX = 0;
let joyStartY = 0;

function joyStart(e) {
  joyActive = true;
  const t = e.touches[0];
  joyStartX = t.clientX;
  joyStartY = t.clientY;
}

function joyMove(e) {
  if (!joyActive) return;

  const t = e.touches[0];
  const dx = t.clientX - joyStartX;
  const dy = t.clientY - joyStartY;

  const maxDist = 50;
  const dist = Math.min(Math.sqrt(dx*dx + dy*dy), maxDist);
  const angle = Math.atan2(dy, dx);

  const x = Math.cos(angle) * dist;
  const y = Math.sin(angle) * dist;

  joyInner.style.transform = `translate(${x}px, ${y}px)`;

  // Normalised vector (-1 to 1)
  S.moveX = x / maxDist;
  S.moveY = y / maxDist;
}

function joyEnd() {
  joyActive = false;
  S.moveX = 0;
  S.moveY = 0;
  joyInner.style.transform = "translate(0px,0px)";
}

/* ---- JOYSTICK TOUCH EVENTS (PATCHED) ---- */
joyOuter.addEventListener("touchstart", (e) => {
  e.preventDefault();     // allow fire button to receive touches
  joyStart(e);
}, { passive: false });

joyOuter.addEventListener("touchmove", (e) => {
  e.preventDefault();
  joyMove(e);
}, { passive: false });

joyOuter.addEventListener("touchend", joyEnd);
joyOuter.addEventListener("touchcancel", joyEnd);

// ---------------------------------------------------------
// DESKTOP FIRE INPUT (non-destructive)
// ---------------------------------------------------------

// left mouse HOLD = fire
canvas.addEventListener("mousedown", (e) => {
  // do NOT move ship — pointerMove handles that separately
  S.firing = true;
});

// stop on release (from anywhere)
window.addEventListener("mouseup", () => {
  S.firing = false;
});

// spacebar HOLD = fire
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    S.firing = true;
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    S.firing = false;
  }
});

  };
})();
