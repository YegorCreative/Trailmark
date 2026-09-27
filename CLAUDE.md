# TrailMark — project rules for Claude Code

## What this is
TrailMark is an illustrated archive of the 63 U.S. national parks, built by Yegor Hambaryan. Static site on GitHub Pages: https://yegorcreative.github.io/Trailmark/. Yegor is the product owner; do what the prompt asks and nothing beyond it. If you see a worthwhile extra, list it under "Possible future improvement" in your report instead of doing it.

## Architecture (extend it, don't replace it)
- js/parks-data.js: catalog of all 63 parks (ids, names, regions, art, status)
- js/park-content.js: park essays (shared schema)
- js/park-render.js: shared renderer (build + browser); js/park-page.js: behavior only
- scripts/build-park-pages.js: generates parks/<id>.html, metadata, JSON-LD, sitemap.xml
- scripts/build-park-art.py: web images from assets/Parks/ originals into assets/park-art/<id>/
- scripts/validate-parks.js: content + metadata + a11y checks; must pass before every commit
- docs/V1-BUILDOUT-LOG.md: running log; docs/park-sources/<id>.md: NPS sources per park
- No frameworks, no build tools beyond these scripts. Never hand-edit generated park HTML; change the data or script and rebuild.

## Git workflow
- Work on branch v1-buildout. Never commit to or push main unless Yegor explicitly says so.
- One focused commit per task, with a clear message.
- Only one agent works in this folder at a time.
- Ignore macOS/iCloud duplicate files ("* 2.*"); never commit them.

## Content rules
- National Park Service is the authority. Open the NPS page(s) for every park and record them in docs/park-sources/<id>.md.
- Verify each park's national-park establishment year on NPS.
- Never invent numbers, quotes, or history. If NPS states a figure two ways, use the NPS statistics page or leave it out, and note it in the log.
- Time-sensitive info (fees, permits, shuttles, closures, reservations) points to NPS; never state it as permanent.
- No filler ("breathtaking beauty…"); every essay says what makes that park distinct.
- Denali: the mountain's official federal name is Mount McKinley (Executive Order 14172, 2025); the park is Denali National Park and Preserve. Stay neutral.
- Keep ʻokina and macrons in display names (Haleakalā, Hawaiʻi); slugs stay ASCII.

## SEO (automatic, via the build script)
Every page: unique title ≤60 characters (parks: "[Name] — [seo.titleHook] | TrailMark", or name-only if longer), meta description 70–160 characters, canonical, Open Graph/Twitter with an absolute og.jpg (1200×630), valid JSON-LD, in sitemap.xml if published. Update metadata in the same commit as any content change.

## Accessibility (WCAG 2.2 AA)
Skip link, one h1, logical headings, landmarks, alt text (decorative = alt=""), labeled controls, visible focus, keyboard-operable everything, ≥4.5:1 text contrast (including over art and on park palettes), tap targets ≥44px. Content is visible by default: reveal animations only when JS is on AND reduced motion is not requested. Run axe on changed pages: 0 serious/critical.

## Performance
Only the hero image loads eagerly (fetchpriority="high"); everything else is lazy with width/height and srcset (640/1280 headers, 160/320 badges). No backdrop-filter. One shared rAF-throttled scroll handler. Targets: page weight on open ≤1.5 MB; Lighthouse mobile ≥85.

## Report format (end of every task)
Starting HEAD, final HEAD, commits, files changed, what changed, validation actually performed (say plainly what you couldn't check), screenshots if visual (1440 and 390), parks published of 63, anything unresolved.
