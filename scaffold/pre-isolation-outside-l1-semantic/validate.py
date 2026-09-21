#!/usr/bin/env python3
"""Validate the bounded four-product L1 semantic evidence candidate."""

from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
import subprocess
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INV = HERE / "inventory.json"
EXPECTED_BASE = "3df81ad27157c471e004083783f37a5860eaa2ee"
EXPECTED_RELATIONS = {
    "HELIX-HARNESS": "partial",
    "HELIX-OS": "partial",
    "HELIX-Web": "exact",
    "HELIX-Web-OS": "exact",
}
EXPECTED_CURRENT_SHA = {
    "HELIX-HARNESS": "a49da594e9593557eb42cbfe54edc7e9751ce40fea95d1fe9367f5780184ee04",
    "HELIX-OS": "0f7f30d9d6984578f09c31ed1ef4e826d7c360bf752297982bde5201e7e99ca8",
    "HELIX-Web": "26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756",
    "HELIX-Web-OS": "600caa1388278abe43c06f01c53f565146c2f2ddd2165f6a8c9e63cbb174a34c",
}
EXPECTED_DECISION_SHA = "b512098481cb282d066b37383cfcd932ef137e86e604a46f965fc605d52698f2"
EXPECTED_BOUNDARY_SHA = "097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038"
EXPECTED_DISPOSITION_PROGRAM_SHA = "6eb28f5fef9b5551c84231ceb8fefca949f6cfd5449224b5ab644d61f7136308"


spec = importlib.util.spec_from_file_location("l1_generator", HERE / "generate.py")
generator = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(generator)
EXPECTED = generator.build()


def fail(errors: list[str], condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


def validate(inv: dict) -> list[str]:
    errors: list[str] = []
    fail(errors, inv == EXPECTED, "E_INVENTORY_NOT_REGENERATED")
    fail(errors, inv.get("schema") == "rdp001-preisolation-outside-l1-semantic/v1", "E_SCHEMA")
    fail(errors, inv.get("status") == "findings_only", "E_STATUS")
    fail(errors, inv.get("authority_effect") == "none", "E_AUTHORITY")
    fail(errors, inv.get("meaning_change_applied") is False, "E_MEANING")
    fail(errors, inv.get("successor_requirement_ids") == [] and inv.get("human_decision_ref") is None, "E_DECISION_BOUNDARY")
    fail(errors, inv.get("formal_source_holding_created") is False, "E_FORMAL_HOLDING")
    fail(errors, inv.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")
    scope = inv.get("scope", {})
    fail(errors, scope.get("current_head") == EXPECTED_BASE, "E_BASE")
    fail(errors, scope.get("selected_old_path_count") == 4, "E_SELECTION")
    fail(errors, scope.get("approved_products") == ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"], "E_PRODUCTS")
    fail(errors, scope.get("live_holding_count") == 13, "E_HOLDINGS")
    fail(errors, scope.get("decision_record_sha256") == EXPECTED_DECISION_SHA, "E_DECISION_SHA")
    fail(errors, scope.get("product_boundary_sha256") == EXPECTED_BOUNDARY_SHA, "E_BOUNDARY_SHA")
    fail(errors, scope.get("disposition_program_sha256") == EXPECTED_DISPOSITION_PROGRAM_SHA, "E_DISPOSITION_PROGRAM_SHA")
    try:
        fail(errors, subprocess.run(["git", "merge-base", "--is-ancestor", EXPECTED_BASE, "HEAD"], cwd=ROOT).returncode == 0, "E_BASE_NOT_ANCESTOR")
    except OSError as exc:
        errors.append(f"E_GIT:{exc}")

    holdings = inv.get("live_holdings", [])
    fail(errors, len(holdings) == 13, "E_LIVE_HOLDINGS")
    fail(errors, len({row.get("registration_id") for row in holdings}) == 13, "E_LIVE_HOLDING_IDS")
    fail(errors, all(row.get("registration_kind") == "source_holding" and row.get("product_target") == "unassigned_cross_product" and row.get("authority_effect") == "none" for row in holdings), "E_LIVE_HOLDING_BOUNDARY")

    cases = inv.get("cases", [])
    fail(errors, len(cases) == 4, "E_CASE_COUNT")
    for case in cases:
        product = case.get("product")
        fail(errors, EXPECTED_RELATIONS.get(product) == case.get("semantic_relation"), f"E_RELATION:{product}")
        fail(errors, case.get("current_approved_l1", {}).get("sha256") == EXPECTED_CURRENT_SHA.get(product), f"E_CURRENT_SHA:{product}")
        fail(errors, case.get("existing_holding_relation") == "no_exact_path_or_blob_or_sha_match_in_13_live_holdings", f"E_HOLDING_RELATION:{product}")
        fail(errors, case.get("preservation_disposition") == "source_holding_required_before_semantic_disposition", f"E_PRESERVATION:{product}")
        fail(errors, case.get("semantic_evidence_role") == "evidence_only_not_source_holding", f"E_EVIDENCE_ROLE:{product}")
        fail(errors, case.get("source_holding_precondition") == "required_before_semantic_disposition", f"E_HOLDING_PRECONDITION:{product}")
        fail(errors, case.get("formal_source_holding_created") is False, f"E_FORMAL_CASE_HOLDING:{product}")
        fail(errors, case.get("authority_effect") == "none" and case.get("meaning_change_applied") is False, f"E_CASE_AUTHORITY:{product}")
        fail(errors, case.get("successor_requirement_ids") == [] and case.get("human_decision_ref") is None, f"E_CASE_DECISION:{product}")
        fail(errors, case.get("old_runtime_test_ci_execution") is False, f"E_CASE_EXECUTION:{product}")
        old = case.get("old_source", {})
        archive = case.get("archive_source", {})
        fail(errors, old.get("reported_blob_oid_matches_git") is True, f"E_OLD_BLOB:{product}")
        fail(errors, old.get("blob_oid") == old.get("reported_blob_oid"), f"E_OLD_REPORT_BLOB:{product}")
        fail(errors, archive.get("relation_to_pre_isolation") == "same", f"E_ARCHIVE_RELATION:{product}")
        fail(errors, case.get("current_approved_l1", {}).get("decision_id", "").startswith("HDEC-"), f"E_DECISION_ID:{product}")
        relations = case.get("live_holding_relations", [])
        fail(errors, len(relations) == 13, f"E_RELATION_COUNT:{product}")
        for relation in relations:
            fail(errors, relation.get("relation") == "no_exact_path_or_blob_or_sha_match", f"E_EXACT_MATCH:{product}:{relation.get('registration_id')}")
            fail(errors, relation.get("path_match_count") == relation.get("pre_isolation_blob_match_count") == relation.get("pre_isolation_sha256_match_count") == 0, f"E_MATCH_COUNTS:{product}:{relation.get('registration_id')}")
    aggregate = inv.get("aggregate", {})
    fail(errors, aggregate.get("semantic_relation_counts") == {"exact": 2, "partial": 2, "unresolved": 0}, "E_RELATION_AGGREGATE")
    fail(errors, aggregate.get("holding_exact_match_count") == 0, "E_HOLDING_AGGREGATE")
    fail(errors, aggregate.get("preservation_unresolved_count") == 4, "E_PRESERVATION_AGGREGATE")
    fail(errors, inv.get("source_holding_rule") == "new_source_requires_source_holding_before_semantic_disposition", "E_SOURCE_HOLDING_RULE")
    fail(errors, len(inv.get("prohibited_inference", [])) == 6, "E_PROHIBITED_BOUNDARY")
    return errors


if __name__ == "__main__":
    errors = validate(json.loads(INV.read_text(encoding="utf-8")))
    if errors:
        print("FAIL outside-67 L1 semantic validator")
        print("\n".join(errors))
        sys.exit(1)
    print("PASS outside-67 L1 semantic validator: 4 cases / 2 exact / 2 partial / 13 holdings")
