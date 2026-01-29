// ===============================
//  INPUT.JS – NOVA MODE VERSION
//  • Keyboard, mouse, touch, joystick, fire
//  • PC + mobile
//  • Mouse ONLY aims (no position move)
// ===============================

(function () {
  const S = window.GameState || {};
  S.keys = S.keys || {};
  window.GameState = S;

  window.setupInput = function setupInput() {
    const canvas = S.canvas;
    if (!canvas) {
      console.warn("setupInput called before canvas exists");
      return;
    }

    // avoid double-binding if engine ever calls twice
    if (S._inputBound) return;
    S._inputBound = true;

    // ---------------------------
    // KEYBOARD
    // ---------------------------
    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      S.keys[k] = true;

      if (k === "shift") S.keys["shift"] = true;
      if (e.code === "Space") S.firing = true;
    });

    window.addEventListener("keyup", (e) => {
      const k = e.key.toLowerCase();
      S.keys[k] = false;

      if (k === "shift") S.keys["shift"] = false;
      if (e.code === "Space") S.firing = false;
    });

    // ---------------------------
    // POINTER MOVE → ship aim (NO MOVEMENT)
    // ---------------------------
    function pointerMove(e) {
      const rect = canvas.getBoundingClientRect();

      const px =
        (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const py =
        (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

      const gx = (px / rect.width) * S.W;
      const gy = (py / rect.height) * S.H;

      const p = S.player;
      if (!p) return;

      // store mouse in game space
      S.mouseX = gx;
      S.mouseY = gy;

      // ---- NOVA MODE: POINTER ONLY AIMS, NO MOVEMENT ----
      const dx = gx - p.x;
      const dy = gy - p.y;

      if (dx || dy) {
        p.angle = Math.atan2(dy, dx);
      }

      // Banking (visual lean)
      const deltaX = dx;
      if (deltaX < -2)      p.bank = Math.max(p.bank - 0.10, -1);
      else if (deltaX > 2) p.bank = Math.min(p.bank + 0.10, 1);
      else                 p.bank *= 0.92;
    }

    // mouse move on canvas
    canvas.addEventListener("mousemove", pointerMove);

    // touch move ONLY inside canvas bounds
    canvas.addEventListener(
      "touchmove",
      (e) => {
        const rect = canvas.getBoundingClientRect();
        const t = e.touches[0];

        const inside =
          t.clientX >= rect.left &&
          t.clientX <= rect.right &&
          t.clientY >= rect.top &&
          t.clientY <= rect.bottom;

        if (inside) {
          e.preventDefault();
          pointerMove(e);
        }
      },
      { passive: false }
    );

    // ---------------------------
    // FIRE BUTTON (tap & hold)
    // ---------------------------
    const fireEl = document.getElementById("btnFire");

    function startFire(ev) {
      if (ev && ev.preventDefault) ev.preventDefault();
      S.firing = true;
    }

    function stopFire() {
      S.firing = false;
    }

    if (fireEl) {
      fireEl.addEventListener("mousedown", startFire);
      fireEl.addEventListener("mouseup", stopFire);
      fireEl.addEventListener("mouseleave", stopFire);

      fireEl.addEventListener("touchstart", startFire, { passive: false });
      fireEl.addEventListener("touchend", stopFire);
      fireEl.addEventListener("touchcancel", stopFire);
    }

    window.addEventListener("mouseup", stopFire);
    window.addEventListener("touchend", stopFire);

    // ---------------------------
    // ANALOG JOYSTICK (mobile left)
    // ---------------------------
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

      if (joyInner) {
        joyInner.style.transform = `translate(${x}px, ${y}px)`;
      }

      S.moveX = x / maxDist;
      S.moveY = y / maxDist;
    }

    function joyEnd() {
      joyActive = false;
      S.moveX = 0;
      S.moveY = 0;

      if (joyInner) {
        joyInner.style.transform = "translate(0px,0px)";
      }
    }

    if (joyOuter) {
      joyOuter.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault();
          joyStart(e);
        },
        { passive: false }
      );

      joyOuter.addEventListener(
        "touchmove",
        (e) => {
          e.preventDefault();
          joyMove(e);
        },
        { passive: false }
      );

      joyOuter.addEventListener("touchend", joyEnd);
      joyOuter.addEventListener("touchcancel", joyEnd);
    }

    // ---------------------------
    // DESKTOP: mouse-down fire on canvas
    // ---------------------------
    canvas.addEventListener("mousedown", () => {
      S.firing = true;
    });
    window.addEventListener("mouseup", () => {
      S.firing = false;
    });

    // ---------------------------
    // GAMEPAD (PS5 / STANDARD GAMEPAD API)
    // Mirrors into S.moveX / S.moveY / S.firing
    // ---------------------------
const GAMEPAD_DEADZONE = 0.18;

function pollGamepad() {
  const pads = navigator.getGamepads && navigator.getGamepads();
  if (!pads) return;

  // --- DEBUG: confirm whether browser exposes a real Gamepad ---
  if (!S._gpDebugT) S._gpDebugT = 0;
  S._gpDebugT++;

  // every ~60 frames, log what the browser sees
  if (S._gpDebugT % 60 === 0) {
    const list = [];
    for (let i = 0; i < pads.length; i++) {
      const p = pads[i];
      if (p) list.push({ i, id: p.id, buttons: p.buttons?.length, axes: p.axes?.length });
    }
    console.log("🎮 getGamepads()", { length: pads.length, detected: list });
    if (list.length === 0) console.warn("🎮 NO GAMEPAD DETECTED (controller likely in mouse/remote mode)");
  }

  // pick the first connected pad (pads[0] is NOT guaranteed)
let gp = null;
for (let i = 0; i < pads.length; i++) {
  if (pads[i]) { gp = pads[i]; break; }
}
if (!gp) return;

  // Left stick
  let lx = gp.axes[0] || 0;
  let ly = gp.axes[1] || 0;

  if (Math.abs(lx) < GAMEPAD_DEADZONE) lx = 0;
  if (Math.abs(ly) < GAMEPAD_DEADZONE) ly = 0;

  // Feed into same movement path as mobile joystick
  S.moveX = lx;
  S.moveY = ly;

  // Fire: X (0) or R2 (7)
  const fire =
    gp.buttons[0]?.pressed || // X
    gp.buttons[7]?.pressed;   // R2

  S.firing = !!fire;
}

// poll once per frame using RAF (safe + isolated)
function gamepadLoop() {
  pollGamepad();
  requestAnimationFrame(gamepadLoop);
}
gamepadLoop();

  };
})();