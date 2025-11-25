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
//  ENGINE STARTUP + START BUTTON
// =========================================================
window.addEventListener("load", () => {
  requestAnimationFrame(() => {
    window.initEngine();
    window.initStars();
    window.setupInput();
  });

  // ----- SNAPSHOT TRACKERS -----
// These must stay OUTSIDE the click handler so they run on page load
S._sessionStartScore = S.score ?? 0;
S._sessionStartCoins = S.wizzCoins ?? 0;
S._snapshotLastScore = S.score ?? 0;
S._snapshotLastCoins = S.wizzCoins ?? 0;

window.GameState.startBtn.addEventListener("click", () => {
  const S = window.GameState;
  const active = localStorage.getItem("sj_active_player");

  // ---- Optional pre-sync if you had stats this session ----
  if (
    active &&
    (S.score > 0 || S.wizzCoins > 0) &&
    typeof window.syncStats === "function"
  ) {
    window.syncStats(active, S.wizzCoins, S.score);
  }

  // ---- SAFETY CHECK: Player must be selected ----
  if (!active) {
    window.showPlayerSelect();
    return;
  }

  // ---- Initialize snapshot trackers for this new session ----
  S._sessionStartScore = S.score ?? 0;
  S._sessionStartCoins = S.wizzCoins ?? 0;
  S._snapshotLastScore = S.score ?? 0;
  S._snapshotLastCoins = S.wizzCoins ?? 0;

  // ---- Start the game ----
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

// First load message
window.flashMsg("Press START to play");


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