/* Hero: animated VYRO logo (video loop, replaces the old SVG logo animation on slide 1).
   The clip has a black background, so each frame is drawn to a canvas with black converted to transparency. */
(function () {
  var host = document.getElementById('hlogo'),
    v = document.getElementById('hlogoV'),
    c = document.getElementById('hlogoC'),
    srcEl = document.getElementById('logoSrc');
  if (!host || !v || !c || !srcEl) return;
  var ctx = c.getContext('2d', { willReadFrequently: true }),
    W = c.width,
    H = c.height,
    T = 22,
    S = 255 / (255 - T);
  var mq = matchMedia('(prefers-reduced-motion:reduce)'),
    sent = false,
    visible = false,
    ready = false,
    playing = false;
  function announce() {
    if (sent) return;
    sent = true;
    try {
      dispatchEvent(new CustomEvent('vyro:logo'));
    } catch (e) {}
  }
  function draw() {
    try {
      ctx.drawImage(v, 0, 0, W, H);
      var id = ctx.getImageData(0, 0, W, H),
        d = id.data,
        n = d.length,
        i,
        r,
        g,
        b,
        m,
        k;
      for (i = 0; i < n; i += 4) {
        r = d[i];
        g = d[i + 1];
        b = d[i + 2];
        m = r > g ? (r > b ? r : b) : g > b ? g : b;
        if (m <= T) {
          d[i + 3] = 0;
          continue;
        }
        k = 255 / m;
        d[i] = r * k;
        d[i + 1] = g * k;
        d[i + 2] = b * k;
        d[i + 3] = (m - T) * S;
      }
      ctx.putImageData(id, 0, 0);
    } catch (e) {}
  }
  function tick() {
    if (!playing) return;
    draw();
    if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(tick);
    else requestAnimationFrame(tick);
  }
  function sync() {
    if (!ready) return;
    if (mq.matches) {
      playing = false;
      v.pause();
      try {
        v.currentTime = 2;
      } catch (e) {}
      announce();
      return;
    }
    if (visible && !document.hidden) {
      if (!playing) {
        playing = true;
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
        tick();
      }
    } else {
      playing = false;
      v.pause();
    }
  }
  v.addEventListener('seeked', function () {
    if (!playing) draw();
  });
  v.addEventListener('playing', announce); /* `sent` de-dupes within one visit */
  try {
    var d = srcEl.textContent.trim(),
      h = d.indexOf(','),
      m = d.slice(5, d.indexOf(';')),
      bin = atob(d.slice(h + 1)),
      n = bin.length,
      u = new Uint8Array(n);
    for (var i = 0; i < n; i++) u[i] = bin.charCodeAt(i);
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.addEventListener(
      'loadeddata',
      function () {
        ready = true;
        sync();
      },
      { once: true }
    );
    v.src = URL.createObjectURL(new Blob([u], { type: m }));
    v.load();
  } catch (e) {}
  var fb = 0;
  /* every time the hero logo comes back into view: restart the clip and let the sting play with it */
  function enter() {
    clearTimeout(fb);
    fb = setTimeout(announce, 1500); /* never depend on the video decoding */
    if (ready) {
      try {
        v.currentTime = 0;
      } catch (e) {}
    }
  }
  function leave() {
    clearTimeout(fb);
    sent = false;
    window.__vyroLogoStarted = false;
  }
  new IntersectionObserver(
    function (es) {
      es.forEach(function (e) {
        var was = visible;
        visible = e.isIntersecting;
        if (visible && !was) enter();
        else if (!visible && was) leave();
        sync();
      });
    },
    { threshold: 0.15 }
  ).observe(host);
  document.addEventListener('visibilitychange', sync);
})();
