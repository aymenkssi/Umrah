"""Builds audio_catalog.json: the list of du'as that can receive a recording in the admin page.

The keys must match frontend/utils/audioKeys.ts. Run after changing the du'as of the app:
    python backend/build_audio_catalog.py
(tests/test_audio.py fails when the catalog is out of date).
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "frontend" / "data"
OUT = Path(__file__).resolve().parent / "audio_catalog.json"


def build() -> list:
    catalog = []
    steps = sorted(
        json.loads((DATA / "umrah-steps.json").read_text(encoding="utf-8")), key=lambda s: s["order"]
    )
    for step in steps:
        title = step["title"]
        if step.get("dua"):
            catalog.append(
                {
                    "key": f"step-{step['id']}",
                    "group": "guide",
                    "section": title["fr"],
                    "arabic": step["dua"]["ar"],
                    "label": step["dua"]["fr"],
                }
            )
        for i, extra in enumerate(step.get("additionalDuas", [])):
            catalog.append(
                {
                    "key": f"step-{step['id']}-extra-{i}",
                    "group": "guide",
                    "section": title["fr"],
                    "arabic": extra["ar"],
                    "label": extra["fr"],
                }
            )
    for category in json.loads((DATA / "general-duas.json").read_text(encoding="utf-8")):
        for i, dua in enumerate(category["duas"]):
            catalog.append(
                {
                    "key": f"dua-{category['id']}-{i}",
                    "group": "duas",
                    "section": category["category"]["fr"],
                    "arabic": dua["arabic"],
                    "label": (dua.get("translation") or {}).get("fr", ""),
                }
            )
    return catalog


def render() -> str:
    return json.dumps(build(), ensure_ascii=False, indent=1) + "\n"


if __name__ == "__main__":
    OUT.write_text(render(), encoding="utf-8")
    print(f"{OUT.name}: {len(build())} entries")
