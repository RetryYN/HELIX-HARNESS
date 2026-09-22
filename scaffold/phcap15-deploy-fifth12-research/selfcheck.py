#!/usr/bin/env python3
"""Negative checks for the PHCAP-15 Deploy fifth12 static research scaffold."""
from __future__ import annotations

import copy
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from validate import validate  # noqa: E402


def main() -> int:
    baseline = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
    if validate(baseline):
        print("FAIL fifth12 selfcheck baseline")
        return 1
    cases = [
        ("pool-denominator", lambda d: d["denominator"].update(remaining_unreviewed_rows=33), "DENOMINATOR"),
        ("selected-overlap", lambda d: d["scope"]["selected_asset_ids"].__setitem__(0, "LEGACY-ASSET-042D2B732DC68AA7EE9A"), "SELECTED_SCOPE"),
        ("selected-duplicate", lambda d: d["scope"]["selected_asset_ids"].__setitem__(1, d["scope"]["selected_asset_ids"][0]), "SELECTED_SCOPE"),
        ("source-digest", lambda d: d["assets"][0].__setitem__("source_file_sha256", "0" * 64), "SOURCE_SHA"),
        ("source-text", lambda d: d["assets"][0]["source_anchors"][0].__setitem__("exact_text", "tampered source text"), "ANCHOR_TEXT"),
        ("phase-promotion", lambda d: d["assets"][0].__setitem__("phase_admission", "admitted"), "ADMISSION_OWNER"),
        ("implementation-promotion", lambda d: d["assets"][1].__setitem__("current_implementation_status", "implemented"), "CURRENT_UNKNOWN"),
        ("degradation-promotion", lambda d: d["assets"][2].__setitem__("current_degradation_status", "degraded"), "CURRENT_UNKNOWN"),
        ("failure-receipt", lambda d: d["assets"][3]["failure_evidence"].__setitem__("execution_receipts", 1), "FAILURE_EVIDENCE"),
        ("consumer-closure", lambda d: d["assets"][4].update(consumer_closure_status="closed", consumer_refs=["consumer-x"]), "CONSUMERS"),
        ("decision-match", lambda d: d["assets"][5].__setitem__("decision_matches", 1), "DECISIONS"),
        ("product-boundary", lambda d: d["product_boundary_candidates"]["products"][0].__setitem__("boundary", "owner boundary"), "PRODUCT_BOUNDARY"),
        ("nested-key", lambda d: d["assets"][0].__setitem__("verified", True), "KEYSET"),
        ("anchor-meaning", lambda d: d["assets"][0]["source_anchors"][0].__setitem__("meaning", "invented meaning"), "ANCHOR_MEANINGS"),
        ("anchor-count", lambda d: d["assets"][1]["source_anchors"].pop(), "ANCHOR_COUNT"),
        ("selected-anchor-count", lambda d: d["counts"].update(selected_source_anchors=25), "COUNTS"),
        ("unresolved-body", lambda d: d["assets"][0].update(unresolved=[]), "CLOSURE_UNRESOLVED"),
        ("semantic-kind", lambda d: d["assets"][0].update(semantic_diversity_kind="implementation"), "SEMANTIC_KIND"),
        ("equivalence-claim", lambda d: d.update(equivalence_claim="equivalent"), "PROMOTION_FIELDS"),
        ("prohibited-inference", lambda d: d["prohibited_inference"].__setitem__(0, "pool is a requirement link"), "PROHIBITED_INFERENCE"),
        ("required-command", lambda d: d["verification_contract"]["required_commands"].pop(), "VERIFICATION_CONTRACT"),
        ("negative-case-contract", lambda d: d["verification_contract"]["negative_cases"].append("invented negative"), "VERIFICATION_CONTRACT"),
        ("provenance-nested-key", lambda d: d["provenance"]["reviewed_sets"]["pr_2001"].update(unexpected_key=True), "KEYSET"),
        ("provenance-next12-nested-key", lambda d: d["provenance"]["reviewed_sets"]["next12"].update(unexpected_key=True), "KEYSET"),
        ("scope-nested-key", lambda d: d["scope"]["excluded_scopes"]["pr_2001"].update(unexpected_key=True), "KEYSET"),
        ("copy-ledger-digest", lambda d: d["provenance"]["ledgers"]["docs/governance/legacy-asset-copy-read-after.jsonl"].update(sha256="0" * 64), "LEDGER_REF"),
    ]
    failed = 0
    for name, mutate, expected in cases:
        candidate = copy.deepcopy(baseline)
        mutate(candidate)
        errors = validate(candidate)
        if not errors or not any(expected in error for error in errors):
            print(f"FAIL selfcheck case unexpectedly accepted: {name} errors={errors}")
            failed += 1
        else:
            print(f"PASS negative/{name}: {expected}")
    if failed:
        return 1
    print(f"PASS fifth12 selfcheck: {len(cases)} negative cases rejected")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
