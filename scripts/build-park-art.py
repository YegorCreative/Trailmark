#!/usr/bin/env python3
"""Build web-ready WebP copies from assets/Parks.

Reads the original artwork only. Never renames, moves, or edits files under
assets/Parks. Safe to re-run: each run rewrites assets/park-art and the manifest.

Requires Pillow, which is already available in this environment. No packages
are installed.

Header copies stay at their native width up to 1672px and are saved as WebP
quality 80. Badge and extra copies are center-cropped to a square, then fit
into 600x600 without upscaling. A slot with zero files or more than one file
is reported and skipped, so duplicates are never chosen automatically.
"""

import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PARKS_DATA = ROOT / "js" / "parks-data.js"
SOURCE_ROOT = ROOT / "assets" / "Parks"
OUTPUT_ROOT = ROOT / "assets" / "park-art"
MANIFEST_PATH = OUTPUT_ROOT / "manifest.json"

HEADER_MAX_WIDTH = 1672
SQUARE_SIZE = 600
WEBP_QUALITY = 80
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp"}
SLOT_DIRS = {
    "header": "01-header",
    "badge": "02-badge",
    "extra": "03-extra",
}
OUTPUT_NAMES = {
    "header": "header.webp",
    "badge": "badge.webp",
    "extra": "extra.webp",
}
# When a slot has more than one file, use this filename instead of skipping.
HEADER_FILE_OVERRIDES = {
    "acadia": "AcadiaHeader-Codex.png",
}


def normalize_title(title):
    text = title.lower().replace("’", "'").replace("`", "'")
    text = text.replace("'", "")
    text = re.sub(r"^national park of\s+", "", text)
    text = re.sub(r"\bnational park and preserve\b", "", text)
    text = re.sub(r"\bnational and state parks\b", "", text)
    text = re.sub(r"\bnational park\b", "", text)
    text = text.replace("&", " and ").replace("-", " ").replace(".", " ")
    text = re.sub(r"[^a-z0-9 ]", "", text)
    return re.sub(r"\s+", " ", text).strip()


def load_parks():
    source = PARKS_DATA.read_text(encoding="utf-8")
    ids = re.findall(r"\bid: '([^']+)'", source)
    names = re.findall(r"\bname: '([^']+)'", source)
    if len(ids) != len(names):
        raise SystemExit(
            "Could not pair park ids and names in js/parks-data.js "
            "(%s ids, %s names)." % (len(ids), len(names))
        )
    return [{"id": park_id, "name": name} for park_id, name in zip(ids, names)]


def rel(path):
    return path.relative_to(ROOT).as_posix()


def images_in(directory):
    if not directory.is_dir():
        return []
    return sorted(
        (
            path
            for path in directory.iterdir()
            if path.is_file() and path.suffix.lower() in IMAGE_EXTS
        ),
        key=lambda path: path.name.lower(),
    )


def prepare_image(src, slot):
    with Image.open(src) as image:
        if image.mode == "RGBA":
            background = Image.new("RGB", image.size, (247, 243, 236))
            background.paste(image, mask=image.getchannel("A"))
            image = background
        elif image.mode != "RGB":
            image = image.convert("RGB")
        else:
            image = image.copy()

    if slot == "header":
        if image.width > HEADER_MAX_WIDTH:
            height = max(1, round(image.height * HEADER_MAX_WIDTH / image.width))
            image = image.resize((HEADER_MAX_WIDTH, height), Image.Resampling.LANCZOS)
        return image

    side = min(image.width, image.height)
    if side < SQUARE_SIZE:
        return image
    left = (image.width - side) // 2
    top = (image.height - side) // 2
    image = image.crop((left, top, left + side, top + side))
    if side != SQUARE_SIZE:
        image = image.resize((SQUARE_SIZE, SQUARE_SIZE), Image.Resampling.LANCZOS)
    return image


def write_webp(image, dest):
    dest.parent.mkdir(parents=True, exist_ok=True)
    image.save(dest, "WEBP", quality=WEBP_QUALITY, method=4)


def main():
    parks = load_parks()
    by_key = {}
    for park in parks:
        key = normalize_title(park["name"])
        if key in by_key:
            raise SystemExit("Two parks normalize to the same key: %s" % key)
        by_key[key] = park

    problems = []
    matched_ids = set()
    folders_by_id = {}

    if not SOURCE_ROOT.is_dir():
        raise SystemExit("Missing source folder: %s" % SOURCE_ROOT)

    for entry in sorted(SOURCE_ROOT.iterdir(), key=lambda path: path.name.lower()):
        if not entry.is_dir():
            if entry.name == ".DS_Store":
                continue
            problems.append({
                "issue": "unexpected-file",
                "path": rel(entry),
            })
            continue

        folder_match = re.match(r"^(\d+)-(.+)$", entry.name)
        if not folder_match:
            has_images = any(
                path.is_file() and path.suffix.lower() in IMAGE_EXTS
                for path in entry.rglob("*")
            )
            if has_images:
                problems.append({
                    "issue": "unmatched-folder",
                    "path": rel(entry),
                })
            continue

        key = normalize_title(folder_match.group(2))
        park = by_key.get(key)
        if not park:
            problems.append({
                "issue": "unmatched-folder",
                "path": rel(entry),
                "normalized": key,
            })
            continue
        if park["id"] in folders_by_id:
            problems.append({
                "issue": "duplicate-folder",
                "parkId": park["id"],
                "path": rel(entry),
            })
            continue
        folders_by_id[park["id"]] = entry
        matched_ids.add(park["id"])

    for park in parks:
        if park["id"] not in folders_by_id:
            problems.append({
                "issue": "missing-folder",
                "parkId": park["id"],
                "name": park["name"],
            })

    manifest_parks = {}
    source_notes = {}

    for park in parks:
        park_id = park["id"]
        folder = folders_by_id.get(park_id)
        slots = {slot: [] for slot in SLOT_DIRS}
        notes = []

        if folder:
            notes = sorted(
                (
                    path
                    for path in folder.iterdir()
                    if path.is_file() and path.name.lower().startswith("sources") and path.suffix.lower() == ".txt"
                ),
                key=lambda path: path.name.lower(),
            )
            known_dirs = set(SLOT_DIRS.values())
            for child in sorted(folder.iterdir(), key=lambda path: path.name.lower()):
                if child.is_file():
                    if child in notes or child.name == ".DS_Store":
                        continue
                    problems.append({
                        "issue": "unexpected-file",
                        "parkId": park_id,
                        "path": rel(child),
                    })
                    continue
                if not child.is_dir():
                    continue
                slot = next((name for name, dirname in SLOT_DIRS.items() if child.name == dirname), None)
                if slot:
                    slots[slot].extend(images_in(child))
                    continue
                extra_images = images_in(child)
                header_alias = child.name.lower().startswith("01-header")
                if header_alias and extra_images:
                    slots["header"].extend(extra_images)
                    problems.append({
                        "issue": "extra-header-directory",
                        "parkId": park_id,
                        "path": rel(child),
                        "files": [rel(path) for path in extra_images],
                    })
                elif extra_images:
                    problems.append({
                        "issue": "unexpected-directory",
                        "parkId": park_id,
                        "path": rel(child),
                        "imageCount": len(extra_images),
                    })

        source_notes[park_id] = [rel(path) for path in notes]
        if folder and not notes:
            problems.append({
                "issue": "missing-source-note",
                "parkId": park_id,
                "path": rel(folder),
            })

        out_dir = OUTPUT_ROOT / park_id
        entry = {}
        for slot, filename in OUTPUT_NAMES.items():
            found = slots[slot]
            if slot == "header" and park_id in HEADER_FILE_OVERRIDES and len(found) != 1:
                wanted = HEADER_FILE_OVERRIDES[park_id]
                chosen = [path for path in found if path.name == wanted]
                if len(chosen) == 1:
                    found = chosen
                else:
                    problems.append({
                        "issue": "override-not-found",
                        "parkId": park_id,
                        "slot": slot,
                        "wanted": wanted,
                        "files": [rel(path) for path in found],
                    })
            dest = out_dir / filename
            web_path = "assets/park-art/%s/%s" % (park_id, filename)
            if len(found) == 1:
                image = prepare_image(found[0], slot)
                if slot != "header" and (image.width != SQUARE_SIZE or image.height != SQUARE_SIZE):
                    problems.append({
                        "issue": "below-target-size",
                        "parkId": park_id,
                        "slot": slot,
                        "source": rel(found[0]),
                        "size": [image.width, image.height],
                    })
                write_webp(image, dest)
                entry[slot] = web_path
            else:
                if dest.exists():
                    dest.unlink()
                entry[slot] = None
                problems.append({
                    "issue": "duplicate" if len(found) > 1 else "missing",
                    "parkId": park_id,
                    "slot": slot,
                    "files": [rel(path) for path in found],
                })
        manifest_parks[park_id] = entry

    # Drop output directories left from a park id that no longer exists.
    if OUTPUT_ROOT.exists():
        known = set(manifest_parks)
        for child in OUTPUT_ROOT.iterdir():
            if child.is_dir() and child.name not in known:
                for stale in child.glob("*.webp"):
                    stale.unlink()
                try:
                    child.rmdir()
                except OSError:
                    pass

    manifest = {
        "parks": manifest_parks,
        "problems": problems,
        "sourceNotes": source_notes,
    }
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    written = [
        path
        for park in manifest_parks.values()
        for path in park.values()
        if path
    ]
    print("parks %s" % len(manifest_parks))
    print("written %s" % len(written))
    print("problems %s" % len(problems))
    for problem in problems:
        print("PROBLEM %s" % json.dumps(problem, sort_keys=True))


if __name__ == "__main__":
    main()
