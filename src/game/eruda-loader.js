// Conditional Eruda loader. Enable by adding ?eruda to the URL or run in console:
// localStorage.setItem('eruda','1'); location.reload();
(function () {
  try {
    var shouldLoad = location.search.indexOf('eruda') !== -1 || localStorage.getItem('eruda') === '1';
    if (!shouldLoad) return;
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/eruda';
    s.async = true;
    s.onload = function () {
      try {
        // eslint-disable-next-line no-undef
        eruda.init();
        console.log('Eruda loaded and initialized (toggle with localStorage.setItem("eruda","1") or ?eruda).');
      } catch (e) {
        console.warn('Eruda load failed:', e);
      }
    };
    document.head.appendChild(s);
  } catch (e) {
    console.warn('Eruda loader failed:', e);
  }
})();
