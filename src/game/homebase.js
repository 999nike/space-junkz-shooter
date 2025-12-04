// =========================================================
//  HOMEBASE.JS – "ANKH CHAMBER" CLICK-ONLY HUB (STYLE C)
//  • Alien–Egyptian room
//  • Click hotspots: Storage / Craft / Vault / Upgrades / Exit
//  • No movement, no physics – just a scene + panels
// =========================================================

(function () {
  const S = window.GameState || {};

  const HomeBase = {
    active: false,
    canvas: null,
    ctx: null,

    bgImage: null,
    bgLoaded: false,

    // Which panel is open: 'storage' | 'craft' | 'vault' | 'upgrade' | null
    activePanel: null,

    // Simple rectangles in normalized coords (0–1)
    regions: [
      { id: "storage", label: "STORAGE CHEST",  x: 0.20, y: 0.65, w: 0.18, h: 0.16 },
      { id: "craft",   label: "CRAFTING OBELISK", x: 0.42, y: 0.50, w: 0.18, h: 0.18 },
      { id: "vault",   label: "WIZZCOIN VAULT", x: 0.68, y: 0.60, w: 0.18, h: 0.16 },
      { id: "upgrade", label: "UPGRADE ALTAR",  x: 0.35, y: 0.78, w: 0.30, h: 0.14 },
      { id: "exit",    label: "RETURN TO STARMAP", x: 0.50, y: 0.22, w: 0.30, h: 0.12 }
    ],

    init() {
      this.canvas = S.canvas;
      this.ctx = S.ctx;

      // Background art – swap this file for any "Alien Egypt" image you like
      this.bgImage = new Image();
      this.bgImage.src = "./src/game/assets/homebase_ankh_chamber.png";
      this.bgImage.onload = () => {
        this.bgLoaded = true;
        console.log("✅ HomeBase background loaded");
      };
      this.bgImage.onerror = () => {
        console.warn("⚠ HomeBase background missing, using fallback gradient");
      };

      this._bindInput();
    },

    enter() {
      const GS = window.GameState;
      this.canvas = GS.canvas;
      this.ctx = GS.ctx;

      this.active = true;
      this.activePanel = null;

      // Turn off other modes
      if (window.WorldMap) window.WorldMap.active = false;

      window.flashMessage("WELCOME TO THE ANKH CHAMBER");
    },

    exit() {
      this.active = false;
      this.activePanel = null;

      // Hand control back to galaxy map
      if (window.WorldMap) window.WorldMap.active = true;
      window.flashMessage("RETURNING TO STARMAP…");
    },

    // ---------------- INPUT ----------------

    _bindInput() {
      if (this._inputBound) return;
      this._inputBound = true;

      const canvas = document.getElementById("game");
      if (!canvas) return;

      canvas.addEventListener("click", (ev) => {
        if (!this.active) return;

        const rect = canvas.getBoundingClientRect();
        const x = (ev.clientX - rect.left) * (canvas.width / rect.width);
        const y = (ev.clientY - rect.top) * (canvas.height / rect.height);

        this._handleClick(x, y);
      });
    },

    _handleClick(px, py) {
      const W = S.W;
      const H = S.H;

      for (const r of this.regions) {
        const rx = r.x * W;
        const ry = r.y * H;
        const rw = r.w * W;
        const rh = r.h * H;

        if (px >= rx && px <= rx + rw && py >= ry && py <= ry + rh) {
          // Exit special case
          if (r.id === "exit") {
            this.exit();
            return;
          }

          // Toggle panels
          this.activePanel = this.activePanel === r.id ? null : r.id;
          return;
        }
      }

      // Clicked empty space → close any open panel
      this.activePanel = null;
    },

    update(dt) {
      if (!this.active) return;
      // No animations yet – safe placeholder for later FX
    },

    draw(ctx) {
      if (!this.active) return;

      const W = S.W;
      const H = S.H;

      // ---- Background ----
      if (this.bgLoaded && this.bgImage) {
        ctx.drawImage(this.bgImage, 0, 0, W, H);
      } else {
        // fallback gradient "ancient chamber"
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#05040a");
        g.addColorStop(0.4, "#1a1020");
        g.addColorStop(1, "#050308");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      // Dim layer
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, W, H);

      // ---- Region buttons ----
      for (const r of this.regions) {
        const rx = r.x * W;
        const ry = r.y * H;
        const rw = r.w * W;
        const rh = r.h * H;

        const isExit = r.id === "exit";
        const isActive = this.activePanel === r.id;

        // Frame
        ctx.save();
        ctx.strokeStyle = isExit
          ? "rgba(255, 222, 110, 0.95)"
          : "rgba(0, 255, 255, 0.9)";
        ctx.lineWidth = isActive ? 3 : 2;
        ctx.fillStyle = isExit
          ? "rgba(60, 40, 10, 0.75)"
          : "rgba(5, 20, 35, 0.75)";

        ctx.beginPath();
        const radius = 10;
        roundRect(ctx, rx, ry, rw, rh, radius);
        ctx.fill();
        ctx.stroke();

        // Glyph-style label
        ctx.font = isExit ? "16px system-ui" : "14px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isExit ? "#ffeaa0" : "#7bf5ff";
        ctx.fillText(r.label, rx + rw / 2, ry + rh / 2);
        ctx.restore();
      }

      // ---- Active panel overlay ----
      if (this.activePanel) {
        this._drawPanel(ctx, this.activePanel);
      }
    },

    _drawPanel(ctx, id) {
      const W = S.W;
      const H = S.H;

      // Darken background
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(0, 0, W, H);

      const panelW = Math.min(420, W * 0.9);
      const panelH = Math.min(260, H * 0.55);
      const x = (W - panelW) / 2;
      const y = (H - panelH) / 2;

      ctx.save();

      // Panel body
      ctx.fillStyle = "rgba(5, 10, 22, 0.95)";
      ctx.strokeStyle = "#00f5ff";
      ctx.lineWidth = 2;
      roundRect(ctx, x, y, panelW, panelH, 14);
      ctx.fill();
      ctx.stroke();

      // Title + placeholder text
      ctx.fillStyle = "#ffffff";
      ctx.font = "18px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      let title = "";
      let bodyLines = [];

      if (id === "storage") {
        title = "STORAGE CHEST";
        bodyLines = [
          "Here we’ll list all your loot,",
          "materials and rare drops.",
          "",
          "For now this is a placeholder.",
          "Later: scrollable inventory,",
          "stash tabs, sort & filter."
        ];
      } else if (id === "craft") {
        title = "CRAFTING OBELISK";
        bodyLines = [
          "Future system: combine items",
          "and WizzCoin to craft upgrades.",
          "",
          "Right now this is a simple",
          "placeholder hub – no logic yet."
        ];
      } else if (id === "vault") {
        title = "WIZZCOIN VAULT";
        bodyLines = [
          "This chamber will show total",
          "WizzCoin stored in the cloud,",
          "plus any bonuses or interest.",
          "",
          "For now it just proves the",
          "Home Base wiring works."
        ];
      } else if (id === "upgrade") {
        title = "UPGRADE ALTAR";
        bodyLines = [
          "Future: upgrade weapons,",
          "sidekicks and ship stats",
          "using coins and materials.",
          "",
          "We’ll plug this into your",
          "Neon DB once design is locked."
        ];
      }

      ctx.fillText(title, x + panelW / 2, y + 16);

      ctx.font = "14px system-ui";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#9fd6ff";

      const textX = x + 26;
      let textY = y + 52;
      const lineH = 18;

      for (const line of bodyLines) {
        ctx.fillText(line, textX, textY);
        textY += lineH;
      }

      ctx.restore();
    }
  };

  // Helper for rounded rectangles
  function roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  window.HomeBase = HomeBase;
})();
