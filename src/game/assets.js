// =========================================================
//  ASSETS.JS – NOVA MODE READY
//  Sprites, Player Base Stats, Physics (vx/vy)
// =========================================================

// Global GameState container
window.GameState = window.GameState || {};

// ----------------------------
//  SPRITE LOADER
// ----------------------------
window.loadSprites = function loadSprites() {
  const S = window.GameState;
  S.sprites = {};

  function add(name, src) {
    const img = new Image();
    img.src = src;
    S.sprites[name] = img;
  }

  // --- Core Sprites ---
  add("ship",        "./src/game/assets/ship.png");
  add("playerBullet","./src/game/assets/bullet_blue.png");
  add("enemyBullet", "./src/game/assets/bullet_yellow.png");
  add("explosionSheet", "./src/game/assets/Explo01.png");

  // Boss / Side ships
  add("bossScorpion", "./src/game/assets/boss_scorpion.png");
  add("bossGemini",   "./src/game/assets/boss_gemini.png");
  add("sideShip",     "./src/game/assets/side_ship.png");
  add("rocket",       "./src/game/assets/rocket.png");

  // Backgrounds
  // NOTE: matches your actual file name nebula_bg.png
  add("nebulaBG", "./src/game/assets/nebula_bg.png");

  // Player ship (cached for renderer.js)
  S.shipImage = S.sprites.ship;
};

// =========================================================
//  PLAYER BASE + PHYSICS (NOVA MODE)
// =========================================================
window.GameState.player = {
  x: 0,
  y: 0,
  radius: 16,

  // ---------- NOVA THRUSTER PHYSICS ----------
  vx: 0,            // horizontal velocity
  vy: 0,            // vertical velocity
  accel: 680,       // thrust power (adjust to taste)
  drag: 0.86,       // friction / space resistance
  maxSpeed: 480,    // cap (Nova uses capped but slippery)

  // ---------- AIM & VISUALS ----------
  angle: -Math.PI / 2,
  bank: 0,          // visual lean during turns

  // ---------- COMBAT ----------
  weaponLevel: 1,
  invuln: 0,

  // ---------- SHIP SYSTEMS ----------
  speed: 260,       // legacy – still used by rockets/sidekicks
};

// =========================================================
//  INITIAL VALUES AT ENGINE START
// =========================================================
window.preparePlayerForStart = function preparePlayerForStart() {
  const S = window.GameState;
  const p = S.player;

  p.x = S.W / 2;
  p.y = S.H - 80;

  p.vx = 0;
  p.vy = 0;
  p.bank = 0;

  p.weaponLevel = 1;
  p.invuln = 0;
};
