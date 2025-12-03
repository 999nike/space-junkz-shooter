// =========================================
//          LEVEL EXIT ENGINE (L1)
//      Black Hole → Fade → Galaxy Map
// =========================================

(function () {
  const S = window.GameState;

  window.LevelExit = {
    active: false,
    hole: null,

    start() {
      if (this.active) return;
      this.active = true;

      // Stop wave spawns instantly
      S.spawnTimer = 999999;

      // Spawn black hole above screen
      this.hole = {
        x: S.W / 2,
        y: -200,
        r: 40,
        pull: 0
      };

      window.flashMsg("LEVEL CLEAR — APPROACH THE ANOMALY");
    },

    update(dt) {
      if (!this.active || !this.hole) return;

      // Bring the hole down
      this.hole.y += 120 * dt;

      // Grow + increase pull
      this.hole.r += 20 * dt;
      this.hole.pull += 20 * dt;

      // Pull stars slightly
      for (const s of S.stars) {
        s.x += (this.hole.x - s.x) * 0.002 * this.hole.pull * dt;
        s.y += (this.hole.y - s.y) * 0.002 * this.hole.pull * dt;
      }

      // Pull player
      const dx = this.hole.x - S.player.x;
      const dy = this.hole.y - S.player.y;
      const dist = Math.hypot(dx, dy);

      if (dist < this.hole.r * 1.8) {
        // Entering black hole
        S.running = false;
        window.flashMsg("WARPING…");
        setTimeout(() => {
          window.WorldMap.init();
        }, 1200);
      }
    },

    draw(ctx) {
      if (!this.active || !this.hole) return;

      ctx.save();
      ctx.beginPath();
      const g = ctx.createRadialGradient(
        this.hole.x, this.hole.y, this.hole.r * 0.2,
        this.hole.x, this.hole.y, this.hole.r
      );

      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.arc(this.hole.x, this.hole.y, this.hole.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };
})();

// Simple warp helper exposed for levels
window.BlackHole = {
  start(callback) {
    if (window.LevelExit && typeof window.LevelExit.start === "function") {
      window.LevelExit.start();
    }

    setTimeout(() => {
      if (typeof callback === "function") {
        callback();
      }
    }, 1200);
  }
};
