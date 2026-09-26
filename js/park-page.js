/*
  park-page.js
  Binds behavior on a park article. The markup comes from park-render.js,
  either pre-rendered into #park-page or filled here when it is missing.
*/

(function renderParkPage() {
  const mount = document.getElementById('park-page');
  if (!mount || typeof PARK_PAGE_CONTENT === 'undefined' || typeof trailmarkRenderPark !== 'function') return;

  const parkId = mount.dataset.parkId || 'yosemite';
  const park = PARK_PAGE_CONTENT[parkId];
  const parkCard = typeof PARKS !== 'undefined'
    ? PARKS.find(function (entry) { return entry.id === parkId; })
    : null;

  if (!park) {
    if (!mount.querySelector('#hero')) {
      mount.innerHTML = '<section class="park-section"><div class="section-inner"><p class="search-empty">Park content is not available yet.</p></div></section>';
    }
    return;
  }

  const staleCrumb = document.querySelector('.park-back');
  if (staleCrumb) staleCrumb.remove();

  if (!mount.querySelector('#hero')) {
    const photos = typeof PHOTOS !== 'undefined'
      ? PHOTOS.filter(function (photo) { return photo.parkId === parkId; })
      : [];
    mount.innerHTML = trailmarkRenderPark(park, parkCard, { parks: typeof PARKS !== 'undefined' ? PARKS : [], photos: photos });
  }

  function initChapters() {
    const nav = document.querySelector('.chapter-nav');
    if (!nav) return;
    const links = Array.prototype.slice.call(nav.querySelectorAll('a'));
    const bar = nav.querySelector('.chapter-progress span');
    const sections = links.map(function (link) {
      return document.querySelector(link.getAttribute('href'));
    }).filter(Boolean);
    window.__tmChapters = { links: links, sections: sections, bar: bar, tops: [] };
    if (window.__tmCacheLayout) window.__tmCacheLayout();
  }

  function initTilt() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.badge-tilt').forEach(function (item) {
      item.addEventListener('pointermove', function (event) {
        const rect = item.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        item.style.transform = 'rotateY(' + (x * 12).toFixed(2) + 'deg) rotateX(' + (-y * 8).toFixed(2) + 'deg)';
      });
      item.addEventListener('pointerleave', function () { item.style.transform = ''; });
    });
  }

  initChapters();
  initTilt();
  if (window.__tmObserve) window.__tmObserve(mount);
}());
