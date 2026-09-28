#!/usr/bin/env node
/**
 * Bakes the shared header/footer nav (scripts/nav-template.js) into the
 * hand-authored root pages, so nav changes only ever happen in one place.
 * Does not touch any other content on these pages.
 */
const fs = require('fs');
const path = require('path');
const { headerHtml, footerHtml } = require('./nav-template');

const root = path.resolve(__dirname, '..');
const PAGES = ['index.html', 'parks.html', 'about.html', 'faq.html', 'contact.html', 'today.html', 'photos.html', '404.html'];

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
    if (next === html) return;
    fs.writeFileSync(filePath, next);
    written++;
  });
  console.log('wrote nav into ' + written + ' / ' + PAGES.length + ' static pages');
}

main();
