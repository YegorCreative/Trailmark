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
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const layers = document.querySelectorAll('[data-speed]');
  const fades = document.querySelectorAll('[data-parallax="fade"]');
  if (!layers.length && !fades.length) return;

  const small = window.matchMedia('(max-width: 700px), (pointer: coarse)').matches;
  const strength = small ? 0.35 : 1;
  let ticking = false;

  function update() {
    const scrollY = window.scrollY;
    layers.forEach(function (layer) {
      const speed = (parseFloat(layer.dataset.speed) || 0) * strength;
      const scale = small ? 1 : (parseFloat(layer.dataset.scale) || 1);
      const shift = scrollY * speed * -1;
      layer.style.transform = 'translate3d(0,' + shift.toFixed(2) + 'px,0) scale(' + scale + ')';
    });
    fades.forEach(function (el) {
      const hero = el.closest('#hero') || el;
      const rect = hero.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)));
      el.style.opacity = String(1 - progress * 0.75);
      el.style.transform = 'translate3d(0,' + (progress * -18 * strength).toFixed(2) + 'px,0)';
    });
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
}());

(function initReveals() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    window.__tmObserve = function () {};
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  window.__tmObserve = function (root) {
    const scope = root || document;
    const nodes = scope.querySelectorAll('.park-section, .highlight-card, .season-card, .discovery-card, .value-prop, .badge-entry, .reveal');
    nodes.forEach(function (node, index) {
      if (!node.classList.contains('reveal')) node.classList.add('reveal');
      if (!node.style.transitionDelay) node.style.transitionDelay = Math.min(index % 6, 5) * 60 + 'ms';
      observer.observe(node);
    });
  };

  window.__tmObserve(document);
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

  function assetUrl(path) {
    if (!path || path.indexOf('../') === 0 || path.indexOf('http') === 0 || path.indexOf('/') === 0) return path;
    const base = document.documentElement.getAttribute('data-asset-base') || '';
    return base + path;
  }

  function renderCardHero(park) {
    if (!park.art || !park.art.header) return '';
    return '<div class="card-hero-frame" aria-hidden="true">'
      + '<img class="card-hero-img" src="' + assetUrl(park.art.header) + '" alt="" width="1672" height="941" loading="lazy" />'
      + '</div>';
  }

  function renderBadge(park) {
    if (park.art && park.art.badge) {
      return '<img class="park-badge-img" src="' + assetUrl(park.art.badge) + '" alt="'
        + escapeHtml(park.name) + ' badge" width="600" height="600" />';
    }
    return '<svg class="park-badge" viewBox="0 0 200 200"'
      + ' xmlns="http://www.w3.org/2000/svg" role="img"'
      + ' aria-label="' + escapeHtml(park.name) + ' National Park badge">'
      + park.svgInner
      + '</svg>';
  }

  function renderMeta(park) {
    return '<div class="card-meta">'
      + '<span class="card-region">' + escapeHtml(park.region) + '</span>'
      + '<span class="card-state">' + escapeHtml(park.state) + '</span>'
      + '</div>';
  }

  function renderCardAction(park) {
    return park.pageUrl
      ? '<a href="' + park.pageUrl + '" class="card-btn card-btn--link">Explore Park</a>'
      : '<span class="card-coming-soon">Coming Soon</span>';
  }

  function renderFeaturedCard(park) {
    const isAvailable = Boolean(park.pageUrl);

    return '<article class="park-card park-card--featured reveal">'
      + '<div class="card-badge-area card-badge-area--' + park.badgeTheme + '">'
      + renderCardHero(park)
      + '<div class="card-badge-frame">'
      + renderBadge(park)
      + '</div>'
      + '</div>'
      + '<div class="card-body">'
      + '<p class="card-kicker">' + (isAvailable ? 'Open archive destination' : 'Destination in progress') + '</p>'
      + renderMeta(park)
      + '<h3 class="card-title">' + escapeHtml(park.name) + '</h3>'
      + '<p class="card-description">' + escapeHtml(park.shortDescription) + '</p>'
      + '<p class="card-note">'
      + (isAvailable
        ? 'A finished park in the archive, presented as a full destination feature instead of a simple card.'
        : 'Illustration and destination page are still being prepared for the archive.')
      + '</p>'
      + renderCardAction(park)
      + '</div>'
      + '</article>';
  }

  function renderSecondaryCard(park) {
    const isAvailable = Boolean(park.pageUrl);
    const statusMarkup = isAvailable
      ? ''
      : '<span class="card-status">Coming Soon</span>';
    const note = isAvailable
      ? 'A finished destination page is open in the archive.'
      : 'Illustration and destination page are still being prepared for the archive.';

    return '<article class="park-card park-card--secondary reveal">'
      + '<div class="card-badge-area card-badge-area--' + park.badgeTheme + '">'
      + renderCardHero(park)
      + '<div class="card-badge-frame">'
      + renderBadge(park)
      + '</div>'
      + '</div>'
      + '<div class="card-body">'
      + '<div class="card-topline">'
      + renderMeta(park)
      + statusMarkup
      + '</div>'
      + '<h3 class="card-title">' + escapeHtml(park.name) + '</h3>'
      + '<p class="card-description">' + escapeHtml(park.shortDescription) + '</p>'
      + '<p class="card-note">' + note + '</p>'
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
    if (window.__tmObserve) window.__tmObserve(grid);
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

// Published-archive count follows parks that have a pageUrl.
(function updatePublishedCount() {
  if (typeof PARKS === 'undefined') return;

  const number = document.querySelector('[data-published-count]');
  if (!number) return;

  const published = PARKS.filter(function (park) {
    return park.pageUrl;
  }).length;

  number.textContent = String(published);
}());

(function mountBadgeSlots() {
  if (typeof PARKS === 'undefined') return;

  document.querySelectorAll('[data-badge-mount]').forEach(function (slot) {
    const park = PARKS.find(function (entry) {
      return entry.id === slot.getAttribute('data-badge-mount');
    });
    if (!park || !park.art || !park.art.badge) return;

    const image = document.createElement('img');
    image.className = 'badge-system-mark park-badge-img';
    image.src = park.art.badge;
    image.alt = park.name + ' badge';
    image.width = 600;
    image.height = 600;
    slot.replaceChildren(image);
  });
}());
