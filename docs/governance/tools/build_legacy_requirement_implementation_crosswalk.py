#!/usr/bin/env python3
"""要求unitとphase能力・代表旧assetを候補接続する。旧assetは実行しない。"""

from __future__ import annotations

from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[3]
UNIT_PATH = ROOT / "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
PHASE_PATH = ROOT / "docs/governance/phase-capability-inventory.json"
ASSET_PATH = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
OUTPUT_PATH = ROOT / "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
META_PATH = ROOT / "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.meta.json"


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def sha256(path: Path) -> str:
    return "sha256:" + hashlib.sha256(path.read_bytes()).hexdigest()


def stable_counts(values) -> dict[str, int]:
    return dict(sorted(Counter(values).items()))


def phase_rationale_trace(unit: dict, phase_id: str) -> tuple[str, list[str], str]:
    text = unit["phase_rationale"]
    starts = list(re.finditer(r"PHCAP-\d{2}:", text))
    matches = []
    for index, match in enumerate(starts):
        end = starts[index + 1].start() if index + 1 < len(starts) else len(text)
        segment = text[match.start():end].strip(" ；。")
        if segment.startswith(phase_id + ":"):
            matches.append(segment)
    if not matches and len(unit["direct_phase_candidates"]) == 1 and phase_id in text:
        matches = [text.strip()]
    if len(matches) != 1:
        raise ValueError(f"phase rationale segment不一致: {unit['unit_candidate_id']} {phase_id}")
    rationale = matches[0]
    quoted = re.findall(r"「([^」]+)」", rationale)
    evidence_spans = sorted({
        value for value in quoted
        if any(value in source_span for source_span in unit["source_text_spans"])
    })
    status = "exact_source_quote_traced" if evidence_spans else "unresolved_no_exact_source_span"
    return rationale, evidence_spans, status


def build_records() -> list[dict]:
    requirements = load_jsonl(UNIT_PATH)
    phase_inventory = json.loads(PHASE_PATH.read_text())
    assets = load_jsonl(ASSET_PATH)
    phases = {record["task_id"]: record for record in phase_inventory["records"]}
    assets_by_id = {record["asset_id"]: record for record in assets}
    assets_by_phase: dict[str, list[dict]] = defaultdict(list)
    for asset in assets:
        for phase_id in asset["candidate_phase_targets"]:
            assets_by_phase[phase_id].append(asset)

    records = []
    ordinal = 0
    for requirement in requirements:
        for unit in requirement["candidate_units"]:
            ordinal += 1
            if unit["unit_kind"] == "product_unit":
                product_scope = [unit["product_target"]]
            else:
                product_scope = unit["connected_product_targets"]

            phase_evidence = []
            phase_pool: dict[str, dict] = {}
            representative: dict[str, dict] = {}
            for phase_id in unit["direct_phase_candidates"]:
                phase = phases[phase_id]
                phase_rationale, evidence_spans, evidence_trace_status = phase_rationale_trace(unit, phase_id)
                candidates = assets_by_phase[phase_id]
                for asset in candidates:
                    phase_pool[asset["asset_id"]] = asset
                product_candidates = [
                    asset for asset in candidates
                    if set(product_scope) & set(asset["candidate_product_targets"])
                ]
                representative_ids = []
                for ref in phase["legacy"]["representative_assets"]:
                    classified = assets_by_id[ref["asset_id"]]
                    representative_ids.append(ref["asset_id"])
                    item = representative.setdefault(
                        ref["asset_id"],
                        {
                            "asset_id": ref["asset_id"],
                            "source_path": ref["source_path"],
                            "source_sha256": classified["source_sha256"],
                            "archive_manifest_digest_match": classified["archive_manifest_digest_match"],
                            "classification_id": classified["classification_id"],
                            "phase_ids": [],
                            "artifact_evidence_kind": classified["artifact_evidence_kind"],
                            "implementation_evidence_state": classified["implementation_evidence_state"],
                            "legacy_implementation_status": classified["legacy_implementation_status"],
                            "normalized_requirement_implementation_state": "unknown",
                            "consumer_refs_observed": classified["consumer_refs"],
                            "consumer_closure_status": classified["consumer_closure_status"],
                            "link_basis": "phase_representative",
                            "semantic_review_state": "direct_requirement_link_pending",
                            "confidence": "phase_capability_representative_only",
                            "direct_requirement_semantic_link": False,
                            "unresolved": [
                                "direct_requirement_asset_semantic_link_pending",
                                "consumer_closure_pending",
                            ],
                        },
                    )
                    item["phase_ids"].append(phase_id)
                phase_evidence.append(
                    {
                        "phase_id": phase_id,
                        "title": phase["title"],
                        "status_scope": "phase_capability",
                        "source_phase_rationale": phase_rationale,
                        "evidence_spans": evidence_spans,
                        "evidence_trace_status": evidence_trace_status,
                        "current_status": phase["current"]["status"],
                        "current_evidence_products": phase["current"]["evidence_products"],
                        "legacy_capability_status": phase["legacy"]["capability_status"],
                        "legacy_layers_evidenced": phase["legacy"]["layers_evidenced"],
                        "legacy_maximum_layer_evidenced": phase["legacy"]["maximum_layer_evidenced"],
                        "transition_assessment": phase["transition_assessment"],
                        "gap": phase["gaps"],
                        "representative_asset_ids": representative_ids,
                        "phase_candidate_asset_count": len(candidates),
                        "phase_and_product_candidate_asset_count": len(product_candidates),
                        "product_candidate_evidence_status": "direct_product_boundary_evidence_pending",
                        "new_build_allowed": phase["new_build_allowed"],
                    }
                )

            product_pool = [
                asset for asset in phase_pool.values()
                if set(product_scope) & set(asset["candidate_product_targets"])
            ]
            unresolved = [
                "direct_requirement_asset_semantic_link_pending",
                "requirement_implementation_status_unknown",
                "consumer_closure_pending",
                "human_product_authority_decision_pending",
                "successor_assignment_unassigned",
            ]
            if not unit["direct_phase_candidates"]:
                unresolved.append("direct_phase_unresolved")
            if any(evidence["evidence_trace_status"] == "unresolved_no_exact_source_span" for evidence in phase_evidence):
                unresolved.append("phase_candidate_exact_source_trace_pending")
            records.append(
                {
                    "schema_revision": 1,
                    "crosswalk_id": f"IRIMPLX-{ordinal:04d}",
                    "authority_effect": "none",
                    "source_revision": "legacy-generation-2026-09-14",
                    "source_requirement_id": requirement["source_requirement_id"],
                    "source_statement_semantic_digest": requirement["source_statement_semantic_digest"],
                    "unit_candidate_id": unit["unit_candidate_id"],
                    "unit_kind": unit["unit_kind"],
                    "product_scope": product_scope,
                    "responsibility_summary": unit["responsibility_summary"],
                    "source_text_spans": unit["source_text_spans"],
                    "direct_phase_candidates": unit["direct_phase_candidates"],
                    "phase_classification_status": unit["phase_classification_status"],
                    "phase_rationale": unit["phase_rationale"],
                    "phase_capability_evidence": phase_evidence,
                    "status_scope": {
                        "phase_capability_evidence": "phase_capability",
                        "candidate_asset_pool": "search_candidate_pool",
                        "legacy_requirement_implementation_status": "requirement_unit",
                        "current_requirement_implementation_status": "requirement_unit",
                        "consumer_closure_status": "requirement_unit",
                    },
                    "candidate_asset_pool": {
                        "query_basis": "candidate_phase_intersection_then_low_confidence_product_candidate_intersection",
                        "asset_catalog_ref": "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl",
                        "membership_semantics": "search_candidate_only_not_direct_semantic_link",
                        "semantic_review_state": "pending",
                        "product_candidate_evidence_status": "direct_product_boundary_evidence_pending",
                        "phase_candidate_asset_count": len(phase_pool),
                        "phase_and_product_candidate_asset_count": len(product_pool),
                        "phase_candidate_asset_ids": sorted(phase_pool),
                        "phase_and_product_candidate_asset_ids": sorted(
                            asset["asset_id"] for asset in product_pool
                        ),
                        "phase_candidate_implementation_evidence_counts": stable_counts(
                            asset["implementation_evidence_state"] for asset in phase_pool.values()
                        ),
                    },
                    "representative_legacy_assets": sorted(representative.values(), key=lambda value: value["asset_id"]),
                    "direct_legacy_asset_links": [],
                    "direct_legacy_asset_link_status": (
                        "phase_representatives_only_pending_semantic_link"
                        if phase_evidence else "unavailable_direct_phase_unresolved"
                    ),
                    "legacy_requirement_implementation_status": "unknown_pending_direct_asset_semantic_review",
                    "current_requirement_implementation_status": "not_established",
                    "unimplemented_assessment_status": "not_assessed_at_requirement_unit_level",
                    "consumer_closure_status": "pending",
                    "legacy_execution_performed": False,
                    "new_build_allowed": False,
                    "successor_assignment_status": requirement["successor_assignment_status"],
                    "unresolved": unresolved,
                }
            )
    return records


def build_meta(records: list[dict]) -> dict:
    phase_inventory = json.loads(PHASE_PATH.read_text())
    asset_catalog = {record["asset_id"]: record for record in load_jsonl(ASSET_PATH)}
    unit_phase_links = [
        evidence
        for record in records
        for evidence in record["phase_capability_evidence"]
    ]
    representative_ids = {
        asset["asset_id"]
        for record in records
        for asset in record["representative_legacy_assets"]
    }
    all_phase_representatives = {
        asset["asset_id"]: {
            "asset_id": asset["asset_id"],
            "source_path": asset["source_path"],
            "source_sha256": asset_catalog[asset["asset_id"]]["source_sha256"],
            "archive_manifest_digest_match": asset_catalog[asset["asset_id"]]["archive_manifest_digest_match"],
            "artifact_evidence_kind": asset_catalog[asset["asset_id"]]["artifact_evidence_kind"],
            "implementation_evidence_state": asset_catalog[asset["asset_id"]]["implementation_evidence_state"],
            "legacy_implementation_status": asset_catalog[asset["asset_id"]]["legacy_implementation_status"],
            "consumer_refs_observed": asset_catalog[asset["asset_id"]]["consumer_refs"],
            "consumer_closure_status": asset_catalog[asset["asset_id"]]["consumer_closure_status"],
            "phase_ids": [],
        }
        for phase in phase_inventory["records"]
        for asset in phase["legacy"]["representative_assets"]
    }
    for phase in phase_inventory["records"]:
        for asset in phase["legacy"]["representative_assets"]:
            all_phase_representatives[asset["asset_id"]]["phase_ids"].append(phase["task_id"])
    unreferenced_representatives = [
        value for asset_id, value in sorted(all_phase_representatives.items())
        if asset_id not in representative_ids
    ]
    phase_candidate_ids = {
        asset_id
        for record in records
        for asset_id in record["candidate_asset_pool"]["phase_candidate_asset_ids"]
    }
    phase_product_candidate_ids = {
        asset_id
        for record in records
        for asset_id in record["candidate_asset_pool"]["phase_and_product_candidate_asset_ids"]
    }
    product_scope_keys = sorted({"+".join(record["product_scope"]) for record in records})
    return {
        "schema_revision": 1,
        "crosswalk_id": "IR-IMPLEMENTATION-CROSSWALK-BOOTSTRAP-2026-09-21",
        "status": "candidate_incomplete",
        "authority_effect": "none",
        "source_revision": "legacy-generation-2026-09-14",
        "method": "docs/governance/audits/source-rebaseline/legacy-requirement-implementation-crosswalk-method-2026-09-21.md",
        "record_count": len(records),
        "product_scope_counts": stable_counts(
            "+".join(record["product_scope"]) for record in records
        ),
        "direct_phase_state_counts": {
            "with_candidate": sum(bool(record["direct_phase_candidates"]) for record in records),
            "unresolved": sum(not record["direct_phase_candidates"] for record in records),
        },
        "direct_phase_unresolved_product_scope_counts": stable_counts(
            "+".join(record["product_scope"])
            for record in records
            if not record["direct_phase_candidates"]
        ),
        "unit_phase_link_count": len(unit_phase_links),
        "current_phase_status_link_counts": stable_counts(
            evidence["current_status"] for evidence in unit_phase_links
        ),
        "legacy_phase_capability_status_link_counts": stable_counts(
            evidence["legacy_capability_status"] for evidence in unit_phase_links
        ),
        "transition_assessment_link_counts": stable_counts(
            evidence["transition_assessment"] for evidence in unit_phase_links
        ),
        "unit_transition_assessment_presence_counts": {
            value: sum(
                value in {evidence["transition_assessment"] for evidence in record["phase_capability_evidence"]}
                for record in records
            )
            for value in sorted({
                evidence["transition_assessment"] for evidence in unit_phase_links
            })
        },
        "phase_evidence_trace_counts": stable_counts(
            evidence["evidence_trace_status"] for evidence in unit_phase_links
        ),
        "units_with_untraced_phase_candidate_count": sum(
            any(evidence["evidence_trace_status"] == "unresolved_no_exact_source_span" for evidence in record["phase_capability_evidence"])
            for record in records
        ),
        "direct_phase_unresolved_review_queue": [
            {
                "unit_candidate_id": record["unit_candidate_id"],
                "source_requirement_id": record["source_requirement_id"],
                "product_scope": record["product_scope"],
                "source_text_spans": record["source_text_spans"],
            }
            for record in records
            if not record["direct_phase_candidates"]
        ],
        "phase_evidence_trace_review_queue": [
            {
                "unit_candidate_id": record["unit_candidate_id"],
                "source_requirement_id": record["source_requirement_id"],
                "product_scope": record["product_scope"],
                "untraced_phase_ids": [
                    evidence["phase_id"]
                    for evidence in record["phase_capability_evidence"]
                    if evidence["evidence_trace_status"] == "unresolved_no_exact_source_span"
                ],
            }
            for record in records
            if any(evidence["evidence_trace_status"] == "unresolved_no_exact_source_span" for evidence in record["phase_capability_evidence"])
        ],
        "unique_representative_legacy_asset_count": len(representative_ids),
        "all_phase_representative_legacy_asset_count": len(all_phase_representatives),
        "unreferenced_phase_representative_assets": unreferenced_representatives,
        "candidate_asset_membership_counts": {
            "unit_phase": sum(record["candidate_asset_pool"]["phase_candidate_asset_count"] for record in records),
            "unit_phase_and_product": sum(record["candidate_asset_pool"]["phase_and_product_candidate_asset_count"] for record in records),
        },
        "unique_candidate_asset_counts": {
            "phase": len(phase_candidate_ids),
            "phase_and_product": len(phase_product_candidate_ids),
        },
        "unique_phase_and_product_candidate_assets_by_product_scope": {
            scope: len({
                asset_id
                for record in records
                if "+".join(record["product_scope"]) == scope
                for asset_id in record["candidate_asset_pool"]["phase_and_product_candidate_asset_ids"]
            })
            for scope in product_scope_keys
        },
        "direct_legacy_asset_link_count": sum(len(record["direct_legacy_asset_links"]) for record in records),
        "legacy_requirement_implementation_status_counts": stable_counts(
            record["legacy_requirement_implementation_status"] for record in records
        ),
        "current_requirement_implementation_status_counts": stable_counts(
            record["current_requirement_implementation_status"] for record in records
        ),
        "consumer_closure_counts": stable_counts(record["consumer_closure_status"] for record in records),
        "source_inputs": [
            {"path": str(UNIT_PATH.relative_to(ROOT)), "sha256": sha256(UNIT_PATH)},
            {"path": str(PHASE_PATH.relative_to(ROOT)), "sha256": sha256(PHASE_PATH)},
            {"path": str(ASSET_PATH.relative_to(ROOT)), "sha256": sha256(ASSET_PATH)},
        ],
        "known_open_conditions": [
            "all_direct_requirement_asset_semantic_links_pending",
            "all_requirement_implementation_statuses_unknown",
            "all_consumer_closures_pending",
            "direct_phase_unresolved_units_remain",
            "human_product_authority_decisions_pending",
            "successor_assignments_unassigned",
        ],
    }


def render_jsonl(records: list[dict]) -> bytes:
    return ("\n".join(json.dumps(record, ensure_ascii=False, sort_keys=True) for record in records) + "\n").encode()


def main() -> None:
    records = build_records()
    output = render_jsonl(records)
    OUTPUT_PATH.write_bytes(output)
    meta = build_meta(records)
    meta["output_sha256"] = "sha256:" + hashlib.sha256(output).hexdigest()
    META_PATH.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n")
    print(f"built records={len(records)} output={meta['output_sha256']}")


if __name__ == "__main__":
    main()
