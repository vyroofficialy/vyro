/* VyroMail: one reusable helper for every email interaction on the site.
   - Any <a href="mailto:..."> or element with data-vy-mail="addr@x.com" opens Gmail compose in a NEW tab, recipient pre-filled.
   - Real anchors keep a mailto: href until upgraded, so they still work without JavaScript.
   - data-vy-mail-app marks an explicit "use my default mail app" fallback; it is never rewritten.
   - Optional per-element data-vy-subject / data-vy-body. Nothing is collected, stored or sent anywhere by this script. */
(function () {
  'use strict';
  var GMAIL = 'https://mail.google.com/mail/?view=cm&fs=1&to=';
  var OK = /^[^\s@<>()[\]",;:\\]+@[^\s@<>()[\]",;:\\]+\.[A-Za-z]{2,}$/;
  function clean(v) {
    v = String(v || '')
      .trim()
      .replace(/^mailto:/i, '')
      .split('?')[0];
    try {
      v = decodeURIComponent(v);
    } catch (e) {}
    return OK.test(v) ? v : '';
  }
  function enc(a) {
    return encodeURIComponent(a).replace(/%40/g, '@');
  }
  function extra(o, joiner) {
    var p = [];
    if (o && o.subject)
      p.push((joiner === '&' ? 'su=' : 'subject=') + encodeURIComponent(o.subject));
    if (o && o.body) p.push('body=' + encodeURIComponent(o.body));
    return p.length ? (joiner === '&' ? '&' : '?') + p.join('&') : '';
  }
  function gmail(addr, o) {
    addr = clean(addr);
    return addr ? GMAIL + enc(addr) + extra(o, '&') : '';
  }
  function mailto(addr, o) {
    addr = clean(addr);
    return addr ? 'mailto:' + enc(addr) + extra(o, '?') : '';
  }
  function opts(el) {
    return {
      subject: el.getAttribute('data-vy-subject') || '',
      body: el.getAttribute('data-vy-body') || '',
    };
  }
  /* Open Gmail compose in a new tab without touching the current one (noopener: the new tab gets no handle to this page). */
  function open(addr, o) {
    var url = gmail(addr, o);
    if (!url) return false;
    var a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  }
  function enhance(root) {
    root = root || document;
    var i,
      el,
      addr,
      list = root.querySelectorAll('a[href^="mailto:" i]:not([data-vy-mail-app]),[data-vy-mail]');
    for (i = 0; i < list.length; i++) {
      el = list[i];
      addr = clean(el.getAttribute('data-vy-mail') || el.getAttribute('href'));
      if (!addr) continue;
      el.setAttribute('data-vy-mail', addr);
      if (el.tagName === 'A') {
        el.href = gmail(addr, opts(el));
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
        if (el.getAttribute('aria-hidden') !== 'true') {
          if (!el.hasAttribute('aria-label'))
            el.setAttribute('aria-label', addr + ' (opens Gmail compose in a new tab)');
          if (!el.hasAttribute('title')) el.title = 'Compose in Gmail (opens in a new tab)';
        }
      } else {
        if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
        if (!el.hasAttribute('role')) el.setAttribute('role', 'link');
        if (!el.style.cursor) el.style.cursor = 'pointer';
      }
    }
    list = root.querySelectorAll('a[data-vy-mail-app]');
    for (i = 0; i < list.length; i++) {
      el = list[i];
      addr = clean(el.getAttribute('data-vy-mail-app'));
      if (addr) el.href = mailto(addr, opts(el));
    }
  }
  /* non-anchor elements (buttons, icons, cards) that carry data-vy-mail */
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-vy-mail]') : null;
    if (!t || t.tagName === 'A' || e.defaultPrevented) return;
    if (open(t.getAttribute('data-vy-mail'), opts(t))) e.preventDefault();
  });
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (
      !t ||
      t.tagName === 'A' ||
      t.tagName === 'BUTTON' ||
      !t.hasAttribute ||
      !t.hasAttribute('data-vy-mail')
    )
      return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open(t.getAttribute('data-vy-mail'), opts(t));
    }
  });
  window.VyroMail = { gmail: gmail, mailto: mailto, open: open, enhance: enhance };
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', function () {
      enhance();
    });
  else enhance();
})();
