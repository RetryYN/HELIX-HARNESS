#!/usr/bin/env python3
"""Fail-close negative checks for the final bounded Vision subset."""
from __future__ import annotations
import copy
import importlib.util
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("validator", HERE / "validate.py")
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
base = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
atoms = [json.loads(line) for line in (HERE / "semantic-atoms.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]

def expect(label, mutate, expected):
    inventory = copy.deepcopy(base)
    candidates = copy.deepcopy(atoms)
    mutate(inventory, candidates)
    try:
        validator.validate(inventory, candidates, [])
    except AssertionError as exc:
        if not str(exc).startswith(expected):
            raise AssertionError(f"{label}: expected {expected}, got {exc}")
        return
    raise AssertionError(f"{label}: mutation accepted")

def swap_reasons(inventory, candidates):
    left = candidates[3]["composite_reason"]
    candidates[3]["composite_reason"] = candidates[4]["composite_reason"]
    candidates[4]["composite_reason"] = left

validator.validate(base, atoms, [])
cases = [
    ("parent_denominator", lambda i, a: i["scope"].__setitem__("unprocessed_parent_span_count", 1), "E_PARENT_DENOM"),
    ("selected_parent_duplicate", lambda i, a: i["scope"]["selected_parent_span_ids"].__setitem__(1, "VISION-U17"), "E_PARENT_DENOM"),
    ("prior_span_overlap", lambda i, a: i["scope"]["selected_parent_span_ids"].__setitem__(0, "VISION-U16"), "E_PARENT_DENOM"),
    ("source_text", lambda i, a: a[0].__setitem__("exact_source_text", "tampered"), "E_ATOM_TEXT"),
    ("parent_containment", lambda i, a: a[0].__setitem__("source_line_start", 539), "E_ATOM_META"),
    ("prior_line_overlap", lambda i, a: a[0].__setitem__("source_line_start", 539), "E_ATOM_META"),
    ("product_boundary_status", lambda i, a: i["candidate_products"][0].__setitem__("implementation_status", "implemented"), "E_PRODUCT_STATUS"),
    ("atom_kind_drift", lambda i, a: a[0].__setitem__("atomization_status", "composite_unresolved"), "E_ATOM_META"),
    ("candidate_product_promotion", lambda i, a: a[1]["candidate_product_candidates"].append("HELIX-Unknown"), "E_PRODUCT_CANDIDATES"),
    ("composite_reason_replacement", lambda i, a: a[3].__setitem__("composite_reason", "replaced"), "E_COMPOSITE_REASON"),
    ("composite_reason_swap", swap_reasons, "E_COMPOSITE_REASON"),
    ("implementation_promotion", lambda i, a: a[0].__setitem__("current_implementation_status", "implemented"), "E_ATOM_STATUS"),
    ("degradation_promotion", lambda i, a: a[0].__setitem__("current_degradation_status", "degraded"), "E_ATOM_STATUS"),
    ("phase_promotion", lambda i, a: a[0].__setitem__("phase_status", "admitted"), "E_ATOM_STATUS"),
    ("unimplemented_claim", lambda i, a: a[0].__setitem__("unimplemented_status", "unimplemented"), "E_ATOM_UNRESOLVED"),
    ("formal_count", lambda i, a: i.__setitem__("formal_requirement_unit_count", 9), "E_BOUNDARY"),
    ("nested_key", lambda i, a: a[0].__setitem__("unknown", "x"), "E_ATOM_KEYS"),
]
for case in cases:
    expect(*case)
print(f"PASS selfcheck: baseline + {len(cases)} negative cases")
