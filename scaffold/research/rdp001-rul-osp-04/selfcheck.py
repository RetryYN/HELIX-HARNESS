#!/usr/bin/env python3
"""候補の意味境界を壊す変更を read-only validator が拒否する否定例。"""

from __future__ import annotations

import copy
import json
import tempfile
from pathlib import Path

import validate


def run_case(name, mutate):
    with tempfile.TemporaryDirectory(prefix="rdp001-osp04-selfcheck-") as td:
        tmp = Path(td)
        original_candidates = validate.CANDIDATES
        original_manifest = validate.MANIFEST
        rows = [row for _, row in validate.load_jsonl(original_candidates)]
        manifest = json.loads(original_manifest.read_text(encoding="utf-8"))
        mutate(rows, manifest)
        candidate_path = tmp / "atom-candidates.jsonl"
        manifest_path = tmp / "manifest.json"
        candidate_path.write_text("".join(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n" for row in rows), encoding="utf-8")
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        validate.CANDIDATES = candidate_path
        validate.MANIFEST = manifest_path
        try:
            errors = validate.check()
        finally:
            validate.CANDIDATES = original_candidates
            validate.MANIFEST = original_manifest
        if not errors:
            raise AssertionError(f"{name}: validatorが改変を受理した")
        print(f"PASS {name}: {errors[0]}")


def main() -> int:
    run_case("primary-secondary relation swap", lambda rows, manifest: next(row for row in rows if row["relation"] == "primary").update(relation="secondary_relation"))
    run_case("source span text drift", lambda rows, manifest: rows[0]["source_spans"][0].update(source_text="改変"))
    run_case("legacy asset digest drift", lambda rows, manifest: rows[0]["source_spans"][0]["legacy_asset"].update(asset_sha256="0" * 64))
    run_case("legacy primary relation drift", lambda rows, manifest: next(row for row in rows if row["relation"] == "secondary_relation").update(legacy_requirement_primary="RUL-COR-04"))
    run_case("S1 screen/link denominator merge", lambda rows, manifest: manifest["s1_accounting_snapshot"].update(secondary_links_from_other_primary=22))
    run_case("current authority claim", lambda rows, manifest: rows[0]["authority_vocabulary_relation"].update(current_authority_claim=True))
    run_case("old/current contradiction collapse", lambda rows, manifest: manifest["old_current_contradiction"].update(status="resolved"))
    run_case("atom loss", lambda rows, manifest: rows.pop())
    print("PASS all 8 negative selfchecks")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
