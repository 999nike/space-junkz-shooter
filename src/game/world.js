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
    id: "lvl1",
    xFactor: 0.38,
    yFactor: 0.45,
    label: "LEVEL 1 - GEMINI FIELD",
    unlocked: true,
  },
  {
    id: "lvl2",
    xFactor: 0.68,
    yFactor: 0.32,
    label: "LEVEL 2 - DRAX SYSTEM",
    unlocked: false,
  },

  // ------ FUTURE LEVEL NODES (SKELETON ONLY) ------
  {
    id: "lvl3",
    xFactor: 0.78,
    yFactor: 0.25,
    label: "LEVEL 3 - TBA",
    unlocked: false,
  },
  {
    id: "lvl4",
    xFactor: 0.82,
    yFactor: 0.42,
    label: "LEVEL 4 - TBA",
    unlocked: false,
  },
  {
    id: "lvl5",
    xFactor: 0.74,
    yFactor: 0.56,
    label: "LEVEL 5 - TBA",
    unlocked: false,
  },
  {
    id: "lvl6",
    xFactor: 0.60,
    yFactor: 0.68,
    label: "LEVEL 6 - TBA",
    unlocked: false,
  },
  {
    id: "lvl7",
    xFactor: 0.46,
    yFactor: 0.70,
    label: "LEVEL 7 - TBA",
    unlocked: false,
  },
  {
    id: "lvl8",
    xFactor: 0.32,
    yFactor: 0.64,
    label: "LEVEL 8 - TBA",
    unlocked: false,
  },
  {
    id: "lvl9",
    xFactor: 0.26,
    yFactor: 0.50,
    label: "LEVEL 9 - TBA",
    unlocked: false,
  },
  {
    id: "lvl10",
    xFactor: 0.22,
    yFactor: 0.36,
    label: "LEVEL 10 - TBA",
    unlocked: false,
  },

  // Secret / special node stays as-is
  {
    id: "secret",
    xFactor: 0.82,
    yFactor: 0.62,
    label: "???",
    unlocked: false,
  },
];

// ← END OF NODES ARRAY (PUT FUNCTION DIRECTLY BELOW THIS)

// ======================================================
// AUTO-UNLOCK HELPER (enables level progression)
//  - Updates both the NODES template and the live map
// ======================================================
window.unlockNextLevel = function (currentLevel) {
  const nextId = "lvl" + (currentLevel + 1);

  // Update template node
  const node = NODES.find((n) => n.id === nextId);
  if (node) {
    node.unlocked = true;
  }

  // Also update live WorldMap nodes if already initialised
  if (window.WorldMap && Array.isArray(window.WorldMap.nodes)) {
    const live = window.WorldMap.nodes.find((n) => n.id === nextId);
    if (live) {
      live.unlocked = true;
    }
  }

  console.log("Unlocked:", nextId);
};

  const WorldMap = {
    active: false,
    canvas: null,
    ctx: null,
    bgImage: null,
    bgLoaded: false,
    layers: [],   // parallax star layers
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

      // Background image
      this.bgImage = new Image();
      this.bgImage.src = BG_IMAGE_SRC;
      this.bgImage.onload = () => {
        this.bgLoaded = true;
      };

      // Parallax layers (far → near)
      this.layers = [
        this._makeLayer(40, 4, 0.3),  // far
        this._makeLayer(60, 9, 0.6),  // mid
        this._makeLayer(90, 16, 1.0), // near
      ];

      // Node positions from factors
      this.nodes = NODES.map((n) => ({
        ...n,
        x: n.xFactor * S.W,
        y: n.yFactor * S.H,
      }));

      // Ship starts near HOME
      const home = this.nodes.find((n) => n.id === "home") || this.nodes[0];
      this.ship.x = this.ship.tx = home.x;
      this.ship.y = this.ship.ty = home.y + 60;

      this._bindInput();
    },

    // Entry point used by blackhole + cheats
enter() {
    // Always rebuild nodes so unlockNextLevel() shows correctly
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

    // ------ INPUT BIND ------
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

    // Called by blackhole / level complete / node click
    _moveShipToNode(node) {
      this.ship.tx = node.x;
      this.ship.ty = node.y + 60;

      // ------ HOME BASE ------
      if (
        node.id === "home" &&
        window.HomeBase &&
        window.HomeBase.enter
      ) {
        this.active = false;     // stop map updates
        window.HomeBase.enter(); // enter Home Base
        return;
      }

      // ------ LEVEL 3 < lvl3.js ,,,,drax system on map ------
if (node.id === "lvl2" && window.Level2 && window.Level2.enter) {
    this.active = false;
    window.Level2.enter();
    return;
}

    // ------ FUTURE LEVELS (3–10) ------
    // For now: if a proper LevelX.enter() exists, use it.
    // If not, fall back to Level 2 so you can test routes.
    const levelMap = {
      lvl3: "Level3",
      lvl4: "Level4",
      lvl5: "Level5",
      lvl6: "Level6",
      lvl7: "Level7",
      lvl8: "Level8",
      lvl9: "Level9",
      lvl10: "Level10",
    };

    if (levelMap[node.id]) {
      const globalName = levelMap[node.id];
      const targetLevel = window[globalName];

      this.active = false;

      if (targetLevel && typeof targetLevel.enter === "function") {
        targetLevel.enter();         // when you make Level3.js etc
      } else if (window.Level2 && window.Level2.enter) {
        window.Level2.enter();       // TEMP: reuse Level 2 layout
      }

      return;
    }

    // ------ LEVEL 1 (INTRO SHOOTER) ------
    if (node.id === "lvl1") {
      this.active = false;          // stop map updates
      if (window.resetGameState) {
        window.resetGameState();    // reset intro engine
      }
      if (window.GameState) {
        window.GameState.running = true;
      }
      return;
    }
  },

    // ------ UPDATE ------
    update(dt) {
      if (!this.active) return;

      // Parallax star drift
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

      // Ship easing towards target
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

      // Background
      if (this.bgLoaded && this.bgImage) {
        ctx.drawImage(this.bgImage, 0, 0, S.W, S.H);
      } else {
        const g = ctx.createLinearGradient(0, 0, 0, S.H);
        g.addColorStop(0, "#05010a");
        g.addColorStop(1, "#070f1f");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, S.W, S.H);
      }

      // Parallax stars
      for (const layer of this.layers) {
        ctx.save();
        ctx.fillStyle = "#ffffff";
        for (const s of layer.stars) {
          ctx.globalAlpha = s.alpha;
          ctx.fillRect(s.x, s.y, s.size, s.size);
        }
        ctx.restore();
      }

      // Nodes
      for (const n of this.nodes) {
        ctx.save();

        // glow ring
        ctx.beginPath();
        ctx.arc(n.x, n.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = n.unlocked
          ? "rgba(0,255,255,0.8)"
          : "rgba(120,120,120,0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // core
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

        // label
        ctx.font = "14px system-ui, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(n.label, n.x, n.y + NODE_RADIUS + 18);

        ctx.restore();
      }

      // Ship (simple glowing triangle for now)
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