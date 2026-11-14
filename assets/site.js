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

  var aar = document.getElementById('aar');
  if (aar) aar.textContent = new Date().getFullYear();
})();
