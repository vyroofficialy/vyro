/* CTA: HELP section toggle */
(function () {
  var btn = document.getElementById('vyHelpBtn'),
    panel = document.getElementById('vyHelpPanel'),
    closeBtn = document.getElementById('vyHelpClose');
  if (!btn || !panel) return;
  var card = btn.closest('.pn'),
    slide = btn.closest('.slide'),
    open = false;
  var mq = matchMedia('(max-aspect-ratio:5/4),(max-width:760px),(max-height:480px)');
  function setInert(on) {
    for (var i = 0; i < card.children.length; i++) {
      var c = card.children[i];
      if (c === panel) continue;
      if (on && !mq.matches) c.setAttribute('inert', '');
      else c.removeAttribute('inert');
    }
  }
  function set(next, focus) {
    open = next;
    card.classList.toggle('help-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    setInert(open);
    if (!focus) return;
    if (open && !mq.matches && closeBtn) closeBtn.focus({ preventScroll: true });
    else if (!open) btn.focus({ preventScroll: true });
  }
  btn.addEventListener('click', function () {
    set(!open, true);
  });
  if (closeBtn)
    closeBtn.addEventListener('click', function () {
      set(false, true);
    });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      set(false, true);
    }
  });
  if (mq.addEventListener)
    mq.addEventListener('change', function () {
      setInert(open);
    });
  if (slide && window.IntersectionObserver)
    new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting && open) set(false, false);
        });
      },
      { threshold: 0 }
    ).observe(slide);
})();
