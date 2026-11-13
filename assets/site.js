(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Skygge under toppen naar man scroller --- */
  var head = document.querySelector('header.site');
  function onScroll() { head.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- Scrollytelling: aktivt steg styrer bildet --- */
  var steps = document.querySelectorAll('.story-step');
  var scenes = document.querySelectorAll('.scene');
  var bar = document.querySelector('.stage-progress span');
  var cur = document.querySelector('.stage-cur');
  function setStep(i) {
    steps.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
    scenes.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
    if (bar) bar.style.width = ((i + 1) / steps.length * 100) + '%';
    if (cur) cur.textContent = i + 1;
  }
  if (steps.length && 'IntersectionObserver' in window) {
    // Steget som krysser et smalt baand midt paa skjermen er aktivt
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) setStep(Array.prototype.indexOf.call(steps, en.target));
      });
    }, { rootMargin: '-55% 0px -40% 0px' });
    steps.forEach(function (s) { io.observe(s); });
  } else {
    steps.forEach(function (s) { s.classList.add('is-active'); });
  }

  /* --- Reveal ved scroll --- */
  var revealEls = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('vis'); });
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('vis'); ro.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { ro.observe(el); });
  }

  /* --- Kontaktskjema --- */
  var form = document.getElementById('kontaktskjema');
  if (form) {
    var status = form.querySelector('.skjema-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (inp) {
        var tom = !inp.value.trim();
        inp.closest('.felt').classList.toggle('feil', tom);
        inp.setAttribute('aria-invalid', String(tom));
        if (tom && ok) { inp.focus(); ok = false; }
      });
      if (!ok) { status.className = 'skjema-status feil'; status.textContent = 'Fyll inn navn og telefon, så tar vi kontakt.'; return; }

      // TODO: koble skjemaet til en mottaker (f.eks. Formspree) foer lansering
      if (!form.getAttribute('action')) {
        status.className = 'skjema-status feil';
        status.textContent = 'Skjemaet er ikke koblet til ennå. Ring oss gjerne på 994 75 001.';
        return;
      }
      status.className = 'skjema-status'; status.textContent = 'Sender …';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error();
          form.reset();
          status.className = 'skjema-status ok';
          status.textContent = 'Takk! Vi tar kontakt så snart vi kan.';
        })
        .catch(function () {
          status.className = 'skjema-status feil';
          status.textContent = 'Noe gikk galt. Ring oss gjerne på 994 75 001.';
        });
    });
  }

  var aar = document.getElementById('aar');
  if (aar) aar.textContent = new Date().getFullYear();
})();
