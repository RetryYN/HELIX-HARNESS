#!/usr/bin/env python3
"""Independent line partition audit for the five selected source pairs."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
SELECTED = [f"OUTSIDE67-PATH-{n:03d}" for n in range(6, 11)]
ALLOWED = {"atomized_candidate", "metadata_only", "composite_unresolved"}
EXPECTED = {"metadata_only": 101, "atomized_candidate": 10, "composite_unresolved": 72}


def fail(message: str) -> None:
    raise SystemExit("FAIL coverage-audit: " + message)


def digest(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def main() -> None:
    coverage = [json.loads(line) for line in (HERE / "line-coverage.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
    expected_keys = set()
    expected_text = {}
    for sid in SELECTED:
        raw = (HERE / "source-snapshots" / sid / "pre-isolation.md").read_text(encoding="utf-8")
        archive = (HERE / "source-snapshots" / sid / "archive-revision.md").read_text(encoding="utf-8")
        if raw != archive:
            fail(f"pre/archive drift {sid}")
        for line_no, text in enumerate(raw.splitlines(), 1):
            key = (sid, line_no)
            expected_keys.add(key)
            expected_text[key] = text
    actual_keys = [(row.get("source_item_id"), row.get("source_line")) for row in coverage]
    if len(coverage) != len(expected_keys) or len(set(actual_keys)) != len(actual_keys):
        fail("coverage keys are not unique 1:1")
    if set(actual_keys) != expected_keys:
        fail("coverage does not equal every selected snapshot line")
    counts = {kind: 0 for kind in ALLOWED}
    for row in coverage:
        key = (row.get("source_item_id"), row.get("source_line"))
        if row.get("category") not in ALLOWED:
            fail(f"invalid or overlapping category {key}")
        text = expected_text[key]
        if row.get("archive_line") != key[1] or row.get("pre_text") != text or row.get("archive_text") != text or row.get("pre_line_sha256") != digest(text) or row.get("archive_line_sha256") != digest(text):
            fail(f"line anchor mismatch {key}")
        counts[row["category"]] += 1
    if counts != EXPECTED:
        fail(f"category counts {counts} != {EXPECTED}")
    inv = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
    if inv["line_accounting"]["selected_line_residual_count"] != 0:
        fail("inventory claims selected line residual")
    print(f"PASS coverage-audit: {len(expected_keys)}/{len(expected_keys)} lines, disjoint categories, counts={counts}")


if __name__ == "__main__":
    main()
