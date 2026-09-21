#!/usr/bin/env python3
"""独立validator。generate.pyをimportせず、固定sourceと13 holdingを再照合する。"""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from functools import lru_cache
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INV = HERE / "inventory.json"
ITEMS = HERE / "source-items.jsonl"
REPORT = ROOT / "scaffold/pre-isolation-outside-holding-67/report.json"
REGISTER = ROOT / "docs/governance/management-provisional-requirement-register.jsonl"
PRE = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCHIVE = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
CAPTURE = "3df81ad27157c471e004083783f37a5860eaa2ee"
REPORT_SHA = "4544a56b8eb2e50f6720c019e73ad0575796a300b97db15bf246e5cbe442e795"
REGISTER_SHA = "4e43fadaec48dcb0399e73eff148419671d4ac87fd4f8f68899dadf186ce5b8b"
EXPECTED_PRODUCTS = {"HELIX-HARNESS": 1, "HELIX-OS": 1, "HELIX-Web": 1, "HELIX-Web-OS": 1, "shared-cross-product": 15}
EXPECTED_PHASES = {"L11-acceptance": 5, "upstream-governance-or-crosswalk": 14}

EXPECTED_FINDINGS = [
    "PR #1978 source setのoutside-67 reportからglobal ordinal 49–67の19 path_revision_pairを固定した。",
    "四製品候補とphase候補はpath由来の候補に留め、product／phase authorityへ昇格していない。",
    "全19件でimplementation、degradation、semantic inclusionをunknownとして保持した。",
    "pre-isolation／archiveのblob OID、SHA-256、bytes、same／differentをGit objectから再照合した。",
    "歴史的13 live holdingをsupersedes終端から再計算し、path／blob／SHAのexact relationを全件保持した。",
    "ordinal 58はLEGACY-RULE holdingへのpath文字列参照のみで、blob／SHA包含ではない。",
]
EXPECTED_PROHIBITED_INFERENCE = [
    "path_revision_pairをrequirement atom、requirement identity、successorへ変換しない",
    "path由来product／phase候補をproduct owner／phase authorityへ昇格しない",
    "unknown implementation／degradationをimplemented／degraded／unimplementedへ補完しない",
    "path／blob／SHAの不一致を意味の不在、不採用、廃止へ解釈しない",
    "旧archive runtime／test／CI／hook／adapterを実行せず、oracleやfallbackに使わない",
    "正式registerへのappend、採否、承認、L3/L10/L11、releaseを生成しない",
]

KEYSETS = {
    "root": {"schema", "candidate_id", "status", "authority_effect", "meaning_change_applied", "successor_requirement_ids", "human_decision_ref", "formal_register_append", "old_runtime_test_ci_execution", "scope", "classification_basis", "live_holdings", "source_items", "aggregate", "findings", "prohibited_inference", "verification_scope"},
    "scope": {"pre_isolation_commit", "archive_commit", "historical_capture_commit", "source_report_path", "source_report_sha256", "management_register_path", "management_register_sha256", "selected_ordinal_start", "selected_ordinal_end", "selected_count", "source_unit", "requirement_atoms", "read_only", "same_blob_count", "changed_blob_count", "archive_root_present_count", "live_holding_count", "base_change_condition"},
    "classification_basis": {"product", "phase", "implementation", "degradation", "semantic_inclusion"},
    "live_holding": {"registration_id", "source_atom_set_ref", "source_atom_set_sha256", "source_atom_set_record_count", "registration_kind", "product_target", "authority_effect"},
    "source_items": {"path", "record_count", "sha256"},
    "item": {"source_item_id", "source_ordinal", "source_unit", "source_path", "artifact_kind", "diff_status", "product_scope", "phase_scope", "path_classification", "implementation_assessment", "degradation_assessment", "implementation_status", "degradation_status", "semantic_inclusion", "semantic_inclusion_status", "semantic_inclusion_reason", "pre_isolation", "archive", "archive_root_present", "current_capture", "live_holding_relations", "existing_holding_inclusion_relation", "new_holding_needed", "source_holding_status", "semantic_disposition", "authority_effect", "meaning_change_applied", "successor_requirement_ids", "human_decision_ref", "old_runtime_test_ci_execution", "legacy_catalog_record_count"},
    "path_classification": {"product_candidate", "phase_candidate", "classification_state", "product_status", "phase_status"},
    "implementation_assessment": {"status", "evidence", "reason"},
    "degradation_assessment": {"status", "evidence", "reason"},
    "pre_isolation": {"commit", "blob_oid", "sha256", "bytes", "reported_blob_oid", "reported_blob_oid_matches_git"},
    "archive": {"commit", "blob_oid", "sha256", "bytes", "relation_to_pre_isolation", "reported_blob_oid", "reported_blob_oid_matches_git"},
    "current_capture": {"commit", "state", "blob_oid"},
    "relation": {"registration_id", "source_atom_set_ref", "path_match_count", "pre_isolation_blob_match_count", "pre_isolation_sha256_match_count", "path_match_evidence", "blob_match_evidence", "sha256_match_evidence", "relation"},
    "aggregate": {"product_candidate_counts", "phase_candidate_counts", "same_blob_count", "changed_blob_count", "not_in_any_live_holding_count", "path_reference_only_match_count", "exact_blob_or_sha_match_count", "implementation_unknown_count", "degradation_unknown_count", "semantic_inclusion_unknown_count", "source_holding_unassigned_count"},
    "aggregate.product_candidate_counts": {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS", "shared-cross-product"},
    "aggregate.phase_candidate_counts": {"L11-acceptance", "upstream-governance-or-crosswalk"},
    "verification_scope": {"static_only", "evidence_kind", "checks"},
}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


@lru_cache(maxsize=None)
def blob(commit: str, path: str) -> bytes:
    return subprocess.run(["git", "show", f"{commit}:{path}"], cwd=ROOT, check=True, stdout=subprocess.PIPE).stdout


@lru_cache(maxsize=None)
def oid(commit: str, path: str) -> str | None:
    result = subprocess.run(["git", "rev-parse", f"{commit}:{path}"], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True)
    return result.stdout.strip() if result.returncode == 0 else None


def exact_hits(value: object, target: str, prefix: str = "") -> list[str]:
    hits: list[str] = []
    if isinstance(value, dict):
        for key, child in value.items():
            location = f"{prefix}.{key}" if prefix else key
            if child == target:
                hits.append(location)
            hits.extend(exact_hits(child, target, location))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            hits.extend(exact_hits(child, target, f"{prefix}[{index}]"))
    return hits


@lru_cache(maxsize=1)
def holding_snapshot() -> tuple[list[dict], dict[str, list[dict]]]:
    register = load_jsonl(REGISTER)
    superseded = {row.get("supersedes_registration_id") for row in register if row.get("supersedes_registration_id")}
    live_rows = [row for row in register if row.get("registration_id") not in superseded]
    holdings: list[dict] = []
    records: dict[str, list[dict]] = {}
    for row in live_rows:
        source_path = ROOT / row["source_atom_set_ref"]
        source_records = load_jsonl(source_path)
        records[row["registration_id"]] = source_records
        holdings.append({
            "registration_id": row["registration_id"],
            "source_atom_set_ref": row["source_atom_set_ref"],
            "source_atom_set_sha256": sha(source_path.read_bytes()),
            "source_atom_set_record_count": len(source_records),
            "registration_kind": row["registration_kind"],
            "product_target": row["product_target"],
            "authority_effect": row["authority_effect"],
        })
    return holdings, records


def scan_relations(path: str, pre_oid: str, pre_sha: str, holdings: list[dict], records: dict[str, list[dict]]) -> list[dict]:
    result: list[dict] = []
    for holding in holdings:
        path_hits: list[str] = []
        blob_hits: list[str] = []
        sha_hits: list[str] = []
        for number, record in enumerate(records[holding["registration_id"]], 1):
            path_hits.extend(f"{number}:{hit}" for hit in exact_hits(record, path))
            blob_hits.extend(f"{number}:{hit}" for hit in exact_hits(record, pre_oid))
            sha_hits.extend(f"{number}:{hit}" for hit in exact_hits(record, pre_sha))
        relation = "no_exact_path_or_blob_or_sha_match"
        if path_hits and not blob_hits and not sha_hits:
            relation = "path_reference_only_match_requires_review"
        elif path_hits or blob_hits or sha_hits:
            relation = "match_requires_review"
        result.append({
            "registration_id": holding["registration_id"],
            "source_atom_set_ref": holding["source_atom_set_ref"],
            "path_match_count": len(path_hits),
            "pre_isolation_blob_match_count": len(blob_hits),
            "pre_isolation_sha256_match_count": len(sha_hits),
            "path_match_evidence": path_hits,
            "blob_match_evidence": blob_hits,
            "sha256_match_evidence": sha_hits,
            "relation": relation,
        })
    return result


@lru_cache(maxsize=None)
def cached_relations(path: str, pre_oid: str, pre_sha: str) -> tuple[dict, ...]:
    holdings, records = holding_snapshot()
    return tuple(scan_relations(path, pre_oid, pre_sha, holdings, records))


def fail(errors: list[str], condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


def check_keyset(errors: list[str], value: object, expected: set[str], code: str) -> None:
    fail(errors, isinstance(value, dict) and set(value) == expected, code)


def canonical_items(items: list[dict]) -> bytes:
    return "".join(json.dumps(item, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for item in items).encode("utf-8")


def validate(inventory: dict | None = None, items: list[dict] | None = None) -> list[str]:
    errors: list[str] = []
    try:
        if inventory is None:
            inventory = json.loads(INV.read_text(encoding="utf-8"))
        if items is None:
            items = load_jsonl(ITEMS)
        report = json.loads(REPORT.read_text(encoding="utf-8"))
        holdings, records = holding_snapshot()
    except Exception as exc:  # pragma: no cover - fail closed for malformed evidence
        return [f"E_INPUT:{type(exc).__name__}:{exc}"]

    check_keyset(errors, inventory, KEYSETS["root"], "E_KEYSET:root")
    fail(errors, inventory.get("schema") == "rdp001-outside67-global-classification-49-67/v1", "E_SCHEMA")
    fail(errors, inventory.get("candidate_id") == "RDP-001-OUTSIDE67-GLOBAL-49-67-0044", "E_CANDIDATE")
    fail(errors, inventory.get("status") == "findings_only", "E_STATUS")
    fail(errors, inventory.get("authority_effect") == "none", "E_AUTHORITY")
    fail(errors, inventory.get("meaning_change_applied") is False, "E_MEANING")
    fail(errors, inventory.get("successor_requirement_ids") == [] and inventory.get("human_decision_ref") is None, "E_DECISION_BOUNDARY")
    fail(errors, inventory.get("formal_register_append") is False, "E_FORMAL_APPEND")
    fail(errors, inventory.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")
    fail(errors, inventory.get("scope", {}).get("source_report_sha256") == REPORT_SHA, "E_REPORT_SHA")
    fail(errors, inventory.get("scope", {}).get("management_register_sha256") == REGISTER_SHA, "E_REGISTER_SHA")
    fail(errors, sha(REPORT.read_bytes()) == REPORT_SHA, "E_REPORT_DIGEST")
    fail(errors, sha(REGISTER.read_bytes()) == REGISTER_SHA, "E_REGISTER_DIGEST")
    scope = inventory.get("scope", {})
    check_keyset(errors, scope, KEYSETS["scope"], "E_KEYSET:scope")
    check_keyset(errors, inventory.get("classification_basis", {}), KEYSETS["classification_basis"], "E_KEYSET:classification_basis")
    check_keyset(errors, inventory.get("source_items", {}), KEYSETS["source_items"], "E_KEYSET:source_items")
    check_keyset(errors, inventory.get("aggregate", {}), KEYSETS["aggregate"], "E_KEYSET:aggregate")
    aggregate = inventory.get("aggregate", {})
    check_keyset(errors, aggregate.get("product_candidate_counts", {}), KEYSETS["aggregate.product_candidate_counts"], "E_KEYSET:aggregate.product_candidate_counts")
    check_keyset(errors, aggregate.get("phase_candidate_counts", {}), KEYSETS["aggregate.phase_candidate_counts"], "E_KEYSET:aggregate.phase_candidate_counts")
    check_keyset(errors, inventory.get("verification_scope", {}), KEYSETS["verification_scope"], "E_KEYSET:verification_scope")
    fail(errors, inventory.get("findings") == EXPECTED_FINDINGS, "E_FINDINGS")
    fail(errors, inventory.get("prohibited_inference") == EXPECTED_PROHIBITED_INFERENCE, "E_PROHIBITED_INFERENCE")
    for holding in inventory.get("live_holdings", []):
        check_keyset(errors, holding, KEYSETS["live_holding"], "E_KEYSET:live_holdings[]")
    fail(errors, scope.get("pre_isolation_commit") == PRE and scope.get("archive_commit") == ARCHIVE, "E_SOURCE_COMMITS")
    fail(errors, scope.get("historical_capture_commit") == CAPTURE, "E_HISTORICAL_CAPTURE")
    fail(errors, scope.get("selected_ordinal_start") == 49 and scope.get("selected_ordinal_end") == 67, "E_ORDINAL_RANGE")
    fail(errors, scope.get("selected_count") == 19 and scope.get("source_unit") == "path_revision_pair" and scope.get("requirement_atoms") is False, "E_SCOPE")
    fail(errors, scope.get("read_only") is True, "E_READ_ONLY")
    fail(errors, scope.get("base_change_condition", "").startswith("main/baseが親d272以後へ進んでも"), "E_BASE_CHANGE_CONDITION")

    fail(errors, len(items) == 19, "E_ITEM_COUNT")
    report_rows = report.get("rows", [])[48:67]
    fail(errors, len(report_rows) == 19, "E_REPORT_SELECTION")
    fail(errors, len(holdings) == 13, "E_HOLDING_COUNT")
    fail(errors, inventory.get("live_holdings") == holdings, "E_HOLDING_SNAPSHOT")

    expected_products: dict[str, int] = {}
    expected_phases: dict[str, int] = {}
    same_count = different_count = path_only_count = exact_count = 0
    for offset, (item, row) in enumerate(zip(items, report_rows), 49):
        label = f"{offset}:{row.get('path')}"
        check_keyset(errors, item, KEYSETS["item"], "E_KEYSET:item")
        check_keyset(errors, item.get("path_classification", {}), KEYSETS["path_classification"], "E_KEYSET:item.path_classification")
        check_keyset(errors, item.get("implementation_assessment", {}), KEYSETS["implementation_assessment"], "E_KEYSET:item.implementation_assessment")
        check_keyset(errors, item.get("degradation_assessment", {}), KEYSETS["degradation_assessment"], "E_KEYSET:item.degradation_assessment")
        check_keyset(errors, item.get("pre_isolation", {}), KEYSETS["pre_isolation"], "E_KEYSET:item.pre_isolation")
        check_keyset(errors, item.get("archive", {}), KEYSETS["archive"], "E_KEYSET:item.archive")
        check_keyset(errors, item.get("current_capture", {}), KEYSETS["current_capture"], "E_KEYSET:item.current_capture")
        for relation_item in item.get("live_holding_relations", []):
            check_keyset(errors, relation_item, KEYSETS["relation"], "E_KEYSET:item.live_holding_relations[]")
        fail(errors, item.get("source_item_id") == f"OUTSIDE67-GLOBAL-{offset:03d}", f"E_ITEM_ID:{label}")
        fail(errors, item.get("source_ordinal") == offset, f"E_ITEM_ORDINAL:{label}")
        fail(errors, item.get("source_unit") == "path_revision_pair", f"E_ITEM_UNIT:{label}")
        fail(errors, item.get("source_path") == row.get("path"), f"E_PATH:{label}")
        fail(errors, item.get("artifact_kind") == row.get("artifact_kind") and item.get("diff_status") == row.get("diff_status"), f"E_ARTIFACT:{label}")
        fail(errors, item.get("product_scope") == row.get("product_scope") and item.get("phase_scope") == row.get("phase_scope"), f"E_SCOPE_CANDIDATE:{label}")
        path_class = item.get("path_classification", {})
        fail(errors, path_class.get("product_candidate") == row.get("product_scope"), f"E_PRODUCT_CANDIDATE:{label}")
        fail(errors, path_class.get("phase_candidate") == row.get("phase_scope"), f"E_PHASE_CANDIDATE:{label}")
        fail(errors, path_class.get("classification_state") == "path_based_candidate_only", f"E_CLASSIFICATION:{label}")
        fail(errors, path_class.get("product_status") == "unknown_path_based_candidate_only" and path_class.get("phase_status") == "unknown_path_based_candidate_only", f"E_PRODUCT_PHASE_UNKNOWN:{label}")
        implementation = item.get("implementation_assessment", {})
        degradation = item.get("degradation_assessment", {})
        fail(errors, implementation.get("status") == "unknown" and implementation.get("evidence") == "none_path_only", f"E_IMPLEMENTATION_UNKNOWN:{label}")
        fail(errors, degradation.get("status") == "unknown" and degradation.get("evidence") == "none_path_only", f"E_DEGRADATION_UNKNOWN:{label}")
        fail(errors, item.get("implementation_status") == "unknown" and item.get("degradation_status") == "unknown" and item.get("semantic_inclusion") == "unknown", f"E_DIRECT_UNKNOWN:{label}")
        fail(errors, item.get("semantic_inclusion_status") == "unknown", f"E_SEMANTIC_INCLUSION_UNKNOWN:{label}")
        fail(errors, "path_revision_pair" in item.get("semantic_inclusion_reason", ""), f"E_SEMANTIC_INCLUSION_REASON:{label}")

        pre = item.get("pre_isolation", {})
        archive = item.get("archive", {})
        try:
            pre_bytes = blob(PRE, row["path"])
            archive_bytes = blob(ARCHIVE, row["path"])
            pre_oid = oid(PRE, row["path"])
            archive_oid = oid(ARCHIVE, row["path"])
        except Exception as exc:
            errors.append(f"E_GIT_OBJECT:{label}:{exc}")
            continue
        fail(errors, pre.get("commit") == PRE and pre.get("blob_oid") == pre_oid and pre.get("sha256") == sha(pre_bytes) and pre.get("bytes") == len(pre_bytes), f"E_PRE_OBJECT:{label}")
        fail(errors, pre.get("reported_blob_oid") == row.get("pre_isolation_blob_oid") and pre.get("reported_blob_oid_matches_git") is True, f"E_PRE_REPORT:{label}")
        fail(errors, archive.get("commit") == ARCHIVE and archive.get("blob_oid") == archive_oid and archive.get("sha256") == sha(archive_bytes) and archive.get("bytes") == len(archive_bytes), f"E_ARCHIVE_OBJECT:{label}")
        fail(errors, archive.get("reported_blob_oid") == row.get("archive_commit_blob_oid") and archive.get("reported_blob_oid_matches_git") is True, f"E_ARCHIVE_REPORT:{label}")
        relation = "same" if pre_oid == archive_oid else "different"
        fail(errors, archive.get("relation_to_pre_isolation") == relation == row.get("archive_blob_relation"), f"E_ARCHIVE_RELATION:{label}")
        fail(errors, item.get("archive_root_present") is False and row.get("archive_root_present") is False, f"E_ARCHIVE_ROOT:{label}")
        capture_oid = oid(CAPTURE, row["path"])
        current = item.get("current_capture", {})
        fail(errors, current.get("commit") == CAPTURE and current.get("blob_oid") == capture_oid and current.get("state") == ("present" if capture_oid else "absent"), f"E_CAPTURE_OBJECT:{label}")

        expected_relations = list(cached_relations(row["path"], pre_oid, sha(pre_bytes)))
        fail(errors, item.get("live_holding_relations") == expected_relations, f"E_HOLDING_RELATIONS:{label}")
        has_path_only = any(r["relation"] == "path_reference_only_match_requires_review" for r in expected_relations)
        expected_inclusion = "path_reference_only_match_requires_review" if has_path_only else "not_in_any_of_13_live_holdings"
        fail(errors, item.get("existing_holding_inclusion_relation") == expected_inclusion, f"E_INCLUSION:{label}")
        if has_path_only:
            path_only_count += 1
        if any(r["pre_isolation_blob_match_count"] or r["pre_isolation_sha256_match_count"] for r in expected_relations):
            exact_count += 1
        fail(errors, item.get("new_holding_needed") == "unresolved_new_holding_needed", f"E_NEW_HOLDING:{label}")
        fail(errors, item.get("source_holding_status") == "proposed_preserved_unassigned" and item.get("semantic_disposition") == "not_started", f"E_DISPOSITION:{label}")
        fail(errors, item.get("authority_effect") == "none" and item.get("meaning_change_applied") is False and item.get("successor_requirement_ids") == [] and item.get("human_decision_ref") is None and item.get("old_runtime_test_ci_execution") is False, f"E_ITEM_BOUNDARY:{label}")
        expected_products[row["product_scope"]] = expected_products.get(row["product_scope"], 0) + 1
        expected_phases[row["phase_scope"]] = expected_phases.get(row["phase_scope"], 0) + 1
        if relation == "same":
            same_count += 1
        else:
            different_count += 1

    fail(errors, expected_products == EXPECTED_PRODUCTS, "E_PRODUCT_COUNTS")
    fail(errors, expected_phases == EXPECTED_PHASES, "E_PHASE_COUNTS")
    aggregate = inventory.get("aggregate", {})
    fail(errors, aggregate.get("product_candidate_counts") == dict(sorted(EXPECTED_PRODUCTS.items())), "E_AGGREGATE_PRODUCTS")
    fail(errors, aggregate.get("phase_candidate_counts") == dict(sorted(EXPECTED_PHASES.items())), "E_AGGREGATE_PHASES")
    fail(errors, aggregate.get("same_blob_count") == same_count == 9 and aggregate.get("changed_blob_count") == different_count == 10, "E_AGGREGATE_BLOB")
    fail(errors, aggregate.get("not_in_any_live_holding_count") == 18 and aggregate.get("path_reference_only_match_count") == path_only_count == 1 and aggregate.get("exact_blob_or_sha_match_count") == exact_count == 0, "E_AGGREGATE_HOLDING")
    fail(errors, aggregate.get("implementation_unknown_count") == 19 and aggregate.get("degradation_unknown_count") == 19 and aggregate.get("semantic_inclusion_unknown_count") == 19, "E_AGGREGATE_UNKNOWN")
    fail(errors, aggregate.get("source_holding_unassigned_count") == 19, "E_AGGREGATE_UNASSIGNED")
    fail(errors, inventory.get("source_items", {}).get("record_count") == 19, "E_SOURCE_COUNT")
    fail(errors, inventory.get("source_items", {}).get("sha256") == sha(ITEMS.read_bytes()) == sha(canonical_items(items)), "E_SOURCE_DIGEST")
    fail(errors, inventory.get("classification_basis", {}).get("semantic_inclusion", "").startswith("path_revision_pair"), "E_CLASSIFICATION_BASIS")
    fail(errors, len(inventory.get("prohibited_inference", [])) == 6, "E_PROHIBITED_BOUNDARY")
    return errors


if __name__ == "__main__":
    problems = validate()
    if problems:
        print("FAIL outside67 global 49-67 validator")
        print("\n".join(problems))
        sys.exit(1)
    print("PASS outside67 global 49-67 validator: 19 items / 13 historical live holdings / static-only")
