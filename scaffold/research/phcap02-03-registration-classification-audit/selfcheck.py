#!/usr/bin/env python3
"""Negative checks preventing evidence-gap candidate promotion."""

from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("phcap_validator", HERE / "validate.py")
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
print("PASS baseline and capture ancestor semantics")


def expect_failure(label, mutate):
    candidate = copy.deepcopy(base)
    mutate(candidate)
    errors = validator.validate(candidate)
    if errors:
        print("PASS", label)
    else:
        raise SystemExit("FAIL selfcheck: " + label)


cases = [
    ("authority promotion", lambda x: x.update(authority_effect="adopted")),
    ("meaning promotion", lambda x: x.update(meaning_change_applied=True)),
    ("successor assignment", lambda x: x.update(successor_requirement_ids=["REQ-001"])),
    ("old execution", lambda x: x.update(old_runtime_test_ci_execution=True)),
    ("phase current Web invention", lambda x: x["phase_records"]["PHCAP-02"]["current"].update(evidence_products=["HELIX-OS", "HELIX-Web"])),
    ("phase product target promotion", lambda x: x["phase_records"]["PHCAP-03"].update(product_targets=["HELIX-HARNESS", "HELIX-OS", "HELIX-Web"])),
    ("routing phase join invention", lambda x: x.update(product_routing_audit={**x["product_routing_audit"], "phase_field_presence": {"phase_candidates": 1, "candidate_phase_targets": 0}})),
    ("routing successor assignment", lambda x: x["product_routing_audit"].update(successor_assignment_status_counts={"assigned": 1})),
    ("requirement candidate invention", lambda x: x["management_register_audit"].update(requirement_candidate_count=1)),
    ("legacy implementation promotion", lambda x: x["legacy_assets"][0].update(legacy_implementation_status="implemented")),
    ("legacy execution receipt", lambda x: x["legacy_assets"][0].update(legacy_execution_performed=True)),
    ("failure observation promotion", lambda x: x["legacy_assets"][0]["failure_evidence"].update(observed_failure_status="observed_failure")),
    ("consumer closure promotion", lambda x: x["consumer_residual"].update(consumer_closure_status="closed")),
    ("decision record invention", lambda x: x["decisions"]["per_asset"].update({next(iter(x["decisions"]["per_asset"])): 1})),
    ("source digest tamper", lambda x: x["legacy_assets"][0].update(source_sha256="0" * 64)),
    ("source anchor tamper", lambda x: x["legacy_assets"][1]["source_anchors"][0].update(exact_text="tampered")),
    ("four product audit deletion", lambda x: x["product_routing_audit"].update(records_with_exact_four_product_evaluations=152)),
    ("67 path direct join invention", lambda x: x["outside_holding_67_audit"].update(direct_phcap02_or_03_join_count=1)),
    ("67 path catalog promotion", lambda x: x["outside_holding_67_audit"].update(all_legacy_catalog_record_count_zero=False)),
    ("gap deletion", lambda x: x["gaps"].pop()),
    ("prohibited boundary deletion", lambda x: x["prohibited_inference"].pop()),
]

for label, mutate in cases:
    expect_failure(label, mutate)

print("PASS PHCAP-02/03 selfcheck: %d negative cases" % len(cases))
