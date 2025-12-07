// =========================================
//          LEVEL EXIT ENGINE (L1)
//      Black Hole → Video Cutscene → Map
// =========================================
(function () {
  const S = window.GameState;

  window.LevelExit = {
    active: false,

    start() {
      if (this.active) return;
      this.active = true;

      // Stop gameplay immediately
      S.running = false;

      // --- CREATE VIDEO ELEMENT ---
      const vid = document.createElement("video");
      vid.src = "./src/game/assets/codec.mp4";  // cinematic file
      vid.autoplay = true;
      vid.muted = true;
      vid.playsInline = true;

      // FULLSCREEN LOOK
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

  // *** FIX: ensure the map is active before entering it ***
  if (window.WorldMap) window.WorldMap.active = true;


  // *** FIX: ensure the map is active before entering it ***
  if (window.WorldMap) window.WorldMap.active = true;

  // Your existing world map entry
  if (window.WorldMap && typeof window.WorldMap.enter === "function") {
    window.WorldMap.enter();
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