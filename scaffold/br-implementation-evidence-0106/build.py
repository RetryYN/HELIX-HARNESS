#!/usr/bin/env python3
"""SCF-B-0106の静的evidence bundleを決定的に組み立てる。

このスクリプトは旧archiveを読むだけで、旧code/test/runtime/CIを実行しない。
"""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
BUNDLE = Path(__file__).resolve().parent
BASE = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
CROSSWALK = ROOT / "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
LEDGER = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = ROOT / "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = ROOT / "docs/governance/legacy-asset-copy-read-after.jsonl"


def _base_path_exists(path: str) -> bool:
    return subprocess.run(
        ["git", "cat-file", "-e", f"{BASE}:{path}"],
        cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    ).returncode == 0


ALL_WAVE_FILES = {}
for _wave in range(1, 51):
    _docs = ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{_wave}.jsonl"
    _scaffold = ROOT / f"scaffold/legacy-semantic-review-wave{_wave}/legacy-requirement-direct-semantic-review-wave{_wave}.jsonl"
    ALL_WAVE_FILES[_wave] = _docs if _base_path_exists(str(_docs.relative_to(ROOT))) else _scaffold
WAVE_FILES = ALL_WAVE_FILES
UNIT_IDS = [
    "IRUNIT-HIL-BR-21-HELIX-HARNESS",
    "IRUNIT-HIL-BR-22-HELIX-HARNESS",
    "IRUNIT-HIL-BR-23-HELIX-HARNESS", "IRUNIT-HIL-BR-23-HELIX-OS",
    "IRUNIT-HIL-BR-24-HELIX-HARNESS", "IRUNIT-HIL-BR-24-HELIX-OS",
    "IRUNIT-HIL-BR-25-HELIX-HARNESS",
    "IRUNIT-HIL-BR-26-HELIX-HARNESS", "IRUNIT-HIL-BR-26-HELIX-OS",
    "IRUNIT-HIL-BR-27-HELIX-HARNESS",
    "IRUNIT-HIL-BR-28-HELIX-HARNESS",
    "IRUNIT-HIL-BR-29-HELIX-HARNESS", "IRUNIT-HIL-BR-29-HELIX-OS",
    "IRUNIT-HIL-BR-30-HELIX-HARNESS", "IRUNIT-HIL-BR-30-HELIX-OS",
    "IRUNIT-HIL-BR-31-HELIX-OS",
    "IRUNIT-HIL-BR-32-HELIX-OS",
    "IRUNIT-HIL-BR-33-HELIX-HARNESS", "IRUNIT-HIL-BR-33-HELIX-OS",
]


def current_refs_for(unit: str) -> list[tuple[str, int, int, str]]:
    """現行候補／境界の静的参照。実装成立の証拠として扱わない。"""
    refs = [("docs/concept/product-boundary.md", 54, 61, "current_product_boundary")]
    if "HELIX-HARNESS" in unit:
        refs += [
            ("docs/helix-harness/L2-requirements/product-requirements.md", 99, 111, "current_requirement_candidate"),
            ("docs/helix-harness/L11-acceptance/product-acceptance.md", 36, 40, "current_acceptance_candidate"),
        ]
    elif "HARNESS-OS" in unit:
        refs += [
            ("docs/helix-harness/L2-requirements/product-requirements.md", 99, 111, "current_harness_requirement_candidate"),
            ("docs/helix-os/L2-requirements/governance-requirements.md", 55, 66, "current_os_requirement_candidate"),
            ("docs/helix-os/L11-acceptance/governance-acceptance.md", 140, 149, "current_os_acceptance_candidate"),
        ]
    else:
        refs += [
            ("docs/helix-os/L2-requirements/governance-requirements.md", 55, 66, "current_requirement_candidate"),
            ("docs/helix-os/L11-acceptance/governance-acceptance.md", 140, 149, "current_acceptance_candidate"),
        ]
    if "BR-11-" in unit:
        refs.append(("docs/helix-os/L2-requirements/governance-requirements.md", 300, 318, "current_learning_candidate"))
    if "BR-18-" in unit:
        refs.append(("docs/helix-os/L2-requirements/governance-requirements.md", 235, 246, "current_lifecycle_candidate"))
    return refs


def read_jsonl_bytes(data: bytes) -> list[dict]:
    return [json.loads(line) for line in data.decode("utf-8").splitlines() if line.strip()]


def read_jsonl(path: Path) -> list[dict]:
    return read_jsonl_bytes(path.read_bytes())


def sha256_bytes(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def file_sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def base_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{BASE}:{path}"], cwd=ROOT)


def base_file_sha256(path: str) -> str:
    return hashlib.sha256(base_bytes(path)).hexdigest()


def base_blob(path: str) -> str:
    return subprocess.check_output(["git", "rev-parse", f"{BASE}:{path}"], cwd=ROOT, text=True).strip()


def base_jsonl(path: Path) -> list[dict]:
    return read_jsonl_bytes(base_bytes(str(path.relative_to(ROOT))))


def git_blob(path: str) -> str:
    archived = f"archive/legacy-generation-2026-09-14/root/{path}"
    return base_blob(archived)


def anchor_resolution(edge: dict) -> dict:
    references = []
    for ref in edge.get("evidence_refs", []):
        archive_path = ref.get("archive_path")
        actual = None
        range_status = "valid"
        try:
            data = base_bytes(archive_path)
            lines = data.splitlines(keepends=True)
            start, end = ref["line_start"], ref["line_end"]
            selected = lines[start - 1:end]
            if len(selected) != end - start + 1:
                range_status = "invalid"
            else:
                raw = b"".join(selected)
                actual = sha256_bytes(raw)
                without_terminal_newline = sha256_bytes(raw[:-1]) if raw.endswith(b"\n") else actual
                normalized = "\n".join(
                    line.decode("utf-8").rstrip("\r\n") for line in selected
                ).encode("utf-8")
                normalized_digest = sha256_bytes(normalized)
        except (KeyError, subprocess.CalledProcessError, OSError):
            range_status = "missing"
        declared = ref.get("excerpt_sha256")
        if actual is None:
            without_terminal_newline = None
            normalized_digest = None
            hash_basis = "unresolved"
        elif edge.get("wave", 0) <= 17 and declared == actual:
            hash_basis = "raw_span_bytes"
        elif edge.get("wave", 0) >= 18 and declared == normalized_digest:
            hash_basis = "utf8_lines_strip_crlf_join_lf_without_terminal_newline"
        else:
            hash_basis = "unresolved"
        references.append({
            "review_id": edge["review_id"],
            "evidence_ref_id": ref.get("evidence_ref_id"),
            "archive_path": archive_path,
            "line_start": ref.get("line_start"),
            "line_end": ref.get("line_end"),
            "declared_excerpt_sha256": declared,
            "base_excerpt_sha256": actual,
            "base_excerpt_sha256_without_terminal_newline": without_terminal_newline,
            "base_excerpt_sha256_lf_join_without_terminal_newline": normalized_digest,
            "declared_hash_basis": hash_basis,
            "base_file_sha256": base_file_sha256(archive_path) if actual is not None else None,
            "git_blob_oid_at_base": base_blob(archive_path) if actual is not None else None,
            "range_status": range_status,
            "digest_matches": hash_basis != "unresolved",
        })
    mismatches = [x for x in references if not x["digest_matches"]]
    return {
        "status": "resolved" if not mismatches else "unresolved_declared_digest_mismatch_at_base",
        "references": references,
        "mismatch_count": len(mismatches),
        "why_unresolved": (
            "旧semantic reviewが保持するexcerpt digestと固定BASE archive bytesが一致しないため、"
            "旧anchorの成立を断定せず、宣言値とBASE実値を分離して保留する"
            if mismatches else "全旧anchorの宣言excerpt digestが固定BASE bytesと一致する"
        ),
    }


def span(path: Path, start: int, end: int) -> dict:
    relative = str(path.relative_to(ROOT))
    data = base_bytes(relative).splitlines(keepends=True)
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
        "file_sha256": base_file_sha256(relative),
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
    crosswalk = [
        row for row in base_jsonl(CROSSWALK)
        if row.get("source_requirement_id", "").startswith("HIL-BR-")
        and 21 <= int(row["source_requirement_id"].split("-")[-1]) <= 33
    ]
    if [x["unit_candidate_id"] for x in crosswalk] != UNIT_IDS:
        raise SystemExit("crosswalk HIL-BR-21〜33 units changed")
    ledger = {x["asset_id"]: x for x in base_jsonl(LEDGER)}
    decisions = base_jsonl(DECISIONS)
    read_after = base_jsonl(READ_AFTER)
    reviews = []
    scan_rows = 0
    for wave, path in ALL_WAVE_FILES.items():
        rows = base_jsonl(path)
        scan_rows += len(rows)
        for row in rows:
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
        for path, start, end, kind in current_refs_for(unit):
            current_refs.append({"evidence_kind": kind, **span(ROOT / path, start, end)})
        current_ref_count += len(current_refs)
        anchor_resolutions = [
            {"review_id": review["review_id"], **anchor_resolution(review)}
            for review in unit_reviews
        ]
        anchor_mismatch = any(item["mismatch_count"] for item in anchor_resolutions)
        evidence_rows.append({
            "schema": "br-implementation-evidence-0106/unit/v1",
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
            "legacy_anchor_resolution": {
                "status": "unresolved_declared_digest_mismatch_at_base" if anchor_mismatch else "resolved",
                "review_edges": anchor_resolutions,
                "why_unresolved": (
                    "旧semantic reviewのanchor宣言digestと固定BASE bytesの不一致を含むため、"
                    "asset path/blobとanchor path/line/digestを独立に保持して判定保留する"
                    if anchor_mismatch else "全旧semantic review anchorが固定BASE bytesと一致する"
                ),
            },
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
                    {"review_id": x["review_id"], "value": (x.get("coverage", {}).get("failure", "unknown") if isinstance(x.get("coverage"), dict) else x.get("coverage", "unknown"))}
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
                    *( ["legacy_anchor_digest_mismatch_at_base"] if anchor_mismatch else [] ),
                ]
            )),
        })

    evidence_path = BUNDLE / "evidence.jsonl"
    evidence_path.write_text("".join(json.dumps(x, ensure_ascii=False, sort_keys=True) + "\n" for x in evidence_rows), encoding="utf-8")
    input_paths = {
        str(CROSSWALK.relative_to(ROOT)), str(LEDGER.relative_to(ROOT)),
        str(DECISIONS.relative_to(ROOT)), str(READ_AFTER.relative_to(ROOT)),
    }
    input_paths.update(str(path.relative_to(ROOT)) for path in ALL_WAVE_FILES.values())
    for row in evidence_rows:
        input_paths.update(ref["path"] for ref in row["current_implementation_evidence"]["current_refs"])
        input_paths.update(
            evidence_ref["archive_path"]
            for edge in row["semantic_review_edges"]
            for evidence_ref in edge.get("evidence_refs", [])
        )
    inventory = {
        "schema": "br-implementation-evidence-0106/v1",
        "status": "research_only_scaffold_candidate",
        "authority_effect": "none",
        "base_commit": BASE,
        "source_revision": "legacy-generation-2026-09-14",
        "input_digest_basis": "git_object_bytes_at_base",
        "input_digests": {path: base_file_sha256(path) for path in sorted(input_paths)},
        "anchor_digest_policy": {
            "wave_1_17": "raw_span_bytes_including_final_newline",
            "wave_18_50": "utf8_lines_strip_crlf_join_lf_without_terminal_newline",
            "provenance": "legacy semantic review evidence_refs excerpt_sha256 static contract; policy is selected by edge wave",
        },
        "scope": {
            "source_requirement_ids": [f"HIL-BR-{i:02d}" for i in range(21, 34)],
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
        "bundle": {"evidence_path": "scaffold/br-implementation-evidence-0106/evidence.jsonl"},
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
