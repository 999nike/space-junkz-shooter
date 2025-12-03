// Global flash message for on-screen notices
window.flashMsg = function flashMsg(text, duration = 1200) {
  const el = document.getElementById('flashMsg');
  if (!el) return;
  el.textContent = text;
  el.style.opacity = 1;
  clearTimeout(window._flashTimer);
  window._flashTimer = setTimeout(() => {
    el.style.opacity = 0;
  }, duration);
};

// =========================================================
//  RESTORE PLAYER STATS FROM DB (REAL WORKING VERSION)
// =========================================================
window.loadPlayerStats = async function loadPlayerStats(player_id) {
  try {
    const res = await fetch(`/api/get-stats?player_id=` + player_id);
    const data = await res.json();

    if (data && data.stats) {
      const S = window.GameState;

      // Update HUD
      if (S.coinsEl) S.coinsEl.textContent = S.wizzCoins;
      if (S.scoreEl) S.scoreEl.textContent = S.score;

      console.log("🔥 RESTORED FROM DB:", S.score, S.wizzCoins, S.xp);
    }
  } catch (err) {
    console.error("loadPlayerStats error:", err);
  }
};

// ---------- BOOTSTRAP ----------
(function () {
  const S = window.GameState;

  window.initGame = function initGame() {
    S.canvas = document.getElementById("game");
    S.ctx = S.canvas.getContext("2d");

    // Boot the state machine so GameRuntime and InputManager initialise properly
    if (window.EngineCore && typeof window.EngineCore.init === 'function') {
      window.EngineCore.init();
    }

    // --- FIX: Ensure arrays exist before renderer touches them ---
    S.enemies      = [];
    S.bullets      = [];
    S.enemyBullets = [];
    S.rockets      = [];
    S.particles    = [];
    S.powerUps     = [];   // REQUIRED – prevents “not iterable”
    S.sidekicks    = [];

    // ---- FULL VIEWPORT CANVAS (MATCH ENGINE, NO STRETCH) ----
    S.canvas.width  = window.innerWidth;
    S.canvas.height = window.innerHeight;
    S.W = S.canvas.width;
    S.H = S.canvas.height;
    
    // ------ WORLD MAP INIT (PILLARS SECTOR) ------
    if (window.WorldMap && window.WorldMap.init) {
      window.WorldMap.init();
    }

    // ------ HOME BASE INIT (ANKH CHAMBER) ------
    if (window.HomeBase && window.HomeBase.init) {
      window.HomeBase.init();
    }

    // Load ship sprite
    S.shipImage = new Image();
    S.shipImage.src = "./src/game/AlphaFighter.png";

    // HUD
    S.scoreEl = document.getElementById("score");
    S.livesEl = document.getElementById("lives");
    S.msgEl = document.getElementById("msg");
    S.startBtn = document.getElementById("startBtn");

    // Start button: save stats if necessary and launch Mission 1 (Level2)
    if (S.startBtn) {
      S.startBtn.addEventListener('click', () => {
        const active = localStorage.getItem('sj_active_player');
        if (active && (S.score > 0 || S.wizzCoins > 0) && typeof window.syncStats === 'function') {
          window.syncStats(active, S.wizzCoins, S.score);
        }

        if (window.WorldMap) window.WorldMap.active = false;
        if (window.HomeBase) window.HomeBase.active = false;

        if (window.EngineCore?.startLevel) {
          window.EngineCore.startLevel('Level2');
        }

        S.running = true;
        window.flashMsg('GOOD LUCK, COMMANDER');

        const bgm = document.getElementById('bgm');
        if (bgm) bgm.play().catch(() => {});
      });
    }

    // PLAYER SELECT INIT
    if (window.PlayerSystem) {
      window.PlayerSystem.init();
    }

    // BASIC ENGINE INIT
    window.initStars();
    window.setupInput();
    window.flashMsg("Press START to play");

    // PLAYER SELECT UI
    window.showPlayerSelect();
    

// ----- MUTE BUTTON -----
const muteBtn = document.getElementById("muteBtn");
if (muteBtn) {
  muteBtn.addEventListener("click", () => {
    const bgm = document.getElementById("bgm");
    if (!bgm) return;

    // toggle mute state
    bgm.muted = !bgm.muted;

    // update button label
    muteBtn.textContent = bgm.muted ? "🔊 UNMUTE" : "🔇 MUTE";
  });
}

   // ----- LEADERBOARD BUTTON -----
const leaderBtn = document.getElementById("leaderBtn");
const leaderPanel = document.getElementById("leaderboardPanel");
const leaderList = document.getElementById("leaderboardList");
const closeLeaderBtn = document.getElementById("closeLeaderBtn");

async function loadLeaderboard() {
  const res = await fetch("/api/getLeaderboard");
  const data = await res.json();

  leaderList.innerHTML = "";

  if (!data.ok || !data.leaderboard) {
    leaderList.innerHTML = "<p>Error loading leaderboard.</p>";
    return;
  }

  data.leaderboard.forEach((row, i) => {
    const div = document.createElement("div");
    div.style.margin = "8px 0";
    div.style.padding = "8px";
    div.style.borderBottom = "1px solid #00f7ff55";

    div.innerHTML = `
      <strong>${i + 1}. ${row.name}</strong><br>
      Score: ${row.score} | Coins: ${row.coins}
    `;

    leaderList.appendChild(div);
  });
}

if (leaderBtn) {
  leaderBtn.addEventListener("click", () => {
    loadLeaderboard(); // refresh every time
    leaderPanel.style.display = "block";
  });
}

if (closeLeaderBtn) {
  closeLeaderBtn.addEventListener("click", () => {
    leaderPanel.style.display = "none";
  });
}
    
    // Start game loop through the engine state machine
    if (window.EngineCore && typeof window.EngineCore.ensureLoop === "function") {
      window.EngineCore.ensureLoop();
    } else {
      S.lastTime = performance.now();
      requestAnimationFrame(window.gameLoop);
    }
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
  const existing = localStorage.getItem("sj_player_id");
  if (existing) return { ok: true, playerId: existing };

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
    // Restore stats from DB (read-only)
    const pid = localStorage.getItem("sj_player_id");
    if (pid && window.loadPlayerStats) {
      window.loadPlayerStats(pid);
    }

    // Set active player locally
    localStorage.setItem("sj_active_player", name);

    // Hide selector
    selectBox.style.display = "none";
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

  window.renderPlayers = renderPlayers;

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
  selectBox.style.display = "none";
};

  window.showPlayerSelect = function () {
    const selectBox = document.getElementById("playerSelect");
    const players = JSON.parse(localStorage.getItem("sj_players") || "[]");
    const active = localStorage.getItem("sj_active_player");

    // Auto-select if only one player exists
    if (!active && players.length === 1) {
      localStorage.setItem("sj_active_player", players[0]);
      selectBox.style.display = "none";
      return;
    }

    // No active player → show selector
    if (!active) {
      selectBox.style.display = "block";
      if (typeof renderPlayers === "function") renderPlayers();
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
  const players = JSON.parse(localStorage.getItem("sj_players") || "[]");
  const active = localStorage.getItem("sj_active_player");

  if (!selectBox) return;

  // Auto-select if only one player exists
  if (!active && players.length === 1) {
    localStorage.setItem("sj_active_player", players[0]);
    selectBox.style.display = "none";
    return;
  }

  // No active player → show selector
  if (!active) {
    selectBox.style.display = "block";
    if (typeof window.renderPlayers === "function") window.renderPlayers();
  } else {
    selectBox.style.display = "none";
  }
};

/* ==========================================================
   AUTO-SYNC GAME EVENTS (kills, coins, XP)
   - Throttled: at most once every 60 seconds per player
   ========================================================== */

(function () {
  const S = window.GameState;

  // last time (ms) we pushed stats to the backend
  let lastSyncMs = 0;
  const SYNC_INTERVAL_MS = 30_000; // 30 sec snapshots

  const oldHandleEnemyDeath = window.handleEnemyDeath;
  window.handleEnemyDeath = function (e) {

    // Safely call original if it exists
    if (typeof oldHandleEnemyDeath === "function") {
      oldHandleEnemyDeath(e);
    }

    const active = localStorage.getItem("sj_active_player");
    if (!active) return;

    const now = Date.now();

    // ⭐ Only sync if at least 60 seconds have passed
    if (now - lastSyncMs >= SYNC_INTERVAL_MS) {
  lastSyncMs = now;

  // ---- ACCUMULATION MODE: send only gains since last snapshot ----
  const gainScore = S.score - (S._snapshotLastScore ?? S.score);
  const gainCoins = S.wizzCoins - (S._snapshotLastCoins ?? S.wizzCoins);

  // Update snapshot markers
  S._snapshotLastScore = S.score;
  S._snapshotLastCoins = S.wizzCoins;

  // Sync only the gain
  syncStats(active, gainCoins, gainScore);
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
        // ---- ACCUMULATION MODE: send only gains since last snapshot ----
const gainScore = S.score - (S._snapshotLastScore ?? S.score);
const gainCoins = S.wizzCoins - (S._snapshotLastCoins ?? S.wizzCoins);

// update snapshot markers
S._snapshotLastScore = S.score;
S._snapshotLastCoins = S.wizzCoins;

syncStats(active, gainCoins, gainScore);
      }
    }
  };
})();
