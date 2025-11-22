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

    // PLAYER SELECT INIT
    if (window.PlayerSystem) {
      window.PlayerSystem.init();
    }

    // BASIC ENGINE INIT
    window.initStars();
    window.resetGameState();
    window.setupInput();
    window.flashMsg("Press START to play");

    // PLAYER SELECT UI
    window.showPlayerSelect();

    // START BUTTON
    S.startBtn.addEventListener("click", () => {
      window.resetGameState();
      S.running = true;

      window.flashMsg("GOOD LUCK, COMMANDER");

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

/* ==========================================================
   ONLINE SYNC — REAL BACKEND (Neon Postgres)
   ========================================================== */

// ---- Create Player ----
window.syncNewPlayer = async function (name) {
  try {
    const res = await fetch("/api/create-player", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

   const data = await res.json();

// For your account only – debug feedback
if (name === "999nike") {
  console.log("[create-player]", data);
}

// ⭐ Store player_id locally for stats syncing
if (data.playerId) {
  localStorage.setItem("sj_player_id", data.playerId);
}

if (!data.ok) {
  console.warn("create-player failed:", data.error);
}

// ⭐ FIX: Return the API data to the caller
return data;

  } catch (err) {
    console.warn("syncNewPlayer error (offline?):", err);
  }
};

// ---- Update Stats (still stub for now; real patch next) ----
// ---- Update Stats (real backend) ----
window.syncStats = async function (name, coins, score, xp = 0) {
  try {
    const player_id = localStorage.getItem("sj_player_id");
    if (!player_id) return; // no DB record yet

    const payload = {
      player_id,
      coins,
      score,
      xp
    };

    const res = await fetch("/api/update-stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    // Debug ONLY for you
    if (name === "999nike") {
      console.log("[update-stats]", data);
    }

  } catch (err) {
    // Always silent — never disrupt gameplay
  }
};


/* ==========================================================
   PLAYER SELECT SYSTEM (FINAL – SINGLE PANEL VERSION)
   ========================================================== */

(function () {
  const selectBox = document.getElementById("playerSelect");
  const list = document.getElementById("playerList");
  const addBtn = document.getElementById("addPlayerBtn");
  const nameBox = document.getElementById("nameInputBox");
  const nameInput = document.getElementById("newPlayerName");
  const saveBtn = document.getElementById("savePlayerBtn");

  if (!selectBox || !list || !addBtn || !nameBox || !nameInput || !saveBtn) {
    console.warn("❌ Player UI missing — check game.html");
    return;
  }

  function loadPlayers() {
    return JSON.parse(localStorage.getItem("sj_players") || "[]");
  }

  function savePlayers(arr) {
    localStorage.setItem("sj_players", JSON.stringify(arr));
  }

  // ⭐ PATCH SECTION 4 (Synced)
  function setActivePlayer(name) {
    localStorage.setItem("sj_active_player", name);
    selectBox.style.display = "none";

    // ⭐ Sync immediately on selection
    const S = window.GameState;
    syncStats(name, S.wizzCoins || 0, S.score || 0);
  }

  function renderPlayers() {
    list.innerHTML = "";
    const players = loadPlayers();

    if (players.length === 0) {
      const empty = document.createElement("div");
      empty.textContent = "No players yet.";
      empty.style.opacity = "0.6";
      list.appendChild(empty);
      return;
    }

    players.forEach((p) => {
      const btn = document.createElement("button");
      btn.className = "player-btn";
      btn.textContent = p;
      btn.onclick = () => setActivePlayer(p);
      list.appendChild(btn);
    });
  }

  addBtn.onclick = () => {
    nameBox.style.display = "block";
    nameInput.value = "";
    nameInput.focus();
  };

 // ⭐ PATCHED — REAL DB SYNC WITH playerId
saveBtn.onclick = async () => {
  const name = nameInput.value.trim();
  if (!name) return;

  const players = loadPlayers();

  if (players.includes(name)) {
    alert("Name already exists!");
    return;
  }

  players.push(name);
  savePlayers(players);

  // ⭐ NEW: Sync new player to online DB and capture playerId
  const result = await syncNewPlayer(name);

  if (result && result.playerId) {
    localStorage.setItem("sj_player_id", result.playerId);
    console.log("📌 Stored playerId:", result.playerId);
  } else {
    console.warn("⚠ No playerId returned from backend");
  }

  // Close input box
  nameBox.style.display = "none";

  // Refresh list (so Jeff now appears above)
  renderPlayers();

  // Status message (quick feedback)
  window.flashMsg("Player added — logged in");

  // Auto-select the new player
  setActivePlayer(name);
};

  window.showPlayerSelect = function () {
    const active = localStorage.getItem("sj_active_player");

    if (!active) {
      selectBox.style.display = "block";
      renderPlayers();
    } else {
      selectBox.style.display = "none";
    }
  };
})();

/* ==========================================================
   SAFE PLAYER SELECT ENTRY POINT
   ========================================================== */

window.showPlayerSelect = window.showPlayerSelect || function () {
  const selectBox = document.getElementById("playerSelect");
  if (!selectBox) return;

  const active = localStorage.getItem("sj_active_player");
  if (!active) {
    selectBox.style.display = "block";
  } else {
    selectBox.style.display = "none";
  }
};

/* ==========================================================
   AUTO-SYNC GAME EVENTS (kills, coins, XP)
   ========================================================== */

(function () {
  const S = window.GameState;

  const oldHandleEnemyDeath = window.handleEnemyDeath;
  window.handleEnemyDeath = function (e) {

    // Safely call original if it exists
    if (typeof oldHandleEnemyDeath === "function") {
      oldHandleEnemyDeath(e);
    }

    // Auto-sync stats if a player is active
    const active = localStorage.getItem("sj_active_player");
    if (active) {
      syncStats(active, S.wizzCoins, S.score);
    }
  };
})();

/* ==========================================================
   SYNC ON GAME OVER
   ========================================================== */

(function () {
  const S = window.GameState;

  const originalDamagePlayer = window.damagePlayer;
  window.damagePlayer = function () {

    // Safely call original if it exists
    if (typeof originalDamagePlayer === "function") {
      originalDamagePlayer();
    }

    // Sync only when lives hit zero
    if (S.lives <= 0) {
      const active = localStorage.getItem("sj_active_player");
      if (active) {
        syncStats(active, S.wizzCoins, S.score);
      }
    }
  };
})();
