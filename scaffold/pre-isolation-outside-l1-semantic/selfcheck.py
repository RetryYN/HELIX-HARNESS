#!/usr/bin/env python3
"""Negative checks for the four-product L1 semantic evidence candidate."""

from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("l1_validator", HERE / "validate.py")
validator = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(validator)
base = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))

baseline_errors = validator.validate(base)
if baseline_errors:
    raise SystemExit("FAIL selfcheck baseline: " + "; ".join(baseline_errors))
print("PASS baseline validator")


def expect_failure(label, mutate):
    candidate = copy.deepcopy(base)
    mutate(candidate)
    if validator.validate(candidate):
        print("PASS", label)
    else:
        raise SystemExit("FAIL selfcheck: " + label)


cases = [
    ("authority promotion", lambda x: x.update(authority_effect="adopted")),
    ("semantic promotion", lambda x: x["cases"][0].update(semantic_relation="exact")),
    ("current approval tamper", lambda x: x["cases"][0]["current_approved_l1"].update(sha256="0" * 64)),
    ("old blob tamper", lambda x: x["cases"][0]["old_source"].update(blob_oid="0" * 40)),
    ("holding inclusion promotion", lambda x: x["cases"][0].update(existing_holding_relation="included")),
    ("holding match invention", lambda x: x["cases"][0]["live_holding_relations"][0].update(path_match_count=1)),
    ("preservation resolution", lambda x: x["cases"][0].update(preservation_disposition="resolved")),
    ("source holding creation", lambda x: x.update(formal_source_holding_created=True)),
    ("line anchor tamper", lambda x: x["cases"][0]["line_anchored_evidence"][0].update(claim="changed")),
    ("old execution", lambda x: x.update(old_runtime_test_ci_execution=True)),
    ("prohibited boundary deletion", lambda x: x["prohibited_inference"].pop()),
]

for label, mutate in cases:
    expect_failure(label, mutate)

print("PASS outside-67 L1 semantic selfcheck: %d negative cases" % len(cases))
