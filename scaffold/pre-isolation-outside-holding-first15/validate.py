#!/usr/bin/env python3
"""Static validator for the first-15 outside-holding evidence candidate."""

from __future__ import annotations

import copy
import importlib.util
import json
import subprocess
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INV = HERE / "inventory.json"
EXPECTED_BASE = "3524e3dcc092500969046f2545b55e835c87512f"
EXPECTED_REGISTER_SHA = "4e43fadaec48dcb0399e73eff148419671d4ac87fd4f8f68899dadf186ce5b8b"
EXPECTED_REPORT_SHA = "4544a56b8eb2e50f6720c019e73ad0575796a300b97db15bf246e5cbe442e795"
EXPECTED_HOLDING_SHA = "d61a36db8e053d9006d11a09d1c60fd86413f32daa4a766aaeae2bc849130180"


spec = importlib.util.spec_from_file_location("outside_generator", HERE / "generate.py")
generator = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(generator)
EXPECTED = generator.build()


def fail(errors: list[str], condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


def git_rev(ref: str) -> str:
    return subprocess.run(["git", "rev-parse", ref], cwd=ROOT, check=True, text=True, stdout=subprocess.PIPE).stdout.strip()


def validate(inv: dict) -> list[str]:
    errors: list[str] = []
    fail(errors, inv == EXPECTED, "E_INVENTORY_NOT_REGENERATED")
    fail(errors, inv.get("schema") == "rdp001-preisolation-outside-holding-first15/v1", "E_SCHEMA")
    fail(errors, inv.get("status") == "findings_only", "E_STATUS")
    fail(errors, inv.get("authority_effect") == "none", "E_AUTHORITY")
    fail(errors, inv.get("meaning_change_applied") is False, "E_MEANING")
    fail(errors, inv.get("successor_requirement_ids") == [] and inv.get("human_decision_ref") is None, "E_DECISION_BOUNDARY")
    fail(errors, inv.get("equivalence_claim") is None, "E_EQUIVALENCE")
    fail(errors, inv.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")
    scope = inv.get("scope", {})
    fail(errors, scope.get("current_head") == EXPECTED_BASE, "E_BASE_CAPTURE")
    try:
        fail(errors, subprocess.run(["git", "merge-base", "--is-ancestor", EXPECTED_BASE, "HEAD"], cwd=ROOT).returncode == 0, "E_CAPTURE_BASE_NOT_ANCESTOR")
    except (subprocess.CalledProcessError, OSError) as exc:
        errors.append(f"E_GIT:{exc}")
    fail(errors, scope.get("selected_count") == 15, "E_SELECTION_COUNT")
    fail(errors, scope.get("live_holding_count") == 13, "E_LIVE_HOLDING_COUNT")
    fail(errors, scope.get("approved_products") == ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"], "E_PRODUCTS")
    fail(errors, scope.get("holding_register_sha256") == EXPECTED_REGISTER_SHA, "E_REGISTER_SHA")
    fail(errors, scope.get("outside_report_sha256") == EXPECTED_REPORT_SHA, "E_REPORT_SHA")
    fail(errors, (ROOT / "docs/governance/pre-isolation-revision-delta-source-holding.jsonl").is_file(), "E_HOLDING_MISSING")
    if (ROOT / "docs/governance/pre-isolation-revision-delta-source-holding.jsonl").is_file():
        import hashlib
        fail(errors, hashlib.sha256((ROOT / "docs/governance/pre-isolation-revision-delta-source-holding.jsonl").read_bytes()).hexdigest() == EXPECTED_HOLDING_SHA, "E_HOLDING_SHA")

    holdings = inv.get("live_holdings", [])
    fail(errors, len(holdings) == 13, "E_LIVE_HOLDINGS")
    fail(errors, len({row.get("registration_id") for row in holdings}) == 13, "E_LIVE_HOLDING_IDS")
    fail(errors, all(row.get("registration_kind") == "source_holding" and row.get("product_target") == "unassigned_cross_product" and row.get("authority_effect") == "none" for row in holdings), "E_LIVE_HOLDING_BOUNDARY")

    paths = inv.get("paths", [])
    fail(errors, len(paths) == 15, "E_PATH_COUNT")
    fail(errors, all(row.get("classification_state") == "path_based_candidate_only" for row in paths), "E_PATH_CLASSIFICATION")
    fail(errors, all(row.get("product_status") == "unknown_path_based_candidate_only" and row.get("phase_status") == "unknown_path_based_candidate_only" for row in paths), "E_PRODUCT_PHASE_UNKNOWN")
    fail(errors, all(row.get("implementation_status") == "unknown_not_evidenced_by_path_or_blob_catalog" for row in paths), "E_IMPLEMENTATION_UNKNOWN")
    fail(errors, all(row.get("existing_holding_inclusion_relation") == "not_in_any_of_13_live_holdings" for row in paths), "E_HOLDING_RELATION")
    fail(errors, all(row.get("new_holding_needed") == "unresolved_new_holding_needed" for row in paths), "E_NEW_HOLDING_UNRESOLVED")
    fail(errors, all(row.get("authority_effect") == "none" and row.get("meaning_change_applied") is False and row.get("successor_requirement_ids") == [] and row.get("human_decision_ref") is None for row in paths), "E_PATH_AUTHORITY")
    fail(errors, all(row.get("old_runtime_test_ci_execution") is False for row in paths), "E_PATH_EXECUTION")
    for row in paths:
        fail(errors, row.get("pre_isolation", {}).get("reported_blob_oid_matches_git") is True, f"E_PRE_BLOB:{row.get('path')}")
        fail(errors, row.get("archive", {}).get("reported_blob_oid_matches_git") is True, f"E_ARCHIVE_BLOB:{row.get('path')}")
        fail(errors, row.get("archive", {}).get("relation_to_pre_isolation") in {"same", "different"}, f"E_BLOB_RELATION:{row.get('path')}")
        fail(errors, row.get("archive_root_present") is False, f"E_ARCHIVE_ROOT:{row.get('path')}")
        fail(errors, row.get("current", {}).get("state") == "absent", f"E_CURRENT_STATE:{row.get('path')}")
        relations = row.get("live_holding_relations", [])
        fail(errors, len(relations) == 13, f"E_RELATION_COUNT:{row.get('path')}")
        for relation in relations:
            fail(errors, relation.get("relation") == "no_exact_path_or_blob_or_sha_match", f"E_RELATION_MATCH:{row.get('path')}:{relation.get('registration_id')}")
            fail(errors, relation.get("path_match_count") == relation.get("pre_isolation_blob_match_count") == relation.get("pre_isolation_sha256_match_count") == 0, f"E_RELATION_COUNTS:{row.get('path')}:{relation.get('registration_id')}")

    aggregate = inv.get("aggregate", {})
    fail(errors, aggregate.get("not_in_any_live_holding_count") == 15 and aggregate.get("new_holding_needed_unresolved_count") == 15, "E_AGGREGATE_HOLDING")
    fail(errors, aggregate.get("implementation_unknown_count") == 15, "E_AGGREGATE_IMPLEMENTATION")
    fail(errors, len(inv.get("prohibited_inference", [])) == 6, "E_PROHIBITED_INFERENCE")
    return errors


if __name__ == "__main__":
    errors = validate(json.loads(INV.read_text(encoding="utf-8")))
    if errors:
        print("FAIL outside-67 first-15 validator")
        print("\n".join(errors))
        sys.exit(1)
    print("PASS outside-67 first-15 validator: 15 paths / 13 live holdings / static blob relation")
