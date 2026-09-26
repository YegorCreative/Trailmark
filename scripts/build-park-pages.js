#!/usr/bin/env node
/**
 * Generate parks/<id>.html for every park that has an essay.
 * Reads js/parks-data.js and js/park-content.js. Does not edit those files.
 * Existing URLs stay parks/<id>.html.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const SITE = 'https://yegorcreative.github.io/Trailmark';

const STATE_CODES = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
  Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA',
  Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA',
  Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
  Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS',
  Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK',
  Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT',
  Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI',
  Wyoming: 'WY', 'American Samoa': 'AS', 'U.S. Virgin Islands': 'VI',
  'Virgin Islands': 'VI',
};

function load(file, returned) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  return new Function(source + '\nreturn ' + returned + ';')();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function addressRegion(park, essay) {
  if (essay.seo && essay.seo.addressRegion) return essay.seo.addressRegion;
  const first = String(essay.state || park.state || '').split(',')[0].trim();
  return STATE_CODES[first] || '';
}

function description(essay) {
  if (essay.seo && essay.seo.description) return essay.seo.description;
  const lead = (essay.overview && essay.overview.lead) || essay.fullName;
  return lead.length > 180 ? lead.slice(0, 177).trim() + '...' : lead;
}

function pageHtml(park, essay) {
  const region = addressRegion(park, essay);
  const desc = description(essay);
  const url = SITE + '/parks/' + park.id + '.html';
  const image = SITE + '/' + park.art.header;
  const regionLine = region
    ? '\n            "addressRegion": "' + region + '",'
    : '';

  return '<!DOCTYPE html>\n'
    + '<html lang="en" data-asset-base="../">\n'
    + '  <head>\n'
    + '    <meta charset="UTF-8" />\n'
    + '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n'
    + '    <title>' + escapeHtml(essay.fullName) + ' &mdash; TrailMark</title>\n'
    + '    <meta name="description" content="' + escapeHtml(desc) + '" />\n'
    + '    <link rel="canonical" href="' + url + '" />\n'
    + '    <meta property="og:type" content="article" />\n'
    + '    <meta property="og:site_name" content="TrailMark" />\n'
    + '    <meta property="og:title" content="' + escapeHtml(essay.fullName) + ' - TrailMark" />\n'
    + '    <meta property="og:description" content="' + escapeHtml(desc) + '" />\n'
    + '    <meta property="og:url" content="' + url + '" />\n'
    + '    <meta property="og:image" content="' + image + '" />\n'
    + '    <meta name="twitter:card" content="summary_large_image" />\n'
    + '    <meta name="twitter:title" content="' + escapeHtml(essay.fullName) + ' - TrailMark" />\n'
    + '    <meta name="twitter:description" content="' + escapeHtml(desc) + '" />\n'
    + '    <meta name="twitter:image" content="' + image + '" />\n'
    + '    <script type="application/ld+json">\n'
    + '    {\n'
    + '      "@context": "https://schema.org",\n'
    + '      "@type": "Article",\n'
    + '      "headline": "' + escapeHtml(essay.fullName) + '",\n'
    + '      "description": "' + escapeHtml(desc) + '",\n'
    + '      "author": { "@type": "Organization", "name": "TrailMark" },\n'
    + '      "publisher": { "@type": "Organization", "name": "TrailMark" },\n'
    + '      "mainEntityOfPage": "' + url + '",\n'
    + '      "image": "' + image + '",\n'
    + '      "about": {\n'
    + '        "@type": "Place",\n'
    + '        "name": "' + escapeHtml(essay.fullName) + '",\n'
    + '        "address": {\n'
    + '          "@type": "PostalAddress",' + regionLine + '\n'
    + '          "addressCountry": "US"\n'
    + '        }\n'
    + '      }\n'
    + '    }\n'
    + '    </script>\n'
    + '    <link rel="preconnect" href="https://fonts.googleapis.com" />\n'
    + '    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n'
    + '    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,700&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet" />\n'
    + '    <link rel="stylesheet" href="../css/styles.css" />\n'
    + '    <link rel="stylesheet" href="../css/styles-responsive.css" />\n'
    + '    <link rel="stylesheet" href="../css/atlas.css" />\n'
    + '  </head>\n'
    + '  <body>\n'
    + '    <a class="skip-link" href="#park-page">Skip to ' + escapeHtml(park.name) + ' content</a>\n'
    + '    <header id="site-header">\n'
    + '      <div class="header-inner">\n'
    + '        <div class="logo">\n'
    + '          <a href="../index.html" class="logo-link">\n'
    + '            <img class="logo-mark" src="../assets/img/TrailMarkLogo-3.png" alt="" aria-hidden="true" width="320" height="80" />\n'
    + '            <span class="logo-text">TrailMark</span>\n'
    + '          </a>\n'
    + '        </div>\n'
    + '        <nav id="site-nav" aria-label="Site navigation">\n'
    + '          <ul class="nav-list">\n'
    + '            <li class="nav-item--parks"><a href="../parks.html" class="nav-link" data-nav="parks">Parks</a></li>\n'
    + '            <li><a href="../about.html" class="nav-link" data-nav="about">About</a></li>\n'
    + '            <li><a href="../faq.html" class="nav-link" data-nav="faq">FAQ</a></li>\n'
    + '            <li><a href="../contact.html" class="nav-link" data-nav="contact">Contact</a></li>\n'
    + '          </ul>\n'
    + '        </nav>\n'
    + '      </div>\n'
    + '    </header>\n'
    + '    <nav class="park-back" aria-label="Breadcrumb">\n'
    + '      <div class="park-back-inner">\n'
    + '        <a href="../parks.html" class="park-back-link">\n'
    + '          <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>\n'
    + '          All Parks\n'
    + '        </a>\n'
    + '      </div>\n'
    + '    </nav>\n'
    + '    <main id="main-content">\n'
    + '      <div id="park-page" data-park-id="' + park.id + '"></div>\n'
    + '    </main>\n'
    + '    <footer id="site-footer">\n'
    + '      <div class="footer-inner">\n'
    + '        <div class="footer-brand">\n'
    + '          <svg class="footer-logo-mark" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n'
    + '            <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="#F7F3EC" opacity="0.5" />\n'
    + '            <polygon points="20,7 31,13.5 31,26.5 20,33 9,26.5 9,13.5" fill="none" stroke="#F7F3EC" stroke-width="1.5" opacity="0.45" />\n'
    + '            <polygon points="20,16 27,28 13,28" fill="#F7F3EC" opacity="0.45" />\n'
    + '          </svg>\n'
    + '          <span class="footer-logo-text">TrailMark</span>\n'
    + '        </div>\n'
    + '        <nav class="footer-nav" aria-label="Footer navigation">\n'
    + '          <a href="../parks.html" class="footer-nav-link">Parks</a>\n'
    + '          <a href="../about.html" class="footer-nav-link">About</a>\n'
    + '          <a href="../faq.html" class="footer-nav-link">FAQ</a>\n'
    + '          <a href="../contact.html" class="footer-nav-link">Contact</a>\n'
    + '        </nav>\n'
    + '        <p class="footer-copy">&copy; 2026 &mdash; Celebrating America&rsquo;s National Parks</p>\n'
    + '      </div>\n'
    + '    </footer>\n'
    + '    <script src="../js/parks-data.js"></script>\n'
    + '    <script src="../js/park-content.js"></script>\n'
    + '    <script src="../js/park-page.js"></script>\n'
    + '    <script src="../js/atlas.js"></script>\n'
    + '    <script src="../js/script.js"></script>\n'
    + '  </body>\n'
    + '</html>\n';
}

function main() {
  const parks = load('js/parks-data.js', 'PARKS');
  const content = load('js/park-content.js', 'PARK_PAGE_CONTENT');
  const outDir = path.join(root, 'parks');
  fs.mkdirSync(outDir, { recursive: true });
  const written = [];
  parks.forEach(function (park) {
    const essay = content[park.id];
    if (!essay) return;
    const file = path.join(outDir, park.id + '.html');
    fs.writeFileSync(file, pageHtml(park, essay));
    written.push(park.id);
  });
  console.log('wrote ' + written.length + ' pages: ' + written.join(', '));
}

main();
