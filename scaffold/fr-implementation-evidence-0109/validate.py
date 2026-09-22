#!/usr/bin/env python3
"""SCF-B-0109 fixed-BASE fail-closed validator.

This file deliberately contains an independent fixed-BASE rederivation. It does
not import build.py, so changing the generator and regenerating the bundle cannot
change the validator oracle. Legacy bytes are read with git show only; no legacy
source, test, runtime, hook, CI, or workflow is executed.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any


BUNDLE = Path(__file__).resolve().parent
HERE = BUNDLE
ROOT = BUNDLE.parents[1]
BASE = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
BINDING_ID = "SCF-B-0109"
SCHEMA = "fr-implementation-evidence-0109/v1"
EXPECTED_UNIT_SCHEMA = SCHEMA + "/unit"
EXPECTED_BASE = {
    "repository": "HELIX-HARNESS",
    "commit": BASE,
    "branch": "main",
    "required_ancestor": BASE,
}
EXPECTED_CURRENT_IMPLEMENTATION = {
    "status": "unknown",
    "execution_performed": False,
    "acceptance_status": "unknown",
    "operation_status": "unknown",
    "explicit_claim": False,
}
EXPECTED_UNIMPLEMENTED_ASSESSMENT = {
    "status": "not_assessed",
    "explicit_non_implementation_claim": False,
    "reason": "静的候補・review edge・source/historyだけではunitの未実装を導けない",
}
CROSSWALK = "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
IR = "archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json"
DECOMP = "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
CLASSIFICATION = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
CLASSIFICATION_META = "docs/governance/legacy-asset-phase-product-classification-bootstrap.meta.json"

SOURCE_IDS = [f"HIL-FR-{n:02d}" for n in range(1, 21)]
UNIT_PATTERN = re.compile(r"^IRUNIT-HIL-FR-(0[1-9]|1[0-9]|20)-HELIX-(OS|HARNESS)$")
PRODUCTS = ("HELIX-OS", "HELIX-HARNESS")
CONTEXT_INPUTS = [
    "docs/governance/new-generation-start-here.md",
    "docs/governance/legacy-asset-reuse-control.md",
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


def git_blob(path: str) -> str:
    archived = f"archive/legacy-generation-2026-09-14/root/{path}"
    return subprocess.check_output(["git", "rev-parse", f"{BASE}:{archived}"], cwd=ROOT, text=True).strip()


def jsonl_by_id(path: str, key: str) -> dict[str, dict[str, Any]]:
    return {row[key]: row for row in base_jsonl(path)}


def target_crosswalk() -> list[dict[str, Any]]:
    rows = [row for row in base_jsonl(CROSSWALK) if row.get("source_requirement_id") in SOURCE_IDS]
    if len(rows) != 29 or any(not UNIT_PATTERN.fullmatch(row.get("unit_candidate_id", "")) for row in rows):
        raise ValueError("HIL-FR-01〜20の製品unit集合が29件のFR専用集合ではない")
    if any("HIL-BR-" in row.get("unit_candidate_id", "") for row in rows):
        raise ValueError("BR unitがFR bundleへ混入した")
    if len({row["unit_candidate_id"] for row in rows}) != 29:
        raise ValueError("FR unitが重複している")
    return rows


def source_range(requirement_id: str) -> dict[str, Any]:
    raw = base_bytes(IR)
    ir_record = base_json(IR)[requirement_id]
    statement = ir_record.get("statement", {})
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
        "source_statement_text": statement.get("text"),
        "source_statement_semantic_digest": statement.get("semantic_digest"),
    }


def compact_edge(row: dict[str, Any], wave: int, source_file: str) -> dict[str, Any]:
    result = {key: row[key] for key in sorted(row)}
    result["wave"] = wave
    result["source_review_file"] = source_file
    return result


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
            "schema": SCHEMA + "/unit",
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
        "base": {"repository": "HELIX-HARNESS", "commit": BASE, "branch": "main", "required_ancestor": BASE},
        "scope": {
            "source_requirement_ids": SOURCE_IDS,
            "unit_count": 29,
            "product_counts": {"HELIX-OS": counts["helix_os_units"], "HELIX-HARNESS": counts["helix_harness_units"]},
            "wave_range": [1, 50],
            "semantic_review_scan_files": scan_files,
            "semantic_review_scan_row_count": scan_count,
            "semantic_review_edge_count": total_edges,
            "unique_old_asset_count": len(unique_assets),
            "br_units_included": 0,
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
        "negative_case_codes": [
            "E_UNIT_SET", "E_REVIEW_EDGE_SET", "E_REVIEW_EDGE_DUP", "E_ASSET_SET", "E_INVENTORY_DECLARATION",
            "E_REPRESENTATIVE_ASSET", "E_IMPLEMENTATION_EVIDENCE", "E_DEGRADATION_EVIDENCE", "E_FAILURE_EVIDENCE",
            "E_CONSUMER_EVIDENCE", "E_SOURCE_ANCHOR", "E_OLD_ASSET_SOURCE", "E_OLD_ASSET_HISTORY", "E_INPUT_DIGEST", "E_BASE_COMMIT",
            "E_BASE_NOT_ANCESTOR", "E_AUTHORITY_BOUNDARY", "E_CURRENT_STATUS", "E_UNIMPLEMENTED_CLAIM",
        ],
        "prohibited_inference": [
            "candidate_asset_pool、旧source存在、Wave edge、phase transition、coverage.failure、validator PASSから実装成立を導かない",
            "証拠欠落やunknownから未実装を断定しない",
            "degradation/failureの静的partitionから実行failureを導かない",
            "consumer refs、decision、read-afterからconsumer closureを導かない",
            "phase/product candidateから正式authority・successor・current acceptanceを生成しない",
        ],
    }
    return inventory, evidence



class Validator:
    def __init__(self, root: Path = ROOT, bundle: Path = HERE):
        self.root = root.resolve()
        self.bundle = bundle.resolve()
        self.errors: list[str] = []

    def error(self, code: str, message: str) -> None:
        self.errors.append(f"{code}: {message}")

    def load(self) -> tuple[dict[str, Any], list[dict[str, Any]]] | None:
        try:
            inventory = json.loads((self.bundle / "inventory.json").read_text(encoding="utf-8"))
            evidence = [json.loads(line) for line in (self.bundle / "evidence.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
            return inventory, evidence
        except (OSError, json.JSONDecodeError) as exc:
            self.error("E_BUNDLE", str(exc))
            return None

    def validate(self) -> int:
        loaded = self.load()
        if loaded is None:
            return self.finish()
        inventory, evidence = loaded
        try:
            expected_inventory, expected_evidence = build_bundle()
        except Exception as exc:  # fixed BASE input failure is itself a validation failure
            self.error("E_INPUT", repr(exc))
            return self.finish()

        if inventory.get("schema") != SCHEMA or inventory.get("binding_id") != BINDING_ID:
            self.error("E_INVENTORY_DECLARATION", "schema/bindingがSCF-B-0109と一致しない")
        base = inventory.get("base", {})
        if base != EXPECTED_BASE:
            self.error("E_BASE_COMMIT", "固定BASEのrepository/commit/branch宣言が一致しない")
        required_ancestor = base.get("required_ancestor") or BASE
        if subprocess.run(
            ["git", "merge-base", "--is-ancestor", required_ancestor, "HEAD"],
            cwd=self.root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        ).returncode != 0:
            self.error("E_BASE_NOT_ANCESTOR", f"required ancestorがHEADの祖先ではない: {required_ancestor}")
        if inventory.get("status") != "research_only_scaffold_candidate" or inventory.get("authority_effect") != "none" or inventory.get("new_build") is not False:
            self.error("E_AUTHORITY_BOUNDARY", "research-only/new_build/authority boundaryが壊れている")

        expected_units = expected_inventory["unit_ids"]
        actual_units = inventory.get("unit_ids")
        if actual_units != expected_units or [row.get("unit_candidate_id") for row in evidence] != expected_units:
            self.error("E_UNIT_SET", "FR01〜20の29 unitの順序・分母・重複が期待値と異なる")
        if len(evidence) != 29 or len({row.get("unit_candidate_id") for row in evidence}) != 29:
            self.error("E_UNIT_SET", "unitが欠落または重複している")
        if any("HIL-BR-" in str(row.get("unit_candidate_id")) for row in evidence):
            self.error("E_UNIT_SET", "BR unitがFR bundleへ混入している")

        self.check_input_snapshot(inventory, expected_inventory)
        self.check_inventory(inventory, expected_inventory)

        expected_by_unit = {row["unit_candidate_id"]: row for row in expected_evidence}
        actual_by_unit = {row.get("unit_candidate_id"): row for row in evidence}
        all_actual_edges: dict[str, str] = {}
        all_expected_edges: dict[str, str] = {
            edge["review_id"]: row["unit_candidate_id"]
            for row in expected_evidence
            for edge in row["semantic_review_edges"]
        }
        for actual in evidence:
            unit = actual.get("unit_candidate_id")
            expected = expected_by_unit.get(unit)
            if expected is None:
                continue
            self.check_unit(actual, expected)
            for edge in actual.get("semantic_review_edges", []):
                review_id = edge.get("review_id")
                if review_id in all_actual_edges:
                    self.error("E_REVIEW_EDGE_DUP", f"review edge重複: {review_id}")
                all_actual_edges[review_id] = unit
        if set(all_actual_edges) != set(all_expected_edges):
            self.error("E_REVIEW_EDGE_SET", f"Wave edge集合が不一致: actual={len(all_actual_edges)} expected={len(all_expected_edges)}")
        if len(all_actual_edges) != 87:
            self.error("E_REVIEW_EDGE_SET", f"Wave edge分母が{len(all_actual_edges)}（期待87）")

        return self.finish()

    def check_input_snapshot(self, actual: dict[str, Any], expected: dict[str, Any]) -> None:
        expected_snapshot = expected.get("input_snapshot", [])
        if actual.get("input_snapshot") != expected_snapshot:
            self.error("E_INPUT_DIGEST", "固定BASE入力snapshotのpath/digest/orderが一致しない")
        for item in actual.get("input_snapshot", []):
            path = item.get("path")
            if not isinstance(path, str):
                self.error("E_INPUT_DIGEST", "入力pathが文字列ではない")
                continue
            try:
                actual_digest = base_digest(path)
            except Exception:
                self.error("E_INPUT_DIGEST", f"BASE入力pathを読めない: {path}")
                continue
            if item.get("sha256") != actual_digest:
                self.error("E_INPUT_DIGEST", f"BASE入力digest不一致: {path}")

    def check_inventory(self, actual: dict[str, Any], expected: dict[str, Any]) -> None:
        if set(actual) != set(expected):
            self.error("E_INVENTORY_DECLARATION", "inventoryトップレベルkey集合が再計算値と一致しない")
        for key in ("base", "scope", "counts", "unit_ids", "unit_declarations", "negative_case_codes"):
            if actual.get(key) != expected.get(key):
                self.error("E_INVENTORY_DECLARATION", f"inventory.{key}が再計算値と一致しない")
        if actual.get("partition_contract") != expected.get("partition_contract"):
            self.error("E_INVENTORY_DECLARATION", "partition contractが一致しない")
        if actual.get("prohibited_inference") != expected.get("prohibited_inference"):
            self.error("E_AUTHORITY_BOUNDARY", "prohibited inferenceが一致しない")

    def check_unit(self, actual: dict[str, Any], expected: dict[str, Any]) -> None:
        unit = expected["unit_candidate_id"]
        if set(actual) != set(expected):
            self.error("E_INVENTORY_DECLARATION", f"{unit} evidenceトップレベルkey集合が再計算値と一致しない")
        if actual.get("schema") != EXPECTED_UNIT_SCHEMA or actual.get("schema") != expected.get("schema"):
            self.error("E_INVENTORY_DECLARATION", f"{unit} schema不一致")
        if actual.get("source_requirement") != expected.get("source_requirement"):
            self.error("E_SOURCE_BINDING", f"{unit} source/crosswalk/decomposition snapshot不一致")
        if actual.get("source_anchor") != expected.get("source_anchor"):
            self.error("E_SOURCE_ANCHOR", f"{unit} IR原文anchor/digest不一致")

        actual_edges = actual.get("semantic_review_edges", [])
        expected_edges = expected.get("semantic_review_edges", [])
        if [edge.get("review_id") for edge in actual_edges] != [edge.get("review_id") for edge in expected_edges]:
            self.error("E_REVIEW_EDGE_SET", f"{unit} edge順序・集合不一致")
        for actual_edge, expected_edge in zip(actual_edges, expected_edges):
            if actual_edge != expected_edge:
                self.error("E_REVIEW_EDGE_SET", f"{unit} review edge bytes不一致: {actual_edge.get('review_id')}")

        if actual.get("asset_set") != expected.get("asset_set"):
            self.error("E_ASSET_SET", f"{unit} asset set/edge membership不一致")
        actual_old = actual.get("old_asset_evidence", {}).get("assets", [])
        expected_old = expected.get("old_asset_evidence", {}).get("assets", [])
        if [row.get("asset_id") for row in actual_old] != [row.get("asset_id") for row in expected_old]:
            self.error("E_ASSET_SET", f"{unit} old asset集合不一致")
        for actual_asset, expected_asset in zip(actual_old, expected_old):
            if actual_asset.get("source") != expected_asset.get("source"):
                self.error("E_OLD_ASSET_SOURCE", f"{unit}/{actual_asset.get('asset_id')} source/blob不一致")
            if actual_asset.get("history") != expected_asset.get("history"):
                self.error("E_OLD_ASSET_HISTORY", f"{unit}/{actual_asset.get('asset_id')} history/classification不一致")
            if actual_asset.get("failure") != expected_asset.get("failure") or actual_asset.get("consumer") != expected_asset.get("consumer"):
                self.error("E_OLD_ASSET_HISTORY", f"{unit}/{actual_asset.get('asset_id')} failure/consumer history不一致")
            if actual_asset != expected_asset and actual_asset.get("source") == expected_asset.get("source") and actual_asset.get("history") == expected_asset.get("history"):
                self.error("E_OLD_ASSET_HISTORY", f"{unit}/{actual_asset.get('asset_id')} asset record不一致")
        if actual.get("old_asset_evidence", {}).get("static_only") is not True or actual.get("old_asset_evidence", {}).get("not_implementation_proof") is not True:
            self.error("E_AUTHORITY_BOUNDARY", f"{unit} old asset boundaryが壊れている")
        if actual.get("old_asset_evidence") != expected.get("old_asset_evidence"):
            self.error("E_OLD_ASSET_HISTORY", f"{unit} old_asset_evidence全体が再計算値と一致しない")

        if actual.get("representative_assets") != expected.get("representative_assets"):
            self.error("E_REPRESENTATIVE_ASSET", f"{unit} representative asset record/subset不一致")
        for key, code in (
            ("implementation_evidence", "E_IMPLEMENTATION_EVIDENCE"),
            ("degradation_evidence", "E_DEGRADATION_EVIDENCE"),
            ("failure_evidence", "E_FAILURE_EVIDENCE"),
            ("consumer_evidence", "E_CONSUMER_EVIDENCE"),
        ):
            if actual.get(key) != expected.get(key):
                self.error(code, f"{unit} {key} partitionが再計算値と一致しない")

        implementation = actual.get("implementation_evidence")
        if (
            not isinstance(implementation, dict)
            or implementation.get("unit_implementation_status") != "unknown"
            or implementation.get("explicit_implementation_claim") is not False
            or implementation.get("current_implementation_status") != "unknown"
        ):
            self.error("E_IMPLEMENTATION_EVIDENCE", f"{unit} implementation status pinが壊れている")
        degradation = actual.get("degradation_evidence")
        if (
            not isinstance(degradation, dict)
            or degradation.get("unit_degradation_status") != "unknown"
            or degradation.get("explicit_degradation_claim") is not False
        ):
            self.error("E_DEGRADATION_EVIDENCE", f"{unit} degradation status pinが壊れている")
        failure = actual.get("failure_evidence")
        if (
            not isinstance(failure, dict)
            or failure.get("unit_failure_status") != "unknown"
            or failure.get("observed_failure_status") != "unknown"
            or failure.get("observed_failure_receipts") != []
            or failure.get("explicit_failure_claim") is not False
        ):
            self.error("E_FAILURE_EVIDENCE", f"{unit} failure status pinが壊れている")
        consumer = actual.get("consumer_evidence")
        if (
            not isinstance(consumer, dict)
            or consumer.get("closure_status") != "pending"
            or consumer.get("explicit_consumer_closure") is not False
        ):
            self.error("E_CONSUMER_EVIDENCE", f"{unit} consumer closure status pinが壊れている")

        current = actual.get("current_implementation_evidence")
        if current != EXPECTED_CURRENT_IMPLEMENTATION or current != expected.get("current_implementation_evidence"):
            self.error("E_CURRENT_STATUS", f"{unit} current implementation/operation/acceptanceがunknownではない")
        unimplemented = actual.get("unimplemented_assessment")
        if unimplemented != EXPECTED_UNIMPLEMENTED_ASSESSMENT or unimplemented != expected.get("unimplemented_assessment"):
            self.error("E_UNIMPLEMENTED_CLAIM", f"{unit} 未実装断定が混入している")
        if actual.get("authority_boundary") != expected.get("authority_boundary"):
            self.error("E_AUTHORITY_BOUNDARY", f"{unit} formal authority boundaryが壊れている")
        if actual.get("current_context") != expected.get("current_context"):
            self.error("E_CURRENT_STATUS", f"{unit} current context/refのstatusまたはimplementation_claimが壊れている")
        if actual.get("unresolved") != expected.get("unresolved"):
            self.error("E_AUTHORITY_BOUNDARY", f"{unit} unresolved保留理由が一致しない")

    def finish(self) -> int:
        if self.errors:
            for error in self.errors:
                print(error, file=sys.stderr)
            return 1
        print("SCF-B-0109 validate PASS")
        return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--bundle", type=Path, default=HERE)
    args = parser.parse_args()
    return Validator(args.root, args.bundle).validate()


if __name__ == "__main__":
    raise SystemExit(main())
