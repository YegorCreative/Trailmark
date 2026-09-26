/*
  atlas.js
  Shared navigation, the all-parks index, and the homepage open-park strip.
*/
(function trailmarkAtlas() {
  if (typeof PARKS === 'undefined') return;

  var LANDSCAPES = [
    ['mountain', 'Mountain'],
    ['desert', 'Desert'],
    ['canyon', 'Canyon'],
    ['coast/island', 'Coast / Island'],
    ['forest', 'Forest'],
    ['wetland', 'Wetland'],
    ['volcanic', 'Volcanic'],
    ['arctic', 'Arctic'],
    ['cave', 'Cave'],
  ];

  function base() {
    var explicit = document.documentElement.getAttribute('data-asset-base');
    if (explicit) return explicit;
    return /\/parks\//.test(location.pathname) ? '../' : '';
  }

  function esc(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function landscapeLabel(id) {
    var found = LANDSCAPES.filter(function (pair) { return pair[0] === id; })[0];
    return found ? found[1] : id;
  }

  function isOpen(park) {
    return Boolean(park.pageUrl);
  }

  function pageHref(park) {
    var root = base();
    if (!park.pageUrl) return '';
    if (root && park.pageUrl.indexOf('parks/') === 0) return root + park.pageUrl;
    if (!root && /\/parks\//.test(location.pathname)) return park.pageUrl.replace(/^parks\//, '');
    return root + park.pageUrl;
  }

  function statesOf(park) {
    return String(park.state || '').split(',').map(function (part) { return part.trim(); }).filter(Boolean);
  }

  function cardHtml(park, compact) {
    var open = isOpen(park);
    var photo = base() + park.art.header;
    var badge = base() + park.art.badge;
    var name = esc(park.name);
    var meta = esc(park.state) + ' · ' + esc(park.region);
    var flag = open ? '' : '<span class="atlas-card-flag">Coming soon</span>';
    var inner = '<img class="atlas-card-photo" src="' + esc(photo) + '" alt="" width="1672" height="941" />'
      + '<img class="atlas-card-badge" src="' + esc(badge) + '" alt="' + name + ' badge" width="600" height="600" />'
      + '<span class="atlas-card-shade" aria-hidden="true"></span>'
      + '<span class="atlas-card-copy"><span class="atlas-card-name">' + name + '</span>'
      + '<span class="atlas-card-meta">' + meta + '</span>' + flag + '</span>';
    var vt = open ? ' style="view-transition-name: park-' + esc(park.id) + '"' : '';
    if (!open) {
      return '<article class="atlas-card atlas-card--soon' + (compact ? ' atlas-card--strip' : '') + '">' + inner + '</article>';
    }
    return '<a class="atlas-card' + (compact ? ' atlas-card--strip' : '') + '" href="' + esc(pageHref(park)) + '"' + vt + '>' + inner + '</a>';
  }

  function initHeader() {
    var header = document.getElementById('site-header');
    if (!header || !document.getElementById('hero')) return;
    document.body.classList.add('has-hero');
    var ticking = false;
    function paint() {
      header.classList.toggle('is-solid', window.scrollY > 80);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(paint);
    }, { passive: true });
    paint();
  }

  function initNav() {
    var header = document.getElementById('site-header');
    var nav = document.getElementById('site-nav');
    if (!header || !nav) return;
    var root = base();
    var openCount = PARKS.filter(isOpen).length;

    if (!header.querySelector('.nav-toggle')) {
      var toggle = document.createElement('button');
      toggle.className = 'nav-toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', 'nav-overlay');
      toggle.innerHTML = '<span class="nav-toggle-bars" aria-hidden="true"></span><span class="nav-toggle-label">Menu</span>';
      header.querySelector('.header-inner').appendChild(toggle);
    }

    var parksLink = nav.querySelector('[data-nav="parks"]') || nav.querySelector('a[href*="parks.html"], a[href*="#park-grid"]');
    if (parksLink) {
      parksLink.setAttribute('href', root + 'parks.html');
      parksLink.setAttribute('data-nav', 'parks');
      if (!parksLink.parentElement.querySelector('.mega')) {
        var mega = document.createElement('div');
        mega.className = 'mega';
        mega.id = 'park-mega';
        parksLink.parentElement.classList.add('nav-item--parks');
        parksLink.parentElement.appendChild(mega);
      }
    }

    var path = location.pathname;
    var key = '';
    if (/\/parks\/|parks\.html$/.test(path)) key = 'parks';
    else if (/about\.html$/.test(path)) key = 'about';
    else if (/faq\.html$/.test(path)) key = 'faq';
    else if (/contact\.html$/.test(path)) key = 'contact';
    nav.querySelectorAll('[data-nav]').forEach(function (link) {
      var on = link.getAttribute('data-nav') === key;
      link.classList.toggle('nav-link--active', on);
      if (on) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    var byRegion = {};
    PARKS.forEach(function (park) {
      if (!byRegion[park.region]) byRegion[park.region] = [];
      byRegion[park.region].push(park);
    });
    var regionNames = Object.keys(byRegion).sort();

    function parkThumb(park) {
      return '<a class="mega-park" href="' + esc(pageHref(park)) + '">'
        + '<span class="mega-thumb"><img src="' + esc(base() + park.art.header) + '" alt="" /></span>'
        + '<img class="mega-badge" src="' + esc(base() + park.art.badge) + '" alt="" />'
        + '<span class="mega-park-name">' + esc(park.name) + '</span></a>';
    }

    function regionColumns(openOnly) {
      return regionNames.map(function (region) {
        var parks = byRegion[region].filter(function (park) { return openOnly ? isOpen(park) : true; });
        if (!parks.length) return '';
        parks.sort(function (a, b) { return a.name.localeCompare(b.name); });
        var items = parks.map(function (park) {
          if (isOpen(park)) return '<li>' + parkThumb(park) + '</li>';
          return '<li><span class="mega-soon">' + esc(park.name) + '<small>Coming soon</small></span></li>';
        }).join('');
        var regionHref = root + 'parks.html?region=' + encodeURIComponent(region);
        return '<section class="mega-col"><h3><a href="' + esc(regionHref) + '">' + esc(region) + '</a></h3><ul>' + items + '</ul></section>';
      }).join('');
    }

    var latest = PARKS.filter(isOpen).slice().sort(function (a, b) {
      return (b.archiveSeq || 0) - (a.archiveSeq || 0);
    })[0];
    var feature = latest
      ? '<a class="mega-feature" href="' + esc(pageHref(latest)) + '">'
        + '<img src="' + esc(base() + latest.art.header) + '" alt="" />'
        + '<span><small>Latest in the archive</small>' + esc(latest.name) + '</span></a>'
      : '';

    var megaEl = document.getElementById('park-mega');
    if (megaEl) {
      megaEl.innerHTML = '<div class="mega-layout"><div class="mega-grid">' + regionColumns(true) + '</div>' + feature + '</div>'
        + '<a class="mega-all" href="' + esc(root + 'parks.html') + '">See all 63 parks →</a>';
      if (location.hash === '#mega') megaEl.style.display = 'block';
    }

    var overlay = document.getElementById('nav-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'nav-overlay';
      overlay.className = 'nav-overlay';
      overlay.hidden = true;
      header.insertAdjacentElement('afterend', overlay);
    }
    var soonParks = PARKS.filter(function (park) { return !isOpen(park); }).sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
    var soonList = soonParks.map(function (park) {
      return '<li>' + esc(park.name) + '</li>';
    }).join('');
    overlay.innerHTML = '<div class="nav-overlay-panel" role="dialog" aria-modal="true" aria-label="Menu">'
      + '<div class="nav-overlay-bar"><a class="nav-overlay-brand" href="' + esc(root + 'index.html') + '">TrailMark</a>'
      + '<button type="button" class="nav-overlay-close">Close</button></div>'
      + '<nav class="nav-overlay-links" aria-label="Pages">'
      + '<a href="' + esc(root + 'parks.html') + '">All parks</a>'
      + '<a href="' + esc(root + 'about.html') + '">About</a>'
      + '<a href="' + esc(root + 'faq.html') + '">FAQ</a>'
      + '<a href="' + esc(root + 'contact.html') + '">Contact</a>'
      + '</nav>'
      + '<h2 class="nav-overlay-heading">Open parks</h2>'
      + '<p class="nav-overlay-count">' + openCount + ' of 63 open</p>'
      + '<div class="nav-overlay-regions">' + regionColumns(true) + '</div>'
      + '<button type="button" class="soon-toggle" aria-expanded="false" aria-controls="soon-list">Coming soon (' + soonParks.length + ')</button>'
      + '<ul id="soon-list" class="soon-list" hidden>' + soonList + '</ul>'
      + '</div>';

    var soonToggle = overlay.querySelector('.soon-toggle');
    var soonListEl = overlay.querySelector('.soon-list');
    if (soonToggle && soonListEl) {
      soonToggle.addEventListener('click', function () {
        var open = soonListEl.hidden;
        soonListEl.hidden = !open;
        soonToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var toggleBtn = header.querySelector('.nav-toggle');
    var closeBtn = overlay.querySelector('.nav-overlay-close');
    var lastFocus = null;

    function focusables() {
      return Array.prototype.slice.call(overlay.querySelectorAll('a, button')).filter(function (el) {
        return !el.hasAttribute('disabled');
      });
    }

    function closeMenu() {
      if (overlay.hidden) return;
      overlay.hidden = true;
      document.body.classList.remove('nav-lock');
      toggleBtn.setAttribute('aria-expanded', 'false');
      if (lastFocus) lastFocus.focus();
    }

    function openMenu() {
      lastFocus = document.activeElement;
      overlay.hidden = false;
      document.body.classList.add('nav-lock');
      toggleBtn.setAttribute('aria-expanded', 'true');
      closeBtn.focus();
    }

    toggleBtn.addEventListener('click', function () {
      if (overlay.hidden) openMenu();
      else closeMenu();
    });
    if (location.hash === '#menu') openMenu();
    closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) closeMenu();
    });
    document.addEventListener('keydown', function (event) {
      if (overlay.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== 'Tab') return;
      var nodes = focusables();
      if (!nodes.length) return;
      var first = nodes[0];
      var last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function initStrip() {
    var strip = document.querySelector('[data-park-strip]');
    if (!strip) return;
    var open = PARKS.filter(isOpen).slice().sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
    strip.innerHTML = open.map(function (park) { return cardHtml(park, true); }).join('');
    var scroller = strip;
    var prev = document.querySelector('[data-strip="prev"]');
    var next = document.querySelector('[data-strip="next"]');
    function step(dir) {
      var card = scroller.querySelector('.atlas-card');
      var amount = card ? card.getBoundingClientRect().width + 16 : scroller.clientWidth * 0.8;
      scroller.scrollBy({ left: dir * amount, behavior: 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    scroller.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
    });
    var startX = 0;
    var startScroll = 0;
    var dragging = false;
    var moved = false;
    scroller.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      dragging = true;
      moved = false;
      startX = event.clientX;
      startScroll = scroller.scrollLeft;
    });
    scroller.addEventListener('pointermove', function (event) {
      if (!dragging) return;
      var dx = event.clientX - startX;
      if (Math.abs(dx) > 6) moved = true;
      if (moved) scroller.scrollLeft = startScroll - dx;
    });
    function endDrag() { dragging = false; }
    scroller.addEventListener('pointerup', endDrag);
    scroller.addEventListener('pointercancel', endDrag);
    scroller.addEventListener('click', function (event) {
      if (!moved) return;
      event.preventDefault();
      event.stopPropagation();
      moved = false;
    }, true);

    var reps = {
      mountain: 'glacier',
      desert: 'death-valley',
      canyon: 'grand-canyon',
      'coast/island': 'acadia',
      forest: 'olympic',
      wetland: 'everglades',
      volcanic: 'yellowstone',
      arctic: 'gates-of-the-arctic',
      cave: 'carlsbad-caverns',
    };
    var tiles = document.querySelector('[data-landscape-tiles]');
    if (tiles) {
      tiles.innerHTML = LANDSCAPES.map(function (pair) {
        var rep = PARKS.find(function (park) { return park.id === reps[pair[0]]; }) || PARKS[0];
        var openN = PARKS.filter(function (park) { return park.landscape === pair[0] && isOpen(park); }).length;
        return '<a class="landscape-tile" href="' + esc(base() + 'parks.html?landscape=' + encodeURIComponent(pair[0])) + '">'
          + '<img src="' + esc(base() + rep.art.header) + '" alt="" />'
          + '<span><strong>' + esc(pair[1]) + '</strong><small>' + openN + ' open</small></span></a>';
      }).join('');
    }

    var picksHost = document.querySelector('[data-next-picks]');
    var bandArt = document.querySelector('.next-band-art');
    if (picksHost) {
      var pool = PARKS.filter(isOpen).slice();
      for (var i = pool.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var swap = pool[i];
        pool[i] = pool[j];
        pool[j] = swap;
      }
      var picks = pool.slice(0, 3);
      if (bandArt && picks[0]) bandArt.src = base() + picks[0].art.header;
      picksHost.innerHTML = picks.map(function (park) { return cardHtml(park, false); }).join('');
    }
  }

  function initIndex() {
    var grid = document.querySelector('[data-park-index]');
    if (!grid) return;
    var regionSelect = document.getElementById('filter-region');
    var stateSelect = document.getElementById('filter-state');
    var landscapeSelect = document.getElementById('filter-landscape');
    var statusSelect = document.getElementById('filter-status');
    var sortSelect = document.getElementById('filter-sort');
    var search = document.getElementById('park-search');
    var count = document.querySelector('[data-index-count]');
    var shown = document.querySelector('[data-index-shown]');

    var regions = [];
    var states = [];
    PARKS.forEach(function (park) {
      if (regions.indexOf(park.region) === -1) regions.push(park.region);
      statesOf(park).forEach(function (state) {
        if (states.indexOf(state) === -1) states.push(state);
      });
    });
    regions.sort();
    states.sort();
    regionSelect.innerHTML = '<option value="">All regions</option>' + regions.map(function (region) {
      return '<option value="' + esc(region) + '">' + esc(region) + '</option>';
    }).join('');
    stateSelect.innerHTML = '<option value="">All states</option>' + states.map(function (state) {
      return '<option value="' + esc(state) + '">' + esc(state) + '</option>';
    }).join('');
    landscapeSelect.innerHTML = '<option value="">All landscapes</option>' + LANDSCAPES.map(function (pair) {
      return '<option value="' + esc(pair[0]) + '">' + esc(pair[1]) + '</option>';
    }).join('');

    var openCount = PARKS.filter(isOpen).length;
    if (count) count.textContent = openCount + ' of 63 open';

    function read() {
      var params = new URLSearchParams(location.search);
      regionSelect.value = params.get('region') || '';
      stateSelect.value = params.get('state') || '';
      landscapeSelect.value = params.get('landscape') || '';
      statusSelect.value = params.get('status') || '';
      sortSelect.value = params.get('sort') || 'az';
      search.value = params.get('q') || '';
    }

    function write() {
      var params = new URLSearchParams();
      if (regionSelect.value) params.set('region', regionSelect.value);
      if (stateSelect.value) params.set('state', stateSelect.value);
      if (landscapeSelect.value) params.set('landscape', landscapeSelect.value);
      if (statusSelect.value) params.set('status', statusSelect.value);
      if (sortSelect.value && sortSelect.value !== 'az') params.set('sort', sortSelect.value);
      if (search.value.trim()) params.set('q', search.value.trim());
      var next = params.toString();
      var url = location.pathname + (next ? '?' + next : '') + location.hash;
      if (url !== location.pathname + location.search + location.hash) {
        history.replaceState(null, '', url);
      }
    }

    function render() {
      var q = search.value.trim().toLowerCase();
      var list = PARKS.filter(function (park) {
        if (regionSelect.value && park.region !== regionSelect.value) return false;
        if (stateSelect.value && statesOf(park).indexOf(stateSelect.value) === -1) return false;
        if (landscapeSelect.value && park.landscape !== landscapeSelect.value) return false;
        if (statusSelect.value === 'open' && !isOpen(park)) return false;
        if (statusSelect.value === 'soon' && isOpen(park)) return false;
        if (q) {
          var hay = (park.name + ' ' + park.state + ' ' + park.region + ' ' + (park.landscape || '')).toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });
      var sort = sortSelect.value || 'az';
      list.sort(function (a, b) {
        if (sort === 'region') {
          var region = a.region.localeCompare(b.region);
          return region || a.name.localeCompare(b.name);
        }
        if (sort === 'newest') {
          var aSeq = a.archiveSeq || 0;
          var bSeq = b.archiveSeq || 0;
          if (aSeq !== bSeq) return bSeq - aSeq;
          return a.name.localeCompare(b.name);
        }
        return a.name.localeCompare(b.name);
      });
      grid.innerHTML = list.length
        ? list.map(function (park) { return cardHtml(park, false); }).join('')
        : '<p class="search-empty">No parks match those filters.</p>';
      if (shown) {
        shown.textContent = list.length === PARKS.length ? '' : 'Showing ' + list.length;
      }
    }

    function paintPills(kind, select, pairs) {
      var row = document.querySelector('[data-pills="' + kind + '"]');
      if (!row) return;
      row.innerHTML = pairs.map(function (pair) {
        var on = select.value === pair[0];
        return '<button type="button" class="filter-pill' + (on ? ' is-on' : '') + '" data-value="' + esc(pair[0]) + '">' + esc(pair[1]) + '</button>';
      }).join('');
      row.querySelectorAll('button').forEach(function (button) {
        button.addEventListener('click', function () {
          select.value = button.getAttribute('data-value');
          onChange();
        });
      });
    }

    function paintChips() {
      var host = document.querySelector('[data-filter-chips]');
      if (!host) return;
      var chips = [];
      function add(select, label) {
        if (!select.value) return;
        var text = select.options[select.selectedIndex] ? select.options[select.selectedIndex].text : select.value;
        chips.push('<button type="button" class="filter-chip" data-chip="' + select.id + '">' + esc(label ? text : text) + ' <span aria-hidden="true">×</span></button>');
      }
      add(regionSelect);
      add(stateSelect);
      add(landscapeSelect);
      if (statusSelect.value) add(statusSelect);
      if (sortSelect.value && sortSelect.value !== 'az') add(sortSelect);
      if (search.value.trim()) {
        chips.push('<button type="button" class="filter-chip" data-chip="park-search">' + esc(search.value.trim()) + ' <span aria-hidden="true">×</span></button>');
      }
      host.innerHTML = chips.join('');
      host.querySelectorAll('.filter-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
          var id = chip.getAttribute('data-chip');
          if (id === 'park-search') search.value = '';
          else {
            var el = document.getElementById(id);
            if (el) el.value = id === 'filter-sort' ? 'az' : '';
          }
          onChange();
        });
      });
    }

    function onChange() {
      write();
      render();
      paintPills('region', regionSelect, [['', 'All regions']].concat(regions.map(function (region) { return [region, region]; })));
      paintPills('landscape', landscapeSelect, [['', 'All landscapes']].concat(LANDSCAPES));
      paintChips();
    }
    [regionSelect, stateSelect, landscapeSelect, statusSelect, sortSelect].forEach(function (el) {
      el.addEventListener('change', onChange);
    });
    search.addEventListener('input', onChange);
    var form = document.querySelector('.atlas-filters');
    if (form) form.addEventListener('submit', function (event) { event.preventDefault(); onChange(); });
    window.addEventListener('popstate', function () {
      read();
      onChange();
    });
    var launch = document.querySelector('.filter-launch');
    var sheet = document.getElementById('filter-sheet');
    var done = document.querySelector('.filter-done');
    function setSheet(open) {
      if (!sheet || !launch) return;
      sheet.classList.toggle('is-open', open);
      launch.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('sheet-lock', open);
    }
    if (launch) launch.addEventListener('click', function () { setSheet(!sheet.classList.contains('is-open')); });
    if (done) done.addEventListener('click', function () { setSheet(false); });
    if (location.hash === '#filters') setSheet(true);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && sheet && sheet.classList.contains('is-open')) setSheet(false);
    });
    read();
    onChange();
  }

  function initBadgeWall() {
    var wall = document.querySelector('[data-badge-wall]');
    if (!wall) return;
    var coarse = window.matchMedia('(pointer: coarse)').matches;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    wall.innerHTML = PARKS.map(function (park) {
      var open = isOpen(park);
      var tag = open ? 'a' : 'div';
      var href = open ? ' href="' + esc(pageHref(park)) + '"' : '';
      return '<' + tag + ' class="badge-wall-item' + (open ? '' : ' is-soon') + '"' + href + '>'
        + '<img src="' + esc(base() + park.art.badge) + '" alt="' + esc(park.name) + ' badge" width="600" height="600" />'
        + '<span class="badge-wall-name">' + esc(park.name) + '</span>'
        + '</' + tag + '>';
    }).join('');
    if (coarse || reduce) return;
    wall.querySelectorAll('.badge-wall-item').forEach(function (item) {
      item.addEventListener('pointermove', function (event) {
        var rect = item.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - 0.5;
        var y = (event.clientY - rect.top) / rect.height - 0.5;
        item.style.transform = 'rotateY(' + (x * 10).toFixed(2) + 'deg) rotateX(' + (-y * 8).toFixed(2) + 'deg)';
      });
      item.addEventListener('pointerleave', function () {
        item.style.transform = '';
      });
    });
  }

  function initFooter() {
    var footer = document.getElementById('site-footer');
    if (!footer) return;
    var root = base();
    var open = PARKS.filter(isOpen);
    var byRegion = {};
    open.forEach(function (park) {
      if (!byRegion[park.region]) byRegion[park.region] = [];
      byRegion[park.region].push(park);
    });
    var cols = Object.keys(byRegion).sort().map(function (region) {
      var links = byRegion[region].sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (park) {
        return '<li><a href="' + esc(pageHref(park)) + '">' + esc(park.name) + '</a></li>';
      }).join('');
      return '<div><h3><a href="' + esc(root + 'parks.html?region=' + encodeURIComponent(region)) + '">' + esc(region) + '</a></h3><ul>' + links + '</ul></div>';
    }).join('');
    var badges = open.slice().sort(function (a, b) {
      return (b.archiveSeq || 0) - (a.archiveSeq || 0);
    }).slice(0, 6).map(function (park) {
      return '<a href="' + esc(pageHref(park)) + '" title="' + esc(park.name) + '"><img src="' + esc(base() + park.art.badge) + '" alt="' + esc(park.name) + ' badge" /></a>';
    }).join('');
    var texture = base() + 'assets/park-art/yosemite/header.webp';
    footer.className = 'atlas-footer';
    footer.innerHTML = '<div class="atlas-footer-texture" style="background-image:url(' + esc(texture) + ')" aria-hidden="true"></div>'
      + '<div class="atlas-footer-inner">'
      + '<div class="atlas-footer-brand"><p class="atlas-footer-name">TrailMark</p>'
      + '<p>An illustrated archive of the 63 U.S. national parks, built one park at a time.</p>'
      + '<div class="atlas-footer-badges">' + badges + '</div></div>'
      + '<div class="atlas-footer-regions">' + cols + '</div>'
      + '<nav class="atlas-footer-pages" aria-label="Footer">'
      + '<a href="' + esc(root + 'about.html') + '">About</a>'
      + '<a href="' + esc(root + 'faq.html') + '">FAQ</a>'
      + '<a href="' + esc(root + 'contact.html') + '">Contact</a>'
      + '<a href="' + esc(root + 'parks.html') + '">All parks</a>'
      + '</nav>'
      + '<p class="atlas-footer-copy">© 2026 TrailMark</p>'
      + '</div>';
  }

  initHeader();
  initNav();
  initStrip();
  initIndex();
  initBadgeWall();
  initFooter();
}());
