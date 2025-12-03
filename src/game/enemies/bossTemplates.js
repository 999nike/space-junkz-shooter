window.BossTypes = {
  spectreBoss: {
    hp: 800,
    speed: 45,
    size: 80,
    color: "purple",
    spawn(x, y) {
      if (window.spawnBoss) {
        spawnBoss({
          type: "spectreBoss",
          x,
          y,
          hp: this.hp,
          speed: this.speed,
          size: this.size
        });
      }
    }
  },

  dreadnought: {
    hp: 1600,
    speed: 20,
    size: 120,
    color: "darkred",
    spawn(x, y) {
      if (window.spawnBoss) {
        spawnBoss({
          type: "dreadnought",
          x,
          y,
          hp: this.hp,
          speed: this.speed,
          size: this.size
        });
      }
    }
  }
};

window.EnemyTemplates = window.EnemyTypes;
window.BossTemplates = window.BossTypes;
