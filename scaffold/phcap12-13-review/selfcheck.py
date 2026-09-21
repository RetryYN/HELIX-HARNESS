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


def expect_pass(label: str, mutate) -> None:
    candidate = copy.deepcopy(base)
    mutate(candidate)
    errors = validator.validate(candidate, check_binding=False)
    if errors:
        raise SystemExit(f"FAIL selfcheck no-op {label}: {' '.join(errors)}")
    print("PASS", label)


def expect_failure(label: str, mutate, expected_code: str) -> None:
    candidate = copy.deepcopy(base)
    before = copy.deepcopy(candidate)
    mutate(candidate)
    if candidate == before:
        raise SystemExit("FAIL selfcheck no-op mutation: " + label)
    errors = validator.validate(candidate, check_binding=False)
    if not errors:
        raise SystemExit("FAIL selfcheck no error: " + label)
    if expected_code not in errors:
        raise SystemExit(f"FAIL selfcheck wrong error {label}: expected {expected_code}, got {' '.join(errors)}")
    print("PASS", label, expected_code)


CASES = [
    ("authority promotion", lambda x: x.update(authority_effect="adopted"), "E_AUTHORITY"),
    ("meaning change promotion", lambda x: x.update(meaning_change_applied=True), "E_MEANING_CHANGE"),
    ("successor invention", lambda x: x.update(successor_requirement_ids=["REQ-NEW"]), "E_DECISION_FIELDS"),
    ("human decision invention", lambda x: x.update(human_decision_ref="DEC-NEW"), "E_DECISION_FIELDS"),
    ("equivalence promotion", lambda x: x.update(equivalence_claim="equivalent"), "E_EQUIVALENCE"),
    ("old execution promotion", lambda x: x.update(old_runtime_test_ci_execution=True), "E_OLD_EXECUTION"),
    ("origin drift", lambda x: x["base"].update(commit="0" * 40), "E_BASE_ORIGIN"),
    ("unknown root key", lambda x: x.update(unexpected_key=True), "E_ROOT_KEYSET"),
    ("candidate asset expansion", lambda x: x["scope"].update(legacy_asset_ids=["EXTRA"]), "E_SCOPE_ASSETS"),
    ("candidate count tamper", lambda x: x["scope"]["candidate_asset_counts"].update(either=343), "E_CANDIDATE_ASSET_COUNTS"),
    ("unit implementation promotion", lambda x: x["product_units"][0].update(current_implementation_status="implemented"), "E_UNIT_IMPL:PHCAP12-13-UNIT-HARNESS"),
    ("unit owner promotion", lambda x: x["product_units"][0].update(authority_status="owner_assigned"), "E_UNIT_MEANING:PHCAP12-13-UNIT-HARNESS:authority_status"),
    ("unit capability reversal", lambda x: x["product_units"][0].update(current_capability="approved canonical merge authority"), "E_UNIT_MEANING:PHCAP12-13-UNIT-HARNESS:current_capability"),
    ("unit transition reversal", lambda x: x["product_units"][0].update(legacy_transition_status="promoted_to_approved_implementation"), "E_UNIT_MEANING:PHCAP12-13-UNIT-HARNESS:legacy_transition_status"),
    ("unit status reversal", lambda x: x["product_units"][0].update(status="admitted"), "E_UNIT_MEANING:PHCAP12-13-UNIT-HARNESS:status"),
    ("Web direct evidence promotion", lambda x: x["product_units"][2].update(status="direct_current_candidate", current_evidence_status="direct_candidate_refs"), "E_UNIT_MEANING:PHCAP12-13-UNIT-WEB:status"),
    ("Web phase evidence invention", lambda x: x["product_units"][2].update(current_ref_ids=["OS-L2"]), "E_UNIT_REFS:PHCAP12-13-UNIT-WEB"),
    ("edge admission", lambda x: x["candidate_connections"][0].update(status="approved"), "E_EDGE_STATUS:CONN-HARNESS-OS-REVIEW-CONTRACT"),
    ("edge authority promotion", lambda x: x["candidate_connections"][0].update(authority_effect="adopted"), "E_EDGE_AUTHORITY:CONN-HARNESS-OS-REVIEW-CONTRACT"),
    ("edge meaning reversal", lambda x: x["candidate_connections"][2].update(meaning="OS grants Web merge authority and WBS ownership."), "E_EDGE_MEANING:CONN-OS-WEB-PROJECT-RESULT"),
    ("phase join admission", lambda x: x["candidate_phase_joins"][0].update(interpretation="admission complete"), "E_PHASE_JOIN_MEANING:PHCAP-12"),
    ("phase join interpretation reversal", lambda x: x["candidate_phase_joins"][0].update(interpretation="candidate phase join admission complete; owner and successor generated"), "E_PHASE_JOIN_MEANING:PHCAP-12"),
    ("phase join deletion", lambda x: x["candidate_phase_joins"][0]["selected_asset_ids"].pop(), "E_PHASE_JOIN_ASSETS:PHCAP-12"),
    ("current implementation promotion", lambda x: x["current_evidence"].update(implementation_status="implemented"), "E_CURRENT_UNKNOWN"),
    ("current acceptance promotion", lambda x: x["current_evidence"].update(acceptance_status="passed"), "E_CURRENT_UNKNOWN"),
    ("current ref digest tamper", lambda x: x["current_evidence"]["refs"][0].update(sha256="0" * 64), "E_CURRENT_REF_SHA:BOUNDARY-UNIT-CONNECTION"),
    ("scaffold authority promotion", lambda x: x["current_evidence"]["scaffold_context"].update(authority_effect="adopted"), "E_SCAFFOLD_CONTEXT_STATE"),
    ("scaffold implementation promotion", lambda x: x["current_evidence"]["scaffold_context"].update(implementation_status="implemented"), "E_SCAFFOLD_CONTEXT_PROMOTION"),
    ("source digest tamper", lambda x: x["legacy_phase_assessment"]["assets"][0].update(source_sha256="0" * 64), "E_ASSET_LEDGER_SHA:LEGACY-ASSET-D107FD145A2588FAAD09"),
    ("archive path escape", lambda x: x["legacy_phase_assessment"]["assets"][0].update(archive_path="archive/other.md"), "E_ARCHIVE:LEGACY-ASSET-D107FD145A2588FAAD09"),
    ("source anchor text tamper", lambda x: x["legacy_phase_assessment"]["assets"][0]["source_anchors"][0].update(exact_text="tampered\n"), "E_ANCHOR_TEXT:D107-01"),
    ("source anchor digest tamper", lambda x: x["legacy_phase_assessment"]["assets"][0]["source_anchors"][0].update(sha256="0" * 64), "E_ANCHOR_SHA:D107-01"),
    ("anchor meaning tamper", lambda x: x["legacy_phase_assessment"]["assets"][0]["source_anchors"][0].update(meaning="invented"), "E_ANCHOR_MEANING:D107-01"),
    ("ledger implementation promotion", lambda x: x["legacy_phase_assessment"]["assets"][0]["ledger_snapshot"].update(implementation_status="implemented"), "E_ASSET_LEDGER_SNAPSHOT:LEGACY-ASSET-D107FD145A2588FAAD09"),
    ("decision history invention", lambda x: x["legacy_phase_assessment"]["assets"][0]["decision_history"].update(matching_count=1), "E_ASSET_DECISION_HISTORY:LEGACY-ASSET-D107FD145A2588FAAD09"),
    ("failure receipt invention", lambda x: x["failure_consumer_residual"].update(failure_execution_receipts=1), "E_RESIDUAL_COUNTS"),
    ("consumer closure promotion", lambda x: x["failure_consumer_residual"].update(consumer_closure_status="closed"), "E_RESIDUAL_CLOSURE"),
    ("consumer reference injection", lambda x: x["legacy_phase_assessment"]["assets"][0]["consumer_evidence"].update(consumer_refs=["fake"]), "E_CONSUMER_BOUNDARY:LEGACY-ASSET-D107FD145A2588FAAD09"),
    ("unresolved deletion", lambda x: x["unresolved"].pop(), "E_UNRESOLVED"),
    ("negative case deletion", lambda x: x["verification_contract"]["negative_cases"].pop(), "E_NEGATIVE_CASES"),
    ("unknown nested key", lambda x: x["product_units"][0].update(unexpected_key=True), "E_UNIT_KEYSET:PHCAP12-13-UNIT-HARNESS"),
]

baseline_errors = validator.validate(copy.deepcopy(base), check_binding=False)
if baseline_errors:
    raise SystemExit("FAIL selfcheck baseline green: " + " ".join(baseline_errors))
print("PASS baseline green")
expect_pass("no-op harness", lambda x: None)

for label, mutate, expected_code in CASES:
    expect_failure(label, mutate, expected_code)
print(f"PASS PHCAP-12/13 selfcheck: {len(CASES)} expected-error negative cases plus baseline/no-op")
