#!/usr/bin/env python3
"""Independent static validator for outside-67 rows 16 through 30."""

from __future__ import annotations

import copy
from functools import lru_cache
import hashlib
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

# This is the reviewed PR tip.  The generator and inventory are anchored to
# Git objects so a matching pair of edited working-tree files cannot redefine
# the oracle used by this validator.
ANCHOR_COMMIT = "480d1c2a027f065a4150853039f3141092a84b42"
GENERATOR_PATH = "scaffold/pre-isolation-outside-holding-16-30/generate.py"
INVENTORY_PATH = "scaffold/pre-isolation-outside-holding-16-30/inventory.json"
EXPECTED_GENERATOR_BLOB_OID = "88916178e6b7dc6dd08df9904c8fe4b60e0525ab"
EXPECTED_INVENTORY_BLOB_OID = "7f40386d59c42cc49fcac86b326c85a34bdd4fbe"
EXPECTED_GENERATOR_SHA256 = "dbcb6ae174e0b948f10e36b62d506a6ca7ee20ced1b9d5edf57e82e3c8f8b7bd"
EXPECTED_INVENTORY_SHA256 = "db86c9dd73ea081fcbb1e62645181f0d41449fe62cfdf1a7ad4a9551205d2fed"

REPORT_PATH = "scaffold/pre-isolation-outside-holding-67/report.json"
SOURCE_SET_PATH = "docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl"
PRE_ISOLATION = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCHIVE = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
CURRENT_CAPTURE = "3df81ad27157c471e004083783f37a5860eaa2ee"
REGISTER_PATH = "docs/governance/management-provisional-requirement-register.jsonl"
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


def fail(errors: list[str], condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


@lru_cache(maxsize=128)
def git_blob_oid(commit: str, path: str) -> str | None:
    result = subprocess.run(
        ["git", "rev-parse", f"{commit}:{path}"],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True,
    )
    return result.stdout.strip() if result.returncode == 0 else None


@lru_cache(maxsize=128)
def git_blob(commit: str, path: str) -> bytes:
    return subprocess.run(
        ["git", "show", f"{commit}:{path}"],
        cwd=ROOT,
        check=True,
        stdout=subprocess.PIPE,
    ).stdout


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git_object_anchor_errors(
    generator_bytes: bytes | None = None,
    inventory_bytes: bytes | None = None,
) -> list[str]:
    """Reject a jointly edited generator/inventory pair before self-equality."""
    errors: list[str] = []
    try:
        anchored = subprocess.run(
            ["git", "merge-base", "--is-ancestor", ANCHOR_COMMIT, "HEAD"],
            cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
        ).returncode == 0
        fail(errors, anchored, "E_GIT_ANCHOR_NOT_ANCESTOR")
        fail(errors, git_blob_oid(ANCHOR_COMMIT, GENERATOR_PATH) == EXPECTED_GENERATOR_BLOB_OID, "E_GIT_ANCHOR_GENERATOR_OBJECT")
        fail(errors, git_blob_oid(ANCHOR_COMMIT, INVENTORY_PATH) == EXPECTED_INVENTORY_BLOB_OID, "E_GIT_ANCHOR_INVENTORY_OBJECT")
        generator_bytes = (ROOT / GENERATOR_PATH).read_bytes() if generator_bytes is None else generator_bytes
        inventory_bytes = (ROOT / INVENTORY_PATH).read_bytes() if inventory_bytes is None else inventory_bytes
        fail(errors, sha256(generator_bytes) == EXPECTED_GENERATOR_SHA256, "E_WORKTREE_GENERATOR_DIGEST")
        fail(errors, sha256(inventory_bytes) == EXPECTED_INVENTORY_SHA256, "E_WORKTREE_INVENTORY_DIGEST")
    except (OSError, subprocess.CalledProcessError) as exc:
        errors.append(f"E_GIT_OBJECT:{exc}")
    return errors


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


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


@lru_cache(maxsize=1)
def independent_live_holdings() -> tuple[list[dict], dict[str, list[dict]]]:
    register = load_jsonl(ROOT / REGISTER_PATH)
    superseded = {row.get("supersedes_registration_id") for row in register if row.get("supersedes_registration_id")}
    live_rows = [row for row in register if row.get("registration_id") not in superseded]
    if {row.get("registration_id") for row in live_rows} != LIVE_HOLDING_IDS:
        raise ValueError("unexpected live holding roster")
    holdings: list[dict] = []
    holding_rows: dict[str, list[dict]] = {}
    for row in live_rows:
        source_path = ROOT / row["source_atom_set_ref"]
        records = load_jsonl(source_path)
        holding = {
            "registration_id": row["registration_id"],
            "source_atom_set_ref": row["source_atom_set_ref"],
            "source_atom_set_sha256": sha256(source_path.read_bytes()),
            "source_atom_set_record_count": len(records),
            "registration_kind": row["registration_kind"],
            "product_target": row["product_target"],
            "authority_effect": row["authority_effect"],
        }
        holdings.append(holding)
        holding_rows[holding["registration_id"]] = records
    return holdings, holding_rows


def independent_relation(path: str, pre_oid: str, pre_sha: str, holding: dict, records: list[dict]) -> dict:
    path_hits: list[str] = []
    blob_hits: list[str] = []
    sha_hits: list[str] = []
    for index, source_row in enumerate(records, 1):
        path_hits.extend(f"{index}:{hit}" for hit in exact_hits(source_row, path))
        blob_hits.extend(f"{index}:{hit}" for hit in exact_hits(source_row, pre_oid))
        sha_hits.extend(f"{index}:{hit}" for hit in exact_hits(source_row, pre_sha))
    return {
        "registration_id": holding["registration_id"],
        "source_atom_set_ref": holding["source_atom_set_ref"],
        "path_match_count": len(path_hits),
        "pre_isolation_blob_match_count": len(blob_hits),
        "pre_isolation_sha256_match_count": len(sha_hits),
        "path_match_evidence": path_hits,
        "blob_match_evidence": blob_hits,
        "sha256_match_evidence": sha_hits,
        "relation": "no_exact_path_or_blob_or_sha_match" if not (path_hits or blob_hits or sha_hits) else "match_requires_review",
    }


@lru_cache(maxsize=64)
def independent_relations(path: str, pre_oid: str, pre_sha: str) -> tuple[dict, ...]:
    holdings, holding_rows = independent_live_holdings()
    return tuple(
        independent_relation(path, pre_oid, pre_sha, holding, holding_rows[holding["registration_id"]])
        for holding in holdings
    )


def independent_git_holding_scan(inv: dict) -> list[str]:
    """Recompute rows 16–30 and all 13 holding relations without generator.build()."""
    errors: list[str] = []
    try:
        report = json.loads((ROOT / REPORT_PATH).read_text(encoding="utf-8"))
        source_rows = load_jsonl(ROOT / SOURCE_SET_PATH)
        holdings, holding_rows = independent_live_holdings()
        rows = inv.get("rows", [])
        expected_report = report["rows"][15:30]
        expected_source = source_rows[15:30]
        fail(errors, len(expected_report) == len(rows) == 15 and len(expected_source) == 15, "E_INDEPENDENT_SELECTION")
        fail(errors, inv.get("live_holdings") == holdings, "E_INDEPENDENT_HOLDINGS")
        for index, row in enumerate(rows):
            if index >= len(expected_report) or index >= len(expected_source):
                continue
            report_row = expected_report[index]
            source_row = expected_source[index]
            path = report_row["path"]
            fail(errors, row.get("source_path") == path == source_row["source_path"], f"E_INDEPENDENT_PATH:{index}")
            fail(errors, row.get("candidate_product") == report_row["product_scope"], f"E_INDEPENDENT_PRODUCT:{path}")
            fail(errors, row.get("candidate_phase") == report_row["phase_scope"], f"E_INDEPENDENT_PHASE:{path}")
            pre_blob = git_blob(PRE_ISOLATION, path)
            archive_blob = git_blob(ARCHIVE, path)
            pre_oid = git_blob_oid(PRE_ISOLATION, path)
            archive_oid = git_blob_oid(ARCHIVE, path)
            pre_sha = sha256(pre_blob)
            fail(errors, row.get("pre_isolation", {}).get("blob_oid") == pre_oid, f"E_INDEPENDENT_PRE_OID:{path}")
            fail(errors, row.get("pre_isolation", {}).get("sha256") == pre_sha and row.get("pre_isolation", {}).get("bytes") == len(pre_blob), f"E_INDEPENDENT_PRE_BYTES:{path}")
            fail(errors, row.get("archive", {}).get("blob_oid") == archive_oid, f"E_INDEPENDENT_ARCHIVE_OID:{path}")
            fail(errors, row.get("archive", {}).get("sha256") == sha256(archive_blob) and row.get("archive", {}).get("bytes") == len(archive_blob), f"E_INDEPENDENT_ARCHIVE_BYTES:{path}")
            fail(errors, row.get("current_capture", {}).get("blob_oid") == git_blob_oid(CURRENT_CAPTURE, path), f"E_INDEPENDENT_CURRENT:{path}")
            expected_relations = list(independent_relations(path, pre_oid, pre_sha))
            fail(errors, row.get("live_holding_relations") == expected_relations, f"E_INDEPENDENT_HOLDING_SCAN:{path}")
    except (OSError, KeyError, TypeError, ValueError, subprocess.CalledProcessError) as exc:
        errors.append(f"E_INDEPENDENT_SCAN:{exc}")
    return errors


def validate(inv: dict) -> list[str]:
    errors: list[str] = []
    errors.extend(git_object_anchor_errors())
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
    errors.extend(independent_git_holding_scan(inv))
    return errors


if __name__ == "__main__":
    errors = validate(json.loads(INV.read_text(encoding="utf-8")))
    if errors:
        print("FAIL outside-67 rows 16-30 validator")
        print("\n".join(errors))
        sys.exit(1)
    print("PASS outside-67 rows 16-30 validator: 15 paths / 13 live holdings / static blob relation")
