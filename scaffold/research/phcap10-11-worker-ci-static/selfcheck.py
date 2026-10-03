#!/usr/bin/env python3
"""Negative checks for the PHCAP-10/11 static research candidate."""
from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("phcap1011_validate", HERE / "validate.py")
validator = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(validator)
base = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))


baseline_errors = validator.validate(base)
if baseline_errors:
    raise SystemExit("FAIL selfcheck baseline: " + "; ".join(baseline_errors))

try:
    current_head = validator.run_git("rev-parse", "HEAD")
except Exception as exc:
    raise SystemExit("FAIL selfcheck checkout probe: " + str(exc))
if not validator.is_ancestor(validator.ORIGIN, current_head):
    raise SystemExit("FAIL selfcheck capture ancestor probe")
print("PASS baseline and captured-source ancestry")


def expect_failure(label: str, mutate, expected_code: str) -> None:
    candidate = copy.deepcopy(base)
    mutate(candidate)
    if candidate == base:
        raise SystemExit("FAIL selfcheck: " + label + " is a no-op mutation")
    errors = validator.validate(candidate)
    if not errors:
        raise SystemExit("FAIL selfcheck: " + label + " was accepted")
    if expected_code not in errors:
        raise SystemExit(
            "FAIL selfcheck: " + label + " missing " + expected_code + " (got " + ", ".join(errors) + ")"
        )
    print("PASS", label, expected_code)


CASES = [
    ("authority promotion", lambda x: x.update(authority_effect="approved"), "E_AUTHORITY"),
    ("current implementation promotion", lambda x: x["current_evidence"].update(implementation_status="implemented"), "E_CURRENT_IMPL"),
    ("formal CI profile invention", lambda x: x["current_evidence"].update(formal_ci_profile_status="constructed"), "E_FORMAL_CI"),
    ("oracle registry invention", lambda x: x["current_evidence"].update(formal_oracle_registry_status="registered"), "E_FORMAL_ORACLE"),
    ("PHCAP-10 direct Web evidence invention", lambda x: x["current_evidence"]["phase_direct_products"].update({"PHCAP-10": ["HELIX-Web"]}), "E_CURRENT_DIRECT_PRODUCTS"),
    ("PHCAP-11 direct Web-OS evidence invention", lambda x: x["current_evidence"]["phase_direct_products"].update({"PHCAP-11": ["HELIX-Web-OS"]}), "E_CURRENT_DIRECT_PRODUCTS"),
    ("old execution promotion", lambda x: x["legacy_phase_assessment"]["assets"][0].update(legacy_execution_performed=True), "E_ASSET_EXECUTION:LEGACY-ASSET-F67008331E92FA0A5773"),
    ("legacy implementation promotion", lambda x: x["legacy_phase_assessment"]["assets"][3].update(legacy_implementation_status="implemented"), "E_ASSET_IMPL:LEGACY-ASSET-44F2DE5EBB3DF3A4744A"),
    ("consumer closure promotion", lambda x: x["consumer_residual"].update(consumer_closure_status="closed"), "E_CONSUMER_CLOSURE"),
    ("decision invention", lambda x: x["legacy_phase_assessment"].update(decision_matches=1), "E_DECISIONS_TOTAL"),
    ("decision selected asset scan drift", lambda x: x["decisions"]["selected_asset_ids"].pop(), "E_DECISION_ASSETS"),
    ("decision count scan drift", lambda x: x["decisions"].update(matching_append_only_decision_record_count=1), "E_DECISION_COUNT"),
    ("decision per-asset scan drift", lambda x: x["decisions"]["per_asset"].update({"LEGACY-ASSET-F67008331E92FA0A5773": 1}), "E_DECISION_PER_ASSET"),
    ("source anchor meaning drift", lambda x: x["legacy_phase_assessment"]["assets"][0]["source_anchors"][0].update(meaning="meaning drift"), "E_ANCHOR_MEANING:LEGACY-ASSET-F67008331E92FA0A5773-A01"),
    ("source anchor order drift", lambda x: x["legacy_phase_assessment"]["assets"][0]["source_anchors"].reverse(), "E_ANCHOR_ORDER:LEGACY-ASSET-F67008331E92FA0A5773"),
    ("prohibited inference order drift", lambda x: x["prohibited_inference"].reverse(), "E_PROHIBITED_CONTENT"),
    ("recursive root key drift", lambda x: x.update(unexpected_key=True), "E_KEYSET:root"),
    ("recursive nested key drift", lambda x: x["decisions"].update(unexpected_key=True), "E_KEYSET:root.decisions"),
    ("old source exact text tamper", lambda x: x["legacy_phase_assessment"]["assets"][0]["source_anchors"][0].update(exact_text="tampered"), "E_ANCHOR_TEXT:LEGACY-ASSET-F67008331E92FA0A5773-A01"),
    ("current source digest tamper", lambda x: x["current_evidence"]["refs"][0].update(sha256="0" * 64), "E_REF_SHA:CUR-BOUNDARY-FOUR"),
    ("product unit merge", lambda x: x["scope"]["candidate_units"].__setitem__(1, dict(x["scope"]["candidate_units"][0])), "E_UNIT_PRODUCTS"),
    ("edge deletion", lambda x: x["scope"]["candidate_edges"].pop(), "E_EDGE_COUNT"),
    ("phase status promotion", lambda x: x["task"]["phase_record_snapshots"][0]["current"].update(status="implemented"), "E_PHASE_SNAPSHOTS"),
    ("failure receipt invention", lambda x: x["failure_residual"].update(execution_receipts=1), "E_FAILURE_TOTAL"),
]

for label, mutate, expected_code in CASES:
    expect_failure(label, mutate, expected_code)

print("PASS PHCAP-10/11 selfcheck: %d negative cases" % len(CASES))
