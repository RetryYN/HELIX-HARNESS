#!/usr/bin/env python3
"""Independent validator for the outside-67 source_holding proposal.

This validator intentionally does not import generate.py. It rechecks the Git
objects, report rows, live holdings, source-set digest, and proposed register
record independently so a self-consistent generator mutation is observable.
"""

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
PROPOSAL = HERE / "proposed-register-record.json"
REPORT_PATH = "scaffold/pre-isolation-outside-holding-67/report.json"
PRE_ISOLATION = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCHIVE = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
CAPTURE = "3df81ad27157c471e004083783f37a5860eaa2ee"
REGISTER_PATH = "docs/governance/management-provisional-requirement-register.jsonl"
EXPECTED_REPORT_SHA = "4544a56b8eb2e50f6720c019e73ad0575796a300b97db15bf246e5cbe442e795"
EXPECTED_REGISTER_SHA = "4e43fadaec48dcb0399e73eff148419671d4ac87fd4f8f68899dadf186ce5b8b"
EXPECTED_DISPOSITION_SHA = "6eb28f5fef9b5551c84231ceb8fefca949f6cfd5449224b5ab644d61f7136308"
EXPECTED_PROPOSAL_ID = "MPR-SH-OUTSIDE67-001"
EXPECTED_PROHIBITED_INFERENCE = [
    "path itemをrequirement atom、requirement identity、successorへ変換しない",
    "source_holding候補をsemantic adoption、product owner、phase authority、implementationへ昇格しない",
    "archive commit objectの存在をarchive root保存、現行配置、意味同値へ解釈しない",
    "pre-isolation／archive blob差分を意味変更、採否、retireへ解釈しない",
    "13 live holdingへの不一致を要求意味の不在、不採用、廃止へ解釈しない",
    "旧archive runtime／test／CI／hook／adapterを実行せず、oracle、fallback、implementationへ使わない",
]


def fail(errors: list[str], condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


@lru_cache(maxsize=None)
def git_blob(commit: str, path: str) -> bytes:
    return subprocess.run(["git", "show", f"{commit}:{path}"], cwd=ROOT, check=True, stdout=subprocess.PIPE).stdout


@lru_cache(maxsize=None)
def git_oid(commit: str, path: str) -> str | None:
    result = subprocess.run(["git", "rev-parse", f"{commit}:{path}"], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True)
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


def live_holdings(register: list[dict]) -> tuple[list[dict], dict[str, list[dict]]]:
    superseded = {row.get("supersedes_registration_id") for row in register if row.get("supersedes_registration_id")}
    live = [row for row in register if row.get("registration_id") not in superseded]
    holdings = []
    records: dict[str, list[dict]] = {}
    for row in live:
        path = ROOT / row["source_atom_set_ref"]
        source_rows = load_jsonl(path)
        records[row["registration_id"]] = source_rows
        holdings.append({
            "registration_id": row["registration_id"],
            "source_atom_set_ref": row["source_atom_set_ref"],
            "source_atom_set_sha256": sha(path.read_bytes()),
            "source_atom_set_record_count": len(source_rows),
            "registration_kind": row["registration_kind"],
            "product_target": row["product_target"],
            "authority_effect": row["authority_effect"],
        })
    return holdings, records


def canonical_source_lines(items: list[dict]) -> bytes:
    return "".join(json.dumps(item, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for item in items).encode("utf-8")


@lru_cache(maxsize=1)
def git_register_refs() -> list[str]:
    result = subprocess.run(["git", "grep", "-l", EXPECTED_REGISTER_SHA, CAPTURE, "--", "scaffold", "docs"], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True)
    return sorted(set(line.split(":", 1)[-1] for line in result.stdout.splitlines()))


@lru_cache(maxsize=1)
def current_holding_snapshot() -> tuple[list[dict], dict[str, list[dict]]]:
    register = load_jsonl(ROOT / REGISTER_PATH)
    return live_holdings(register)


@lru_cache(maxsize=None)
def holding_relations(path: str, pre_oid: str, pre_sha: str) -> tuple[dict, ...]:
    holdings, holding_rows = current_holding_snapshot()
    relations = []
    for holding in holdings:
        path_hits: list[str] = []
        blob_hits: list[str] = []
        sha_hits: list[str] = []
        for record_index, source_row in enumerate(holding_rows[holding["registration_id"]], 1):
            path_hits.extend(f"{record_index}:{hit}" for hit in exact_hits(source_row, path))
            blob_hits.extend(f"{record_index}:{hit}" for hit in exact_hits(source_row, pre_oid))
            sha_hits.extend(f"{record_index}:{hit}" for hit in exact_hits(source_row, pre_sha))
        if path_hits and not blob_hits and not sha_hits:
            relation_kind = "path_reference_only_match_requires_review"
        elif path_hits or blob_hits or sha_hits:
            relation_kind = "match_requires_review"
        else:
            relation_kind = "no_exact_path_or_blob_or_sha_match"
        relations.append({
            "registration_id": holding["registration_id"],
            "source_atom_set_ref": holding["source_atom_set_ref"],
            "path_match_count": len(path_hits),
            "pre_isolation_blob_match_count": len(blob_hits),
            "pre_isolation_sha256_match_count": len(sha_hits),
            "path_match_evidence": path_hits,
            "blob_match_evidence": blob_hits,
            "sha256_match_evidence": sha_hits,
            "relation": relation_kind,
        })
    return tuple(relations)


def validate(inv: dict, source_items: list[dict], proposed: dict) -> list[str]:
    errors: list[str] = []
    report_path = ROOT / REPORT_PATH
    report = json.loads(report_path.read_text(encoding="utf-8"))
    register_path = ROOT / REGISTER_PATH
    holdings, _holding_rows = current_holding_snapshot()

    fail(errors, inv.get("schema") == "rdp001-preisolation-outside-holding-67-source-holding-proposal/v1", "E_SCHEMA")
    fail(errors, inv.get("status") == "findings_only", "E_STATUS")
    fail(errors, inv.get("candidate_id") == "RDP-001-PREISO-OUTSIDE-HOLDING-67-PROPOSAL-0038", "E_CANDIDATE")
    fail(errors, inv.get("authority_effect") == "none", "E_AUTHORITY")
    fail(errors, inv.get("meaning_change_applied") is False, "E_MEANING")
    fail(errors, inv.get("successor_requirement_ids") == [] and inv.get("human_decision_ref") is None, "E_DECISION_BOUNDARY")
    fail(errors, inv.get("formal_register_append") is False, "E_FORMAL_APPEND")
    fail(errors, inv.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")
    fail(errors, inv.get("prohibited_inference") == EXPECTED_PROHIBITED_INFERENCE, "E_PROHIBITED_BOUNDARY")

    scope = inv.get("scope", {})
    fail(errors, scope.get("outside_report_sha256") == EXPECTED_REPORT_SHA, "E_REPORT_SHA")
    fail(errors, scope.get("pre_isolation_commit") == PRE_ISOLATION and scope.get("archive_commit") == ARCHIVE, "E_SOURCE_COMMITS")
    fail(errors, scope.get("current_capture_commit") == CAPTURE, "E_CAPTURE")
    fail(errors, scope.get("selected_count") == 67 and scope.get("source_unit") == "path_revision_pair" and scope.get("requirement_atoms") is False, "E_SOURCE_SCOPE")
    fail(errors, scope.get("live_holding_count") == 13, "E_HOLDING_COUNT")
    fail(errors, scope.get("management_register_sha256") == EXPECTED_REGISTER_SHA, "E_REGISTER_SHA")
    fail(errors, scope.get("requirement_disposition_program_sha256") == EXPECTED_DISPOSITION_SHA, "E_DISPOSITION_SHA")
    fail(errors, len(holdings) == 13, "E_LIVE_HOLDINGS")
    try:
        fail(errors, subprocess.run(["git", "merge-base", "--is-ancestor", CAPTURE, "HEAD"], cwd=ROOT).returncode == 0, "E_CAPTURE_NOT_ANCESTOR")
    except OSError as exc:
        errors.append(f"E_GIT:{exc}")

    fail(errors, len(source_items) == 67, "E_ITEM_COUNT")
    fail(errors, len({item.get("source_item_id") for item in source_items}) == 67, "E_ITEM_IDS")
    fail(errors, inv.get("source_items") == source_items, "E_INVENTORY_ITEM_COPY")
    source_bytes = canonical_source_lines(source_items)
    fail(errors, sha(source_bytes) == inv.get("proposal_source_set_sha256"), "E_SOURCE_SET_DIGEST")
    fail(errors, sha(ITEMS.read_bytes()) == inv.get("proposal_source_set_sha256"), "E_SOURCE_FILE_DIGEST")
    fail(errors, proposed == inv.get("proposed_register_record"), "E_PROPOSAL_COPY")
    fail(errors, proposed.get("registration_id") == EXPECTED_PROPOSAL_ID, "E_PROPOSAL_ID")
    fail(errors, proposed.get("registration_kind") == "source_holding" and proposed.get("product_target") == "unassigned_cross_product", "E_PROPOSAL_KIND")
    fail(errors, proposed.get("source_atom_count") == 67 and proposed.get("source_atom_set_digest") == f"sha256:{inv.get('proposal_source_set_sha256')}", "E_PROPOSAL_SOURCE")
    fail(errors, proposed.get("coverage_result") == "source_preserved_unassigned" and proposed.get("management_state") == "registered_source_holding" and proposed.get("authority_effect") == "none", "E_PROPOSAL_STATE")
    fail(errors, proposed.get("carried_atom_refs") == [] and proposed.get("preserved_pending_registration_refs") == [] and proposed.get("human_decision_disposition_refs") == [] and proposed.get("unaccounted_atom_refs") == [], "E_PROPOSAL_ATOMS")
    fail(errors, proposed.get("registered_by") == "pending_human_admission" and proposed.get("registered_at") == "pending_append", "E_PROPOSAL_NOT_REGISTERED")

    report_rows = report.get("rows", [])
    fail(errors, len(report_rows) == 67, "E_REPORT_ROWS")
    expected_same = 0
    expected_changed = 0
    expected_path_absent = 0
    expected_path_only = 0
    expected_product = {"HELIX-HARNESS": 0, "HELIX-OS": 0, "HELIX-Web": 0, "HELIX-Web-OS": 0, "shared-cross-product": 0}
    expected_phase = {"L1-planning": 0, "L2-requirements": 0, "shared-design": 0, "L11-acceptance": 0, "upstream-governance-or-crosswalk": 0}
    for index, (item, row) in enumerate(zip(source_items, report_rows), 1):
        path = row["path"]
        fail(errors, item.get("source_item_id") == f"OUTSIDE67-PATH-{index:03d}", f"E_ITEM_ORDINAL:{index}")
        fail(errors, item.get("source_path") == path and item.get("source_unit") == "path_revision_pair", f"E_ITEM_PATH:{index}")
        pre_blob = git_blob(PRE_ISOLATION, path)
        archive_blob = git_blob(ARCHIVE, path)
        pre_oid = git_oid(PRE_ISOLATION, path)
        archive_oid = git_oid(ARCHIVE, path)
        pre = item.get("pre_isolation", {})
        archive = item.get("archive", {})
        fail(errors, pre.get("blob_oid") == pre_oid == row["pre_isolation_blob_oid"], f"E_PRE_OID:{index}")
        fail(errors, pre.get("sha256") == sha(pre_blob) and pre.get("bytes") == len(pre_blob), f"E_PRE_BYTES:{index}")
        fail(errors, pre.get("reported_blob_oid_matches_git") is True, f"E_PRE_REPORT:{index}")
        fail(errors, archive.get("blob_oid") == archive_oid == row["archive_commit_blob_oid"], f"E_ARCHIVE_OID:{index}")
        fail(errors, archive.get("sha256") == sha(archive_blob) and archive.get("bytes") == len(archive_blob), f"E_ARCHIVE_BYTES:{index}")
        fail(errors, archive.get("reported_blob_oid_matches_git") is True, f"E_ARCHIVE_REPORT:{index}")
        relation = "same" if archive_blob == pre_blob else "different"
        fail(errors, archive.get("relation_to_pre_isolation") == relation == row["archive_blob_relation"], f"E_BLOB_RELATION:{index}")
        expected_same += relation == "same"
        expected_changed += relation == "different"
        fail(errors, item.get("archive_root_present") is False and row.get("archive_root_present") is False, f"E_ARCHIVE_ROOT:{index}")
        fail(errors, item.get("legacy_catalog_record_count") == 0 and row.get("legacy_catalog_record_count") == 0, f"E_CATALOG:{index}")
        current = item.get("current_capture", {})
        current_oid = git_oid(CAPTURE, path)
        expected_path_absent += current_oid is None
        fail(errors, current.get("commit") == CAPTURE and current.get("blob_oid") == current_oid and current.get("state") == ("present" if current_oid else "absent"), f"E_CURRENT:{index}")
        scope_data = item.get("reported_path_scope", {})
        fail(errors, scope_data.get("product_scope") == row.get("product_scope") and scope_data.get("phase_scope") == row.get("phase_scope"), f"E_SCOPE_COPY:{index}")
        fail(errors, scope_data.get("product_status") == "unknown_path_based_candidate_only" and scope_data.get("phase_status") == "unknown_path_based_candidate_only" and scope_data.get("implementation_status") == "unknown_not_evidenced_by_path_or_blob_catalog", f"E_UNKNOWN_BOUNDARY:{index}")
        expected_product[row.get("product_scope")] += 1
        expected_phase[row.get("phase_scope")] += 1

        expected_relations = list(holding_relations(path, pre_oid or "", sha(pre_blob)))
        fail(errors, item.get("live_holding_relations") == expected_relations, f"E_HOLDING_RELATIONS:{index}")
        all_unmatched = all(r["relation"] == "no_exact_path_or_blob_or_sha_match" for r in expected_relations)
        blob_unmatched = all(r["pre_isolation_blob_match_count"] == 0 and r["pre_isolation_sha256_match_count"] == 0 for r in expected_relations)
        expected_inclusion = "not_in_any_of_13_live_holdings" if all_unmatched else "path_reference_only_match_requires_review" if blob_unmatched else "match_requires_review"
        expected_new = "unresolved_new_holding_needed" if all_unmatched else "unresolved_new_holding_needed_or_existing_relation_review" if blob_unmatched else "unresolved_match_requires_review"
        fail(errors, item.get("existing_holding_inclusion_relation") == expected_inclusion, f"E_INCLUSION:{index}")
        fail(errors, item.get("new_holding_needed") == expected_new, f"E_NEW_HOLDING:{index}")
        fail(errors, item.get("source_holding_status") == "proposed_preserved_unassigned" and item.get("semantic_disposition") == "not_started", f"E_ITEM_STATE:{index}")
        fail(errors, item.get("authority_effect") == "none" and item.get("meaning_change_applied") is False and item.get("successor_requirement_ids") == [] and item.get("human_decision_ref") is None and item.get("old_runtime_test_ci_execution") is False, f"E_ITEM_BOUNDARY:{index}")
    fail(errors, expected_same == 39 and expected_changed == 28, "E_RELATION_TOTAL")
    fail(errors, expected_path_absent == 59, "E_CURRENT_ABSENT_TOTAL")

    aggregate = inv.get("aggregate", {})
    fail(errors, aggregate.get("same_blob_count") == 39 and aggregate.get("changed_blob_count") == 28, "E_AGGREGATE_BLOB")
    fail(errors, aggregate.get("not_in_any_live_holding_count") == 66 and aggregate.get("path_reference_only_match_count") == 1 and aggregate.get("exact_blob_or_sha_match_count") == 0, "E_AGGREGATE_HOLDING")
    fail(errors, aggregate.get("source_holding_proposed_count") == 67 and aggregate.get("semantic_disposition_not_started_count") == 67, "E_AGGREGATE_STATE")
    fail(errors, scope.get("archive_root_present_count") == 0, "E_ARCHIVE_ROOT_TOTAL")

    append = inv.get("append_assessment", {})
    expected_append_sha = sha(register_path.read_bytes() + (json.dumps(proposed, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8"))
    fail(errors, append.get("status") == "blocked_historical_capture_digest_invalidation", "E_APPEND_STATUS")
    fail(errors, append.get("current_register_sha256") == EXPECTED_REGISTER_SHA and append.get("historical_expected_register_sha256") == EXPECTED_REGISTER_SHA, "E_APPEND_CURRENT_SHA")
    fail(errors, append.get("proposed_append_register_sha256") == expected_append_sha and expected_append_sha != EXPECTED_REGISTER_SHA, "E_APPEND_DIGEST")
    fail(errors, append.get("historical_register_sha_references_in_HEAD") == git_register_refs(), "E_APPEND_REFS")
    fail(errors, len(append.get("known_capture_conflicts", [])) == 6 and len(append.get("required_migration_before_append", [])) == 3, "E_APPEND_BLOCKERS")
    return errors


if __name__ == "__main__":
    if not INV.is_file() or not ITEMS.is_file() or not PROPOSAL.is_file():
        print("FAIL outside-67 source_holding proposal: generated files missing")
        sys.exit(1)
    errors = validate(json.loads(INV.read_text(encoding="utf-8")), load_jsonl(ITEMS), json.loads(PROPOSAL.read_text(encoding="utf-8")))
    if errors:
        print("FAIL outside-67 source_holding proposal validator")
        print("\n".join(errors))
        sys.exit(1)
    print("PASS outside-67 source_holding proposal: 67 path pairs / 39 same / 28 changed / 13 holdings / append blocked")
