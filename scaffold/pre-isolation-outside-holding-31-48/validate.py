#!/usr/bin/env python3
"""Independent static validator for outside-67 rows 31 through 48."""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INV = HERE / "inventory.json"
REPORT_PATH = "scaffold/pre-isolation-outside-holding-67/report.json"
SOURCE_SET_PATH = "docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl"
REGISTER_PATH = "docs/governance/management-provisional-requirement-register.jsonl"
HOLDING_PATH = "docs/governance/pre-isolation-revision-delta-source-holding.jsonl"
PRE_ISOLATION = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCHIVE = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
CURRENT_CAPTURE = "3df81ad27157c471e004083783f37a5860eaa2ee"
PARENT_COMMIT = "d272a97b3e55401fa75ad41670fbeefd18f8a4cf"
SCHEMA = "rdp001-preisolation-outside-holding-31-48/v1"
LIVE_HOLDING_IDS = {
    "MPR-SH-HEADING-002",
    "MPR-SH-IR-003",
    "MPR-SH-CONFIRMED-003",
    "MPR-SH-SEMANTIC-LINE-003",
    "MPR-SH-SUPPLEMENTARY-003",
    "MPR-SH-CANDIDATE-003",
    "MPR-SH-WORKFLOW-003",
    "MPR-SH-SCRUM-REVERSE-001",
    "MPR-SH-PREISOLATION-002",
    "MPR-SH-DELEGATED-DOC-003",
    "MPR-SH-DELEGATED-REF-001",
    "MPR-SH-PO-GOALS-PRINCIPLES-001",
    "MPR-SH-LEGACY-RULE-004",
}


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def git_blob(commit: str, path: str) -> bytes:
    return subprocess.run(["git", "show", f"{commit}:{path}"], cwd=ROOT, check=True, stdout=subprocess.PIPE).stdout


def git_oid(commit: str, path: str) -> str | None:
    result = subprocess.run(["git", "rev-parse", f"{commit}:{path}"], cwd=ROOT, text=True, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    return result.stdout.strip() if result.returncode == 0 else None


def exact_hits(value: object, target: str, path: str = "") -> list[str]:
    hits: list[str] = []
    if isinstance(value, dict):
        for key, child in value.items():
            child_path = f"{path}.{key}" if path else key
            if child == target:
                hits.append(child_path)
            hits.extend(exact_hits(child, target, child_path))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            hits.extend(exact_hits(child, target, f"{path}[{index}]"))
    return hits


def live_holdings(register: list[dict]) -> list[dict]:
    superseded = {row.get("supersedes_registration_id") for row in register if row.get("supersedes_registration_id")}
    result: list[dict] = []
    for row in register:
        if row.get("registration_id") in superseded:
            continue
        source_path = ROOT / row["source_atom_set_ref"]
        result.append(
            {
                "registration_id": row["registration_id"],
                "source_atom_set_ref": row["source_atom_set_ref"],
                "source_atom_set_sha256": digest(source_path.read_bytes()),
                "source_atom_set_record_count": len(load_jsonl(source_path)),
                "registration_kind": row["registration_kind"],
                "product_target": row["product_target"],
                "authority_effect": row["authority_effect"],
            }
        )
    return result


def relation(path: str, pre_oid: str, pre_sha: str, records: list[dict]) -> tuple[list[str], list[str], list[str]]:
    paths: list[str] = []
    blobs: list[str] = []
    shas: list[str] = []
    for index, record in enumerate(records, 1):
        paths.extend(f"{index}:{hit}" for hit in exact_hits(record, path))
        blobs.extend(f"{index}:{hit}" for hit in exact_hits(record, pre_oid))
        shas.extend(f"{index}:{hit}" for hit in exact_hits(record, pre_sha))
    return paths, blobs, shas


def fail(errors: list[str], condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


def validate(inv: dict) -> list[str]:
    errors: list[str] = []
    report_file = ROOT / REPORT_PATH
    source_file = ROOT / SOURCE_SET_PATH
    register_file = ROOT / REGISTER_PATH
    holding_file = ROOT / HOLDING_PATH
    fail(errors, inv.get("schema") == SCHEMA, "E_SCHEMA")
    fail(errors, inv.get("candidate_id") == "RDP-001-PREISO-OUTSIDE-HOLDING-31-48-0043", "E_CANDIDATE")
    fail(errors, inv.get("status") == "findings_only", "E_STATUS")
    fail(errors, inv.get("authority_effect") == "none", "E_AUTHORITY")
    fail(errors, inv.get("meaning_change_applied") is False, "E_MEANING")
    fail(errors, inv.get("successor_requirement_ids") == [] and inv.get("human_decision_ref") is None, "E_DECISION_BOUNDARY")
    fail(errors, inv.get("formal_register_append") is False, "E_FORMAL_APPEND")
    fail(errors, inv.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")
    fail(errors, report_file.is_file() and source_file.is_file() and register_file.is_file() and holding_file.is_file(), "E_INPUT_MISSING")
    if errors:
        return errors

    report = json.loads(report_file.read_text(encoding="utf-8"))
    source_rows = load_jsonl(source_file)
    register = load_jsonl(register_file)
    holdings = live_holdings(register)
    scope = inv.get("scope", {})
    fail(errors, scope.get("parent_commit") == PARENT_COMMIT, "E_PARENT_COMMIT")
    fail(errors, scope.get("outside_report_path") == REPORT_PATH and scope.get("outside_report_sha256") == digest(report_file.read_bytes()), "E_REPORT_DIGEST")
    fail(errors, scope.get("source_set_path") == SOURCE_SET_PATH and scope.get("source_set_sha256") == digest(source_file.read_bytes()), "E_SOURCE_DIGEST")
    fail(errors, scope.get("management_register_path") == REGISTER_PATH and scope.get("management_register_sha256") == digest(register_file.read_bytes()), "E_REGISTER_DIGEST")
    fail(errors, scope.get("pre_isolation_holding_path") == HOLDING_PATH and scope.get("pre_isolation_holding_sha256") == digest(holding_file.read_bytes()), "E_HOLDING_DIGEST")
    fail(errors, scope.get("pre_isolation_commit") == PRE_ISOLATION and scope.get("archive_commit") == ARCHIVE and scope.get("current_capture_commit") == CURRENT_CAPTURE, "E_COMMITS")
    fail(errors, scope.get("historical_holding_comparison") == "fixed_to_parent_d272; later_base_changes_do_not_rewrite_13_holding_denominator", "E_BASE_PIN")
    fail(errors, scope.get("selection_rule") == "outside-67 report order; global rows 31 through 48 inclusive", "E_SELECTION_RULE")
    fail(errors, scope.get("selected_count") == 18 and scope.get("live_holding_count") == 13, "E_SCOPE_COUNTS")
    fail(errors, scope.get("requirement_atoms") is False and scope.get("read_only") is True, "E_SCOPE_BOUNDARY")
    try:
        fail(errors, subprocess.run(["git", "merge-base", "--is-ancestor", CURRENT_CAPTURE, "HEAD"], cwd=ROOT).returncode == 0, "E_CAPTURE_NOT_ANCESTOR")
        fail(errors, subprocess.run(["git", "merge-base", "--is-ancestor", PARENT_COMMIT, "HEAD"], cwd=ROOT).returncode == 0, "E_PARENT_NOT_HEAD_BASE")
    except OSError as exc:
        errors.append(f"E_GIT:{exc}")

    fail(errors, len(source_rows) == 67 and len(report.get("rows", [])) == 67, "E_SOURCE_ROSTER")
    fail(errors, {row.get("registration_id") for row in holdings} == LIVE_HOLDING_IDS, "E_LIVE_HOLDING_ROSTER")
    fail(errors, len(holdings) == 13 and len(inv.get("live_holdings", [])) == 13, "E_LIVE_HOLDING_COUNT")
    fail(errors, inv.get("live_holdings") == holdings, "E_LIVE_HOLDING_SNAPSHOT")
    rows = inv.get("rows", [])
    fail(errors, len(rows) == 18, "E_ROW_COUNT")
    fail(errors, [row.get("global_ordinal") for row in rows] == list(range(31, 49)), "E_ROW_ORDINALS")
    fail(errors, [row.get("source_item_id") for row in rows] == [f"OUTSIDE67-PATH-{i:03d}" for i in range(31, 49)], "E_SOURCE_IDS")

    holding_records = {holding["registration_id"]: load_jsonl(ROOT / holding["source_atom_set_ref"]) for holding in holdings}
    expected_same = expected_different = 0
    for offset, row in enumerate(rows):
        ordinal = offset + 31
        report_row = report["rows"][ordinal - 1]
        source_row = source_rows[ordinal - 1]
        path = report_row["path"]
        fail(errors, row.get("source_path") == path and row.get("source_item_id") == f"OUTSIDE67-PATH-{ordinal:03d}", f"E_PATH:{ordinal}")
        fail(errors, source_row.get("source_path") == path, f"E_SOURCE_PATH:{ordinal}")
        fail(errors, row.get("candidate_product") == "shared-cross-product" and row.get("product_status") == "unknown_path_based_candidate_only", f"E_PRODUCT:{ordinal}")
        fail(errors, row.get("candidate_phase") == "upstream-governance-or-crosswalk" and row.get("phase_status") == "unknown_path_based_candidate_only", f"E_PHASE:{ordinal}")
        fail(errors, row.get("implementation_status") == "unknown_not_evidenced_by_path_or_blob_catalog", f"E_IMPLEMENTATION:{ordinal}")
        fail(errors, row.get("degradation_assessment") == "unknown_not_semantically_assessed", f"E_DEGRADATION:{ordinal}")
        fail(errors, row.get("semantic_inclusion_status") == "unknown_not_semantically_assessed", f"E_SEMANTIC_INCLUSION:{ordinal}")
        fail(errors, row.get("semantic_inclusion_relation") == "unknown_not_semantically_assessed", f"E_SEMANTIC_RELATION:{ordinal}")
        fail(errors, row.get("archive_root_present") is False and row.get("legacy_catalog_record_count") == 0, f"E_ARCHIVE_CATALOG:{ordinal}")
        fail(errors, row.get("authority_effect") == "none" and row.get("meaning_change_applied") is False and row.get("successor_requirement_ids") == [] and row.get("human_decision_ref") is None, f"E_ROW_BOUNDARY:{ordinal}")
        fail(errors, row.get("old_runtime_test_ci_execution") is False, f"E_ROW_EXECUTION:{ordinal}")
        pre_blob = git_blob(PRE_ISOLATION, path)
        archive_blob = git_blob(ARCHIVE, path)
        pre_oid = git_oid(PRE_ISOLATION, path)
        archive_oid = git_oid(ARCHIVE, path)
        pre_sha = digest(pre_blob)
        fail(errors, pre_oid is not None and archive_oid is not None, f"E_GIT_OBJECT:{ordinal}")
        if pre_oid is None or archive_oid is None:
            continue
        fail(errors, row["pre_isolation"]["blob_oid"] == pre_oid and row["pre_isolation"]["sha256"] == pre_sha and row["pre_isolation"]["bytes"] == len(pre_blob), f"E_PRE_PHYSICAL:{ordinal}")
        fail(errors, row["pre_isolation"]["reported_blob_oid"] == report_row["pre_isolation_blob_oid"] and row["pre_isolation"]["reported_blob_oid_matches_git"] is True, f"E_PRE_REPORT:{ordinal}")
        archive_relation = "same" if archive_blob == pre_blob else "different"
        expected_same += archive_relation == "same"
        expected_different += archive_relation == "different"
        fail(errors, row["archive"]["blob_oid"] == archive_oid and row["archive"]["sha256"] == digest(archive_blob) and row["archive"]["bytes"] == len(archive_blob), f"E_ARCHIVE_PHYSICAL:{ordinal}")
        fail(errors, row["archive"]["reported_blob_oid"] == report_row["archive_commit_blob_oid"] and row["archive"]["reported_blob_oid_matches_git"] is True, f"E_ARCHIVE_REPORT:{ordinal}")
        fail(errors, row["archive"]["relation_to_pre_isolation"] == archive_relation, f"E_ARCHIVE_RELATION:{ordinal}")
        current_oid = git_oid(CURRENT_CAPTURE, path)
        fail(errors, row["current_capture"] == {"commit": CURRENT_CAPTURE, "state": "present" if current_oid else "absent", "blob_oid": current_oid}, f"E_CURRENT_CAPTURE:{ordinal}")
        fail(errors, report_row.get("archive_root_present") is False and report_row.get("legacy_catalog_record_count") == 0, f"E_REPORT_BOUNDARY:{ordinal}")

        relations = row.get("live_holding_relations", [])
        fail(errors, len(relations) == 13, f"E_RELATION_COUNT:{ordinal}")
        all_unmatched = True
        for holding, item in zip(holdings, relations):
            paths, blobs, shas = relation(path, pre_oid, pre_sha, holding_records[holding["registration_id"]])
            expected_relation = "no_exact_path_or_blob_or_sha_match" if not (paths or blobs or shas) else "match_requires_review"
            all_unmatched = all_unmatched and expected_relation == "no_exact_path_or_blob_or_sha_match"
            fail(errors, item.get("registration_id") == holding["registration_id"], f"E_RELATION_ID:{ordinal}:{holding['registration_id']}")
            fail(errors, item.get("relation") == expected_relation, f"E_RELATION_STATE:{ordinal}:{holding['registration_id']}")
            fail(errors, item.get("path_match_count") == len(paths) and item.get("pre_isolation_blob_match_count") == len(blobs) and item.get("pre_isolation_sha256_match_count") == len(shas), f"E_RELATION_COUNTS:{ordinal}:{holding['registration_id']}")
            fail(errors, item.get("path_match_evidence") == paths and item.get("blob_match_evidence") == blobs and item.get("sha256_match_evidence") == shas, f"E_RELATION_EVIDENCE:{ordinal}:{holding['registration_id']}")
        fail(errors, all_unmatched and row.get("existing_holding_inclusion_relation") == "not_in_any_of_13_live_holdings", f"E_PHYSICAL_NONINCLUSION:{ordinal}")
        fail(errors, all_unmatched and row.get("new_holding_needed") == "unresolved_new_holding_needed", f"E_NEW_HOLDING:{ordinal}")

    aggregate = inv.get("aggregate", {})
    fail(errors, aggregate.get("candidate_product_counts") == {"shared-cross-product": 18}, "E_AGGREGATE_PRODUCT")
    fail(errors, aggregate.get("candidate_phase_counts") == {"upstream-governance-or-crosswalk": 18}, "E_AGGREGATE_PHASE")
    fail(errors, aggregate.get("archive_blob_relation_counts") == {"different": expected_different, "same": expected_same}, "E_AGGREGATE_BLOBS")
    fail(errors, aggregate.get("current_state_counts") == {"absent": 18}, "E_AGGREGATE_CURRENT")
    fail(errors, aggregate.get("not_in_any_live_holding_count") == 18 and aggregate.get("new_holding_needed_unresolved_count") == 18, "E_AGGREGATE_HOLDINGS")
    fail(errors, aggregate.get("implementation_unknown_count") == 18 and aggregate.get("degradation_unknown_count") == 18 and aggregate.get("semantic_inclusion_unknown_count") == 18 and aggregate.get("legacy_catalog_zero_count") == 18, "E_AGGREGATE_UNKNOWNS")
    fail(errors, len(inv.get("prohibited_inference", [])) == 6, "E_PROHIBITED_INFERENCE")
    fail(errors, inv.get("verification_scope", {}).get("static_only") is True, "E_STATIC_ONLY")
    return errors


if __name__ == "__main__":
    errors = validate(json.loads(INV.read_text(encoding="utf-8")))
    if errors:
        print("FAIL outside-67 rows 31-48 validator")
        print("\n".join(errors))
        sys.exit(1)
    print("PASS outside-67 rows 31-48 validator: 18 paths / 13 live holdings / static blob relation")
