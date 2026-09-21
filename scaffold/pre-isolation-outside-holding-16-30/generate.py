#!/usr/bin/env python3
"""Generate static evidence for outside-67 source items 16 through 30."""

from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
REPORT_PATH = "scaffold/pre-isolation-outside-holding-67/report.json"
REPORT_SHA256 = "4544a56b8eb2e50f6720c019e73ad0575796a300b97db15bf246e5cbe442e795"
SOURCE_SET_PATH = "docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl"
SOURCE_SET_SHA256 = "d703c9bc47f95143f6b010eebf7fead4e14402c1be26ef716b2e16f0bd2cec54"
PRE_ISOLATION = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCHIVE = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
CURRENT_CAPTURE = "3df81ad27157c471e004083783f37a5860eaa2ee"
REGISTER_PATH = "docs/governance/management-provisional-requirement-register.jsonl"
REGISTER_SHA256 = "4e43fadaec48dcb0399e73eff148419671d4ac87fd4f8f68899dadf186ce5b8b"
HOLDING_PATH = "docs/governance/pre-isolation-revision-delta-source-holding.jsonl"
HOLDING_SHA256 = "d61a36db8e053d9006d11a09d1c60fd86413f32daa4a766aaeae2bc849130180"
SCHEMA = "rdp001-preisolation-outside-holding-16-30/v1"
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
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


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def git_blob(commit: str, path: str) -> bytes:
    return subprocess.run(["git", "show", f"{commit}:{path}"], cwd=ROOT, check=True, stdout=subprocess.PIPE).stdout


def git_oid(commit: str, path: str) -> str | None:
    result = subprocess.run(
        ["git", "rev-parse", f"{commit}:{path}"],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True,
    )
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
    live = [row for row in register if row.get("registration_id") not in superseded]
    result = []
    for row in live:
        source_path = ROOT / row["source_atom_set_ref"]
        records = load_jsonl(source_path)
        result.append(
            {
                "registration_id": row["registration_id"],
                "source_atom_set_ref": row["source_atom_set_ref"],
                "source_atom_set_sha256": sha(source_path.read_bytes()),
                "source_atom_set_record_count": len(records),
                "registration_kind": row["registration_kind"],
                "product_target": row["product_target"],
                "authority_effect": row["authority_effect"],
            }
        )
    return result


def build_relation(path: str, pre_oid: str, pre_sha: str, holding: dict, records: list[dict]) -> dict:
    path_hits: list[str] = []
    blob_hits: list[str] = []
    sha_hits: list[str] = []
    for record_index, source_row in enumerate(records, 1):
        path_hits.extend(f"{record_index}:{hit}" for hit in exact_hits(source_row, path))
        blob_hits.extend(f"{record_index}:{hit}" for hit in exact_hits(source_row, pre_oid))
        sha_hits.extend(f"{record_index}:{hit}" for hit in exact_hits(source_row, pre_sha))
    relation = "no_exact_path_or_blob_or_sha_match" if not (path_hits or blob_hits or sha_hits) else "match_requires_review"
    return {
        "registration_id": holding["registration_id"],
        "source_atom_set_ref": holding["source_atom_set_ref"],
        "path_match_count": len(path_hits),
        "pre_isolation_blob_match_count": len(blob_hits),
        "pre_isolation_sha256_match_count": len(sha_hits),
        "path_match_evidence": path_hits,
        "blob_match_evidence": blob_hits,
        "sha256_match_evidence": sha_hits,
        "relation": relation,
    }


def build_row(ordinal: int, report_row: dict, holdings: list[dict], holding_rows: dict[str, list[dict]], source_row: dict) -> dict:
    path = report_row["path"]
    pre_blob = git_blob(PRE_ISOLATION, path)
    archive_blob = git_blob(ARCHIVE, path)
    pre_oid = git_oid(PRE_ISOLATION, path)
    archive_oid = git_oid(ARCHIVE, path)
    if pre_oid is None or archive_oid is None:
        raise ValueError(f"missing Git object for {path}")
    pre_sha = sha(pre_blob)
    relations = [build_relation(path, pre_oid, pre_sha, holding, holding_rows[holding["registration_id"]]) for holding in holdings]
    current_oid = git_oid(CURRENT_CAPTURE, path)
    report_product = report_row["product_scope"]
    report_phase = report_row["phase_scope"]
    if source_row["source_path"] != path:
        raise ValueError(f"source set path mismatch for {path}")
    return {
        "global_ordinal": ordinal,
        "source_item_id": f"OUTSIDE67-PATH-{ordinal:03d}",
        "source_unit": "path_revision_pair",
        "source_path": path,
        "artifact_kind": report_row["artifact_kind"],
        "diff_status": report_row["diff_status"],
        "candidate_product": report_product,
        "candidate_product_basis": "outside-67 report path classification only",
        "product_status": "unknown_path_based_candidate_only",
        "candidate_phase": report_phase,
        "candidate_phase_basis": "outside-67 report path classification only",
        "phase_status": "unknown_path_based_candidate_only",
        "implementation_status": "unknown_not_evidenced_by_path_or_blob_catalog",
        "implementation_evidence": report_row["implementation_evidence"],
        "degradation_assessment": "unknown_not_semantically_assessed",
        "degradation_evidence": "archive_blob_relation_only_no_semantic_delta_review",
        "pre_isolation": {
            "commit": PRE_ISOLATION,
            "blob_oid": pre_oid,
            "sha256": pre_sha,
            "bytes": len(pre_blob),
            "reported_blob_oid": report_row["pre_isolation_blob_oid"],
            "reported_blob_oid_matches_git": pre_oid == report_row["pre_isolation_blob_oid"],
        },
        "archive": {
            "commit": ARCHIVE,
            "blob_oid": archive_oid,
            "sha256": sha(archive_blob),
            "bytes": len(archive_blob),
            "reported_blob_oid": report_row["archive_commit_blob_oid"],
            "reported_blob_oid_matches_git": archive_oid == report_row["archive_commit_blob_oid"],
            "relation_to_pre_isolation": "same" if archive_blob == pre_blob else "different",
        },
        "archive_root_present": report_row["archive_root_present"],
        "legacy_catalog_record_count": report_row["legacy_catalog_record_count"],
        "current_capture": {
            "commit": CURRENT_CAPTURE,
            "state": "present" if current_oid else "absent",
            "blob_oid": current_oid,
        },
        "live_holding_relations": relations,
        "existing_holding_inclusion_relation": "not_in_any_of_13_live_holdings" if all(r["relation"] == "no_exact_path_or_blob_or_sha_match" for r in relations) else "unresolved_match_requires_review",
        "new_holding_needed": "unresolved_new_holding_needed" if all(r["relation"] == "no_exact_path_or_blob_or_sha_match" for r in relations) else "unresolved",
        "source_holding_status": "proposed_preserved_unassigned",
        "semantic_disposition": "not_started",
        "authority_effect": "none",
        "meaning_change_applied": False,
        "successor_requirement_ids": [],
        "human_decision_ref": None,
        "old_runtime_test_ci_execution": False,
    }


def build() -> dict:
    report_path = ROOT / REPORT_PATH
    report_bytes = report_path.read_bytes()
    report = json.loads(report_bytes)
    source_path = ROOT / SOURCE_SET_PATH
    source_rows = load_jsonl(source_path)
    register_path = ROOT / REGISTER_PATH
    register = load_jsonl(register_path)
    holdings = live_holdings(register)
    if {row["registration_id"] for row in holdings} != LIVE_HOLDING_IDS:
        raise ValueError("unexpected live holding roster")
    holding_rows = {item["registration_id"]: load_jsonl(ROOT / item["source_atom_set_ref"]) for item in holdings}
    selected = report["rows"][15:30]
    selected_source = source_rows[15:30]
    if len(selected) != 15 or len(selected_source) != 15:
        raise ValueError("expected outside-67 rows 16 through 30")
    rows = [build_row(i + 16, row, holdings, holding_rows, selected_source[i]) for i, row in enumerate(selected)]
    return {
        "schema": SCHEMA,
        "candidate_id": "RDP-001-PREISO-OUTSIDE-HOLDING-16-30-0045",
        "status": "findings_only",
        "authority_effect": "none",
        "meaning_change_applied": False,
        "successor_requirement_ids": [],
        "human_decision_ref": None,
        "formal_register_append": False,
        "old_runtime_test_ci_execution": False,
        "scope": {
            "outside_report_path": REPORT_PATH,
            "outside_report_sha256": sha(report_bytes),
            "source_set_path": SOURCE_SET_PATH,
            "source_set_sha256": sha(source_path.read_bytes()),
            "pre_isolation_commit": PRE_ISOLATION,
            "archive_commit": ARCHIVE,
            "current_capture_commit": CURRENT_CAPTURE,
            "selection_rule": "outside-67 report order; global rows 16 through 30 inclusive",
            "selected_count": len(rows),
            "source_unit": "path_revision_pair",
            "requirement_atoms": False,
            "live_holding_count": len(holdings),
            "management_register_path": REGISTER_PATH,
            "management_register_sha256": sha(register_path.read_bytes()),
            "pre_isolation_holding_path": HOLDING_PATH,
            "pre_isolation_holding_sha256": sha((ROOT / HOLDING_PATH).read_bytes()),
            "read_only": True,
        },
        "live_holdings": holdings,
        "rows": rows,
        "aggregate": {
            "candidate_product_counts": dict(sorted(Counter(row["candidate_product"] for row in rows).items())),
            "candidate_phase_counts": dict(sorted(Counter(row["candidate_phase"] for row in rows).items())),
            "archive_blob_relation_counts": dict(sorted(Counter(row["archive"]["relation_to_pre_isolation"] for row in rows).items())),
            "current_state_counts": dict(sorted(Counter(row["current_capture"]["state"] for row in rows).items())),
            "not_in_any_live_holding_count": sum(row["existing_holding_inclusion_relation"] == "not_in_any_of_13_live_holdings" for row in rows),
            "new_holding_needed_unresolved_count": sum(row["new_holding_needed"] == "unresolved_new_holding_needed" for row in rows),
            "implementation_unknown_count": sum(row["implementation_status"].startswith("unknown") for row in rows),
            "degradation_unknown_count": sum(row["degradation_assessment"].startswith("unknown") for row in rows),
            "legacy_catalog_zero_count": sum(row["legacy_catalog_record_count"] == 0 for row in rows),
        },
        "findings": [
            "outside-67 report orderの16–30件を、first15監査と重ならない15件として固定した。いずれもgovernance/crosswalk配下のpath-based candidateで、candidate productはshared-cross-product、candidate phaseはupstream-governance-or-crosswalkに留める。",
            "13 live source holdingsはmanagement registerのsupersedes終端から再計算した。15件すべてでpath／pre-isolation blob／pre-isolation SHA-256の完全一致が0件だった。",
            "pre-isolation commitとarchive commitのblob OID、SHA-256、bytes、same／differentをGit objectから再計算した。8件がsame、7件がdifferentで、archive rootは全件不在、capture時点のcurrent pathも全件不在だった。",
            "legacy asset catalog recordは全件0で、implementationはpath／blob catalogからunknownのままである。",
            "archive blobのsame／differentだけでは意味的なdegradationを判定できないため、degradation assessmentは全件unknown_not_semantically_assessedとした。",
            "13 holdingへの不在は保存先検討の未解決候補であり、source_holding、requirement_candidate、successor、product owner、phase authorityを自動生成しない。",
        ],
        "proposed_row_schema": {
            "identity": ["global_ordinal", "source_item_id", "source_unit", "source_path", "artifact_kind", "diff_status"],
            "candidate_classification": ["candidate_product", "candidate_product_basis", "product_status", "candidate_phase", "candidate_phase_basis", "phase_status", "implementation_status", "implementation_evidence", "degradation_assessment", "degradation_evidence"],
            "physical_revision": ["pre_isolation", "archive", "archive_root_present", "current_capture", "legacy_catalog_record_count"],
            "holding_relation": ["live_holding_relations", "existing_holding_inclusion_relation", "new_holding_needed"],
            "boundary": ["source_holding_status", "semantic_disposition", "authority_effect", "meaning_change_applied", "successor_requirement_ids", "human_decision_ref", "old_runtime_test_ci_execution"],
        },
        "prohibited_inference": [
            "path／directory prefixを正式product owner、requirement identity、authorityへ昇格しない",
            "governance／crosswalk pathの存在を要求採否、完了、実装、受入の証拠へ変換しない",
            "13 live holdingsへの不在を要求意味の不在、廃止、重複解消へ解釈しない",
            "pre-isolation／archive blobの同一性を意味同値、current authority、採用へ昇格しない",
            "旧archive runtime／test／CI／hookを実行せず、oracle、fallback、implementationへ使わない",
            "new holding必要性候補からsource_holding、requirement_candidate、successorを自動生成しない",
        ],
        "verification_scope": {
            "evidence_kind": "scaffold",
            "static_only": True,
            "checks": ["selection rows 16-30", "13 live holding closure", "pre-isolation/archive blob OID", "SHA/bytes", "current capture state", "unknown boundary"],
        },
    }


if __name__ == "__main__":
    (HERE / "inventory.json").write_text(json.dumps(build(), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
