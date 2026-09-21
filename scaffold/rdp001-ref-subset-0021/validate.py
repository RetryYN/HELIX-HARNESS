#!/usr/bin/env python3
"""Fail-closed static validator for a bounded RDP-001 reference-edge subset."""
from __future__ import annotations

import hashlib
import json
import os
import re
import sys
from collections import defaultdict
from typing import Any

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
INV = os.path.join(HERE, "inventory.json")
REF = "docs/governance/delegated-requirement-document-reference-holding.jsonl"
SOURCE = "docs/governance/delegated-requirement-document-source-holding.jsonl"
ASSET = "docs/governance/legacy-asset-disposition.jsonl"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DECISION = "docs/governance/legacy-asset-decisions.jsonl"
FAILURE = "docs/governance/legacy-rule-atom-inventory.jsonl"
EXPECTED_BASE = "c354b7d9177ad3ea92dec30c66c36e6ce2d66ae3"
EXPECTED_EDGES = {
    "DELEGATED-REF-0001", "DELEGATED-REF-0016", "DELEGATED-REF-0027", "DELEGATED-REF-0041",
    "DELEGATED-REF-0054", "DELEGATED-REF-0273", "DELEGATED-REF-0285", "DELEGATED-REF-0295",
    "DELEGATED-REF-0296", "DELEGATED-REF-0298", "DELEGATED-REF-0310", "DELEGATED-REF-0328",
    "DELEGATED-REF-0329", "DELEGATED-REF-0335", "DELEGATED-REF-0338", "DELEGATED-REF-0352",
    "DELEGATED-REF-0356", "DELEGATED-REF-0357", "DELEGATED-REF-0361", "DELEGATED-REF-0369",
    "DELEGATED-REF-0382", "DELEGATED-REF-0384", "DELEGATED-REF-0385", "DELEGATED-REF-0747",
}
INTEGRATED_EDGES = {
    "DELEGATED-REF-0303", "DELEGATED-REF-0759", "DELEGATED-REF-0760", "DELEGATED-REF-0341",
    "DELEGATED-REF-0342", "DELEGATED-REF-0414", "DELEGATED-REF-0415", "DELEGATED-REF-0772",
    "DELEGATED-REF-0308", "DELEGATED-REF-0424", "DELEGATED-REF-0425", "DELEGATED-REF-0765",
    "DELEGATED-REF-0301", "DELEGATED-REF-0302", "DELEGATED-REF-0422", "DELEGATED-REF-0423",
    "DELEGATED-REF-0757", "DELEGATED-REF-0758", "DELEGATED-REF-0304", "DELEGATED-REF-0419",
    "DELEGATED-REF-0761", "DELEGATED-REF-0762", "DELEGATED-REF-0305", "DELEGATED-REF-0763",
    "DELEGATED-REF-0373", "DELEGATED-REF-0783",
}
DRAFT_EDGES = {"DELEGATED-REF-0320", "DELEGATED-REF-0766", "DELEGATED-REF-0316", "DELEGATED-REF-0739"}
BLOCKED_PATHS = {
    "docs/design/helix/L3-requirements/lifecycle-state-separation.md",
    "docs/test-design/helix/lifecycle-state-separation-acceptance.md",
    "docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md",
    "docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md",
    "docs/design/helix/L3-requirements/vmodel-docgen-fit.md",
}
EXPECTED_RELATION_COUNTS = {
    "l3_progression_authority": 8,
    "related_l12": 6,
    "authority": 2,
    "related_l3": 5,
    "related_l1": 3,
}
EXPECTED_CLOSURE_GUARD = {
    "authority_effect": "none",
    "meaning_change_applied": False,
    "successor_requirement_ids": [],
    "human_decision_ref": None,
    "source_carry_status": "preserved_pending_classification",
    "reference_carry_status": "preserved_pending_classification",
    "adoption_state": "none",
    "holding_closure": "not_performed",
    "prohibited_inference": [
        "owner adoption", "product authority", "phase authority", "legacy implementation",
        "consumer closure", "requirement acceptance", "document atomization completion",
        "L3/L10 freeze", "runtime or CI readiness",
    ],
}
HEX64 = re.compile(r"^[0-9a-f]{64}$")
HEX40 = re.compile(r"^[0-9a-f]{40}$")


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_jsonl(rel: str) -> list[dict[str, Any]]:
    with open(os.path.join(ROOT, rel), encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]


def archive_for(path: str) -> str:
    if path.startswith("archive/"):
        return path
    return os.path.join(ROOT, "archive/legacy-generation-2026-09-14/root", path)


def load_inventory(path: str = INV) -> dict[str, Any]:
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def failure_matches(path: str, rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    archive = "archive/legacy-generation-2026-09-14/root/" + path
    return [
        {"rule_id": row.get("rule_id"), "kind": row.get("kind"), "fail_mode": row.get("fail_mode"), "authority_effect": row.get("authority_effect")}
        for row in rows
        if any(source.get("path") in {path, archive} for source in row.get("sources", []))
    ]


def validate_inventory(inv: dict[str, Any], root: str = ROOT) -> list[str]:
    errors: list[str] = []

    def req(condition: bool, code: str) -> None:
        if not condition:
            errors.append(code)

    req(inv.get("schema") == "rdp001-reference-edge-subset-scaffold/v1", "E_SCHEMA")
    req(inv.get("candidate_id") == "RDP-001-SCF-B-0021-REF-CLASSIFICATION-024", "E_CANDIDATE_ID")
    req(inv.get("status") == "scaffold_candidate_pending_review", "E_STATE")
    req(inv.get("authority_effect") == "none", "E_AUTHORITY")
    req(inv.get("meaning_change_applied") is False, "E_MEANING")
    req(inv.get("successor_requirement_ids") == [], "E_SUCCESSOR")
    req(inv.get("human_decision_ref") is None, "E_HUMAN_DECISION")
    req(inv.get("equivalence_claim") is None, "E_EQUIVALENCE_NULL")
    req(inv.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")
    req(inv.get("comparison", {}).get("fixed_source_revision") == EXPECTED_BASE, "E_FIXED_CAPTURE_REVISION")
    guard = inv.get("closure_guard")
    req(guard == EXPECTED_CLOSURE_GUARD, "E_CLOSURE_GUARD_FULL_EQUALITY")
    if isinstance(guard, dict):
        for key in ("authority_effect", "meaning_change_applied", "successor_requirement_ids", "human_decision_ref"):
            req(inv.get(key) == guard.get(key), f"E_GUARD_TOP:{key}")

    ref_rows = read_jsonl(REF)
    source_rows = read_jsonl(SOURCE)
    asset_rows = read_jsonl(ASSET)
    phase_rows = read_jsonl(PHASE)
    decision_rows = read_jsonl(DECISION)
    failure_rows = read_jsonl(FAILURE)
    ref_map = {row["reference_id"]: row for row in ref_rows}
    source_map = {row["source_path"]: row for row in source_rows}
    asset_map = {row["source_path"]: row for row in asset_rows}
    phase_map = {row["source_path"]: row for row in phase_rows}
    decisions_by_asset: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in decision_rows:
        decisions_by_asset[row["asset_id"]].append(row)

    req(len(ref_rows) == 788, "E_HOLDING_TOTAL")
    denominator = inv.get("comparison", {}).get("holding_denominator", {})
    req(denominator == {
        "reference_edges_total": 788, "prior_integrated_reference_edges": 26, "prior_integrated_source_documents": 14,
        "unmerged_draft_reference_edges": 4, "unmerged_draft_candidate_id": "RDP-001-SCF-B-0017-DOC-007-016-030-034",
        "unmerged_draft_binding": "SCF-B-0017",
        "unmerged_draft_lineage": "PR #1953 (draft; not integrated into origin/main at capture)",
        "unmerged_draft_status_at_capture": "draft_not_main_integrated",
        "remaining_before_subset_main_confirmed": 762, "remaining_before_subset_combined": 758,
        "selected_reference_edges": 24, "remaining_after_subset_main_confirmed": 738,
        "remaining_after_subset_combined": 734,
    }, "E_DENOM_EXACT")
    prior_integrated = denominator.get("prior_integrated_reference_edges")
    draft_edges = denominator.get("unmerged_draft_reference_edges")
    total_edges = denominator.get("reference_edges_total")
    selected_edges = denominator.get("selected_reference_edges")
    req(len(INTEGRATED_EDGES) == prior_integrated, "E_INTEGRATED_EDGE_COUNT")
    req(len(DRAFT_EDGES) == draft_edges, "E_DRAFT_EDGE_COUNT")
    req(not INTEGRATED_EDGES & DRAFT_EDGES, "E_PRIOR_LINEAGE_OVERLAP")
    if all(isinstance(value, int) and not isinstance(value, bool) for value in (total_edges, prior_integrated, draft_edges, selected_edges)):
        req(prior_integrated + draft_edges == 30, "E_PRIOR_ISOLATED_SUM")
        req(denominator.get("remaining_before_subset_main_confirmed") == total_edges - prior_integrated, "E_MAIN_RESIDUAL_BEFORE_SUBSET")
        req(denominator.get("remaining_before_subset_combined") == total_edges - prior_integrated - draft_edges, "E_COMBINED_RESIDUAL_BEFORE_SUBSET")
        req(denominator.get("remaining_after_subset_main_confirmed") == total_edges - prior_integrated - selected_edges, "E_MAIN_RESIDUAL_AFTER_SUBSET")
        req(denominator.get("remaining_after_subset_combined") == total_edges - prior_integrated - draft_edges - selected_edges, "E_COMBINED_RESIDUAL_AFTER_SUBSET")
    edge_denominator = inv.get("reference_edge_denominator", {})
    req(edge_denominator == {
        "snapshot_role": "capture_time_c354b7d9",
        "holding_total": 788, "prior_integrated": 26, "unmerged_draft": 4,
        "remaining_before_main_confirmed": 762, "remaining_before_combined": 758, "selected": 24,
        "remaining_after_main_confirmed": 738, "remaining_after_combined": 734,
        "selected_source_line_refs": 24, "selected_target_blob_refs": 24, "unique_source_line_spans": 24,
    }, "E_EDGE_DENOM_EXACT")
    rebaseline = inv.get("comparison", {}).get("rebaseline", {})
    req(rebaseline == {
        "base_commit": "569d7373c32287bbafadeec6043472563937c5c7",
        "prior_candidate_ref": "PR #1953",
        "status_at_selection": "unmerged_candidate",
        "status_at_rebaseline": "integrated_in_latest_main",
        "integration_commit": "1f39f0b6fc026cf150b80ced317b2d8182db3898",
        "integration_head": "2b18f7d4ef4d73622351d6393d9ef4350c389e65",
        "main_integrated_reference_edges": 30,
        "unmerged_draft_reference_edges": 0,
        "remaining_before_subset_main_confirmed": 758,
        "selected_reference_edges": 24,
        "remaining_after_subset_main_confirmed": 734,
    }, "E_REBASELINE_LINEAGE")
    req(inv.get("reference_edge_denominator_at_rebaseline") == {
        "base_commit": "569d7373c32287bbafadeec6043472563937c5c7",
        "holding_total": 788, "prior_integrated": 30, "unmerged_draft": 0,
        "remaining_before_main_confirmed": 758, "selected": 24,
        "remaining_after_main_confirmed": 734,
    }, "E_REBASELINE_DENOM_EXACT")
    req(rebaseline.get("main_integrated_reference_edges") == len(INTEGRATED_EDGES | DRAFT_EDGES), "E_REBASELINE_INTEGRATED_COUNT")
    req(rebaseline.get("remaining_after_subset_main_confirmed") == len(ref_rows) - len(INTEGRATED_EDGES | DRAFT_EDGES) - len(EXPECTED_EDGES), "E_REBASELINE_RESIDUAL_COUNT")
    basis = inv.get("comparison", {}).get("selection_basis", {})
    req(set(basis.get("integrated_prior_reference_ids", [])) == INTEGRATED_EDGES, "E_INTEGRATED_EDGE_LINEAGE")
    req(set(basis.get("unmerged_draft_reference_ids", [])) == DRAFT_EDGES, "E_DRAFT_EDGE_LINEAGE")
    req(basis.get("status_at_capture") == {
        "main_integrated_reference_edges": 26, "unmerged_draft_reference_edges": 4,
        "draft_candidate_id": "RDP-001-SCF-B-0017-DOC-007-016-030-034", "draft_binding": "SCF-B-0017",
        "draft_lineage": "PR #1953", "draft_status": "draft_not_main_integrated",
    }, "E_STATUS_AT_CAPTURE")
    req(len(inv.get("selected_reference_edges", [])) == 24, "E_EDGE_COUNT")
    req(inv.get("comparison", {}).get("fixed_source_revision") == inv.get("comparison", {}).get("capture_revision"), "E_CAPTURE_REVISION_CONSISTENCY")

    edges = inv.get("selected_reference_edges", [])
    edge_map = {row.get("reference_id"): row for row in edges}
    req(set(edge_map) == EXPECTED_EDGES, "E_EDGE_SCOPE_EXACT")
    req(not set(edge_map) & INTEGRATED_EDGES and not set(edge_map) & DRAFT_EDGES, "E_EDGE_OVERLAP")
    req(all(row.get("source_path") not in BLOCKED_PATHS and row.get("target_path") not in BLOCKED_PATHS for row in edges), "E_BLOCKED_DOC_PAIR_OVERLAP")
    relation_counts: dict[str, int] = defaultdict(int)
    for row in edges:
        relation_counts[row.get("relation_key")] += 1
    req(dict(relation_counts) == EXPECTED_RELATION_COUNTS, "E_RELATION_SELECTION_COUNTS")
    req(len({(row.get("source_path"), row.get("source_line")) for row in edges}) == 24, "E_EDGE_SOURCE_SPAN_DUPLICATE")

    observed_paths = {row.get("source_path") for row in edges} | {row.get("target_path") for row in edges}
    observations = {row.get("source_path"): row for row in inv.get("asset_observations", [])}
    req(set(observations) == observed_paths, "E_ASSET_OBSERVATION_SCOPE")
    req(inv.get("comparison", {}).get("source_blob_count") == len(observed_paths), "E_SOURCE_BLOB_COUNT")
    atomization = inv.get("document_atomization", {})
    req(atomization.get("status") == "not_performed", "E_DOCUMENT_ATOMIZATION_STATUS")
    req(atomization.get("coverage_applies_to_edges_only") is True, "E_DOCUMENT_ATOMIZATION_SCOPE")
    req(atomization.get("source_document_count") == 0 and atomization.get("semantic_atom_count") == 0, "E_DOCUMENT_ATOMIZATION_COUNTS")
    req(atomization.get("full_document_line_coverage") is False, "E_DOCUMENT_FULL_COVERAGE")
    req(atomization.get("atomized_original_id_count") == 0 and atomization.get("unatomized_original_id_count") == 0, "E_DOCUMENT_ID_COUNTS")
    req(atomization.get("reason") == "This bounded subset classifies reference edges. It records exact source reference lines and target blob identity without claiming document line or semantic-atom coverage.", "E_DOCUMENT_ATOMIZATION_REASON")
    req(atomization.get("touched_document_paths") == sorted(observed_paths), "E_DOCUMENT_TOUCHED_PATHS")
    req(atomization.get("unknowns") == ["document ownership and atom boundaries require a separate document-pair or semantic-line review", "edge presence does not prove document adoption, requirement acceptance, or target closure"], "E_DOCUMENT_ATOMIZATION_UNKNOWNS")
    req("atoms" not in inv or inv.get("atoms") == [], "E_NO_DOCUMENT_ATOMS")

    # Every selected edge is checked against the holding row and fixed archive bytes.
    for rid, edge in edge_map.items():
        ledger = ref_map.get(rid)
        req(ledger is not None, f"E_REF_LEDGER:{rid}")
        if ledger is None:
            continue
        for key in ("source_path", "source_file_sha256", "reference_origin", "relation_key", "source_line", "target_path", "target_archive_path", "target_sha256", "target_class", "target_holding", "carry_status", "meaning_change_applied", "human_decision_ref"):
            req(edge.get(key) == ledger.get(key), f"E_REF_FIELD:{rid}:{key}")
        source_record = source_map.get(edge.get("source_path"))
        target_record = source_map.get(edge.get("target_path"))
        req(source_record is not None, f"E_SOURCE_HOLDING:{rid}")
        req(target_record is not None, f"E_TARGET_HOLDING:{rid}")
        if source_record is not None:
            req(source_record.get("sha256") == edge.get("source_file_sha256"), f"E_SOURCE_HOLDING_SHA:{rid}")
            req(edge.get("source_archive_path") == source_record.get("archive_path"), f"E_SOURCE_HOLDING_PATH:{rid}")
        if target_record is not None:
            req(target_record.get("sha256") == edge.get("target_sha256"), f"E_TARGET_HOLDING_SHA:{rid}")
        source_path = archive_for(edge["source_path"])
        target_path = archive_for(edge["target_path"])
        req(os.path.isfile(source_path), f"E_SOURCE_ARCHIVE_MISSING:{rid}")
        req(os.path.isfile(target_path), f"E_TARGET_ARCHIVE_MISSING:{rid}")
        if not os.path.isfile(source_path) or not os.path.isfile(target_path):
            continue
        source_data = open(source_path, "rb").read()
        target_data = open(target_path, "rb").read()
        source_lines = source_data.decode("utf-8").splitlines()
        target_lines = target_data.decode("utf-8").splitlines()
        req(sha(source_data) == edge.get("source_blob_sha256") == edge.get("source_file_sha256"), f"E_SOURCE_BLOB_SHA:{rid}")
        req(sha(target_data) == edge.get("target_blob_sha256") == edge.get("target_sha256"), f"E_TARGET_BLOB_SHA:{rid}")
        line_no = edge.get("source_line")
        req(isinstance(line_no, int) and 1 <= line_no <= len(source_lines), f"E_SOURCE_LINE_BOUNDS:{rid}")
        if isinstance(line_no, int) and 1 <= line_no <= len(source_lines):
            exact = source_lines[line_no - 1]
            req(edge.get("source_line_text") == exact, f"E_SOURCE_LINE_TEXT:{rid}")
            req(edge.get("source_line_sha256") == "sha256:" + sha((exact + "\n").encode()), f"E_SOURCE_LINE_SHA:{rid}")
        req(edge.get("target_line_count") == len(target_lines), f"E_TARGET_LINE_COUNT:{rid}")
        req(edge.get("reference_coverage_kind") == "edge_exact_source_line_plus_target_blob; document atomization is separate and not performed", f"E_EDGE_COVERAGE_KIND:{rid}")
        req(edge.get("candidate_target") == "unresolved", f"E_EDGE_TARGET:{rid}")
        req(edge.get("owner_status") == "candidate_only_unresolved", f"E_EDGE_OWNER_STATUS:{rid}")
        req(edge.get("phase_authority_status") == "unconfirmed", f"E_EDGE_PHASE_STATUS:{rid}")
        req(edge.get("legacy_implementation_status") == "unknown_or_non_executable_source_only", f"E_EDGE_IMPLEMENTATION:{rid}")
        req(edge.get("legacy_execution_performed") is False, f"E_EDGE_EXECUTION:{rid}")
        req(edge.get("consumer_status") == "pending", f"E_EDGE_CONSUMER_STATUS:{rid}")
        req(edge.get("actor_candidates") and edge.get("authority_conditions") and edge.get("negative_conditions"), f"E_EDGE_CONTEXT:{rid}")
        req(edge.get("candidate_role") and edge.get("unresolved_questions"), f"E_EDGE_CLASSIFICATION:{rid}")

    # Asset, phase, decision, failure and consumer observations are all read-only joins.
    for path, observation in observations.items():
        asset = asset_map.get(path)
        phase = phase_map.get(path)
        req(asset is not None, f"E_ASSET_LEDGER:{path}")
        req(phase is not None, f"E_PHASE_LEDGER:{path}")
        archive = archive_for(path)
        req(os.path.isfile(archive), f"E_OBS_ARCHIVE:{path}")
        if asset is None or phase is None or not os.path.isfile(archive):
            continue
        data = open(archive, "rb").read()
        req(observation.get("sha256") == sha(data) == asset.get("source_sha256"), f"E_OBS_SHA:{path}")
        req(observation.get("asset_id") == asset.get("asset_id"), f"E_OBS_ASSET_ID:{path}")
        req(observation.get("asset_disposition") == asset.get("disposition"), f"E_OBS_DISPOSITION:{path}")
        req(observation.get("asset_implementation_status") == asset.get("implementation_status"), f"E_OBS_IMPLEMENTATION:{path}")
        req(observation.get("decision_status") == asset.get("decision_status", "unknown"), f"E_OBS_DECISION_STATUS:{path}")
        req(observation.get("decision_record_ref") == asset.get("decision_record_ref"), f"E_OBS_DECISION_REF:{path}")
        req(observation.get("decision_records") == decisions_by_asset.get(asset.get("asset_id"), []), f"E_OBS_DECISIONS:{path}")
        req(observation.get("phase_candidates") == phase.get("candidate_phase_targets", []), f"E_OBS_PHASES:{path}")
        req(observation.get("product_candidates") == phase.get("candidate_product_targets", []), f"E_OBS_PRODUCTS:{path}")
        req(observation.get("phase_authority_status") == "unconfirmed", f"E_OBS_PHASE_AUTHORITY:{path}")
        req(observation.get("consumer_refs") == asset.get("consumer_refs", []), f"E_OBS_CONSUMER_REFS:{path}")
        req(observation.get("consumer_closure_status") == phase.get("consumer_closure_status", "pending"), f"E_OBS_CONSUMER_STATUS:{path}")
        req(observation.get("failure_evidence", {}).get("ledger_path") == FAILURE, f"E_OBS_FAILURE_LEDGER:{path}")
        req(observation.get("failure_evidence", {}).get("matched_records") == failure_matches(path, failure_rows), f"E_OBS_FAILURE_MATCH:{path}")
        req(observation.get("unresolved") == sorted(set(asset.get("unresolved", [])) | set(phase.get("unresolved", []))), f"E_OBS_UNRESOLVED:{path}")

    return errors


if __name__ == "__main__":
    failures = validate_inventory(load_inventory())
    if failures:
        for failure in failures:
            print(failure, file=sys.stderr)
        raise SystemExit(1)
    inventory = load_inventory()
    d = inventory["reference_edge_denominator"]
    current = inventory["reference_edge_denominator_at_rebaseline"]
    print(f"PASS RDP-001 reference subset: edges={d['selected']} source_lines={d['selected_source_line_refs']} target_blobs={d['selected_target_blob_refs']} capture_main_residual={d['remaining_after_main_confirmed']} rebaseline_main_residual={current['remaining_after_main_confirmed']} docs_atomized=0")
