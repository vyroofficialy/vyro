/* Wave controller: lazy-loads the wave once idle, plays it only from slide 2 onward, pauses when hidden. */
(function () {
  var app = document.getElementById('app'),
    box = document.getElementById('wave'),
    v = document.getElementById('waveV'),
    srcEl = document.getElementById('waveSrc');
  if (!app || !box || !v || !srcEl) return;
  var mq = matchMedia('(prefers-reduced-motion:reduce)'),
    loaded = false;
  function load() {
    if (loaded) return;
    loaded = true;
    try {
      var d = srcEl.textContent.trim(),
        h = d.indexOf(','),
        m = d.slice(5, d.indexOf(';')),
        b = atob(d.slice(h + 1)),
        n = b.length,
        a = new Uint8Array(n);
      for (var i = 0; i < n; i++) a[i] = b.charCodeAt(i);
      v.addEventListener(
        'loadeddata',
        function () {
          box.classList.add('ready');
          sync();
        },
        { once: true }
      );
      v.src = URL.createObjectURL(new Blob([a], { type: m }));
      v.load();
    } catch (e) {}
  }
  function sync() {
    if (!loaded || !v.readyState) return;
    if (app.classList.contains('wave-on') && !document.hidden) {
      if (mq.matches) {
        try {
          v.currentTime = 2.4;
        } catch (e) {}
        v.pause();
      } else {
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      }
    } else v.pause();
  }
  function update() {
    if (app.classList.contains('wave-on')) load();
    sync();
  }
  new MutationObserver(update).observe(app, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync);
  if (mq.addEventListener) mq.addEventListener('change', sync);
  addEventListener('load', function () {
    setTimeout(function () {
      (window.requestIdleCallback || setTimeout)(load);
    }, 1500);
  });
  update();
})();
