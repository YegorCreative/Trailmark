/*
  park-render.js
  Shared park-article HTML for the browser and scripts/build-park-pages.js.
*/
(function (root) {
  function trailmarkRenderPark(park, parkCard, options) {
    options = options || {};
    var catalog = options.parks || (typeof root.PARKS !== 'undefined' ? root.PARKS : []);
    var assetBase = options.assetBase;
    if (assetBase == null) {
      assetBase = (typeof document !== 'undefined' && document.documentElement.getAttribute('data-asset-base')) || '';
    }
    var parkId = (parkCard && parkCard.id) || park.id;
    var visitorPhotos = options.photos || [];

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
    return assetBase + path;
  }

  function renderBadgeImage(label, extraClass) {
    const art = parkCard && parkCard.art && parkCard.art.badge;
    const className = 'park-badge-img' + (extraClass ? ' ' + extraClass : '');
    if (art) {
      var small = assetUrl(art).replace(/badge\.webp$/, 'badge-160.webp');
      var mid = assetUrl(art).replace(/badge\.webp$/, 'badge-320.webp');
      var large = assetUrl(art).replace(/badge\.webp$/, 'badge-640.webp');
      return '<img class="' + className + '" src="' + escapeHtml(mid) + '" srcset="' + escapeHtml(small) + ' 160w, ' + escapeHtml(mid) + ' 320w, ' + escapeHtml(large) + ' 640w" sizes="(max-width: 700px) 160px, 256px" alt="' + escapeHtml(label) + '" width="320" height="320" loading="lazy" decoding="async" />';
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

    const region = (parkCard && parkCard.region) || park.region || '';
    const crumb = '<nav class="hero-crumb" aria-label="Breadcrumb"><ol>'
      + '<li><a href="../index.html">Home</a></li>'
      + '<li><a href="../parks.html">Parks</a></li>'
      + '<li><a href="../parks.html?region=' + encodeURIComponent(region) + '">' + escapeHtml(region) + '</a></li>'
      + '<li aria-current="page">' + escapeHtml(park.name) + '</li>'
      + '</ol></nav>';

    return '<section id="hero" class="hero--park' + themeClass + '" style="' + heroVars() + '" aria-labelledby="park-hero-title">'
      + crumb
      + '<div class="park-poster" data-hero-parallax' + posterHidden + '>'
      + '<img src="' + escapeHtml(assetUrl(poster).replace(/header\.webp$/, 'header-1280.webp')) + '" srcset="'
      + escapeHtml(assetUrl(poster).replace(/header\.webp$/, 'header-640.webp')) + ' 640w, '
      + escapeHtml(assetUrl(poster).replace(/header\.webp$/, 'header-1280.webp')) + ' 1280w, '
      + escapeHtml(assetUrl(poster).replace(/header\.webp$/, 'header-1920.webp')) + ' 1920w, '
      + escapeHtml(assetUrl(poster).replace(/header\.webp$/, 'header-2560.webp')) + ' 2560w" sizes="100vw" alt="' + escapeHtml(park.hero.posterAlt || '') + '" class="park-poster-art" width="1672" height="941" fetchpriority="high" style="view-transition-name: park-' + escapeHtml(parkId) + '" />'
      + '</div>'
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

  function channelLinear(value) {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function hexChannels(hex) {
    const raw = String(hex || '').replace('#', '');
    const full = raw.length === 3 ? raw.replace(/./g, function (ch) { return ch + ch; }) : raw;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  }

  function relativeLuminance(hex) {
    const rgb = hexChannels(hex);
    return 0.2126 * channelLinear(rgb[0]) + 0.7152 * channelLinear(rgb[1]) + 0.0722 * channelLinear(rgb[2]);
  }

  function contrastRatio(foreground, background) {
    const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
    const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
    return (lighter + 0.05) / (darker + 0.05);
  }

  function mixHex(from, to, amount) {
    const a = hexChannels(from);
    const b = hexChannels(to);
    const mixed = a.map(function (channel, index) {
      return Math.round(channel + (b[index] - channel) * amount);
    });
    return '#' + mixed.map(function (channel) {
      return channel.toString(16).padStart(2, '0');
    }).join('');
  }

  function badgeInk(background) {
    const options = ['#142016', '#f7f3ec', '#000000', '#ffffff'];
    let ink = options[0];
    let best = 0;
    options.forEach(function (candidate) {
      const ratio = contrastRatio(candidate, background);
      if (ratio > best) {
        best = ratio;
        ink = candidate;
      }
    });
    let muted = ink;
    for (let amount = 0.42; amount >= 0; amount -= 0.03) {
      const candidate = mixHex(ink, background, amount);
      if (contrastRatio(candidate, background) >= 4.6) {
        muted = candidate;
        break;
      }
    }
    return { ink: ink, muted: muted };
  }

  function paletteColor(index) {
    const colors = (park.palette && park.palette.hero) || ['#243224', '#6a3418', '#1d3d4a', '#8a5a32', '#3a3028'];
    return colors[index % colors.length];
  }

  function renderHighlights() {
    const cards = park.landscapeHighlights.items.map(function (item, index) {
      const number = String(index + 1).padStart(2, '0');
      return '<article class="highlight-card highlight-card--solid" style="background:' + paletteColor(index) + '">'
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
    const cards = section.items.map(function (item, index) {
      const number = String(index + 1).padStart(2, '0');
      return '<article class="editorial-item">'
        + '<p class="editorial-num">' + number + '</p>'
        + '<div><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.body) + '</p></div>'
        + '</article>';
    }).join('');

    return '<section id="' + id + '" class="park-section park-section--editorial" aria-labelledby="' + id + '-title">'
      + '<div class="section-inner">'
      + sectionHeading(section, id + '-title')
      + '<div class="editorial-list">' + cards + '</div>'
      + '</div>'
      + '</section>';
  }

  function renderExtraFigure() {
    const extra = park.extraIllustration;
    const src = parkCard && parkCard.art && parkCard.art.extra;
    if (!extra || !src) return '';
    const alt = extra.alt || '';
    return '<figure class="park-extra">'
      + '<img src="' + escapeHtml(assetUrl(src)) + '" alt="' + escapeHtml(alt) + '"'
      + (alt ? '' : ' aria-hidden="true"')
      + ' width="960" height="960" loading="lazy" decoding="async" />'
      + (extra.caption ? '<figcaption>' + escapeHtml(extra.caption) + '</figcaption>' : '')
      + '</figure>';
  }

  function renderKnowledgeSection(key, id) {
    const section = park[key];
    const notes = section.notes.map(function (note, index) {
      const number = String(index + 1).padStart(2, '0');
      return '<article class="editorial-item"><p class="editorial-num">' + number + '</p><div><p>' + escapeHtml(note) + '</p></div></article>';
    }).join('');
    const extra = key === 'wildlife' ? renderExtraFigure() : '';

    return '<section id="' + id + '" class="park-section park-section--editorial" aria-labelledby="' + id + '-title">'
      + '<div class="section-inner knowledge-layout' + (extra ? ' knowledge-layout--with-extra' : '') + '">'
      + '<div>'
      + sectionHeading(section, id + '-title')
      + '<p class="knowledge-lead">' + escapeHtml(section.lead) + '</p>'
      + '</div>'
      + extra
      + '<div class="editorial-list">' + notes + '</div>'
      + '</div>'
      + '</section>';
  }

  function renderSeasons() {
    const cards = park.seasons.items.map(function (season) {
      return '<article class="season-col">'
        + '<h3>' + escapeHtml(season.name) + '</h3>'
        + '<p>' + escapeHtml(season.body) + '</p>'
        + '</article>';
    }).join('');
    const tint = paletteColor(3);

    return '<section id="park-seasons" class="season-band" aria-labelledby="park-seasons-title" style="background: color-mix(in srgb, ' + tint + ' 14%, #f6f1e8)">'
      + '<div class="section-inner season-band-inner">'
      + '<h2 id="park-seasons-title">' + escapeHtml(park.seasons.title) + '</h2>'
      + '<div class="season-cols">' + cards + '</div>'
      + '</div>'
      + '</section>';
  }

  function renderPhotography() {
    const tips = park.photography.tips.map(function (tip, index) {
      const number = String(index + 1).padStart(2, '0');
      return '<article class="editorial-item">'
        + '<p class="editorial-num">' + number + '</p>'
        + '<div><h3>' + escapeHtml(tip.label) + '</h3><p>' + escapeHtml(tip.body) + '</p></div>'
        + '</article>';
    }).join('');

    return '<section id="park-photography" class="park-section park-section--editorial" aria-labelledby="park-photography-title">'
      + '<div class="section-inner">'
      + sectionHeading(park.photography, 'park-photography-title')
      + '<p class="knowledge-lead">' + escapeHtml(park.photography.lead) + '</p>'
      + '<div class="editorial-list">' + tips + '</div>'
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

    const accent = (park.palette && park.palette.hero && park.palette.hero[2]) || '#243224';
    const ink = badgeInk(accent);
    return '<section class="park-section badge-panel" aria-labelledby="badge-showcase-title" style="background:' + accent + ';color:' + ink.ink + ';--badge-muted:' + ink.muted + '">'
      + '<div class="badge-panel-inner">'
      + '<div class="badge-tilt">'
      + renderBadgeImage(park.fullName + ' badge', 'park-badge--hero')
      + '</div>'
      + '<div class="badge-panel-copy">'
      + '<p class="section-kicker">' + escapeHtml(park.badgeStory.kicker) + '</p>'
      + '<h2 id="badge-showcase-title">' + escapeHtml(park.badgeStory.title) + '</h2>'
      + '<p>' + escapeHtml(park.badgeStory.description) + '</p>'
      + '<div class="badge-panel-notes">' + notes + '</div>'
      + '<div class="badge-detail-row" aria-label="Artifact details">' + details + '</div>'
      + '</div>'
      + '</div>'
      + '</section>';
  }

  function renderStewardship() {
    const rows = park.stewardship.items.map(function (item, index) {
      const number = String(index + 1).padStart(2, '0');
      return '<li><span>' + number + '</span><p>' + escapeHtml(item) + '</p></li>';
    }).join('');

    return '<section id="park-stewardship" class="park-section park-section--editorial" aria-labelledby="park-stewardship-title">'
      + '<div class="section-inner">'
      + sectionHeading(park.stewardship, 'park-stewardship-title')
      + '<p class="knowledge-lead">' + escapeHtml(park.stewardship.lead) + '</p>'
      + '<ol class="steward-rows">' + rows + '</ol>'
      + '<p class="nps-line"><a href="https://www.nps.gov/">Current conditions, fees, and alerts are on the National Park Service site.</a></p>'
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
    var full = assetUrl(poster);
    var mid = full.replace(/header\.webp$/, 'header-1280.webp');
    var srcset = full.replace(/header\.webp$/, 'header-640.webp') + ' 640w, '
      + mid + ' 1280w, '
      + full.replace(/header\.webp$/, 'header-1920.webp') + ' 1920w, '
      + full.replace(/header\.webp$/, 'header-2560.webp') + ' 2560w';
    return '<div class="park-break" aria-hidden="true"><img src="' + escapeHtml(mid) + '" srcset="' + escapeHtml(srcset) + '" sizes="100vw" alt="" width="1280" height="720" style="object-position:' + position + '" loading="lazy" decoding="async" /></div>';
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

  function renderVisitorPhotos() {
    if (!visitorPhotos.length || !root.trailmarkRenderVisitorSection) return '';
    const label = park.fullName || (parkCard && parkCard.name) || 'This park';
    return root.trailmarkRenderVisitorSection(visitorPhotos, label, assetBase);
  }

  function renderNeighbors() {
    if (!parkCard || !catalog.length) return '';
    const open = catalog.filter(function (entry) { return entry.pageUrl; }).sort(function (a, b) {
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
        + '<img src="' + escapeHtml(assetUrl(entry.art.header).replace(/header\.webp$/, 'header-640.webp')) + '" srcset="'
        + escapeHtml(assetUrl(entry.art.header).replace(/header\.webp$/, 'header-640.webp')) + ' 640w, '
        + escapeHtml(assetUrl(entry.art.header).replace(/header\.webp$/, 'header-1280.webp')) + ' 1280w" sizes="(max-width: 640px) 92vw, (max-width: 900px) 46vw, 31vw" alt="" width="640" height="360" loading="lazy" decoding="async" />'
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


    return [
      renderHero(),
      '<div id="today-at-park" class="today-box" hidden></div>',
      renderChapters(),
      renderOverview(),
      renderEmotionalThesis(),
      imageBreak('82% 18%'),
      renderHighlights(),
      renderDiscoverySection('hiddenDiscoveries', 'park-hidden-discoveries', 'discovery-card'),
      renderKnowledgeSection('wildlife', 'park-wildlife'),
      renderKnowledgeSection('geology', 'park-geology'),
      renderSeasons(),
      renderPhotography(),
      renderFieldNotes(),
      renderBadge(),
      renderStewardship(),
      renderArchive(),
      renderVisitorPhotos(),
      renderNeighbors(),
    ].join('');
  }

  root.trailmarkRenderPark = trailmarkRenderPark;
})(typeof globalThis !== 'undefined' ? globalThis : this);
