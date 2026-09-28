#!/usr/bin/env node
/**
 * QA check: no <img> may be displayed larger than the file it loaded.
 *
 * For every <img> on the given pages, at each viewport/DPR combination,
 * fails if the loaded file's naturalWidth is less than
 * renderedWidth * devicePixelRatio / 1.25 (a 20% slack margin, so a browser
 * picking a "close enough" srcset candidate isn't flagged as a bug).
 *
 * Not part of the normal build — this project has no npm dependencies
 * (see CLAUDE.md), so this script isn't run automatically. Requires
 * Playwright installed separately, e.g. in a scratch directory:
 *   npm init -y && npm install playwright && npx playwright install chromium
 * then, with the site served locally (e.g. `python3 -m http.server 8934`):
 *   node scripts/check-image-sizing.js --base http://localhost:8934 \
 *     --require /path/to/node_modules/playwright
 */
const path = require('path');

function parseArgs(argv) {
  const args = { base: 'http://localhost:8934', require: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--base') args.base = argv[++i];
    if (argv[i] === '--require') args.require = argv[++i];
  }
  return args;
}

const PAGES = (process.env.QA_PAGES ? process.env.QA_PAGES.split(',') : ['/index.html', '/parks.html', '/about.html', '/parks/zion.html']);
const CONFIGS = [
  { label: '1440x900 DPR2', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  { label: '390x844 DPR3', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 },
];
const SLACK = 1.25;

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const playwrightPath = args.require || 'playwright';
  let chromium;
  try {
    ({ chromium } = require(playwrightPath));
  } catch (error) {
    console.error('Could not load Playwright from "' + playwrightPath + '". Pass --require <path to playwright> or run from a directory where `npm install playwright` was done.');
    console.error(error.message);
    process.exit(2);
  }

  const browser = await chromium.launch();
  const failures = [];
  let checkedTotal = 0;

  for (const pagePath of PAGES) {
    for (const config of CONFIGS) {
      const page = await browser.newPage({ viewport: config.viewport, deviceScaleFactor: config.deviceScaleFactor });
      const url = args.base.replace(/\/$/, '') + pagePath;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      } catch (error) {
        console.error('Failed to load ' + url + ': ' + error.message);
        await page.close();
        continue;
      }
      await page.waitForTimeout(500);
      // Force lazy images into view so their real srcset choice resolves.
      await page.evaluate(async () => {
        const step = window.innerHeight || 800;
        let y = 0;
        const max = document.documentElement.scrollHeight;
        while (y < max) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
          y += step;
        }
        window.scrollTo(0, 0);
      });
      // currentSrc can update to the final responsive-image pick before
      // naturalWidth reflects the fully-decoded resource (img.complete can
      // read true against a stale/placeholder decode mid-swap), so poll
      // until every img's (currentSrc, naturalWidth) pair stops changing
      // across consecutive samples rather than trusting a single snapshot.
      await page.evaluate(async () => {
        function snapshot() {
          return Array.from(document.querySelectorAll('img'))
            .map((img) => (img.currentSrc || img.src) + '|' + img.naturalWidth)
            .join(',,');
        }
        let prev = null;
        let stableCount = 0;
        const start = Date.now();
        while (Date.now() - start < 8000) {
          const cur = snapshot();
          if (cur === prev) {
            stableCount++;
            if (stableCount >= 3) break;
          } else {
            stableCount = 0;
          }
          prev = cur;
          await new Promise((r) => setTimeout(r, 150));
        }
      });

      const results = await page.evaluate((dpr) => {
        const out = [];
        document.querySelectorAll('img').forEach((img) => {
          const rect = img.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) return; // not visible/rendered
          const source = img.currentSrc || img.src;
          if (!source) return;
          out.push({
            source,
            renderedWidth: rect.width,
            naturalWidth: img.naturalWidth,
            alt: img.alt,
            outerHTML: img.outerHTML.slice(0, 140),
          });
        });
        return out;
      }, config.deviceScaleFactor);

      // Per the HTML spec, when srcset uses `w` descriptors together with a
      // `sizes` attribute, img.naturalWidth/Height are density-corrected
      // (decoded px / (descriptor / sizes-slot-width)) — NOT the loaded
      // file's raw pixel dimensions. Confirmed via isolated repro: the exact
      // same file read its real 1280w without sizes/srcset, but 475
      // (= 33vw of a 1440px viewport) with them. So re-decode each unique
      // currentSrc URL in isolation (no srcset/sizes on the probe element)
      // to get its true raw pixel width — the browser's HTTP cache makes
      // this cheap since the resource was already fetched.
      const uniqueSources = Array.from(new Set(results.map((r) => r.source)));
      const fileWidths = await page.evaluate(async (urls) => {
        const map = {};
        await Promise.all(urls.map((url) => new Promise((resolve) => {
          const probe = new Image();
          probe.onload = () => { map[url] = probe.naturalWidth; resolve(); };
          probe.onerror = () => { map[url] = 0; resolve(); };
          probe.src = url;
        })));
        return map;
      }, uniqueSources);
      results.forEach((r) => {
        r.fileWidth = fileWidths[r.source] || r.naturalWidth;
      });

      results.forEach((r) => {
        checkedTotal++;
        const required = (r.renderedWidth * config.deviceScaleFactor) / SLACK;
        if (r.fileWidth < required) {
          failures.push({
            page: pagePath,
            config: config.label,
            source: r.source,
            renderedWidth: Math.round(r.renderedWidth),
            fileWidth: r.fileWidth,
            required: Math.round(required),
            outerHTML: r.outerHTML,
          });
        }
      });
      await page.close();
    }
  }

  await browser.close();

  console.log('Checked ' + checkedTotal + ' visible <img> renders across ' + PAGES.length + ' pages x ' + CONFIGS.length + ' configs.');
  if (!failures.length) {
    console.log('No undersized images found.');
    return;
  }
  console.log('\nFAILURES (' + failures.length + '):');
  failures.forEach((f) => {
    console.log('- [' + f.page + ' @ ' + f.config + '] rendered ' + f.renderedWidth + 'px, needs >= ' + f.required + 'px file width, got ' + f.fileWidth + 'px');
    console.log('    ' + f.source);
  });
  process.exitCode = 1;
}

main();
