// ===============================
//  INPUT.JS – FINAL CLEAN VERSION
//  • Mobile-safe
//  • No duplicate listeners
//  • Canvas never blocks buttons
//  • Joystick + fire button stable
// ===============================

(function () {
  const S = window.GameState;
  S.keys = {};

  // ----------------------------------
  // KEYBOARD INPUT
  // ----------------------------------
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    S.keys[k] = true;

    if (k === "shift") S.keys["shift"] = true;
  });

  window.addEventListener("keyup", (e) => {
    const k = e.key.toLowerCase();
    S.keys[k] = false;

    if (k === "shift") S.keys["shift"] = false;
  });

  // ----------------------------------
  //  POINTER MOVEMENT → ANGLE + POSITION
  // ----------------------------------
  function pointerMove(e) {
    const canvas = S.canvas;
    const rect = canvas.getBoundingClientRect();

    const px =
      (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const py =
      (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    // Convert to game-space
    const gx = (px / rect.width) * S.W;
    const gy = (py / rect.height) * S.H;

    const p = S.player;
    const oldX = p.x;

    S.mouseX = gx;
    S.mouseY = gy;

    const targetX = clamp(gx, 24, S.W - 24);
    const targetY = clamp(gy, 24, S.H - 24);

    // Update ship angle
    const dx = gx - p.x;
    const dy = gy - p.y;
    if (dx || dy) {
      p.angle = Math.atan2(dy, dx);
    }

    // HOLD position?
    if (!S.keys["shift"]) {
      p.x = targetX;
      p.y = targetY;
    }

    // Lean/bank effect
    const deltaX = p.x - oldX;
    if (deltaX < -2) p.bank = Math.max(p.bank - 0.10, -1);
    else if (deltaX > 2) p.bank = Math.min(p.bank + 0.10, 1);
    else p.bank *= 0.92;
  }

  // ----------------------------------
  //  CANVAS LISTENERS
  // ----------------------------------
  const canvas = S.canvas;

  // MOUSE
  canvas.addEventListener("mousemove", pointerMove);

  // CLEAN TOUCHMOVE — ONE HANDLER ONLY
  canvas.addEventListener(
    "touchmove",
    (e) => {
      const t = e.touches[0];
      const rect = canvas.getBoundingClientRect();

      const inside =
        t.clientX >= rect.left &&
        t.clientX <= rect.right &&
        t.clientY >= rect.top &&
        t.clientY <= rect.bottom;

      if (inside) {
        e.preventDefault(); // allow joystick + UI to function
        pointerMove(e);
      }
    },
    { passive: false }
  );

  // ----------------------------------
  //  FIRE BUTTON (hold-to-fire)
  // ----------------------------------
  const fireEl = document.getElementById("btnFire");

  function startFire(e) {
    if (e && e.preventDefault) e.preventDefault();
    S.firing = true;
  }

  function stopFire() {
    S.firing = false;
  }

  if (fireEl) {
    // desktop
    fireEl.addEventListener("mousedown", startFire);
    fireEl.addEventListener("mouseup", stopFire);
    fireEl.addEventListener("mouseleave", stopFire);

    // mobile
    fireEl.addEventListener("touchstart", startFire, { passive: false });
    fireEl.addEventListener("touchend", stopFire);
    fireEl.addEventListener("touchcancel", stopFire);
  }

  window.addEventListener("mouseup", stopFire);
  window.addEventListener("touchend", stopFire);

  // ----------------------------------
  //  ANALOG JOYSTICK (mobile left)
  // ----------------------------------
  const joyOuter = document.getElementById("joyOuter");
  const joyInner = document.getElementById("joyInner");

  let joyActive = false;
  let joyStartX = 0;
  let joyStartY = 0;

  function joyStart(e) {
    const t = e.touches[0];
    joyActive = true;
    joyStartX = t.clientX;
    joyStartY = t.clientY;
  }

  function joyMove(e) {
    if (!joyActive) return;

    const t = e.touches[0];
    const dx = t.clientX - joyStartX;
    const dy = t.clientY - joyStartY;

    const maxDist = 50;
    const dist = Math.min(Math.hypot(dx, dy), maxDist);
    const angle = Math.atan2(dy, dx);

    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;

    joyInner.style.transform = `translate(${x}px, ${y}px)`;

    S.moveX = x / maxDist;
    S.moveY = y / maxDist;
  }

  function joyEnd() {
    joyActive = false;
    S.moveX = 0;
    S.moveY = 0;
    joyInner.style.transform = "translate(0px,0px)";
  }

  if (joyOuter) {
    joyOuter.addEventListener("touchstart", (e) => {
      e.preventDefault();
      joyStart(e);
    }, { passive: false });

    joyOuter.addEventListener("touchmove", (e) => {
      e.preventDefault();
      joyMove(e);
    }, { passive: false });

    joyOuter.addEventListener("touchend", joyEnd);
    joyOuter.addEventListener("touchcancel", joyEnd);
  }

  // ----------------------------------
  // DESKTOP FIRE (spacebar)
  // ----------------------------------
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") S.firing = true;
  });

  window.addEventListener("keyup", (e) => {
    if (e.code === "Space") S.firing = false;
  });

})();