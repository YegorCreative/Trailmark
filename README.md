# Trailmark
Trailmark is a playful, illustrated guide to all 63 U.S. National Parks, featuring code-generated SVG badge artwork, park pages, facts, colors, and trip inspiration.

## How to add photos

Visitor photos are approved by hand. The site has no upload backend.

1. Save the original image in `photos/inbox/`. That folder is gitignored. Do not commit the original.
2. Add an entry to `js/photos-data.js` with `id`, `parkId`, `file` (the inbox filename), `photographer`, optional `caption`, `dateAdded`, `source` (`"visitor"` or `"owner"`), and an optional `link` to the photographer's site.
3. Run `python3 scripts/build-photos.py`. It writes `assets/photos/<parkId>/<id>-640.webp` and `-1280.webp`, keeps the aspect ratio, caps the long edge at 1280, and strips EXIF and GPS.
4. Run `node scripts/build-park-pages.js` so the park page and `photos.html` pick up the new pictures.
5. Commit the data entry and the WebP files. Leave the original in `photos/inbox/`.
