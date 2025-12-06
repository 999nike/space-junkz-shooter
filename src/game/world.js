// =========================================================
//  WORLD MAP – PILLARS SECTOR (PARALLAX GALAXY MAP)
//  Level Select / Galaxy View
// =========================================================
(function () {
  const S = window.GameState;

  // ------ CONFIG ------
  const BG_IMAGE_SRC = "./src/game/assets/25th_m16.jpg"; // starmap image
  const NODE_RADIUS = 16;

  // ------ MAP NODES ------
  const NODES = [
    {
      id: "home",
      xFactor: 0.18,
      yFactor: 0.78,
      label: "HOME BASE",
      unlocked: true,
    },
    {
      id: "lvl2",
      xFactor: 0.38,
      yFactor: 0.45,
      label: "MISSION 1",
      unlocked: true,
    },
    {
      id: "lvl3",
      xFactor: 0.68,
      yFactor: 0.32,
      label: "MISSION 2",
      unlocked: true,
    },
    {
      id: "lvl4",
      xFactor: 0.78,
      yFactor: 0.25,
      label: "MISSION 3",
      unlocked: true,
    },
    {
      id: "lvl5",
      xFactor: 0.82,
      yFactor: 0.42,
      label: "MISSION 4",
      unlocked: true,
    },
    {
      id: "lvl6",
      xFactor: 0.74,
      yFactor: 0.56,
      label: "MISSION 5",
      unlocked: true,
    },
    {
      id: "lvl7",
      xFactor: 0.60,
      yFactor: 0.68,
      label: "LEVEL 6 - TBA",
      unlocked: false,
    },
    {
      id: "lvl8",
      xFactor: 0.46,
      yFactor: 0.70,
      label: "LEVEL 7 - TBA",
      unlocked: false,
    },
    {
      id: "lvl9",
      xFactor: 0.32,
      yFactor: 0.64,
      label: "LEVEL 8 - TBA",
      unlocked: false,
    },
    {
      id: "lvl10",
      xFactor: 0.26,
      yFactor: 0.50,
      label: "LEVEL 9 - TBA",
      unlocked: false,
    },
    {
      id: "lvl11",
      xFactor: 0.22,
      yFactor: 0.36,
      label: "LEVEL 10 - TBA",
      unlocked: false,
    },
    {
      id: "secret",
      xFactor: 0.82,
      yFactor: 0.62,
      label: "???",
      unlocked: false,
    },
  ];

  // ======================================================
  // AUTO-UNLOCK HELPER
  // ======================================================
  window.unlockNextLevel = function (currentLevel) {
    const nextId = "lvl" + (currentLevel + 1);

    const node = NODES.find((n) => n.id === nextId);
    if (node) node.unlocked = true;

    if (window.WorldMap && Array.isArray(window.WorldMap.nodes)) {
      const live = window.WorldMap.nodes.find((n) => n.id === nextId);
      if (live) live.unlocked = true;
    }

    console.log("Unlocked:", nextId);
  };

  // ======================================================
  // WORLD MAP OBJECT
  // ======================================================
  const WorldMap = {
    active: false,
    canvas: null,
    ctx: null,
    bgImage: null,
    bgLoaded: false,
    layers: [],
    nodes: [],
    ship: {
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
      speed: 3.0,
    },
    _inputBound: false,

    // ------ INIT ------
    init() {
      this.canvas = S.canvas;
      this.ctx = S.ctx;
      if (!this.canvas || !this.ctx) return;

      this.bgImage = new Image();
      this.bgImage.src = BG_IMAGE_SRC;
      this.bgImage.onload = () => (this.bgLoaded = true);

      this.layers = [
        this._makeLayer(40, 4, 0.3),
        this._makeLayer(60, 9, 0.6),
        this._makeLayer(90, 16, 1.0),
      ];

      this.nodes = NODES.map((n) => ({
        ...n,
        x: n.xFactor * S.W,
        y: n.yFactor * S.H,
      }));

      const home = this.nodes.find((n) => n.id === "home") || this.nodes[0];
      this.ship.x = this.ship.tx = home.x;
      this.ship.y = this.ship.ty = home.y + 60;

      this._bindInput();
    },

    // ------ ENTER ------
    enter() {
      // Hard switch into MAP mode: no level or homebase active
      if (window.Level2) window.Level2.active = false;
      if (window.Level3) window.Level3.active = false;
      if (window.HomeBase) window.HomeBase.active = false;

      if (S) S.running = false; // shooter loop off while on map

      this.init();
      this.active = true;
    },

    exit() {
      this.active = false;
    },

    // ------ LAYER FACTORY ------
    _makeLayer(count, speed, alphaBase) {
      const stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * S.W,
          y: Math.random() * S.H,
          size: 1 + Math.random() * 2,
          alpha: alphaBase + Math.random() * 0.3,
        });
      }
      return {
        stars,
        speed,
        driftX: (Math.random() * 2 - 1) * 0.15,
        driftY: (Math.random() * 2 - 1) * 0.15,
      };
    },

    // ------ INPUT ------
    _bindInput() {
      if (!this.canvas || this._inputBound) return;
      this._inputBound = true;

      this.canvas.addEventListener("click", (ev) => {
        if (!this.active) return;

        const rect = this.canvas.getBoundingClientRect();
        const x =
          (ev.clientX - rect.left) * (this.canvas.width / rect.width);
        const y =
          (ev.clientY - rect.top) * (this.canvas.height / rect.height);

        const clicked = this._hitNode(x, y);
        if (clicked && clicked.unlocked) {
          this._moveShipToNode(clicked);
        }
      });
    },

    _hitNode(x, y) {
      for (const n of this.nodes) {
        const dx = x - n.x;
        const dy = y - n.y;
        if (Math.hypot(dx, dy) <= NODE_RADIUS * 1.2) {
          return n;
        }
      }
      return null;
    },

   // --------------------------------------------------
    // MOVE SHIP + ENTER LEVEL / HOME / MISSIONS
    // --------------------------------------------------
    _moveShipToNode(node) {
      const S = window.GameState;
      if (!node) return;

      // Move ship target for visual travel
      this.ship.tx = node.x;
      this.ship.ty = node.y - 60;

      // Helper: start a level safely (with optional fallback)
      const startLevel = (globalName, levelIndex, fallbackName) => {
        const lvl = window[globalName];

        // We are leaving the map now
        this.active = false;

        if (lvl && typeof lvl.enter === "function") {
          if (S) S.currentLevel = levelIndex || null;
          lvl.enter();
          return;
        }

        // Optional fallback (eg. reuse Level2 for unimplemented)
        if (fallbackName) {
          const fb = window[fallbackName];
          if (fb && typeof fb.enter === "function") {
            console.warn(
              `WorldMap: ${globalName} missing, using ${fallbackName} instead.`
            );
            if (S) S.currentLevel = levelIndex || null;
            fb.enter();
            return;
          }
        }

        // Nothing to load → keep map alive so you don't get a freeze
        console.warn(`WorldMap: No handler for ${globalName}. Staying on map.`);
        this.active = true;
        if (window.flashMsg) {
          window.flashMsg("DEV: Level not wired yet.");
        }
      };

      // ------ HOME BASE ------
      if (node.id === "home") {
        this.active = false;
        if (window.HomeBase && window.HomeBase.enter) {
          window.HomeBase.enter();
        }
        return;
      }

      // ------ INTRO REPLAY (if you add a lvl1 node later) ------
      if (node.id === "lvl1") {
        this.active = false;
        if (window.resetGameState) {
          window.resetGameState(); // intro engine reset
        }
        if (S) {
          S.running = true;
          S.currentLevel = 1;
        }
        return;
      }

      // ------ MISSION 1  (lvl2.js → Level2) ------
      if (node.id === "lvl2") {
        startLevel("Level2", 2);
        return;
      }

      // ------ MISSION 2  (lvl3.js → Level3) ------
      if (node.id === "lvl3") {
        startLevel("Level3", 3, "Level2");
        return;
      }

      // ------ MISSION 3  (Level4 clone test) ------
      if (node.id === "lvl4") {
        startLevel("Level4", 4, "Level2");
        return;
      }

      // ------ MISSION 4  (lvl5.js → Level5) ------
      if (node.id === "lvl5") {
        startLevel("Level5", 5, "Level2");
        return;
      }

      // ------ MISSION 5  (TEMP: reuse Level5 – no Level6 yet) ------
      if (node.id === "lvl6") {
        // There is no window.Level6 in your files, so reuse Level5 for now
        startLevel("Level5", 5, "Level2");
        return;
      }

      // ------ FUTURE NODES: TEMP → Level2 ------
      if (["lvl7", "lvl8", "lvl9", "lvl10", "lvl11", "secret"].includes(node.id)) {
        startLevel("Level2", 2);
        return;
      }

      // Unknown node id – do nothing but keep map active
      console.warn("WorldMap: clicked unknown node id:", node.id);
    },

    // ------ UPDATE ------
    update(dt) {
      if (!this.active) return;

      for (const layer of this.layers) {
        for (const s of layer.stars) {
          s.x += layer.driftX * layer.speed * dt;
          s.y += layer.driftY * layer.speed * dt;

          if (s.x < -10) s.x = S.W + 10;
          if (s.x > S.W + 10) s.x = -10;
          if (s.y < -10) s.y = S.H + 10;
          if (s.y > S.H + 10) s.y = -10;
        }
      }

      const dx = this.ship.tx - this.ship.x;
      const dy = this.ship.ty - this.ship.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 2) {
        const vx =
          (dx / dist) * this.ship.speed * (S.W / 1280) * 60 * dt;
        const vy =
          (dy / dist) * this.ship.speed * (S.H / 720) * 60 * dt;
        this.ship.x += vx;
        this.ship.y += vy;
      }
    },

    // ------ DRAW ------
    draw(ctx) {
      if (!this.active) return;

      ctx.clearRect(0, 0, S.W, S.H);

      if (this.bgLoaded && this.bgImage) {
        ctx.drawImage(this.bgImage, 0, 0, S.W, S.H);
      } else {
        const g = ctx.createLinearGradient(0, 0, 0, S.H);
        g.addColorStop(0, "#05010a");
        g.addColorStop(1, "#070f1f");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, S.W, S.H);
      }

      for (const n of this.nodes) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(n.x, n.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = n.unlocked
          ? "rgba(0,255,255,0.8)"
          : "rgba(120,120,120,0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();

        const grad = ctx.createRadialGradient(
          n.x,
          n.y,
          0,
          n.x,
          n.y,
          NODE_RADIUS
        );

        if (n.unlocked) {
          grad.addColorStop(0, "#00f7ff");
          grad.addColorStop(1, "rgba(0,247,255,0)");
        } else {
          grad.addColorStop(0, "#999999");
          grad.addColorStop(1, "rgba(150,150,150,0)");
        }
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.font = "14px system-ui, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(n.label, n.x, n.y + NODE_RADIUS + 18);

        ctx.restore();
      }

      ctx.save();
      ctx.translate(this.ship.x, this.ship.y);
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(8, 10);
      ctx.lineTo(-8, 10);
      ctx.closePath();
      ctx.fillStyle = "#00ffea";
      ctx.fill();
      ctx.restore();
    },
  };

  window.WorldMap = WorldMap;
})();