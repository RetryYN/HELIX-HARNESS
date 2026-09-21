#!/usr/bin/env python3
"""候補atomが要求採用・実装完了へ昇格していないことの否定確認。"""

from __future__ import annotations

from collections import Counter
from copy import deepcopy
import json
from pathlib import Path

from validate import check


ROOT = Path(__file__).resolve().parents[2]
CANDIDATE = ROOT / "scaffold/rdp001-delegated-doc001-atom-030/inventory.json"
EXPECTED_KIND_COUNTS = {
    "requirement": 19,
    "relation": 29,
    "layout": 12,
    "metadata": 7,
    "constraint": 5,
    "acceptance": 3,
    "premise": 1,
}


def main() -> int:
    candidate = json.loads(CANDIDATE.read_text(encoding="utf-8"))
    errors: list[str] = []
    if candidate["source_holding"]["holding_granularity"] != "file_blob":
        errors.append("source holdingがfile_blobでない")
    if candidate["atomization"]["file_blob_is_not_single_requirement_atom"] is not True:
        errors.append("file blob単一atom禁止境界が欠落")
    if candidate["legacy_asset"]["implementation_status"] != "unknown":
        errors.append("legacy implementation statusをunknown以外へ昇格")
    if candidate["phase_product_classification"]["degraded_status"] != "unknown_not_structured_in_ledger":
        errors.append("degraded statusを構造化済みへ誤昇格")
    kind_counts = Counter(atom.get("candidate_kind") for atom in candidate["atoms"])
    if kind_counts != Counter(EXPECTED_KIND_COUNTS):
        errors.append(f"candidate_kind counts不一致: {dict(kind_counts)}")
    mutated = deepcopy(candidate)
    mutated["atoms"][0]["candidate_kind"] = "relation"
    if not any("candidate_kind counts不一致" in error for error in check(mutated)):
        errors.append("candidate_kind改変のnegative caseをvalidatorが拒否しない")
    for atom in candidate["atoms"]:
        if atom["authority_vocabulary_relation"]["current_authority_claim"] is not False:
            errors.append(f"authority claim: {atom['semantic_atom_id']}")
        if atom["successor_requirement_ids"]:
            errors.append(f"successor assigned: {atom['semantic_atom_id']}")
    if errors:
        for error in errors:
            print("FAIL", error)
        return 1
    print("PASS DOC-001 negative boundary: no promotion, successor, implementation, degraded, or current authority claim")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
