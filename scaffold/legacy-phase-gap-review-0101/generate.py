#!/usr/bin/env python3
"""Materialize the bounded phase-gap research bundle for SCF-B-0101.

The generator only reads current governance records, source snapshots, and old
semantic-review ledgers.  It writes the derived bundle under this directory;
it never edits an authority or executes an archived asset.
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
CROSSWALK = ROOT / "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMP = ROOT / "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
IR = ROOT / "archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json"
DISPOSITION = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
CLASSIFICATION = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
PHASE = ROOT / "docs/governance/phase-capability-inventory.json"
BASE_COMMIT = "36784d25aa4cc53d89c28c2ff81b4009db234605"

WAVE_PATHS = [
    ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{i}.jsonl"
    for i in range(1, 37)
] + [
    ROOT / f"scaffold/legacy-semantic-review-wave{i}/legacy-requirement-direct-semantic-review-wave{i}.jsonl"
    for i in range(37, 51)
]

CURRENT_REFS = [
    ("docs/governance/new-generation-start-here.md", "governance_entry"),
    ("docs/governance/legacy-asset-reuse-control.md", "legacy_read_only_boundary"),
    ("docs/concept/product-boundary.md", "four_product_boundary_candidate"),
    ("docs/helix-harness/L1-planning/product-intent.md", "HELIX-HARNESS_L1"),
    ("docs/helix-os/L1-planning/system-intent.md", "HELIX-OS_L1"),
    ("docs/helix-web/L1-planning/product-intent.md", "HELIX-Web_L1"),
    ("docs/helix-web-os/L1-planning/system-intent.md", "HELIX-Web-OS_L1"),
    ("docs/governance/audits/source-rebaseline/legacy-phase-product-classification-method-2026-09-20.md", "phase_method"),
    ("docs/governance/phase-capability-inventory.json", "PHCAP_inventory"),
    ("scaffold/phcap20-memory-research/README.md", "PHCAP-20_definition"),
    ("scaffold/phcap20-memory-research/inventory.json", "PHCAP-20_static_inventory"),
]

NEGATIVE_CASE_CODES = [
    "E_TARGET_SET",
    "E_SOURCE_DIGEST",
    "E_SOURCE_ANCHOR",
    "E_WAVE_EDGE_COVERAGE",
    "E_ASSET_EVIDENCE",
    "E_PHASE_AUTHORITY_SEPARATION",
    "E_PRODUCT_AUTHORITY_SEPARATION",
    "E_AUTHORITY_BOUNDARY",
    "E_BASE_COMMIT",
    "E_SOURCE_INPUT_DIGEST",
    "E_PHCAP20_DEFINITION_DIGEST",
]


def digest_bytes(value: bytes) -> str:
    return "sha256:" + hashlib.sha256(value).hexdigest()


def digest_text(value: str) -> str:
    return digest_bytes(value.encode("utf-8"))


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def wave_number(path: Path) -> int:
    match = re.search(r"wave(\d+)", path.name)
    if not match:
        raise ValueError(f"wave number missing: {path}")
    return int(match.group(1))


def source_line_range(requirement_id: str, lines: list[str]) -> tuple[int, int]:
    starts = [
        index + 1
        for index, line in enumerate(lines)
        if re.match(rf'^  "{re.escape(requirement_id)}": \{{$', line)
    ]
    if len(starts) != 1:
        raise ValueError(f"source anchor count for {requirement_id}: {starts}")
    start = starts[0]
    next_starts = [
        index + 1
        for index in range(start, len(lines))
        if re.match(r'^  "HIL-[A-Z]+-[0-9]+": \{$', lines[index])
    ]
    end = (next_starts[0] - 1) if next_starts else len(lines)
    return start, end


def compact_edge(row: dict, path: Path) -> dict:
    evidence = []
    for item in row.get("evidence_refs", []):
        evidence.append(
            {
                "archive_path": item.get("archive_path"),
                "artifact_role": item.get("artifact_role"),
                "evidence_ref_id": item.get("evidence_ref_id"),
                "excerpt_sha256": item.get("excerpt_sha256"),
                "excerpt_status": item.get("excerpt_status"),
                "line_start": item.get("line_start"),
                "line_end": item.get("line_end"),
                "source_requirement_relation": item.get("source_requirement_relation"),
            }
        )
    coverage = row.get("coverage") or {}
    return {
        "wave": wave_number(path),
        "ledger_path": str(path.relative_to(ROOT)),
        "review_id": row.get("review_id"),
        "asset_id": row.get("asset_id"),
        "artifact_evidence_kind": row.get("artifact_evidence_kind"),
        "classification_id": row.get("classification_id"),
        "batch_id": row.get("batch_id"),
        "selection_route": row.get("selection_route"),
        "semantic_link_status": row.get("semantic_link_status"),
        "semantic_relation": row.get("semantic_relation"),
        "source_path": row.get("source_path"),
        "source_sha256": row.get("source_sha256"),
        "source_requirement_id": row.get("source_requirement_id"),
        "source_statement_semantic_digest": row.get("source_statement_semantic_digest"),
        "source_text_spans": row.get("source_text_spans", []),
        "evidence_refs": evidence,
        "candidate_phase_targets": row.get("candidate_phase_targets", []),
        "candidate_product_targets": row.get("candidate_product_targets", []),
        "phase_candidates": row.get("phase_candidates", []),
        "product_scope": row.get("product_scope", []),
        "phase_authority_status": row.get("phase_authority_status"),
        "legacy_asset_evidence_state": row.get("legacy_asset_evidence_state"),
        "legacy_implementation_status": row.get("catalog_legacy_implementation_status", row.get("legacy_implementation_status")),
        "legacy_execution_status": row.get("legacy_execution_status"),
        "current_requirement_implementation_status": row.get("current_requirement_implementation_status"),
        "consumer_closure_status": row.get("consumer_closure_status"),
        "consumer_evidence_count": len(row.get("consumer_closure_evidence", [])),
        "observed_consumer_refs": row.get("observed_consumer_refs", []),
        "counterevidence": row.get("counterevidence", []),
        "failure_finding": coverage.get("failure"),
        "coverage_constraint": coverage.get("constraint"),
        "unresolved": row.get("unresolved", []),
    }


def ledger_asset(asset_id: str, disposition: dict, classification: dict, edges: list[dict]) -> dict:
    return {
        "asset_id": asset_id,
        "source": {
            "source_path": disposition.get("source_path"),
            "source_sha256": disposition.get("source_sha256"),
            "source_revision": disposition.get("source_revision"),
            "source_surface": disposition.get("source_surface"),
            "source_provenance_ref": disposition.get("source_provenance_ref"),
            "artifact_evidence_kind": classification.get("artifact_evidence_kind"),
        },
        "history": {
            "asset_class": disposition.get("asset_class"),
            "authority_status": disposition.get("authority_status"),
            "disposition": disposition.get("disposition"),
            "implementation_status": disposition.get("implementation_status"),
            "decision_record_ref": disposition.get("decision_record_ref"),
            "classification_id": classification.get("classification_id"),
            "phase_classification_status": classification.get("phase_classification_status"),
            "product_classification_status": classification.get("product_classification_status"),
        },
        "failure": {
            "counterevidence": sorted({x for edge in edges for x in edge.get("counterevidence", [])}),
            "coverage_failures": sorted({edge.get("failure_finding") for edge in edges if edge.get("failure_finding")}),
            "unresolved": sorted({x for edge in edges for x in edge.get("unresolved", [])}),
        },
        "consumer": {
            "closure_status": classification.get("consumer_closure_status"),
            "ledger_consumer_refs": classification.get("consumer_refs", []),
            "edge_consumer_refs": sorted({x for edge in edges for x in edge.get("observed_consumer_refs", [])}),
            "edge_evidence_count": sum(edge.get("consumer_evidence_count", 0) for edge in edges),
        },
        "phase_candidate_targets": classification.get("candidate_phase_targets", []),
        "product_candidate_targets": classification.get("candidate_product_targets", []),
        "edge_refs": [edge["review_id"] for edge in edges],
    }


def make_bundle() -> None:
    crosswalk = read_jsonl(CROSSWALK)
    targets = [row for row in crosswalk if row.get("phase_classification_status") == "unresolved"]
    target_ids = [row["unit_candidate_id"] for row in targets]
    if len(targets) != 30 or len(set(target_ids)) != 30:
        raise ValueError(f"expected exactly 30 unique unresolved units, got {len(targets)}")
    cross_by_unit = {row["unit_candidate_id"]: row for row in targets}

    decomposition = {
        unit["unit_candidate_id"]: (record, unit)
        for record in read_jsonl(DECOMP)
        for unit in record.get("candidate_units", [])
        if unit.get("unit_candidate_id") in cross_by_unit
    }
    ir = json.loads(IR.read_text(encoding="utf-8"))
    ir_lines = IR.read_text(encoding="utf-8").splitlines()
    disposition = {row["asset_id"]: row for row in read_jsonl(DISPOSITION)}
    classification = {row["asset_id"]: row for row in read_jsonl(CLASSIFICATION)}

    all_edges: list[dict] = []
    edges_by_unit: dict[str, list[dict]] = {unit: [] for unit in target_ids}
    wave_counts: dict[int, int] = {}
    for path in WAVE_PATHS:
        rows = read_jsonl(path)
        wave_counts[wave_number(path)] = len(rows)
        for row in rows:
            unit_id = row.get("unit_candidate_id")
            if unit_id not in edges_by_unit:
                continue
            edge = compact_edge(row, path)
            edges_by_unit[unit_id].append(edge)
            all_edges.append(edge)
    all_edges.sort(key=lambda edge: edge["review_id"])
    if len(all_edges) != 66:
        raise ValueError(f"expected 66 target wave edges, got {len(all_edges)}")

    edge_by_unit_asset: dict[tuple[str, str], list[dict]] = {}
    for edge in all_edges:
        edge_by_unit_asset.setdefault((edge["source_requirement_id"], edge["asset_id"]), []).append(edge)

    units: list[dict] = []
    for row in targets:
        unit_id = row["unit_candidate_id"]
        requirement_id = row["source_requirement_id"]
        if unit_id not in decomposition or requirement_id not in ir:
            raise ValueError(f"missing decomposition or IR source for {unit_id}")
        decomposition_record, unit = decomposition[unit_id]
        requirement = ir[requirement_id]
        statement = requirement["statement"]["text"]
        start_line, end_line = source_line_range(requirement_id, ir_lines)
        edges = sorted(edges_by_unit[unit_id], key=lambda edge: edge["review_id"])
        asset_ids = sorted({edge["asset_id"] for edge in edges})
        assets = []
        for asset_id in asset_ids:
            if asset_id not in disposition or asset_id not in classification:
                raise ValueError(f"missing asset ledger row: {asset_id}")
            assets.append(ledger_asset(asset_id, disposition[asset_id], classification[asset_id], [e for e in edges if e["asset_id"] == asset_id]))
        asset_phase_candidates = sorted({phase for edge in edges for phase in edge.get("candidate_phase_targets", [])})
        direct_edge_candidates = sorted({phase for edge in edges for phase in edge.get("phase_candidates", [])})
        asset_product_candidates = sorted({product for edge in edges for product in edge.get("candidate_product_targets", [])})
        confirmed_edges = [edge for edge in edges if edge.get("semantic_link_status") == "confirmed"]
        source_edge_status = "confirmed_source_contract_static" if confirmed_edges else "asset_edge_only_unresolved"
        phase_reason = row.get("phase_rationale") or "crosswalkにPHCAP直接候補がなく、原文から能力phaseを確定できない。"
        phase_reason += " Wave edgeのcandidate_phase_targetsはasset検索候補であり、semantic link／consumer closure／phase直接責務の証明ではない。"
        units.append(
            {
                "unit_candidate_id": unit_id,
                "crosswalk_id": row["crosswalk_id"],
                "requirement_id": requirement_id,
                "product_scope_candidate": row.get("product_scope", []),
                "responsibility_summary": row.get("responsibility_summary"),
                "source": {
                    "revision": row.get("source_revision"),
                    "archive_path": "archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json",
                    "json_pointer": f"requirements-ir/requirements.json#/{requirement_id}",
                    "archive_line_start": start_line,
                    "archive_line_end": end_line,
                    "migration_source_pointer": decomposition_record.get("source_pointer"),
                    "statement_text": statement,
                    "statement_semantic_digest": row.get("source_statement_semantic_digest"),
                    "statement_text_sha256": digest_text(statement),
                    "source_text_spans": row.get("source_text_spans", []),
                    "decomposition_statement_text": decomposition_record.get("statement_text"),
                    "decomposition_unit_spans": unit.get("source_text_spans", []),
                },
                "wave_review": {
                    "source_edge_status": source_edge_status,
                    "edge_count": len(edges),
                    "confirmed_edge_count": len(confirmed_edges),
                    "unresolved_edge_count": sum(edge.get("semantic_link_status") == "unresolved" for edge in edges),
                    "rejected_edge_count": sum(edge.get("semantic_link_status") == "rejected" for edge in edges),
                    "edge_refs": [edge["review_id"] for edge in edges],
                    "asset_ids": asset_ids,
                    "asset_candidate_phase_targets": asset_phase_candidates,
                    "asset_candidate_product_targets": asset_product_candidates,
                    "direct_phase_candidates_from_edges": direct_edge_candidates,
                },
                "phase_classification": {
                    "status": "unresolved_phase_gap",
                    "eligible_phase_candidates": [],
                    "candidate_basis": "asset_search_candidates_only",
                    "candidate_confidence": "low",
                    "phase_gap_reason": phase_reason,
                    "bootstrap_projection_assessment": "wave_reviewed_source_edge_but_phase_gap_remains",
                    "authority_phase_status": "unchanged_unresolved",
                },
                "product_classification": {
                    "status": "candidate_scope_only",
                    "candidate_products": row.get("product_scope", []),
                    "authority_product": None,
                    "boundary_evidence": "current four-product L1 and product-boundary refs are comparison context only",
                },
                "legacy_assets": assets,
                "closure": {
                    "current_requirement_implementation_status": row.get("current_requirement_implementation_status"),
                    "legacy_requirement_implementation_status": row.get("legacy_requirement_implementation_status"),
                    "legacy_execution_performed": False,
                    "consumer_closure_status": "pending",
                    "successor_assignment_status": row.get("successor_assignment_status"),
                    "authority_effect": "none",
                    "new_build_allowed": False,
                    "unresolved": sorted(
                        set(row.get("unresolved", []))
                        | {"phase_direct_evidence_insufficient", "asset_candidate_semantic_link_not_direct", "consumer_closure_pending"}
                    ),
                },
            }
        )

    current_refs = []
    for relative, role in CURRENT_REFS:
        path = ROOT / relative
        current_refs.append({"path": relative, "role": role, "sha256": digest_bytes(path.read_bytes())})

    source_inputs = [
        (CROSSWALK, "crosswalk"),
        (IR, "legacy_ir_source"),
        (DECOMP, "decomposition"),
        (DISPOSITION, "asset_disposition"),
        (CLASSIFICATION, "phase_product_classification"),
    ] + [(path, "semantic_review_wave") for path in WAVE_PATHS]
    source_input_digests = [
        {
            "path": str(path.relative_to(ROOT)),
            "kind": kind,
            "sha256": digest_bytes(path.read_bytes()),
        }
        for path, kind in source_inputs
    ]

    phase_record = next(record for record in json.loads(PHASE.read_text(encoding="utf-8"))["records"] if record["task_id"] == "PHCAP-20")
    inventory = {
        "schema": "legacy-phase-gap-review-0101/v1",
        "binding_id": "SCF-B-0101",
        "status": "research_candidate",
        "authority_effect": "none",
        "base": {"repository": "HELIX-HARNESS", "commit": BASE_COMMIT, "branch": "main", "ancestor_required": True},
        "scope": {
            "crosswalk_path": str(CROSSWALK.relative_to(ROOT)),
            "unresolved_unit_count": len(targets),
            "target_product_counts": {"HELIX-OS": 24, "HELIX-HARNESS": 6},
            "target_unit_ids": target_ids,
            "direct_phase_candidate_count": sum(bool(unit["phase_classification"]["eligible_phase_candidates"]) for unit in units),
            "unresolved_phase_gap_count": sum(unit["phase_classification"]["status"] == "unresolved_phase_gap" for unit in units),
        },
        "wave_review": {
            "wave_paths": [str(path.relative_to(ROOT)) for path in WAVE_PATHS],
            "wave_count": len(WAVE_PATHS),
            "all_wave_edge_count": sum(wave_counts.values()),
            "all_wave_unit_count": len({edge.get("unit_candidate_id") for path in WAVE_PATHS for edge in read_jsonl(path)}),
            "target_edge_count": len(all_edges),
            "target_edge_status_counts": {
                status: sum(edge.get("semantic_link_status") == status for edge in all_edges)
                for status in ("confirmed", "unresolved", "rejected")
            },
            "target_asset_count": len({edge["asset_id"] for edge in all_edges}),
            "semantic_edge_scope": "Wave1-50 is static semantic evidence; edge candidates never promote phase authority.",
        },
        "phcap20_definition": {
            "task_id": phase_record["task_id"],
            "title": phase_record["title"],
            "product_targets": phase_record["product_targets"],
            "current_status": phase_record["current"]["status"],
            "current_evidence_products": phase_record["current"]["evidence_products"],
            "legacy_layers_evidenced": phase_record["legacy"]["layers_evidenced"],
            "legacy_capability_status": phase_record["legacy"]["capability_status"],
            "transition_assessment": phase_record["transition_assessment"],
            "definition_refs": [ref for ref in current_refs if ref["role"].startswith("PHCAP-20") or ref["role"] == "PHCAP_inventory"],
            "direct_phase_rule": "PHCAP-20 only when memory/continuation/handover/retention responsibility is directly evidenced; generic state, ledger, event, or process terms remain unresolved.",
        },
        "current_context_refs": current_refs,
        "source_input_digests": source_input_digests,
        "authority_boundary": {
            "formal_crosswalk_modified": False,
            "formal_phase_authority_modified": False,
            "formal_product_authority_modified": False,
            "successor_assignment_generated": False,
            "implementation_claim_generated": False,
            "consumer_closure_generated": False,
            "old_archive_executed": False,
        },
        "negative_case_codes": NEGATIVE_CASE_CODES,
    }

    (HERE / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with (HERE / "units.jsonl").open("w", encoding="utf-8") as stream:
        for unit in units:
            stream.write(json.dumps(unit, ensure_ascii=False, sort_keys=True) + "\n")
    with (HERE / "edges.jsonl").open("w", encoding="utf-8") as stream:
        for edge in all_edges:
            stream.write(json.dumps(edge, ensure_ascii=False, sort_keys=True) + "\n")
    print(f"generated SCF-B-0101 bundle: units={len(units)} direct_candidates={inventory['scope']['direct_phase_candidate_count']} unresolved_gaps={inventory['scope']['unresolved_phase_gap_count']} target_edges={len(all_edges)}")


if __name__ == "__main__":
    make_bundle()
