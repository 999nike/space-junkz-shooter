// Input wrapper to keep engine modular
(function () {
  const Input = {
    init() {
      if (typeof window.setupInput === "function") {
        window.setupInput();
      }
    },
  };

  window.InputManager = Input;
})();
