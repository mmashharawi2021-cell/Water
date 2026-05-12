(() => {
  const MIN_TIME = 850;
  const startedAt = Date.now();

  function hideLoader() {
    const loader = document.getElementById('appLoader');
    if (!loader) return;
    const wait = Math.max(0, MIN_TIME - (Date.now() - startedAt));
    setTimeout(() => {
      loader.classList.add('hide');
      setTimeout(() => loader.remove(), 520);
    }, wait);
  }

  window.WaterLoader = { hide: hideLoader };

  window.addEventListener('load', () => {
    setTimeout(hideLoader, 250);
  });

  setTimeout(hideLoader, 4200);
})();
