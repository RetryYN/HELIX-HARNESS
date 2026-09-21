#!/usr/bin/env python3
"""Meaningful negative checks for the PHCAP-06 candidate."""
import copy
import importlib.util
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("validator", HERE / "validate.py")
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
base = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))


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
    ("formal meaning promotion", lambda x: x.update(meaning_change_applied=True)),
    ("Web direct evidence invention", lambda x: x["gap_interpretation"].update(direct_current_evidence_products=["HELIX-HARNESS", "HELIX-OS", "HELIX-Web"])),
    ("Web-OS status promotion", lambda x: x["product_boundary_candidates"][3].update(status="direct_current_candidate")),
    ("current implementation invention", lambda x: x["legacy_summary"].update(capability_status="implemented")),
    ("legacy implementation promotion", lambda x: x["legacy_assets"][0]["ledger_record"].update(implementation_status="implemented")),
    ("consumer closure promotion", lambda x: x["legacy_assets"][0]["ledger_record"].update(consumer_refs=["HELIX-OS"])),
    ("decision history invention", lambda x: x["legacy_assets"][0]["decision_history"].update(matching_decision_record_count=1)),
    ("old execution", lambda x: x.update(old_runtime_test_ci_execution=True)),
    ("source text tamper", lambda x: x["legacy_assets"][0]["source_spans"][0].update(exact_text="tampered\n")),
    ("source digest tamper", lambda x: x["legacy_assets"][1].update(source_sha256="0" * 64)),
    ("current ref digest tamper", lambda x: x["current_refs"][0].update(line_sha256="0" * 64)),
    ("current classification invention", lambda x: x["current_refs"][7].update(classification="direct_current_ref")),
    ("selected asset removal", lambda x: x["legacy_assets"].pop()),
    ("atom loss", lambda x: x["atoms"].pop()),
    ("unresolved loss", lambda x: x["unresolved"].pop()),
    ("contradiction deletion", lambda x: x["contradictions_preserved"].pop()),
    ("contradiction status promotion", lambda x: x["contradictions_preserved"][0].update(status="resolved")),
    ("contradiction resolution authority", lambda x: x["contradictions_preserved"][0].update(resolution="current authority granted")),
    ("phase denominator tamper", lambda x: x["counts"].update(phase_candidate_asset_count=1)),
    ("related asset promotion", lambda x: x["related_reference_assets"][0]["ledger_state"].update(disposition="retained")),
]

for label, mutate in cases:
    expect_failure(label, mutate)
print("PASS PHCAP-06 selfcheck: %d negative cases" % len(cases))
