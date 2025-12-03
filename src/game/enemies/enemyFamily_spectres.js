window.EnemyFamilies = window.EnemyFamilies || {};

window.EnemyFamilies.spectres = {

  shadowling: {
    hp: 28,
    speed: 110,
    sprite: "./src/game/assets/oldPISCES12.png",
    spawn(x, y) {
      spawnEnemy({
        type: "shadowling",
        x, y,
        hp: this.hp,
        speed: this.speed,
        sprite: this.sprite
      });
    }
  },

  spectreHunter: {
    hp: 55,
    speed: 150,
    sprite: "./src/game/assets/oldCANCER2.png",
    spawn(x, y) {
      spawnEnemy({
        type: "spectreHunter",
        x, y,
        hp: this.hp,
        speed: this.speed,
        sprite: this.sprite
      });
    }
  },

  voidMarauder: {
    hp: 140,
    speed: 65,
    sprite: "./src/game/assets/oldARIES2.png",
    spawn(x, y) {
      spawnEnemy({
        type: "voidMarauder",
        x, y,
        hp: this.hp,
        speed: this.speed,
        sprite: this.sprite
      });
    }
  }
};
