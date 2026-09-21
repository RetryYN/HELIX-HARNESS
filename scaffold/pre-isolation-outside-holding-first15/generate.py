#!/usr/bin/env python3
"""Generate a bounded, read-only first-15 outside-holding evidence candidate."""

from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
BASELINE = "6fabd12512a3659fff4a956692cdd61faeeb16ce"
PRE_ISOLATION = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCHIVE = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
CURRENT_HEAD = "3524e3dcc092500969046f2545b55e835c87512f"
REPORT_PATH = "scaffold/pre-isolation-outside-holding-67/report.json"
REPORT_SHA256 = "4544a56b8eb2e50f6720c019e73ad0575796a300b97db15bf246e5cbe442e795"
REGISTER_PATH = "docs/governance/management-provisional-requirement-register.jsonl"
REGISTER_SHA256 = "4e43fadaec48dcb0399e73eff148419671d4ac87fd4f8f68899dadf186ce5b8b"
HOLDING_PATH = "docs/governance/pre-isolation-revision-delta-source-holding.jsonl"
HOLDING_SHA256 = "d61a36db8e053d9006d11a09d1c60fd86413f32daa4a766aaeae2bc849130180"
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
SCHEMA = "rdp001-preisolation-outside-holding-first15/v1"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def git_blob(commit: str, path: str) -> bytes:
    return subprocess.run(["git", "show", f"{commit}:{path}"], cwd=ROOT, check=True, stdout=subprocess.PIPE).stdout


def git_blob_oid(commit: str, path: str) -> str | None:
    probe = subprocess.run(["git", "rev-parse", f"{commit}:{path}"], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True)
    return probe.stdout.strip() if probe.returncode == 0 else None


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
    holdings = []
    for row in live:
        source_path = ROOT / row["source_atom_set_ref"]
        records = load_jsonl(source_path)
        holdings.append(
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
    return holdings


def build() -> dict:
    report_path = ROOT / REPORT_PATH
    report = json.loads(report_path.read_text(encoding="utf-8"))
    register = load_jsonl(ROOT / REGISTER_PATH)
    holdings = live_holdings(register)
    holding_rows = {item["registration_id"]: load_jsonl(ROOT / item["source_atom_set_ref"]) for item in holdings}
    selected = [row for row in report["rows"] if row.get("product_scope") in PRODUCTS][:15]
    if len(selected) != 15:
        raise ValueError(f"expected 15 direct product paths, found {len(selected)}")

    paths = []
    for row in selected:
        path = row["path"]
        pre_blob = git_blob(PRE_ISOLATION, path)
        archive_blob = git_blob(ARCHIVE, path)
        path_relation = []
        for holding in holdings:
            rows = holding_rows[holding["registration_id"]]
            path_hits = []
            blob_hits = []
            sha_hits = []
            pre_oid = row["pre_isolation_blob_oid"]
            pre_sha = sha(pre_blob)
            for index, source_row in enumerate(rows, 1):
                path_hits.extend(f"{index}:{hit}" for hit in exact_hits(source_row, path))
                blob_hits.extend(f"{index}:{hit}" for hit in exact_hits(source_row, pre_oid))
                sha_hits.extend(f"{index}:{hit}" for hit in exact_hits(source_row, pre_sha))
            path_relation.append(
                {
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
            )
        current_oid = git_blob_oid(CURRENT_HEAD, path)
        paths.append(
            {
                "ordinal": len(paths) + 1,
                "path": path,
                "diff_status": row["diff_status"],
                "artifact_kind": row["artifact_kind"],
                "product_scope": row["product_scope"],
                "phase_scope": row["phase_scope"],
                "classification_state": row["classification_state"],
                "product_status": "unknown_path_based_candidate_only",
                "phase_status": "unknown_path_based_candidate_only",
                "implementation_status": "unknown_not_evidenced_by_path_or_blob_catalog",
                "implementation_evidence": row["implementation_evidence"],
                "pre_isolation": {
                    "commit": PRE_ISOLATION,
                    "blob_oid": row["pre_isolation_blob_oid"],
                    "sha256": sha(pre_blob),
                    "bytes": len(pre_blob),
                    "reported_blob_oid_matches_git": row["pre_isolation_blob_oid"] == git_blob_oid(PRE_ISOLATION, path),
                },
                "archive": {
                    "commit": ARCHIVE,
                    "blob_oid": row["archive_commit_blob_oid"],
                    "sha256": sha(archive_blob),
                    "bytes": len(archive_blob),
                    "relation_to_pre_isolation": row["archive_blob_relation"],
                    "reported_blob_oid_matches_git": row["archive_commit_blob_oid"] == git_blob_oid(ARCHIVE, path),
                },
                "archive_root_present": row["archive_root_present"],
                "current": {
                    "commit": CURRENT_HEAD,
                    "state": "present" if current_oid else "absent",
                    "blob_oid": current_oid,
                },
                "legacy_catalog_record_count": row["legacy_catalog_record_count"],
                "live_holding_relations": path_relation,
                "existing_holding_inclusion_relation": "not_in_any_of_13_live_holdings" if all(item["relation"] == "no_exact_path_or_blob_or_sha_match" for item in path_relation) else "unresolved_match_requires_review",
                "new_holding_needed": "unresolved_new_holding_needed" if all(item["relation"] == "no_exact_path_or_blob_or_sha_match" for item in path_relation) else "unresolved",
                "authority_effect": "none",
                "meaning_change_applied": False,
                "successor_requirement_ids": [],
                "human_decision_ref": None,
                "old_runtime_test_ci_execution": False,
            }
        )

    return {
        "schema": SCHEMA,
        "candidate_id": "RDP-001-PREISO-OUTSIDE-HOLDING-FIRST15-0035",
        "status": "findings_only",
        "authority_effect": "none",
        "meaning_change_applied": False,
        "successor_requirement_ids": [],
        "human_decision_ref": None,
        "equivalence_claim": None,
        "old_runtime_test_ci_execution": False,
        "scope": {
            "baseline_commit": BASELINE,
            "pre_isolation_commit": PRE_ISOLATION,
            "archive_commit": ARCHIVE,
            "current_head": CURRENT_HEAD,
            "selection_rule": "existing outside-67 report order; first 15 rows whose product_scope is one of the four approved products",
            "selected_count": len(paths),
            "approved_products": PRODUCTS,
            "holding_register_path": REGISTER_PATH,
            "holding_register_sha256": sha((ROOT / REGISTER_PATH).read_bytes()),
            "live_holding_count": len(holdings),
            "outside_report_path": REPORT_PATH,
            "outside_report_sha256": sha(report_path.read_bytes()),
            "read_only": True,
        },
        "live_holdings": holdings,
        "paths": paths,
        "aggregate": {
            "product_scope_counts": dict(sorted(Counter(item["product_scope"] for item in paths).items())),
            "phase_scope_counts": dict(sorted(Counter(item["phase_scope"] for item in paths).items())),
            "archive_blob_relation_counts": dict(sorted(Counter(item["archive"]["relation_to_pre_isolation"] for item in paths).items())),
            "current_state_counts": dict(sorted(Counter(item["current"]["state"] for item in paths).items())),
            "not_in_any_live_holding_count": sum(item["existing_holding_inclusion_relation"] == "not_in_any_of_13_live_holdings" for item in paths),
            "new_holding_needed_unresolved_count": sum(item["new_holding_needed"] == "unresolved_new_holding_needed" for item in paths),
            "implementation_unknown_count": sum(item["implementation_status"].startswith("unknown") for item in paths),
        },
        "findings": [
            "対象15件はoutside-67 reportのpath順で、四製品ディレクトリ配下の先頭15件を選んだ。これはpathベースの候補集合であり、要求atom数ではない。",
            "13 live source holdingsは管理仮登録のsupersedes終端から再計算した。対象15件は13 holdingすべてでpath／pre-isolation blob／pre-isolation SHAの完全一致が0件だった。",
            "pre-isolationとarchive commitのblob OID、SHA、bytes、同一／相違を各pathで再計算した。archive rootへの保存、現行mainへの保存、旧asset catalog登録は別状態として保持した。",
            "path prefixだけからproduct／phase候補を記録した。implementation、authority、要求採否、successor、consumer closure、意味同値はunknownまたは未解決である。",
            "13 live holdingsへの未包含は新holdingの必要性候補に留まり、登録や自動採用を生成しない。",
        ],
        "prohibited_inference": [
            "path／directory prefixを正式product owner、requirement identity、authorityへ昇格しない",
            "L1／L2／L11 pathの存在を採否、完了、実装、受入の証拠へ変換しない",
            "13 live holdingsへの不在を要求意味の不在や廃止へ解釈しない",
            "pre-isolation／archive blobの同一性を意味同値、current authority、採用へ昇格しない",
            "旧archive runtime／test／CI／hookを実行せず、oracle、fallback、implementationへ使わない",
            "新holding必要性候補からsource_holding、requirement_candidate、successorを自動生成しない",
        ],
        "verification_scope": {
            "evidence_kind": "scaffold",
            "static_only": True,
            "checks": ["report selection", "13 live holding closure", "pre-isolation/archive blob OID", "SHA/bytes", "current HEAD state", "unknown boundary"],
        },
    }


if __name__ == "__main__":
    (HERE / "inventory.json").write_text(json.dumps(build(), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
