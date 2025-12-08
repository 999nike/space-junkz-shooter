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
  wizzCoins: 0,   // ⭐ NEW
  killsSinceShieldDrop: 0,
  hasShieldA: false,
  hasShieldB: false,
  shieldUnlocked: false,

  // Entities
  stars: [],
  enemies: [],
  bullets: [],
  enemyBullets: [],
  powerUps: [],
  particles: [],
  sidekicks: [],
  rockets: [],

  // Thruster ember particles (afterburner effect)
  thrustParticles: [],

  // Timers
  spawnTimer: 0,
  shootTimer: 0,

  // Sprites (individual + atlas bucket)
  shipImage: null,   // player ship
  fireImage: null,   // optional future

  sprites: {
    playerBullet: null,     // Bullet_player.png
    enemyBullet: null,      // Laser.png
    megaBeam: null,         // laser.png (future beam)
    explosionSheet: null,   // Explo01.png
    bossScorpion: null,     // oldSCORPIO2.png

    // NEW — 3-frame thruster animation frames
    thrusterFrames: []
  },

  // Player
  player: {
    x: 180,
    y: 560,
    radius: 22,
    speed: 250,
    weaponLevel: 1,
    invuln: 0,
    bank: 0,
    angle: -Math.PI / 2
  },

  // Input state
  keys: {},

  // Pointer tracking
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
window.loadSprites = function loadSprites() {
  const S = window.GameState;
  if (!S) return;

  const sprites = (S.sprites = S.sprites || {});

  // ---------- MISSION 3 (SHATTERED ARMADA) – BACKBLAZE URL TABLE ----------
  const Assets = (window.Assets = window.Assets || {});
  const B2_BASE = "https://f003.backblazeb2.com/file/space-junkz-assets/";

  // Video background (Mission 3 only – DOES NOT replace intro/M1/M2)
  Assets.mission3Video =
    B2_BASE + "junkz-assets/background/mission3_bg.mp4";

  // Mega boss + escorts + turrets
  Assets.m3BossURL =
    B2_BASE + "junkz-assets/bosses/075d2a4805f91a3137982e248ddf6a6d.jpg";
  Assets.m3EscortURL =
    B2_BASE + "junkz-assets/bosses/2e26f1ff3ab22cb18c43bf90d9fc3c9b.jpg";
  Assets.m3TurretSheetURL =
    B2_BASE + "junkz-assets/bosses/e6344f017d835a5cb8de571670912fac.jpg";

  // Rocket + bomb sheets (used for new turret fire patterns)
  Assets.m3RocketSheetURL =
    B2_BASE + "junkz-assets/bullets/Free-Space-Shooter-Game-Objects.gif";
  Assets.m3BombSheetURL =
    B2_BASE + "junkz-assets/bullets/Free-Space-Shooter-Game-Objects4.gif";

  // Explosion / flame frames folder (boss kill + damage FX)
  Assets.m3ExplosionFolder =
    B2_BASE + "junkz-assets/explosions1/";

  function makeImage(path) {
    const img = new Image();
    img.src = path;

    img.onerror = () => console.error("❌ Failed to load:", path);
    img.onload = () => console.log("✅ Loaded:", path);

    return img;
  }

  // Sidekick ship (parafighter drone)
  sprites.sideShip = makeImage("./src/game/assets/parafighter.png");

  // Rocket bullet (used by sidekicks)
  sprites.rocket = makeImage("./src/game/assets/rocket.png");

  // Player bullet
  sprites.playerBullet = makeImage("./src/game/assets/Bullet_player.png");

  // Enemy bullet orb
  sprites.enemyBullet = makeImage("./src/game/assets/Laser.png");

  // Mega-beam (tail laser)
  sprites.megaBeam = makeImage("./src/game/assets/laser.png");

  // Explosion sheet
  sprites.explosionSheet = makeImage("./src/game/assets/Explo01.png");

  // Boss (scorpion)
  sprites.bossScorpion = makeImage("./src/game/oldSCORPIO2.png");

  // Boss 2 (Gemini Warship)
  sprites.bossGemini = makeImage("./src/game/oldGEMINI2.png");

  // Shield parts
  sprites.shieldPartA = makeImage("./src/game/assets/shield_part_A.png");
  sprites.shieldPartB = makeImage("./src/game/assets/shield_part_B.png");

  // Enemy ship sprites
  sprites.enemyGrunt   = makeImage("./src/game/assets/oldARIES2.png");
  sprites.enemyZigzag  = makeImage("./src/game/assets/oldLIBRA12.png");
  sprites.enemyShooter = makeImage("./src/game/assets/oldTAURUS2.png");
  sprites.enemyTank    = makeImage("./src/game/assets/cruiser.png");

  // ---------- VIDEO BACKGROUND (MP4) ----------
const vid = document.createElement("video");
vid.src = "./src/game/assets/pismis24.mp4";
vid.autoplay = true;
vid.loop = true;
vid.muted = true;         // REQUIRED for autoplay
vid.playsInline = true;   // iOS + Android support
vid.preload = "auto";

vid.oncanplay = () => {
  console.log("🎥 Background video ready");
  vid.play().catch(() => {}); // ensure playback
};

sprites.nebulaBG = vid;

  // ---- THRUSTER STRIP (3 FRAME PNG) ----
  const thrusterStrip = makeImage("./src/game/assets/thruster_strip.png");

  thrusterStrip.onload = () => {
    const fw = thrusterStrip.width / 3;  // 3 frames horizontally
    const fh = thrusterStrip.height;

    for (let i = 0; i < 3; i++) {
      const c = document.createElement("canvas");
      c.width = fw;
      c.height = fh;

      const cc = c.getContext("2d");
      cc.drawImage(thrusterStrip, -i * fw, 0);

      S.sprites.thrusterFrames.push(c);
    }

    console.log("🔥 Thruster frames loaded:", S.sprites.thrusterFrames.length);
  };

  // ---------- MISSION 3 SPRITES (MEGA BOSS, ESCORTS, TURRETS, FX) ----------
  (function initMission3Sprites() {
    const A = (window.Assets = window.Assets || {});
    if (!A.m3BossURL) return; // Mission 3 not configured

    // Ensure arrays
    A.m3TurretFrames = A.m3TurretFrames || [];
    A.explosionFrames = A.explosionFrames || [];
    A.flameFrames = A.flameFrames || [];

    // Mega boss ship
    if (!A.m3Boss && A.m3BossURL) {
      const img = new Image();
      img.src = A.m3BossURL;
      img.onload = () => console.log("✅ Loaded Mission 3 boss:", img.src);
      img.onerror = () => console.error("❌ Failed Mission 3 boss:", img.src);
      A.m3Boss = img;
    }

    // Escort mini-bosses (all use same sprite)
    if (!A.m3Escort && A.m3EscortURL) {
      const img = new Image();
      img.src = A.m3EscortURL;
      img.onload = () => console.log("✅ Loaded Mission 3 escort:", img.src);
      img.onerror = () => console.error("❌ Failed Mission 3 escort:", img.src);
      A.m3Escort = img;
    }

    // Rocket / bomb sheets (frame layout handled by renderer)
    if (A.m3RocketSheetURL && !A.m3RocketSheet) {
      const img = new Image();
      img.src = A.m3RocketSheetURL;
      img.onload = () => console.log("✅ Loaded Mission 3 rocket sheet:", img.src);
      img.onerror = () => console.error("❌ Failed Mission 3 rocket sheet:", img.src);
      A.m3RocketSheet = img;
    }

    if (A.m3BombSheetURL && !A.m3BombSheet) {
      const img = new Image();
      img.src = A.m3BombSheetURL;
      img.onload = () => console.log("✅ Loaded Mission 3 bomb sheet:", img.src);
      img.onerror = () => console.error("❌ Failed Mission 3 bomb sheet:", img.src);
      A.m3BombSheet = img;
    }

    // Turret sheet (4 frames stacked vertically)
    if (A.m3TurretSheetURL && (!A.m3TurretFrames || !A.m3TurretFrames.length)) {
      const sheet = new Image();
      sheet.src = A.m3TurretSheetURL;

      sheet.onload = () => {
        const fw = sheet.width;
        const fh = sheet.height / 4; // 4 turrets vertically

        A.m3TurretFrames = [];
        for (let i = 0; i < 4; i++) {
          const c = document.createElement("canvas");
          c.width = fw;
          c.height = fh;

          const ctx = c.getContext("2d");
          ctx.drawImage(sheet, 0, -i * fh);

          A.m3TurretFrames.push(c);
        }

        console.log("✅ Mission 3 turret frames:", A.m3TurretFrames.length);
      };

      sheet.onerror = () =>
        console.error("❌ Failed Mission 3 turret sheet:", sheet.src);

      A.m3TurretSheet = sheet;
    }

    // Explosion frames: boom01.png → boom08.png (scaled at render-time)
    if (A.m3ExplosionFolder && (!A.explosionFrames || !A.explosionFrames.length)) {
      A.explosionFrames = [];
      for (let i = 1; i <= 8; i++) {
        const num = String(i).padStart(2, "0");
        const img = new Image();
        img.src = A.m3ExplosionFolder + "boom" + num + ".png";
        img.onload = () =>
          console.log("✅ Loaded Mission 3 explosion frame:", img.src);
        img.onerror = () =>
          console.error("❌ Failed Mission 3 explosion frame:", img.src);
        A.explosionFrames.push(img);
      }
    }

    // Flame frames: flame0.png → flame5.png (engine / damage effect)
    if (A.m3ExplosionFolder && (!A.flameFrames || !A.flameFrames.length)) {
      A.flameFrames = [];
      for (let i = 0; i <= 5; i++) {
        const img = new Image();
        img.src = A.m3ExplosionFolder + "flame" + i + ".png";
        img.onload = () =>
          console.log("✅ Loaded Mission 3 flame frame:", img.src);
        img.onerror = () =>
          console.error("❌ Failed Mission 3 flame frame:", img.src);
        A.flameFrames.push(img);
      }
    }
  })();
};