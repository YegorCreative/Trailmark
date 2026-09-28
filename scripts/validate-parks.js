#!/usr/bin/env node
/**
 * Fail if published park data is incomplete, inconsistent, or duplicated.
 * Shared section kickers such as "Park Overview" are allowed to repeat.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const REQUIRED = [
  'name', 'fullName', 'archiveNumber', 'established', 'collection',
  'hero', 'overview', 'emotionalThesis', 'landscapeHighlights',
  'hiddenDiscoveries', 'wildlife', 'geology', 'seasons', 'photography',
  'fieldNotes', 'badgeStory', 'stewardship', 'archive',
];
const HERO_FIELDS = ['kicker', 'eyebrow', 'title', 'subtitle', 'posterSrc', 'posterAlt'];
const SHARED_OK = new Set([
  'Park Overview', 'Emotional Thesis', 'Landscape Highlights', 'Hidden Discoveries',
  'Wildlife', 'Geology', 'Seasons', 'Photography', 'Field Notes', 'Stewardship / Safety',
  'Continue the Archive', 'TrailMark Field Notes', 'TrailMark Archive Edition',
]);

function load(file, returned) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  return new Function(source + '\nreturn ' + returned + ';')();
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

function walkStrings(value, visit) {
  if (typeof value === 'string') visit(value);
  else if (Array.isArray(value)) value.forEach(function (item) { walkStrings(item, visit); });
  else if (value && typeof value === 'object') {
    Object.keys(value).forEach(function (key) { walkStrings(value[key], visit); });
  }
}

function main() {
  const errors = [];
  const parks = load('js/parks-data.js', 'PARKS');
  const content = load('js/park-content.js', 'PARK_PAGE_CONTENT');
  const byId = {};
  parks.forEach(function (park) { byId[park.id] = park; });

  const seen = new Map();
  Object.keys(content).forEach(function (id) {
    const essay = content[id];
    const card = byId[id];
    REQUIRED.forEach(function (key) {
      if (essay[key] == null || essay[key] === '') errors.push(id + ' missing ' + key);
    });
    if (essay.hero) {
      HERO_FIELDS.forEach(function (key) {
        if (essay.hero[key] == null) errors.push(id + ' hero missing ' + key);
      });
    }
    ['overview', 'emotionalThesis', 'wildlife', 'geology', 'photography', 'stewardship', 'badgeStory'].forEach(function (key) {
      const section = essay[key];
      if (!section) return;
      if (section.body && !Array.isArray(section.body)) errors.push(id + ' ' + key + '.body is not an array');
    });
    if (!card) errors.push(id + ' has an essay but no catalog entry');
    if (card) {
      ['header', 'badge', 'extra'].forEach(function (slot) {
        const rel = card.art && card.art[slot];
        if (!rel || !fs.existsSync(path.join(root, rel))) errors.push(id + ' missing art file ' + slot);
      });
      if (card.pageUrl && !fs.existsSync(path.join(root, card.pageUrl))) {
        errors.push(id + ' pageUrl missing file ' + card.pageUrl);
      }
    }
    const links = (essay.archive && essay.archive.links) || [];
    links.forEach(function (link) {
      const status = String(link.status || '').toLowerCase();
      const published = status === 'available' || status === 'open';
      if (!published) return;
      const target = String(link.href || '');
      if (target.indexOf('index.html') !== -1 || !target.endsWith('.html')) {
        errors.push(id + ' archive link "' + link.label + '" is Available but does not point at a park page');
        return;
      }
      const targetId = path.basename(target, '.html');
      const targetCard = byId[targetId];
      if (!targetCard || !targetCard.pageUrl) {
        errors.push(id + ' archive link "' + link.label + '" is Available but ' + targetId + ' is unpublished');
      }
    });
    walkStrings(essay, function (text) {
      if (text.indexOf('<') !== -1) errors.push(id + ' contains unescaped "<": ' + text.slice(0, 80));
      const normalized = text.replace(/\s+/g, ' ').trim();
      if (normalized.length < 80 || SHARED_OK.has(normalized)) return;
      if (!seen.has(normalized)) seen.set(normalized, []);
      seen.get(normalized).push(id);
    });
  });

  const DEFAULT_PALETTE = ['#243224', '#6a3418', '#1d3d4a', '#8a5a32', '#3a3028'];
  const INK_CANDIDATES = ['#142016', '#f7f3ec', '#000000', '#ffffff'];
  Object.keys(content).forEach(function (id) {
    const essay = content[id];
    if (!essay.landscapeHighlights || !essay.landscapeHighlights.items) return;
    const colors = (essay.palette && essay.palette.hero) || DEFAULT_PALETTE;
    essay.landscapeHighlights.items.forEach(function (item, index) {
      const bg = colors[index % colors.length];
      const best = INK_CANDIDATES.reduce(function (max, candidate) {
        return Math.max(max, contrastRatio(candidate, bg));
      }, 0);
      if (best < 4.5) {
        errors.push(id + ' landscapeHighlights panel ' + (index + 1) + ' (' + bg + ') cannot reach 4.5:1 contrast with any ink candidate (best ' + best.toFixed(2) + ')');
      }
    });
  });

  const IANA_ZONE = /^[A-Za-z_]+\/[A-Za-z_]+$/;
  parks.forEach(function (park) {
    if (park.pageUrl && !content[park.id]) errors.push(park.id + ' has pageUrl but no essay');
    if (park.pageUrl && !fs.existsSync(path.join(root, park.pageUrl))) {
      errors.push(park.id + ' pageUrl file does not exist');
    }
    if (!park.npsCode || !/^[a-z]{4}$/.test(park.npsCode)) {
      errors.push(park.id + ' missing or malformed npsCode');
    }
    if (!park.timeZone || !IANA_ZONE.test(park.timeZone)) {
      errors.push(park.id + ' missing or malformed timeZone');
    }
  });

  seen.forEach(function (ids, text) {
    const unique = Array.from(new Set(ids));
    if (unique.length > 1) {
      errors.push('repeated copy in ' + unique.join(', ') + ': ' + text.slice(0, 90));
    }
  });

  const SITE = 'https://yegorcreative.github.io/Trailmark/';
  let photoList = [];
  try { photoList = load('js/photos-data.js', 'PHOTOS'); }
  catch (error) { errors.push('js/photos-data.js could not be loaded'); }
  const photoIds = new Set();
  photoList.forEach(function (photo) {
    const id = photo && photo.id ? photo.id : '(missing id)';
    if (!photo || !String(photo.photographer || '').trim()) errors.push('photo missing photographer: ' + id);
    if (!photo || !byId[photo.parkId]) errors.push('photo unknown parkId: ' + (photo && photo.parkId));
    if (!photo || !String(photo.file || '').trim()) errors.push('photo missing file: ' + id);
    if (photo && photoIds.has(photo.id)) errors.push('duplicate photo id ' + photo.id);
    if (photo && photo.id) photoIds.add(photo.id);
    ['-640.webp', '-1280.webp'].forEach(function (suffix) {
      if (!photo || !photo.parkId || !photo.id) return;
      const rel = 'assets/photos/' + photo.parkId + '/' + photo.id + suffix;
      if (!fs.existsSync(path.join(root, rel))) errors.push('photo missing file: ' + rel);
    });
  });

  const pages = ['index.html', 'parks.html', 'today.html', 'about.html', 'faq.html', 'contact.html', 'photos.html', '404.html']
    .concat(parks.filter(function (park) { return park.pageUrl; }).map(function (park) { return park.pageUrl; }));
  const titles = new Map();
  const descriptions = new Map();
  let sitemap = '';
  const sitemapPath = path.join(root, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) errors.push('sitemap.xml is missing');
  else sitemap = fs.readFileSync(sitemapPath, 'utf8');

  pages.forEach(function (rel) {
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) {
      errors.push(rel + ' is missing');
      return;
    }
    const html = fs.readFileSync(file, 'utf8');
    const titleMatch = html.match(/<title>([^<]*)<\/title>/);
    const title = titleMatch ? decode(titleMatch[1]).trim() : '';
    if (!title) errors.push(rel + ' missing title');
    else if (titles.has(title)) errors.push(rel + ' duplicate title with ' + titles.get(title));
    else titles.set(title, rel);
    if (rel.indexOf('parks/') === 0) {
      const parkId = path.basename(rel, '.html');
      const essay = content[parkId];
      const hook = essay && essay.seo && String(essay.seo.titleHook || '').trim();
      if (!hook) errors.push(parkId + ' missing titleHook');
      else {
        const name = essay.fullName;
        const withHook = name + ' — ' + hook + ' | TrailMark';
        const expected = withHook.length <= 60 ? withHook : name + ' | TrailMark';
        if (title.length > 60) errors.push(parkId + ' title is ' + title.length + ' chars');
        if (title !== expected) errors.push(parkId + ' title does not match its titleHook');
        const cut = title.split(' — ')[1];
        if (cut && cut.replace(/ \| TrailMark$/, '') !== hook) errors.push(parkId + ' title cuts off a word');
      }
    }

    const descMatch = html.match(/<meta name="description" content="([^"]*)"/);
    const description = descMatch ? decode(descMatch[1]).trim() : '';
    if (!description) errors.push(rel + ' missing description');
    else if (description.length < 70 || description.length > 160) errors.push(rel + ' description is ' + description.length + ' chars');
    else if (descriptions.has(description)) errors.push(rel + ' duplicate description with ' + descriptions.get(description));
    else descriptions.set(description, rel);

    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
    if (!canonical) errors.push(rel + ' missing canonical');

    const image = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (!image) errors.push(rel + ' missing og:image');
    else {
      const url = decode(image[1]);
      let local = '';
      if (url.indexOf(SITE) === 0) local = decodeURIComponent(url.slice(SITE.length));
      else if (url.indexOf('../') === 0) local = url.slice(3);
      else local = url.replace(/^\//, '');
      if (!local || !fs.existsSync(path.join(root, local))) errors.push(rel + ' og:image does not resolve: ' + url);
    }

    const blocks = html.match(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g) || [];
    if (!blocks.length) errors.push(rel + ' missing JSON-LD');
    blocks.forEach(function (block) {
      const raw = block.replace(/^<script type="application\/ld\+json"[^>]*>/, '').replace(/<\/script>$/, '').trim();
      try { JSON.parse(raw); }
      catch (error) { errors.push(rel + ' invalid JSON-LD: ' + error.message); }
    });

    const h1s = html.match(/<h1\b/g) || [];
    if (h1s.length !== 1) errors.push(rel + ' has ' + h1s.length + ' h1 elements');

    const images = html.match(/<img\b[^>]*>/g) || [];
    images.forEach(function (tag) {
      if (!/\salt=/.test(tag)) errors.push(rel + ' img missing alt: ' + tag.slice(0, 80));
    });

    if (rel !== '404.html') {
      const loc = rel === 'index.html' ? SITE : SITE + rel;
      if (sitemap.indexOf('<loc>' + loc + '</loc>') === -1) errors.push(rel + ' missing from sitemap.xml');
    }
  });

  const statusPath = path.join(root, 'data', 'park-status.json');
  if (fs.existsSync(statusPath)) {
    let status = null;
    try { status = JSON.parse(fs.readFileSync(statusPath, 'utf8')); }
    catch (error) { errors.push('data/park-status.json is not valid JSON: ' + error.message); }
    if (status && !status.generatedAt) {
      const withAlerts = Object.keys(status.parks || {}).filter(function (id) {
        const entry = status.parks[id];
        return entry && Array.isArray(entry.alerts) && entry.alerts.length > 0;
      });
      if (withAlerts.length) {
        errors.push('data/park-status.json has generatedAt: null but carries alerts for: ' + withAlerts.join(', ') + ' — stale/placeholder data must never ship with alerts (today.js and park-today-box.js both assume alerts only exist when the data is real).');
      }
    }
  }

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log('validate-parks: ok (' + Object.keys(content).length + ' essays)');
}

function decode(value) {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—');
}

main();
