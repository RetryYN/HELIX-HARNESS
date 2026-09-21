#!/usr/bin/env python3
"""Meaningful negative checks for the PHCAP-12/13 static candidate."""
from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("phcap12_13_validate", HERE / "validate.py")
assert spec.loader is not None
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
base = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))


def expect_failure(label: str, mutate) -> None:
    candidate = copy.deepcopy(base)
    mutate(candidate)
    if validator.validate(candidate, check_binding=False):
        print("PASS", label)
    else:
        raise SystemExit("FAIL selfcheck: " + label)


CASES = [
    ("authority promotion", lambda x: x.update(authority_effect="adopted")),
    ("meaning change promotion", lambda x: x.update(meaning_change_applied=True)),
    ("successor invention", lambda x: x.update(successor_requirement_ids=["REQ-NEW"])),
    ("human decision invention", lambda x: x.update(human_decision_ref="DEC-NEW")),
    ("equivalence promotion", lambda x: x.update(equivalence_claim="equivalent")),
    ("old execution promotion", lambda x: x.update(old_runtime_test_ci_execution=True)),
    ("origin drift", lambda x: x["base"].update(commit="0" * 40)),
    ("unknown root key", lambda x: x.update(unexpected_key=True)),
    ("candidate asset expansion", lambda x: x["scope"].update(legacy_asset_ids=["EXTRA"])),
    ("candidate count tamper", lambda x: x["scope"]["candidate_asset_counts"].update(either=343)),
    ("unit implementation promotion", lambda x: x["product_units"][0].update(current_implementation_status="implemented")),
    ("unit owner promotion", lambda x: x["product_units"][0].update(authority_status="owner_assigned")),
    ("unit capability reversal", lambda x: x["product_units"][0].update(current_capability="approved canonical merge authority")),
    ("unit transition reversal", lambda x: x["product_units"][0].update(legacy_transition_status="promoted_to_approved_implementation")),
    ("unit status reversal", lambda x: x["product_units"][0].update(status="admitted")),
    ("Web direct evidence promotion", lambda x: x["product_units"][2].update(status="direct_current_candidate", current_evidence_status="direct_candidate_refs")),
    ("Web phase evidence invention", lambda x: x["product_units"][2].update(current_ref_ids=["OS-L2"])),
    ("edge admission", lambda x: x["candidate_connections"][0].update(status="approved")),
    ("edge authority promotion", lambda x: x["candidate_connections"][0].update(authority_effect="adopted")),
    ("edge meaning reversal", lambda x: x["candidate_connections"][2].update(meaning="OS grants Web merge authority and WBS ownership.")),
    ("phase join admission", lambda x: x["candidate_phase_joins"][0].update(interpretation="admission complete")),
    ("phase join interpretation reversal", lambda x: x["candidate_phase_joins"][0].update(interpretation="candidate phase join admission complete; owner and successor generated")),
    ("phase join deletion", lambda x: x["candidate_phase_joins"][0]["selected_asset_ids"].pop()),
    ("current implementation promotion", lambda x: x["current_evidence"].update(implementation_status="implemented")),
    ("current acceptance promotion", lambda x: x["current_evidence"].update(acceptance_status="passed")),
    ("current ref digest tamper", lambda x: x["current_evidence"]["refs"][0].update(sha256="0" * 64)),
    ("scaffold authority promotion", lambda x: x["current_evidence"]["scaffold_context"].update(authority_effect="adopted")),
    ("scaffold implementation promotion", lambda x: x["current_evidence"]["scaffold_context"].update(implementation_status="implemented")),
    ("source digest tamper", lambda x: x["legacy_phase_assessment"]["assets"][0].update(source_sha256="0" * 64)),
    ("archive path escape", lambda x: x["legacy_phase_assessment"]["assets"][0].update(archive_path="archive/other.md")),
    ("source anchor text tamper", lambda x: x["legacy_phase_assessment"]["assets"][0]["source_anchors"][0].update(exact_text="tampered\n")),
    ("source anchor digest tamper", lambda x: x["legacy_phase_assessment"]["assets"][0]["source_anchors"][0].update(sha256="0" * 64)),
    ("anchor meaning tamper", lambda x: x["legacy_phase_assessment"]["assets"][0]["source_anchors"][0].update(meaning="invented")),
    ("ledger implementation promotion", lambda x: x["legacy_phase_assessment"]["assets"][0]["ledger_snapshot"].update(implementation_status="implemented")),
    ("decision history invention", lambda x: x["legacy_phase_assessment"]["assets"][0]["decision_history"].update(matching_count=1)),
    ("failure receipt invention", lambda x: x["failure_consumer_residual"].update(failure_execution_receipts=1)),
    ("consumer closure promotion", lambda x: x["failure_consumer_residual"].update(consumer_closure_status="closed")),
    ("consumer reference injection", lambda x: x["legacy_phase_assessment"]["assets"][0]["consumer_evidence"].update(consumer_refs=["fake"])),
    ("unresolved deletion", lambda x: x["unresolved"].pop()),
    ("negative case deletion", lambda x: x["verification_contract"]["negative_cases"].pop()),
    ("unknown nested key", lambda x: x["product_units"][0].update(unexpected_key=True)),
]

for label, mutate in CASES:
    expect_failure(label, mutate)
print(f"PASS PHCAP-12/13 selfcheck: {len(CASES)} negative cases")
