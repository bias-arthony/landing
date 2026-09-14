/* Fifteen years in one run. One input: jump. Nothing to learn. */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var PX_YEAR = 520, START = 2011, END = 2026;
  var GRAV = 2300, JUMP = 760;
  var SPEEDS = { slow: 150, normal: 205, fast: 275 };
  var ORDER = ['slow', 'normal', 'fast'];
  var speedKey = 'normal', SPEED = SPEEDS.normal;
  try { var sv = localStorage.getItem('run-speed'); if (SPEEDS[sv]) speedKey = sv; } catch (e) {}
  function setSpeed(k) {
    if (!SPEEDS[k]) return;
    speedKey = k; SPEED = SPEEDS[k];
    try { localStorage.setItem('run-speed', k); } catch (e) {}
    document.querySelectorAll('.sp').forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.s === k ? 'true' : 'false');
      b.classList.toggle('on', b.dataset.s === k);
    });
    var now = $('sp-now'); if (now) now.textContent = k;
  }
  function nudge(d) { setSpeed(ORDER[Math.max(0, Math.min(2, ORDER.indexOf(speedKey) + d))]); }

  /* Only what the brief actually states. Clients are labelled clients,
     systems are labelled systems, and nothing is attributed to an employer
     the brief does not attribute it to. */
  var ERAS = [
    { from: 2011, to: 2018, org: 'Wira Imaji Nyata', role: 'Web Developer',
      tint: [34, 26, 44], glow: [214, 152, 74],
      items: [
        { n: 'Toshiba', k: 'client', d: 'Corporate site.' },
        { n: 'Bebelac', k: 'client', d: 'Campaign microsite.' },
        { n: 'Air Mancur', k: 'client', d: 'Corporate site.' },
        { n: 'M150', k: 'client', d: 'Campaign microsite.' },
        { n: 'Monokem Surya', k: 'client', d: 'Corporate site.' },
        { n: 'Aurora Jewelry', k: 'client', d: 'Corporate site.' }
      ] },
    { from: 2018, to: 2023, org: 'RebelWorks', role: 'Backend Developer',
      tint: [18, 40, 44], glow: [92, 196, 168],
      items: [
        { n: 'Freshbox', k: 'system', d: 'Fruit straight from farmers. Laravel, MySQL, Midtrans.', doc: 'd-freshbox' },
        { n: 'Rootin', k: 'system', d: 'Crowdfunding with a payment gateway. Go.', doc: 'd-rootin' },
        { n: 'Nimbly', k: 'system', d: 'Dashboard for employee operations. Go, MongoDB.', doc: 'd-nimbly' },
        { n: 'Cimory', k: 'system', d: 'HR records and cost calculation. Laravel, MySQL.', doc: 'd-cimory' },
        { n: 'Summit Healthcare', k: 'system', d: 'Healthcare training platform. Moodle, PHP, MySQL.', doc: 'd-summit' },
        { n: 'Jaya Manex', k: 'system', d: 'Corporate profile site. Laravel.', doc: 'd-jaya' },
        { n: 'Dompetkilat', k: 'system', d: 'Peer-to-peer lending. Go.', doc: 'd-dompetkilat' }
      ] },
    { from: 2023, to: 2026, org: 'Aleph Labs', role: 'Backend Engineer',
      tint: [16, 26, 50], glow: [104, 150, 236],
      items: [
        { n: 'MYXL', k: 'system', d: 'Payments for a telco app. 39.1M+ users. Go, Redis, PostgreSQL.', doc: 'd-myxl' },
        { n: 'BRI', k: 'system', d: 'Digital banking platform. 47.8M+ users. Since Jan 2026.', doc: 'd-aleph' }
      ] }
  ];
  var TAIL = {
    label: 'also built',
    items: [
      { n: 'DBO', k: 'system', d: 'Multi-outlet stock in real time. Go, RabbitMQ, Redis, Laravel.', doc: 'd-dbo' },
      { n: 'Apollo', k: 'system', d: 'Reimbursement with Xendit payouts. Go.', doc: 'd-apollo' }
    ]
  };

  /* ── build the world ── */
  var things = [], signs = [], WORLD = 0;
  (function build() {
    ERAS.forEach(function (e) {
      var x0 = (e.from - START) * PX_YEAR, x1 = (e.to - START) * PX_YEAR;
      signs.push({ x: x0 + 120, era: e });
      var span = x1 - x0, n = e.items.length;
      e.items.forEach(function (it, i) {
        var x = x0 + span * (i + 1) / (n + 1) + 140;
        things.push({ x: x, high: i % 2 === 1, kind: 'pick', it: it, era: e, got: false });
        if (i < n - 1) things.push({ x: x + span / (n + 1) / 2, kind: 'block', era: e });
      });
    });
    var tx = (END - START) * PX_YEAR + 260;
    TAIL.items.forEach(function (it, i) {
      things.push({ x: tx + i * 320, high: i % 2 === 1, kind: 'pick', it: it, era: ERAS[2], got: false });
    });
    WORLD = tx + TAIL.items.length * 320 + 420;
  })();
  var TOTAL = things.filter(function (t) { return t.kind === 'pick'; }).length;

  /* ── state ── */
  var cv = $('stage'), ctx = cv.getContext('2d', { alpha: false });
  var vw = 0, vh = 0, dpr = 1, ground = 0, K = 1, SKY = 1;
  // font sizes are divided by K so text stays legible when the scene is scaled
  function fpx(n) { return (n / K).toFixed(1); }
  var S = null;
  function reset() {
    S = { x: 0, y: 0, vy: 0, air: false, run: false, done: false,
          got: 0, stumble: 0, t: 0, cards: [], legs: 0 };
  }
  reset();

  function resize() {
    var r = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    // scale the world so roughly the same amount of track is visible everywhere
    K = Math.max(.58, Math.min(1.1, r.width / 880));
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr * K, 0, 0, dpr * K, 0, 0);
    vw = r.width / K; vh = r.height / K;
    ground = Math.round(vh * .72);
    SKY = Math.max(1, Math.min(1.9, ground / 380));
  }
  addEventListener('resize', resize, { passive: true });

  /* ── input: one verb ── */
  function jump() {
    if (!S.run || S.done) return;
    if (!S.air) { S.vy = -JUMP; S.air = true; }
  }
  addEventListener('keydown', function (e) {
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
      if (!$('over').hidden || !$('intro').hidden) return;
      e.preventDefault(); jump();
    }
  });
  cv.addEventListener('pointerdown', function (e) { e.preventDefault(); jump(); });

  /* ── colour helpers ── */
  function eraAt(x) {
    var y = START + x / PX_YEAR;
    for (var i = ERAS.length - 1; i >= 0; i--) if (y >= ERAS[i].from) return ERAS[i];
    return ERAS[0];
  }
  function blendTint(x) {
    // ease between eras so the years feel like they pass
    var y = START + x / PX_YEAR, a = ERAS[0], b = ERAS[0], f = 0;
    for (var i = 0; i < ERAS.length; i++) if (y >= ERAS[i].from) { a = ERAS[i]; b = ERAS[i + 1] || ERAS[i]; }
    if (b !== a) {
      var d = (b.from - y) / 1.2;
      f = d < 1 ? Math.max(0, 1 - Math.max(0, d)) : 0;
    }
    return { tint: lerp3(a.tint, b.tint, f), glow: lerp3(a.glow, b.glow, f) };
  }
  function lerp3(a, b, f) { return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; }
  function rgb(c, m) { m = m || 1; return 'rgb(' + (c[0] * m | 0) + ',' + (c[1] * m | 0) + ',' + (c[2] * m | 0) + ')'; }
  function rgba(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a + ')'; }

  /* ── loop ── */
  var raf = null, last = 0;
  function tick(now) {
    raf = null;
    var dt = Math.min((now - last) / 1000, .05); last = now;
    S.t += dt;

    if (S.run && !S.done) {
      var sp = SPEED * (S.stumble > 0 ? .45 : 1);
      if (S.stumble > 0) S.stumble -= dt;
      S.x += sp * dt;
      S.legs += sp * dt;

      S.vy += GRAV * dt; S.y += S.vy * dt;
      if (S.y > 0) { S.y = 0; S.vy = 0; S.air = false; }

      collide();
      if (S.x >= WORLD) { S.done = true; finish(); }
    }

    draw();
    raf = requestAnimationFrame(tick);
  }

  var RUN_X = 0;
  function collide() {
    var px = S.x, py = -S.y;
    for (var i = 0; i < things.length; i++) {
      var t = things[i];
      if (t.got || t.hit) continue;
      if (Math.abs(t.x - px) > 40) continue;
      var ty = t.kind === 'block' ? 0 : (t.high ? 96 : 40);
      if (Math.abs(ty - py) > 44) continue;
      if (t.kind === 'pick') { t.got = true; S.got++; card(t); }
      else { t.hit = true; S.stumble = .55; }
    }
  }

  function card(t) {
    var el = document.createElement('div');
    el.className = 'card' + (t.it.k === 'client' ? ' client' : '');
    el.innerHTML = '<b></b><span></span>';
    el.querySelector('b').textContent = t.it.n;
    el.querySelector('span').textContent = t.it.d;
    $('cards').appendChild(el);
    $('found').textContent = S.got;
    setTimeout(function () { el.classList.add('out'); }, 3200);
    setTimeout(function () { el.remove(); }, 3800);
  }

  /* ── draw ── */
  function draw() {
    var camX = S.x - vw * 0.26;
    var c = blendTint(S.x);

    var g = ctx.createLinearGradient(0, 0, 0, ground);
    g.addColorStop(0, rgb(c.tint, .45));
    g.addColorStop(1, rgb(mix(c.tint, c.glow, .18), .9));
    ctx.fillStyle = g; ctx.fillRect(0, 0, vw, ground);

    // slow drifting motes, so the sky is not dead space
    var mo = camX * .08;
    for (var i = 0; i < 44; i++) {
      var mx = (i * 167 - mo) % (vw + 200) ; if (mx < -100) mx += vw + 200;
      var my = 30 + ((i * 97) % Math.max(1, ground - 90));
      ctx.fillStyle = rgba(c.glow, .07 + (i % 3) * .03);
      ctx.fillRect(mx - 100, my, 2, 2);
    }

    // horizon haze
    var hz = ctx.createLinearGradient(0, ground - 190, 0, ground);
    hz.addColorStop(0, rgba(c.glow, 0)); hz.addColorStop(1, rgba(c.glow, .14));
    ctx.fillStyle = hz; ctx.fillRect(0, ground - 190, vw, 190);

    layer(camX * .22, .62, mix(c.tint, c.glow, .30));
    layer(camX * .46, 1.0, mix(c.tint, [6, 5, 9], .55));

    // ground first, then everything painted on it
    ctx.fillStyle = rgb(mix(c.tint, [6, 5, 9], .45));
    ctx.fillRect(0, ground, vw, vh - ground);
    ctx.fillStyle = rgba(c.glow, .7); ctx.fillRect(0, ground, vw, 2);

    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (var yr = START; yr <= END; yr++) {
      var x = (yr - START) * PX_YEAR - camX;
      if (x < -90 || x > vw + 90) continue;
      ctx.fillStyle = rgba(c.glow, .34);
      ctx.fillRect(x - .75, ground + 2, 1.5, 14);
      ctx.font = '500 ' + fpx(15) + 'px "JetBrains Mono", monospace';
      ctx.fillStyle = rgba(c.glow, .72);
      ctx.fillText(yr, x, ground + 21);
    }

    signs.forEach(function (s2) {
      var x = s2.x - camX;
      if (x < -380 || x > vw + 60) return;
      ctx.textAlign = 'left';
      ctx.fillStyle = rgba(s2.era.glow, .34); ctx.fillRect(x, ground - 210, 2, 210);
      ctx.font = '700 ' + fpx(27) + 'px "JetBrains Mono", monospace';
      ctx.fillStyle = rgba(s2.era.glow, .95);
      ctx.fillText(s2.era.org, x + 14, ground - 210);
      ctx.font = '400 ' + fpx(15) + 'px "JetBrains Mono", monospace';
      ctx.fillStyle = rgba(s2.era.glow, .6);
      ctx.fillText(s2.era.role + ', ' + s2.era.from + ' to ' + (s2.era.to === 2026 ? 'now' : s2.era.to), x + 14, ground - 182);
    });

    things.forEach(function (t) {
      var x = t.x - camX;
      if (x < -140 || x > vw + 140) return;
      if (t.kind === 'block') { if (!t.hit) block(x, t.era); return; }
      if (t.got) return;
      pick(x, t.high ? 96 : 40, t.it, t.era);
    });

    runner(vw * 0.26, ground - 24 + S.y, c);
  }

  function mix(a, b, f) { return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; }

  function layer(off, scale, col) {
    ctx.fillStyle = rgb(col);
    var w = 86 * scale, step = 164 * scale;
    var s0 = Math.floor(off / step);
    for (var i = -1; i < vw / step + 2; i++) {
      var k = s0 + i;
      var x = k * step - off;
      var h = (78 + (Math.sin(k * 1.7) + 1) * 84 + (Math.sin(k * 0.53) + 1) * 40) * scale * SKY;
      ctx.fillRect(x, ground - h, w, h);
      // a couple of lit windows so the shapes read as buildings, not bars
      if (scale === 1) {
        ctx.fillStyle = rgba([255, 255, 255], .05);
        for (var r = 0; r < Math.floor(h / 34); r++)
          if ((k + r) % 3 === 0) ctx.fillRect(x + w * .3, ground - h + 16 + r * 34, w * .4, 7);
        ctx.fillStyle = rgb(col);
      }
    }
  }

  function block(x, era) {
    ctx.fillStyle = rgba(era.glow, .28);
    rr(x - 13, ground - 26, 26, 26, 4); ctx.fill();
    ctx.strokeStyle = rgba(era.glow, .6); ctx.lineWidth = 1.5;
    rr(x - 13, ground - 26, 26, 26, 4); ctx.stroke();
  }

  function pick(x, h, it, era) {
    var y = ground - h - 20 + Math.sin(S.t * 2.4 + x * .01) * 5;
    ctx.fillStyle = rgba(era.glow, .16);
    ctx.beginPath(); ctx.arc(x, y, 28, 0, 6.2832); ctx.fill();
    ctx.fillStyle = rgba(era.glow, .9);
    rr(x - 13, y - 13, 26, 26, 7); ctx.fill();
    ctx.fillStyle = rgba([8, 10, 14], .85);
    ctx.font = '700 ' + fpx(14) + 'px "JetBrains Mono", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(it.n[0], x, y + 1);
    ctx.textBaseline = 'top';
    ctx.font = '500 ' + fpx(14) + 'px "JetBrains Mono", monospace';
    ctx.fillStyle = rgba(era.glow, .62);
    ctx.fillText(it.n, x, y + 22);
  }

  function runner(x, y, c) {
    var bob = S.air ? 0 : Math.sin(S.legs * .09) * 2;
    ctx.save(); ctx.translate(x, y + bob); ctx.scale(1.35, 1.35);
    ctx.fillStyle = 'rgba(0,0,0,.34)';
    ctx.beginPath(); ctx.ellipse(0, 24 - bob, 15, 4.5, 0, 0, 6.2832); ctx.fill();
    var halo = ctx.createRadialGradient(0, -4, 2, 0, -4, 34);
    halo.addColorStop(0, rgba(c.glow, .22)); halo.addColorStop(1, rgba(c.glow, 0));
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(0, -4, 34, 0, 6.2832); ctx.fill();
    // legs
    ctx.strokeStyle = rgb(c.glow); ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    var sw = S.air ? .6 : Math.sin(S.legs * .09) * 1.1;
    ctx.beginPath();
    ctx.moveTo(0, 10); ctx.lineTo(sw * 10, 22);
    ctx.moveTo(0, 10); ctx.lineTo(-sw * 10, 22);
    ctx.stroke();
    // body and head
    ctx.fillStyle = rgb(c.glow);
    rr(-8, -6, 16, 18, 6); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -14, 9, 0, 6.2832); ctx.fill();
    ctx.fillStyle = rgba(c.tint, .95);
    ctx.beginPath(); ctx.arc(3.5, -15, 2, 0, 6.2832); ctx.fill();
    ctx.restore();
  }

  function rr(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  /* ── screens ── */
  function start() {
    $('intro').hidden = true; $('over').hidden = true; $('hud').hidden = false;
    $('cards').replaceChildren();
    things.forEach(function (t) { t.got = false; t.hit = false; });
    reset(); S.run = true;
    $('found').textContent = '0'; $('total').textContent = TOTAL;
    last = performance.now();
    if (!raf) raf = requestAnimationFrame(tick);
  }
  $('go').addEventListener('click', start);
  $('again').addEventListener('click', start);

  function finish() {
    $('hud').hidden = true;
    $('over-n').textContent = S.got + ' of ' + TOTAL;
    var box = $('over-list');
    box.replaceChildren();
    ERAS.concat([{ org: TAIL.label, role: '', items: TAIL.items, tint: ERAS[2].tint, glow: ERAS[2].glow, tail: true }])
      .forEach(function (e) {
        var h = document.createElement('p');
        h.className = 'ov-h';
        h.textContent = e.tail ? e.org : e.org + ', ' + e.role + ', ' + e.from + ' to ' + (e.to === 2026 ? 'now' : e.to);
        box.appendChild(h);
        var ul = document.createElement('ul');
        ul.className = 'ov-l';
        e.items.forEach(function (it) {
          var li = document.createElement('li');
          li.innerHTML = '<b></b> <span></span>';
          li.querySelector('b').textContent = it.n;
          li.querySelector('span').textContent = it.d;
          ul.appendChild(li);
        });
        box.appendChild(ul);
      });
    $('over').hidden = false;
    $('over').scrollTop = 0;
    $('again').focus({ preventScroll: true });
  }

  /* ── theme ── */
  function setTheme(t, persist) {
    root.setAttribute('data-theme', t);
    if (persist) try { localStorage.setItem('run-theme', t); } catch (e) {}
  }
  (function () {
    var s = null; try { s = localStorage.getItem('run-theme'); } catch (e) {}
    setTheme(s || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  })();
  $('theme').addEventListener('click', function () {
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
  });

  /* ── go ── */
  $('total').textContent = TOTAL;
  $('intro-total').textContent = TOTAL;
  resize();
  draw();
  document.querySelectorAll('.sp').forEach(function (b) {
    b.addEventListener('click', function () { setSpeed(b.dataset.s); });
  });
  $('slower').addEventListener('click', function () { nudge(-1); });
  $('faster').addEventListener('click', function () { nudge(1); });
  if (reduced && speedKey === 'normal') setSpeed('slow'); else setSpeed(speedKey);
})();
