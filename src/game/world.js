// ===========================
//  GALAXY MAP (LEVEL SELECT)
// ===========================

window.WorldMap = {
  init() {
    console.log("🌌 WorldMap loaded (placeholder)");
    // Full UI comes after we finish LevelExit
  }
};
// =========================================================
//  WORLD MAP – PILLARS SECTOR (PARALLAX)
//  Level Select / Galaxy View
// =========================================================

(function () {
  const S = window.GameState;

  // ------ CONFIG ------
  const BG_IMAGE_SRC = "./src/game/assets/25th_m16.jpg";
  // ^ drop your NASA Pillars image in that path & name

  const NODE_RADIUS = 16;

  // ------ MAP NODES (TWEAK POSITIONS LATER) ------
  const NODES = [
    { id: "home",   xFactor: 0.18, yFactor: 0.78, label: "HOME BASE",              unlocked: true  },
    { id: "lvl1",   xFactor: 0.38, yFactor: 0.45, label: "LEVEL 1 - GEMINI FIELD", unlocked: true  },
    { id: "lvl2",   xFactor: 0.68, yFactor: 0.32, label: "LEVEL 2 - DRAX SYSTEM",  unlocked: false },
    { id: "secret", xFactor: 0.82, yFactor: 0.62, label: "???",                    unlocked: false },
  ];

  const WorldMap = {
    active: false,
    canvas: null,
    ctx: null,

    bgImage: null,
    bgLoaded: false,

    layers: [],        // parallax star layers
    nodes: [],
    ship: {
      x: 0, y: 0,
      tx: 0, ty: 0,
      speed: 3.0
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
        this._makeLayer(40,  4, 0.3), // far
        this._makeLayer(60,  9, 0.6), // mid
        this._makeLayer(90, 16, 1.0), // near
      ];
      // Node positions from factors
      this.nodes = NODES.map(n => ({
        ...n,
        x: n.xFactor * S.W,
        y: n.yFactor * S.H
      }));
      // Ship starts near HOME
      const home = this.nodes.find(n => n.id === "home") || this.nodes[0];
      this.ship.x = this.ship.tx = home.x;
      this.ship.y = this.ship.ty = home.y + 60;
      this._bindInput();
    },

    // World map entry point (used by blackhole + cheats)
    enter() {
      if (!this.canvas || !this.ctx) this.init();
      this.active = true;
    },

    // Called by blackhole / level complete later
    _moveShipToNode(node) {
      this.ship.tx = node.x;
      this.ship.ty = node.y + 60;

      // ------ HOME BASE ------
      if (node.id === "home" && window.HomeBase && window.HomeBase.enter) {
        this.active = false;      // stop map updates
        window.HomeBase.enter();  // enter Home Base
        return;
      }

      // ------ LEVEL 2 (MISSION 1) ------
      if (node.id === "lvl2" && window.Level2 && window.Level2.enter) {
        this.active = false;      // stop map updates
        window.Level2.enter();    // start Level 2
        return;
      }

      // ------ LEVEL 1 (INTRO SHOOTER) ------
      if (node.id === "lvl1") {
        this.active = false;          // stop map updates
        window.resetGameState();      // reset intro engine
        window.GameState.running = true;
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
        const vx = (dx / dist) * this.ship.speed * (S.W / 1280) * 60 * dt;
        const vy = (dy / dist) * this.ship.speed * (S.H / 720) * 60 * dt;
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
        ctx.strokeStyle = n.unlocked ? "rgba(0,255,255,0.8)" : "rgba(120,120,120,0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // core
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, NODE_RADIUS);
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
    }
  };

  window.WorldMap = WorldMap;
})();