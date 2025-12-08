// =========================================
//          LEVEL EXIT ENGINE (L1)
//      Black Hole → Video Cutscene → Map
// =========================================

(function () {
  const S = window.GameState;

  window.LevelExit = {
    active: false,

    start() {
      // already running? do nothing
      if (this.active) return;
      this.active = true;

      // stop normal gameplay
      if (S) S.running = false;

      // --- CREATE VIDEO ELEMENT ---
      const vid = document.createElement("video");
      vid.src = "./src/game/assets/codec.mp4";  // cinematic file
      vid.autoplay = true;
      vid.muted = true;
      vid.playsInline = true;

      // fullscreen overlay
      vid.style.position = "absolute";
      vid.style.top = "0";
      vid.style.left = "0";
      vid.style.width = "100%";
      vid.style.height = "100%";
      vid.style.objectFit = "cover";
      vid.style.zIndex = "999999";

      document.body.appendChild(vid);

      // --- WHEN VIDEO ENDS → LOAD WORLD MAP ---
      vid.onended = () => {
        vid.remove();
        this.active = false;

        if (window.WorldMap) {
          window.WorldMap.active = true;
          if (typeof window.WorldMap.enter === "function") {
            window.WorldMap.enter();
          }
        }
      };

      // Small message (optional)
      if (window.flashMsg) {
        window.flashMsg("WARPING…");
      }
    },

    // These are now empty—no more procedural warp
    update() {},
    draw() {}
  };
})();