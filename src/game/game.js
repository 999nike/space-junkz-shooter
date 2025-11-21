// ---------- BOOTSTRAP ----------
(function () {
  const S = window.GameState;

  window.initGame = function initGame() {
    S.canvas = document.getElementById("game");
    S.ctx = S.canvas.getContext("2d");

    // ---- FULL LANDSCAPE CANVAS (90% fullscreen) ----
    S.canvas.width = window.innerWidth * 0.90;
    S.canvas.height = window.innerHeight * 0.90;
    S.W = S.canvas.width;
    S.H = S.canvas.height;

    // Load ship sprite
    S.shipImage = new Image();
    S.shipImage.src = "./src/game/AlphaFighter.png";

    // HUD
    S.scoreEl = document.getElementById("score");
    S.livesEl = document.getElementById("lives");
    S.msgEl = document.getElementById("msg");
    S.startBtn = document.getElementById("startBtn");

    // -------------------------
    // PLAYER SELECT INIT (legacy/no-op)
    // -------------------------
    if (window.PlayerSystem) {
      window.PlayerSystem.init();
    }

    // -------------------------
    // BASIC ENGINE INIT
    // -------------------------
    window.initStars();
    window.resetGameState();
    window.setupInput();
    window.flashMsg("Press START to play");

    // -------------------------
    // PLAYER SELECT (ACTIVE LINE)
    // -------------------------
    window.showPlayerSelect();

    // -------------------------
    // START BUTTON HANDLER
    // -------------------------
    S.startBtn.addEventListener("click", () => {
      window.resetGameState();
      S.running = true;

      window.flashMsg("GOOD LUCK, COMMANDER");

      // ---- MUSIC ----
      const bgm = document.getElementById("bgm");
      if (bgm) {
        bgm.volume = 0.35;
        bgm.play().catch(() => {
          console.warn("Music blocked until user interacts again.");
        });
      }
    });

    // Start game loop
    S.lastTime = performance.now();
    requestAnimationFrame(window.gameLoop);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.initGame);
  } else {
    window.initGame();
  }
})();


// =========================================================
// PLAYER SELECT SYSTEM (LocalStorage only)
// =========================================================
(function () {
  const modal = document.getElementById("playerModal");
  const list = document.getElementById("playerList");
  const addBtn = document.getElementById("addPlayerBtn");

  if (!modal || !list || !addBtn) {
    console.warn("Player Select UI not found in HTML.");
    return;
  }

  function loadPlayers() {
    return JSON.parse(localStorage.getItem("sj_players") || "[]");
  }

  function savePlayers(arr) {
    localStorage.setItem("sj_players", JSON.stringify(arr));
  }

  function setActivePlayer(name) {
    localStorage.setItem("sj_active_player", name);
    modal.style.display = "none";
  }

  function renderPlayers() {
    list.innerHTML = "";
    const players = loadPlayers();

    players.forEach(name => {
      const b = document.createElement("button");
      b.textContent = name;
      b.onclick = () => setActivePlayer(name);
      list.appendChild(b);
    });
  }

  addBtn.onclick = () => {
    const name = prompt("Enter new player name:");
    if (!name || name.trim() === "") return;

    const players = loadPlayers();
    players.push(name.trim());
    savePlayers(players);
    renderPlayers();
  };

  // ---------- Startup ----------
  window.showPlayerSelect = function () {
    const active = localStorage.getItem("sj_active_player");

    if (!active) {
      modal.style.display = "flex";
      renderPlayers();
    } else {
      modal.style.display = "none";
    }
  };
})();
