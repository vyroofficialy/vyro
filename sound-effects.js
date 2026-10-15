/* Sound effects: tiny synthesized sounds (no audio files). The logo sting tries to play the moment the site opens, with no tap needed. If the browser's autoplay policy blocks that, it starts on the very first click/key/tap instead. Can be muted with the speaker button. */
(function () {
  var ctx = null,
    master = null,
    noise = null,
    enabled = true,
    unlocked = false,
    lastHover = 0,
    lastTick = 0,
    lastIntro = -1e9,
    INTRO_BOOST = 2,
    VOL_BOOST = 3,
    limiter = null,
    mediaBus =
      null; /* logo sting: +100% volume (x2 gain), replays every time page 1 comes into view */
  try {
    enabled = localStorage.getItem('vyro-sfx') !== 'off';
  } catch (e) {}
  var btn = null,
    hint = null,
    hintTimer = 0;

  function get() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch (e) {
      return null;
    }
    try {
      ctx.addEventListener('statechange', check);
    } catch (e) {}
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.ratio.value = 4;
    master = ctx.createGain();
    master.gain.value = 0.55;
    /* overall volume +200% (x3 gain) after the compressor, then a limiter so the louder mix never distorts */
    var boost = ctx.createGain();
    boost.gain.value = VOL_BOOST;
    limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -2;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.12;
    mediaBus = ctx.createGain();
    mediaBus.gain.value = VOL_BOOST;
    master.connect(comp);
    comp.connect(boost);
    boost.connect(limiter);
    mediaBus.connect(limiter);
    limiter.connect(ctx.destination);
    var len = ctx.sampleRate,
      buf = ctx.createBuffer(1, len, ctx.sampleRate),
      d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    noise = buf;
    return ctx;
  }
  function ready() {
    return enabled && ctx && ctx.state === 'running';
  }
  function env(g, t, a, peak, d) {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function tone(type, f0, f1, dur, peak, delay, att) {
    var t = ctx.currentTime + (delay || 0),
      o = ctx.createOscillator(),
      g = ctx.createGain();
    att = att || 0.006;
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(g, t, att, peak, dur);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + att + dur + 0.05);
  }
  function sweep(f0, f1, dur, peak, q, delay) {
    var t = ctx.currentTime + (delay || 0),
      s = ctx.createBufferSource(),
      f = ctx.createBiquadFilter(),
      g = ctx.createGain();
    s.buffer = noise;
    s.loop = true;
    f.type = 'bandpass';
    f.Q.value = q || 1;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(g, t, dur * 0.3, peak, dur * 0.7);
    s.connect(f);
    f.connect(g);
    g.connect(master);
    s.start(t);
    s.stop(t + dur + 0.1);
  }
  var api = {
    click: function () {
      if (!ready()) return;
      tone('triangle', 620, 900, 0.09, 0.1);
      tone('sine', 1320, 1320, 0.05, 0.035, 0.01);
    },
    hover: function () {
      if (!ready()) return;
      var n = performance.now();
      if (n - lastHover < 140) return;
      lastHover = n;
      tone('sine', 2400, 2400, 0.025, 0.016);
    },
    tick: function () {
      if (!ready()) return;
      var n = performance.now();
      if (n - lastTick < 70) return;
      lastTick = n;
      tone('sine', 1700 + Math.random() * 500, 1100, 0.03, 0.03);
    },
    whoosh: function (dir) {
      if (!ready()) return;
      var up = dir >= 0;
      sweep(up ? 450 : 2600, up ? 2600 : 450, 0.6, 0.17, 1.1);
      tone('sine', up ? 220 : 340, up ? 460 : 170, 0.5, 0.05, 0, 0.09);
    },
    open: function () {
      if (!ready()) return;
      sweep(400, 3200, 0.5, 0.17, 1.2);
      tone('sine', 392, 784, 0.35, 0.05, 0.02, 0.04);
    },
    close: function () {
      if (!ready()) return;
      sweep(2600, 350, 0.4, 0.14, 1.2);
      tone('sine', 523, 262, 0.3, 0.045, 0.0, 0.02);
    },
    intro: function () {
      if (!ready()) return;
      var nw = performance.now();
      if (nw - lastIntro < 1500) return;
      lastIntro = nw;
      sweep(300, 4200, 1.3, 0.1 * INTRO_BOOST, 0.9);
      [392, 494, 587, 784].forEach(function (f, i) {
        tone('sine', f, f, 0.5, 0.04 * INTRO_BOOST, 0.35 + i * 0.12, 0.03);
      });
    },
  };
  /* videos in the full-screen viewer are routed through the same x3 boost + limiter (HTML volume alone is capped at 100%) */
  api.boostMedia = function (v) {
    return new Promise(function (res) {
      var fin = false,
        done = function () {
          if (fin) return;
          fin = true;
          res();
        };
      try {
        var c = get();
        if (!c || !mediaBus || v._vyBoost) return done();
        v.volume = 1;
        setTimeout(done, 500);
        var route = function () {
          try {
            if (c.state === 'running' && !v._vyBoost) {
              c.createMediaElementSource(v).connect(mediaBus);
              v._vyBoost = 1;
            }
          } catch (e) {}
          done();
        };
        var p = c.resume();
        if (p && p.then) p.then(route, route);
        else route();
      } catch (e) {
        done();
      }
    });
  };
  window.vyroSfx = api;

  function setBtn() {
    if (!btn) return;
    btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    btn.setAttribute(
      'aria-label',
      enabled ? 'Sound on. Click to mute' : 'Sound off. Click to turn on'
    );
    btn.title = enabled ? 'Sound on' : 'Sound off';
  }
  function hideHint() {
    if (hint) hint.classList.remove('show');
    clearTimeout(hintTimer);
  }
  /* Start audio with no tap. A page may only make sound on its own if the browser's autoplay policy allows it
     (e.g. the visitor has used the site before, or has allowed sound for it). So we try as early as possible and
     again at every key moment (page load, logo start, tab shown); the first attempt the browser accepts starts the sound.
     If every attempt is blocked, the very first click / key press / tap starts it as a fallback. */
  var GEST = [
    'pointerdown',
    'mousedown',
    'pointerup',
    'touchstart',
    'touchend',
    'click',
    'keydown',
  ];
  function gestOff() {
    GEST.forEach(function (ev) {
      removeEventListener(ev, unlock, true);
    });
  }
  function check() {
    if (unlocked || !enabled || !ctx || ctx.state !== 'running') return;
    unlocked = true;
    hideHint();
    gestOff();
    if (window.__vyroLogoStarted) api.intro();
  }
  function unlock() {
    if (!enabled) return;
    var c = get();
    if (!c) return;
    var p;
    try {
      p = c.resume();
    } catch (e) {}
    if (p && p.then) p.then(check, function () {});
    check();
  }
  GEST.forEach(function (ev) {
    addEventListener(ev, unlock, { passive: true, capture: true });
  });
  ['load', 'pageshow'].forEach(function (ev) {
    addEventListener(ev, unlock);
  });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) unlock();
  });

  /* the logo animation announces its start: play the sting right then, or keep trying to start audio */
  addEventListener('vyro:logo', function () {
    window.__vyroLogoStarted = true;
    if (ready()) api.intro();
    else unlock();
  });

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#snd')) return;
    if (t.closest('.hb,.dot,.oi,.vx,.va,.scue,.vy-helpbtn,.vy-helpclose')) api.click();
  });
  document.addEventListener('pointerover', function (e) {
    if (e.pointerType !== 'mouse') return;
    var t = e.target;
    if (t && t.closest && t.closest('.tile,.pl,.pn:not(.ic)')) {
      var from = e.relatedTarget,
        el = t.closest('.tile,.pl,.pn:not(.ic)');
      if (from && el.contains(from)) return;
      api.hover();
    }
  });

  function init() {
    btn = document.getElementById('snd');
    setBtn();
    if (btn)
      btn.addEventListener('click', function () {
        enabled = !enabled;
        try {
          localStorage.setItem('vyro-sfx', enabled ? 'on' : 'off');
        } catch (e) {}
        setBtn();
        hideHint();
        if (enabled) {
          unlocked = false;
          unlock();
          setTimeout(api.click, 60);
        }
      });
  }
  unlock();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
