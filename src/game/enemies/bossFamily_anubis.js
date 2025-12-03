window.BossFamilies = window.BossFamilies || {};

window.BossFamilies.anubis = {
  guardian: {
    hp: 1400,
    speed: 45,
    sprite: "./src/game/assets/cruiser.png",
    size: 120,
    spawn(x, y) {
      if (window.spawnBoss) {
        spawnBoss({
          type: "anubisGuardian",
          x,
          y,
          hp: this.hp,
          speed: this.speed,
          size: this.size,
          sprite: this.sprite
        });
      }
    }
  },

  titan: {
    hp: 2200,
    speed: 25,
    sprite: "./src/game/assets/paragfighter.png",
    size: 150,
    spawn(x, y) {
      if (window.spawnBoss) {
        spawnBoss({
          type: "anubisTitan",
          x,
          y,
          hp: this.hp,
          speed: this.speed,
          size: this.size,
          sprite: this.sprite
        });
      }
    }
  },

  dreadnought: {
    hp: 2800,
    speed: 15,
    sprite: "./src/game/assets/oldFIGHTER12.png",
    size: 200,
    spawn(x, y) {
      if (window.spawnBoss) {
        spawnBoss({
          type: "anubisDreadnought",
          x,
          y,
          hp: this.hp,
          speed: this.speed,
          size: this.size,
          sprite: this.sprite
        });
      }
    }
  }
};

window.BossTemplates = window.BossTemplates || {};
window.BossTemplates.anubis = window.BossFamilies.anubis;
