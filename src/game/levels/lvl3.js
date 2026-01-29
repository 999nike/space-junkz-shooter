// ======================================================
// LEVEL 3 - DRAX SYSTEM misison 2 (STABLE CLEAN VERSION)
// • Mid Boss + Final Boss
// • Clean enter/exit
// • No global overrides
// • No cross-level contamination
// ======================================================

(function () {
  const S = window.GameState;

  // Mission 2 multi-boss sequence (Backblaze bosses)
  const MISSION2_BOSSES = [
    {
      id: "cancer",
      phase: 0,
      url: "https://f003.backblazeb2.com/file/space-junkz-assets/junkz-assets/bosses/oldCANCER2.png",
      hp: 650,
      radius: 90,
      pattern: "cancer",
      intro: "⚠ CANCER DREADNAUGHT INBOUND",
    },
    {
      id: "fighter",
      phase: 1,
      url: "https://f003.backblazeb2.com/file/space-junkz-assets/junkz-assets/bosses/oldFIGHTER2.png",
      hp: 580,
      radius: 80,
      pattern: "fighter",
      intro: "⚠ DRAX FIGHTER ACE ARRIVING",
    },
    {
      id: "leo",
      phase: 2,
      url: "https://f003.backblazeb2.com/file/space-junkz-assets/junkz-assets/bosses/oldLEO2.png",
      hp: 720,
      radius: 95,
      pattern: "leo",
      intro: "⚠ LEO SIEGE CRUISER APPROACHING",
    },
    {
      id: "scorpio",
      phase: 3,
      url: "https://f003.backblazeb2.com/file/space-junkz-assets/junkz-assets/bosses/oldSCORPIO12.png",
      hp: 780,
      radius: 100,
      pattern: "scorpio",
      intro: "⚠ SCORPIO ASSAULT CARRIER DETECTED",
    },
    {
      id: "virgo",
      phase: 4,
      url: "https://f003.backblazeb2.com/file/space-junkz-assets/junkz-assets/bosses/oldVIRGO2.png",
      hp: 950,
      radius: 110,
      pattern: "virgo",
      intro: "⚠⚠ VIRGO FLAGSHIP ARRIVING ⚠⚠",
    },
  ];

  window.Level3 = {
    active: false,
    timer: 0,
    spawnTimer: 0,
    midBossSpawned: false,
    finalBossSpawned: false,
    bossPhaseIndex: 0,
    bossPhaseTimer: 0,
    bg: null,
    bgLoaded: false,
    bossLogicAttached: false,

    // -----------------------------
    // ENTER
    // -----------------------------
    enter() {
      console.log("🚀 LEVEL 3 — DRAX SYSTEM");

      this.active = true;
      this.timer = 0;
      this.spawnTimer = 0;
      this.midBossSpawned = false;
      this.finalBossSpawned = false;
      this.bossPhaseIndex = 0;
      this.bossPhaseTimer = 0;

     // ---- PRESERVE SHIELD STATE ACROSS RESET ----
const shieldSnapshot = {
  shield: S.shield,
  maxShield: S.maxShield,
  shieldUnlocked: S.shieldUnlocked,
  hasShieldA: S.hasShieldA,
  hasShieldB: S.hasShieldB,
};

// Reset shooter core (enemies, bullets, etc)
if (window.resetGameState) resetGameState();

// Restore shield state
S.shield = shieldSnapshot.shield || 0;
S.maxShield = shieldSnapshot.maxShield || 100;
S.shieldUnlocked = shieldSnapshot.shieldUnlocked || false;
S.hasShieldA = shieldSnapshot.hasShieldA || false;
S.hasShieldB = shieldSnapshot.hasShieldB || false;
      S.running = true;
      S.currentLevel = 3;

      // Player
      S.player.invuln = 1.3;

      // Background
      this.bg = new Image();
      this.bg.src = "./src/game/assets/mission1_bg.png";
      this.bg.onload = () => (this.bgLoaded = true);

      // Disable map/home
      if (window.WorldMap) WorldMap.active = false;
      if (window.HomeBase) HomeBase.active = false;

      if (window.initStars) initStars();

      window.flashMsg("MISSION 2 – DRAX SYSTEM");
      setTimeout(() => window.flashMsg("ENEMY FLEET INBOUND"), 1400);

      // Attach safe boss logic once
      if (!this.bossLogicAttached) {
        this.attachBossLogic();
        this.bossLogicAttached = true;
      }
    },

    // -----------------------------
    // UPDATE
    // -----------------------------
    update(dt) {
      if (!this.active || !S.running) return;

      this.timer += dt;
      this.spawnTimer -= dt;

      // ---- PRE-BOSS WAVES ----
      // Keep some regular waves before the boss rush starts
      if (this.bossPhaseIndex === 0 && this.timer < 28) {
        if (this.spawnTimer <= 0) {
          this.spawnWave();
          this.spawnTimer = Math.random() * 0.5 + 0.35;
        }
      }

      // ---- MISSION 2 MULTI-BOSS SEQUENCE ----
      const aliveBossCount = S.enemies.filter(
        (e) => e.type === "mission2Boss" && e.hp > 0
      ).length;

      // If no boss is alive and there are phases left, spawn the next one
      if (aliveBossCount === 0 && this.bossPhaseIndex < MISSION2_BOSSES.length) {
        this.bossPhaseTimer += dt;

        // Small pause between bosses
        if (this.bossPhaseTimer >= 2.0) {
          this.spawnBossPhase(this.bossPhaseIndex);
          this.bossPhaseIndex += 1;
          this.bossPhaseTimer = 0;
        }
      } else {
        // While a boss is alive, don't count up the inter-boss timer
        this.bossPhaseTimer = 0;
      }

      // Core engine
      if (window.updateGameCore) updateGameCore(dt);

      // Level completion — after last boss in the sequence is dead
      if (
        this.bossPhaseIndex >= MISSION2_BOSSES.length &&
        !this._finishing
      ) {
        const anyBossLeft = S.enemies.some(
          (e) => e.type === "mission2Boss" && e.hp > 0
        );
        if (!anyBossLeft) {
          this.finishLevel();
        }
      }
    },

    // -----------------------------
    // DRAW
    // -----------------------------
    draw(ctx) {
      if (!this.active) return;

      if (this.bgLoaded) ctx.drawImage(this.bg, 0, 0, S.W, S.H);
      else {
        ctx.fillStyle = "#05010a";
        ctx.fillRect(0, 0, S.W, S.H);
      }

      if (window.drawRunway) drawRunway(ctx);
      if (window.drawGameCore) drawGameCore(ctx);
    },

    // -----------------------------
    // WAVES
    // -----------------------------
    spawnWave() {
      const roll = Math.random();

      if (roll < 0.40) {
        spawnEnemyType("zigzag");
        spawnEnemyType("shooter");
      } else if (roll < 0.70) {
        spawnEnemyType("tank");
        spawnEnemyType("shooter");
      } else {
        spawnEnemyType("zigzag");
        spawnEnemyType("zigzag");
        spawnEnemyType("shooter");
      }
    },

    // -----------------------------
    // MISSION 2 BOSS SPAWN HELPERS
    // -----------------------------
    spawnBossPhase(phaseIndex) {
      const def = MISSION2_BOSSES[phaseIndex];
      if (!def) return;

      if (window.flashMsg && def.intro) {
        window.flashMsg(def.intro);
      }

      const img = new Image();
      img.src = def.url;

      S.enemies.push({
        type: "mission2Boss",
        phase: def.phase,
        pattern: def.pattern,
        img,                     // used by enemies.js drawEnemies
        x: S.W / 2,
        y: -200,
        radius: def.radius,
        hp: def.hp,
        maxHp: def.hp,
        enterComplete: false,
        timer: 0,
        volleyTimer: 0,
        spiralAngle: 0,
        laserTimer: 0,
        isMission2Boss: true,
      });
    },

    // Legacy wrappers (kept so nothing else breaks if it calls them)
    // They simply map to the first and last boss in the gauntlet.
    spawnMidBoss() {
      this.spawnBossPhase(0);
    },

    spawnFinalBoss() {
      this.spawnBossPhase(MISSION2_BOSSES.length - 1);
    },

    // -----------------------------
    // CLEAN BOSS LOGIC (NON-GLOBAL)
    // -----------------------------
    attachBossLogic() {
      const original = window.updateGame;

      window.updateGame = function patchedUpdateGame(dt) {
        original(dt);

        const p = S.player;

        for (const e of S.enemies) {
          // MISSION 2 – multi-boss gauntlet (Cancer, Fighter, Leo, Scorpio, Virgo)
          if (e.type === "mission2Boss") {
            // Entry: slide down then hold position
            if (!e.enterComplete) {
              e.y += 70 * dt;
              if (e.y >= 170) e.enterComplete = true;
            }

            e.timer += dt;
            e.volleyTimer = (e.volleyTimer || 0) + dt;
            e.spiralAngle = (e.spiralAngle || 0) + dt * 1.5;
            e.laserTimer = (e.laserTimer || 0) + dt;

            const fireFan = (count, speed, spread, offsetAngle = 0) => {
              const baseAngle = Math.atan2(p.y - e.y, p.x - e.x);
              for (let i = 0; i < count; i++) {
                const a =
                  baseAngle +
                  ((i - (count - 1) / 2) * spread) +
                  offsetAngle;
                S.enemyBullets.push({
                  x: e.x,
                  y: e.y + 20,
                  vx: Math.cos(a) * speed,
                  vy: Math.sin(a) * speed,
                  radius: 6,
                  colour: "#ffdd88",
                });
              }
            };

            const fireRing = (count, speed) => {
              for (let i = 0; i < count; i++) {
                const a = (i / count) * Math.PI * 2;
                S.enemyBullets.push({
                  x: e.x,
                  y: e.y + 10,
                  vx: Math.cos(a) * speed,
                  vy: Math.sin(a) * speed,
                  radius: 6,
                  colour: "#88e0ff",
                });
              }
            };

            switch (e.phase) {
              case 0: // Cancer – dense forward rain
                if (e.volleyTimer > 1.1) {
                  e.volleyTimer = 0;
                  fireFan(7, 260, 0.12);
                }
                break;

              case 1: // Fighter – fast aimed bursts
                if (e.volleyTimer > 0.6) {
                  e.volleyTimer = 0;
                  fireFan(3, 340, 0.07);
                }
                break;

              case 2: // Leo – big radial rings
                if (e.volleyTimer > 1.6) {
                  e.volleyTimer = 0;
                  fireRing(18, 220);
                }
                break;

              case 3: // Scorpio – twin spiral barrage
                if (e.volleyTimer > 0.08) {
                  e.volleyTimer = 0;
                  const a = e.spiralAngle;
                  S.enemyBullets.push({
                    x: e.x,
                    y: e.y + 10,
                    vx: Math.cos(a) * 260,
                    vy: Math.sin(a) * 260,
                    radius: 6,
                    colour: "#ff77aa",
                  });
                  S.enemyBullets.push({
                    x: e.x,
                    y: e.y + 10,
                    vx: Math.cos(a + Math.PI) * 260,
                    vy: Math.sin(a + Math.PI) * 260,
                    radius: 6,
                    colour: "#ff77aa",
                  });
                }
                break;

              case 4: // Virgo – spreads + occasional beam
                if (e.volleyTimer > 1.4) {
                  e.volleyTimer = 0;
                  fireFan(9, 230, 0.10);
                }

                if (e.laserTimer > 7) {
                  e.laserTimer = 0;
                  S.enemyBullets.push({
                    x: e.x,
                    y: e.y + 80,
                    vx: 0,
                    vy: 520,
                    radius: 18,
                    colour: "#ff0044",
                    beam: true,
                  });
                  if (window.flashMsg) {
                    window.flashMsg("⚡ VIRGO BEAM STRIKE");
                  }
                }
                break;
            }
          }

          // GUNSHIP
          if (e.type === "draxGunship") {
            if (!e.enterComplete) {
              e.y += 60 * dt;
              if (e.y >= 200) e.enterComplete = true;
              continue;
            }

            e.timer += dt;
            e.x = S.W / 2 + Math.sin(e.timer * 1.2) * 130;

            if (e.timer % 1.3 < 0.05) {
              for (let i = -2; i <= 2; i++) {
                S.enemyBullets.push({
                  x: e.x,
                  y: e.y + 40,
                  vx: i * 110,
                  vy: 260,
                  radius: 7,
                  colour: "#9bf3ff",
                });
              }
            }
          }

          // OVERSEER
          if (e.type === "draxFinalBoss") {
            if (!e.enterComplete) {
              e.y += 55 * dt;
              if (e.y >= 160) e.enterComplete = true;
              continue;
            }

            e.timer += dt;
            e.laserTimer += dt;

            // Follow player
            e.x += (p.x - e.x) * 0.9 * dt;

            // Spread shots
            if (e.timer % 1 < 0.05) {
              const spread = [-0.25, 0, 0.25];
              for (const a of spread) {
                S.enemyBullets.push({
                  x: e.x,
                  y: e.y + 40,
                  vx: a * 280,
                  vy: 280,
                  radius: 8,
                  colour: "#ff9977",
                });
              }
            }

            // Laser sweep
            if (e.laserTimer >= 8) {
              e.laserTimer = 0;

              S.enemyBullets.push({
                x: e.x,
                y: e.y + 80,
                vx: 0,
                vy: 500,
                radius: 20,
                colour: "#ff0044",
                beam: true,
              });

              window.flashMsg("⚡ OVERSEER LASER STRIKE");
            }
          }
        }
      };
    },

    // -----------------------------
    // FINISH
    // -----------------------------
    finishLevel() {
      if (this._finishing) return;
      this._finishing = true;

      window.flashMsg("LEVEL 3 COMPLETE!");
      this.active = false;
      S.running = false;

      if (window.unlockNextLevel) unlockNextLevel(3);

      setTimeout(() => {
        if (window.WorldMap) WorldMap.enter();
      }, 1200);
    },
  };
})();
