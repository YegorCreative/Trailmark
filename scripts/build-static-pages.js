#!/usr/bin/env node
/**
 * Bakes the shared header/footer nav (scripts/nav-template.js) into the
 * hand-authored root pages, so nav changes only ever happen in one place.
 * Does not touch any other content on these pages.
 */
const fs = require('fs');
const path = require('path');
const { headerHtml, footerHtml } = require('./nav-template');
const { SITE_URL, faviconLinksHtml } = require('./site-config');
const faqRender = require('./faq-render');

const root = path.resolve(__dirname, '..');
const PAGES = ['index.html', 'parks.html', 'about.html', 'faq.html', 'contact.html', 'today.html', 'photos.html', '404.html'];

function replaceBetween(html, marker, inner) {
  const re = new RegExp('<!-- ' + marker + ' -->[\\s\\S]*?<!-- /' + marker + ' -->');
  return html.replace(re, '<!-- ' + marker + ' -->\n' + inner + '\n<!-- /' + marker + ' -->');
}

function buildFaq(html) {
  const FAQ_DATA = require(path.join(root, 'js/faq-data.js'));
  let next = html.replace(/<!-- FAQ_JSONLD -->[\s\S]*?<!-- \/FAQ_JSONLD -->/,
    '<!-- FAQ_JSONLD -->\n<script type="application/ld+json">\n' + faqRender.jsonLd(FAQ_DATA, SITE_URL) + '\n</script>\n<!-- /FAQ_JSONLD -->');
  next = replaceBetween(next, 'FAQ_PILLS', faqRender.pillsHtml(FAQ_DATA));
  next = replaceBetween(next, 'FAQ_CATEGORIES', faqRender.categoriesHtml(FAQ_DATA));
  return next;
}

function main() {
  const header = headerHtml('');
  const footer = footerHtml('');
  let written = 0;
  PAGES.forEach(function (file) {
    const filePath = path.join(root, file);
    if (!fs.existsSync(filePath)) {
      console.error(file + ' not found, skipped');
      return;
    }
    const html = fs.readFileSync(filePath, 'utf8');
    let next = html.replace(/<header id="site-header">[\s\S]*?<\/header>/, header);
    next = next.replace(/<footer id="site-footer"[\s\S]*?<\/footer>/, footer);
    next = next.replace(
      /<link rel="icon"[\s\S]*?<link rel="manifest"[^>]*\/>/,
      faviconLinksHtml('')
    );
    if (file === 'faq.html') next = buildFaq(next);
    if (next === html) return;
    fs.writeFileSync(filePath, next);
    written++;
  });
  console.log('wrote nav into ' + written + ' / ' + PAGES.length + ' static pages');
}

main();
