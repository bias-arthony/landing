/* Tear the pack, flip what falls out, fill the binder.
   The mechanic is a booster pack. The look is deliberately not anyone's. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* tier describes the kind of work, not its worth */
  var TIERS = { site: 'client site', product: 'product', platform: 'platform' };

  var ALL = [
    { n: 'Toshiba', e: 'wira', t: 'site', d: 'Corporate site.' },
    { n: 'Bebelac', e: 'wira', t: 'site', d: 'Campaign microsite.' },
    { n: 'Air Mancur', e: 'wira', t: 'site', d: 'Corporate site.' },
    { n: 'M150', e: 'wira', t: 'site', d: 'Campaign microsite.' },
    { n: 'PT Monokem Surya', e: 'wira', t: 'site', d: 'Corporate site.' },
    { n: 'Aurora Jewelry', e: 'wira', t: 'site', d: 'Corporate site.' },

    { n: 'Freshbox', e: 'rebel', t: 'product', s: 'Laravel, MySQL, Midtrans', u: 'https://freshbox.id',
      d: 'Fruit e-commerce buying straight from farmers. Free shipping and flash sales.' },
    { n: 'Apollo', e: 'rebel', t: 'product', s: 'Go, Xendit', u: 'https://getapollo.co/reimbursement',
      d: 'Reimbursement for multiple companies, paying out through Xendit. Dashboards per account, approvers by role, bulk import.' },
    { n: 'DBO', e: 'rebel', t: 'product', s: 'Go, RabbitMQ, Redis, Laravel',
      d: 'Runs several outlets from one app. Goods in from suppliers, out to customers, stock in real time.' },
    { n: 'Nimbly', e: 'rebel', t: 'product', s: 'Go, MongoDB', u: 'https://hellonimbly.com',
      d: 'Admin dashboard for employee operations.' },
    { n: 'Cimory', e: 'rebel', t: 'product', s: 'Laravel, MySQL',
      d: 'HR system. Employee records, cost calculation, automated email.' },
    { n: 'Rootin', e: 'rebel', t: 'product', s: 'Go',
      d: 'Crowdfunding, similar to Kitabisa. Donations through a payment gateway.' },
    { n: 'Dompetkilat', e: 'rebel', t: 'product', s: 'Go', d: 'Peer-to-peer lending.' },
    { n: 'Summit Healthcare', e: 'rebel', t: 'product', s: 'Moodle, PHP, MySQL', u: 'https://summithealthcare.co.id',
      d: 'Learning platform for healthcare training.' },
    { n: 'Jaya Manex', e: 'rebel', t: 'product', s: 'Laravel', d: 'Corporate profile website.' },

    { n: 'MYXL', e: 'aleph', t: 'platform', s: 'Go, Redis, PostgreSQL, HMAC', u: 'https://www.xl.co.id/myxl',
      d: 'Payment backend for a big telco app, 39.1M+ users. High volume, lots of payment methods.' },
    { n: 'BRI', e: 'aleph', t: 'platform', s: 'Go, PostgreSQL, Redis, Docker',
      d: 'Digital banking platform, 47.8M+ users. Since January 2026.' }
  ];

  var ERA = {
    wira:  { org: 'Wira Imaji Nyata', role: 'Web Developer',      when: '2011 to 2018' },
    rebel: { org: 'RebelWorks',       role: 'Backend Developer',  when: '2018 to 2023' },
    aleph: { org: 'Aleph Labs',       role: 'Backend Engineer',   when: '2023 to now' }
  };

  var PACK = 5;
  var pool = [], got = [], hand = [], flipped = 0, packNo = 0, tearing = false;

  /* ── theme ── */
  function setTheme(t, persist) {
    root.setAttribute('data-theme', t);
    if (persist) try { localStorage.setItem('pack-theme', t); } catch (e) {}
  }
  (function () {
    var s = null; try { s = localStorage.getItem('pack-theme'); } catch (e) {}
    setTheme(s || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  })();
  $('theme').addEventListener('click', function () {
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
  });

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  var RANK = { site: 0, product: 1, platform: 2 };

  /* ── binder ── */
  function binder() {
    var b = $('binder');
    b.replaceChildren();
    ALL.forEach(function (c) {
      var s = document.createElement('div');
      var have = got.indexOf(c.n) > -1;
      s.className = 'slot t-' + c.t + (have ? ' have' : '');
      s.innerHTML = '<span></span>';
      s.firstChild.textContent = have ? c.n : '';
      s.setAttribute('aria-label', have ? c.n : 'not opened yet');
      b.appendChild(s);
    });
    $('have').textContent = got.length;
    $('all-n').textContent = ALL.length;
  }

  /* ── pack ── */
  function newPack() {
    packNo++;
    hand = pool.splice(0, PACK);
    hand.sort(function (a, b) { return RANK[a.t] - RANK[b.t]; });   // best last
    flipped = 0;
    $('pack-n').textContent = packNo;
    $('left').textContent = pool.length;
    $('wrap').className = 'wrap';
    $('wrap').style.setProperty('--tear', '0');
    $('hand').replaceChildren();
    $('hand').hidden = true;
    $('wrap').hidden = false;
    $('next').hidden = true;
    $('tear-hint').textContent = 'Drag across the pack to tear it open.';
  }

  function deal() {
    $('wrap').hidden = true;
    var h = $('hand');
    h.replaceChildren();
    h.hidden = false;
    hand.forEach(function (c, i) {
      var el = document.createElement('button');
      el.type = 'button';
      el.className = 'card t-' + c.t;
      el.style.setProperty('--i', i);
      el.setAttribute('aria-label', 'Face down card ' + (i + 1) + '. Activate to turn it over.');
      el.innerHTML =
        '<span class="i3d">' +
          '<span class="back"></span>' +
          '<span class="front">' +
            '<span class="tier"></span>' +
            '<b class="nm"></b>' +
            '<span class="ds"></span>' +
            '<span class="st"></span>' +
            '<span class="er"></span>' +
          '</span>' +
        '</span>';
      el.addEventListener('click', function () { turn(el, c); });
      h.appendChild(el);
    });
    $('tear-hint').textContent = 'Tap each card to turn it over.';
  }

  function turn(el, c) {
    if (el.classList.contains('up')) return;
    el.querySelector('.tier').textContent = TIERS[c.t];
    el.querySelector('.nm').textContent = c.n;
    el.querySelector('.ds').textContent = c.d;
    el.querySelector('.st').textContent = c.s || '';
    el.querySelector('.er').textContent = ERA[c.e].org + ', ' + ERA[c.e].when;
    el.setAttribute('aria-label', c.n + '. ' + c.d);
    el.classList.add('up');
    if (got.indexOf(c.n) < 0) got.push(c.n);
    flipped++;
    binder();
    if (flipped === hand.length) {
      $('tear-hint').textContent = pool.length
        ? 'Nice. ' + pool.length + ' still sealed.'
        : 'That is all seventeen.';
      $('next').hidden = false;
      $('next').textContent = pool.length ? 'Open the next pack' : 'See the whole binder';
      $('next').focus({ preventScroll: true });
    }
  }

  $('flip-all').addEventListener('click', function () {
    var cards = $('hand').querySelectorAll('.card');
    for (var i = 0; i < cards.length; i++) if (!cards[i].classList.contains('up')) cards[i].click();
  });

  $('next').addEventListener('click', function () {
    if (pool.length) { newPack(); return; }
    $('done').hidden = false;
    $('done-again').focus({ preventScroll: true });
  });

  /* ── tearing ── */
  (function tear() {
    var w = $('wrap'), pid = null, x0 = 0, prog = 0;
    function set(p) {
      prog = Math.max(0, Math.min(1, p));
      w.style.setProperty('--tear', prog.toFixed(3));
    }
    w.addEventListener('pointerdown', function (e) {
      if (tearing || !$('hand').hidden) return;
      pid = e.pointerId; x0 = e.clientX;
      try { w.setPointerCapture(pid); } catch (err) {}
    });
    w.addEventListener('pointermove', function (e) {
      if (e.pointerId !== pid) return;
      set((e.clientX - x0) / (w.getBoundingClientRect().width * 0.7));
      if (prog >= 1) open();
    });
    function up(e) {
      if (e.pointerId !== pid) return;
      release();
      if (prog >= 1) open(); else set(0);
    }
    function release() {
      if (pid === null) return;
      try { if (w.hasPointerCapture(pid)) w.releasePointerCapture(pid); } catch (err) {}
      pid = null;
    }
    w.addEventListener('pointerup', up);
    w.addEventListener('pointercancel', up);

    function open() {
      if (tearing) return;
      tearing = true;
      release();
      w.classList.add('torn');
      setTimeout(function () { tearing = false; deal(); }, reduced ? 0 : 420);
    }
    $('rip').addEventListener('click', function () { if ($('hand').hidden) { set(1); open(); } });
  })();

  /* ── start / reset ── */
  function reset() {
    pool = shuffle(ALL.slice());
    got = []; packNo = 0;
    binder();
    newPack();
  }
  $('start').addEventListener('click', function () {
    $('intro').hidden = true; $('play').hidden = false; reset();
  });
  $('done-again').addEventListener('click', function () { $('done').hidden = true; reset(); });
  $('done-close').addEventListener('click', function () { $('done').hidden = true; });
  document.querySelectorAll('a[href="#game"]').forEach(function (a) {
    a.addEventListener('click', function () {
      if ($('intro').hidden) return;
      $('intro').hidden = true; $('play').hidden = false; reset();
    });
  });

  $('all-n').textContent = ALL.length;
  binder();
})();
