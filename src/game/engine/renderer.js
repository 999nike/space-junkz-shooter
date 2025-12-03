// Renderer orchestrator that delegates to active level when present
(function () {
  const EngineRenderer = {
    draw() {
      const ctx = window.GameState.ctx;
      if (window.LevelManager && window.LevelManager.hasActiveLevel()) {
        window.LevelManager.draw(ctx);
        return;
      }
      window.drawGame();
    },
  };

  window.EngineRenderer = EngineRenderer;
})();
