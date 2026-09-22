#!/usr/bin/env python3
"""Independent two-sided source-line coverage audit."""
from __future__ import annotations

import hashlib
import json
from collections import Counter
from pathlib import Path

from source_classification import generic_metadata_line, metadata_line_numbers

HERE = Path(__file__).resolve().parent
IDS = [f"OUTSIDE67-PATH-{n:03d}" for n in range(11, 16)]
ALLOWED = {"atomized_candidate", "metadata_only", "composite_unresolved"}


def digest(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def fail(message: str) -> None:
    raise SystemExit("FAIL coverage-audit: " + message)


def main() -> None:
    coverage = [json.loads(line) for line in (HERE / "line-coverage.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
    pre_keys, archive_keys = set(), set()
    source = {}
    pre_metadata = {}
    archive_metadata = {}
    for sid in IDS:
        pre = (HERE / "source-snapshots" / sid / "pre-isolation.md").read_text(encoding="utf-8").splitlines()
        archive = (HERE / "source-snapshots" / sid / "archive-revision.md").read_text(encoding="utf-8").splitlines()
        pre_metadata[sid] = metadata_line_numbers(pre)
        archive_metadata[sid] = metadata_line_numbers(archive)
        for no, text in enumerate(pre, 1):
            pre_keys.add((sid, no)); source[(sid, "pre", no)] = text
        for no, text in enumerate(archive, 1):
            archive_keys.add((sid, no)); source[(sid, "archive", no)] = text
    actual_pre, actual_archive = [], []
    counts = Counter()
    for row in coverage:
        sid = row.get("source_item_id")
        if sid not in IDS or row.get("category") not in ALLOWED:
            fail("unknown source or category")
        pre_no, archive_no = row.get("pre_line"), row.get("archive_line")
        if pre_no is not None:
            key = (sid, pre_no)
            actual_pre.append(key)
            text = source.get((sid, "pre", pre_no))
            if text is None or row.get("pre_text") != text or row.get("pre_line_sha256") != digest(text):
                fail(f"pre anchor mismatch {key}")
        if archive_no is not None:
            key = (sid, archive_no)
            actual_archive.append(key)
            text = source.get((sid, "archive", archive_no))
            if text is None or row.get("archive_text") != text or row.get("archive_line_sha256") != digest(text):
                fail(f"archive anchor mismatch {key}")
        pre_is_meta = pre_no is None or pre_no in pre_metadata[sid] or generic_metadata_line(row.get("pre_text") or "")
        archive_is_meta = archive_no is None or archive_no in archive_metadata[sid] or generic_metadata_line(row.get("archive_text") or "")
        if row.get("category") == "metadata_only" and not (pre_is_meta and archive_is_meta):
            fail(f"normative line fell back to metadata {sid}:{pre_no}:{archive_no}")
        if pre_no is not None and archive_no is not None and pre_is_meta and archive_is_meta and row.get("category") != "metadata_only":
            fail(f"metadata line category mismatch {sid}:{pre_no}:{archive_no}")
        if (row.get("category") == "atomized_candidate") != bool(row.get("atom_ids")):
            fail(f"atomized category/atom_ids mismatch {sid}:{pre_no}:{archive_no}")
        counts[row["category"]] += 1
    if len(actual_pre) != len(set(actual_pre)) or set(actual_pre) != pre_keys:
        fail("pre-isolation lines are not covered once")
    if len(actual_archive) != len(set(actual_archive)) or set(actual_archive) != archive_keys:
        fail("archive lines are not covered once")
    inv = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
    if inv["line_accounting"]["category_counts"] != dict(counts) or inv["line_accounting"]["selected_line_residual_count"] != 0:
        fail("inventory accounting mismatch")
    print(f"PASS coverage-audit: pre={len(pre_keys)} archive={len(archive_keys)} records={len(coverage)} counts={dict(counts)}")


if __name__ == "__main__":
    main()
