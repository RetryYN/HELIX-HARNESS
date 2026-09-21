#!/usr/bin/env python3
"""Meaningful negative checks for the PHCAP-07 Web/Web-OS candidate."""
import copy
import importlib.util
import json
from pathlib import Path
HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("phcap07_validate", HERE / "validate.py")
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
base = json.loads((HERE / "inventory.json").read_text(encoding="utf8"))

def expect_failure(label, mutate):
    candidate = copy.deepcopy(base)
    mutate(candidate)
    if validator.validate(candidate):
        print("PASS", label)
    else:
        raise SystemExit("FAIL selfcheck: " + label)

expect_failure("authority promotion", lambda x: x.update(authority_effect="adopted"))
expect_failure("Web phase direct evidence invention", lambda x: x["current_evidence"].update(product_direct_evidence_products=["HELIX-Web"]))
expect_failure("Web-OS phase direct evidence invention", lambda x: x["current_evidence"].update(product_direct_evidence_products=["HELIX-Web-OS"]))
expect_failure("L10 formalization", lambda x: x["current_evidence"].update(l10_status="formal"))
expect_failure("oracle registry promotion", lambda x: x["current_evidence"].update(oracle_registry_status="registered"))
expect_failure("CI relation promotion", lambda x: x["current_evidence"].update(formal_ci_relation_status="bound"))
expect_failure("current implementation promotion", lambda x: x["current_evidence"].update(implementation_status="implemented"))
expect_failure("old execution promotion", lambda x: x["legacy_phase_assessment"]["assets"][0].update(legacy_execution_performed=True))
expect_failure("legacy implementation promotion", lambda x: x["legacy_phase_assessment"]["assets"][2].update(legacy_implementation_status="implemented"))
expect_failure("consumer closure promotion", lambda x: x["consumer_residual"].update(consumer_closure_status="closed"))
expect_failure("decision invention", lambda x: x["decisions"].update(matching_append_only_decision_record_count=1))
expect_failure("old source anchor tamper", lambda x: x["legacy_phase_assessment"]["assets"][0]["source_anchors"][0].update(exact_text="tampered"))
expect_failure("current source digest tamper", lambda x: x["current_evidence"]["refs"][0].update(file_sha256="0" * 64))
expect_failure("product unit merge", lambda x: x["scope"]["candidate_units"].__setitem__(1, dict(x["scope"]["candidate_units"][0])))
expect_failure("connection edge deletion", lambda x: x["scope"]["candidate_edges"].pop())
print("PASS PHCAP-07 selfcheck: 15 negative cases")
