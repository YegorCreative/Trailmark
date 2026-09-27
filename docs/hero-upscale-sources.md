# Hero image upscaling

Every park's `01-header` source was a single 1672×941 painting. Heroes render
full-viewport with `object-fit: cover`, so on a 1440–1600px-wide desktop
viewport — let alone a 2x/3x-DPR phone — the browser was stretching that
1280px-wide (or smaller) served file well past its native resolution.

`assets/Parks/<park>/01-header/*-2x.png` files (3344×1882, 2x the original)
fix this. They are **not committed** — `.gitignore` excludes `*-2x.png` and
`*-4x.png` because they're large (~5.5 MB each, ~350 MB total) and fully
regenerable from the originals already in git. `scripts/build-park-art.py`
prefers a `-2x` file over the 1x original automatically when one exists next
to it; with no `-2x` file present it falls back to the original unchanged.

## Regenerating the -2x sources

Requires [Real-ESRGAN's ncnn-vulkan build](https://github.com/xinntao/Real-ESRGAN/releases)
(the `realesrgan-ncnn-vulkan-*-macos.zip` asset) downloaded and extracted
somewhere, and Vulkan/Metal support (works on Apple Silicon).

```
python3 scripts/upscale-park-headers.py --realesrgan /path/to/realesrgan-ncnn-vulkan
```

### Why native 4x, then downscale — not `-s 2` directly

`realesrgan-ncnn-vulkan -s 2 -n realesrgan-x4plus-anime` (and `-s 4` with
smaller `-t` tile sizes) produced visible tile-grid seams on every image
tested on this machine (Apple M4 Max) — a known tiling/blending issue on
some Vulkan/Metal driver combinations, confirmed with both
`realesrgan-x4plus-anime` and `realesrgan-x4plus`, and confirmed worse (not
better) at smaller tile sizes (`-t 128`, `-t 64`).

Running the model at its native `-s 4` scale (no internal post-downscale)
produced clean output with no seams in every 100%-zoom crop checked (sky
gradients, cliff edges, foliage) across 6 parks spanning very different
scenes (Zion, Arches, Everglades, Gateway Arch, Yellowstone, Capitol Reef).
Downscaling that clean 4x (6688×3764) result to 2x (3344×1882) with Pillow's
`LANCZOS` filter — a separate, unrelated code path — kept it clean. That's
what `upscale-park-headers.py` does: `-s 4`, then a Lanczos halving, per
source image, about 5 seconds each.

Model: `realesrgan-x4plus-anime`, matching this archive's illustrated
(not photographic) style.
