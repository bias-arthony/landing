// bias.my.id — Engineering System portfolio. Vanilla JS, no dependencies.
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Theme ── */
  var saved = localStorage.getItem("theme");
  root.setAttribute("data-theme", saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  document.getElementById("theme-toggle").addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* ── Mobile menu ── */
  var menuBtn = document.getElementById("menu-btn");
  var navLinks = document.getElementById("nav-links");
  menuBtn.addEventListener("click", function () {
    var open = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  navLinks.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { navLinks.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false); }
  });

  /* ── Systems ── */
  var SYSTEMS = [
    { name: "MYXL", type: "Payment / Backend Systems", focus: ["Payment APIs", "Backend services", "Request validation"], stack: ["Go", "Redis", "PostgreSQL"], link: "https://www.xl.co.id/myxl",
      study: {
        problem: "MYXL processes a high volume of payment transactions across many payment methods — all of which must be handled reliably and consistently.",
        approach: "Built payment APIs and backend services in Go, with Redis caching, strict request validation, and HMAC signature checks on payment callbacks.",
        result: "Payment flows serving 39.1M+ users."
      } },
    { name: "DBO", type: "Multi-outlet Management", focus: ["Multi-outlet management", "Inventory", "Real-time stock"], stack: ["Go", "RabbitMQ", "Redis", "Laravel"],
      study: {
        problem: "Partners needed to manage many outlets in one app, tracking goods moving in and out from suppliers.",
        approach: "Built backend APIs for multi-outlet management with real-time stock, using RabbitMQ for updates and Redis for fast reads.",
        result: "One app managing multiple partner outlets with live stock levels."
      } },
    { name: "Apollo", type: "Reimbursement Platform", focus: ["Reimbursement", "Disbursement", "Role-based approval"], stack: ["Go", "Xendit"], link: "https://getapollo.co/reimbursement",
      study: {
        problem: "Companies needed to manage employee reimbursements — many companies, each with their own approvers.",
        approach: "Built a multi-company reimbursement platform in Go with Xendit disbursement, per-account dashboards, role-based approvers, and bulk import in a defined format.",
        result: "One dashboard handling reimbursement and approval flows across multiple companies."
      } },
    { name: "Freshbox", type: "E-commerce Backend", focus: ["Checkout", "Payments", "Flash sale"], stack: ["Laravel", "MySQL", "Midtrans"], link: "https://www.freshbox.id/",
      study: {
        problem: "Buyers wanted cheaper fruit; buying direct from farmers cuts out the middleman.",
        approach: "Built an e-commerce backend in Laravel/MySQL with Midtrans payments, free shipping, and flash-sale support.",
        result: "A farmer-to-buyer marketplace with lower prices and free delivery."
      } },
    { name: "Nimbly", type: "Operations Dashboard", focus: ["Admin dashboard", "Employee operations"], stack: ["Go", "MongoDB"], link: "https://hellonimbly.com/id/",
      study: {
        problem: "Teams needed an admin dashboard to manage employee operations.",
        approach: "Built backend services in Go with MongoDB.",
        result: "Live at hellonimbly.com."
      } },
    { name: "Cimory", type: "HRIS", focus: ["Employee data", "Cost calculation", "Email automation"], stack: ["Laravel", "MySQL"],
      study: {
        problem: "The company needed to manage employee HR data and routine processes.",
        approach: "Built an HRIS backend in Laravel/MySQL with automated cost calculations and email notifications.",
        result: "An HR system managing employee data with automated notifications."
      } },
    { name: "Rootin", type: "Crowdfunding", focus: ["Donations", "Payment gateway"], stack: ["Go"],
      study: {
        problem: "A crowdfunding platform (similar to Kitabisa) needed reliable donation payments.",
        approach: "Built Go services with payment gateway integration for donations.",
        result: "A crowdfunding platform with integrated payments."
      } },
    { name: "Dompetkilat", type: "P2P Lending", focus: ["Peer-to-peer lending", "Wallet"], stack: ["Go"],
      study: {
        problem: "A peer-to-peer lending platform needed backend features for lending and wallets.",
        approach: "Built backend features in Go for the P2P lending platform.",
        result: "Backend supporting peer-to-peer lending flows."
      } },
    { name: "Jaya Manex", type: "Corporate Website", focus: ["Company profile"], stack: ["Laravel"],
      study: {
        problem: "The company needed a corporate profile website.",
        approach: "Built the site backend with Laravel.",
        result: "A company profile website."
      } },
    { name: "Summit Healthcare", type: "Healthcare Training LMS", focus: ["Learning platform", "Healthcare training"], stack: ["Moodle", "PHP", "MySQL"], link: "https://www.summithealthcare.co.id/",
      study: {
        problem: "A healthcare training provider needed an online learning platform to help improve care quality in Indonesia.",
        approach: "Built the LMS backend on Moodle (PHP/MySQL).",
        result: "An online training platform for healthcare professionals."
      } },
  ];

  function field(label, val, placeholder) {
    var filled = val && val.trim();
    return '<div class="sys-field"><span class="fk">' + label + '</span>' +
      '<p' + (filled ? '' : ' class="ph"') + '>' + (filled ? val : placeholder) + '</p></div>';
  }

  var list = document.getElementById("systems-list");
  SYSTEMS.forEach(function (s, i) {
    var num = String(i + 1).padStart(2, "0");
    var st = s.study || {};
    var el = document.createElement("div");
    el.className = "sys";
    el.innerHTML =
      '<div class="sys-head" role="button" tabindex="0" aria-expanded="false">' +
        '<span class="sys-num">' + num + '</span>' +
        '<span class="sys-title"><span class="name">' + s.name + '</span><span class="type">' + s.type + '</span></span>' +
        '<span class="sys-toggle">view case study →</span>' +
      '</div>' +
      '<div class="sys-detail"><div></div><div class="sys-detail-inner">' +
        '<div class="sys-cols">' +
          '<div class="sys-field"><span class="fk">Focus</span><p>' + s.focus.join(" · ") + '</p></div>' +
          '<div class="sys-field"><span class="fk">Technology</span><p>' + s.stack.join(" · ") + '</p></div>' +
        '</div>' +
        field("Problem", st.problem, "[ Describe the engineering problem this system solved. ]") +
        field("Approach", st.approach, "[ Systems, technologies, and engineering decisions. ]") +
        field("Result", st.result, "[ Verified outcomes only — no invented metrics. ]") +
        (s.link ? '<div class="sys-links"><a href="' + s.link + '" target="_blank" rel="noopener">Visit ↗</a></div>' : '') +
      '</div></div>';
    var head = el.querySelector(".sys-head");
    var toggle = function () {
      var open = el.classList.toggle("open");
      head.setAttribute("aria-expanded", open);
      head.querySelector(".sys-toggle").textContent = open ? "close ×" : "view case study →";
    };
    head.addEventListener("click", toggle);
    head.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
    list.appendChild(el);
  });

  /* ── API console ── */
  var tabs = document.getElementById("api-tabs");
  var epLabel = document.getElementById("api-ep");
  var res = document.getElementById("api-res");
  var cache = {};
  function load(ep) {
    epLabel.textContent = ep;
    if (cache[ep]) { res.textContent = cache[ep]; return; }
    res.textContent = "Loading…";
    fetch(ep, { headers: { Accept: "application/json" } })
      .then(function (r) { return r.json(); })
      .then(function (d) { cache[ep] = JSON.stringify(d, null, 2); res.textContent = cache[ep]; })
      .catch(function () { res.textContent = "// endpoint available after deploy — try: curl https://bias.my.id" + ep; });
  }
  tabs.addEventListener("click", function (e) {
    var btn = e.target.closest(".api-tab");
    if (!btn) return;
    tabs.querySelectorAll(".api-tab").forEach(function (b) { b.classList.remove("active"); });
    btn.classList.add("active");
    load(btn.dataset.ep);
  });
  load("/api/profile");

  /* ── Scroll reveal ── */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); } });
    }, { threshold: 0.1 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ── Active nav ── */
  var secs = document.querySelectorAll("main section[id], header.hero");
  var navA = navLinks.querySelectorAll("a");
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) navA.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach(function (s) { obs.observe(s); });
  }
})();
