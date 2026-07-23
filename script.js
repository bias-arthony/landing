// Bias Arthony — portfolio interactions. Vanilla JS, no dependencies.
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Theme (persisted, respects system on first visit) ── */
  var saved = localStorage.getItem("theme");
  root.setAttribute("data-theme",
    saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

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

  /* ── Scroll reveal ── */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ── Active nav link on scroll ── */
  var sections = document.querySelectorAll("main section[id]");
  var links = navLinks.querySelectorAll("a");
  if ("IntersectionObserver" in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* ── Hero typing effect ── */
  var caret = document.getElementById("caret");
  var cmds = document.querySelectorAll("#hero-term .cmd-text");
  var outs = document.querySelectorAll("#hero-term .out");

  if (!reduce && cmds.length) {
    // hide outputs + stash command text, then type each command, revealing its output
    var texts = [];
    cmds.forEach(function (c, i) { texts[i] = c.textContent; c.textContent = ""; });
    outs.forEach(function (o) { o.style.opacity = "0"; });
    if (caret) caret.style.visibility = "hidden";

    typeSeq(0);

    function typeSeq(i) {
      if (i >= cmds.length) { if (caret) caret.style.visibility = ""; return; }
      typeText(cmds[i], texts[i], 0, function () {
        if (outs[i]) { outs[i].style.transition = "opacity .35s"; outs[i].style.opacity = "1"; }
        setTimeout(function () { typeSeq(i + 1); }, 260);
      });
    }
    function typeText(el, text, pos, done) {
      if (pos > text.length) { done(); return; }
      el.textContent = text.slice(0, pos);
      setTimeout(function () { typeText(el, text, pos + 1, done); }, 42);
    }
  }

  /* ── Contact form → Web3Forms (no backend) ── */
  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = form.querySelector(".btn-submit");
    status.className = "form-status";
    status.textContent = "> sending...";
    btn.disabled = true;

    fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          status.className = "form-status ok";
          status.textContent = "> message delivered. thanks!";
          form.reset();
        } else {
          throw new Error(data.message || "failed");
        }
      })
      .catch(function () {
        status.className = "form-status err";
        status.textContent = "> error: could not send. email biasarthony@gmail.com instead.";
      })
      .finally(function () { btn.disabled = false; });
  });

  /* ── Secret vault: unlock with years of experience from /api/profile ── */
  var vform = document.getElementById("vault-form");
  if (vform) {
    vform.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = document.getElementById("vault-input").value;
      var msg = document.getElementById("vault-msg");
      if (parseInt(val, 10) === 7) {          // accepts "7", "7+", "7 years", "7+ years"
        document.getElementById("vault-secret").hidden = false;
        document.getElementById("vault-hint").hidden = true;
        vform.hidden = true;
        msg.textContent = "";
      } else {
        msg.textContent = "> access denied. hint: curl the /api/profile endpoint.";
      }
    });
  }
})();
