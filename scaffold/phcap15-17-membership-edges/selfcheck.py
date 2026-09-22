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

    def case(name, mutate):
        data = copy.deepcopy(baseline)
        mutate(data)
        cases.append((name, data))

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

    failed = 0
    for name, data in cases:
        if not validate(data):
            print("FAIL selfcheck case unexpectedly accepted:", name)
            failed += 1
    if failed:
        return 1
    print(f"PASS PHCAP-15/17 membership selfcheck: {len(cases)} negative cases rejected")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
