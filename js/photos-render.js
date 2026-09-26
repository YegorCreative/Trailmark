/*
  HTML for visitor-photo grids. Used by park-render.js and the page build.
*/
(function (root) {
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function altText(photo, parkLabel) {
    if (photo.caption) return photo.caption;
    return parkLabel + ' by ' + photo.photographer;
  }

  function card(photo, parkLabel, assetBase) {
    const dir = assetBase + 'assets/photos/' + photo.parkId + '/' + photo.id;
    const alt = altText(photo, parkLabel);
    const small = dir + '-640.webp';
    const large = dir + '-1280.webp';
    const width = photo.width || 640;
    const height = photo.height || 480;
    const fullWidth = photo.fullWidth || 1280;
    const name = photo.link
      ? '<a href="' + escapeHtml(photo.link) + '" rel="noopener noreferrer">' + escapeHtml(photo.photographer) + '</a>'
      : escapeHtml(photo.photographer);
    const caption = photo.caption
      ? '<p class="visitor-caption">' + escapeHtml(photo.caption) + '</p>'
      : '';
    return '<li>'
      + '<button type="button" class="visitor-open" data-photo-src="' + escapeHtml(large) + '" data-photo-alt="' + escapeHtml(alt) + '" data-photo-credit="Photo: ' + escapeHtml(photo.photographer) + '">'
      + '<img src="' + escapeHtml(small) + '" srcset="' + escapeHtml(small) + ' ' + width + 'w, ' + escapeHtml(large) + ' ' + fullWidth + 'w" sizes="(max-width: 700px) 90vw, 30vw" alt="' + escapeHtml(alt) + '" width="' + width + '" height="' + height + '" loading="lazy" decoding="async" />'
      + '</button>'
      + '<p class="visitor-credit">Photo: ' + name + '</p>'
      + caption
      + '</li>';
  }

  function grid(photos, parkLabel, assetBase) {
    return '<ul class="visitor-grid">' + photos.map(function (photo) {
      return card(photo, parkLabel, assetBase);
    }).join('') + '</ul>';
  }

  function trailmarkRenderVisitorSection(photos, parkLabel, assetBase) {
    if (!photos || !photos.length) return '';
    return '<section class="park-section visitor-photos" aria-labelledby="visitor-photos-title">'
      + '<div class="section-inner">'
      + '<h2 id="visitor-photos-title" class="section-title section-title--left">Visitor photos</h2>'
      + grid(photos, parkLabel, assetBase)
      + '</div></section>';
  }

  function trailmarkRenderPhotoGallery(groups, assetBase) {
    if (!groups || !groups.length) {
      return '<p class="visitor-empty">The first visitor photos are on their way.</p>';
    }
    return groups.map(function (group) {
      const heading = group.href
        ? '<a href="' + escapeHtml(group.href) + '">' + escapeHtml(group.name) + '</a>'
        : escapeHtml(group.name);
      return '<section class="visitor-park" aria-labelledby="photos-' + escapeHtml(group.id) + '">'
        + '<h2 id="photos-' + escapeHtml(group.id) + '">' + heading + '</h2>'
        + grid(group.photos, group.label, assetBase)
        + '</section>';
    }).join('');
  }

  root.trailmarkRenderVisitorSection = trailmarkRenderVisitorSection;
  root.trailmarkRenderPhotoGallery = trailmarkRenderPhotoGallery;
}(typeof globalThis !== 'undefined' ? globalThis : this));
