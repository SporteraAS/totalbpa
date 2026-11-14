(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Linje under toppen naar man scroller --- */
  var head = document.querySelector('header.site');

  /* --- Scrollytelling 1: del teksten opp i ord som tennes --- */
  var tenn = document.querySelector('[data-tenn]');
  var ord = [];
  if (tenn && !reduce) {
    (function del(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (bit) {
            if (!bit) return;
            if (/^\s+$/.test(bit)) { frag.appendChild(document.createTextNode(bit)); return; }
            var s = document.createElement('span');
            s.className = 'ord'; s.textContent = bit;
            frag.appendChild(s); ord.push(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) { del(n); }
      });
    })(tenn);
  }

  /* --- Scrollytelling 2: linjen tegnes gjennom stegene --- */
  var steg = document.querySelector('[data-steg]');
  var linje = steg && steg.querySelector('.steg-linje');
  var fyll = linje && linje.querySelector('span');
  var punkter = steg ? steg.querySelectorAll('.steg-punkt') : [];

  function klem(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function oppdater() {
    head.classList.toggle('scrolled', window.scrollY > 8);
    var vh = window.innerHeight;

    if (ord.length && tenn) {
      // starter naar teksten kommer inn nederst, ferdig naar den er en tredjedel opp
      var r = tenn.getBoundingClientRect();
      var p = klem((vh * 0.9 - r.top) / (vh * 0.9 - vh * 0.3), 0, 1);
      var antall = Math.round(p * ord.length);
      for (var i = 0; i < ord.length; i++) ord[i].classList.toggle('lys', i < antall);
    }

    if (steg && linje) {
      var mid = vh * 0.6;
      var lr = linje.getBoundingClientRect();
      var h = klem(mid - lr.top, 0, lr.height);
      if (fyll) fyll.style.height = (reduce ? lr.height : h) + 'px';
      punkter.forEach(function (pk) {
        var nr = pk.querySelector('.steg-nr').getBoundingClientRect();
        pk.classList.toggle('paa', reduce || nr.top + nr.height / 2 <= mid);
      });
    }
  }
  var venter = false;
  window.addEventListener('scroll', function () {
    if (venter) return; venter = true;
    requestAnimationFrame(function () { venter = false; oppdater(); });
  }, { passive: true });
  window.addEventListener('resize', oppdater);
  oppdater();

  /* --- Inngang ved scroll --- */
  var innEls = document.querySelectorAll('.inn');
  if (reduce || !('IntersectionObserver' in window)) {
    innEls.forEach(function (el) { el.classList.add('vis'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('vis'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    innEls.forEach(function (el) { io.observe(el); });
  }

  var aar = document.getElementById('aar');
  if (aar) aar.textContent = new Date().getFullYear();
})();
