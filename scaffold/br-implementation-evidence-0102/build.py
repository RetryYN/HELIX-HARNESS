#!/usr/bin/env python3
"""SCF-B-0102の静的evidence bundleを決定的に組み立てる。

このスクリプトは旧archiveを読むだけで、旧code/test/runtime/CIを実行しない。
"""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
BUNDLE = Path(__file__).resolve().parent
BASE = "36784d25aa4cc53d89c28c2ff81b4009db234605"
CROSSWALK = ROOT / "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
LEDGER = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = ROOT / "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = ROOT / "docs/governance/legacy-asset-copy-read-after.jsonl"
ALL_WAVE_FILES = {}
for _wave in range(1, 51):
    _docs = ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{_wave}.jsonl"
    _scaffold = ROOT / f"scaffold/legacy-semantic-review-wave{_wave}/legacy-requirement-direct-semantic-review-wave{_wave}.jsonl"
    ALL_WAVE_FILES[_wave] = _docs if _docs.exists() else _scaffold
WAVE_FILES = {wave: ALL_WAVE_FILES[wave] for wave in (1, 5, 10, 13, 14)}
UNIT_IDS = [
    "IRUNIT-HIL-BR-01-HELIX-HARNESS",
    "IRUNIT-HIL-BR-01-HELIX-OS",
    "IRUNIT-HIL-BR-02-HELIX-OS",
    "IRUNIT-HIL-BR-03-HELIX-OS",
    "IRUNIT-HIL-BR-04-HELIX-HARNESS",
    "IRUNIT-HIL-BR-05-HELIX-HARNESS",
    "IRUNIT-HIL-BR-05-HELIX-OS",
]
CURRENT_REFS = {
    "IRUNIT-HIL-BR-01-HELIX-HARNESS": [
        ("docs/helix-harness/L2-requirements/product-requirements.md", 28, 36, "current_boundary_or_requirement_candidate"),
        ("docs/helix-harness/L2-requirements/product-requirements.md", 99, 106, "current_requirement_candidate"),
        ("docs/helix-harness/L11-acceptance/product-acceptance.md", 36, 40, "current_acceptance_candidate"),
    ],
    "IRUNIT-HIL-BR-01-HELIX-OS": [
        ("docs/concept/product-boundary.md", 54, 61, "current_product_boundary"),
        ("docs/helix-os/L2-requirements/governance-requirements.md", 55, 61, "current_requirement_candidate"),
        ("scaffold/review-handoff/README.md", 12, 15, "current_scaffold_route"),
        ("scaffold/review-handoff/README.md", 48, 55, "current_scaffold_route"),
    ],
    "IRUNIT-HIL-BR-02-HELIX-OS": [
        ("docs/helix-os/L2-requirements/governance-requirements.md", 55, 61, "current_requirement_candidate"),
        ("scaffold/review-handoff/README.md", 48, 55, "current_scaffold_route"),
        ("scaffold/review-handoff/README.md", 81, 83, "current_scaffold_boundary"),
    ],
    "IRUNIT-HIL-BR-03-HELIX-OS": [
        ("docs/helix-os/L2-requirements/governance-requirements.md", 300, 318, "current_memory_requirement_candidate"),
        ("docs/helix-os/L11-acceptance/governance-acceptance.md", 163, 178, "current_acceptance_candidate"),
        ("scaffold/governance/README.md", 20, 27, "current_scaffold_boundary"),
        ("scaffold/governance/README.md", 54, 57, "current_scaffold_boundary"),
    ],
    "IRUNIT-HIL-BR-04-HELIX-HARNESS": [
        ("docs/helix-harness/L2-requirements/product-requirements.md", 99, 106, "current_requirement_candidate"),
        ("docs/helix-harness/L11-acceptance/product-acceptance.md", 36, 40, "current_acceptance_candidate"),
    ],
    "IRUNIT-HIL-BR-05-HELIX-HARNESS": [
        ("docs/helix-harness/L2-requirements/product-requirements.md", 106, 111, "current_refactor_requirement_candidate"),
        ("docs/helix-harness/L2-requirements/product-requirements.md", 212, 219, "current_refactor_boundary"),
        ("docs/helix-harness/L11-acceptance/product-acceptance.md", 36, 40, "current_acceptance_candidate"),
    ],
    "IRUNIT-HIL-BR-05-HELIX-OS": [
        ("docs/helix-os/L2-requirements/governance-requirements.md", 159, 166, "current_refactor_boundary"),
        ("docs/helix-os/L11-acceptance/governance-acceptance.md", 140, 149, "current_acceptance_candidate"),
    ],
}


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def sha256_bytes(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def file_sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def git_blob(path: str) -> str:
    archived = f"archive/legacy-generation-2026-09-14/root/{path}"
    return subprocess.check_output(["git", "rev-parse", f"{BASE}:{archived}"], cwd=ROOT, text=True).strip()


def span(path: Path, start: int, end: int) -> dict:
    data = path.read_bytes().splitlines(keepends=True)
    selected = data[start - 1 : end]
    if len(selected) != end - start + 1:
        raise ValueError(f"line range out of bounds: {path}:{start}-{end}")
    text = [line.decode("utf-8").rstrip("\r\n") for line in selected]
    return {
        "path": str(path.relative_to(ROOT)),
        "line_start": start,
        "line_end": end,
        "line_text": text,
        "span_sha256": sha256_bytes(b"".join(selected)),
        "file_sha256": file_sha256(path),
    }


def exact_review_fields(row: dict, wave: int) -> dict:
    keys = [
        "review_id", "schema_revision", "batch_id", "unit_candidate_id", "source_requirement_id",
        "source_statement_semantic_digest", "source_text_spans", "artifact_evidence_kind", "role_kind",
        "asset_id", "source_path", "source_sha256", "semantic_link_status", "semantic_relation",
        "legacy_asset_evidence_state", "legacy_execution_status", "legacy_requirement_implementation_contribution",
        "catalog_legacy_implementation_status", "product_scope", "phase_candidates", "candidate_phase_targets",
        "candidate_product_targets", "covered_requirement_atom_ids", "coverage", "counterevidence",
        "observed_consumer_refs", "consumer_closure_status", "consumer_closure_evidence", "evidence_refs",
        "unresolved", "current_requirement_implementation_status", "new_build_allowed", "authority_effect",
    ]
    result = {key: row[key] for key in keys if key in row}
    result["wave"] = wave
    result["source_review_file"] = str(WAVE_FILES[wave].relative_to(ROOT))
    return result


def candidate_snapshot(row: dict) -> list[dict]:
    result = []
    for candidate in row.get("representative_legacy_assets", []):
        result.append({
            key: candidate.get(key)
            for key in (
                "asset_id", "source_path", "source_sha256", "artifact_evidence_kind", "classification_id",
                "confidence", "link_basis", "semantic_review_state", "implementation_evidence_state",
                "legacy_implementation_status", "direct_requirement_semantic_link", "consumer_closure_status",
            )
            if key in candidate
        })
    return result


def main() -> None:
    crosswalk = read_jsonl(CROSSWALK)[:7]
    if [x["unit_candidate_id"] for x in crosswalk] != UNIT_IDS:
        raise SystemExit("crosswalk first seven units changed")
    ledger = {x["asset_id"]: x for x in read_jsonl(LEDGER)}
    decisions = read_jsonl(DECISIONS)
    read_after = read_jsonl(READ_AFTER)
    reviews = []
    scan_rows = 0
    for wave, path in ALL_WAVE_FILES.items():
        scan_rows += len(read_jsonl(path))
        for row in read_jsonl(path):
            if row.get("unit_candidate_id") in UNIT_IDS:
                reviews.append(exact_review_fields(row, wave))
    reviews_by_unit = {unit: [] for unit in UNIT_IDS}
    for row in reviews:
        reviews_by_unit[row["unit_candidate_id"]].append(row)

    evidence_rows = []
    current_ref_count = 0
    old_asset_ids = set()
    for source in crosswalk:
        unit = source["unit_candidate_id"]
        unit_reviews = reviews_by_unit[unit]
        asset_ids = sorted({r["asset_id"] for r in unit_reviews})
        old_asset_records = []
        for asset_id in asset_ids:
            old = ledger[asset_id]
            old_asset_ids.add(asset_id)
            source_path = old["source_path"]
            archive_path = f"archive/legacy-generation-2026-09-14/root/{source_path}"
            old_asset_records.append({
                "asset_id": asset_id,
                "source_path": source_path,
                "archive_path": archive_path,
                "source_sha256": old["source_sha256"],
                "git_blob_oid_at_base": git_blob(source_path),
                "ledger_record": old,
                "decision_records": [x for x in decisions if x.get("asset_id") == asset_id],
                "read_after_records": [x for x in read_after if x.get("asset_id") == asset_id],
            })
        impl_edges = [r for r in unit_reviews if r["artifact_evidence_kind"] == "implementation_source"]
        observed_consumers = sorted({x for r in unit_reviews for x in r.get("observed_consumer_refs", [])})
        ledger_consumers = sorted({x for a in old_asset_records for x in a["ledger_record"].get("consumer_refs", [])})
        phase = []
        for item in source.get("phase_capability_evidence", []):
            phase.append({
                key: item.get(key)
                for key in (
                    "phase_id", "title", "status_scope", "current_status", "legacy_capability_status",
                    "transition_assessment", "gap", "evidence_spans", "evidence_span_matches",
                    "evidence_trace_status", "product_candidate_evidence_status", "legacy_layers_evidenced",
                )
                if key in item
            })
        current_refs = []
        for path, start, end, kind in CURRENT_REFS[unit]:
            current_refs.append({"evidence_kind": kind, **span(ROOT / path, start, end)})
        current_ref_count += len(current_refs)
        evidence_rows.append({
            "schema": "br-implementation-evidence-0102/unit/v1",
            "unit_candidate_id": unit,
            "source_requirement": {
                "source_requirement_id": source["source_requirement_id"],
                "source_revision": source["source_revision"],
                "source_statement_semantic_digest": source["source_statement_semantic_digest"],
                "source_text_spans": source["source_text_spans"],
                "product_scope": source["product_scope"],
                "direct_phase_candidates": source["direct_phase_candidates"],
                "phase_classification_status": source["phase_classification_status"],
                "phase_rationale": source["phase_rationale"],
                "responsibility_summary": source["responsibility_summary"],
                "successor_assignment_status": source["successor_assignment_status"],
                "unimplemented_assessment_status": source["unimplemented_assessment_status"],
                "representative_legacy_assets_are_not_implementation_proof": True,
                "representative_legacy_assets": candidate_snapshot(source),
            },
            "semantic_review_edges": unit_reviews,
            "old_asset_evidence": {
                "assets": old_asset_records,
                "asset_count": len(old_asset_records),
                "source_or_candidate_or_implementation_are_not_collapsed": True,
            },
            "legacy_implementation_evidence": {
                "evidence_presence": "static_implementation_source_candidate_present" if impl_edges else "no_static_implementation_source_edge",
                "unit_implementation_status": "unknown",
                "execution_performed": False,
                "review_edge_ids": [x["review_id"] for x in impl_edges],
                "asset_ids": [x["asset_id"] for x in impl_edges],
                "semantic_contribution_by_edge": [
                    {
                        "review_id": x["review_id"],
                        "asset_id": x["asset_id"],
                        "semantic_link_status": x["semantic_link_status"],
                        "semantic_relation": x["semantic_relation"],
                        "contribution": x["legacy_requirement_implementation_contribution"],
                        "counterevidence": x.get("counterevidence", []),
                    }
                    for x in impl_edges
                ],
                "why_unit_status_is_unknown": [
                    "implementation_sourceは旧sourceの静的候補であり、unit全atomの成立・consumer接続・受入を証明しない",
                    "旧code/test/runtime/CIを実行していない",
                    "旧asset ledgerのimplementation_statusはHistorical assetではunknownである",
                ],
            },
            "legacy_failure_evidence": {
                "observed_failure_status": "unknown",
                "observed_failure_receipts": [],
                "review_coverage_failure_values": [
                    {"review_id": x["review_id"], "value": x.get("coverage", {}).get("failure", "unknown")}
                    for x in unit_reviews
                ],
                "ledger_external_effect_statuses": [
                    {"asset_id": x["asset_id"], "value": x["ledger_record"].get("external_effect_status")}
                    for x in old_asset_records
                ],
                "why_unknown": [
                    "semantic reviewのcoverage.failureは観測failure receiptではなく、対応範囲の静的分類である",
                    "Historical assetのfailure receiptは見つからず、ledgerのexternal_effect_statusも実行観測を示さない",
                    "旧failure/runtime/testを実行していないため、失敗・正常・縮退を実行結果から判定できない",
                ],
            },
            "legacy_degradation_evidence": {
                "phase_level_evidence": phase,
                "phase_transition_evidence_status": "present_in_crosswalk_assessment",
                "unit_degradation_status": "unknown",
                "why_phase_transition_is_not_unit_failure": "crosswalkのtransition_assessmentはphase capability候補の静的評価であり、unitの実装失敗receiptではない",
                "counterevidence": [x for r in unit_reviews for x in r.get("counterevidence", [])],
            },
            "legacy_consumer_evidence": {
                "closure_status": "pending",
                "review_observed_consumer_refs": observed_consumers,
                "ledger_consumer_refs": ledger_consumers,
                "decision_and_read_after_records_present": bool(any(a["decision_records"] or a["read_after_records"] for a in old_asset_records)),
                "consumer_closure_evidence": [
                    {"review_id": x["review_id"], "status": x.get("consumer_closure_status"), "evidence": x.get("consumer_closure_evidence", [])}
                    for x in unit_reviews
                ],
                "why_pending": "consumer参照の列挙はconsumer chainの成立・全atom接続・現行利用を証明しない",
            },
            "current_implementation_evidence": {
                "status": "unknown",
                "implementation_evidence_presence": "no_direct_current_implementation_evidence",
                "operation_status": "unknown",
                "acceptance_status": "unknown",
                "execution_performed": False,
                "current_refs": current_refs,
                "counter_evidence": [
                    "current refsはL2/L11候補、product boundary、またはscaffoldの静的契約であり、実装source・runtime・acceptance receiptではない",
                    "現行treeにこのunitの正式実装／実行／受入を成立させる証拠は確認できないが、absenceだけで未実装とは断定しない",
                    "新世代CI・旧資産runtime・旧testを実行していない",
                ],
            },
            "unimplemented_assessment": {
                "status": "not_assessed",
                "explicit_non_implementation_claim": False,
                "reason": "直接の未実装証拠がないため未実装を断定せず、current implementation evidenceのunknownとして保留する",
            },
            "counter_evidence": {
                "catalog_candidate_warning": "crosswalk代表assetとasset catalog implementation_sourceは検索候補であり、unit実装成立の証拠ではない",
                "review_edge_counterevidence": [
                    {"review_id": x["review_id"], "items": x.get("counterevidence", [])} for x in unit_reviews
                ],
                "ledger_boundary": "ledgerのHistorical／unknown／unreviewedは、failure・implementation・consumer closureの肯定証拠ではない",
                "current_boundary": "current L2/L11/scaffold候補の存在は、current implementation・acceptance・operationの成立を証明しない",
            },
            "unresolved": sorted(set(
                list(source.get("unresolved", []))
                + [
                    "legacy_unit_implementation_unknown", "legacy_failure_observation_unknown",
                    "legacy_degradation_unit_status_unknown", "consumer_closure_pending",
                    "current_implementation_evidence_missing", "current_acceptance_evidence_missing",
                    "product_boundary_human_decision_pending", "successor_assignment_unassigned",
                    "old_execution_not_run", "current_runtime_not_executed",
                ]
            )),
        })

    evidence_path = BUNDLE / "evidence.jsonl"
    evidence_path.write_text("".join(json.dumps(x, ensure_ascii=False, sort_keys=True) + "\n" for x in evidence_rows), encoding="utf-8")
    inventory = {
        "schema": "br-implementation-evidence-0102/v1",
        "status": "research_only_scaffold_candidate",
        "authority_effect": "none",
        "base_commit": BASE,
        "source_revision": "legacy-generation-2026-09-14",
        "scope": {
            "source_requirement_ids": ["HIL-BR-01", "HIL-BR-02", "HIL-BR-03", "HIL-BR-04", "HIL-BR-05"],
            "unit_ids": UNIT_IDS,
            "wave_range": "1-50",
            "review_files": [str(x.relative_to(ROOT)) for x in WAVE_FILES.values()],
            "semantic_review_scan_files": [str(x.relative_to(ROOT)) for x in ALL_WAVE_FILES.values()],
            "semantic_review_scan_row_count": scan_rows,
            "review_edge_count": len(reviews),
            "unique_asset_count": len(old_asset_ids),
        },
        "counts": {
            "units": len(evidence_rows),
            "semantic_review_edges": len(reviews),
            "unique_old_assets": len(old_asset_ids),
            "current_static_refs": current_ref_count,
            "old_failure_receipts": 0,
            "old_runtime_test_ci_executions": 0,
            "current_runtime_executions": 0,
        },
        "evidence_partition": {
            "source_statement": "crosswalk source_requirement snapshot",
            "candidate": "representative_legacy_assets and catalog status; search candidates only",
            "old_implementation": "implementation_source review edges; static, unexecuted, unit status unknown",
            "old_failure": "observed receipt only; none found, status unknown",
            "old_degradation": "phase transition assessment only; unit status unknown",
            "old_consumer": "observed refs and ledger refs; closure pending",
            "current_implementation": "direct implementation evidence only; none found, status unknown",
            "current_acceptance": "direct acceptance receipt only; none found, status unknown",
        },
        "prohibited_inference": [
            "代表asset・catalog implementation_source・design・requirementはunitの実装成立を示さない",
            "phase transition assessment・coverage.failure・unreviewed ledger statusは実行failureのreceiptではない",
            "current L2/L11/scaffoldの存在・validator合格から実装・受入・運用・未実装を生成しない",
            "unknown／pendingを未実装・縮退・完了へ変換しない",
        ],
        "bundle": {"evidence_path": "scaffold/br-implementation-evidence-0102/evidence.jsonl"},
        "unresolved": [
            "legacy_unit_implementation_unknown", "legacy_failure_observation_unknown",
            "legacy_degradation_unit_status_unknown", "consumer_closure_pending",
            "current_implementation_evidence_missing", "current_acceptance_evidence_missing",
            "product_boundary_human_decision_pending", "successor_assignment_unassigned",
        ],
    }
    (BUNDLE / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"units": len(evidence_rows), "review_edges": len(reviews), "assets": len(old_asset_ids), "current_refs": current_ref_count}, ensure_ascii=False))


if __name__ == "__main__":
    main()
