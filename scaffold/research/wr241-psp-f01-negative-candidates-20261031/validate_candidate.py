#!/usr/bin/env python3
"""WR241 F01 candidate evidence validator; static JSON/source checks only."""
from __future__ import annotations
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HERE = ROOT / "scaffold/research/wr241-psp-f01-negative-candidates-20261031"

def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def load(path: Path):
    return json.loads(path.read_text())

def unwrap(value):
    if isinstance(value, dict) and {"state", "value"} <= value.keys():
        return unwrap(value["value"]) if value["state"] == "known" else value["state"]
    if isinstance(value, dict):
        return {k: unwrap(v) for k, v in value.items() if k not in {"source_packet_ref", "reason"}}
    if isinstance(value, list):
        return [unwrap(v) for v in value]
    return value

def key_paths(value, names, prefix=""):
    found = []
    if isinstance(value, dict):
        for key, child in value.items():
            path = f"{prefix}/{key}"
            if any(token in key.lower() for token in names):
                found.append(path)
            found.extend(key_paths(child, names, path))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            found.extend(key_paths(child, names, f"{prefix}/{index}"))
    return found

def main() -> None:
    comparison = load(HERE / "comparison.json")
    assignment_audit = load(HERE / "assignment-comparison-r1.json")
    assert sha(HERE / "comparison.json") == assignment_audit["prior_comparison"]["sha256"]
    pins = comparison["source_pins"]
    for item in pins.values():
        assert sha(ROOT / item["path"]) == item["sha256"], item["path"]
    blind_path = HERE / "source-only-fixed.json"
    assert sha(blind_path) == comparison["fixed_blind"]["sha256"]
    blind = load(blind_path)
    rows = blind["derived_L8_proposal"]["source_only_class_candidate_links"]
    assert len(rows) == 17
    assert all(r["formed_finding"] == "unknown" for r in rows)
    assert all(r["observed_processing_result"] == "not present in inspected source fields" for r in rows)
    audit = comparison["source_only_candidate_rows"]
    assert [(r["l9_pointer"], r["l9_row_id"]) for r in audit] == [(r["l9_pointer"], r["l9_row_id"]) for r in rows]
    assert sum(r["candidate_status"] == "candidate_condition_supported" for r in audit) == 12
    assert sum(r["candidate_status"] != "candidate_condition_supported" for r in audit) == 5

    l8_doc = load(ROOT / pins["L8"]["path"])
    l9_doc = load(ROOT / pins["L9"]["path"])
    l8 = l8_doc["cases"][1]["cases"]
    l9_case = l9_doc["cases"][1]
    l9 = {row["id"]: row["expected_material"] for row in l9_case["normal_cases"] + l9_case["negative_cases"]}
    assert len(l8) == 22 and len(l9) == 22
    for row in l8:
        case_id = row["basic_case_ref"]
        assert case_id in l9, case_id
        projected = unwrap(row["expected_partial_values"])
        assert len(projected) == 9
        assert set(projected) <= set(l9[case_id]), case_id
        assert all(projected[key] == l9[case_id][key] for key in projected), case_id
    assert comparison["L8_L9_existing_case_projection"]["matched_rows"] == 22
    assert comparison["L8_L9_existing_case_projection"]["mismatched_rows"] == 0

    l9_rows = l9_case["negative_cases"]
    blind_by_id = {row["l9_row_id"]: row for row in rows}
    assignment_rows = assignment_audit["rows"]
    assert len(l9_rows) == len(assignment_rows) == 17
    relation_counts = {
        "assigned_class_matches_blind_candidate": 0,
        "both_unassigned": 0,
        "l9_assignment_conflicts_with_blind_class_unresolved": 0,
    }
    for index, source_row in enumerate(l9_rows):
        audit_row = assignment_rows[index]
        row_id = source_row["id"]
        blind_row = blind_by_id[row_id]
        assignment = source_row.get("negative_class_assignment")
        l9_class = assignment.get("classification") if assignment else None
        blind_class = blind_row.get("l4_class_id")
        assert audit_row["l9_pointer"] == f"/cases/1/negative_cases/{index}"
        assert audit_row["l9_row_id"] == row_id
        assert audit_row["l9_assignment_classification"] == l9_class
        if blind_class is not None and blind_class == l9_class:
            relation = "assigned_class_matches_blind_candidate"
        elif blind_class is None and l9_class is None:
            relation = "both_unassigned"
        else:
            relation = "l9_assignment_conflicts_with_blind_class_unresolved"
        assert audit_row["comparison"] == relation, row_id
        relation_counts[relation] += 1
        assert audit_row["formed_finding"] == "unknown"
        assert audit_row["observed_processing_result"] == "not present in inspected source fields"
    assert relation_counts == assignment_audit["assignment_comparison_counts"]
    assert relation_counts == {
        "assigned_class_matches_blind_candidate": 12,
        "both_unassigned": 2,
        "l9_assignment_conflicts_with_blind_class_unresolved": 3,
    }

    l3 = load(ROOT / pins["L3"]["path"])["requirements"][64]
    l10 = load(ROOT / pins["L10"]["path"])["cases"][64]
    l8_f01 = l8_doc["cases"][1]
    assert l3["oracle_ref"] == l10["id"] == l8_f01["l10_ref"]
    row_level_keys = {"oracle", "citation", "test_ref", "test_id", "u_id"}
    assert not key_paths(l8_f01["cases"], row_level_keys)
    contract_record = assignment_audit["oracle_and_u_id_scope"]["contract_oracle"]
    assert contract_record["value"] == l3["oracle_ref"]
    assert contract_record["l10_id"] == l10["id"]
    print("ok: fixed blind and comparison bytes, 7 source pins, 22 L8/L9 expected projections, 17 assignment rows (12 match / 2 both unassigned / 3 discrepancy), contract oracle present and per-U-ID oracle/test citation absent")

if __name__ == "__main__":
    main()
