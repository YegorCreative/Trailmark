#!/usr/bin/env node
/**
 * Generate parks/<id>.html for every park that has an essay.
 * Writes SEO metadata, JSON-LD, the pre-rendered article, and sitemap.xml.
 * Does not edit essay text.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function clip(text, max) {
  let value = String(text || '').replace(/\s+/g, ' ').trim();
  if (value.length <= max) return value;
  let cut = value.slice(0, max + 1);
  const space = cut.lastIndexOf(' ');
  if (space > Math.floor(max * 0.5)) cut = cut.slice(0, space);
  else cut = value.slice(0, max);
  const weak = { a: 1, an: 1, the: 1, of: 1, in: 1, on: 1, and: 1, or: 1, to: 1, for: 1, with: 1, from: 1, by: 1, as: 1, at: 1, is: 1, are: 1 };
  let words = cut.replace(/[.,;:\s]+$/, '').split(' ');
  while (words.length > 2 && weak[words[words.length - 1].toLowerCase()]) words.pop();
  return words.join(' ').replace(/[.,;:\s]+$/, '');
}

function metaDescription(essay) {
  const lead = (essay.overview && essay.overview.lead) || '';
  const subtitle = (essay.hero && essay.hero.subtitle) || '';
  const first = lead.split(/(?<=\.)\s/)[0] || '';
  let text = (first.length >= 70 && first.length <= 160) ? first : clip(lead || subtitle, 160);
  if (text.length < 70) text = clip((lead + ' ' + subtitle).replace(/\s+/g, ' '), 160);
  if (text.length < 70) text = clip(text + ' An illustrated TrailMark archive page.', 160);
  return text;
}

function pageTitle(essay) {
  const name = essay.fullName || essay.name;
  const suffix = ' | TrailMark';
  const hook = essay.seo && String(essay.seo.titleHook || '').trim();
  const withHook = name + ' — ' + hook + suffix;
  if (hook && withHook.length <= 60) return withHook;
  return name + suffix;
}

function gitDate(relPath) {
  try {
    const out = execSync('git log -1 --format=%cs -- ' + JSON.stringify(relPath), {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  } catch (error) {
    /* untracked */
  }
  return '';
}

function jsonLd(data) {
  return JSON.stringify(data, null, 2).replace(/</g, '\\u003c');
}

function pageHtml(park, essay, articleHtml, modified) {
  const region = addressRegion(park, essay);
  const desc = metaDescription(essay);
  const title = pageTitle(essay);
  const url = SITE + '/parks/' + park.id + '.html';
  const image = SITE + '/assets/park-art/' + park.id + '/header-1280.webp';
  const social = SITE + '/assets/park-art/' + park.id + '/og.jpg';
  const alt = (essay.hero && essay.hero.posterAlt) || (essay.fullName + ' illustrated header');
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TouristAttraction',
        name: essay.fullName,
        description: desc,
        image: image,
        url: url,
        address: {
          '@type': 'PostalAddress',
          addressRegion: region,
          addressCountry: 'US',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
          { '@type': 'ListItem', position: 2, name: 'Parks', item: SITE + '/parks.html' },
          { '@type': 'ListItem', position: 3, name: park.region, item: SITE + '/parks.html?region=' + encodeURIComponent(park.region) },
          { '@type': 'ListItem', position: 4, name: essay.fullName, item: url },
        ],
      },
      {
        '@type': 'Article',
        headline: essay.fullName,
        description: desc,
        image: image,
        dateModified: modified,
        mainEntityOfPage: url,
        author: [
          { '@type': 'Organization', name: 'TrailMark' },
          { '@type': 'Person', name: 'Yegor Hambaryan', url: 'https://yegorcreative.com' },
        ],
        publisher: { '@type': 'Organization', name: 'TrailMark' },
      },
    ],
  };

  return '<!DOCTYPE html>\n'
    + '<html lang="en" data-asset-base="../">\n'
    + '  <head>\n'
    + '    <meta charset="UTF-8" />\n'
    + '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n'
    + '    <meta name="theme-color" content="#142016" />\n'
    + '    <title>' + escapeHtml(title) + '</title>\n'
    + '    <meta name="description" content="' + escapeHtml(desc) + '" />\n'
    + '    <link rel="canonical" href="' + url + '" />\n'
    + '    <link rel="icon" href="../favicon.ico" sizes="any" />\n'
    + '    <link rel="icon" href="../favicon.svg" type="image/svg+xml" />\n'
    + '    <link rel="apple-touch-icon" href="../apple-touch-icon.png" />\n'
    + '    <link rel="manifest" href="../site.webmanifest" />\n'
    + '    <meta property="og:type" content="article" />\n'
    + '    <meta property="og:site_name" content="TrailMark" />\n'
    + '    <meta property="og:title" content="' + escapeHtml(title) + '" />\n'
    + '    <meta property="og:description" content="' + escapeHtml(desc) + '" />\n'
    + '    <meta property="og:url" content="' + url + '" />\n'
    + '    <meta property="og:image" content="' + social + '" />\n'
    + '    <meta property="og:image:type" content="image/jpeg" />\n'
    + '    <meta property="og:image:width" content="1200" />\n'
    + '    <meta property="og:image:height" content="630" />\n'
    + '    <meta property="og:image:alt" content="' + escapeHtml(alt) + '" />\n'
    + '    <meta name="twitter:card" content="summary_large_image" />\n'
    + '    <meta name="twitter:title" content="' + escapeHtml(title) + '" />\n'
    + '    <meta name="twitter:description" content="' + escapeHtml(desc) + '" />\n'
    + '    <meta name="twitter:image" content="' + social + '" />\n'
    + '    <meta name="twitter:image:alt" content="' + escapeHtml(alt) + '" />\n'
    + '    <script type="application/ld+json">\n'
    + jsonLd(graph) + '\n'
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
    + '            <img class="logo-mark" src="../assets/img/logo-mark.webp" alt="" aria-hidden="true" width="242" height="128" />\n'
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
    + '    <main id="main-content">\n'
    + '      <div id="park-page" data-park-id="' + park.id + '">\n'
    + articleHtml.split('\n').map(function (line) { return '        ' + line; }).join('\n') + '\n'
    + '      </div>\n'
    + '    </main>\n'
    + '    <footer id="site-footer">\n'
    + '      <div class="footer-inner">\n'
    + '        <div class="footer-brand">\n'
    + '          <span class="footer-logo-text">TrailMark</span>\n'
    + '        </div>\n'
    + '        <nav class="footer-nav" aria-label="Footer navigation">\n'
    + '          <a href="../parks.html" class="footer-nav-link">Parks</a>\n'
    + '          <a href="../about.html" class="footer-nav-link">About</a>\n'
    + '          <a href="../faq.html" class="footer-nav-link">FAQ</a>\n'
    + '          <a href="../contact.html" class="footer-nav-link">Contact</a>\n'
    + '        </nav>\n'
    + '        <p class="footer-copy">&copy; 2026 TrailMark</p>\n'
    + '      </div>\n'
    + '    </footer>\n'
    + '    <script src="../js/parks-data.js"></script>\n'
    + '    <script src="../js/park-content.js"></script>\n'
    + '    <script src="../js/park-render.js"></script>\n'
    + '    <script src="../js/park-page.js"></script>\n'
    + '    <script src="../js/atlas.js"></script>\n'
    + '    <script src="../js/script.js"></script>\n'
    + '  </body>\n'
    + '</html>\n';
}

function itemListJson(published) {
  return jsonLd({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All 63 U.S. national parks',
    url: SITE + '/parks.html',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: published.length,
      itemListElement: published.map(function (park, index) {
        return {
          '@type': 'ListItem',
          position: index + 1,
          url: SITE + '/' + park.pageUrl,
          name: park.name + ' National Park',
        };
      }),
    },
  });
}

function updateParksIndex(published) {
  const file = path.join(root, 'parks.html');
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');
  const block = '<script type="application/ld+json" id="parks-itemlist">\n' + itemListJson(published) + '\n    </script>';
  if (html.indexOf('id="parks-itemlist"') !== -1) {
    html = html.replace(/<script type="application\/ld\+json" id="parks-itemlist">[\s\S]*?<\/script>/, block);
  } else {
    html = html.replace('</head>', '    ' + block + '\n  </head>');
  }
  fs.writeFileSync(file, html);
}

function writeSitemap(entries) {
  const body = entries.map(function (entry) {
    return '  <url>\n    <loc>' + entry.loc + '</loc>\n    <lastmod>' + entry.lastmod + '</lastmod>\n  </url>';
  }).join('\n');
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + body + '\n'
    + '</urlset>\n';
  fs.writeFileSync(path.join(root, 'sitemap.xml'), xml);
}

function main() {
  const parks = load('js/parks-data.js', 'PARKS');
  const content = load('js/park-content.js', 'PARK_PAGE_CONTENT');
  const renderSource = fs.readFileSync(path.join(root, 'js/park-render.js'), 'utf8');
  new Function(renderSource)();
  const render = globalThis.trailmarkRenderPark;
  const outDir = path.join(root, 'parks');
  fs.mkdirSync(outDir, { recursive: true });
  const contentDate = gitDate('js/park-content.js') || new Date().toISOString().slice(0, 10);
  const written = [];
  const published = parks.filter(function (park) { return park.pageUrl && content[park.id]; });

  published.forEach(function (park) {
    const essay = content[park.id];
    const article = render(essay, park, { parks: parks, assetBase: '../' });
    const modified = gitDate('parks/' + park.id + '.html') || gitDate('js/park-content.js') || contentDate;
    fs.writeFileSync(path.join(outDir, park.id + '.html'), pageHtml(park, essay, article, modified));
    written.push(park.id);
  });

  updateParksIndex(published.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }));

  const today = contentDate;
  const staticPages = [
    { loc: SITE + '/', file: 'index.html' },
    { loc: SITE + '/parks.html', file: 'parks.html' },
    { loc: SITE + '/about.html', file: 'about.html' },
    { loc: SITE + '/faq.html', file: 'faq.html' },
    { loc: SITE + '/contact.html', file: 'contact.html' },
  ];
  const urls = staticPages.map(function (page) {
    return { loc: page.loc, lastmod: gitDate(page.file) || today };
  }).concat(published.map(function (park) {
    return {
      loc: SITE + '/parks/' + park.id + '.html',
      lastmod: gitDate('parks/' + park.id + '.html') || today,
    };
  }));
  writeSitemap(urls);
  console.log('wrote ' + written.length + ' pages and sitemap.xml (' + urls.length + ' urls)');
}

main();
