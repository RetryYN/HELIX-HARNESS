#!/usr/bin/env python3
"""Fail-closed static validator for SCF-B-0101."""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_ROOT = HERE.parents[1]
WAVE_REL = [
    *(f"docs/governance/legacy-requirement-direct-semantic-review-wave{i}.jsonl" for i in range(1, 37)),
    *(f"scaffold/legacy-semantic-review-wave{i}/legacy-requirement-direct-semantic-review-wave{i}.jsonl" for i in range(37, 51)),
]
EXPECTED_PRODUCTS = {"HELIX-OS": 24, "HELIX-HARNESS": 6}


def dig(value: bytes) -> str:
    return "sha256:" + hashlib.sha256(value).hexdigest()


def jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def wave_number(path: str) -> int:
    return int(re.search(r"wave(\d+)", path).group(1))


def source_range(requirement_id: str, lines: list[str]) -> tuple[int, int] | None:
    starts = [index + 1 for index, line in enumerate(lines) if re.match(rf'^  "{re.escape(requirement_id)}": \{{$', line)]
    if len(starts) != 1:
        return None
    start = starts[0]
    next_starts = [index + 1 for index in range(start, len(lines)) if re.match(r'^  "HIL-[A-Z]+-[0-9]+": \{$', lines[index])]
    return start, (next_starts[0] - 1 if next_starts else len(lines))


def error(errors: list[str], code: str, detail: str = "") -> None:
    errors.append(code + (":" + detail if detail else ""))


def compact_edge(row: dict, rel: str) -> dict:
    evidence = []
    for item in row.get("evidence_refs", []):
        evidence.append({
            "archive_path": item.get("archive_path"), "artifact_role": item.get("artifact_role"),
            "evidence_ref_id": item.get("evidence_ref_id"), "excerpt_sha256": item.get("excerpt_sha256"),
            "excerpt_status": item.get("excerpt_status"), "line_start": item.get("line_start"),
            "line_end": item.get("line_end"), "source_requirement_relation": item.get("source_requirement_relation"),
        })
    coverage = row.get("coverage") or {}
    return {
        "wave": wave_number(rel), "ledger_path": rel, "review_id": row.get("review_id"),
        "asset_id": row.get("asset_id"), "artifact_evidence_kind": row.get("artifact_evidence_kind"),
        "classification_id": row.get("classification_id"), "batch_id": row.get("batch_id"),
        "selection_route": row.get("selection_route"), "semantic_link_status": row.get("semantic_link_status"),
        "semantic_relation": row.get("semantic_relation"), "source_path": row.get("source_path"),
        "source_sha256": row.get("source_sha256"), "source_requirement_id": row.get("source_requirement_id"),
        "source_statement_semantic_digest": row.get("source_statement_semantic_digest"),
        "source_text_spans": row.get("source_text_spans", []), "evidence_refs": evidence,
        "candidate_phase_targets": row.get("candidate_phase_targets", []),
        "candidate_product_targets": row.get("candidate_product_targets", []),
        "phase_candidates": row.get("phase_candidates", []), "product_scope": row.get("product_scope", []),
        "phase_authority_status": row.get("phase_authority_status"),
        "legacy_asset_evidence_state": row.get("legacy_asset_evidence_state"),
        "legacy_implementation_status": row.get("catalog_legacy_implementation_status", row.get("legacy_implementation_status")),
        "legacy_execution_status": row.get("legacy_execution_status"),
        "current_requirement_implementation_status": row.get("current_requirement_implementation_status"),
        "consumer_closure_status": row.get("consumer_closure_status"),
        "consumer_evidence_count": len(row.get("consumer_closure_evidence", [])),
        "observed_consumer_refs": row.get("observed_consumer_refs", []),
        "counterevidence": row.get("counterevidence", []), "failure_finding": coverage.get("failure"),
        "coverage_constraint": coverage.get("constraint"), "unresolved": row.get("unresolved", []),
    }


def validate(bundle: Path = HERE, root: Path = DEFAULT_ROOT) -> list[str]:
    errors: list[str] = []
    try:
        inventory = json.loads((bundle / "inventory.json").read_text(encoding="utf-8"))
        units = jsonl(bundle / "units.jsonl")
        recorded_edges = jsonl(bundle / "edges.jsonl")
    except Exception as exc:
        return ["E_BUNDLE_READ:" + str(exc)]

    if inventory.get("schema") != "legacy-phase-gap-review-0101/v1": error(errors, "E_SCHEMA")
    if inventory.get("binding_id") != "SCF-B-0101": error(errors, "E_BINDING_ID")
    if inventory.get("authority_effect") != "none": error(errors, "E_AUTHORITY")
    boundary = inventory.get("authority_boundary", {})
    for key in ("formal_crosswalk_modified", "formal_phase_authority_modified", "formal_product_authority_modified",
                "successor_assignment_generated", "implementation_claim_generated", "consumer_closure_generated", "old_archive_executed"):
        if boundary.get(key) is not False: error(errors, "E_AUTHORITY_BOUNDARY", key)

    cross_path = root / "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
    crosswalk = jsonl(cross_path)
    targets = [row for row in crosswalk if row.get("phase_classification_status") == "unresolved"]
    expected_ids = [row.get("unit_candidate_id") for row in targets]
    target_map = {row.get("unit_candidate_id"): row for row in targets}
    if len(targets) != 30 or len(set(expected_ids)) != 30: error(errors, "E_TARGET_INPUT_SET")
    unit_ids = [row.get("unit_candidate_id") for row in units]
    if len(units) != 30 or len(unit_ids) != len(set(unit_ids)) or set(unit_ids) != set(expected_ids): error(errors, "E_TARGET_SET")
    if inventory.get("scope", {}).get("unresolved_unit_count") != 30: error(errors, "E_TARGET_COUNT")
    product_counts = {product: sum(row.get("product_scope", []) == [product] for row in targets) for product in EXPECTED_PRODUCTS}
    if product_counts != EXPECTED_PRODUCTS or inventory.get("scope", {}).get("target_product_counts") != EXPECTED_PRODUCTS:
        error(errors, "E_PRODUCT_COUNTS")

    ir_path = root / "archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json"
    ir = json.loads(ir_path.read_text(encoding="utf-8"))
    ir_lines = ir_path.read_text(encoding="utf-8").splitlines()
    decomposition = {
        unit["unit_candidate_id"]: (record, unit)
        for record in jsonl(root / "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl")
        for unit in record.get("candidate_units", [])
        if unit.get("unit_candidate_id") in target_map
    }
    disposition = {row["asset_id"]: row for row in jsonl(root / "docs/governance/legacy-asset-disposition.jsonl")}
    classification = {row["asset_id"]: row for row in jsonl(root / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl")}

    canonical_edges: list[dict] = []
    edges_by_unit: dict[str, list[dict]] = {unit_id: [] for unit_id in expected_ids}
    all_wave_edges = []
    for rel in WAVE_REL:
        path = root / rel
        if not path.is_file():
            error(errors, "E_WAVE_INPUT", rel)
            continue
        for row in jsonl(path):
            all_wave_edges.append(row)
            if row.get("unit_candidate_id") in edges_by_unit:
                edge = compact_edge(row, rel)
                canonical_edges.append(edge)
                edges_by_unit[row["unit_candidate_id"]].append(edge)
    canonical_edges.sort(key=lambda edge: edge["review_id"])
    recorded_edges_sorted = sorted(recorded_edges, key=lambda edge: edge.get("review_id", ""))
    if len(all_wave_edges) != 598 or len({row.get("unit_candidate_id") for row in all_wave_edges}) != 218:
        error(errors, "E_WAVE_DENOMINATOR")
    if len(canonical_edges) != 66: error(errors, "E_WAVE_TARGET_COUNT")
    if recorded_edges_sorted != canonical_edges: error(errors, "E_WAVE_EDGE_COVERAGE")
    if inventory.get("wave_review", {}).get("target_edge_count") != 66: error(errors, "E_WAVE_TARGET_COUNT")
    expected_status_counts = {status: sum(edge.get("semantic_link_status") == status for edge in canonical_edges) for status in ("confirmed", "unresolved", "rejected")}
    if inventory.get("wave_review", {}).get("target_edge_status_counts") != expected_status_counts: error(errors, "E_WAVE_STATUS_COUNTS")

    if not recorded_edges_sorted:
        error(errors, "E_WAVE_EDGE_COVERAGE")
    edge_by_id = {edge["review_id"]: edge for edge in canonical_edges}
    for unit in units:
        unit_id = unit.get("unit_candidate_id")
        original = target_map.get(unit_id)
        if original is None:
            continue
        req_id = original.get("source_requirement_id")
        requirement = ir.get(req_id)
        if requirement is None: error(errors, "E_SOURCE_ANCHOR", unit_id); continue
        source = unit.get("source", {})
        if source.get("statement_semantic_digest") != original.get("source_statement_semantic_digest"):
            error(errors, "E_SOURCE_DIGEST", unit_id)
        if source.get("statement_semantic_digest") != requirement.get("statement", {}).get("semantic_digest"):
            error(errors, "E_SOURCE_DIGEST", unit_id)
        if source.get("statement_text") != requirement.get("statement", {}).get("text"):
            error(errors, "E_SOURCE_ANCHOR", unit_id)
        if source.get("source_text_spans") != original.get("source_text_spans"):
            error(errors, "E_SOURCE_ANCHOR", unit_id)
        for span in source.get("source_text_spans", []):
            if span not in source.get("statement_text", ""): error(errors, "E_SOURCE_ANCHOR", unit_id)
        expected_range = source_range(req_id, ir_lines)
        if expected_range != (source.get("archive_line_start"), source.get("archive_line_end")):
            error(errors, "E_SOURCE_ANCHOR", unit_id)
        if source.get("json_pointer") != f"requirements-ir/requirements.json#/{req_id}": error(errors, "E_SOURCE_ANCHOR", unit_id)
        if unit.get("phase_classification", {}).get("eligible_phase_candidates") != []:
            error(errors, "E_PHASE_AUTHORITY_SEPARATION", unit_id)
        if unit.get("phase_classification", {}).get("authority_phase_status") != "unchanged_unresolved":
            error(errors, "E_PHASE_AUTHORITY_SEPARATION", unit_id)
        if unit.get("product_classification", {}).get("authority_product") is not None:
            error(errors, "E_PRODUCT_AUTHORITY_SEPARATION", unit_id)
        if unit.get("closure", {}).get("authority_effect") != "none" or unit.get("closure", {}).get("legacy_execution_performed") is not False:
            error(errors, "E_AUTHORITY_BOUNDARY", unit_id)
        expected_unit_edges = edges_by_unit[unit_id]
        if sorted(unit.get("wave_review", {}).get("edge_refs", [])) != sorted(edge["review_id"] for edge in expected_unit_edges):
            error(errors, "E_WAVE_EDGE_COVERAGE", unit_id)
        expected_candidates = sorted({phase for edge in expected_unit_edges for phase in edge.get("candidate_phase_targets", [])})
        if unit.get("wave_review", {}).get("asset_candidate_phase_targets") != expected_candidates:
            error(errors, "E_PHASE_CANDIDATE_COVERAGE", unit_id)
        if unit.get("wave_review", {}).get("direct_phase_candidates_from_edges") != sorted({phase for edge in expected_unit_edges for phase in edge.get("phase_candidates", [])}):
            error(errors, "E_PHASE_CANDIDATE_COVERAGE", unit_id)
        assets = unit.get("legacy_assets", [])
        expected_asset_ids = sorted({edge["asset_id"] for edge in expected_unit_edges})
        if sorted(asset.get("asset_id") for asset in assets) != expected_asset_ids:
            error(errors, "E_ASSET_EVIDENCE", unit_id)
        for asset in assets:
            aid = asset.get("asset_id")
            old = disposition.get(aid); phase = classification.get(aid)
            if old is None or phase is None: error(errors, "E_ASSET_EVIDENCE", aid); continue
            src = asset.get("source", {}); hist = asset.get("history", {}); failure = asset.get("failure", {}); consumer = asset.get("consumer", {})
            if src.get("source_path") != old.get("source_path") or src.get("source_sha256") != old.get("source_sha256") or src.get("source_revision") != old.get("source_revision"):
                error(errors, "E_ASSET_EVIDENCE", aid)
            if hist.get("disposition") != old.get("disposition") or hist.get("implementation_status") != old.get("implementation_status") or hist.get("classification_id") != phase.get("classification_id"):
                error(errors, "E_ASSET_EVIDENCE", aid)
            if consumer.get("closure_status") != phase.get("consumer_closure_status") or consumer.get("ledger_consumer_refs") != phase.get("consumer_refs"):
                error(errors, "E_ASSET_EVIDENCE", aid)
            if not isinstance(failure.get("counterevidence"), list) or not isinstance(failure.get("coverage_failures"), list) or not isinstance(failure.get("unresolved"), list):
                error(errors, "E_ASSET_EVIDENCE", aid)
            if sorted(asset.get("edge_refs", [])) != sorted(edge["review_id"] for edge in expected_unit_edges if edge["asset_id"] == aid):
                error(errors, "E_ASSET_EVIDENCE", aid)
        if unit.get("wave_review", {}).get("source_edge_status") not in {"confirmed_source_contract_static", "asset_edge_only_unresolved"}:
            error(errors, "E_WAVE_EDGE_COVERAGE", unit_id)

    for item in inventory.get("current_context_refs", []):
        path = root / item.get("path", "")
        if not path.is_file() or dig(path.read_bytes()) != item.get("sha256"):
            error(errors, "E_CURRENT_CONTEXT_DIGEST", item.get("path", ""))
    scope = inventory.get("scope", {})
    if scope.get("direct_phase_candidate_count") != 0 or scope.get("unresolved_phase_gap_count") != 30:
        error(errors, "E_PHASE_AUTHORITY_SEPARATION")
    return errors


if __name__ == "__main__":
    failures = validate()
    if failures:
        print("FAIL SCF-B-0101 validator")
        print("\n".join(failures))
        sys.exit(1)
    print("PASS SCF-B-0101 validator: 30 units, source anchors, Wave1-50 edges, asset evidence, authority boundary")
