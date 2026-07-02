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

  function renderHero() {
    const themeClass = park.hero.theme ? ' hero--' + escapeHtml(park.hero.theme) : '';

    return '<section id="hero" class="hero--park' + themeClass + '" aria-labelledby="park-hero-title">'
      + '<div class="park-poster" aria-hidden="true">'
      + '<img src="' + escapeHtml(park.hero.posterSrc) + '" alt="' + escapeHtml(park.hero.posterAlt) + '" class="park-poster-art" />'
      + '</div>'
      + '<div class="hero-grain" aria-hidden="true"></div>'
      + '<div class="hero-inner">'
      + '<p class="hero-kicker">' + escapeHtml(park.hero.kicker) + '</p>'
      + '<p class="hero-eyebrow">' + escapeHtml(park.hero.eyebrow) + '</p>'
      + '<h1 class="hero-title" id="park-hero-title">' + escapeHtml(park.hero.title) + '</h1>'
      + '<p class="hero-subtitle">' + escapeHtml(park.hero.subtitle) + '</p>'
      + '<div class="hero-ledger" aria-label="Archive metadata">'
      + '<p><span>Archive No.</span> ' + escapeHtml(park.archiveNumber) + '</p>'
      + '<p><span>Protected</span> Since ' + escapeHtml(park.established) + '</p>'
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
      return '<article class="highlight-card highlight-card--' + escapeHtml(item.modifier) + '">'
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

  function renderKnowledgeSection(key, id) {
    const section = park[key];
    const notes = section.notes.map(function (note) {
      return '<li>' + escapeHtml(note) + '</li>';
    }).join('');

    return '<section id="' + id + '" class="park-section park-section--knowledge" aria-labelledby="' + id + '-title">'
      + '<div class="section-inner knowledge-layout">'
      + '<div>'
      + sectionHeading(section, id + '-title')
      + '<p class="knowledge-lead">' + escapeHtml(section.lead) + '</p>'
      + '</div>'
      + '<ul class="knowledge-list">' + notes + '</ul>'
      + '</div>'
      + '</section>';
  }

  function renderSeasons() {
    const cards = park.seasons.items.map(function (season) {
      return '<article class="season-card season-card--' + escapeHtml(season.modifier) + '">'
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
      + '<div class="badge-plaque-badge-wrap">'
      + '<svg class="park-badge park-badge--hero" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + escapeHtml(park.fullName) + ' badge">'
      + parkCard.svgInner
      + '</svg>'
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

  mount.innerHTML = [
    renderHero(),
    renderOverview(),
    renderEmotionalThesis(),
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
  ].join('');
}());
