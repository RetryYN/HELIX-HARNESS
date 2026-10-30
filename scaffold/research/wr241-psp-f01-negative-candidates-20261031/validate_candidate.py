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

def main() -> None:
    comparison = load(HERE / "comparison.json")
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
    print("ok: fixed blind, 7 source pins, 17 candidate pointers (12 supported candidates / 5 unresolved), 22 typed L8-to-L9 expected projections")

if __name__ == "__main__":
    main()
