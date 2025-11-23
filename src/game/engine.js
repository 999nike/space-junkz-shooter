// =========================================================
//  ENGINE INIT (FULL PATCHED + CLEANED)  
//  WizzCoin HUD support + redundant cleanup
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

  S.canvas.width = window.innerWidth * 0.90;
  S.canvas.height = window.innerHeight * 0.90;

  S.W = S.canvas.width;
  S.H = S.canvas.height;

  // ---------- HUD ELEMENTS ----------
  S.scoreEl  = document.getElementById("score");
  S.livesEl  = document.getElementById("lives");
  S.coinsEl  = document.getElementById("coins");   // ⭐ NEW for WizzCoin
  S.msgEl    = document.getElementById("msg");
  S.startBtn = document.getElementById("startBtn");

  // Load sprites
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
//  BULLET SYSTEM (ANGLE-BASED SHOOTING)
// =========================================================
window.shoot = function shoot() {
  const S = window.GameState;
  const player = S.player;
  const spread = player.weaponLevel;
  const bulletSpeed = 520;

  const baseAngle =
    typeof player.angle === "number" ? player.angle : -Math.PI / 2;

  function makeBullet(angleOffset, colour) {
    const a = baseAngle + angleOffset;
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
    S.bullets.push(
      makeBullet(-0.08, "#a8ffff"),
      makeBullet(0.08, "#a8ffff")
    );
  } else {
    S.bullets.push(
      makeBullet(0, "#a8ffff"),
      makeBullet(-0.18, "#ff8ad4"),
      makeBullet(0.18, "#fffd8b")
    );
  }
};

// =========================================================
//  GAME RESET (NOW INCLUDES WizzCoin RESET)
// =========================================================
window.resetGameState = function resetGameState() {
  const S = window.GameState;

  S.enemies = [];
  S.bullets = [];
  S.enemyBullets = [];
  S.powerUps = [];
  S.particles = [];
  S.spawnTimer = 0;
  S.shootTimer = 0;

  S.score = 0;
  S.lives = 995;  

// ---------- WIZZCOIN RESET ----------
  S.wizzCoins = 0;
  if (S.coinsEl) S.coinsEl.textContent = 0;

  // Boss reset
  S.bossSpawned = false;       // old timer flag (scorpion)
  S.bossTimer = 0;
  S.geminiBossSpawned = false; // NEW: has Gemini spawned yet?

  // Update HUD
  if (S.livesEl) S.livesEl.textContent = S.lives;

  S.player.x = S.W / 2;
  S.player.y = S.H - 80;
  S.player.weaponLevel = 1;
  S.player.invuln = 0;
};

// =========================================================
//  ENGINE STARTUP + START BUTTON ATTACH (FINAL CLEAN VERSION)
// =========================================================
window.addEventListener("load", () => {
  window.initEngine();
  window.initStars();
  window.resetGameState();
  window.setupInput();

  // ---------- START BUTTON ----------
  window.GameState.startBtn.addEventListener("click", () => {
    const S = window.GameState;

    // Reset + start game
    window.resetGameState();
    S.running = true;

    window.flashMsg("GOOD LUCK, COMMANDER");

    // ---------- MUSIC PLAY ----------
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
