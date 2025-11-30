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

// =========================================================
//  INIT ENGINE
// =========================================================
window.initEngine = function initEngine() {
  const S = window.GameState;

  // Canvas
  S.canvas = document.getElementById("game");
  S.ctx = S.canvas.getContext("2d");

  // Match viewport exactly
  S.canvas.width  = window.innerWidth;
  S.canvas.height = window.innerHeight;
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
//  ENGINE STARTUP (AUTO-START LEVEL 1)
// =========================================================
window.addEventListener("load", () => {
  requestAnimationFrame(() => {
    window.initEngine();
    window.initStars();
    window.setupInput();
  });

  // --- DISABLED START BUTTON ---
  window.GameState.startBtn.addEventListener("click", () => {
    console.log("⚠ START BUTTON DISABLED — AUTO MODE ACTIVE");
  });

  // --- AUTO START LEVEL 1 ON GAME LOAD ---
  setTimeout(() => {
    if (window.Level1 && typeof window.Level1.enter === "function") {
      console.log("🔥 AUTO-STARTING LEVEL 1 (INTRO)");
      window.Level1.enter();
    } else {
      console.warn("⚠ Level1 not found — cannot auto-start.");
    }
  }, 600);
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