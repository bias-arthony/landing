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

  /* ── Hero typing effect + interactive terminal ── */
  var caret = document.getElementById("caret");
  var cmds = document.querySelectorAll("#hero-term .cmd-text");
  var outs = document.querySelectorAll("#hero-term .out");
  var termInput = document.getElementById("term-input");
  var termHistory = document.getElementById("term-history");
  var heroTerm = document.getElementById("hero-term");

  var PROFILE_JSON =
    '<pre class="out json"><span class="jp">{</span>\n' +
    '  <span class="jk">"name"</span>: <span class="js">"Bias Arthony"</span>,\n' +
    '  <span class="jk">"role"</span>: <span class="js">"Backend Engineer"</span>,\n' +
    '  <span class="jk">"experience"</span>: <span class="js">"15+ years"</span>,\n' +
    '  <span class="jk">"primary_language"</span>: <span class="js">"Go"</span>,\n' +
    '  <span class="jk">"status"</span>: <span class="js">"Open to Work"</span>\n' +
    '<span class="jp">}</span></pre>';

  if (!reduce && cmds.length) {
    var texts = [];
    cmds.forEach(function (c, i) { texts[i] = c.textContent; c.textContent = ""; });
    outs.forEach(function (o) { o.style.opacity = "0"; });
    if (caret) caret.style.visibility = "hidden";
    typeSeq(0);

    function typeSeq(i) {
      if (i >= cmds.length) { if (caret) caret.style.visibility = ""; enableTerminal(); return; }
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
  } else {
    enableTerminal();
  }

  function enableTerminal() {
    if (!termInput) return;
    termInput.disabled = false;
    if (heroTerm) heroTerm.addEventListener("click", function () { termInput.focus(); });
    termInput.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      var cmd = termInput.value.trim();
      termInput.value = "";
      if (!cmd) return;
      echo(cmd);
      runCommand(cmd);
    });
  }

  function echo(cmd) {
    var p = document.createElement("p");
    p.className = "cmd";
    p.innerHTML = '<span class="prompt">bias@bias.my.id</span><span class="path">:~$</span> ';
    var span = document.createElement("span");
    span.className = "cmd-text";
    span.textContent = cmd;                 // textContent = safe against injection
    p.appendChild(span);
    termHistory.appendChild(p);
  }

  function out(html, isHTML) {
    var el = document.createElement(isHTML ? "div" : "p");
    el.className = "out";
    if (isHTML) el.innerHTML = html; else el.textContent = html;
    termHistory.appendChild(el);
  }

  function runCommand(cmd) {
    var name = cmd.toLowerCase().split(/\s+/)[0];
    if (name === "curl") {
      out(PROFILE_JSON, true);
    } else if (name === "whoami") {
      out("Bias Arthony — Backend Engineer");
    } else if (name === "help") {
      out("available: curl <url>, whoami, help, clear");
    } else if (name === "clear") {
      termHistory.innerHTML = "";
    } else {
      out("command not found: " + name + ". try 'curl https://bias.my.id/api/profile' or 'help'.");
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

})();
