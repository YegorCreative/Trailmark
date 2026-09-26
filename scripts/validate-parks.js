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

  parks.forEach(function (park) {
    if (park.pageUrl && !content[park.id]) errors.push(park.id + ' has pageUrl but no essay');
    if (park.pageUrl && !fs.existsSync(path.join(root, park.pageUrl))) {
      errors.push(park.id + ' pageUrl file does not exist');
    }
  });

  seen.forEach(function (ids, text) {
    const unique = Array.from(new Set(ids));
    if (unique.length > 1) {
      errors.push('repeated copy in ' + unique.join(', ') + ': ' + text.slice(0, 90));
    }
  });

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log('validate-parks: ok (' + Object.keys(content).length + ' essays)');
}

main();
