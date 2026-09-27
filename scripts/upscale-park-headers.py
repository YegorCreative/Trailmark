#!/usr/bin/env python3
"""Regenerate the -2x header sources used by scripts/build-park-art.py.

Not part of the normal build; run by hand when source art changes. Requires
a local realesrgan-ncnn-vulkan binary (see docs/hero-upscale-sources.md for
why this uses native -s 4 plus an external Lanczos downscale to 2x, instead
of -s 2 directly). Writes "<original-stem>-2x.png" next to each original;
skips a park whose -2x file already exists.
"""
import argparse
import importlib.util
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_build_park_art():
    spec = importlib.util.spec_from_file_location("build_park_art", ROOT / "scripts" / "build-park-art.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def find_header_sources(bpa):
    parks = bpa.load_parks()
    by_key = {bpa.normalize_title(p["name"]): p for p in parks}
    folders_by_id = {}
    for entry in sorted(bpa.SOURCE_ROOT.iterdir(), key=lambda p: p.name.lower()):
        if not entry.is_dir():
            continue
        match = re.match(r"^(\d+)-(.+)$", entry.name)
        if not match:
            continue
        park = by_key.get(bpa.normalize_title(match.group(2)))
        if park:
            folders_by_id[park["id"]] = entry

    sources = {}
    for park in parks:
        folder = folders_by_id.get(park["id"])
        if not folder:
            continue
        found = bpa.images_in(folder / "01-header")
        if park["id"] in bpa.HEADER_FILE_OVERRIDES and len(found) != 1:
            wanted = bpa.HEADER_FILE_OVERRIDES[park["id"]]
            found = [p for p in found if p.name == wanted]
        if len(found) == 1:
            sources[park["id"]] = found[0]
    return sources


def upscale_one(realesrgan, src: Path, tmp_4x: Path):
    from PIL import Image

    dest = src.with_name(src.stem + "-2x.png")
    if dest.exists():
        return "skip-exists"
    if tmp_4x.exists():
        tmp_4x.unlink()
    proc = subprocess.run(
        [str(realesrgan), "-i", str(src), "-o", str(tmp_4x), "-s", "4", "-n", "realesrgan-x4plus-anime"],
        capture_output=True, timeout=120, cwd=str(realesrgan.parent),
    )
    if proc.returncode != 0 or not tmp_4x.exists():
        return "fail: " + proc.stderr.decode("utf-8", errors="replace")[-300:]
    with Image.open(tmp_4x) as image:
        image.resize((image.width // 2, image.height // 2), Image.LANCZOS).save(dest, "PNG")
    tmp_4x.unlink()
    return "ok"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--realesrgan", required=True, help="path to the realesrgan-ncnn-vulkan binary")
    args = parser.parse_args()
    realesrgan = Path(args.realesrgan).expanduser().resolve()
    if not realesrgan.is_file():
        raise SystemExit("Not found: %s" % realesrgan)

    bpa = load_build_park_art()
    sources = find_header_sources(bpa)
    print("found %d header sources" % len(sources))
    tmp_4x = Path("/tmp/upscale-park-headers-4x.png")
    results = {}
    for i, (park_id, src) in enumerate(sorted(sources.items()), 1):
        status = upscale_one(realesrgan, src, tmp_4x)
        results[park_id] = status
        print("[%d/%d] %s: %s" % (i, len(sources), park_id, status))
    fails = {k: v for k, v in results.items() if v.startswith("fail")}
    if fails:
        print("FAILURES:", fails)
        sys.exit(1)


if __name__ == "__main__":
    main()
