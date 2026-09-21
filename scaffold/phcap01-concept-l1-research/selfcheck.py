#!/usr/bin/env python3
"""Meaningful negative checks for the PHCAP-01 static research candidate."""
from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("phcap01_validate", HERE / "validate.py")
validator = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(validator)
base = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))


def expect_pass(label: str, mutate) -> None:
    candidate = copy.deepcopy(base)
    mutate(candidate)
    errors = validator.validate(candidate)
    if errors:
        raise SystemExit(f"FAIL selfcheck no-op {label}: {' '.join(errors)}")
    print("PASS", label)


def expect_failure(label: str, mutate, expected_code: str) -> None:
    candidate = copy.deepcopy(base)
    mutate(candidate)
    errors = validator.validate(candidate)
    if not errors:
        raise SystemExit("FAIL selfcheck no error: " + label)
    if expected_code not in errors:
        raise SystemExit(f"FAIL selfcheck wrong error {label}: expected {expected_code}, got {' '.join(errors)}")
    print("PASS", label, expected_code)


baseline_errors = validator.validate(copy.deepcopy(base))
if baseline_errors:
    raise SystemExit("FAIL selfcheck baseline green: " + " ".join(baseline_errors))
print("PASS baseline green")
expect_pass("no-op harness", lambda x: None)

expect_failure("authority promotion", lambda x: x.update(authority_effect="effective"), "E_BOUNDARY_AUTHORITY_EFFECT")
expect_failure("meaning change promotion", lambda x: x.update(meaning_change_applied=True), "E_BOUNDARY_MEANING_CHANGE_APPLIED")
expect_failure("successor invention", lambda x: x.update(successor_requirement_ids=["REQ-NEW"]), "E_BOUNDARY_SUCCESSOR_REQUIREMENT_IDS")
expect_failure("human decision invention", lambda x: x.update(human_decision_ref="DEC-NEW"), "E_BOUNDARY_HUMAN_DECISION_REF")
expect_failure("equivalence claim", lambda x: x.update(equivalence_claim="equivalent"), "E_BOUNDARY_EQUIVALENCE_CLAIM")
expect_failure("old execution promotion", lambda x: x.update(old_runtime_test_ci_execution=True), "E_BOUNDARY_OLD_RUNTIME_TEST_CI_EXECUTION")
expect_failure("base origin drift", lambda x: x["base"].update(origin_main_commit="0" * 40), "E_ORIGIN")
expect_failure("phase authority promotion", lambda x: x["phase_record"].update(authority_effect="effective"), "E_PHASE_AUTHORITY_EFFECT")
expect_failure("phase new build promotion", lambda x: x["phase_record"].update(new_build_allowed=True), "E_PHASE_NEW_BUILD_ALLOWED")
expect_failure("ledger digest tamper", lambda x: x["ledger_provenance"]["decisions"].update(sha256="0" * 64), "E_PROVENANCE_META_decisions")
expect_failure("product expansion", lambda x: x["phase_record"].update(product_targets=validator.PRODUCTS + ["OTHER"]), "E_PHASE_PRODUCTS")
expect_failure("product implementation promotion", lambda x: x["products"][0].update(current_implementation_status="implemented"), "E_PRODUCT_IMPLEMENTATION")
expect_failure("product degradation invention", lambda x: x["products"][1].update(degradation_status="degraded"), "E_PRODUCT_DEGRADATION")
expect_failure("product semantic inversion", lambda x: x["products"][0].update(responsibility="project群の管理・統制"), "E_PRODUCT_MEANING_HELIX-HARNESS")
expect_failure("connection admission", lambda x: x["connections"][0].update(status="admitted"), "E_CONNECTION_BOUNDARY")
expect_failure("connection authority promotion", lambda x: x["connections"][1].update(authority_effect="effective"), "E_CONNECTION_BOUNDARY")
expect_failure("connection direction inversion", lambda x: x["connections"][0].update(**{"from": "HELIX-OS", "to": "HELIX-HARNESS"}), "E_CONNECTION_SEMANTICS_PHCAP01-CONN-HARNESS-OS")
expect_failure("connection relation inversion", lambda x: x["connections"][2].update(relation="development_and_improvement_management"), "E_CONNECTION_SEMANTICS_PHCAP01-CONN-WEBOS-OS")
expect_failure("current L2/L11 promotion", lambda x: x["current_evidence"].update(l2_l11_applied=True), "E_CURRENT_L2_L11_APPLIED")
expect_failure("current implementation promotion", lambda x: x["current_evidence"].update(implementation_status="implemented"), "E_CURRENT_IMPLEMENTATION_STATUS")
expect_failure("current acceptance promotion", lambda x: x["current_evidence"].update(acceptance_status="passed"), "E_CURRENT_ACCEPTANCE_STATUS")
expect_failure("current reference digest tamper", lambda x: x["current_evidence"]["refs"][0].update(sha256="0" * 64), "E_CURRENT_REF_META_CUR-CONCEPT")
expect_failure("current reference span tamper", lambda x: x["current_evidence"]["refs"][0].update(span_sha256="0" * 64), "E_CURRENT_REF_META_CUR-CONCEPT")
expect_failure("archive digest tamper", lambda x: x["legacy_assets"][0].update(source_sha256="0" * 64), "E_ARCHIVE_DIGEST_LEGACY-ASSET-3B16BCFFAF353ADA813A")
expect_failure("archive path escape", lambda x: x["legacy_assets"][0].update(archive_path="docs/current.md"), "E_ARCHIVE_PATH_LEGACY-ASSET-3B16BCFFAF353ADA813A")
expect_failure("archive anchor tamper", lambda x: x["legacy_assets"][0]["source_anchors"][0].update(sha256="0" * 64), "E_ANCHOR_3B-A01")
expect_failure("phase target tamper", lambda x: x["legacy_assets"][0].update(candidate_phases=["PHCAP-01"]), "E_PHASE_TARGETS_LEGACY-ASSET-3B16BCFFAF353ADA813A")
expect_failure("product target tamper", lambda x: x["legacy_assets"][1].update(candidate_products=[]), "E_PRODUCT_TARGETS_LEGACY-ASSET-18F7940E7994634D39A1")
expect_failure("legacy implementation promotion", lambda x: x["legacy_assets"][1].update(implementation_status="implemented"), "E_ASSET_META_LEGACY-ASSET-18F7940E7994634D39A1")
expect_failure("legacy execution promotion", lambda x: x["legacy_assets"][2].update(legacy_execution_performed=True), "E_ASSET_EXECUTION_BOUNDARY_LEGACY-ASSET-75776FE016E550F5355F")
expect_failure("consumer closure promotion", lambda x: x["consumer_residual"].update(consumer_closed_assets=1), "E_CONSUMER_BOUNDARY")
expect_failure("runtime consumer invention", lambda x: x["consumer_residual"]["runtime_consumer_refs"].update({validator.ASSET_IDS[0]: ["runtime"]}), "E_CONSUMER_BOUNDARY")
expect_failure("failure receipt invention", lambda x: x["failure_residual"].update(selected_asset_execution_receipts=1), "E_FAILURE_BOUNDARY")
expect_failure("decision adoption invention", lambda x: x["decisions"].update(adoption=True), "E_DECISION_BOUNDARY")
expect_failure("decision record deletion", lambda x: x["decisions"].update(matching_append_only_records=[]), "E_DECISION_RECORD_SET")
expect_failure("phase aggregate tamper", lambda x: x["aggregates"].update(phase_candidate_count=44), "E_AGG_PHASE_CANDIDATE_COUNT")
expect_failure("product aggregate tamper", lambda x: x["aggregates"]["product_status_counts"].update(unresolved=18), "E_AGG_PRODUCT_STATUS_COUNTS")
expect_failure("unknown gap deletion", lambda x: x["unknowns"].pop(), "E_UNKNOWNS")
expect_failure("prohibited inference inversion", lambda x: x["prohibited_inference"].__setitem__(0, "phase candidateは正式admission"), "E_PROHIBITED_INFERENCE")
expect_failure("nested legacy asset key injection", lambda x: x["legacy_assets"][0].update(approved=True), "E_NESTED_KEYS:root.legacy_assets[]")
expect_failure("nested product key injection", lambda x: x["products"][0].update(implementation="complete"), "E_NESTED_KEYS:root.products[]")
expect_failure("nested current ref key injection", lambda x: x["current_evidence"]["refs"][0].update(approved=True), "E_NESTED_KEYS:root.current_evidence.refs[]")
expect_failure("verification boundary tamper", lambda x: x["verification_contract"].update(archive_read_only=False), "E_VERIFICATION_BOUNDARY")

print("PASS PHCAP-01 selfcheck: 43 negative cases plus baseline/no-op")
