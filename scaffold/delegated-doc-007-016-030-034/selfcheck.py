#!/usr/bin/env python3
"""Meaningful negative self-checks for the delegated pair scaffold validator."""
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


def atom(doc_id: str, original_id: str, inventory: dict) -> dict:
    return next(row for row in inventory["atoms"] if row["source_document_id"] == doc_id and row["original_id"] == original_id)


def pair(pair_id: str, inventory: dict) -> dict:
    return next(row for row in inventory["comparison"]["pair_groups"] if row["pair_id"] == pair_id)


CASES = [
    ("closure authority_effect", lambda d: d["closure_guard"].__setitem__("authority_effect", "adopted")),
    ("closure meaning_change_applied", lambda d: d["closure_guard"].__setitem__("meaning_change_applied", True)),
    ("closure successor IDs", lambda d: d["closure_guard"]["successor_requirement_ids"].append("REQ-UNRESOLVED")),
    ("closure human decision", lambda d: d["closure_guard"].__setitem__("human_decision_ref", "human:missing")),
    ("closure source carry", lambda d: d["closure_guard"].__setitem__("source_carry_status", "adopted")),
    ("closure reference carry", lambda d: d["closure_guard"].__setitem__("reference_carry_status", "closed")),
    ("closure adoption state", lambda d: d["closure_guard"].__setitem__("adoption_state", "adopted")),
    ("closure holding closure", lambda d: d["closure_guard"].__setitem__("holding_closure", "performed")),
    ("closure prohibited list", lambda d: d["closure_guard"]["prohibited_inference"].remove("owner adoption")),
    ("top-level authority", lambda d: d.__setitem__("authority_effect", "adopted")),
    ("top-level meaning", lambda d: d.__setitem__("meaning_change_applied", True)),
    ("top-level equivalence claim", lambda d: d.__setitem__("equivalence_claim", "equivalent")),
    ("source fixed blob digest", lambda d: d["source_documents"][0].__setitem__("sha256", "0" * 64)),
    ("source full coverage span", lambda d: d["source_documents"][0]["coverage_spans"][0].__setitem__("end_line", 190)),
    ("atom uncovered line list", lambda d: d["source_documents"][0]["atom_coverage"]["uncovered_lines"].pop()),
    ("atom exact text", lambda d: atom("DELEGATED-DOC-007", "LSS-FR-01", d)["source_span"].__setitem__("exact_source_text", "tampered\n")),
    ("atom cross-line original ID", lambda d: atom("DELEGATED-DOC-007", "LSS-FR-01", d)["original_ids"].append("LSS-FR-02")),
    ("atom original ID partition", lambda d: d["source_documents"][0]["original_id_inventory"]["unatomized_original_ids"].append("LSAC-999a")),
    ("atomized original ID", lambda d: next(row for row in d["source_documents"] if row["source_document_id"] == "DELEGATED-DOC-030")["original_id_inventory"]["atomized_original_ids"].remove("HAC-HIL-01a")),
    ("edge source line", lambda d: next(r for r in d["reference_edges"] if r["reference_id"] == "DELEGATED-REF-0320").__setitem__("source_line", 20)),
    ("owner adoption", lambda d: atom("DELEGATED-DOC-016", "LSAT-01", d).__setitem__("candidate_target", "HELIX-HARNESS")),
    ("consumer closure", lambda d: atom("DELEGATED-DOC-016", "LSAT-01", d)["legacy_state"].__setitem__("consumer_status", "closed")),
    ("phase authority", lambda d: d["source_documents"][2]["legacy_state"].__setitem__("phase_authority_status", "authoritative")),
    ("legacy implementation", lambda d: d["source_documents"][1]["legacy_state"].__setitem__("implementation_status", "implemented")),
    ("fixed AC deletion LSS", lambda d: pair("RDP-001-PAIR-DOC-007-016", d)["l10_test_acceptance_refs"].remove("LSAC-01a")),
    ("fixed AC deletion HIL", lambda d: pair("RDP-001-PAIR-DOC-030-034", d)["l10_test_acceptance_refs"].remove("HAC-HIL-01a")),
    ("pair L3 original ID list", lambda d: pair("RDP-001-PAIR-DOC-007-016", d)["l3_original_ids"].pop()),
    ("pair L10 test ID list", lambda d: pair("RDP-001-PAIR-DOC-030-034", d)["l10_original_ids"].pop()),
    ("unresolved crossdoc record", lambda d: d["unresolved_crossdoc_references"].pop()),
    ("remaining source denominator", lambda d: d["comparison"]["holding_denominator"].__setitem__("remaining_source_documents_after_prior_and_selected", 95)),
    ("remaining edge denominator", lambda d: d["comparison"]["holding_denominator"].__setitem__("remaining_reference_edges_after_prior_and_selected", 757)),
    ("fixed revision is not a gate but format remains required", lambda d: d["comparison"].__setitem__("fixed_source_revision", "latest-main")),
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
