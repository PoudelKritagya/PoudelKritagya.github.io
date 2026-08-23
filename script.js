// Scroll-reveal: fade/slide elements into view
document.addEventListener("DOMContentLoaded", function () {
  var targets = document.querySelectorAll(".reveal, .reveal-stagger");

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    targets.forEach(function (el) { observer.observe(el); });
  } else {
    // fallback: just show everything
    targets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Animated stat counters (numbers with data-count attribute)
  var counters = document.querySelectorAll("[data-count]");
  var countersDone = false;

  function animateCounters() {
    if (countersDone) return;
    countersDone = true;
    counters.forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var isDecimal = el.getAttribute("data-count").indexOf(".") !== -1;
      var duration = 900;
      var startTime = null;

      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        var current = target * eased;
        el.textContent = isDecimal ? current.toFixed(1) : Math.round(current);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = isDecimal ? target.toFixed(1) : target;
      }
      requestAnimationFrame(step);
    });
  }

  var statRow = document.querySelector(".stat-row");
  if (statRow && "IntersectionObserver" in window) {
    var statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounters();
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statObserver.observe(statRow);
  } else {
    animateCounters();
  }
});
