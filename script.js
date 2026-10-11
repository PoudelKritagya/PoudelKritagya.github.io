document.addEventListener("DOMContentLoaded", function () {
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* ---------- Scroll reveal ---------- */
  var targets = document.querySelectorAll(".reveal, .reveal-stagger");
  if (hasIO && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    targets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Animated stat counters ----------
     The HTML already contains the final numbers, so nothing breaks without JS.
     Here we reset them to 0 and count up when they scroll into view. */
  var counters = document.querySelectorAll("[data-count]");
  var statRow = document.querySelector(".stat-row");

  function format(el, value) {
    var isDecimal = el.getAttribute("data-count").indexOf(".") !== -1;
    return isDecimal ? value.toFixed(1) : String(Math.round(value));
  }

  function runCounters() {
    counters.forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var duration = 900;
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = format(el, target * eased);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = format(el, target);
      }
      requestAnimationFrame(step);
    });
  }

  if (counters.length && statRow && hasIO && !reduceMotion) {
    counters.forEach(function (el) { el.textContent = format(el, 0); });
    var statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounters();
          statObserver.disconnect();
        }
      });
    }, { threshold: 0.4 });
    statObserver.observe(statRow);
  }

  /* ---------- Nav highlight while scrolling (home page only) ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('nav.topnav .links a[href^="#"]'));
  if (navLinks.length) {
    var sections = navLinks.map(function (a) {
      return { link: a, el: document.querySelector(a.getAttribute("href")) };
    }).filter(function (s) { return s.el; });

    var ticking = false;
    function updateActive() {
      var y = window.scrollY + 140;
      var current = sections[0];
      sections.forEach(function (s) {
        if (s.el.offsetTop <= y) current = s;
      });
      navLinks.forEach(function (a) { a.classList.remove("active"); });
      if (current) current.link.classList.add("active");
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateActive); }
    }, { passive: true });
    updateActive();
  }

  /* ---------- Back to top button ---------- */
  var toTop = document.createElement("button");
  toTop.className = "back-to-top";
  toTop.type = "button";
  toTop.setAttribute("aria-label", "Back to top");
  toTop.innerHTML = "&uarr;";
  document.body.appendChild(toTop);
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
  window.addEventListener("scroll", function () {
    toTop.classList.toggle("show", window.scrollY > 600);
  }, { passive: true });

  /* ---------- Contact form: send without leaving the page ---------- */
  var form = document.querySelector("form.contact-form");
  if (form && window.fetch && window.FormData) {
    var status = form.querySelector(".form-status");
    var button = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status";
      status.textContent = "Sending...";
      button.disabled = true;

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      }).then(function (res) {
        if (res.ok) {
          status.className = "form-status ok";
          status.textContent = "Thanks! Your message was sent. I'll get back to you soon.";
          form.reset();
        } else {
          throw new Error("Request failed");
        }
      }).catch(function () {
        status.className = "form-status err";
        status.textContent = "Sorry, that didn't go through. Please email me directly at kritagya1324@student.ku.edu.np.";
      }).then(function () {
        button.disabled = false;
      });
    });
  }
});