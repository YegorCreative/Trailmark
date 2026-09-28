// Single source of truth for the site's public URL. Used by
// build-park-pages.js and validate-parks.js so canonicals, og:url,
// JSON-LD, and sitemap.xml never drift out of sync with each other.
module.exports.SITE_URL = 'https://trailmark-usa.com';

// Favicon version — bump this (and only this) to cache-bust every icon
// link across every page on the next rebuild.
const FAVICON_VERSION = 3;

// Shared favicon <link> block, used by build-park-pages.js and
// build-static-pages.js so every page links the same icon files the same
// way. assetBase is '' for root pages, '../' for park pages.
function faviconLinksHtml(assetBase) {
  const v = '?v=' + FAVICON_VERSION;
  return '<link rel="icon" href="' + assetBase + 'favicon.ico' + v + '" sizes="any" />\n'
    + '    <link rel="icon" href="' + assetBase + 'favicon-32.png' + v + '" type="image/png" sizes="32x32" />\n'
    + '    <link rel="icon" href="' + assetBase + 'favicon-16.png' + v + '" type="image/png" sizes="16x16" />\n'
    + '    <link rel="apple-touch-icon" href="' + assetBase + 'apple-touch-icon.png' + v + '" />\n'
    + '    <link rel="manifest" href="' + assetBase + 'site.webmanifest" />';
}

module.exports.FAVICON_VERSION = FAVICON_VERSION;
module.exports.faviconLinksHtml = faviconLinksHtml;
