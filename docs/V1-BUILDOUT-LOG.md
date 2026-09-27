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

## Phase 2 — motion

Done. The existing `[data-speed]` parallax now also applies a slight scale, and `[data-parallax="fade"]` eases the hero title as it scrolls away. Small screens and coarse pointers use 0.35× of that movement. `prefers-reduced-motion: reduce` disables parallax and reveals and keeps content visible. Scroll reveals use IntersectionObserver. Card, badge, highlight, season, and discovery hover states also run on `:focus-within`. Cards show the park header image inside the badge frame so the zoom has a subject. Only transform and opacity are animated.

## Phase 3

### Batch 1 — Grand Canyon, Acadia, Zion, Olympic, Glacier, Great Smoky Mountains

Published. Validator passed for 9 essays. Pages generated.

Needs fact review, because a live NPS page was not opened while writing them: Acadia, Zion, Olympic, Glacier, Great Smoky Mountains. Grand Canyon numbers come from the NPS statistics page and are recorded in `docs/park-sources/grand-canyon.md`.

Hero focus for these six was set from the header images: Grand Canyon `42% 58%` (river bend, not the watchtower), Acadia `62% 48%` (lighthouse and headland), Zion `62% 46%` (cliff wall), Olympic `55% 48%` (river corridor), Glacier `58% 42%` (lit peaks), Smokies `48% 46%` (layered ridges). The other unpublished parks still use the default `50% 58%`.

### Batch 2 — Bryce Canyon, Arches, Canyonlands, Capitol Reef, Death Valley, Joshua Tree

Published. Validator passed for 15 essays.

Live NPS pages opened: Bryce geology (hoodoos, amphitheater), Arches nature (arch density, high desert, soil crust), Death Valley nature (Badwater −282 feet, Panamints, heat, plant count, Racetrack, Devil's Hole).

Needs fact review: Canyonlands and Capitol Reef and Joshua Tree in full. Bryce, Arches, and Death Valley for establishment years and any sentence not taken from the pages above. Hero focus was set from the header images for a tall crop: Bryce `42% 58%`, Arches `68% 42%` (the span), Canyonlands `40% 55%` (river, not the cave frame), Capitol Reef `72% 40%` (white dome), Death Valley `62% 42%` (peaks above the salt), Joshua Tree `74% 46%` (yuccas on the right).

Next batch after Joshua Tree: Saguaro, Petrified Forest, Great Sand Dunes, White Sands, Carlsbad Caverns, Guadalupe Mountains.

### Batch 3 — Saguaro, Petrified Forest, Great Sand Dunes, White Sands, Carlsbad Caverns, Guadalupe Mountains

Published. Validator passed for 21 essays. Pages generated. Sources are in `docs/park-sources/`.

National-park years checked on NPS: Saguaro 1994 (monument March 1, 1933), Petrified Forest 1962 (monument 1906, from the FAQ), Great Sand Dunes 2004 (monument 1932, dunefield only), White Sands December 20, 2019 (monument January 18, 1933), Carlsbad Caverns May 14, 1930 (monument October 25, 1923), Guadalupe Mountains 1972.

Hero focus from the 390-pixel-tall crop: Saguaro `64% 50%`, Petrified Forest `58% 68%`, Great Sand Dunes `52% 48%`, White Sands `58% 62%`, Carlsbad Caverns `55% 58%`, Guadalupe Mountains `68% 46%`.

No park in this batch is marked needs-fact-review. Numbers that were not on the opened pages were left out, including a White Sands dune height, Carlsbad room dimensions and bat counts, and a Guadalupe Peak elevation.

Next unpublished parks are the other 42. A sensible following batch is Big Bend, Mesa Verde, Black Canyon of the Gunnison, Rocky Mountain, Great Basin, and Grand Teton.

### Batch 4 — Big Bend, Mesa Verde, Black Canyon of the Gunnison, Rocky Mountain, Great Basin, Grand Teton

Published. Sources are in `docs/park-sources/`. National-park years checked on NPS: Big Bend established June 12, 1944 (authorized June 20, 1935); Mesa Verde June 29, 1906; Black Canyon of the Gunnison October 21, 1999 (monument 1933); Rocky Mountain legislation January 26, 1915, dedicated September 4, 1915; Great Basin October 27, 1986; Grand Teton original park February 26, 1929, present park September 14, 1950.

Hero focus from the header paintings for a tall crop: Big Bend `50% 55%` (river between walls), Mesa Verde `70% 46%` (alcove on the right), Black Canyon `62% 48%` (striped wall), Rocky Mountain `56% 38%` (summit over the lake), Great Basin `74% 50%` (bristlecone), Grand Teton `50% 38%` (skyline).

Black Canyon's full name does not leave room for a title hook inside 60 characters. The hook "Painted Walls" is stored and the title is the name only.

No park in this batch is marked needs-fact-review. The Big Bend year comes from the NPS fossils history because the park history index did not load. Numbers that were not on the opened pages were left out, including a bighorn count at Rocky Mountain and a falcon count at Black Canyon.

Next unpublished parks are the other 36.

## SEO metadata

- `scripts/build-park-pages.js` writes each park title, description, canonical, Open Graph, Twitter card, and JSON-LD, and pre-renders the article into `#park-page`. `js/park-render.js` is shared with the browser. `js/park-page.js` only binds chapters, tilt, and reveals when the article is already in the page.
- The same script rewrites the parks index ItemList and `sitemap.xml`. Unpublished parks stay out of the sitemap. `robots.txt`, `404.html`, and favicon files live at the site root.
- `scripts/validate-parks.js` checks titles, descriptions, canonicals, image files, JSON-LD, sitemap membership, alt text, and a single h1.

## Homepage fixes

- Replaced the homepage hero art. `assets/svg/parks.svg` stays in the repo and is no longer used. The hero crossfades six published headers (Yosemite, Yellowstone, Grand Canyon, Olympic, Zion, Everglades), about 6 seconds each with a 1.5 second fade, inside the existing parallax layer. Only Yosemite loads eagerly. `prefers-reduced-motion` keeps that one still image.
- The left scrim is darker so the cream headline, cream subtitle, and gold eyebrow stay above 4.5:1 even over a white image (calculated about 9:1 or higher under an 82% dark scrim).
- Badge-board status is set from `pageUrl`. Grand Canyon now reads Available. Section and closing lines no longer name a fixed set of three parks.
- Featured cards align the text to the top and pin the button to the bottom, so the right column does not sit as a centered block with a large empty gap.
- Hidden-discovery cards no longer use a tall box with content pushed to the bottom.
- The overview lead is a deliberate large serif. The body paragraphs under it share one size. A specificity bug had been shrinking the lead.

## Navigation

- `parks.html` is the all-parks index. Filters write `region`, `state`, `landscape`, `status`, `sort`, and `q` into the URL.
- Each park has one `landscape` value used by those filters: mountain, desert, canyon, coast/island, forest, wetland, volcanic, arctic, or cave. Gateway Arch is filed under forest because the filter list has no civic type. Kings Canyon is canyon. Olympic is forest.
- Open parks carry `archiveSeq` in catalog order. "Newest in archive" sorts by that number, highest first.
- The desktop Parks menu lists only regions that already have an open park, plus a link to all 63. The mobile menu lists every park, with unpublished ones labeled Coming soon and not linked.
- Homepage hero art is pinned to the bottom edge. Parallax on that layer scales from the bottom and does not translate the painting upward. Badges stay circles (`aspect-ratio: 1`), not ovals inside rounded plates.
- Homepage type is Fraunces for display and Outfit for text. The hero is a full viewport. The crossfade still runs, with a Ken Burns scale from the bottom and a slide caption. The badge board is a wall of all 63 circular marks.
- Park pages use a full-viewport hero, a sticky chapter nav, full-bleed image breaks, previous and next open parks, and a same-landscape row. Breadcrumbs are Home, Parks, region filter, park. Cross-document view transitions name each open park image `park-<id>`.

## Card height and park-year label

- Featured cards no longer stretch to the height of the secondary stack (`align-items: start` on the grid) and the Explore button is no longer pushed to the bottom of a tall column.
- The hero meta label is "National Park since" followed by the year. Fact labels that said "Protected" now say "National Park since". The year strings themselves were not rewritten.

## Simple navigation and performance

- The desktop mega-menu is gone. Parks is a plain link to `parks.html`. The mobile menu is four text links: Parks, About, FAQ, Contact. No park list, thumbnails, badges, or Coming soon toggle, and no park image in the header.
- `scripts/build-park-art.py` also writes `header-640.webp`, `header-1280.webp`, `badge-160.webp`, and `badge-320.webp`. Cards and tiles use the 640 header. Heroes use 1280, with the full 1672 file only when the slot is wider than that. Badges use 160 and 320, not the 600 circle.
- The hero image is the only eager image (`fetchpriority="high"`). Everything else is lazy. Index cards after the first six, strip cards after the first three, the badge wall, and landscape tiles stay on `data-src` until the first scroll, then an IntersectionObserver fills them. That is what keeps `parks.html` from downloading the whole grid on open.
- The homepage crossfade loads the first slide only, then the next slide just before it is shown. The Ken Burns zoom is gone. Hero parallax scales from the bottom edge so the foreground is not translated out of the frame. Parallax does not run on full-bleed breaks.
- One requestAnimationFrame scroll listener updates the solid header, the hero scale, and the chapter marker. Positions are cached on resize. Backdrop-filter blur is removed. The grain overlay is not painted. Badge tilt runs only for a fine pointer that can hover. `will-change` is set only on the hero layer while it is in view.
- Hero pages fix the header in CSS (`body:has(#hero)` and `body:has([data-park-id])`) so the bar does not leave the document flow after script runs. The index and the empty park shell reserve at least one viewport, so the footer is below the fold when script fills the page.
- Open-page bytes in headless Chrome, no scrolling, site and font bytes only, 1440×900: homepage 0.39 MB, `parks.html` 0.53 MB, `parks/zion.html` 0.54 MB.
- Lighthouse mobile performance: homepage 96 (LCP 2.6 s, CLS 0.002, TBT 0 ms), `parks.html` 95 (LCP 2.9 s, CLS 0, TBT 0 ms), `zion.html` 88 (LCP 3.4 s, CLS 0.051, TBT 0 ms).
- A Performance scroll of `zion.html` at 4× CPU slowdown covered the page in 238 frames. No frame gap was over 32 ms. The worst gap was 16.8 ms.
