(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* Tahun di footer */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* Tema terang/gelap */
  var btn = document.getElementById('themeBtn');
  function currentTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (btn) btn.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = next === 'dark' ? '#0e0f12' : '#f6f4ef';
  });

  /* Marquee: gandakan isi agar loop mulus */
  var track = document.getElementById('marquee');
  if (track) {
    Array.prototype.slice.call(track.children).forEach(function (c) {
      var d = c.cloneNode(true);
      d.setAttribute('aria-hidden', 'true');
      track.appendChild(d);
    });
  }

  /* Muncul saat di-scroll */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* Spotlight mengikuti kursor */
  document.querySelectorAll('.spot').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* Parallax ringan di hero */
  var art = document.querySelector('.hero-art');
  if (art && !reduce && window.matchMedia('(hover: hover)').matches) {
    var hero = document.querySelector('.hero');
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      art.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      art.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
  }

  /* Menu aktif sesuai bagian yang terlihat */
  var links = document.querySelectorAll('.nav-links a');
  if ('IntersectionObserver' in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('active'); });
          var a = map[e.target.id]; if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* Lightbox */
  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var group = [], idx = 0, opener = null;
  function show(i) {
    idx = (i + group.length) % group.length;
    var b = group[idx];
    lbImg.src = b.dataset.full;
    lbImg.alt = b.querySelector('img').alt;
    lbCap.textContent = b.dataset.cap || '';
    var multi = group.length > 1;
    lb.querySelector('.lb-prev').hidden = !multi;
    lb.querySelector('.lb-next').hidden = !multi;
  }
  document.querySelectorAll('.shot').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!lb || typeof lb.showModal !== 'function') { window.open(b.dataset.full, '_blank'); return; }
      opener = b;
      group = Array.prototype.slice.call(document.querySelectorAll('.shot[data-group="' + b.dataset.group + '"]'));
      show(group.indexOf(b));
      lb.showModal();
    });
  });
  if (lb) {
    lb.querySelector('.lb-close').addEventListener('click', function () { lb.close(); });
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    lb.addEventListener('close', function () { if (opener) opener.focus(); });
  }
})();
