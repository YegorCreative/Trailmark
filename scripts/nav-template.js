/*
  nav-template.js
  Single source of truth for the header and footer nav markup, shared by
  scripts/build-park-pages.js (63 generated park pages) and
  scripts/build-static-pages.js (the 8 hand-authored root pages). Never
  hand-edit a page's <header>/<footer> block directly — edit NAV_LINKS or
  the templates here and rebuild both.
*/

const NAV_LINKS = [
  { key: 'parks', label: 'Parks', href: 'parks.html', descriptor: 'All 63 national parks' },
  { key: 'today', label: 'Today', href: 'today.html', descriptor: "What's open right now" },
  { key: 'photos', label: 'Photos', href: 'photos.html', descriptor: 'Visitor photos and stories' },
  { key: 'about', label: 'About', href: 'about.html', descriptor: 'Why TrailMark exists' },
  { key: 'faq', label: 'FAQ', href: 'faq.html', descriptor: 'Questions, answered' },
  { key: 'contact', label: 'Contact', href: 'contact.html', descriptor: 'Corrections, photos, ideas' },
];

function headerHtml(assetBase) {
  const items = NAV_LINKS.map(function (link) {
    const cls = link.key === 'parks' ? ' class="nav-item--parks"' : '';
    return '<li' + cls + '><a href="' + assetBase + link.href + '" class="nav-link" data-nav="' + link.key + '">' + link.label + '</a></li>';
  }).join('\n            ');
  return '<header id="site-header">\n'
    + '      <div class="header-inner">\n'
    + '        <div class="logo">\n'
    + '          <a href="' + assetBase + 'index.html" class="logo-link">\n'
    + '            <img class="logo-mark" src="' + assetBase + 'assets/img/logo-mark.webp" alt="" aria-hidden="true" width="242" height="128" />\n'
    + '            <span class="logo-text">TrailMark</span>\n'
    + '          </a>\n'
    + '        </div>\n'
    + '        <nav id="site-nav" aria-label="Site navigation">\n'
    + '          <ul class="nav-list">\n'
    + '            ' + items + '\n'
    + '          </ul>\n'
    + '        </nav>\n'
    + '      </div>\n'
    + '    </header>';
}

function footerHtml(assetBase) {
  const items = NAV_LINKS.map(function (link) {
    return '<a href="' + assetBase + link.href + '">' + link.label + '</a>';
  }).join('\n          ');
  return '<footer id="site-footer" class="site-footer">\n'
    + '      <div class="site-footer-main">\n'
    + '        <div class="site-footer-brand">\n'
    + '          <p class="site-footer-name">TrailMark</p>\n'
    + '          <p class="site-footer-line">An illustrated archive of the 63 U.S. national parks.</p>\n'
    + '        </div>\n'
    + '        <nav class="site-footer-nav" aria-label="Footer">\n'
    + '          ' + items + '\n'
    + '        </nav>\n'
    + '        <a class="site-footer-explore" href="' + assetBase + 'parks.html">Explore all 63 parks →</a>\n'
    + '      </div>\n'
    + '      <div class="site-footer-fine">\n'
    + '        <p>© 2026 TrailMark · Built by <a href="https://yegorcreative.com">Yegor Hambaryan</a></p>\n'
    + '        <p>Park facts from the National Park Service · Not affiliated with the NPS</p>\n'
    + '      </div>\n'
    + '    </footer>';
}

module.exports = { NAV_LINKS, headerHtml, footerHtml };
