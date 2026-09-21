#!/usr/bin/env python3
"""Negative checks for the bounded outside-67 rows 16-30 evidence."""

from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("outside_validator_16_30", HERE / "validate.py")
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
    ("requirement adoption invention", lambda x: x["rows"][0].update(successor_requirement_ids=["REQ-001"])),
    ("selection range change", lambda x: x["scope"].update(selection_rule="rows 1 through 15")),
    ("holding loss", lambda x: x["live_holdings"].pop()),
    ("path inclusion promotion", lambda x: x["rows"][0].update(existing_holding_inclusion_relation="included")),
    ("new holding resolution", lambda x: x["rows"][0].update(new_holding_needed="resolved")),
    ("pre-isolation blob tamper", lambda x: x["rows"][0]["pre_isolation"].update(blob_oid="0" * 40)),
    ("archive relation tamper", lambda x: x["rows"][0]["archive"].update(relation_to_pre_isolation="equivalent")),
    ("product promotion", lambda x: x["rows"][0].update(product_status="approved")),
    ("phase promotion", lambda x: x["rows"][0].update(phase_status="classified")),
    ("implementation promotion", lambda x: x["rows"][0].update(implementation_status="implemented")),
    ("degradation promotion", lambda x: x["rows"][0].update(degradation_assessment="degraded_to_candidate")),
    ("current path invention", lambda x: x["rows"][0]["current_capture"].update(state="present")),
    ("holding relation evidence invention", lambda x: x["rows"][0]["live_holding_relations"][0].update(path_match_count=1)),
    ("old execution", lambda x: x.update(old_runtime_test_ci_execution=True)),
    ("source set digest tamper", lambda x: x["scope"].update(source_set_sha256="0" * 64)),
    ("prohibited boundary deletion", lambda x: x["prohibited_inference"].pop()),
]

for label, mutate in cases:
    expect_failure(label, mutate)

print("PASS outside-67 rows 16-30 selfcheck: %d negative cases" % len(cases))
