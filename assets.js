// ---------- ASSETS / GLOBAL STATE ----------

window.GameState = {
  // Canvas + drawing
  canvas: null,
  ctx: null,
  W: 360,
  H: 640,

  // UI
  scoreEl: null,
  livesEl: null,
  msgEl: null,
  startBtn: null,

  // Game state
  running: false,
  lastTime: 0,
  score: 0,
  lives: 3,

  // Entities
  stars: [],
  enemies: [],
  bullets: [],
  enemyBullets: [],
  powerUps: [],
  particles: [],

  // Timers
  spawnTimer: 0,
  shootTimer: 0,

  // Player
  player: {
    x: 180,
    y: 560,
    radius: 14,
    speed: 250,
    weaponLevel: 1, // 1 = single, 2 = twin, 3 = spread
    invuln: 0
  }
};

// Helpers
window.rand = function rand(min, max) {
  return Math.random() * (max - min) + min;
};

window.clamp = function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
};

window.circleHit = function circleHit(a, b, pad = 0) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const r = (a.radius || 0) + (b.radius || 0) + pad;
  return dx * dx + dy * dy <= r * r;
};
