/*
  script.js
  Main JavaScript for Trailmark.
  Currently handles: hero parallax, dynamic card rendering.
  Planned: search and filtering.
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

  update(); // sync layer positions on page load (handles restored scroll position)

}());

// =====================
// CARD RENDERING
// Builds park cards from the PARKS array in parks-data.js.
// Supports live search by name, state, or region.
// =====================
(function renderCards() {

  const grid = document.querySelector('.cards-grid');
  if (!grid || typeof PARKS === 'undefined') return;

  const searchInput = document.getElementById('park-search');

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderBadge(park) {
    return '<svg class="park-badge" viewBox="0 0 200 200"'
      + ' xmlns="http://www.w3.org/2000/svg" role="img"'
      + ' aria-label="' + park.name + ' National Park badge">'
      + park.svgInner
      + '</svg>';
  }

  function renderMeta(park) {
    return '<div class="card-meta">'
      + '<span class="card-region">' + park.region + '</span>'
      + '<span class="card-state">' + park.state + '</span>'
      + '</div>';
  }

  function renderCardAction(park) {
    return park.pageUrl
      ? '<a href="' + park.pageUrl + '" class="card-btn card-btn--link">Explore Park</a>'
      : '<span class="card-coming-soon">Coming Soon</span>';
  }

  function renderFeaturedCard(park) {
    const isAvailable = Boolean(park.pageUrl);

    return '<article class="park-card park-card--featured">'
      + '<div class="card-badge-area card-badge-area--' + park.badgeTheme + '">'
      + '<div class="card-badge-frame">'
      + renderBadge(park)
      + '</div>'
      + '</div>'
      + '<div class="card-body">'
      + '<p class="card-kicker">' + (isAvailable ? 'First unlocked destination' : 'Destination in progress') + '</p>'
      + renderMeta(park)
      + '<h3 class="card-title">' + park.name + '</h3>'
      + '<p class="card-description">' + park.shortDescription + '</p>'
      + '<p class="card-note">'
      + (isAvailable
        ? 'The first finished park in the archive, presented as a full destination feature instead of a simple card.'
        : 'Illustration and destination page are still being prepared for the archive.')
      + '</p>'
      + renderCardAction(park)
      + '</div>'
      + '</article>';
  }

  function renderSecondaryCard(park) {
    return '<article class="park-card park-card--secondary">'
      + '<div class="card-badge-area card-badge-area--' + park.badgeTheme + '">'
      + '<div class="card-badge-frame">'
      + renderBadge(park)
      + '</div>'
      + '</div>'
      + '<div class="card-body">'
      + '<div class="card-topline">'
      + renderMeta(park)
      + '<span class="card-status">Coming Soon</span>'
      + '</div>'
      + '<h3 class="card-title">' + park.name + '</h3>'
      + '<p class="card-description">' + park.shortDescription + '</p>'
      + '<p class="card-note">Illustration and destination page are still being prepared for the archive.</p>'
      + renderCardAction(park)
      + '</div>'
      + '</article>';
  }

  function renderGrid(parks) {
    if (!parks.length) {
      grid.innerHTML = '<p class="search-empty">No parks match your search.</p>';
      return;
    }

    const featuredPark = parks.find(function (park) {
      return park.id === 'yosemite';
    }) || parks[0];

    const secondaryParks = parks.filter(function (park) {
      return park.id !== featuredPark.id;
    });

    const featuredMarkup = renderFeaturedCard(featuredPark);
    const secondaryMarkup = secondaryParks.length
      ? '<div class="cards-secondary">' + secondaryParks.map(renderSecondaryCard).join('') + '</div>'
      : '';

    const filteredCount = parks.length !== PARKS.length
      ? '<p class="cards-filter-note">' + escapeHtml(String(parks.length)) + ' destination' + (parks.length === 1 ? '' : 's') + ' matched your search.</p>'
      : '';

    grid.innerHTML = featuredMarkup + secondaryMarkup + filteredCount;
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const query = this.value.trim().toLowerCase();
      if (!query) {
        renderGrid(PARKS);
        return;
      }
      const filtered = PARKS.filter(function (park) {
        return park.name.toLowerCase().includes(query)
          || park.state.toLowerCase().includes(query)
          || park.region.toLowerCase().includes(query);
      });
      renderGrid(filtered);
    });
  }

  renderGrid(PARKS);

}());
