#!/usr/bin/env python3
"""Meaningful negative checks for the PHCAP-16 static candidate."""
import copy
import importlib.util
import json
from pathlib import Path
HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("phcap16_validate", HERE / "validate.py")
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
base = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))

def expect_failure(label, mutate):
    candidate = copy.deepcopy(base)
    mutate(candidate)
    if validator.validate(candidate):
        print("PASS", label)
    else:
        raise SystemExit("FAIL selfcheck: " + label)

expect_failure("authority promotion", lambda x: x.update(authority_effect="adopted"))
expect_failure("current implementation promotion", lambda x: x["current_evidence"].update(implementation_status="implemented"))
expect_failure("current operation promotion", lambda x: x["current_evidence"].update(operation_status="operating"))
expect_failure("acceptance promotion", lambda x: x["current_evidence"].update(acceptance_status="passed"))
expect_failure("product target expansion", lambda x: x["scope"].update(product_targets=["HELIX-OS", "HELIX-Web-OS", "HELIX-Web"]))
expect_failure("old execution promotion", lambda x: x["legacy_phase_assessment"]["assets"][0].update(legacy_execution_performed=True))
expect_failure("legacy implementation promotion", lambda x: x["legacy_phase_assessment"]["assets"][2].update(legacy_implementation_status="implemented"))
expect_failure("consumer closure promotion", lambda x: x["consumer_residual"].update(consumer_closure_status="closed"))
expect_failure("decision invention", lambda x: x["decisions"].update(matching_append_only_decision_record_count=1))
expect_failure("source exact text tamper", lambda x: x["legacy_phase_assessment"]["assets"][0]["source_anchors"][0].update(exact_text="tampered"))
expect_failure("current source digest tamper", lambda x: x["current_evidence"]["refs"][0].update(sha256="0" * 64))
expect_failure("unit product merge", lambda x: x["scope"]["candidate_units"].__setitem__(1, dict(x["scope"]["candidate_units"][0])))
expect_failure("edge deletion", lambda x: x["scope"]["candidate_edges"].pop())
expect_failure("failure receipt invention", lambda x: x["failure_residual"].update(execution_receipts=1))
expect_failure("rebaseline stop removal", lambda x: x["rebaseline"].update(stop_condition="continue"))
print("PASS PHCAP-16 selfcheck: 15 negative cases")
