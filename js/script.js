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
  const curatedIds = ['yosemite', 'yellowstone', 'grand-canyon'];
  const maxSearchResults = 9;
  const curatedParks = curatedIds.map(function (id) {
    return PARKS.find(function (park) {
      return park.id === id;
    });
  }).filter(Boolean);
  let currentQuery = '';
  let showingAllMatches = false;

  function getSearchRank(park, query) {
    const name = park.name.toLowerCase();
    const state = park.state.toLowerCase();
    const region = park.region.toLowerCase();

    if (name === query) return 0;
    if (name.startsWith(query)) return 1;
    if (name.includes(query)) return 2;
    if (state.includes(query)) return 3;
    if (region.includes(query)) return 4;
    return 5;
  }

  function filterParks(query) {
    return PARKS.filter(function (park) {
      return park.name.toLowerCase().includes(query)
        || park.state.toLowerCase().includes(query)
        || park.region.toLowerCase().includes(query);
    }).sort(function (parkA, parkB) {
      const rankDifference = getSearchRank(parkA, query) - getSearchRank(parkB, query);
      if (rankDifference !== 0) return rankDifference;

      return parkA.name.localeCompare(parkB.name);
    });
  }

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

  function renderGrid(parks, options) {
    const renderOptions = options || {};

    if (!parks.length) {
      grid.innerHTML = '<p class="search-empty">No parks match your search.</p>';
      return;
    }

    const shouldLimitResults = renderOptions.isSearchResult && !renderOptions.showAll && parks.length > maxSearchResults;
    const visibleParks = shouldLimitResults ? parks.slice(0, maxSearchResults) : parks;

    const featuredPark = visibleParks.find(function (park) {
      return park.id === 'yosemite';
    }) || visibleParks[0];

    const secondaryParks = visibleParks.filter(function (park) {
      return park.id !== featuredPark.id;
    });

    const featuredMarkup = renderFeaturedCard(featuredPark);
    const secondaryMarkup = secondaryParks.length
      ? '<div class="cards-secondary">' + secondaryParks.map(renderSecondaryCard).join('') + '</div>'
      : '';

    let resultsMeta = '';
    if (renderOptions.isSearchResult) {
      if (shouldLimitResults) {
        resultsMeta = '<div class="cards-results-bar">'
          + '<p class="cards-filter-note">Showing ' + maxSearchResults + ' of ' + escapeHtml(String(parks.length)) + ' matching parks.</p>'
          + '<button type="button" class="cards-show-all">Show all matches</button>'
          + '</div>';
      } else {
        resultsMeta = '<p class="cards-filter-note">'
          + (renderOptions.showAll && parks.length > maxSearchResults
            ? 'Showing all ' + escapeHtml(String(parks.length)) + ' matching parks.'
            : escapeHtml(String(parks.length)) + ' destination' + (parks.length === 1 ? '' : 's') + ' matched your search.')
          + '</p>';
      }
    }

    grid.innerHTML = featuredMarkup + secondaryMarkup + resultsMeta;
  }

  grid.addEventListener('click', function (event) {
    const showAllButton = event.target.closest('.cards-show-all');
    if (!showAllButton || !currentQuery) return;

    showingAllMatches = true;
    renderGrid(filterParks(currentQuery), {
      isSearchResult: true,
      showAll: true,
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const query = this.value.trim().toLowerCase();
      currentQuery = query;
      showingAllMatches = false;

      if (!query) {
        renderGrid(curatedParks);
        return;
      }
      renderGrid(filterParks(query), {
        isSearchResult: true,
        showAll: showingAllMatches,
      });
    });
  }

  renderGrid(curatedParks);

}());
