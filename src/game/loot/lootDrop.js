window.spawnLoot = function(x, y, lootItem) {
  const S = window.GameState;
  if (!S.loot) S.loot = [];

  S.loot.push({
    x, y,
    ...lootItem,
    vx: rand(-40, 40),
    vy: rand(-80, -120),
    age: 0
  });
};

window.rollLoot = function() {
  for (const key in window.LootTable) {
    const entry = window.LootTable[key];
    if (Math.random() < entry.chance) return entry.item;
  }
  return null;
};

window.updateLoot = function(dt) {
  const S = window.GameState;
  if (!S.loot) S.loot = [];

  for (const item of S.loot) {
    item.vy += dt * 180;
    item.x += item.vx * dt;
    item.y += item.vy * dt;
    item.age += dt;

    if (item.age > 8) item.collected = true;

    // player pickup
    if (window.isCollidingPlayer && isCollidingPlayer(item)) {
      if (item.type === "wizz_coin") S.wizzCoins = (S.wizzCoins || 0) + item.amount;
      if (item.type === "scrap") S.scrap = (S.scrap || 0) + item.amount;
      if (item.type === "shield_part") S.shieldParts = (S.shieldParts || 0) + item.amount;
      if (item.type === "core_fragment") S.coreFragments = (S.coreFragments || 0) + item.amount;
      item.collected = true;
    }
  }
  S.loot = S.loot.filter(i => !i.collected);
};
