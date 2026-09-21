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


def expect_failure(label: str, mutate) -> None:
    candidate = copy.deepcopy(base)
    mutate(candidate)
    if validator.validate(candidate):
        print("PASS", label)
    else:
        raise SystemExit("FAIL selfcheck: " + label)


expect_failure("authority promotion", lambda x: x.update(authority_effect="approved"))
expect_failure("current implementation promotion", lambda x: x["current_evidence"].update(implementation_status="implemented"))
expect_failure("formal CI profile invention", lambda x: x["current_evidence"].update(formal_ci_profile_status="constructed"))
expect_failure("oracle registry invention", lambda x: x["current_evidence"].update(formal_oracle_registry_status="registered"))
expect_failure("PHCAP-10 direct Web evidence invention", lambda x: x["current_evidence"]["phase_direct_products"].update({"PHCAP-10": ["HELIX-Web"]}))
expect_failure("PHCAP-11 direct Web-OS evidence invention", lambda x: x["current_evidence"]["phase_direct_products"].update({"PHCAP-11": ["HELIX-Web-OS"]}))
expect_failure("old execution promotion", lambda x: x["legacy_phase_assessment"]["assets"][0].update(legacy_execution_performed=True))
expect_failure("legacy implementation promotion", lambda x: x["legacy_phase_assessment"]["assets"][3].update(legacy_implementation_status="implemented"))
expect_failure("consumer closure promotion", lambda x: x["consumer_residual"].update(consumer_closure_status="closed"))
expect_failure("decision invention", lambda x: x["legacy_phase_assessment"].update(decision_matches=1))
expect_failure("old source exact text tamper", lambda x: x["legacy_phase_assessment"]["assets"][0]["source_anchors"][0].update(exact_text="tampered"))
expect_failure("current source digest tamper", lambda x: x["current_evidence"]["refs"][0].update(sha256="0" * 64))
expect_failure("product unit merge", lambda x: x["scope"]["candidate_units"].__setitem__(1, dict(x["scope"]["candidate_units"][0])))
expect_failure("edge deletion", lambda x: x["scope"]["candidate_edges"].pop())
expect_failure("phase status promotion", lambda x: x["task"]["phase_record_snapshots"][0]["current"].update(status="implemented"))
expect_failure("failure receipt invention", lambda x: x["failure_residual"].update(execution_receipts=1))
print("PASS PHCAP-10/11 selfcheck: 16 negative cases")
