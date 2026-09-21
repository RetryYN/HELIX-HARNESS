#!/usr/bin/env python3
"""Independent static validator for outside-67 rows 16 through 30."""

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
spec = importlib.util.spec_from_file_location("outside_generator_16_30", HERE / "generate.py")
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
    fail(errors, inv.get("schema") == generator.SCHEMA, "E_SCHEMA")
    fail(errors, inv.get("candidate_id") == "RDP-001-PREISO-OUTSIDE-HOLDING-16-30-0045", "E_CANDIDATE_ID")
    fail(errors, inv.get("status") == "findings_only", "E_STATUS")
    fail(errors, inv.get("authority_effect") == "none", "E_AUTHORITY")
    fail(errors, inv.get("meaning_change_applied") is False, "E_MEANING")
    fail(errors, inv.get("successor_requirement_ids") == [] and inv.get("human_decision_ref") is None, "E_DECISION_BOUNDARY")
    fail(errors, inv.get("formal_register_append") is False, "E_FORMAL_APPEND")
    fail(errors, inv.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")
    scope = inv.get("scope", {})
    fail(errors, scope.get("selected_count") == 15, "E_SELECTION_COUNT")
    fail(errors, scope.get("live_holding_count") == 13, "E_LIVE_HOLDING_COUNT")
    fail(errors, scope.get("selection_rule") == "outside-67 report order; global rows 16 through 30 inclusive", "E_SELECTION_RULE")
    fail(errors, scope.get("outside_report_sha256") == generator.REPORT_SHA256, "E_REPORT_SHA")
    fail(errors, scope.get("source_set_sha256") == generator.SOURCE_SET_SHA256, "E_SOURCE_SET_SHA")
    fail(errors, scope.get("management_register_sha256") == generator.REGISTER_SHA256, "E_REGISTER_SHA")
    fail(errors, scope.get("pre_isolation_holding_sha256") == generator.HOLDING_SHA256, "E_HOLDING_SHA")
    fail(errors, (ROOT / generator.SOURCE_SET_PATH).is_file(), "E_SOURCE_SET_MISSING")
    fail(errors, (ROOT / generator.HOLDING_PATH).is_file(), "E_HOLDING_MISSING")
    try:
        fail(errors, subprocess.run(["git", "merge-base", "--is-ancestor", generator.CURRENT_CAPTURE, "HEAD"], cwd=ROOT).returncode == 0, "E_CAPTURE_NOT_ANCESTOR")
    except OSError as exc:
        errors.append(f"E_GIT:{exc}")

    holdings = inv.get("live_holdings", [])
    fail(errors, len(holdings) == 13, "E_LIVE_HOLDINGS")
    fail(errors, len({row.get("registration_id") for row in holdings}) == 13, "E_LIVE_HOLDING_IDS")
    fail(errors, all(row.get("registration_kind") == "source_holding" and row.get("product_target") == "unassigned_cross_product" and row.get("authority_effect") == "none" for row in holdings), "E_LIVE_HOLDING_BOUNDARY")

    rows = inv.get("rows", [])
    fail(errors, len(rows) == 15, "E_ROW_COUNT")
    fail(errors, [row.get("global_ordinal") for row in rows] == list(range(16, 31)), "E_ROW_ORDINALS")
    fail(errors, [row.get("source_item_id") for row in rows] == [f"OUTSIDE67-PATH-{i:03d}" for i in range(16, 31)], "E_SOURCE_IDS")
    fail(errors, all(row.get("candidate_product") == "shared-cross-product" for row in rows), "E_PRODUCT_CANDIDATE")
    fail(errors, all(row.get("product_status") == "unknown_path_based_candidate_only" for row in rows), "E_PRODUCT_UNKNOWN")
    fail(errors, all(row.get("candidate_phase") == "upstream-governance-or-crosswalk" for row in rows), "E_PHASE_CANDIDATE")
    fail(errors, all(row.get("phase_status") == "unknown_path_based_candidate_only" for row in rows), "E_PHASE_UNKNOWN")
    fail(errors, all(row.get("implementation_status") == "unknown_not_evidenced_by_path_or_blob_catalog" for row in rows), "E_IMPLEMENTATION_UNKNOWN")
    fail(errors, all(row.get("degradation_assessment") == "unknown_not_semantically_assessed" and row.get("degradation_evidence") == "archive_blob_relation_only_no_semantic_delta_review" for row in rows), "E_DEGRADATION_UNKNOWN")
    fail(errors, all(row.get("existing_holding_inclusion_relation") == "not_in_any_of_13_live_holdings" for row in rows), "E_HOLDING_RELATION")
    fail(errors, all(row.get("new_holding_needed") == "unresolved_new_holding_needed" for row in rows), "E_NEW_HOLDING_UNRESOLVED")
    fail(errors, all(row.get("authority_effect") == "none" and row.get("meaning_change_applied") is False and row.get("successor_requirement_ids") == [] and row.get("human_decision_ref") is None for row in rows), "E_PATH_AUTHORITY")
    fail(errors, all(row.get("old_runtime_test_ci_execution") is False for row in rows), "E_PATH_EXECUTION")
    for row in rows:
        fail(errors, row.get("pre_isolation", {}).get("reported_blob_oid_matches_git") is True, f"E_PRE_BLOB:{row.get('source_path')}")
        fail(errors, row.get("archive", {}).get("reported_blob_oid_matches_git") is True, f"E_ARCHIVE_BLOB:{row.get('source_path')}")
        fail(errors, row.get("archive", {}).get("relation_to_pre_isolation") in {"same", "different"}, f"E_BLOB_RELATION:{row.get('source_path')}")
        fail(errors, row.get("archive_root_present") is False, f"E_ARCHIVE_ROOT:{row.get('source_path')}")
        fail(errors, row.get("current_capture", {}).get("state") == "absent", f"E_CURRENT_STATE:{row.get('source_path')}")
        fail(errors, row.get("legacy_catalog_record_count") == 0, f"E_CATALOG:{row.get('source_path')}")
        relations = row.get("live_holding_relations", [])
        fail(errors, len(relations) == 13, f"E_RELATION_COUNT:{row.get('source_path')}")
        for relation in relations:
            fail(errors, relation.get("relation") == "no_exact_path_or_blob_or_sha_match", f"E_RELATION_MATCH:{row.get('source_path')}:{relation.get('registration_id')}")
            fail(errors, relation.get("path_match_count") == relation.get("pre_isolation_blob_match_count") == relation.get("pre_isolation_sha256_match_count") == 0, f"E_RELATION_COUNTS:{row.get('source_path')}:{relation.get('registration_id')}")

    aggregate = inv.get("aggregate", {})
    fail(errors, aggregate.get("candidate_product_counts") == {"shared-cross-product": 15}, "E_AGGREGATE_PRODUCT")
    fail(errors, aggregate.get("candidate_phase_counts") == {"upstream-governance-or-crosswalk": 15}, "E_AGGREGATE_PHASE")
    fail(errors, aggregate.get("archive_blob_relation_counts") == {"different": 7, "same": 8}, "E_AGGREGATE_BLOBS")
    fail(errors, aggregate.get("current_state_counts") == {"absent": 15}, "E_AGGREGATE_CURRENT")
    fail(errors, aggregate.get("not_in_any_live_holding_count") == 15 and aggregate.get("new_holding_needed_unresolved_count") == 15, "E_AGGREGATE_HOLDING")
    fail(errors, aggregate.get("implementation_unknown_count") == 15 and aggregate.get("degradation_unknown_count") == 15 and aggregate.get("legacy_catalog_zero_count") == 15, "E_AGGREGATE_UNKNOWN")
    fail(errors, len(inv.get("prohibited_inference", [])) == 6, "E_PROHIBITED_INFERENCE")
    fail(errors, inv.get("verification_scope", {}).get("static_only") is True, "E_STATIC_ONLY")
    return errors


if __name__ == "__main__":
    errors = validate(json.loads(INV.read_text(encoding="utf-8")))
    if errors:
        print("FAIL outside-67 rows 16-30 validator")
        print("\n".join(errors))
        sys.exit(1)
    print("PASS outside-67 rows 16-30 validator: 15 paths / 13 live holdings / static blob relation")
