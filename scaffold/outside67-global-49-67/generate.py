#!/usr/bin/env python3
"""outside67 global 49--67 の静的分類を再生成する。"""

from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
REPORT = ROOT / "scaffold/pre-isolation-outside-holding-67/report.json"
REGISTER = ROOT / "docs/governance/management-provisional-requirement-register-pre-append-3df81ad.jsonl"
PRE_ISOLATION = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCHIVE = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
HISTORICAL_CAPTURE = "3df81ad27157c471e004083783f37a5860eaa2ee"
SOURCE_REPORT_SHA = "4544a56b8eb2e50f6720c019e73ad0575796a300b97db15bf246e5cbe442e795"
REGISTER_SHA = "4e43fadaec48dcb0399e73eff148419671d4ac87fd4f8f68899dadf186ce5b8b"
ORDINAL_START = 49
ORDINAL_END = 67
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def git_blob(commit: str, path: str) -> bytes:
    return subprocess.run(["git", "show", f"{commit}:{path}"], cwd=ROOT, check=True, stdout=subprocess.PIPE).stdout


def git_oid(commit: str, path: str) -> str | None:
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
            "source_atom_set_sha256": digest(source_path.read_bytes()),
            "source_atom_set_record_count": len(source_records),
            "registration_kind": row["registration_kind"],
            "product_target": row["product_target"],
            "authority_effect": row["authority_effect"],
        })
    return holdings, records


def relation_for(path: str, pre_oid: str, pre_sha: str, holdings: list[dict], records: dict[str, list[dict]]) -> list[dict]:
    relations: list[dict] = []
    for holding in holdings:
        path_hits: list[str] = []
        blob_hits: list[str] = []
        sha_hits: list[str] = []
        for record_index, record in enumerate(records[holding["registration_id"]], 1):
            path_hits.extend(f"{record_index}:{hit}" for hit in exact_hits(record, path))
            blob_hits.extend(f"{record_index}:{hit}" for hit in exact_hits(record, pre_oid))
            sha_hits.extend(f"{record_index}:{hit}" for hit in exact_hits(record, pre_sha))
        if path_hits and not blob_hits and not sha_hits:
            relation = "path_reference_only_match_requires_review"
        elif path_hits or blob_hits or sha_hits:
            relation = "match_requires_review"
        else:
            relation = "no_exact_path_or_blob_or_sha_match"
        relations.append({
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
    return relations


def build_item(ordinal: int, row: dict, holdings: list[dict], records: dict[str, list[dict]]) -> dict:
    path = row["path"]
    pre_bytes = git_blob(PRE_ISOLATION, path)
    archive_bytes = git_blob(ARCHIVE, path)
    pre_oid = subprocess.run(["git", "rev-parse", f"{PRE_ISOLATION}:{path}"], cwd=ROOT, check=True, stdout=subprocess.PIPE, text=True).stdout.strip()
    archive_oid = subprocess.run(["git", "rev-parse", f"{ARCHIVE}:{path}"], cwd=ROOT, check=True, stdout=subprocess.PIPE, text=True).stdout.strip()
    pre_sha = digest(pre_bytes)
    archive_sha = digest(archive_bytes)
    current_oid = git_oid(HISTORICAL_CAPTURE, path)
    relations = relation_for(path, pre_oid, pre_sha, holdings, records)
    has_path_only = any(r["relation"] == "path_reference_only_match_requires_review" for r in relations)
    inclusion = "path_reference_only_match_requires_review" if has_path_only else "not_in_any_of_13_live_holdings"
    return {
        "source_item_id": f"OUTSIDE67-GLOBAL-{ordinal:03d}",
        "source_ordinal": ordinal,
        "source_unit": "path_revision_pair",
        "source_path": path,
        "artifact_kind": row["artifact_kind"],
        "diff_status": row["diff_status"],
        "product_scope": row["product_scope"],
        "phase_scope": row["phase_scope"],
        "path_classification": {
            "product_candidate": row["product_scope"],
            "phase_candidate": row["phase_scope"],
            "classification_state": "path_based_candidate_only",
            "product_status": "unknown_path_based_candidate_only",
            "phase_status": "unknown_path_based_candidate_only",
        },
        "implementation_assessment": {
            "status": "unknown",
            "evidence": "none_path_only",
            "reason": "path／blob catalogは実装の実在・実行・consumerを示さない",
        },
        "degradation_assessment": {
            "status": "unknown",
            "evidence": "none_path_only",
            "reason": "path／blob catalogはfailure、degraded、unimplementedを示さない",
        },
        "implementation_status": "unknown",
        "degradation_status": "unknown",
        "semantic_inclusion": "unknown",
        "semantic_inclusion_status": "unknown",
        "semantic_inclusion_reason": "path_revision_pairは要求atomではなく、path／blob／SHA一致だけではsemantic inclusionを判定できない",
        "pre_isolation": {
            "commit": PRE_ISOLATION,
            "blob_oid": pre_oid,
            "sha256": pre_sha,
            "bytes": len(pre_bytes),
            "reported_blob_oid": row["pre_isolation_blob_oid"],
            "reported_blob_oid_matches_git": row["pre_isolation_blob_oid"] == pre_oid,
        },
        "archive": {
            "commit": ARCHIVE,
            "blob_oid": archive_oid,
            "sha256": archive_sha,
            "bytes": len(archive_bytes),
            "reported_blob_oid": row["archive_commit_blob_oid"],
            "reported_blob_oid_matches_git": row["archive_commit_blob_oid"] == archive_oid,
            "relation_to_pre_isolation": "same" if pre_oid == archive_oid else "different",
        },
        "archive_root_present": row["archive_root_present"],
        "legacy_catalog_record_count": row["legacy_catalog_record_count"],
        "current_capture": {
            "commit": HISTORICAL_CAPTURE,
            "state": "present" if current_oid else "absent",
            "blob_oid": current_oid,
        },
        "existing_holding_inclusion_relation": inclusion,
        "live_holding_relations": relations,
        "new_holding_needed": "unresolved_new_holding_needed",
        "source_holding_status": "proposed_preserved_unassigned",
        "semantic_disposition": "not_started",
        "authority_effect": "none",
        "meaning_change_applied": False,
        "successor_requirement_ids": [],
        "human_decision_ref": None,
        "old_runtime_test_ci_execution": False,
    }


def canonical_lines(items: list[dict]) -> bytes:
    return "".join(json.dumps(item, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for item in items).encode("utf-8")


def build() -> tuple[dict, list[dict]]:
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    report_rows = report["rows"][ORDINAL_START - 1:ORDINAL_END]
    holdings, records = holding_snapshot()
    items = [build_item(ordinal, row, holdings, records) for ordinal, row in zip(range(ORDINAL_START, ORDINAL_END + 1), report_rows)]
    source_bytes = canonical_lines(items)
    products = Counter(item["path_classification"]["product_candidate"] for item in items)
    phases = Counter(item["path_classification"]["phase_candidate"] for item in items)
    relations = [item["existing_holding_inclusion_relation"] for item in items]
    same = sum(item["archive"]["relation_to_pre_isolation"] == "same" for item in items)
    changed = sum(item["archive"]["relation_to_pre_isolation"] == "different" for item in items)
    inventory = {
        "schema": "rdp001-outside67-global-classification-49-67/v1",
        "candidate_id": "RDP-001-OUTSIDE67-GLOBAL-49-67-0044",
        "status": "findings_only",
        "authority_effect": "none",
        "meaning_change_applied": False,
        "successor_requirement_ids": [],
        "human_decision_ref": None,
        "formal_register_append": False,
        "old_runtime_test_ci_execution": False,
        "scope": {
            "source_report_path": "scaffold/pre-isolation-outside-holding-67/report.json",
            "source_report_sha256": SOURCE_REPORT_SHA,
            "pre_isolation_commit": PRE_ISOLATION,
            "archive_commit": ARCHIVE,
            "historical_capture_commit": HISTORICAL_CAPTURE,
            "selected_ordinal_start": ORDINAL_START,
            "selected_ordinal_end": ORDINAL_END,
            "selected_count": len(items),
            "source_unit": "path_revision_pair",
            "requirement_atoms": False,
            "archive_root_present_count": sum(item["archive_root_present"] for item in items),
            "same_blob_count": same,
            "changed_blob_count": changed,
            "live_holding_count": len(holdings),
            "management_register_path": "docs/governance/management-provisional-requirement-register-pre-append-3df81ad.jsonl",
            "management_register_sha256": REGISTER_SHA,
            "base_change_condition": "main/baseが親d272以後へ進んでもhistorical 13 holding relationは固定SHAで保持する。現行mainへ移す場合はread-afterと再baselineを先に行い、静かに追随しない。",
            "read_only": True,
        },
        "classification_basis": {
            "product": "outside-67 reportのpath prefix／既存path分類を候補として保持",
            "phase": "outside-67 reportのphase_scopeを候補として保持",
            "implementation": "path／blob catalogのみ。実装・実行・consumer evidenceなし",
            "degradation": "path／blob catalogのみ。failure／degraded／unimplemented evidenceなし",
            "semantic_inclusion": "path_revision_pairから要求atomやsemantic inclusionを生成しない",
        },
        "live_holdings": holdings,
        "source_items": {
            "path": "scaffold/outside67-global-49-67/source-items.jsonl",
            "record_count": len(items),
            "sha256": digest(source_bytes),
        },
        "aggregate": {
            "product_candidate_counts": dict(sorted(products.items())),
            "phase_candidate_counts": dict(sorted(phases.items())),
            "same_blob_count": same,
            "changed_blob_count": changed,
            "not_in_any_live_holding_count": relations.count("not_in_any_of_13_live_holdings"),
            "path_reference_only_match_count": relations.count("path_reference_only_match_requires_review"),
            "exact_blob_or_sha_match_count": sum(any(r["pre_isolation_blob_match_count"] or r["pre_isolation_sha256_match_count"] for r in item["live_holding_relations"]) for item in items),
            "implementation_unknown_count": len(items),
            "degradation_unknown_count": len(items),
            "semantic_inclusion_unknown_count": len(items),
            "source_holding_unassigned_count": len(items),
        },
        "findings": [
            "PR #1978 source setのoutside-67 reportからglobal ordinal 49–67の19 path_revision_pairを固定した。",
            "四製品候補とphase候補はpath由来の候補に留め、product／phase authorityへ昇格していない。",
            "全19件でimplementation、degradation、semantic inclusionをunknownとして保持した。",
            "pre-isolation／archiveのblob OID、SHA-256、bytes、same／differentをGit objectから再照合した。",
            "歴史的13 live holdingをsupersedes終端から再計算し、path／blob／SHAのexact relationを全件保持した。",
            "ordinal 58はLEGACY-RULE holdingへのpath文字列参照のみで、blob／SHA包含ではない。",
        ],
        "prohibited_inference": [
            "path_revision_pairをrequirement atom、requirement identity、successorへ変換しない",
            "path由来product／phase候補をproduct owner／phase authorityへ昇格しない",
            "unknown implementation／degradationをimplemented／degraded／unimplementedへ補完しない",
            "path／blob／SHAの不一致を意味の不在、不採用、廃止へ解釈しない",
            "旧archive runtime／test／CI／hook／adapterを実行せず、oracleやfallbackに使わない",
            "正式registerへのappend、採否、承認、L3/L10/L11、releaseを生成しない",
        ],
        "verification_scope": {
            "evidence_kind": "scaffold",
            "static_only": True,
            "checks": [
                "19 path ordinalとsource report SHA",
                "pre-isolation／archive Git blob OID・SHA・bytes・same/different",
                "歴史的13 live holdingのpath／blob／SHA exact scan",
                "product／phase candidate countとunknown implementation/degradation/semantic inclusion",
                "authority・append・旧実行の境界",
            ],
        },
    }
    return inventory, items


def main() -> None:
    inventory, items = build()
    (HERE / "source-items.jsonl").write_bytes(canonical_lines(items))
    (HERE / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"selected_count": len(items), "source_items_sha256": inventory["source_items"]["sha256"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
