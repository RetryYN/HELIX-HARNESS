#!/usr/bin/env python3
"""Negative checks for the PHCAP-15/17 orphan-asset research premise."""
from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("orphan_validator", HERE / "validate.py")
assert spec and spec.loader
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
base = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))


def expect_failure(label: str, mutate) -> None:
    candidate = copy.deepcopy(base)
    mutate(candidate)
    if validator.validate(candidate):
        print("PASS", label)
    else:
        raise SystemExit("FAIL selfcheck: " + label)


expect_failure("authority promotion", lambda x: x.update(authority_effect="adopted"))
expect_failure("new build promotion", lambda x: x.update(new_build_allowed=True))
expect_failure("successor invention", lambda x: x.update(successor_requirement_ids=["REQ-NEW"]))
expect_failure("old execution promotion", lambda x: x.update(old_runtime_test_ci_execution=True))
expect_failure("base commit drift", lambda x: x["base"].update(origin_main_commit="0" * 40))
expect_failure("crosswalk direct link invention", lambda x: x["requirement_link_audit"].update(all_direct_legacy_asset_links=1))
expect_failure("phase direct unit invention", lambda x: x["requirement_link_audit"]["phase_direct_unit_counts"].update({"PHCAP-15": 1}))
expect_failure("candidate pool as direct link", lambda x: x["assets"][2]["direct_requirement_connection"].update(status="confirmed", matched_unit_ids=["IRUNIT-FAKE"]))
expect_failure("legacy implementation promotion", lambda x: x["assets"][0].update(legacy_implementation_status="implemented"))
expect_failure("failure receipt invention", lambda x: x["failure_consumer_decision_audit"].update(execution_receipts_observed=1))
expect_failure("failure audit closure mutation", lambda x: x["failure_consumer_decision_audit"].update(consumer_closure="closed"))
expect_failure("consumer closure promotion", lambda x: x["assets"][0].update(consumer_refs=["HELIX-OS"], consumer_closure_status="closed"))
expect_failure("asset consumer closure promotion without refs", lambda x: x["assets"][0].update(consumer_closure_status="closed"))
expect_failure("asset failure meaning replacement", lambda x: x["assets"][0].update(failure_or_degradation="ZZZ"))
expect_failure("anchor removal with count adjusted", lambda x: (x["assets"][0]["source_anchors"].pop(), x["counts"].update(source_anchors=12)))
expect_failure("base unknown key injection", lambda x: x["base"].update(ZZZ=True))
expect_failure("source digest tamper", lambda x: x["assets"][0].update(source_sha256="0" * 64))
expect_failure("source anchor tamper", lambda x: x["assets"][0]["source_anchors"][0].update(sha256="0" * 64))
expect_failure("source anchor meaning mutation", lambda x: x["assets"][0]["source_anchors"][0].update(meaning="current implementation verified"))
expect_failure("nested key injection", lambda x: x["assets"][0].update(verified=True))
expect_failure("product owner invention", lambda x: x["routing_candidates"][0].update(routing_status="owner_assigned"))
expect_failure("phase admission invention", lambda x: x["phase_snapshots"]["PHCAP-17"].update(current_status="admitted"))
expect_failure("unknown key injection", lambda x: x.update(unexpected_key=True))
expect_failure("unresolved deletion", lambda x: x["unresolved"].clear())

print("PASS PHCAP-15/17 orphan selfcheck: 24 negative cases")
