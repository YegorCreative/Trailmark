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
(function initScroll() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroLayer = document.querySelector('#hero [data-hero-parallax], #hero [data-pin-bottom], #hero [data-hero-crossfade]');
  const fades = reduce ? [] : Array.prototype.slice.call(document.querySelectorAll('#hero [data-parallax="fade"]'));
  let heroTop = 0;
  let heroHeight = 1;
  let ticking = false;

  function cache() {
    const hero = document.getElementById('hero');
    if (hero) {
      heroTop = hero.offsetTop;
      heroHeight = hero.offsetHeight || 1;
    }
    const chapters = window.__tmChapters;
    if (chapters && chapters.sections) {
      chapters.tops = chapters.sections.map(function (section) { return section.offsetTop; });
    }
  }

  window.__tmCacheLayout = cache;

  function frame() {
    const y = window.scrollY;
    const header = window.__tmHeader;
    if (header) header.classList.toggle('is-solid', y > 80);

    if (!reduce && heroLayer && heroHeight) {
      const progress = Math.min(1, Math.max(0, (y - heroTop) / heroHeight));
      // Scale from the bottom edge so the foreground is not translated out of frame.
      heroLayer.style.transformOrigin = 'center bottom';
      heroLayer.style.transform = 'scale(' + (1 + progress * 0.035).toFixed(4) + ')';
      const inView = y < heroTop + heroHeight && y + window.innerHeight > heroTop;
      heroLayer.style.willChange = inView ? 'transform' : 'auto';
      fades.forEach(function (el) {
        el.style.opacity = String(1 - progress * 0.75);
        el.style.transform = 'translate3d(0,' + (progress * -28).toFixed(2) + 'px,0)';
      });
    }

    if (window.__tmRevealPass) window.__tmRevealPass(y);

    const chapters = window.__tmChapters;
    if (chapters && chapters.sections && chapters.sections.length) {
      const line = y + 120;
      let current = 0;
      chapters.tops.forEach(function (top, index) {
        if (top <= line) current = index;
      });
      const currentId = chapters.sections[current] && chapters.sections[current].id;
      chapters.links.forEach(function (link) {
        const on = link.getAttribute('href') === '#' + currentId;
        link.classList.toggle('is-current', on);
        if (on) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
      if (chapters.bar) {
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const progress = height > 0 ? Math.min(1, y / height) : 0;
        chapters.bar.style.transform = 'scaleX(' + progress.toFixed(4) + ')';
      }
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(frame);
  }, { passive: true });
  window.addEventListener('resize', cache);
  cache();
  frame();
}());

(function initReveals() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    window.__tmObserve = function () {};
    return;
  }
  document.documentElement.classList.add('js-reveal');

  let pending = [];
  // Viewport-relative: offsetTop is not document position when an ancestor
  // is positioned, so a jump to the bottom never revealed those sections.
  function pass() {
    const line = window.innerHeight * 0.92;
    pending = pending.filter(function (el) {
      if (el.getBoundingClientRect().top <= line) {
        el.classList.add('is-visible');
        return false;
      }
      return true;
    });
  }
  window.__tmRevealPass = pass;

  window.__tmObserve = function (root) {
    const scope = root || document;
    const nodes = scope.querySelectorAll('.park-section, .highlight-card, .season-card, .discovery-card, .value-prop, .badge-entry, .reveal');
    nodes.forEach(function (node, index) {
      if (!node.classList.contains('reveal')) node.classList.add('reveal');
      if (node.classList.contains('is-visible')) return;
      if (!node.style.transitionDelay) node.style.transitionDelay = Math.min(index % 6, 5) * 60 + 'ms';
      if (pending.indexOf(node) === -1) pending.push(node);
    });
    pass(window.scrollY);
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
    const full = assetUrl(park.art.header);
    const small = full.replace(/header\.webp$/, 'header-640.webp');
    const mid = full.replace(/header\.webp$/, 'header-1280.webp');
    return '<div class="card-hero-frame" aria-hidden="true">'
      + '<img class="card-hero-img" src="' + small + '" srcset="' + small + ' 640w, ' + mid + ' 1280w" sizes="(max-width: 640px) 90vw, (max-width: 900px) 35vw, 23rem" alt="" width="640" height="360" loading="lazy" decoding="async" />'
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

(function initHeroCrossfade() {
  const scene = document.querySelector('[data-hero-crossfade]');
  if (!scene || typeof PARKS === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const order = ['yosemite', 'yellowstone', 'grand-canyon', 'olympic', 'zion', 'everglades'];
  const first = scene.querySelector('img');
  if (!first) return;

  const slides = [first];
  const slideParks = [];
  const caption = document.querySelector('[data-hero-slide]');

  function labelFor(park) {
    if (!caption || !park) return;
    const state = String(park.state || '').split(',')[0].trim();
    caption.textContent = park.name + ', ' + state;
    caption.setAttribute('href', 'parks/' + park.id + '.html');
  }

  function slideSrc(park) {
    return park.art.header.replace(/header\.webp$/, 'header-1280.webp');
  }

  function slideSrcset(park) {
    const dir = park.art.header.replace(/header\.webp$/, '');
    return dir + 'header-640.webp 640w, ' + dir + 'header-1280.webp 1280w, ' + dir + 'header-1920.webp 1920w, ' + dir + 'header-2560.webp 2560w';
  }

  function addSlide(park) {
    const image = document.createElement('img');
    image.className = 'hero-scene-art hero-scene-art--base';
    image.alt = '';
    image.width = 1672;
    image.height = 941;
    image.decoding = 'async';
    image.sizes = '100vw';
    scene.appendChild(image);
    return image;
  }

  const queue = [];
  order.forEach(function (id) {
    const park = PARKS.find(function (entry) { return entry.id === id && entry.pageUrl && entry.art; });
    if (park) queue.push(park);
  });
  if (!queue.length) return;
  slideParks[0] = queue[0];
  labelFor(queue[0]);
  let index = 0;

  function arm(image, park, done) {
    if (image.getAttribute('data-ready') === '1') {
      done();
      return;
    }
    image.addEventListener('load', function () {
      image.setAttribute('data-ready', '1');
      done();
    }, { once: true });
    if (!image.getAttribute('src')) {
      image.srcset = slideSrcset(park);
      image.src = slideSrc(park);
    } else if (image.complete) {
      image.setAttribute('data-ready', '1');
      done();
    }
  }

  function advance() {
    const next = (index + 1) % queue.length;
    if (!slides[next]) slides[next] = addSlide(queue[next]);
    arm(slides[next], queue[next], function () {
      slides[index].classList.remove('is-active');
      slides[next].classList.add('is-active');
      index = next;
      labelFor(queue[next]);
      window.setTimeout(advance, 6000);
    });
  }

  window.setTimeout(advance, 5500);
}());

(function syncBadgeBoard() {
  if (typeof PARKS === 'undefined') return;
  document.querySelectorAll('[data-board-park]').forEach(function (article) {
    const park = PARKS.find(function (entry) {
      return entry.id === article.getAttribute('data-board-park');
    });
    if (!park) return;
    const open = Boolean(park.pageUrl);
    const status = article.querySelector('[data-board-status]');
    if (status) {
      status.textContent = open ? 'Available' : 'In Progress';
      status.className = 'badge-entry-status ' + (open ? 'badge-entry-status--available' : 'badge-entry-status--pending');
    }
    article.classList.toggle('badge-entry--pending', !open);
    article.classList.toggle('badge-entry--available', open);
    const desc = article.querySelector('[data-board-desc]');
    if (desc && open && /in progress|still being|still taking shape/i.test(desc.textContent)) {
      desc.textContent = 'Open in the archive, with a finished park page ready to enter.';
    }
  });
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
