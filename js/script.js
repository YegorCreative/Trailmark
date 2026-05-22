/*
  script.js
  Main JavaScript for Trailmark.
  Currently handles: hero parallax.
  Planned: search, filtering, and dynamic card rendering in Phase 2.
*/

// =====================
// HERO PARALLAX
// Reusable scroll-based parallax for hero sections.
// Any element with [data-speed] participates.
// speed="0" = static, speed="1" = moves at full scroll rate.
// =====================
(function initParallax() {

  // Respect user's motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Skip on small screens for performance
  if (window.innerWidth < 600) return;

  const layers = document.querySelectorAll('[data-speed]');
  if (!layers.length) return;

  let ticking = false;

  function update() {
    const scrollY = window.scrollY;
    layers.forEach(function (layer) {
      const speed = parseFloat(layer.dataset.speed) || 0;
      layer.style.transform = 'translateY(' + (scrollY * -speed) + 'px)';
    });
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

}());
