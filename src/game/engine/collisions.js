// Centralized collision and entity update helpers for the shooter engine
(function () {
  const Collisions = {
    updateEnemies(dt) {
      const S = window.GameState;
      if (!S || !S.enemies) return;
      const player = S.player;

      for (let i = S.enemies.length - 1; i >= 0; i--) {
        const e = S.enemies[i];

        if (e.manualUpdate && typeof e.update === "function") {
          e.update(dt);
          continue;
        }

        // Bosses delegate to their own handlers
        if (e.type === "scorpionBoss") {
          if (typeof window.updateBossScorpion === "function") {
            window.updateBossScorpion(e, dt);
          }
          continue;
        }
        if (e.type === "geminiBoss") {
          if (typeof window.updateBossGemini === "function") {
            window.updateBossGemini(e, dt);
          }
          continue;
        }

        // ===== BASIC ENEMY AI =====
        const px = player.x;
        const py = player.y;
        const dx = px - e.x;
        const dy = py - e.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = dx / len;
        const ny = dy / len;
        const chaseSpeed = e.speedY * 1.1;

        e.x += nx * chaseSpeed * dt;
        e.y += ny * chaseSpeed * dt;

        if (e.type === "zigzag") {
          e.phase += e.waveSpeed * dt;
          e.x += Math.sin(e.phase) * e.waveAmp * dt;
        }

        // Shared shooter cadence
        e.shootTimer = (e.shootTimer || 0) - dt;
        if (e.shootTimer <= 0) {
          S.enemyBullets.push({
            x: e.x,
            y: e.y + e.radius,
            vy: 260,
            vx: 0,
            radius: 3,
            colour: "#61d6ff",
          });
          e.shootTimer = 2.0;
        }

        if (e.y > S.H + 120) {
          e.x = rand(40, S.W - 40);
          e.y = rand(-180, -40);
          e.speedY = rand(40, 90);
          e.hp = rand(1, 3);
        }

        if (e.hitFlash > 0) e.hitFlash -= dt;
        if (e.y > S.H + 40) {
          S.enemies.splice(i, 1);
          continue;
        }

        if (player.invuln <= 0 && circleHit(player, e, -4)) {
          S.enemies.splice(i, 1);
          window.spawnExplosion(e.x, e.y, "#ff9977");
          window.damagePlayer();
        }
      }
    },

    updatePlayerBullets(dt) {
      const S = window.GameState;
      if (!S || !S.bullets) return;

      for (let i = S.bullets.length - 1; i >= 0; i--) {
        const b = S.bullets[i];
        b.y += b.vy * dt;
        b.x += (b.vx || 0) * dt;

        if (b.y < -20 || b.x < -20 || b.x > S.W + 20) {
          S.bullets.splice(i, 1);
          continue;
        }

        let hit = false;
        for (let j = S.enemies.length - 1; j >= 0; j--) {
          const e = S.enemies[j];
          if (!circleHit(b, e)) continue;

          hit = true;
          e.hp -= 1;
          e.hitFlash = 0.2;

          if (e.type === "scorpionBoss") {
            if (e.hp <= 0) window.killScorpionBoss(e);
            break;
          }

          if (e.type === "geminiBoss") {
            if (e.hp <= 0) window.killGeminiBoss(e);
            break;
          }

          if (e.hp <= 0) {
            S.enemies.splice(j, 1);
            window.handleEnemyDeath(e);
          }
          break;
        }

        if (hit) S.bullets.splice(i, 1);
      }
    },

    updateEnemyBullets(dt) {
      const S = window.GameState;
      if (!S || !S.enemyBullets) return;
      const player = S.player;

      for (let i = S.enemyBullets.length - 1; i >= 0; i--) {
        const b = S.enemyBullets[i];
        b.y += b.vy * dt;
        if (b.vx) b.x += b.vx * dt;

        if (b.y > S.H + 40 || b.x < -40 || b.x > S.W + 40) {
          S.enemyBullets.splice(i, 1);
          continue;
        }

        if (player.invuln <= 0 && circleHit(b, player)) {
          S.enemyBullets.splice(i, 1);
          window.spawnExplosion(player.x, player.y + 10, "#ff9977");
          window.damagePlayer();
        }
      }
    },

    updateRockets(dt) {
      const S = window.GameState;
      if (!S || !S.rockets) return;

      for (let i = S.rockets.length - 1; i >= 0; i--) {
        const r = S.rockets[i];

        if (r.homing) {
          let nearest = null;
          let dist = 99999;
          for (const e of S.enemies) {
            if (e.type === "scorpionBoss") continue;
            const dx = e.x - r.x;
            const dy = e.y - r.y;
            const d = dx * dx + dy * dy;
            if (d < dist) {
              dist = d;
              nearest = e;
            }
          }

          if (nearest) {
            const ang = Math.atan2(nearest.y - r.y, nearest.x - r.x);
            r.vx = Math.cos(ang) * 300;
            r.vy = Math.sin(ang) * 300;
          }
        }

        r.x += r.vx * dt;
        r.y += r.vy * dt;

        if (r.y < -40 || r.x < -40 || r.x > S.W + 40) {
          S.rockets.splice(i, 1);
          continue;
        }

        for (let j = S.enemies.length - 1; j >= 0; j--) {
          const e = S.enemies[j];
          if (!circleHit(r, e)) continue;

          S.rockets.splice(i, 1);
          e.hp -= 2;
          window.spawnExplosion(r.x, r.y, e.colour);
          if (e.hp <= 0) {
            S.enemies.splice(j, 1);
            window.handleEnemyDeath(e);
          }
          break;
        }
      }
    },

    updatePowerUps(dt) {
      const S = window.GameState;
      if (!S || !S.powerUps) return;
      const player = S.player;

      for (let i = S.powerUps.length - 1; i >= 0; i--) {
        const p = S.powerUps[i];
        p.y += p.speedY * dt;

        if (p.y > S.H + 20) {
          S.powerUps.splice(i, 1);
          continue;
        }

        if (!circleHit(player, p)) continue;
        S.powerUps.splice(i, 1);

        if (p.type === "shieldA") {
          S.hasShieldA = true;
          window.flashMessage("🛡️ SHIELD PART A COLLECTED");
          continue;
        }

        if (p.type === "shieldB") {
          S.hasShieldB = true;
          window.flashMessage("🛡️ SHIELD PART B COLLECTED");
          continue;
        }

        if (!S.shieldUnlocked && S.hasShieldA && S.hasShieldB) {
          S.shieldUnlocked = true;
          S.shield = S.maxShield || 100;
          window.flashMessage("⚡ SHIELD ACTIVATED!");
        }

        if (p.type === "coin") {
          S.wizzCoins += p.amount;
          if (S.coinsEl) S.coinsEl.textContent = S.wizzCoins;
          window.flashMessage("+" + p.amount + " WIZZCOIN");
          continue;
        }

        if (p.type === "shield") {
          const maxShield = S.maxShield || 100;
          const gain = p.amount || 20;
          S.shield = Math.min(maxShield, (S.shield || 0) + gain);
          window.flashMessage("+" + gain + " SHIELD");
          continue;
        }

        if (p.type === "health") {
          const maxLives = S.maxLives || S.lives || 100;
          const gain = p.amount || 20;
          S.lives = Math.min(maxLives, (S.lives || 0) + gain);
          if (S.livesEl) S.livesEl.textContent = S.lives;
          window.flashMessage("+" + gain + " HULL");
          continue;
        }

        // Default weapon pickup
        S.player.weaponLevel = Math.min(5, (S.player.weaponLevel || 1) + 1);
        window.flashMessage("WEAPON POWER-UP!");
      }
    },
  };

  window.Collisions = Collisions;
})();
