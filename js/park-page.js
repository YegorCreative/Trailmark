/*
  park-page.js
  Renders the Version 1 TrailMark park page template from PARK_PAGE_CONTENT.
*/

(function renderParkPage() {
  const mount = document.getElementById('park-page');
  if (!mount || typeof PARK_PAGE_CONTENT === 'undefined') return;

  const parkId = mount.dataset.parkId || 'yosemite';
  const park = PARK_PAGE_CONTENT[parkId];
  const parkCard = typeof PARKS !== 'undefined'
    ? PARKS.find(function (entry) { return entry.id === parkId; })
    : null;

  if (!park) {
    mount.innerHTML = '<section class="park-section"><div class="section-inner"><p class="search-empty">Park content is not available yet.</p></div></section>';
    return;
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

  function renderBadgeImage(label, extraClass) {
    const art = parkCard && parkCard.art && parkCard.art.badge;
    const className = 'park-badge-img' + (extraClass ? ' ' + extraClass : '');
    if (art) {
      return '<img class="' + className + '" src="' + escapeHtml(assetUrl(art)) + '" alt="' + escapeHtml(label) + '" width="600" height="600" />';
    }
    if (!parkCard) return '';
    return '<svg class="park-badge' + (extraClass ? ' ' + extraClass : '') + '" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + escapeHtml(label) + '">'
      + parkCard.svgInner
      + '</svg>';
  }

  function renderParagraphs(paragraphs) {
    return paragraphs.map(function (text) {
      return '<p>' + escapeHtml(text) + '</p>';
    }).join('');
  }

  function sectionHeading(section, headingId, align) {
    const centeredClass = align === 'center' ? ' park-section-heading--centered' : '';
    const leftClass = align === 'center' ? '' : ' section-title--left';
    return '<div class="park-section-heading' + centeredClass + '">'
      + '<p class="section-kicker">' + escapeHtml(section.kicker) + '</p>'
      + '<h2 class="section-title' + leftClass + '" id="' + headingId + '">' + escapeHtml(section.title) + '</h2>'
      + '</div>';
  }

  function heroVars() {
    const colors = (park.palette && park.palette.hero) || [];
    const focus = (park.hero && park.hero.focus) || (parkCard && parkCard.heroFocus) || '50% 58%';
    const parts = ['--hero-focus:' + focus];
    colors.forEach(function (color, index) {
      parts.push('--hero-' + index + ':' + color);
    });
    return parts.join(';');
  }

  function renderHero() {
    const themeClass = park.hero.theme ? ' hero--' + escapeHtml(park.hero.theme) : '';
    const poster = (parkCard && parkCard.art && parkCard.art.header) || park.hero.posterSrc;
    const posterHidden = park.hero.posterAlt ? '' : ' aria-hidden="true"';

    return '<section id="hero" class="hero--park' + themeClass + '" style="' + heroVars() + '" aria-labelledby="park-hero-title">'
      + '<div class="park-poster" data-pin-bottom data-speed="0.16" data-scale="1.08"' + posterHidden + '>'
      + '<img src="' + escapeHtml(assetUrl(poster)) + '" alt="' + escapeHtml(park.hero.posterAlt || '') + '" class="park-poster-art" width="1672" height="941" fetchpriority="high" style="view-transition-name: park-' + escapeHtml(parkId) + '" />'
      + '</div>'
      + '<div class="hero-grain" aria-hidden="true"></div>'
      + '<div class="hero-inner" data-parallax="fade">'
      + '<p class="hero-kicker">' + escapeHtml(park.hero.kicker) + '</p>'
      + '<p class="hero-eyebrow">' + escapeHtml(park.hero.eyebrow) + '</p>'
      + '<h1 class="hero-title" id="park-hero-title">' + escapeHtml(park.hero.title) + '</h1>'
      + '<p class="hero-subtitle">' + escapeHtml(park.hero.subtitle) + '</p>'
      + '<div class="hero-ledger" aria-label="Archive metadata">'
      + '<p><span>Archive No.</span> ' + escapeHtml(park.archiveNumber) + '</p>'
      + '<p><span>National Park since</span> ' + escapeHtml(park.established) + '</p>'
      + '<p><span>Collection</span> ' + escapeHtml(park.collection) + '</p>'
      + '</div>'
      + '</div>'
      + '</section>';
  }

  function renderOverview() {
    const facts = park.overview.facts.map(function (fact) {
      return '<p><span>' + escapeHtml(fact.label) + '</span>' + escapeHtml(fact.value) + '</p>';
    }).join('');

    return '<section id="park-overview" class="park-section park-section--overview" aria-labelledby="park-overview-title">'
      + '<div class="section-inner park-intro-inner">'
      + sectionHeading(park.overview, 'park-overview-title')
      + '<div class="valley-layout">'
      + '<div class="valley-copy">'
      + '<p class="valley-lead">' + escapeHtml(park.overview.lead) + '</p>'
      + renderParagraphs(park.overview.body)
      + '</div>'
      + '<aside class="valley-ledger" aria-label="' + escapeHtml(park.name) + ' field details">' + facts + '</aside>'
      + '</div>'
      + '</div>'
      + '</section>';
  }

  function renderEmotionalThesis() {
    return '<section id="park-thesis" class="park-section park-section--thesis" aria-labelledby="park-thesis-title">'
      + '<div class="section-inner editorial-narrow">'
      + sectionHeading(park.emotionalThesis, 'park-thesis-title')
      + '<div class="editorial-copy editorial-copy--large">'
      + renderParagraphs(park.emotionalThesis.body)
      + '</div>'
      + '</div>'
      + '</section>';
  }

  function renderHighlights() {
    const cards = park.landscapeHighlights.items.map(function (item, index) {
      const number = String(index + 1).padStart(2, '0');
      const wash = item.wash ? ' style="background:' + item.wash + '"' : '';
      return '<article class="highlight-card highlight-card--' + escapeHtml(item.modifier || 'plain') + '"' + wash + '>'
        + '<p class="highlight-index">' + number + '</p>'
        + '<h3 class="highlight-title">' + escapeHtml(item.title) + '</h3>'
        + '<p class="highlight-desc">' + escapeHtml(item.body) + '</p>'
        + '</article>';
    }).join('');

    return '<section id="park-highlights" class="park-section park-section--highlights" aria-labelledby="park-highlights-title">'
      + '<div class="section-inner">'
      + sectionHeading(park.landscapeHighlights, 'park-highlights-title', 'center')
      + '<div class="highlights-grid">' + cards + '</div>'
      + '</div>'
      + '</section>';
  }

  function renderDiscoverySection(key, id, cardClass) {
    const section = park[key];
    const cards = section.items.map(function (item) {
      return '<article class="' + cardClass + '">'
        + '<h3>' + escapeHtml(item.title) + '</h3>'
        + '<p>' + escapeHtml(item.body) + '</p>'
        + '</article>';
    }).join('');

    return '<section id="' + id + '" class="park-section park-section--discovery" aria-labelledby="' + id + '-title">'
      + '<div class="section-inner">'
      + sectionHeading(section, id + '-title', 'center')
      + '<div class="discovery-grid">' + cards + '</div>'
      + '</div>'
      + '</section>';
  }

  function renderExtraFigure() {
    const extra = park.extraIllustration;
    const src = parkCard && parkCard.art && parkCard.art.extra;
    if (!extra || !src) return '';
    const alt = extra.alt || '';
    return '<figure class="park-extra" data-speed="0.06">'
      + '<img src="' + escapeHtml(assetUrl(src)) + '" alt="' + escapeHtml(alt) + '"'
      + (alt ? '' : ' aria-hidden="true"')
      + ' width="600" height="600" loading="lazy" />'
      + (extra.caption ? '<figcaption>' + escapeHtml(extra.caption) + '</figcaption>' : '')
      + '</figure>';
  }

  function renderKnowledgeSection(key, id) {
    const section = park[key];
    const notes = section.notes.map(function (note) {
      return '<li>' + escapeHtml(note) + '</li>';
    }).join('');
    const extra = key === 'wildlife' ? renderExtraFigure() : '';

    return '<section id="' + id + '" class="park-section park-section--knowledge" aria-labelledby="' + id + '-title">'
      + '<div class="section-inner knowledge-layout' + (extra ? ' knowledge-layout--with-extra' : '') + '">'
      + '<div>'
      + sectionHeading(section, id + '-title')
      + '<p class="knowledge-lead">' + escapeHtml(section.lead) + '</p>'
      + '</div>'
      + extra
      + '<ul class="knowledge-list">' + notes + '</ul>'
      + '</div>'
      + '</section>';
  }

  function renderSeasons() {
    const cards = park.seasons.items.map(function (season) {
      const wash = season.wash ? ' style="background:' + season.wash + '"' : '';
      return '<article class="season-card season-card--' + escapeHtml(season.modifier || 'plain') + '"' + wash + '>'
        + '<p class="season-name">' + escapeHtml(season.name) + '</p>'
        + '<p class="season-desc">' + escapeHtml(season.body) + '</p>'
        + '</article>';
    }).join('');

    return '<section id="park-seasons" class="park-section park-section--seasons" aria-labelledby="park-seasons-title">'
      + '<div class="section-inner">'
      + sectionHeading(park.seasons, 'park-seasons-title')
      + '<div class="season-grid">' + cards + '</div>'
      + '</div>'
      + '</section>';
  }

  function renderPhotography() {
    const tips = park.photography.tips.map(function (tip) {
      return '<article class="photo-tip">'
        + '<p class="photo-tip-label">' + escapeHtml(tip.label) + '</p>'
        + '<p>' + escapeHtml(tip.body) + '</p>'
        + '</article>';
    }).join('');

    return '<section id="park-photography" class="park-section park-section--photography" aria-labelledby="park-photography-title">'
      + '<div class="section-inner photography-layout">'
      + '<div>'
      + sectionHeading(park.photography, 'park-photography-title')
      + '<p class="knowledge-lead">' + escapeHtml(park.photography.lead) + '</p>'
      + '</div>'
      + '<div class="photo-tips">' + tips + '</div>'
      + '</div>'
      + '</section>';
  }

  function renderFieldNotes() {
    return '<section class="park-section park-section--field-notes" aria-labelledby="field-notes-title">'
      + '<div class="section-inner">'
      + '<div class="field-notes-block">'
      + '<p class="section-kicker">Field Notes</p>'
      + '<h2 class="visually-hidden" id="field-notes-title">Field Notes</h2>'
      + '<blockquote class="field-note-quote"><p>' + escapeHtml(park.fieldNotes.quote) + '</p></blockquote>'
      + '<p class="field-note-attribution">' + escapeHtml(park.fieldNotes.attribution) + '</p>'
      + '</div>'
      + '</div>'
      + '</section>';
  }

  function renderBadge() {
    if (!parkCard) return '';

    const details = park.badgeStory.details.map(function (detail) {
      return '<p><span>' + escapeHtml(detail.label) + '</span>' + escapeHtml(detail.value) + '</p>';
    }).join('');

    const notes = park.badgeStory.notes.map(function (note) {
      return '<p>' + escapeHtml(note) + '</p>';
    }).join('');

    return '<section class="park-section park-section--badge" aria-labelledby="badge-showcase-title">'
      + '<div class="section-inner badge-showcase-layout">'
      + '<div class="badge-showcase-frame">'
      + '<div class="badge-showcase-plaque">'
      + '<p class="badge-plaque-label">' + escapeHtml(park.badgeStory.label) + '</p>'
      + '<div class="badge-plaque-badge-wrap badge-tilt">'
      + renderBadgeImage(park.fullName + ' badge', 'park-badge--hero')
      + '</div>'
      + '<div class="badge-plaque-footer" aria-label="Artifact details">' + details + '</div>'
      + '</div>'
      + '</div>'
      + '<div class="badge-showcase-copy">'
      + '<p class="section-kicker">' + escapeHtml(park.badgeStory.kicker) + '</p>'
      + '<h2 class="section-title section-title--left" id="badge-showcase-title">' + escapeHtml(park.badgeStory.title) + '</h2>'
      + '<p class="badge-showcase-desc">' + escapeHtml(park.badgeStory.description) + '</p>'
      + '<div class="badge-showcase-notes" aria-label="Archival note details">' + notes + '</div>'
      + '</div>'
      + '</div>'
      + '</section>';
  }

  function renderStewardship() {
    const items = park.stewardship.items.map(function (item) {
      return '<li>' + escapeHtml(item) + '</li>';
    }).join('');

    return '<section id="park-stewardship" class="park-section park-section--stewardship" aria-labelledby="park-stewardship-title">'
      + '<div class="section-inner stewardship-panel">'
      + sectionHeading(park.stewardship, 'park-stewardship-title')
      + '<p class="knowledge-lead">' + escapeHtml(park.stewardship.lead) + '</p>'
      + '<ul class="stewardship-list">' + items + '</ul>'
      + '</div>'
      + '</section>';
  }

  function renderArchive() {
    const links = park.archive.links.map(function (link) {
      return '<a href="' + escapeHtml(link.href) + '" class="archive-link">'
        + '<span class="archive-link-label">' + escapeHtml(link.label) + '</span>'
        + '<span class="archive-link-status">' + escapeHtml(link.status) + '</span>'
        + '</a>';
    }).join('');

    return '<section class="park-section park-section--archive" aria-labelledby="archive-title">'
      + '<div class="section-inner archive-layout">'
      + '<div class="archive-copy">'
      + '<p class="section-kicker">' + escapeHtml(park.archive.kicker) + '</p>'
      + '<h2 class="section-title section-title--left" id="archive-title">' + escapeHtml(park.archive.title) + '</h2>'
      + '<p class="archive-desc">' + escapeHtml(park.archive.body) + '</p>'
      + '</div>'
      + '<div class="archive-links" aria-label="Upcoming park chapters">' + links + '</div>'
      + '</div>'
      + '</section>';
  }

  function imageBreak(position) {
    const poster = (parkCard && parkCard.art && parkCard.art.header) || park.hero.posterSrc;
    return '<div class="park-break" aria-hidden="true"><img src="' + escapeHtml(assetUrl(poster)) + '" alt="" width="1672" height="941" style="object-position:' + position + '" data-pin-bottom data-speed="0.08" data-scale="1.05" /></div>';
  }

  function renderChapters() {
    const items = [
      ['park-overview', 'Overview'],
      ['park-highlights', 'Landscape'],
      ['park-wildlife', 'Wildlife'],
      ['park-geology', 'Geology'],
      ['park-seasons', 'Seasons'],
      ['park-photography', 'Photography'],
      ['park-stewardship', 'Stewardship'],
    ];
    return '<nav class="chapter-nav" aria-label="Chapters"><div class="chapter-progress" aria-hidden="true"><span></span></div><div class="chapter-nav-scroller">'
      + items.map(function (item) {
        return '<a href="#' + item[0] + '">' + escapeHtml(item[1]) + '</a>';
      }).join('')
      + '</div></nav>';
  }

  function renderNeighbors() {
    if (!parkCard || typeof PARKS === 'undefined') return '';
    const open = PARKS.filter(function (entry) { return entry.pageUrl; }).sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
    const index = open.findIndex(function (entry) { return entry.id === parkId; });
    if (index < 0) return '';
    const prev = open[(index - 1 + open.length) % open.length];
    const next = open[(index + 1) % open.length];
    const related = open.filter(function (entry) {
      return entry.id !== parkId && entry.id !== prev.id && entry.id !== next.id && entry.landscape && entry.landscape === parkCard.landscape;
    }).slice(0, 3);
    while (related.length < 3) {
      const filler = open.find(function (entry) {
        return entry.id !== parkId && related.indexOf(entry) === -1 && entry.id !== prev.id && entry.id !== next.id;
      });
      if (!filler) break;
      related.push(filler);
    }
    function neighborCard(entry, label) {
      return '<a class="neighbor-card" href="' + escapeHtml(entry.id) + '.html" style="view-transition-name: park-' + escapeHtml(entry.id) + '">'
        + '<img src="' + escapeHtml(assetUrl(entry.art.header)) + '" alt="" />'
        + '<span><small>' + escapeHtml(label) + '</small>' + escapeHtml(entry.name) + '</span></a>';
    }
    const kind = parkCard.landscape ? parkCard.landscape.replace('coast/island', 'coast and island') : 'open';
    const relatedHtml = related.map(function (entry) {
      return neighborCard(entry, landscapeWord(entry));
    }).join('');
    return '<section class="park-section park-neighbors" aria-labelledby="neighbors-title">'
      + '<div class="section-inner">'
      + '<h2 id="neighbors-title" class="section-title section-title--left">Continue through the archive</h2>'
      + '<div class="neighbor-grid">' + neighborCard(prev, 'Previous') + neighborCard(next, 'Next') + '</div>'
      + '<h3 class="neighbor-sub">More ' + escapeHtml(kind) + ' parks</h3>'
      + '<div class="neighbor-grid neighbor-grid--related">' + relatedHtml + '</div>'
      + '</div></section>';
  }

  function landscapeWord(entry) {
    return entry.landscape || entry.region;
  }

  function renderCrumb() {
    const crumb = document.querySelector('.park-back');
    if (!crumb || !parkCard) return;
    const region = parkCard.region || park.region;
    crumb.setAttribute('aria-label', 'Breadcrumb');
    crumb.innerHTML = '<ol class="park-crumb-list">'
      + '<li><a href="../index.html">Home</a></li>'
      + '<li><a href="../parks.html">Parks</a></li>'
      + '<li><a href="../parks.html?region=' + encodeURIComponent(region) + '">' + escapeHtml(region) + '</a></li>'
      + '<li aria-current="page">' + escapeHtml(park.name) + '</li>'
      + '</ol>';
  }

  function initChapters() {
    const nav = document.querySelector('.chapter-nav');
    if (!nav) return;
    const links = Array.prototype.slice.call(nav.querySelectorAll('a'));
    const bar = nav.querySelector('.chapter-progress span');
    const sections = links.map(function (link) {
      return document.querySelector(link.getAttribute('href'));
    }).filter(Boolean);
    function mark() {
      const line = window.scrollY + 120;
      let current = sections[0];
      sections.forEach(function (section) {
        if (section.offsetTop <= line) current = section;
      });
      links.forEach(function (link) {
        const on = current && link.getAttribute('href') === '#' + current.id;
        link.classList.toggle('is-current', on);
        if (on) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
      if (bar) {
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const progress = height > 0 ? Math.min(1, window.scrollY / height) : 0;
        bar.style.transform = 'scaleX(' + progress.toFixed(4) + ')';
      }
    }
    let ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        mark();
        ticking = false;
      });
    }, { passive: true });
    mark();
  }

  function initTilt() {
    if (window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return;
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

  renderCrumb();
  mount.innerHTML = [
    renderHero(),
    renderChapters(),
    renderOverview(),
    imageBreak('center bottom'),
    renderEmotionalThesis(),
    renderHighlights(),
    renderDiscoverySection('hiddenDiscoveries', 'park-hidden-discoveries', 'discovery-card'),
    imageBreak('50% 40%'),
    renderKnowledgeSection('wildlife', 'park-wildlife'),
    renderKnowledgeSection('geology', 'park-geology'),
    imageBreak('center 70%'),
    renderSeasons(),
    renderPhotography(),
    renderFieldNotes(),
    renderBadge(),
    renderStewardship(),
    renderArchive(),
    renderNeighbors(),
  ].join('');
  initChapters();
  initTilt();
  if (window.__tmObserve) window.__tmObserve(mount);
}());
