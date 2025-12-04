Space‑Junkz Shooter – Code Audit and Debugging Guide
Executive Summary

This audit examines the space‑junkz‑shooter repository (as of Dec 4 2025) to determine why the latest modular build loads the UI and music but fails to render enemies, bosses and backgrounds. I inspected the source tree via the GitHub API and read the major JS files to understand how the game is wired. The new repository contains a lightweight engine (engine.js, levelManager.js, renderer.js), a player module, input handlers and multiple mission modules (Level1.js, lvl2.js, etc.). However, many of the core shooter functions – updateGame(), drawGameCore(), spawnEnemy(), spawnBoss(), resetGameState(), damagePlayer(), etc. – are missing from the code loaded in game.html. Levels call these functions, but they are never defined, so the game loop cannot spawn enemies or draw them. In addition, the level backgrounds reference a non‑existent image (mission1_bg.png), leading to an empty starfield instead of the intended art. The issues stem from both missing assets and missing script imports. This guide explains what works, what is broken, why, and how to fix it.

Current behaviour (what works)
Feature	Working?	Notes
Deployment	✅	game.html loads on Vercel and displays the HUD, Start button, joystick, FIRE button and leaderboards.
Player/leaderboard system	✅	Player selection, adding a new player and the leaderboard API work. game.js syncs player stats to a backend.
Home Base / World Map	✅	The Home Base loads its background and interactive panels; the world map renders star layers and mission nodes with coordinates defined in world.js
raw.githubusercontent.com
.
Basic engine loop	✅	EngineCore sets up a mode state machine and uses requestAnimationFrame to call update() and drawGame() each frame
raw.githubusercontent.com
. This loop runs.
Music and flash messages	✅	The audio file plays and flashMessage() shows messages such as “GOOD LUCK, COMMANDER.”
What’s broken and why
1. Missing background asset

Both lvl2.js and lvl3.js attempt to load a background image called mission1_bg.png at ./src/game/assets/mission1_bg.png
raw.githubusercontent.com
raw.githubusercontent.com
.

The assets folder in the repo does not contain this file; there is nebula_bg.png and several other images, but mission1_bg.png is absent. Because the image is missing, the bgLoaded flag in these levels never becomes true, so the draw method never draws a background.

2. Core shooter functions are missing

Mission modules rely on several global functions:

resetGameState() – used in Level2.enter() and Level3.enter() to reset arrays and player state
raw.githubusercontent.com
.

updateGame(dt) – called every frame inside each level’s update method to run the main shooter engine
raw.githubusercontent.com
.

drawGameCore(ctx) / drawGame() – used in the draw methods to render the player, enemies, bullets and particles
raw.githubusercontent.com
.

spawnEnemyType(…), spawnEnemy(), spawnBoss(), spawnScorpionBoss(), spawnGeminiBoss(), etc. – used throughout Level1 and Level2 to spawn enemies and bosses
raw.githubusercontent.com
raw.githubusercontent.com
.

None of the modules loaded by game.html define these functions. A scan of the repository shows no file with updateGame or drawGameCore. The engine wrapper calls window.drawGame() each frame
raw.githubusercontent.com
, but drawGame is undefined. Consequently, when the Start button is clicked, the state machine enters the level, but no entities spawn and nothing is drawn on the canvas.

3. Missing script imports in game.html

game.html includes the engine scripts, the world and home base modules, the level files and game.js
raw.githubusercontent.com
. It does not import several essential modules:

player.js – defines drawPlayer() used by the renderer. Without it, the player ship cannot be drawn.

input.js (the non‑engine version) – defines setupInput() for keyboard/mouse/touch and handles movement/firing
raw.githubusercontent.com
. The engine wrapper (engine/input.js) calls setupInput(), but because input.js is not loaded, input never binds.

Enemy and boss templates (enemyTemplates.js, bossTemplates.js, enemyFamily_spectres.js, bossFamily_anubis.js) – provide data for spawning enemies and bosses
raw.githubusercontent.com
raw.githubusercontent.com
.

Loot scripts (lootDrop.js, lootTable.js) – define spawnLoot() and updateLoot().

Devconsole / cheat functions – optional, but they include definitions for spawnScorpionBoss and spawnGeminiBoss.

The core shooter engine file (e.g., the original monolithic game-old.js) is not present. That file used to define updateGame, drawGameCore, spawnEnemy, etc. Removing it leaves the level modules orphaned.

Without these scripts, the engine cannot initialise the player, cannot bind input, cannot spawn enemies/bosses and cannot draw the game. The Start button only flips flags and plays music; update() and draw() do nothing.

4. Unused or outdated code paths

Level2 and Level3 still reference enemy types like "zigzag" and "shooter"
raw.githubusercontent.com
, but the enemyTemplates.js file defines only basicDrone, striker and tank
raw.githubusercontent.com
. Either the wrong enemy names are being used or additional enemy definitions were removed during refactor.

Both levels reference mission1_bg.png, which suggests the code still expects assets from an earlier build. The current assets folder uses names like nebula_bg.png, oldARIES2.png, etc.

Recommendations (how to fix)

The quickest way to restore functionality is to ensure that all core shooter modules and assets are present and loaded. Below is a checklist of required actions and code snippets to guide the fixes.

1. Restore or update missing assets

Either add mission1_bg.png to src/game/assets/ (use the original art from the old build), or change the code in lvl2.js and lvl3.js to use an existing background, such as nebula_bg.png:

// lvl2.js and lvl3.js – change background path
this.bg = new Image();
// Use an existing background instead of mission1_bg.png
this.bg.src = "./src/game/assets/nebula_bg.png";
this.bg.onload = () => (this.bgLoaded = true);


Verify that other assets referenced in enemy templates (oldPISCES12.png, oldCANCER2.png, oldARIES2.png, cruiser.png, paragfighter.png, etc.) exist in src/game/assets/. If any are missing, either add them or update the paths to existing sprites.

2. Include all necessary scripts in game.html

The game.html file must load the player renderer, input handlers, enemy templates, loot scripts and any other modules that define global functions used by levels. Modify the bottom of game.html so it includes the following additional <script> tags before game.js:

<!-- Core shooter modules -->
<script src="./src/game/player.js"></script>
<script src="./src/game/input.js"></script>
<script src="./src/game/loot/lootTable.js"></script>
<script src="./src/game/loot/lootDrop.js"></script>
<script src="./src/game/enemies/enemyTemplates.js"></script>
<script src="./src/game/enemies/bossTemplates.js"></script>
<script src="./src/game/enemies/enemyFamily_spectres.js"></script>
<script src="./src/game/enemies/bossFamily_anubis.js"></script>
<!-- Optional: include devconsole for testing cheats -->
<script src="./src/game/devconsole.js"></script>


Make sure these tags appear in the correct order so dependencies are defined before use. The input.js file must be loaded so that setupInput() exists when the engine calls it
raw.githubusercontent.com
.

3. Reintroduce core shooter logic

If you no longer have the original file that defined the shooter engine, you need to recreate the essential global functions. Below are minimal versions of the missing functions; they should be placed in a new file (e.g., src/game/shooterCore.js) and imported in game.html before the level scripts:

// shooterCore.js – minimal core implementation
(function(){
  const S = window.GameState;
  // Reset arrays and player state before each mission
  window.resetGameState = function resetGameState() {
    S.enemies      = [];
    S.bullets      = [];
    S.enemyBullets = [];
    S.rockets      = [];
    S.particles    = [];
    S.powerUps     = [];
    S.thrustParticles = [];
    S.loot         = [];
    // initialise player (position at bottom centre)
    S.player = { x: S.W/2, y: S.H - 100, radius: 22, hp: 100, angle: -Math.PI/2, bank:0 };
  };

  // Generic enemy spawn function used by Level1
  window.spawnEnemy = function spawnEnemy(spec = {}) {
    const enemy = Object.assign({
      type: spec.type || 'basicDrone',
      x: spec.x ?? Math.random() * S.W,
      y: spec.y ?? -50,
      hp: spec.hp ?? 30,
      speedY: spec.speed ?? 60,
      radius: spec.size ?? 20,
      waveAmp: 30,
      waveSpeed: 3,
      phase: Math.random() * Math.PI
    }, spec);
    S.enemies.push(enemy);
  };

  // Spawn enemy by template name (zigzag, tank, etc.)
  window.spawnEnemyType = function(type) {
    const templates = window.EnemyTemplates || window.EnemyTypes || {};
    const tpl = templates[type];
    if (!tpl) {
      console.warn('Unknown enemy type:', type);
      // fallback to basic drone
      return spawnEnemy({ type: 'basicDrone' });
    }
    if (tpl.spawn) {
      return tpl.spawn(Math.random()*S.W, -30);
    }
    return spawnEnemy({
      type,
      hp: tpl.hp,
      speed: tpl.speed,
      size: tpl.size
    });
  };

  // Spawn bosses via templates
  window.spawnBoss = function spawnBoss(spec) {
    S.enemies.push(Object.assign({ radius: spec.size || 80 }, spec));
  };
  window.spawnScorpionBoss = function() {
    // Example: use the Anubis guardian boss from bossFamily_anubis
    const fam = window.BossFamilies?.anubis;
    if (fam?.guardian) fam.guardian.spawn(S.W/2, -180);
  };
  window.spawnGeminiBoss = function() {
    const fam = window.BossFamilies?.anubis;
    if (fam?.titan) fam.titan.spawn(S.W/2, -200);
  };

  // Update loop for the shooter engine (entities, bullets, collisions)
  window.updateGame = function updateGame(dt) {
    // Handle player movement
    const p = S.player;
    if (!p) return;
    // Move via joystick or keyboard stored in S.moveX/moveY by input.js
    p.x += (S.moveX ?? 0) * 300 * dt;
    p.y += (S.moveY ?? 0) * 300 * dt;
    // Clamp to screen bounds
    p.x = Math.max(p.radius, Math.min(S.W - p.radius, p.x));
    p.y = Math.max(p.radius, Math.min(S.H - p.radius, p.y));

    // Update enemies movement
    for (const e of S.enemies) {
      // Simple downward movement plus zigzag pattern
      e.y += (e.speedY || 60) * dt;
      if (e.waveAmp) {
        e.phase += (e.waveSpeed || 3) * dt;
        e.x += Math.sin(e.phase) * e.waveAmp * dt;
      }
    }
    // TODO: update bullets, enemyBullets and handle collisions
  };

  // Core draw function used by Level modules
  window.drawGameCore = function drawGameCore(ctx) {
    const p = S.player;
    if (!ctx || !p) return;
    ctx.clearRect(0, 0, S.W, S.H);
    // Draw enemies as circles for now
    for (const e of S.enemies) {
      ctx.fillStyle = '#c33';
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI*2);
      ctx.fill();
    }
    // Draw player sprite via drawPlayer() if loaded
    if (window.drawPlayer) drawPlayer(ctx);
  };
})();


Add the following line in game.html before the level scripts to load this core file:

<script src="./src/game/shooterCore.js"></script>


These functions are simplified; they make the game run again by spawning enemies and bosses and drawing them as red circles until you bring back the original art and behaviour. You can gradually enrich these functions by porting code from your old build (player firing, bullets, collisions, power‑ups, etc.)

4. Align enemy names with templates

The new enemy templates define only basicDrone, striker and tank
raw.githubusercontent.com
, but Level2 tries to spawn zigzag and shooter
raw.githubusercontent.com
. Either rename those to match existing templates or create new templates:

// Example new enemy template in enemyTemplates.js
window.EnemyTypes.zigzag = {
  hp: 25, speed: 70, size: 20,
  spawn(x, y) {
    spawnEnemy({ type: 'zigzag', x, y, hp: 25, speedY: 70, size: 20, waveAmp: 40, waveSpeed: 5 });
  }
};
window.EnemyTypes.shooter = {
  hp: 30, speed: 60, size: 22,
  spawn(x, y) {
    spawnEnemy({ type: 'shooter', x, y, hp: 30, speedY: 60, size: 22 });
  }
};


Then spawnEnemyType('zigzag') will work.

5. Validate after each change

Follow the “Codex testing checklist” from your README_CODEX_GUIDE.md:

Load game.html and open the browser console – ensure no errors about undefined functions.

Click “Start Game”; confirm that the map hides, the mission starts and enemies spawn.

Verify that after defeating the boss, the level finishes and returns to the map.

Check that only one level is active at a time via LevelManager.hasActiveLevel().

Ensure there are no duplicate loops (no redefinitions of updateGame or drawGame).

Conclusion

The modular refactor removed or failed to include the shooter core modules and a key background asset. As a result, the current build loads only the UI and plays music but does not spawn any game objects. To recover, you must (1) restore the missing background or point the code at an existing image, (2) include all essential scripts (player, input, enemy templates, loot, etc.) in game.html, and (3) recreate or import the core shooter functions (resetGameState, spawnEnemy, updateGame, drawGameCore, etc.). Once these functions are defined and loaded, the levels will again be able to spawn enemies, bosses and backgrounds, and the game will play as intended.