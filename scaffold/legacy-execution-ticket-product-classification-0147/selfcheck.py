#!/usr/bin/env python3
"""Small negative checks for required non-promotion and identity boundaries."""
from __future__ import annotations

import copy
import json
import importlib.util
from pathlib import Path

BUNDLE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("scf0147_validate", BUNDLE / "validate.py")
validator = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(validator)
records = [json.loads(line) for line in (BUNDLE / "classification-research.jsonl").read_text().splitlines() if line.strip()]
inventory = json.loads((BUNDLE / "inventory.json").read_text())


def rejected(mutator) -> None:
    candidate = copy.deepcopy(records)
    candidate_inventory = copy.deepcopy(inventory)
    mutator(candidate, candidate_inventory)
    assert validator.validate_records(candidate, candidate_inventory), "negative mutation was accepted"


rejected(lambda r, i: (r.pop(), r.append(copy.deepcopy(r[0]))))
rejected(lambda r, a: r[0]["source_exact"].__setitem__("sha256", "sha256:" + "0" * 64))
rejected(lambda r, i: (r[0]["phase"].__setitem__("formal_phase_admission", True), r[0]["implementation_degradation"].__setitem__("implementation_status", "implemented")))
rejected(lambda r, i: (r[0]["authority_boundary"].__setitem__("authority_effect", "formal"), i["comparison_sets"][1].__setitem__("revision", "0" * 40)))
print("SCF-B-0147 negative selfcheck passed: identity, provenance, phase/implementation, authority/overlap")
