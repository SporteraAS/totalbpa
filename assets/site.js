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

  }
  /* --- Den loddrette stien paa mobil skal gaa fra foerste til siste bue --- */
  var stiV = document.querySelector('.sti-v');
  function plasserSti() {
    if (!stiV) return;
    var buer = document.querySelectorAll('.sti-bue');
    if (buer.length < 2) return;
    var wrap = stiV.parentNode.getBoundingClientRect();
    var a = buer[0].getBoundingClientRect(), b = buer[buer.length - 1].getBoundingClientRect();
    stiV.style.top = (a.top + a.height / 2 - wrap.top) + 'px';
    stiV.style.height = (b.top + b.height / 2 - a.top - a.height / 2) + 'px';
    stiV.style.bottom = 'auto';
  }
  plasserSti();
  window.addEventListener('resize', plasserSti);
  window.addEventListener('load', plasserSti);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(plasserSti);

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
