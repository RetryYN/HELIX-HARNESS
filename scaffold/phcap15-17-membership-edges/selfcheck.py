#!/usr/bin/env python3
"""Negative cases for the PHCAP-15/17 membership research scaffold."""
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
        print("FAIL selfcheck baseline")
        return 1
    cases = []

    def case(name, mutate, expected_code=None):
        data = copy.deepcopy(baseline)
        mutate(data)
        cases.append((name, data, expected_code))

    case("authority", lambda d: d.__setitem__("authority_effect", "formal"))
    case("meaning", lambda d: d.__setitem__("meaning_change_applied", True))
    case("successor", lambda d: d.__setitem__("successor_requirement_ids", ["REQ-1"]))
    case("human_decision", lambda d: d.__setitem__("human_decision_ref", "DEC-1"))
    case("equivalence", lambda d: d.__setitem__("equivalence_claim", "equivalent"))
    case("old_execution", lambda d: d.__setitem__("old_runtime_test_ci_execution", True))
    case("asset_implementation", lambda d: d["assets"][0].__setitem__("implementation_status", "implemented"))
    case("asset_consumer", lambda d: d["assets"][0].__setitem__("consumer_refs", ["consumer"]))
    case("decision", lambda d: d["failure_consumer_decision_audit"].__setitem__("matching_decision_records", 1))
    case("membership_affirmative", lambda d: d["membership_sets"][0].__setitem__("classification", "affirmative"))
    case("membership_removed", lambda d: d["membership_sets"][0]["crosswalk_ids"].pop())
    case("direct_link", lambda d: d["semantic_link_audit"].__setitem__("direct_legacy_asset_links_observed", 1))
    case("source_id_match", lambda d: d["semantic_link_audit"].__setitem__("requirement_id_exact_matches", 1))
    case("source_span_match", lambda d: d["semantic_link_audit"].__setitem__("source_span_exact_matches", 1))
    case("anchor_text", lambda d: d["assets"][0]["anchors"][0].__setitem__("exact_text", "tampered"))
    case("anchor_hash", lambda d: d["assets"][1]["anchors"][0].__setitem__("sha256", "0" * 64))
    case("unknown_count", lambda d: d["semantic_link_audit"].__setitem__("unknown", 68))
    case("key_injection", lambda d: d.__setitem__("unapproved_key", True))
    case("prohibited_inference_reversal", lambda d: d["prohibited_inference"].__setitem__(0, "candidate pool membershipを意味関係とみなしてよい"), "E_PROHIBITED_INFERENCE")
    case("prohibited_inference_removed", lambda d: d["prohibited_inference"].pop(), "E_PROHIBITED_INFERENCE")
    case("asset_nested_authority", lambda d: d["assets"][0].__setitem__("verified", True), "E_NESTED_KEYS:assets[0]")
    case("membership_nested_authority", lambda d: d["membership_sets"][0].__setitem__("confirmed", True), "E_NESTED_KEYS:membership_sets[0]")
    case("scope_nested_authority", lambda d: d["scope"].__setitem__("approved", True), "E_NESTED_KEYS:scope")
    case("provenance_nested_authority", lambda d: d["provenance"]["crosswalk"].__setitem__("verified", True), "E_NESTED_KEYS:provenance.crosswalk")

    failed = 0
    for name, data, expected_code in cases:
        errors = validate(data)
        if not errors or (expected_code is not None and expected_code not in errors):
            print("FAIL selfcheck case unexpectedly accepted:", name)
            failed += 1
    if failed:
        return 1
    print(f"PASS PHCAP-15/17 membership selfcheck: {len(cases)} negative cases rejected")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
