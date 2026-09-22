#!/usr/bin/env python3
"""Generate the research-only cross-cutting phase review for 20 fixed-BASE units.

All historical material is read as Git object bytes. No legacy source, test,
runtime, hook, CI, workflow, or adapter is executed.
"""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
BASE = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
BINDING_ID = "SCF-B-0116"
SCHEMA = "phase-cross-20-review-0116/v1"
PARENT = "scaffold/legacy-phase-gap-review-0101"
CROSSWALK = "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
IR = "archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json"
DECOMP = "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
CLASSIFICATION = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
CLASSIFICATION_META = "docs/governance/legacy-asset-phase-product-classification-bootstrap.meta.json"
PHCAP = "docs/governance/phase-capability-inventory.json"
PHCAP_MD = "docs/governance/phase-capability-inventory.md"
PHCAP20_README = "scaffold/phcap20-memory-research/README.md"
PHCAP20_INVENTORY = "scaffold/phcap20-memory-research/inventory.json"
PHASE_METHOD = "docs/governance/audits/source-rebaseline/legacy-phase-product-classification-method-2026-09-20.md"

TARGET_UNIT_IDS = [
    "IRUNIT-HIL-FR-21-HELIX-OS", "IRUNIT-HIL-FR-23-HELIX-OS",
    "IRUNIT-HIL-FR-33-HELIX-HARNESS", "IRUNIT-HIL-FR-33-HELIX-OS",
    "IRUNIT-HIL-FR-46-HELIX-OS", "IRUNIT-HIL-FR-52-HELIX-OS",
    "IRUNIT-HIL-FR-53-HELIX-OS", "IRUNIT-HIL-NFR-02-HELIX-HARNESS",
    "IRUNIT-HIL-NFR-03-HELIX-HARNESS", "IRUNIT-HIL-NFR-05-HELIX-OS",
    "IRUNIT-HIL-NFR-06-HELIX-OS", "IRUNIT-HIL-NFR-07-HELIX-OS",
    "IRUNIT-HIL-NFR-11-HELIX-OS", "IRUNIT-HIL-NFR-12-HELIX-OS",
    "IRUNIT-HIL-NFR-23-HELIX-OS", "IRUNIT-HIL-NFR-31-HELIX-OS",
    "IRUNIT-HIL-NFR-32-HELIX-OS", "IRUNIT-HIL-TR-04-HELIX-HARNESS",
    "IRUNIT-HIL-TR-04-HELIX-OS", "IRUNIT-HIL-TR-08-HELIX-HARNESS",
]
PHCAP_IDS = [f"PHCAP-{n:02d}" for n in range(1, 21)]
PRODUCTS = {"HELIX-OS": 15, "HELIX-HARNESS": 5}
CONTEXT_INPUTS = [
    "docs/governance/new-generation-start-here.md", "docs/governance/legacy-asset-reuse-control.md",
    "docs/concept/product-boundary.md", "docs/helix-harness/L1-planning/product-intent.md",
    "docs/helix-os/L1-planning/system-intent.md", "docs/helix-web/L1-planning/product-intent.md",
    "docs/helix-web-os/L1-planning/system-intent.md", PHCAP, PHCAP_MD,
    PHCAP20_README, PHCAP20_INVENTORY, PHASE_METHOD,
]
WAVE_PATHS = [*(f"docs/governance/legacy-requirement-direct-semantic-review-wave{i}.jsonl" for i in range(1, 37)), *(f"scaffold/legacy-semantic-review-wave{i}/legacy-requirement-direct-semantic-review-wave{i}.jsonl" for i in range(37, 51))]
INPUT_PATHS = [CROSSWALK, IR, DECOMP, DISPOSITION, DECISIONS, READ_AFTER, CLASSIFICATION, CLASSIFICATION_META, f"{PARENT}/inventory.json", f"{PARENT}/units.jsonl", f"{PARENT}/edges.jsonl", *WAVE_PATHS, *CONTEXT_INPUTS]
NEGATIVE_CASE_CODES = [
    "E_BUNDLE", "E_SCHEMA", "E_BINDING", "E_BASE_COMMIT", "E_BASE_NOT_ANCESTOR", "E_INPUT_DIGEST",
    "E_UNIT_SET", "E_SOURCE_ANCHOR", "E_WAVE_EDGE_SET", "E_WAVE_EDGE_DUP", "E_ASSET_SET", "E_ASSET_SOURCE",
    "E_ASSET_HISTORY", "E_DECISION_EVIDENCE", "E_FAILURE_EVIDENCE", "E_CONSUMER_EVIDENCE", "E_PHASE_REVIEW",
    "E_PRODUCT_AUTHORITY", "E_CURRENT_CONTEXT", "E_AUTHORITY_BOUNDARY",
]


def base_bytes(path: str) -> bytes:
    result = subprocess.run(["git", "show", f"{BASE}:{path}"], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    if result.returncode != 0:
        raise ValueError(f"missing BASE input: {path}")
    return result.stdout


def base_json(path: str) -> Any:
    return json.loads(base_bytes(path).decode("utf-8"))


def base_jsonl(path: str) -> list[dict[str, Any]]:
    return [json.loads(line) for line in base_bytes(path).decode("utf-8").splitlines() if line.strip()]


def digest(raw: bytes, prefix: bool = True) -> str:
    value = hashlib.sha256(raw).hexdigest()
    return f"sha256:{value}" if prefix else value


def base_blob(path: str) -> str:
    archived = f"archive/legacy-generation-2026-09-14/root/{path}"
    result = subprocess.run(["git", "rev-parse", f"{BASE}:{archived}"], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=False)
    if result.returncode != 0:
        raise ValueError(f"missing BASE archive blob: {archived}")
    return result.stdout.strip()


def by_id(path: str, key: str) -> dict[str, dict[str, Any]]:
    return {row[key]: row for row in base_jsonl(path)}


def source_anchor(requirement_id: str, cross: dict[str, Any], decomposition: dict[str, Any]) -> dict[str, Any]:
    raw = base_bytes(IR)
    lines = raw.splitlines(keepends=True)
    pattern = re.compile(rb'^  "' + re.escape(requirement_id.encode()) + rb'": \{$')
    starts = [i for i, line in enumerate(lines) if pattern.match(line)]
    if len(starts) != 1:
        raise ValueError(f"source anchor count: {requirement_id} {starts}")
    start = starts[0]
    next_start = next((i for i in range(start + 1, len(lines)) if re.match(rb'^  "HIL-[A-Z]+-[0-9]+": \{$', lines[i])), len(lines))
    statement = base_json(IR)[requirement_id]["statement"]["text"]
    return {
        "archive_path": IR, "json_pointer": f"requirements-ir/requirements.json#/{requirement_id}",
        "line_start": start + 1, "line_end": next_start, "span_sha256": digest(b"".join(lines[start:next_start])),
        "file_sha256": digest(raw, prefix=False), "statement_text": statement,
        "statement_text_sha256": digest(statement.encode("utf-8")),
        "statement_semantic_digest": cross.get("source_statement_semantic_digest"),
        "source_text_spans": cross.get("source_text_spans", []),
        "decomposition_statement_text": decomposition.get("statement_text"),
        "decomposition_unit_spans": decomposition.get("source_text_spans", []), "revision": cross.get("source_revision"),
    }


def source_snapshot(old: dict[str, Any], edges: list[dict[str, Any]]) -> dict[str, Any]:
    path = old["source_path"]
    archive_path = f"archive/legacy-generation-2026-09-14/root/{path}"
    raw = base_bytes(archive_path)
    archive_sha = digest(raw, prefix=False)
    return {
        "source_path": path, "archive_path": archive_path, "declared_source_sha256": old["source_sha256"],
        "archive_sha256_at_base": archive_sha, "archive_digest_matches_declaration": archive_sha == old["source_sha256"],
        "git_blob_oid_at_base": base_blob(path), "source_revision": old.get("source_revision"), "source_surface": old.get("source_surface"),
        "artifact_evidence_kinds": sorted({edge.get("artifact_evidence_kind") for edge in edges}), "line_count": len(raw.splitlines()), "static_only": True,
    }


def asset_record(asset_id: str, edges: list[dict[str, Any]], disposition: dict[str, dict[str, Any]], classification: dict[str, dict[str, Any]], decisions: list[dict[str, Any]], read_after: list[dict[str, Any]]) -> dict[str, Any]:
    old = disposition[asset_id]
    phase = classification.get(asset_id)
    asset_edges = [edge for edge in edges if edge.get("asset_id") == asset_id]
    return {
        "asset_id": asset_id,
        "source": source_snapshot(old, asset_edges),
        "history": {"disposition_record": old, "classification_record": phase, "static_only": True},
        "decision_evidence": {"status": "present_at_base" if any(row.get("asset_id") == asset_id for row in decisions) else "absent_at_base", "records": [row for row in decisions if row.get("asset_id") == asset_id], "static_only": True},
        "read_after_evidence": {"status": "present_at_base" if any(row.get("asset_id") == asset_id for row in read_after) else "absent_at_base", "records": [row for row in read_after if row.get("asset_id") == asset_id], "static_only": True},
        "failure": {"edge_records": [{"review_id": edge["review_id"], "coverage_failure": edge.get("failure_finding"), "counterevidence": edge.get("counterevidence", []), "unresolved": edge.get("unresolved", [])} for edge in asset_edges], "observed_failure_status": "unknown", "observed_failure_receipts": [], "static_only": True},
        "consumer": {"classification_closure_status": phase.get("consumer_closure_status") if phase else None, "ledger_consumer_refs": sorted(old.get("consumer_refs", [])), "edge_consumer_refs": sorted({ref for edge in asset_edges for ref in edge.get("observed_consumer_refs", [])}), "edge_evidence_count": sum(edge.get("consumer_evidence_count", 0) for edge in asset_edges), "closure_status": "pending", "explicit_consumer_closure": False, "static_only": True},
        "candidate": {"phase_targets": phase.get("candidate_phase_targets", []) if phase else [], "product_targets": phase.get("candidate_product_targets", []) if phase else [], "authority_effect": phase.get("authority_effect") if phase else None},
        "edge_refs": [edge["review_id"] for edge in asset_edges], "static_only": True, "not_implementation_proof": True,
    }


def current_context() -> list[dict[str, Any]]:
    return [{"path": path, "sha256": digest(base_bytes(path), prefix=False), "status": "context_only", "implementation_claim": False} for path in CONTEXT_INPUTS]


def phase_review(edges: list[dict[str, Any]], assets: list[dict[str, Any]]) -> dict[str, Any]:
    candidates = sorted({phase for asset in assets for phase in asset["candidate"]["phase_targets"]} | {phase for edge in edges for phase in edge.get("candidate_phase_targets", [])})
    direct = sorted({phase for edge in edges for phase in edge.get("phase_candidates", [])})
    return {
        "status": "CROSS_CUTTING_PHASE_REVIEW_PENDING", "candidate_phase_targets": candidates, "direct_phase_candidates_from_edges": direct, "direct_phase_evidence": [],
        "phase_nonapplicability": {"status": "not_proven", "direct_exclusion_evidence": [], "reason": "PHCAP-01〜20全境界の除外を示す直接sourceがなく、PHCAP-20不在だけからphase非適用を導かない"},
        "phcap_boundary_review": {"phase_ids": PHCAP_IDS, "status": "pending_all_20", "basis": "unit原文、Wave候補、PHCAP inventory、PHCAP-20定義を静的照合したが全境界の直接除外は未立証"},
        "candidate_basis": "asset_search_candidates_only; source semantics are cross-cutting research evidence", "formal_phase_candidate": None, "authority_phase_status": "unchanged_unresolved",
        "human_judgment_points": ["全PHCAP-01〜20の直接責務を原文単位で確認するphase authority reviewer", "PHCAP非適用を主張する場合の全境界除外sourceとhuman decision", "product boundary／consumer closure／successorのhuman decision"],
        "unresolved": ["direct_phase_evidence_insufficient", "phase_nonapplicability_not_proven", "all_phcap_boundary_review_pending"],
    }


def build_bundle() -> tuple[dict[str, Any], list[dict[str, Any]]]:
    crosswalk = {row["unit_candidate_id"]: row for row in base_jsonl(CROSSWALK) if row.get("unit_candidate_id") in TARGET_UNIT_IDS}
    if list(crosswalk) != TARGET_UNIT_IDS or len(crosswalk) != 20 or any(row.get("phase_classification_status") != "unresolved" for row in crosswalk.values()):
        raise ValueError("target crosswalk must be exactly 20 unresolved units")
    parent_units = {row["unit_candidate_id"]: row for row in base_jsonl(f"{PARENT}/units.jsonl")}
    parent_edges = {row["review_id"]: row for row in base_jsonl(f"{PARENT}/edges.jsonl")}
    decomposition = {unit["unit_candidate_id"]: (record, unit) for record in base_jsonl(DECOMP) for unit in record.get("candidate_units", [])}
    disposition, classification = by_id(DISPOSITION, "asset_id"), by_id(CLASSIFICATION, "asset_id")
    decisions, read_after = base_jsonl(DECISIONS), base_jsonl(READ_AFTER)
    evidence: list[dict[str, Any]] = []
    all_edges: list[dict[str, Any]] = []
    unique_assets: set[str] = set()
    for unit_id in TARGET_UNIT_IDS:
        parent, cross = parent_units[unit_id], crosswalk[unit_id]
        decomp_record, decomp_unit = decomposition[unit_id]
        edges = [parent_edges[ref] for ref in parent["wave_review"]["edge_refs"]]
        all_edges.extend(edges)
        asset_ids = sorted({edge["asset_id"] for edge in edges})
        unique_assets.update(asset_ids)
        assets = [asset_record(asset_id, edges, disposition, classification, decisions, read_after) for asset_id in asset_ids]
        representatives = [item.get("asset_id") for item in cross.get("representative_legacy_assets", []) if item.get("asset_id") in asset_ids][:3] or asset_ids[:3]
        evidence.append({
            "schema": SCHEMA + "/unit", "unit_candidate_id": unit_id,
            "source_requirement": {"crosswalk_id": cross["crosswalk_id"], "requirement_id": cross["source_requirement_id"], "unit_candidate_id": unit_id, "product_scope": cross.get("product_scope", []), "responsibility_summary": cross.get("responsibility_summary"), "phase_classification_status": cross.get("phase_classification_status"), "decomposition_id": decomp_record.get("decomposition_id"), "decomposition_unit": decomp_unit},
            "source_anchor": source_anchor(cross["source_requirement_id"], cross, {"statement_text": decomp_record.get("statement_text"), **decomp_unit}),
            "semantic_review_edges": edges, "asset_set": {"asset_ids": asset_ids, "count": len(asset_ids), "edge_asset_membership": {asset_id: [edge["review_id"] for edge in edges if edge["asset_id"] == asset_id] for asset_id in asset_ids}},
            "old_asset_evidence": {"assets": assets, "static_only": True, "not_implementation_proof": True},
            "implementation_evidence": {"status": "static_candidate_partition", "unit_implementation_status": "unknown", "explicit_implementation_claim": False, "records": [{"review_id": edge["review_id"], "asset_id": edge["asset_id"], "artifact_evidence_kind": edge.get("artifact_evidence_kind"), "source_path": edge.get("source_path"), "static_only": True} for edge in edges], "legacy_execution_performed": False, "current_implementation_status": "unknown"},
            "degradation_evidence": {"status": "static_transition_and_constraint_partition", "unit_degradation_status": "unknown", "explicit_degradation_claim": False, "phase_transition_evidence": cross.get("phase_capability_evidence", []), "edge_constraint_evidence": [{"review_id": edge["review_id"], "coverage_constraint": edge.get("coverage_constraint"), "static_only": True} for edge in edges], "legacy_execution_performed": False},
            "failure_evidence": {"status": "static_failure_finding_partition", "unit_failure_status": "unknown", "explicit_failure_claim": False, "observed_failure_status": "unknown", "observed_failure_receipts": [], "records": [{"review_id": edge["review_id"], "asset_id": edge["asset_id"], "failure_finding": edge.get("failure_finding"), "counterevidence": edge.get("counterevidence", []), "unresolved": edge.get("unresolved", []), "static_only": True} for edge in edges], "legacy_execution_performed": False},
            "consumer_evidence": {"status": "static_consumer_reference_partition", "closure_status": "pending", "explicit_consumer_closure": False, "records": [{"review_id": edge["review_id"], "observed_consumer_refs": edge.get("observed_consumer_refs", []), "consumer_closure_status": edge.get("consumer_closure_status"), "consumer_evidence_count": edge.get("consumer_evidence_count", 0), "static_only": True} for edge in edges], "asset_ids_with_decision_or_read_after": sorted(asset["asset_id"] for asset in assets if asset["decision_evidence"]["records"] or asset["read_after_evidence"]["records"]), "ledger_consumer_refs": sorted({ref for asset in assets for ref in asset["consumer"]["ledger_consumer_refs"]})},
            "representative_assets": {"selection_rule": "crosswalk_representative_intersection_first_three_or_sorted_first_three", "representative_asset_ids": representatives, "records": [next(asset for asset in assets if asset["asset_id"] == aid) for aid in representatives], "static_only": True, "not_implementation_proof": True},
            "phase_review": phase_review(edges, assets), "product_review": {"candidate_products": sorted(set(cross.get("product_scope", [])) | {p for asset in assets for p in asset["candidate"]["product_targets"]}), "product_scope_candidate": cross.get("product_scope", []), "authority_product": None, "status": "candidate_scope_only", "human_decision_required": True},
            "current_context": current_context(), "current_implementation": {"status": "unknown", "acceptance_status": "unknown", "operation_status": "unknown", "execution_performed": False, "explicit_claim": False}, "unimplemented_assessment": {"status": "not_assessed", "explicit_non_implementation_claim": False, "reason": "static source／asset／Wave evidence cannot prove unit-level non-implementation"},
            "authority_boundary": {"formal_phase_authority": False, "formal_product_authority": False, "formal_implementation_acceptance": False, "successor_assignment": False, "consumer_closure": False, "new_build": False}, "unresolved": ["phase_direct_evidence_insufficient", "phase_nonapplicability_not_proven", "all_phcap_boundary_review_pending", "legacy_implementation_status_unknown", "degradation_status_unknown", "failure_status_unknown", "consumer_closure_pending", "human_product_authority_decision_pending"],
        })
    if len(all_edges) != 40 or len(unique_assets) != 22:
        raise ValueError(f"expected 40 edges/22 assets, got {len(all_edges)}/{len(unique_assets)}")
    scan_count = sum(len(base_jsonl(path)) for path in WAVE_PATHS)
    inventory = {
        "schema": SCHEMA, "binding_id": BINDING_ID, "status": "research_only_scaffold_candidate", "authority_effect": "none", "new_build": False, "base": {"repository": "HELIX-HARNESS", "commit": BASE, "branch": "main", "required_ancestor": BASE},
        "scope": {"unit_count": 20, "target_unit_ids": TARGET_UNIT_IDS, "product_counts": PRODUCTS, "wave_range": [1, 50], "wave_scan_file_count": 50, "wave_scan_row_count": scan_count, "semantic_review_edge_count": 40, "unique_old_asset_count": 22, "direct_phase_candidate_count": 0, "phase_nonapplicability_proven": 0, "formal_product_authority_count": 0},
        "input_snapshot": [{"path": path, "sha256": digest(base_bytes(path), prefix=False)} for path in INPUT_PATHS], "counts": {"units": 20, "helix_os_units": 15, "helix_harness_units": 5, "semantic_review_edges": 40, "unique_old_assets": 22, "decision_records_for_assets": sum(bool(asset["decision_evidence"]["records"]) for row in evidence for asset in row["old_asset_evidence"]["assets"]), "read_after_records_for_assets": sum(bool(asset["read_after_evidence"]["records"]) for row in evidence for asset in row["old_asset_evidence"]["assets"]), "failure_receipts": 0, "consumer_closures": 0},
        "unit_ids": TARGET_UNIT_IDS, "unit_declarations": [{"unit_candidate_id": row["unit_candidate_id"], "requirement_id": row["source_requirement"]["requirement_id"], "crosswalk_id": row["source_requirement"]["crosswalk_id"], "product_scope": row["product_review"]["product_scope_candidate"], "edge_count": len(row["semantic_review_edges"]), "asset_count": row["asset_set"]["count"], "candidate_phase_count": len(row["phase_review"]["candidate_phase_targets"]), "direct_phase_count": len(row["phase_review"]["direct_phase_candidates_from_edges"]), "phase_na_status": row["phase_review"]["phase_nonapplicability"]["status"], "authority_product": None} for row in evidence],
        "partition_contract": {"source": "fixed BASE source anchor and archive bytes; static only", "history": "disposition/classification/decision/read-after records; no judgment completion", "failure": "coverage/counterevidence/unresolved only; failure receipts remain empty", "consumer": "ledger/edge refs only; closure remains pending", "phase": "asset phase targets are candidates; direct phase and phase non-applicability remain unresolved"},
        "negative_case_codes": NEGATIVE_CASE_CODES, "prohibited_inference": ["asset candidate phase targets do not establish formal phase", "horizontal source semantics do not prove phase non-applicability across PHCAP-01..20", "source presence or implementation_source does not establish implementation", "failure/counterevidence does not establish executed failure", "decision/read-after/consumer refs do not establish consumer closure", "validator PASS does not promote phase/product authority or successor"],
        "authority_boundary": {"formal_crosswalk_modified": False, "formal_phase_authority_modified": False, "formal_product_authority_modified": False, "implementation_claim_generated": False, "unimplemented_claim_generated": False, "degradation_claim_generated": False, "failure_receipt_generated": False, "consumer_closure_generated": False, "old_archive_executed": False},
    }
    return inventory, evidence


def write_bundle(inventory: dict[str, Any], evidence: list[dict[str, Any]]) -> None:
    (HERE / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with (HERE / "evidence.jsonl").open("w", encoding="utf-8") as handle:
        for row in evidence:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n")


if __name__ == "__main__":
    write_bundle(*build_bundle())
    print("SCF-B-0116 bundle generated: 20 units, 40 edges, 22 assets")
