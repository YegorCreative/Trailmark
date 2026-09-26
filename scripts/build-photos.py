#!/usr/bin/env python3
"""Build visitor-photo WebPs from photos/inbox.

Reads js/photos-data.js, opens each entry's original, and writes
assets/photos/<parkId>/<id>-640.webp and <id>-1280.webp.
Aspect ratio is kept. The long edge is capped at 1280 (and 640).
EXIF, GPS, and other metadata are not copied. Originals are not modified.
"""

import json
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
INBOX = ROOT / "photos" / "inbox"
OUT = ROOT / "assets" / "photos"
QUALITY = 82


def load_photos():
    script = (
        "const fs=require('fs');"
        "const src=fs.readFileSync('js/photos-data.js','utf8');"
        "const data=new Function(src+'\\nreturn PHOTOS;')();"
        "process.stdout.write(JSON.stringify(data));"
    )
    raw = subprocess.check_output(["node", "-e", script], cwd=ROOT, text=True)
    return json.loads(raw)


def clean_image(path):
    with Image.open(path) as image:
        image = ImageOps.exif_transpose(image)
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")
        else:
            image = image.copy()
    # A new buffer drops EXIF, GPS, ICC, and XMP from the source.
    bare = Image.frombytes(image.mode, image.size, image.tobytes())
    return bare


def write_capped(image, dest, cap):
    copy = image.copy()
    copy.thumbnail((cap, cap), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    copy.save(dest, "WEBP", quality=QUALITY, method=6)


def main():
    photos = load_photos()
    if not photos:
        print("build-photos: no entries")
        return
    for photo in photos:
        park_id = str(photo.get("parkId") or "")
        photo_id = str(photo.get("id") or "")
        filename = str(photo.get("file") or "")
        if not park_id or not photo_id or not filename:
            raise SystemExit("entry is missing id, parkId, or file: %s" % photo)
        if "/" in photo_id or "\\" in photo_id or "/" in filename or "\\" in filename:
            raise SystemExit("id and file must be plain filenames: %s" % photo_id)
        source = INBOX / filename
        if not source.is_file():
            raise SystemExit("missing original: photos/inbox/%s" % filename)
        image = clean_image(source)
        folder = OUT / park_id
        write_capped(image, folder / (photo_id + "-1280.webp"), 1280)
        write_capped(image, folder / (photo_id + "-640.webp"), 640)
        print("wrote %s/%s" % (park_id, photo_id))
    print("build-photos: %s photos" % len(photos))


if __name__ == "__main__":
    try:
        main()
    except BrokenPipeError:
        sys.exit(1)
