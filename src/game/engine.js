// =========================================================
//  ENGINE INIT (FULL PATCHED + CLEANED)  
//  WizzCoin HUD support + Leaderboard Safe Start
// =========================================================
window.GameState = window.GameState || {};
Object.assign(window.GameState, {
  W: 0,
  H: 0,
  canvas: null,
  ctx: null,
  player: Object.assign(window.GameState.player || {}, {
    x: 0,
    y: 0,
    angle: 0,
    speed: 260,
    weaponLevel: 1,
    invuln: 0
  })
});

window.GameState.showFPS = true;

// =========================================================
//  INIT ENGINE
// =========================================================
window.initEngine = function initEngine() {
  const S = window.GameState;

  // Canvas
  S.canvas = document.getElementById("game");
  S.ctx = S.canvas.getContext("2d");

  // Match viewport with 15% reduction (UI + input safe)
const SCALE = 0.85;

S.canvas.width  = Math.floor(window.innerWidth  * SCALE);
S.canvas.height = Math.floor(window.innerHeight * SCALE);

// Center canvas visually (CSS-safe)
S.canvas.style.display = "block";
S.canvas.style.margin  = "auto";

S.W = S.canvas.width;
S.H = S.canvas.height;
  // HUD elements
  S.scoreEl  = document.getElementById("score");
  S.livesEl  = document.getElementById("lives");
  S.coinsEl  = document.getElementById("coins");
  S.msgEl    = document.getElementById("msg");
  S.startBtn = document.getElementById("startBtn");

  if (typeof window.loadSprites === "function") {
    window.loadSprites();
  }

  // Player spawn
  S.player.x = S.W / 2;
  S.player.y = S.H - 80;

  S.lastTime = 0;
  S.running = false;
};

// =========================================================
//  FLASH MESSAGE
// =========================================================
window.flashMsg = function flashMsg(text) {
  const S = window.GameState;
  if (!S.msgEl) return;
  S.msgEl.textContent = text;

  clearTimeout(S._msgTimeout);
  S._msgTimeout = setTimeout(() => {
    S.msgEl.textContent = "";
  }, 1600);
};

// =========================================================
//  SHOOT SYSTEM
// =========================================================
window.shoot = function shoot() {
  const S = window.GameState;
  const player = S.player;
  const spread = player.weaponLevel;
  const bulletSpeed = 520;
  const baseAngle =
    typeof player.angle === "number" ? player.angle : -Math.PI / 2;

  function makeBullet(offset, colour) {
    const a = baseAngle + offset;
    return {
      x: player.x,
      y: player.y,
      radius: 6,
      colour,
      vx: Math.cos(a) * bulletSpeed,
      vy: Math.sin(a) * bulletSpeed
    };
  }

  if (spread === 1) {
    S.bullets.push(makeBullet(0, "#a8ffff"));
  } else if (spread === 2) {
    S.bullets.push(makeBullet(-0.08, "#a8ffff"), makeBullet(0.08, "#a8ffff"));
  } else {
    S.bullets.push(
      makeBullet(0, "#a8ffff"),
      makeBullet(-0.18, "#ff8ad4"),
      makeBullet(0.18, "#fffd8b")
    );
  }
// ---- BULLET SOUND ----
try {
  const pew = new Audio("./src/game/assets/sfx_lose.ogg");
  pew.volume = 0.35;
  pew.play().catch(() => {});
} catch (err) {
  console.warn("Bullet sound failed:", err);
}
};

// =========================================================
//  GAME RESET — CLEAN + FIXED + NO SCORE WIPE
// =========================================================
window.resetGameState = function resetGameState() {
  const S = window.GameState;

  if (window.initStars) window.initStars();

  S.enemies      = [];
  S.bullets      = [];
  S.enemyBullets = [];
  S.powerUps     = [];
  S.particles    = [];
  S.spawnTimer   = 0;
  S.shootTimer   = 0;

  // Input
  S.firing = false;

  // Allies
  S.sidekicks = [];
  S.rockets   = [];

  // Health
  S.maxLives = 100;
  S.lives    = 100;

  S.shield    = 0;
  S.maxShield = 100;

  // Boss flags
  S.bossSpawned       = false;
  S.bossTimer         = 0;
  S.geminiBossSpawned = false;

  // HUD updates
  if (S.livesEl)  S.livesEl.textContent  = S.lives;
  if (S.scoreEl)  S.scoreEl.textContent  = S.score ?? 0;
  if (S.coinsEl)  S.coinsEl.textContent  = S.wizzCoins ?? 0;

  // Player reset
  S.player.x           = S.W / 2;
  S.player.y           = S.H - 80;
  S.player.weaponLevel = 1;
  S.player.invuln      = 0;

};



// =========================================================
//  ENGINE STARTUP + FIXED START BUTTON
// =========================================================
window.addEventListener("load", () => {
  requestAnimationFrame(() => {
    window.initEngine();
    window.initStars();
    window.setupInput();
  });

  // --- FIXED START BUTTON (STARTS INTRO ONLY) ---
  window.GameState.startBtn.addEventListener("click", () => {
    const S = window.GameState;

    // 🛑 If ANY level is active → ignore the Start button
    if (
      (window.Level2 && window.Level2.active) ||
      (window.Level3 && window.Level3.active) ||
      (window.Level4 && window.Level4.active)
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
//  DEBUG INPUT: F3 TOGGLE FPS OVERLAY
// =========================================================
window.addEventListener("keydown", (e) => {
  if (e.code === "F3") {
    const S = window.GameState;
    S.showFPS = !S.showFPS;
    console.log("FPS Overlay:", S.showFPS ? "ON" : "OFF");
  }
});

// =========================================================
//  MAIN LOOP
// =========================================================
window.gameLoop = function gameLoop(timestamp) {

// ---------------------------------------------------
  // MODE DISPATCH (engine gate)
  // Ensures only ONE mode runs: Map, Home, or Levels
  // ---------------------------------------------------
  const S = window.GameState;

  // WORLD MAP TAKES PRIORITY
  if (window.WorldMap && window.WorldMap.active) {
    if (typeof window.WorldMap.update === "function") {
      window.WorldMap.update(0); // minimal tick to keep map responsive
    }
    if (typeof window.WorldMap.draw === "function") {
      window.WorldMap.draw(S.ctx);
    }
    requestAnimationFrame(gameLoop);
    return;
  }

  // HOMEBASE (if active)
  if (window.HomeBase && window.HomeBase.active) {
    if (typeof window.HomeBase.update === "function") {
      window.HomeBase.update(0);
    }
    if (typeof window.HomeBase.draw === "function") {
      window.HomeBase.draw(S.ctx);
    }
    requestAnimationFrame(gameLoop);
    return;
  }

  // Calculate delta & FPS
  if (!S.lastTime) S.lastTime = timestamp;
  const frameTime = timestamp - S.lastTime;
  const dt = frameTime / 1000;
  S.lastTime = timestamp;

  // FPS smoothing (clamped to 120)
const rawFPS = 1000 / frameTime;
S.fps = S.fps
  ? (S.fps * 0.9 + rawFPS * 0.1)
  : rawFPS;

// Clamp max FPS for stability (allow 120Hz monitors)
if (!isFinite(S.fps) || S.fps > 120) S.fps = 120;

// Smoother at high refresh rates
S.fps = Math.round(S.fps);

  // Run game update
  if (S.running) {
    window.updateGame(dt);
  }

  // Draw game normally
  window.drawGame();

  // ---- FPS Overlay ----
  const ctx = S.ctx;
  ctx.save();
  ctx.font = "16px monospace";
  ctx.fillStyle = "rgba(0,255,255,0.85)";
  ctx.fillText(`FPS: ${S.fps.toFixed(0)}`, 20, 30);
  ctx.fillText(`Frame: ${frameTime.toFixed(2)} ms`, 20, 52);
  ctx.restore();

  requestAnimationFrame(window.gameLoop);
};