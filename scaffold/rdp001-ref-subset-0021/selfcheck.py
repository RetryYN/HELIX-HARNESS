#!/usr/bin/env python3
"""Meaningful fail-closed negative checks for the reference-edge subset."""
from __future__ import annotations

import copy
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import validate  # noqa: E402

INV = os.path.join(HERE, "inventory.json")


def load() -> dict:
    with open(INV, encoding="utf-8") as handle:
        return json.load(handle)


def edge(ref_id: str, inv: dict) -> dict:
    return next(row for row in inv["selected_reference_edges"] if row["reference_id"] == ref_id)


def observation(path: str, inv: dict) -> dict:
    return next(row for row in inv["asset_observations"] if row["source_path"] == path)


CASES = [
    ("selected edge deletion", lambda d: d["selected_reference_edges"].pop()),
    ("selected edge unknown ID", lambda d: d["selected_reference_edges"].append(copy.deepcopy(d["selected_reference_edges"][0]) | {"reference_id": "DELEGATED-REF-9999"})),
    ("source line text", lambda d: edge("DELEGATED-REF-0001", d).__setitem__("source_line_text", "tampered")),
    ("source line digest", lambda d: edge("DELEGATED-REF-0001", d).__setitem__("source_line_sha256", "sha256:" + "0" * 64)),
    ("source blob digest", lambda d: edge("DELEGATED-REF-0001", d).__setitem__("source_blob_sha256", "0" * 64)),
    ("target blob digest", lambda d: edge("DELEGATED-REF-0001", d).__setitem__("target_blob_sha256", "0" * 64)),
    ("source path", lambda d: edge("DELEGATED-REF-0001", d).__setitem__("source_path", "docs/unknown.md")),
    ("target archive path", lambda d: edge("DELEGATED-REF-0001", d).__setitem__("target_archive_path", "archive/unknown.md")),
    ("relation key", lambda d: edge("DELEGATED-REF-0001", d).__setitem__("relation_key", "adopted")),
    ("target class", lambda d: edge("DELEGATED-REF-0001", d).__setitem__("target_class", "current_authority")),
    ("source line number", lambda d: edge("DELEGATED-REF-0001", d).__setitem__("source_line", 8)),
    ("candidate target adoption", lambda d: edge("DELEGATED-REF-0001", d).__setitem__("candidate_target", "HELIX-HARNESS")),
    ("owner adoption status", lambda d: edge("DELEGATED-REF-0001", d).__setitem__("owner_status", "adopted")),
    ("phase authority", lambda d: edge("DELEGATED-REF-0001", d).__setitem__("phase_authority_status", "authoritative")),
    ("legacy implementation", lambda d: edge("DELEGATED-REF-0001", d).__setitem__("legacy_implementation_status", "implemented")),
    ("legacy execution", lambda d: edge("DELEGATED-REF-0001", d).__setitem__("legacy_execution_performed", True)),
    ("consumer closure", lambda d: edge("DELEGATED-REF-0001", d).__setitem__("consumer_status", "closed")),
    ("meaning change", lambda d: edge("DELEGATED-REF-0001", d).__setitem__("meaning_change_applied", True)),
    ("asset SHA", lambda d: observation("docs/design/harness/L1-requirements/business-requirements.md", d).__setitem__("sha256", "0" * 64)),
    ("asset disposition", lambda d: observation("docs/design/harness/L1-requirements/business-requirements.md", d).__setitem__("asset_disposition", "adopted")),
    ("phase candidates", lambda d: observation("docs/design/helix/L3-requirements/pillar-functional-requirements.md", d).__setitem__("phase_candidates", ["PHCAP-99"])),
    ("decision record evidence", lambda d: observation("docs/design/harness/L1-requirements/business-requirements.md", d)["decision_records"].pop()),
    ("failure evidence", lambda d: observation("docs/governance/l3-progression-authority-rebaseline-2026-07-19.md", d)["failure_evidence"]["matched_records"].append({"rule_id": "FAKE"})),
    ("consumer refs", lambda d: observation("docs/design/harness/L1-requirements/business-requirements.md", d)["consumer_refs"].append("consumer-adopted")),
    ("document atomization status", lambda d: d["document_atomization"].__setitem__("status", "complete")),
    ("document atom count", lambda d: d["document_atomization"].__setitem__("semantic_atom_count", 1)),
    ("document line coverage", lambda d: d["document_atomization"].__setitem__("full_document_line_coverage", True)),
    ("document touched path", lambda d: d["document_atomization"]["touched_document_paths"].pop()),
    ("integrated denominator", lambda d: d["comparison"]["holding_denominator"].__setitem__("prior_integrated_reference_edges", 25)),
    ("draft denominator", lambda d: d["comparison"]["holding_denominator"].__setitem__("unmerged_draft_reference_edges", 3)),
    ("selected denominator", lambda d: d["comparison"]["holding_denominator"].__setitem__("selected_reference_edges", 23)),
    ("main residual denominator", lambda d: d["reference_edge_denominator"].__setitem__("remaining_after_main_confirmed", 739)),
    ("combined residual denominator", lambda d: d["reference_edge_denominator"].__setitem__("remaining_after_combined", 735)),
    ("draft status at capture", lambda d: d["comparison"]["holding_denominator"].__setitem__("unmerged_draft_status_at_capture", "integrated")),
    ("draft PR lineage", lambda d: d["comparison"]["selection_basis"]["status_at_capture"].__setitem__("draft_lineage", "PR #9999")),
    ("closure authority", lambda d: d["closure_guard"].__setitem__("authority_effect", "adopted")),
    ("closure meaning", lambda d: d["closure_guard"].__setitem__("meaning_change_applied", True)),
    ("closure successor", lambda d: d["closure_guard"]["successor_requirement_ids"].append("REQ-1")),
    ("closure human decision", lambda d: d["closure_guard"].__setitem__("human_decision_ref", "decision:1")),
    ("closure source carry", lambda d: d["closure_guard"].__setitem__("source_carry_status", "adopted")),
    ("closure reference carry", lambda d: d["closure_guard"].__setitem__("reference_carry_status", "closed")),
    ("closure adoption", lambda d: d["closure_guard"].__setitem__("adoption_state", "adopted")),
    ("closure holding closure", lambda d: d["closure_guard"].__setitem__("holding_closure", "performed")),
    ("closure prohibited inference", lambda d: d["closure_guard"]["prohibited_inference"].remove("owner adoption")),
    ("top-level authority", lambda d: d.__setitem__("authority_effect", "adopted")),
    ("equivalence claim", lambda d: d.__setitem__("equivalence_claim", "equivalent")),
    ("capture revision", lambda d: d["comparison"].__setitem__("fixed_source_revision", "latest-main")),
]


def main() -> None:
    baseline = load()
    baseline_errors = validate.validate_inventory(baseline, ROOT)
    if baseline_errors:
        for error in baseline_errors:
            print(error, file=sys.stderr)
        raise SystemExit("baseline validator is not green")
    for name, mutate in CASES:
        candidate = copy.deepcopy(baseline)
        mutate(candidate)
        failures = validate.validate_inventory(candidate, ROOT)
        if not failures:
            raise SystemExit(f"NEGATIVE CASE DID NOT FAIL: {name}")
        print(f"PASS negative: {name}")
    print(f"PASS selfchecks: {len(CASES)} negative cases")


if __name__ == "__main__":
    main()
