window.EnemyTypes = {
  basicDrone: {
    hp: 20,
    speed: 80,
    size: 28,
    color: "cyan",
    spawn(x, y) {
      if (window.spawnEnemy) {
        spawnEnemy({ type: "basicDrone", x, y, hp: this.hp, speed: this.speed });
      }
    }
  },

  striker: {
    hp: 35,
    speed: 120,
    size: 22,
    color: "orange",
    spawn(x, y) {
      if (window.spawnEnemy) {
        spawnEnemy({ type: "striker", x, y, hp: this.hp, speed: this.speed });
      }
    }
  },

  tank: {
    hp: 120,
    speed: 40,
    size: 40,
    color: "red",
    spawn(x, y) {
      if (window.spawnEnemy) {
        spawnEnemy({ type: "tank", x, y, hp: this.hp, speed: this.speed });
      }
    }
  }
};

window.EnemyTemplates = window.EnemyTypes;
window.BossTemplates = window.BossTypes;
