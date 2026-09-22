#!/usr/bin/env python3
"""SCF-B-0110 の HIL-FR-21〜40 静的証拠partitionを生成する。

旧archiveや旧資産は固定BASEのGit object bytesとして読むだけで、旧code、test、runtime、CIは実行しない。
このbundleは研究用の候補記録であり、実装、未実装、degradation、failure、consumer closure、phase/product
authorityを確定しない。
"""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path
from typing import Any


BUNDLE = Path(__file__).resolve().parent
ROOT = BUNDLE.parents[1]
BASE = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
BINDING_ID = "SCF-B-0110"
SCHEMA = "fr-implementation-evidence-0110/v1"
UNIT_SCHEMA = SCHEMA + "/unit"
BASE_DECLARATION = {
    "repository": "HELIX-HARNESS",
    "commit": BASE,
    "branch": "main",
    "required_ancestor": BASE,
}
NEGATIVE_CASE_CODES = [
    "E_UNIT_SET", "E_UNIT_SCHEMA", "E_REVIEW_EDGE_SET", "E_REVIEW_EDGE_DUP", "E_ASSET_SET",
    "E_INVENTORY_DECLARATION", "E_REPRESENTATIVE_ASSET", "E_IMPLEMENTATION_EVIDENCE",
    "E_DEGRADATION_EVIDENCE", "E_FAILURE_EVIDENCE", "E_CONSUMER_EVIDENCE", "E_SOURCE_ANCHOR",
    "E_OLD_ASSET_SOURCE", "E_OLD_ASSET_EVIDENCE", "E_INPUT_DIGEST", "E_BASE_COMMIT",
    "E_BASE_NOT_ANCESTOR", "E_AUTHORITY_BOUNDARY", "E_CURRENT_STATUS", "E_UNIMPLEMENTED_CLAIM",
]
CROSSWALK = "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
IR = "archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json"
DECOMP = "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
CLASSIFICATION = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
CLASSIFICATION_META = "docs/governance/legacy-asset-phase-product-classification-bootstrap.meta.json"

SOURCE_IDS = [f"HIL-FR-{n:02d}" for n in range(21, 41)]
UNIT_PATTERN = re.compile(r"^IRUNIT-HIL-FR-(2[1-9]|3[0-9]|40)-HELIX-(OS|HARNESS)$")
PRODUCTS = ("HELIX-OS", "HELIX-HARNESS")
CONTEXT_INPUTS = [
    "docs/concept/product-boundary.md",
    "docs/helix-harness/L1-planning/product-intent.md",
    "docs/helix-os/L1-planning/system-intent.md",
    "docs/helix-web/L1-planning/product-intent.md",
    "docs/helix-web-os/L1-planning/system-intent.md",
    "docs/governance/phase-capability-inventory.json",
    "docs/governance/phase-capability-inventory.md",
    "scaffold/phcap20-memory-research/README.md",
    "scaffold/phcap20-memory-research/inventory.json",
]


def git_exists(path: str) -> bool:
    return subprocess.run(
        ["git", "cat-file", "-e", f"{BASE}:{path}"],
        cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    ).returncode == 0


def wave_paths() -> dict[int, str]:
    result: dict[int, str] = {}
    for wave in range(1, 51):
        docs = f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.jsonl"
        scaffold = f"scaffold/legacy-semantic-review-wave{wave}/legacy-requirement-direct-semantic-review-wave{wave}.jsonl"
        result[wave] = docs if git_exists(docs) else scaffold
    return result


WAVE_PATHS = wave_paths()
INPUT_PATHS = [CROSSWALK, IR, DECOMP, DISPOSITION, DECISIONS, READ_AFTER, CLASSIFICATION, CLASSIFICATION_META]
INPUT_PATHS += [WAVE_PATHS[n] for n in range(1, 51)]
INPUT_PATHS += CONTEXT_INPUTS


def base_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{BASE}:{path}"], cwd=ROOT)


def base_json(path: str) -> Any:
    return json.loads(base_bytes(path).decode("utf-8"))


def base_jsonl(path: str) -> list[dict[str, Any]]:
    return [json.loads(line) for line in base_bytes(path).decode("utf-8").splitlines() if line.strip()]


def sha256(data: bytes, prefix: bool = True) -> str:
    value = hashlib.sha256(data).hexdigest()
    return f"sha256:{value}" if prefix else value


def canonical_digest(value: Any) -> str:
    return sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8"))


def base_digest(path: str) -> str:
    return sha256(base_bytes(path), prefix=False)


def base_file_sha256(path: str) -> str:
    return base_digest(path)


def base_blob(path: str) -> str:
    return subprocess.check_output(["git", "rev-parse", f"{BASE}:{path}"], cwd=ROOT, text=True).strip()


def git_blob(path: str) -> str:
    archived = f"archive/legacy-generation-2026-09-14/root/{path}"
    return subprocess.check_output(["git", "rev-parse", f"{BASE}:{archived}"], cwd=ROOT, text=True).strip()


def jsonl_by_id(path: str, key: str) -> dict[str, dict[str, Any]]:
    return {row[key]: row for row in base_jsonl(path)}


def target_crosswalk() -> list[dict[str, Any]]:
    rows = [row for row in base_jsonl(CROSSWALK) if row.get("source_requirement_id") in SOURCE_IDS]
    if len(rows) != 27 or any(not UNIT_PATTERN.fullmatch(row.get("unit_candidate_id", "")) for row in rows):
        raise ValueError("HIL-FR-21〜40の製品unit集合が27件のFR専用集合ではない")
    if any("HIL-BR-" in row.get("unit_candidate_id", "") for row in rows):
        raise ValueError("BR unitがFR bundleへ混入した")
    if len({row["unit_candidate_id"] for row in rows}) != 27:
        raise ValueError("FR unitが重複している")
    return rows


def source_range(requirement_id: str) -> dict[str, Any]:
    raw = base_bytes(IR)
    lines = raw.splitlines(keepends=True)
    start = next(i for i, line in enumerate(lines) if re.match(rb'^  "' + requirement_id.encode() + rb'": \{', line))
    next_start = next(
        (i for i in range(start + 1, len(lines)) if re.match(rb'^  "HIL-[A-Z]+-[0-9]+": \{', lines[i])),
        len(lines),
    )
    selected = b"".join(lines[start:next_start])
    return {
        "path": IR,
        "json_pointer": f"requirements-ir/requirements.json#/{requirement_id}",
        "line_start": start + 1,
        "line_end": next_start,
        "span_sha256": sha256(selected),
        "file_sha256": base_digest(IR),
        "line_text_sha256": sha256(b"".join(lines[start:next_start]), prefix=False),
    }


def compact_edge(row: dict[str, Any], wave: int, source_file: str) -> dict[str, Any]:
    result = {key: row[key] for key in sorted(row)}
    result["wave"] = wave
    result["source_review_file"] = source_file
    result["anchor_resolution"] = anchor_resolution(result)
    return result


def anchor_resolution(edge: dict[str, Any]) -> dict[str, Any]:
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
                actual = sha256(raw)
                without_terminal_newline = sha256(raw[:-1]) if raw.endswith(b"\n") else actual
                normalized = "\n".join(
                    line.decode("utf-8").rstrip("\r\n") for line in selected
                ).encode("utf-8")
                normalized_digest = sha256(normalized)
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


def scan_edges() -> tuple[dict[str, list[dict[str, Any]]], int, list[str]]:
    by_unit: dict[str, list[dict[str, Any]]] = {}
    scan_count = 0
    review_files = [WAVE_PATHS[n] for n in range(1, 51)]
    for wave, path in WAVE_PATHS.items():
        for row in base_jsonl(path):
            scan_count += 1
            unit = row.get("unit_candidate_id")
            if unit and UNIT_PATTERN.fullmatch(unit) and row.get("source_requirement_id") in SOURCE_IDS:
                by_unit.setdefault(unit, []).append(compact_edge(row, wave, path))
    for unit in by_unit:
        by_unit[unit].sort(key=lambda edge: (edge["wave"], edge["review_id"]))
    return by_unit, scan_count, review_files


def source_snapshot(source: dict[str, Any], decomp: dict[str, Any]) -> dict[str, Any]:
    pool = source.get("candidate_asset_pool", {})
    pool_ids = pool.get("phase_and_product_candidate_asset_ids", [])
    return {
        "crosswalk_id": source.get("crosswalk_id"),
        "schema_revision": source.get("schema_revision"),
        "source_requirement_id": source["source_requirement_id"],
        "source_revision": source.get("source_revision"),
        "source_statement_semantic_digest": source.get("source_statement_semantic_digest"),
        "source_text_spans": source.get("source_text_spans", []),
        "product_scope": source.get("product_scope", []),
        "status_scope": source.get("status_scope"),
        "unit_kind": source.get("unit_kind"),
        "responsibility_summary": source.get("responsibility_summary"),
        "direct_phase_candidates": source.get("direct_phase_candidates", []),
        "phase_classification_status": source.get("phase_classification_status"),
        "phase_rationale": source.get("phase_rationale"),
        "legacy_requirement_implementation_status": source.get("legacy_requirement_implementation_status"),
        "current_requirement_implementation_status": source.get("current_requirement_implementation_status"),
        "unimplemented_assessment_status": source.get("unimplemented_assessment_status"),
        "successor_assignment_status": source.get("successor_assignment_status"),
        "consumer_closure_status": source.get("consumer_closure_status"),
        "direct_legacy_asset_link_status": source.get("direct_legacy_asset_link_status"),
        "direct_legacy_asset_links": source.get("direct_legacy_asset_links", []),
        "legacy_execution_performed": source.get("legacy_execution_performed"),
        "new_build_allowed": source.get("new_build_allowed"),
        "authority_effect": source.get("authority_effect"),
        "unresolved": source.get("unresolved", []),
        "candidate_asset_pool": {
            key: value for key, value in pool.items() if key != "phase_and_product_candidate_asset_ids"
        } | {
            "phase_and_product_candidate_asset_ids_count": len(pool_ids),
            "phase_and_product_candidate_asset_ids_digest": canonical_digest(pool_ids),
        },
        "representative_asset_candidates": source.get("representative_legacy_assets", []),
        "phase_capability_evidence": source.get("phase_capability_evidence", []),
        "decomposition_id": decomp.get("decomposition_id"),
        "decomposition_unit": next(
            (unit for unit in decomp.get("candidate_units", []) if unit.get("unit_candidate_id") == source.get("unit_candidate_id")),
            None,
        ),
    }


def old_asset_record(
    asset_id: str,
    unit_edges: list[dict[str, Any]],
    disposition: dict[str, dict[str, Any]],
    decisions: list[dict[str, Any]],
    read_after: list[dict[str, Any]],
    classifications: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    old = disposition[asset_id]
    asset_edges = [edge for edge in unit_edges if edge.get("asset_id") == asset_id]
    coverage_failures = sorted({edge.get("coverage", {}).get("failure") for edge in asset_edges if edge.get("coverage", {}).get("failure")})
    unresolved = sorted({item for edge in asset_edges for item in edge.get("unresolved", [])})
    edge_counterevidence = [
        {"review_id": edge["review_id"], "counterevidence": edge.get("counterevidence", [])}
        for edge in asset_edges
    ]
    edge_consumers = sorted({ref for edge in asset_edges for ref in edge.get("observed_consumer_refs", [])})
    classification = classifications.get(asset_id)
    archive_path = f"archive/legacy-generation-2026-09-14/root/{old['source_path']}"
    return {
        "asset_id": asset_id,
        "source": {
            "source_path": old["source_path"],
            "archive_path": archive_path,
            "source_sha256": old["source_sha256"],
            "source_revision": old.get("source_revision"),
            "source_surface": old.get("source_surface"),
            "source_provenance_ref": old.get("source_provenance_ref"),
            "artifact_evidence_kind": sorted({edge.get("artifact_evidence_kind") for edge in asset_edges}),
            "git_blob_oid_at_base": git_blob(old["source_path"]),
            "git_blob_sha256_at_base": sha256(base_bytes(archive_path), prefix=False),
        },
        "history": {
            "asset_class": old.get("asset_class"),
            "authority_status": old.get("authority_status"),
            "disposition": old.get("disposition"),
            "implementation_status": old.get("implementation_status"),
            "decision_record_ref": old.get("decision_record_ref"),
            "classification_id": classification.get("classification_id") if classification else None,
            "phase_classification_status": classification.get("phase_classification_status") if classification else None,
            "product_classification_status": classification.get("product_classification_status") if classification else None,
        },
        "failure": {
            "static_only": True,
            "coverage_failures": coverage_failures,
            "edge_counterevidence": edge_counterevidence,
            "unresolved": unresolved,
            "observed_failure_status": "unknown",
            "observed_failure_receipts": [],
        },
        "consumer": {
            "static_only": True,
            "closure_status": old.get("consumer_refs") and "pending" or "unknown",
            "ledger_consumer_refs": sorted(old.get("consumer_refs", [])),
            "edge_consumer_refs": edge_consumers,
            "edge_evidence_count": len(asset_edges),
            "decision_records": [row for row in decisions if row.get("asset_id") == asset_id],
            "read_after_records": [row for row in read_after if row.get("asset_id") == asset_id],
        },
        "ledger_record": old,
        "classification_record": classification,
        "edge_refs": [edge["review_id"] for edge in asset_edges],
        "static_only": True,
        "not_implementation_proof": True,
    }


def implementation_partition(edges: list[dict[str, Any]]) -> dict[str, Any]:
    records = [
        {
            "review_id": edge["review_id"],
            "asset_id": edge["asset_id"],
            "artifact_evidence_kind": edge.get("artifact_evidence_kind"),
            "source_path": edge.get("source_path"),
            "source_sha256": edge.get("source_sha256"),
            "legacy_implementation_status": edge.get("catalog_legacy_implementation_status"),
            "legacy_execution_status": edge.get("legacy_execution_status"),
            "static_only": True,
            "evidence_role": "candidate_source_presence_only",
        }
        for edge in edges
        if edge.get("artifact_evidence_kind") in {"implementation_source", "test_source"}
    ]
    design_refs = [edge["review_id"] for edge in edges if edge.get("artifact_evidence_kind") in {"design", "test_design"}]
    return {
        "status": "static_candidate_partition",
        "unit_implementation_status": "unknown",
        "explicit_implementation_claim": False,
        "records": records,
        "supporting_design_edge_refs": design_refs,
        "legacy_execution_performed": False,
        "current_implementation_status": "unknown",
    }


def degradation_partition(source: dict[str, Any], edges: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "status": "static_transition_and_constraint_partition",
        "unit_degradation_status": "unknown",
        "explicit_degradation_claim": False,
        "phase_transition_evidence": source.get("phase_capability_evidence", []),
        "edge_constraint_evidence": [
            {
                "review_id": edge["review_id"],
                "coverage": edge.get("coverage", {}),
                "legacy_requirement_implementation_contribution": edge.get("legacy_requirement_implementation_contribution"),
                "static_only": True,
            }
            for edge in edges
        ],
        "legacy_execution_performed": False,
    }


def failure_partition(edges: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "status": "static_failure_finding_partition",
        "unit_failure_status": "unknown",
        "explicit_failure_claim": False,
        "observed_failure_status": "unknown",
        "observed_failure_receipts": [],
        "records": [
            {
                "review_id": edge["review_id"],
                "asset_id": edge["asset_id"],
                "coverage_failure": edge.get("coverage", {}).get("failure"),
                "counterevidence": edge.get("counterevidence", []),
                "unresolved": edge.get("unresolved", []),
                "static_only": True,
            }
            for edge in edges
        ],
        "legacy_execution_performed": False,
    }


def consumer_partition(edges: list[dict[str, Any]], assets: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "status": "static_consumer_reference_partition",
        "closure_status": "pending",
        "explicit_consumer_closure": False,
        "records": [
            {
                "review_id": edge["review_id"],
                "observed_consumer_refs": edge.get("observed_consumer_refs", []),
                "consumer_closure_status": edge.get("consumer_closure_status"),
                "consumer_closure_evidence": edge.get("consumer_closure_evidence", []),
                "evidence_refs": edge.get("evidence_refs", []),
                "static_only": True,
            }
            for edge in edges
        ],
        "ledger_consumer_refs": sorted({ref for asset in assets for ref in asset["consumer"]["ledger_consumer_refs"]}),
        "decision_and_read_after_asset_count": sum(
            bool(asset["consumer"]["decision_records"] or asset["consumer"]["read_after_records"]) for asset in assets
        ),
    }


def current_context() -> list[dict[str, Any]]:
    return [
        {"path": path, "sha256": base_digest(path), "status": "context_only", "implementation_claim": False}
        for path in CONTEXT_INPUTS
    ]


def representative_ids(source: dict[str, Any], asset_ids: list[str]) -> tuple[list[str], str]:
    candidate_ids = [item.get("asset_id") for item in source.get("representative_legacy_assets", [])]
    selected = [asset_id for asset_id in candidate_ids if asset_id in asset_ids]
    if not selected:
        selected = asset_ids[:3]
        rule = "crosswalk_representative_intersection_else_sorted_edge_assets_first_three"
    else:
        selected = selected[:3]
        rule = "crosswalk_representative_intersection_first_three"
    return selected, rule


def build_bundle() -> tuple[dict[str, Any], list[dict[str, Any]]]:
    crosswalk = target_crosswalk()
    decomp_rows = base_jsonl(DECOMP)
    decomp_by_unit = {
        unit["unit_candidate_id"]: (row, unit)
        for row in decomp_rows
        for unit in row.get("candidate_units", [])
    }
    disposition = jsonl_by_id(DISPOSITION, "asset_id")
    classifications = jsonl_by_id(CLASSIFICATION, "asset_id")
    decisions = base_jsonl(DECISIONS)
    read_after = base_jsonl(READ_AFTER)
    edges_by_unit, scan_count, scan_files = scan_edges()
    if set(edges_by_unit) != {row["unit_candidate_id"] for row in crosswalk}:
        raise ValueError("FR unitのWave edgeが欠落または余分")
    evidence: list[dict[str, Any]] = []
    total_edges = 0
    unique_assets: set[str] = set()
    for source in crosswalk:
        unit = source["unit_candidate_id"]
        decomp_row, _ = decomp_by_unit[unit]
        edges = edges_by_unit[unit]
        total_edges += len(edges)
        asset_ids = sorted({edge["asset_id"] for edge in edges})
        unique_assets.update(asset_ids)
        assets = [old_asset_record(asset_id, edges, disposition, decisions, read_after, classifications) for asset_id in asset_ids]
        reps, rep_rule = representative_ids(source, asset_ids)
        evidence.append({
            "schema": UNIT_SCHEMA,
            "unit_candidate_id": unit,
            "source_requirement": source_snapshot(source, decomp_row),
            "source_anchor": source_range(source["source_requirement_id"]),
            "semantic_review_edges": edges,
            "asset_set": {
                "asset_ids": asset_ids,
                "count": len(asset_ids),
                "completeness": "exact_unique_asset_ids_derived_from_wave_edges",
                "edge_asset_membership": {asset_id: [edge["review_id"] for edge in edges if edge["asset_id"] == asset_id] for asset_id in asset_ids},
            },
            "old_asset_evidence": {
                "assets": assets,
                "static_only": True,
                "not_implementation_proof": True,
            },
            "implementation_evidence": implementation_partition(edges),
            "degradation_evidence": degradation_partition(source, edges),
            "failure_evidence": failure_partition(edges),
            "consumer_evidence": consumer_partition(edges, assets),
            "representative_assets": {
                "selection_rule": rep_rule,
                "representative_asset_ids": reps,
                "records": [next(asset for asset in assets if asset["asset_id"] == asset_id) for asset_id in reps],
                "static_only": True,
                "not_implementation_proof": True,
            },
            "current_context": current_context(),
            "current_implementation_evidence": {
                "status": "unknown",
                "execution_performed": False,
                "current_refs": current_context(),
                "acceptance_status": "unknown",
                "operation_status": "unknown",
                "explicit_claim": False,
            },
            "unimplemented_assessment": {
                "status": "not_assessed",
                "explicit_non_implementation_claim": False,
                "reason": "静的候補・review edge・source/historyだけではunitの未実装を導けない",
            },
            "authority_boundary": {
                "formal_phase_authority": False,
                "formal_product_authority": False,
                "formal_implementation_acceptance": False,
                "successor_assignment": False,
                "consumer_closure": False,
                "new_build": False,
            },
            "unresolved": sorted(set(source.get("unresolved", [])) | {
                "unit_implementation_status_unknown",
                "unit_degradation_status_unknown",
                "unit_failure_status_unknown",
                "consumer_closure_pending",
                "direct_phase_product_authority_pending",
            }),
        })

    counts = {
        "units": len(evidence),
        "helix_os_units": sum(row["unit_candidate_id"].endswith("HELIX-OS") for row in evidence),
        "helix_harness_units": sum(row["unit_candidate_id"].endswith("HELIX-HARNESS") for row in evidence),
        "semantic_review_edges": total_edges,
        "unique_old_assets": len(unique_assets),
        "current_static_refs": sum(len(row["current_implementation_evidence"]["current_refs"]) for row in evidence),
        "old_failure_receipts": 0,
        "old_runtime_test_ci_executions": 0,
        "current_runtime_executions": 0,
    }
    inventory = {
        "schema": SCHEMA,
        "binding_id": BINDING_ID,
        "status": "research_only_scaffold_candidate",
        "authority_effect": "none",
        "new_build": False,
        "base": BASE_DECLARATION,
        "scope": {
            "source_requirement_ids": SOURCE_IDS,
            "unit_count": 27,
            "product_counts": {"HELIX-OS": counts["helix_os_units"], "HELIX-HARNESS": counts["helix_harness_units"]},
            "wave_range": [1, 50],
            "semantic_review_scan_files": scan_files,
            "semantic_review_scan_row_count": scan_count,
            "semantic_review_edge_count": total_edges,
            "unique_old_asset_count": len(unique_assets),
            "br_units_included": 0,
        },
        "anchor_digest_policy": {
            "wave_1_17": "raw_span_bytes_including_final_newline",
            "wave_18_50": "utf8_lines_strip_crlf_join_lf_without_terminal_newline",
            "provenance": "legacy semantic review evidence_refs excerpt_sha256 static contract; policy is selected by edge wave",
        },
        "input_snapshot": [{"path": path, "sha256": base_digest(path)} for path in INPUT_PATHS],
        "counts": counts,
        "unit_ids": [row["unit_candidate_id"] for row in evidence],
        "unit_declarations": [
            {
                "unit_candidate_id": row["unit_candidate_id"],
                "product_scope": row["source_requirement"]["product_scope"],
                "asset_ids": row["asset_set"]["asset_ids"],
                "asset_count": row["asset_set"]["count"],
                "edge_refs": [edge["review_id"] for edge in row["semantic_review_edges"]],
                "edge_count": len(row["semantic_review_edges"]),
                "representative_asset_ids": row["representative_assets"]["representative_asset_ids"],
                "implementation_record_count": len(row["implementation_evidence"]["records"]),
                "degradation_phase_record_count": len(row["degradation_evidence"]["phase_transition_evidence"]),
                "failure_record_count": len(row["failure_evidence"]["records"]),
                "consumer_record_count": len(row["consumer_evidence"]["records"]),
                "phase_classification_status": row["source_requirement"]["phase_classification_status"],
            }
            for row in evidence
        ],
        "partition_contract": {
            "implementation": "旧implementation_source/test_sourceは候補source存在の静的記録。unit実装成立・旧実行は示さない",
            "degradation": "crosswalk transition/legacy capabilityとcoverage constraintの静的記録。unit縮退は示さない",
            "failure": "coverage.failure/counterevidence/unresolvedの静的記録。failure receiptは空でunknown",
            "consumer": "edge/ledger/decision/read-after参照の静的記録。consumer closureはpending",
        },
        "evidence_partition": {
            "source_statement": "crosswalk source_requirement snapshot",
            "candidate": "representative_legacy_assets and catalog status; search candidates only",
            "old_implementation": "implementation_source/test_source review edges; static, unexecuted, unit status unknown",
            "old_failure": "coverage.failure and ledger failure fields; observed receipt only, status unknown",
            "old_degradation": "phase transition and constraint assessment only; unit status unknown",
            "old_consumer": "observed refs and ledger/decision/read-after refs; closure pending",
            "current_implementation": "current context refs only; direct implementation evidence absent, status unknown",
            "current_acceptance": "direct acceptance receipt only; none found, status unknown",
        },
        "negative_case_codes": NEGATIVE_CASE_CODES,
        "prohibited_inference": [
            "candidate_asset_pool、旧source存在、Wave edge、phase transition、coverage.failure、validator PASSから実装成立を導かない",
            "証拠欠落やunknownから未実装を断定しない",
            "degradation/failureの静的partitionから実行failureを導かない",
            "consumer refs、decision、read-afterからconsumer closureを導かない",
            "phase/product candidateから正式authority・successor・current acceptanceを生成しない",
        ],
        "unresolved": [
            "unit_implementation_status_unknown",
            "unit_degradation_status_unknown",
            "unit_failure_status_unknown",
            "consumer_closure_pending",
            "direct_phase_product_authority_pending",
            "current_implementation_evidence_missing",
            "current_acceptance_evidence_missing",
            "successor_assignment_unassigned",
        ],
    }
    return inventory, evidence


def write_bundle(inventory: dict[str, Any], evidence: list[dict[str, Any]]) -> None:
    BUNDLE.mkdir(parents=True, exist_ok=True)
    (BUNDLE / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with (BUNDLE / "evidence.jsonl").open("w", encoding="utf-8") as handle:
        for row in evidence:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n")


if __name__ == "__main__":
    write_bundle(*build_bundle())
    print("SCF-B-0110 bundle generated")
