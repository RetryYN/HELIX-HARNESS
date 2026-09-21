#!/usr/bin/env python3
"""Generate a path-level source_holding proposal for all 67 outside paths."""

from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
REPORT_PATH = "scaffold/pre-isolation-outside-holding-67/report.json"
REPORT_SHA = "4544a56b8eb2e50f6720c019e73ad0575796a300b97db15bf246e5cbe442e795"
PRE_ISOLATION = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCHIVE = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
CURRENT_HEAD = "3df81ad27157c471e004083783f37a5860eaa2ee"
REGISTER_PATH = "docs/governance/management-provisional-requirement-register.jsonl"
REGISTER_SHA = "4e43fadaec48dcb0399e73eff148419671d4ac87fd4f8f68899dadf186ce5b8b"
DISPOSITION_PATH = "docs/governance/requirement-disposition-review-program.md"
DISPOSITION_SHA = "6eb28f5fef9b5551c84231ceb8fefca949f6cfd5449224b5ab644d61f7136308"
REGISTRATION_PATH = "docs/governance/management-provisional-requirement-registration.md"
HOLDING_PATH = "docs/governance/pre-isolation-revision-delta-source-holding.jsonl"
SCHEMA = "rdp001-preisolation-outside-holding-67-source-holding-proposal/v1"
PROPOSAL_ID = "MPR-SH-OUTSIDE67-001"
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def git_blob(commit: str, path: str) -> bytes:
    return subprocess.run(["git", "show", f"{commit}:{path}"], cwd=ROOT, check=True, stdout=subprocess.PIPE).stdout


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


def live_holdings(register: list[dict]) -> list[dict]:
    superseded = {row.get("supersedes_registration_id") for row in register if row.get("supersedes_registration_id")}
    live = [row for row in register if row.get("registration_id") not in superseded]
    result = []
    for row in live:
        source_path = ROOT / row["source_atom_set_ref"]
        records = load_jsonl(source_path)
        result.append({
            "registration_id": row["registration_id"],
            "source_atom_set_ref": row["source_atom_set_ref"],
            "source_atom_set_sha256": sha(source_path.read_bytes()),
            "source_atom_set_record_count": len(records),
            "registration_kind": row["registration_kind"],
            "product_target": row["product_target"],
            "authority_effect": row["authority_effect"],
        })
    return result


def git_references(value: str) -> list[str]:
    result = subprocess.run(["git", "grep", "-l", value, CURRENT_HEAD, "--", "scaffold", "docs"], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True)
    refs = []
    for line in result.stdout.splitlines():
        refs.append(line.split(":", 1)[-1])
    return sorted(set(refs))


def build_item(index: int, row: dict, holdings: list[dict], holding_rows: dict[str, list[dict]]) -> dict:
    path = row["path"]
    pre_blob = git_blob(PRE_ISOLATION, path)
    archive_blob = git_blob(ARCHIVE, path)
    pre_oid = git_oid(PRE_ISOLATION, path)
    archive_oid = git_oid(ARCHIVE, path)
    relations = []
    pre_sha = sha(pre_blob)
    for holding in holdings:
        path_hits: list[str] = []
        blob_hits: list[str] = []
        sha_hits: list[str] = []
        for record_index, source_row in enumerate(holding_rows[holding["registration_id"]], 1):
            path_hits.extend(f"{record_index}:{hit}" for hit in exact_hits(source_row, path))
            blob_hits.extend(f"{record_index}:{hit}" for hit in exact_hits(source_row, pre_oid or ""))
            sha_hits.extend(f"{record_index}:{hit}" for hit in exact_hits(source_row, pre_sha))
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
    current_oid = git_oid(CURRENT_HEAD, path)
    all_unmatched = all(item["relation"] == "no_exact_path_or_blob_or_sha_match" for item in relations)
    exact_blob_unmatched = all(item["pre_isolation_blob_match_count"] == 0 and item["pre_isolation_sha256_match_count"] == 0 for item in relations)
    return {
        "source_item_id": f"OUTSIDE67-PATH-{index:03d}",
        "source_unit": "path_revision_pair",
        "source_path": path,
        "artifact_kind": row["artifact_kind"],
        "diff_status": row["diff_status"],
        "reported_path_scope": {
            "product_scope": row.get("product_scope"),
            "phase_scope": row.get("phase_scope"),
            "classification_state": row.get("classification_state"),
            "product_status": "unknown_path_based_candidate_only",
            "phase_status": "unknown_path_based_candidate_only",
            "implementation_status": "unknown_not_evidenced_by_path_or_blob_catalog",
        },
        "pre_isolation": {
            "commit": PRE_ISOLATION,
            "blob_oid": pre_oid,
            "sha256": pre_sha,
            "bytes": len(pre_blob),
            "reported_blob_oid": row["pre_isolation_blob_oid"],
            "reported_blob_oid_matches_git": pre_oid == row["pre_isolation_blob_oid"],
        },
        "archive": {
            "commit": ARCHIVE,
            "blob_oid": archive_oid,
            "sha256": sha(archive_blob),
            "bytes": len(archive_blob),
            "reported_blob_oid": row["archive_commit_blob_oid"],
            "reported_blob_oid_matches_git": archive_oid == row["archive_commit_blob_oid"],
            "relation_to_pre_isolation": "same" if archive_blob == pre_blob else "different",
        },
        "archive_root_present": row["archive_root_present"],
        "legacy_catalog_record_count": row["legacy_catalog_record_count"],
        "current_capture": {
            "commit": CURRENT_HEAD,
            "state": "present" if current_oid else "absent",
            "blob_oid": current_oid,
        },
        "existing_holding_inclusion_relation": "not_in_any_of_13_live_holdings" if all_unmatched else "path_reference_only_match_requires_review" if exact_blob_unmatched else "match_requires_review",
        "live_holding_relations": relations,
        "new_holding_needed": "unresolved_new_holding_needed" if all_unmatched else "unresolved_new_holding_needed_or_existing_relation_review" if exact_blob_unmatched else "unresolved_match_requires_review",
        "source_holding_status": "proposed_preserved_unassigned",
        "semantic_disposition": "not_started",
        "authority_effect": "none",
        "meaning_change_applied": False,
        "successor_requirement_ids": [],
        "human_decision_ref": None,
        "old_runtime_test_ci_execution": False,
    }


def source_lines(items: list[dict]) -> bytes:
    return "".join(json.dumps(item, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for item in items).encode("utf-8")


def proposed_record(source_digest: str, count: int) -> dict:
    return {
        "registration_id": PROPOSAL_ID,
        "supersedes_registration_id": None,
        "registration_kind": "source_holding",
        "requirement_identity": None,
        "requirement_kind": None,
        "product_target": "unassigned_cross_product",
        "candidate_source_path": None,
        "candidate_semantic_digest": None,
        "parent_concept_revision": None,
        "parent_planning_revision": None,
        "source_atom_set_ref": "scaffold/pre-isolation-outside-holding-67-proposal/source-items.jsonl",
        "source_atom_set_digest": f"sha256:{source_digest}",
        "source_atom_count": count,
        "source_collection_scope": "outside-67 reportの67 path_revision_pair item。各itemはpre-isolation commitとarchive commitのpath blob OID／SHA／bytesを持つ。要求atom、semantic equivalence、product owner、phase authority、implementationを表さない。",
        "coverage_receipt_ref": "scaffold/pre-isolation-outside-holding-67-proposal/inventory.json",
        "coverage_result": "source_preserved_unassigned",
        "carried_atom_refs": [],
        "preserved_pending_registration_refs": [],
        "human_decision_disposition_refs": [],
        "unaccounted_atom_refs": [],
        "management_state": "registered_source_holding",
        "authority_effect": "none",
        "registered_by": "pending_human_admission",
        "registered_at": "pending_append",
        "evidence_refs": [
            "scaffold/pre-isolation-outside-holding-67/report.json",
            "docs/governance/audits/source-rebaseline/pre-isolation-revision-delta-audit-2026-09-16.md",
            "docs/governance/requirement-disposition-review-program.md#入力母集団",
            "docs/governance/management-provisional-requirement-registration.md#bootstrap-source-holding",
        ],
    }


def build() -> dict:
    report_path = ROOT / REPORT_PATH
    report = json.loads(report_path.read_text(encoding="utf-8"))
    register_path = ROOT / REGISTER_PATH
    register = load_jsonl(register_path)
    holdings = live_holdings(register)
    holding_rows = {item["registration_id"]: load_jsonl(ROOT / item["source_atom_set_ref"]) for item in holdings}
    items = [build_item(i, row, holdings, holding_rows) for i, row in enumerate(report["rows"], 1)]
    if len(items) != 67:
        raise ValueError(f"expected 67 rows, found {len(items)}")
    source_digest = sha(source_lines(items))
    proposed = proposed_record(source_digest, len(items))
    historical_sha_refs = git_references(REGISTER_SHA)
    return {
        "schema": SCHEMA,
        "candidate_id": "RDP-001-PREISO-OUTSIDE-HOLDING-67-PROPOSAL-0038",
        "status": "findings_only",
        "authority_effect": "none",
        "meaning_change_applied": False,
        "successor_requirement_ids": [],
        "human_decision_ref": None,
        "formal_register_append": False,
        "old_runtime_test_ci_execution": False,
        "scope": {
            "outside_report_path": REPORT_PATH,
            "outside_report_sha256": sha(report_path.read_bytes()),
            "pre_isolation_commit": PRE_ISOLATION,
            "archive_commit": ARCHIVE,
            "current_capture_commit": CURRENT_HEAD,
            "selected_count": len(items),
            "source_unit": "path_revision_pair",
            "requirement_atoms": False,
            "archive_root_present_count": sum(item["archive_root_present"] for item in items),
            "same_blob_count": sum(item["archive"]["relation_to_pre_isolation"] == "same" for item in items),
            "changed_blob_count": sum(item["archive"]["relation_to_pre_isolation"] == "different" for item in items),
            "live_holding_count": len(holdings),
            "management_register_path": REGISTER_PATH,
            "management_register_sha256": sha(register_path.read_bytes()),
            "requirement_disposition_program_path": DISPOSITION_PATH,
            "requirement_disposition_program_sha256": sha((ROOT / DISPOSITION_PATH).read_bytes()),
            "registration_contract_path": REGISTRATION_PATH,
            "pre_isolation_holding_path": HOLDING_PATH,
            "pre_isolation_holding_sha256": sha((ROOT / HOLDING_PATH).read_bytes()),
            "read_only": True,
        },
        "live_holdings": holdings,
        "source_items": items,
        "proposed_register_record": proposed,
        "proposal_source_set_sha256": source_digest,
        "append_assessment": {
            "status": "blocked_historical_capture_digest_invalidation",
            "current_register_sha256": sha(register_path.read_bytes()),
            "historical_expected_register_sha256": REGISTER_SHA,
            "proposed_append_register_sha256": sha(register_path.read_bytes() + (json.dumps(proposed, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")),
            "historical_register_sha_references_in_HEAD": historical_sha_refs,
            "known_capture_conflicts": [
                "existing first15 generator/validator reads the live register and would regenerate 14 holdings after append while inventory.json captures 13 holdings",
                "PHCAP-02/03 inventory/validator fixes the historical register digest",
                "delegated-doc003 validator binds historical register-related evidence",
                "unassessed-atom validator binds historical register-related evidence",
                "#1975 SCF-B-0036 13-holding validator also requires an explicit historical 13-holding capture before the live register changes",
                "SCF-B-0027/0029/0034/0035 bindings pin the historical register SHA and would become stale",
            ],
            "required_migration_before_append": [
                "preserve first15 historical capture against the 3df81ad register snapshot or add an explicit historical snapshot input",
                "add a separate current-state read-after for the 14-holding register after append",
                "update affected validators and Bindings without rewriting captured historical digests",
            ],
        },
        "aggregate": {
            "product_scope_counts": dict(sorted(Counter(item["reported_path_scope"]["product_scope"] for item in items).items())),
            "phase_scope_counts": dict(sorted(Counter(item["reported_path_scope"]["phase_scope"] for item in items).items())),
            "same_blob_count": sum(item["archive"]["relation_to_pre_isolation"] == "same" for item in items),
            "changed_blob_count": sum(item["archive"]["relation_to_pre_isolation"] == "different" for item in items),
            "not_in_any_live_holding_count": sum(item["existing_holding_inclusion_relation"] == "not_in_any_of_13_live_holdings" for item in items),
            "path_reference_only_match_count": sum(item["existing_holding_inclusion_relation"] == "path_reference_only_match_requires_review" for item in items),
            "exact_blob_or_sha_match_count": sum(any(r["pre_isolation_blob_match_count"] or r["pre_isolation_sha256_match_count"] for r in item["live_holding_relations"]) for item in items),
            "source_holding_proposed_count": sum(item["source_holding_status"] == "proposed_preserved_unassigned" for item in items),
            "semantic_disposition_not_started_count": sum(item["semantic_disposition"] == "not_started" for item in items),
        },
        "findings": [
            "outside-67 reportの67件を要求atomへ分解せず、path_revision_pairとして保持候補化した。",
            "pre-isolation commitとarchive commitの全67 path blobをGit object OID／SHA／bytesでread-only再照合し、39 same／28 changedを確認した。",
            "67件すべて13 live holdingへのpre-isolation blob／SHA一致がなく、source_holding候補の保存対象とした。66件はpathも不一致で、1件はlegacy-rule holdingにpath文字列だけがあり、blob／SHA包含は未証明である。",
            "product／phase／implementationはoutside reportのpath候補メタデータを引用するだけで、意味分類・authority・実装状態へ昇格していない。",
            "proposed register recordはappend-only schemaの候補形を保持するが、正式registerへのappendは行っていない。",
            "register appendは固定historical digestを持つ既存validator／Bindingと、live registerを再読するfirst15 captureに移行阻害がある。",
        ],
        "prohibited_inference": [
            "path itemをrequirement atom、requirement identity、successorへ変換しない",
            "source_holding候補をsemantic adoption、product owner、phase authority、implementationへ昇格しない",
            "archive commit objectの存在をarchive root保存、現行配置、意味同値へ解釈しない",
            "pre-isolation／archive blob差分を意味変更、採否、retireへ解釈しない",
            "13 live holdingへの不一致を要求意味の不在、不採用、廃止へ解釈しない",
            "旧archive runtime／test／CI／hook／adapterを実行せず、oracle、fallback、implementationへ使わない",
        ],
        "verification_scope": {
            "evidence_kind": "scaffold",
            "static_only": True,
            "checks": ["67 path count", "pre-isolation/archive Git OID and SHA", "39/28 relation", "13 live holding exact scan", "append blocker assessment", "authority boundary"],
        },
    }


def write_outputs(inventory: dict) -> None:
    (HERE / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    items = source_lines(inventory["source_items"])
    (HERE / "source-items.jsonl").write_bytes(items)
    (HERE / "proposed-register-record.json").write_text(json.dumps(inventory["proposed_register_record"], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    write_outputs(build())
