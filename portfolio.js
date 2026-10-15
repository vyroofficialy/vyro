(function () {
  const META = [
    { k: 'Noida, India \u00b7 Portfolio 2026', t: 'VYRO' },
    { k: '01  \u00b7  SERVICES', t: 'What we create at VYRO' },
    { k: '02  \u00b7  AT A GLANCE', t: 'Our work at a glance' },
    { k: '03  \u00b7  SOCIAL MEDIA', t: 'Social media for digital & tech brands' },
    { k: '04  \u00b7  CAROUSELS', t: 'Carousels that carry a campaign' },
    { k: '05  \u00b7  REAL ESTATE', t: 'Real estate: Homecraft Engineering' },
    { k: '06  \u00b7  EDUCATION', t: 'Campaigns for Maharishi University' },
    { k: '07  \u00b7  BRANDING', t: 'Logos & brand identities' },
    { k: '08  \u00b7  POSTERS', t: 'Posters, covers & event design' },
    { k: '09  \u00b7  ADVERTISING', t: 'Ad creatives & product posters' },
    { k: '10  \u00b7  PRINT & EDITORIAL', t: 'Print & editorial: ANIMATIC magazine' },
    { k: '11  \u00b7  REELS', t: 'Reels that hold attention' },
    { k: 'Get in touch', t: "Let's build your brand." },
  ];
  const FLOWQ = '(max-aspect-ratio:5/4),(max-width:760px),(max-height:480px)';
  const $ = (s, r = document) => r.querySelector(s),
    $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const isFlow = () => matchMedia(FLOWQ).matches;
  const reduce = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
  const app = $('#app'),
    bg = $('#bg'),
    slides = $$('.slide'),
    N = slides.length;
  let cur = -1;
  const sfx = window.vyroSfx || {
    boostMedia: null,
    click() {},
    hover() {},
    tick() {},
    whoosh() {},
    open() {},
    close() {},
    intro() {},
  };
  /* split titles */
  $$('.ti').forEach((el) => {
    const t = el.getAttribute('aria-label') || el.textContent;
    el.textContent = '';
    if (el.classList.contains('hero')) {
      [...t].forEach((c, k) => {
        const s = document.createElement('span');
        s.className = 'w';
        const i = document.createElement('span');
        i.className = 'ch';
        i.style.setProperty('--k', k);
        i.setAttribute('aria-hidden', 'true');
        i.textContent = c;
        s.append(i);
        el.append(s);
      });
    } else
      t.split(' ').forEach((w, k, a) => {
        const s = document.createElement('span');
        s.className = 'w';
        const i = document.createElement('span');
        i.className = 'wi';
        i.style.setProperty('--k', k);
        i.setAttribute('aria-hidden', 'true');
        i.textContent = w;
        s.append(i);
        el.append(s);
        if (k < a.length - 1) el.append(' ');
      });
  });
  slides.forEach((s) => {
    s.style.setProperty('--a1', s.dataset.a1);
    s.style.setProperty('--a2', s.dataset.a2);
  });
  /* HUD */
  const dots = $('#dots'),
    ovg = $('#ovg'),
    cn = $('#cn'),
    foot = $('#foot'),
    prog = $('#prog');
  const pad = (n) => String(n).padStart(2, '0');
  slides.forEach((s, i) => {
    const d = document.createElement('button');
    d.className = 'dot';
    d.type = 'button';
    d.setAttribute('aria-label', 'Go to slide ' + (i + 1) + ': ' + (META[i].t || META[i].k));
    d.onclick = () => go(i);
    dots.append(d);
    const o = document.createElement('button');
    o.className = 'oi';
    o.type = 'button';
    o.innerHTML = '<small></small><span></span>';
    $('small', o).textContent = META[i].k;
    $('span', o).textContent = META[i].t || 'VYRO';
    o.onclick = () => {
      closeOv();
      go(i);
    };
    ovg.append(o);
  });
  function setHud() {
    $$('.dot').forEach((d, i) => d.classList.toggle('on', i === cur));
    $$('.oi').forEach((d, i) => d.classList.toggle('on', i === cur));
    cn.textContent = pad(cur + 1) + ' / ' + pad(N);
    $('#prev').disabled = cur === 0;
    $('#next').disabled = cur === N - 1;
    foot.classList.toggle('off', slides[cur].dataset.foot !== '1');
    prog.style.setProperty('--p', (cur + 1) / N);
    const a1 = slides[cur].dataset.a1,
      a2 = slides[cur].dataset.a2;
    bg.style.setProperty('--o1', a1);
    bg.style.setProperty('--o2', a2);
    app.classList.toggle('wave-on', cur >= 1);
    app.classList.toggle('at-top', cur === 0);
    app.style.setProperty('--a1', a1);
    prog.style.setProperty('--a1', a1);
    prog.style.setProperty('--a2', a2);
    $('#vw').style.setProperty('--a1', a1);
  }
  function countUp(s) {
    $$('.cnt', s).forEach((el) => {
      const to = +el.dataset.to,
        suf = el.dataset.suf || '';
      if (reduce()) {
        el.textContent = to + suf;
        return;
      }
      el.textContent = '0' + suf;
      const t0 = performance.now() + 650,
        dur = 1500;
      const f = (now) => {
        const k = Math.max(0, Math.min(1, (now - t0) / dur)),
          e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(to * e) + suf;
        if (k < 1 && s.classList.contains('on')) requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    });
  }
  function go(n) {
    n = Math.max(0, Math.min(N - 1, n));
    const el = slides[n];
    if (!el) return;
    el.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' });
  }
  $('#scue').onclick = () => go(1);
  $('#prev').onclick = () => go(cur - 1);
  $('#next').onclick = () => go(cur + 1);
  const ov = $('#ov');
  const openOv = () => {
    ov.classList.add('open');
    $$('.oi')[cur].focus();
  };
  const closeOv = () => {
    ov.classList.remove('open');
    $('#idx').focus({ preventScroll: true });
  };
  $('#idx').onclick = () => (ov.classList.contains('open') ? closeOv() : openOv());
  ov.addEventListener('click', (e) => {
    if (e.target === ov) closeOv();
  });
  /* keyboard / wheel / swipe */
  let vOpen = false;
  addEventListener('keydown', (e) => {
    if (vOpen) return viewerKey(e);
    if (ov.classList.contains('open')) {
      if (e.key === 'Escape') closeOv();
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && e.target === document.body)) {
      e.preventDefault();
      go(cur + 1);
    } else if (k === 'ArrowLeft' || k === 'PageUp') {
      e.preventDefault();
      go(cur - 1);
    } else if (k === 'Home') go(0);
    else if (k === 'End') go(N - 1);
    else if (k === 'ArrowDown' && !isFlow()) {
      e.preventDefault();
      go(cur + 1);
    } else if (k === 'ArrowUp' && !isFlow()) {
      e.preventDefault();
      go(cur - 1);
    } else if (k === 'g' || k === 'G') openOv();
  });
  /* scroll layout: reveal each section as it enters, track the current one */
  let lastY = scrollY,
    sdir = 1,
    sacc = 0;
  const revIO = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        const s = e.target;
        if (e.isIntersecting) {
          if (!s.classList.contains('on')) {
            s.dataset.dir = sdir;
            s.classList.add('on');
            countUp(s);
          }
        } else s.classList.remove('on');
      }),
    { rootMargin: '0px 0px -10% 0px' }
  );
  const curIO = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = slides.indexOf(e.target);
        if (i === cur) return;
        const first = cur < 0;
        cur = i;
        setHud();
        try {
          history.replaceState(null, '', '#s' + (i + 1));
        } catch (err) {}
        if (!first && i !== 0) sfx.whoosh(sdir); /* page 1 has its own logo sting */
      }),
    { rootMargin: '-50% 0px -50% 0px' }
  );
  slides.forEach((s) => {
    revIO.observe(s);
    curIO.observe(s);
  });
  addEventListener(
    'scroll',
    () => {
      const y = scrollY,
        d = y - lastY;
      if (!d) return;
      sdir = d > 0 ? 1 : -1;
      lastY = y;
      sacc += Math.abs(d);
      if (sacc > 170) {
        sacc = 0;
        sfx.tick();
      }
    },
    { passive: true }
  );
  /* pointer parallax + panel spotlight */
  let tpx = 0,
    tpy = 0,
    cpx = 0,
    cpy = 0,
    raf = 0;
  function loop() {
    cpx += (tpx - cpx) * 0.08;
    cpy += (tpy - cpy) * 0.08;
    const s = slides[cur];
    if (s) {
      s.style.setProperty('--px', cpx.toFixed(3));
      s.style.setProperty('--py', cpy.toFixed(3));
    }
    if (Math.abs(tpx - cpx) > 0.002 || Math.abs(tpy - cpy) > 0.002)
      raf = requestAnimationFrame(loop);
    else raf = 0;
  }
  matchMedia('(hover:hover) and (pointer:fine)').matches &&
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || isFlow() || reduce()) return;
      tpx = (e.clientX / innerWidth) * 2 - 1;
      tpy = (e.clientY / innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(loop);
      const p = e.target.closest && e.target.closest('.pn');
      if (p) {
        const r = p.getBoundingClientRect();
        p.style.setProperty('--mx', e.clientX - r.left + 'px');
        p.style.setProperty('--my', e.clientY - r.top + 'px');
      }
      const t = e.target.closest && e.target.closest('.tile');
      if (t) {
        const r = t.getBoundingClientRect();
        t.style.setProperty(
          '--rx',
          (((e.clientX - r.left) / r.width - 0.5) * 7).toFixed(2) + 'deg'
        );
        t.style.setProperty(
          '--ry',
          (-((e.clientY - r.top) / r.height - 0.5) * 7).toFixed(2) + 'deg'
        );
      }
    });
  addEventListener('pointerout', (e) => {
    const t = e.target.closest && e.target.closest('.tile');
    if (t && !t.contains(e.relatedTarget)) {
      t.style.setProperty('--rx', '0deg');
      t.style.setProperty('--ry', '0deg');
    }
  });

  /* ---------- full-screen viewer ---------- */
  const VW = $('#vw'),
    vt = $('#vt'),
    vs = $('#vs'),
    vx = $('#vx'),
    vp = $('#vp'),
    vn = $('#vn');
  let grp = [],
    gi = 0,
    curVm = null,
    lastFocus = null,
    closing = false;
  const EASE = 'cubic-bezier(.2,.8,.2,1)';
  const dur = (ms) => (reduce() ? 1 : ms);
  function fit(ar) {
    const mob = isFlow(),
      vw = innerWidth,
      vh = innerHeight;
    const px = mob ? 10 : 100,
      pt = mob ? 64 : 58,
      pb = mob ? 118 : 98;
    const aw = vw - 2 * px,
      ah = vh - pt - pb;
    let w = Math.min(aw, ah * ar),
      h = w / ar;
    return { l: (vw - w) / 2, t: pt + (ah - h) / 2, w, h };
  }
  function place(m, r) {
    m.style.width = r.w + 'px';
    m.style.height = r.h + 'px';
    m.style.left = r.l + 'px';
    m.style.top = r.t + 'px';
  }
  function mkVm(el) {
    const d = el.dataset,
      m = document.createElement('div');
    m.className = 'vm';
    if (d.bg) m.style.background = d.bg;
    const im = new Image();
    im.src = d.th;
    im.alt = d.title;
    im.decoding = 'async';
    m.append(im);
    m._el = el;
    m._ar = +d.ar;
    m._img = im;
    place(m, fit(m._ar));
    VW.append(m);
    if (!d.vid) {
      const big = new Image();
      big.src = d.full;
      (big.decode ? big.decode() : Promise.resolve())
        .then(() => {
          if (m.isConnected) im.src = d.full;
        })
        .catch(() => {});
    }
    return m;
  }
  function srcRect(el) {
    const m = el.querySelector('.m');
    const r = m.getBoundingClientRect();
    return r;
  }
  function flipFrom(m, r) {
    const f = fit(m._ar);
    return `translate(${r.left - f.l}px,${r.top - f.t}px) scale(${r.width / f.w},${r.height / f.h})`;
  }
  function setCaption(el) {
    const d = el.dataset;
    vt.textContent = d.title;
    vs.textContent = d.sub + (grp.length > 1 ? '  ·  ' + (gi + 1) + ' / ' + grp.length : '');
    vp.hidden = vn.hidden = grp.length < 2;
  }
  function startVideo(m) {
    const el = m._el,
      d = el.dataset;
    if (!d.vid || m._v) return;
    const v = document.createElement('video');
    v.src = d.vid;
    v.poster = d.full;
    v.controls = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.setAttribute('controlslist', 'nodownload');
    v.setAttribute('aria-label', d.title);
    v.style.opacity = '0';
    v.style.transition = 'opacity .3s';
    m.append(v);
    m._v = v;
    v.addEventListener(
      'loadeddata',
      () => {
        v.style.opacity = '1';
      },
      { once: true }
    );
    const go = () => {
      if (m._v !== v) return;
      const p = v.play();
      if (p && p.catch)
        p.catch(() => {
          v.style.opacity = '1';
        });
    };
    if (sfx.boostMedia) sfx.boostMedia(v).then(go, go);
    else go();
  }
  function stopVideo(m) {
    if (m && m._v) {
      try {
        m._v.pause();
      } catch (e) {}
      m._v.remove();
      m._v = null;
    }
  }
  function openTile(el) {
    if (vOpen || closing) return;
    sfx.open();
    vOpen = true;
    document.body.classList.add('vo');
    lastFocus = el;
    grp = $$('.tile[data-g="' + el.dataset.g + '"]');
    gi = grp.indexOf(el);
    const r = srcRect(el),
      m = mkVm(el);
    curVm = m;
    setCaption(el);
    VW.classList.add('open');
    requestAnimationFrame(() => VW.classList.add('show'));
    el.classList.add('ghost');
    const a = m.animate(
      reduce()
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { transform: flipFrom(m, r), borderRadius: '7px' },
            { transform: 'translate(0,0) scale(1,1)', borderRadius: '12px' },
          ],
      { duration: dur(640), easing: EASE }
    );
    a.onfinish = () => startVideo(m);
    vx.focus({ preventScroll: true });
    [grp[gi + 1], grp[gi - 1]].forEach((e) => {
      if (e && !e.dataset.vid) {
        const i = new Image();
        i.src = e.dataset.full;
      }
    });
  }
  function nav(dir) {
    if (grp.length < 2 || closing) return;
    const old = curVm,
      oldEl = grp[gi];
    gi = (gi + dir + grp.length) % grp.length;
    const el = grp[gi];
    oldEl.classList.remove('ghost');
    el.classList.add('ghost');
    if (isFlow()) {
      const r = el.getBoundingClientRect();
      scrollBy(0, r.top + r.height / 2 - innerHeight / 2);
    }
    stopVideo(old);
    const m = mkVm(el);
    curVm = m;
    setCaption(el);
    const dx = dir * Math.min(90, innerWidth * 0.1);
    if (reduce()) {
      old.remove();
      return;
    }
    old.animate(
      [
        { opacity: 1, transform: 'none' },
        { opacity: 0, transform: `translate(${-dx}px,0) scale(.96)` },
      ],
      { duration: 380, easing: EASE }
    ).onfinish = () => old.remove();
    m.animate(
      [
        { opacity: 0, transform: `translate(${dx}px,0) scale(.96)` },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 520, easing: EASE }
    ).onfinish = () => startVideo(m);
    [grp[(gi + 1) % grp.length], grp[(gi - 1 + grp.length) % grp.length]].forEach((e) => {
      if (e && !e.dataset.vid) {
        const i = new Image();
        i.src = e.dataset.full;
      }
    });
  }
  function closeViewer(fromTransform) {
    if (!vOpen || closing) return;
    closing = true;
    sfx.close();
    const m = curVm,
      el = grp[gi];
    stopVideo(m);
    VW.classList.remove('show');
    VW.style.removeProperty('--bo');
    if (isFlow()) {
      const r = el.getBoundingClientRect();
      if (r.top < 60 || r.bottom > innerHeight - 110)
        scrollBy(0, r.top + r.height / 2 - innerHeight / 2);
    }
    const r = srcRect(el),
      f = fit(m._ar);
    const vis =
      el.closest('.slide').classList.contains('on') &&
      r.bottom > 0 &&
      r.top < innerHeight &&
      r.right > 0 &&
      r.left < innerWidth;
    const fin = () => {
      m.remove();
      el.classList.remove('ghost');
      VW.classList.remove('open');
      document.body.classList.remove('vo');
      vOpen = false;
      closing = false;
      grp = [];
      curVm = null;
      try {
        (lastFocus && lastFocus.isConnected ? el : lastFocus).focus({ preventScroll: true });
      } catch (e) {}
    };
    let kf;
    if (reduce() || !vis)
      kf = [
        { opacity: 1, transform: fromTransform || 'none' },
        { opacity: 0, transform: fromTransform || 'none' },
      ];
    else
      kf = [
        { transform: fromTransform || 'none', borderRadius: '12px' },
        { transform: flipFrom(m, r), borderRadius: '7px' },
      ];
    m.style.transformOrigin = '0 0';
    const a = m.animate(kf, {
      duration: dur(vis ? 520 : 300),
      easing: vis ? 'cubic-bezier(.5,0,.2,1)' : 'ease',
      fill: 'forwards',
    });
    a.onfinish = fin;
  }
  function viewerKey(e) {
    const k = e.key;
    if (k === 'Escape') {
      e.preventDefault();
      closeViewer();
      return;
    }
    const onVid = e.target && e.target.tagName === 'VIDEO';
    if (k === 'ArrowRight' && !onVid) {
      e.preventDefault();
      nav(1);
    } else if (k === 'ArrowLeft' && !onVid) {
      e.preventDefault();
      nav(-1);
    } else if (k === 'Tab') {
      const f = [vx, vp, vn, curVm && curVm._v].filter((x) => x && !x.hidden);
      if (!f.length) return;
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  }
  vx.onclick = () => closeViewer();
  vp.onclick = () => nav(-1);
  vn.onclick = () => nav(1);
  VW.addEventListener('click', (e) => {
    if (e.target === VW || e.target.classList.contains('vb') || e.target.classList.contains('vc'))
      closeViewer();
  });
  /* touch gestures inside viewer */
  let g = null;
  VW.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || !vOpen || closing) return;
    if (e.target.closest('button') || e.target.tagName === 'VIDEO') return;
    g = { x: e.clientX, y: e.clientY, dx: 0, dy: 0, axis: null, id: e.pointerId };
  });
  VW.addEventListener('pointermove', (e) => {
    if (!g || e.pointerId !== g.id) return;
    g.dx = e.clientX - g.x;
    g.dy = e.clientY - g.y;
    if (!g.axis && Math.hypot(g.dx, g.dy) > 10)
      g.axis = Math.abs(g.dy) > Math.abs(g.dx) ? 'y' : 'x';
    if (g.axis === 'y' && curVm) {
      const k = Math.min(1, Math.abs(g.dy) / 420),
        sc = 1 - k * 0.25;
      const f = fit(curVm._ar),
        cx = f.w / 2,
        cy = f.h / 2;
      g.tf = `translate(${g.dx * 0.5 + cx * (1 - sc)}px,${g.dy + cy * (1 - sc)}px) scale(${sc})`;
      curVm.style.transform = g.tf;
      VW.style.setProperty('--bo', 1 - k * 0.9);
      VW.classList.add('show');
    }
  });
  const endG = (e) => {
    if (!g || e.pointerId !== g.id) return;
    const s = g;
    g = null;
    if (s.axis === 'y') {
      if (Math.abs(s.dy) > 110) {
        closeViewer(s.tf);
      } else {
        curVm.style.transition = 'transform .35s ' + EASE;
        curVm.style.transform = 'none';
        VW.style.setProperty('--bo', 1);
        setTimeout(() => {
          if (curVm) curVm.style.transition = '';
        }, 380);
      }
    } else if (s.axis === 'x' && Math.abs(s.dx) > 60) nav(s.dx < 0 ? 1 : -1);
  };
  VW.addEventListener('pointerup', endG);
  VW.addEventListener('pointercancel', endG);
  addEventListener('resize', () => {
    if (vOpen && curVm && !closing) place(curVm, fit(curVm._ar));
  });
  document.addEventListener('click', (e) => {
    const t = e.target.closest && e.target.closest('.tile');
    if (t && !vOpen) openTile(t);
  });

  /* boot */
  const h = parseInt((location.hash.match(/^#s(\d+)$/) || [])[1], 10);
  if (h > 1 && h <= N) slides[h - 1].scrollIntoView({ behavior: 'auto', block: 'start' });
})();
