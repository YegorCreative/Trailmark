# TrailMark V1 build-out log

Branch: `v1-buildout`. Main is not committed to and is not pushed.

## Decisions

- Art paths live on each catalog entry as `art.header`, `art.badge`, and `art.extra` (`assets/park-art/<id>/...`). Cards, park pages, and the homepage badge board read those fields. `buildBadgeSvgInner()` remains only when a badge file is missing.
- `hero.posterSrc` stays as a fallback. The renderer prefers `art.header`.
- Yosemite’s page hero now uses `assets/park-art/yosemite/header.webp`. `assets/svg/yosemite.svg` stays in the repo.
- Acadia’s header override is `AcadiaHeader-Codex.png`. Empty `01-header 2` and `National_Parks_Artwork` are ignored by the art build and were not deleted.
- Badge photos are masked with `border-radius: 50%` and `object-fit: cover`.
- The extra illustration renders beside the wildlife section. It is meaningful art, so it has alt text.
- Multi-state parks use the first listed state for JSON-LD `addressRegion` unless `seo.addressRegion` is set. Yellowstone is `WY`.
- The validator allows repeated structural labels (“Park Overview”, “TrailMark Field Notes”) and flags repeated prose of 80 characters or more.
- `#about-trailmark` stays as a CSS id. GitHub URLs stay `Trailmark` because that is the repository name. Visible brand text is TrailMark.
- Hero focus is set for Yosemite (`50% 62%`), Yellowstone (`50% 68%`), and Everglades (`50% 60%`) from earlier full-image review. The other 60 still use the renderer default `50% 58%` until each crop is checked. Flagged for review.
- `.github/workflows/jekyll-gh-pages.yml` is removed. `static.yml` is the only Pages workflow.

## Phase 1 — shared system

Done in this phase:

- Shared art lookup, circular badges, extra illustration, page generator, validator, palette variables, mobile title placed under the hero image.
- Regenerated `parks/yosemite.html`, `parks/yellowstone.html`, and `parks/everglades.html` from `scripts/build-park-pages.js`. URLs unchanged. Skip link, breadcrumb classes, scripts, and the three descriptions are still present.
- `node scripts/validate-parks.js` passed for 3 essays.

## Later phases

Not started.
