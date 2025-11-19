// ---------- ASSETS / GLOBAL STATE ----------

window.GameState = {
  // Canvas + drawing
  canvas: null,
  ctx: null,
  W: 480,
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

  // Sprites (individual + atlas bucket)
  shipImage: null,   // player ship
  fireImage: null,   // optional thruster sprite (future)
  sprites: {
    playerBullet: null,     // Bullet_player.png
    enemyBullet: null,      // Laser.png
    megaBeam: null,         // laser.png (future beam)
    explosionSheet: null,   // Explo01.png
    bossScorpion: null      // oldSCORPIO2.png
  },

  // Player
  player: {
    x: 180,
    y: 560,
    radius: 22,        // collision radius
    speed: 250,
    weaponLevel: 1,    // 1 = single, 2 = twin, 3 = spread
    invuln: 0,
    bank: 0,           // -1 left, +1 right, 0 neutral
    angle: -Math.PI / 2 // facing "up" by default
  },

  // Input state
  keys: {},

  // Pointer tracking (for angle-based shooting)
  mouseX: 0,
  mouseY: 0
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

// ---------- SPRITE LOADER ----------
// Centralised place to hang all images used by the renderer / logic.
// Safe to call multiple times; it just rewires the same objects.
window.loadSprites = function loadSprites() {
  const S = window.GameState;
  if (!S) return;

  const sprites = (S.sprites = S.sprites || {});

  function makeImage(path) {
    const img = new Image();
    img.src = path;
    return img;
  }

  // Player bullet sheet (multi-frame, animated later)
  sprites.playerBullet = makeImage("./src/game/assets/Bullet_player.png");

  // Enemy bullet orb
  sprites.enemyBullet = makeImage("./src/game/assets/Laser.png");

  // Mega-beam shaft (reserved for later step)
  sprites.megaBeam = makeImage("./src/game/assets/laser.png");

  // Explosion atlas (we’ll animate this in the explosion step)
  sprites.explosionSheet = makeImage("./src/game/assets/Explo01.png");

  // Boss sprite (Scorpion)
  sprites.bossScorpion = makeImage("./src/game/oldSCORPIO2.png");
};
