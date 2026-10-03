#!/usr/bin/env python3
"""候補の境界をメモリ上の変異で確認する。repositoryへは書き込まない。"""
from __future__ import annotations

import copy
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import validate  # noqa: E402


def load(name: str) -> dict:
    return json.loads((HERE / name).read_text(encoding="utf-8"))


def main() -> int:
    base_manifest = load("rdp001-preiso-requirement-next4.json")
    base_inventory = load("rdp001-preiso-requirement-next4-semantic-diff-inventory.json")
    if validate.validate(base_manifest, base_inventory):
        print("FAIL: base candidate does not validate")
        return 1
    mutations: list[tuple[str, dict, dict]] = []

    m = copy.deepcopy(base_manifest); m["provenance"]["baseline_commit"] = "0" * 40
    mutations.append(("REQNEXT4-NEG-BASELINE-PROVENANCE", m, copy.deepcopy(base_inventory)))

    i = copy.deepcopy(base_inventory); i["fragments"] = i["fragments"][:-1]
    mutations.append(("REQNEXT4-NEG-HUNK-COVERAGE", copy.deepcopy(base_manifest), i))

    i = copy.deepcopy(base_inventory); i["fragments"][0]["compound_hunk_hold"]["semantic_atom_count"] = 1
    mutations.append(("REQNEXT4-NEG-ATOM-CLAIM", copy.deepcopy(base_manifest), i))

    m = copy.deepcopy(base_manifest); m["selection_basis"]["selected_source_revision_item_ids"].append("PREISO-REV-000001")
    mutations.append(("REQNEXT4-NEG-PRIOR-OVERLAP", m, copy.deepcopy(base_inventory)))

    m = copy.deepcopy(base_manifest); m["prior_scopes"][3]["status_at_rebaseline"] = "unmerged_candidate"
    mutations.append(("REQNEXT4-NEG-PRIOR-LINEAGE", m, copy.deepcopy(base_inventory)))

    m = copy.deepcopy(base_manifest); m["selection_basis"]["metadata_only_excluded_change"] = "requirement_candidate"
    mutations.append(("REQNEXT4-NEG-METADATA-ONLY-EXCLUSION", m, copy.deepcopy(base_inventory)))

    m = copy.deepcopy(base_manifest); m["provenance"]["old_runtime_test_ci_execution"] = True
    mutations.append(("REQNEXT4-NEG-ARCHIVE-EXECUTION", m, copy.deepcopy(base_inventory)))

    i = copy.deepcopy(base_inventory); i["equivalence_claim"] = "equivalent"
    mutations.append(("REQNEXT4-NEG-CLOSURE-CLAIM", copy.deepcopy(base_manifest), i))

    failures = []
    for case_id, manifest, inventory in mutations:
        if not validate.validate(manifest, inventory):
            print(f"FAIL: negative mutation was accepted: {case_id}")
            failures.append(case_id)
    if failures:
        print("FAIL: base validation failed for negative cases: " + ", ".join(failures))
        return 1
    print("PASS: RDP-001 requirement-bearing next4 selfcheck (8 meaningful negative mutations rejected)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
