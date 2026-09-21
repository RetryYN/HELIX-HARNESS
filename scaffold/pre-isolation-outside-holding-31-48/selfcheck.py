#!/usr/bin/env python3
"""Negative checks for bounded outside-67 rows 31 through 48 evidence."""

from __future__ import annotations

import copy
import json
import importlib.util
from pathlib import Path


HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("outside_validator_31_48", HERE / "validate.py")
validator = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(validator)
base = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))

baseline_errors = validator.validate(base)
if baseline_errors:
    raise SystemExit("FAIL selfcheck baseline: " + "; ".join(baseline_errors))
print("PASS baseline validator")


def expect_failure(label, mutate, expected_code):
    candidate = copy.deepcopy(base)
    mutate(candidate)
    if candidate == base:
        raise SystemExit("FAIL selfcheck: " + label + " is a no-op mutation")
    errors = validator.validate(candidate)
    if not errors:
        raise SystemExit("FAIL selfcheck: " + label + " was accepted")
    if expected_code not in errors:
        raise SystemExit("FAIL selfcheck: " + label + " missing " + expected_code + " (got " + ", ".join(errors) + ")")
    print("PASS", label, expected_code)


cases = [
    ("authority promotion", lambda x: x.update(authority_effect="adopted"), "E_AUTHORITY"),
    ("requirement adoption invention", lambda x: x["rows"][0].update(successor_requirement_ids=["REQ-001"]), "E_ROW_BOUNDARY:31"),
    ("selection range change", lambda x: x["scope"].update(selection_rule="rows 1 through 15"), "E_SELECTION_RULE"),
    ("parent-base change", lambda x: x["scope"].update(parent_commit="4919cfd245ee128fee71c713c8d2d0a8cd5fcd11"), "E_PARENT_COMMIT"),
    ("holding loss", lambda x: x["live_holdings"].pop(), "E_LIVE_HOLDING_COUNT"),
    ("path inclusion promotion", lambda x: x["rows"][0].update(existing_holding_inclusion_relation="included"), "E_PHYSICAL_NONINCLUSION:31"),
    ("semantic inclusion resolution", lambda x: x["rows"][0].update(semantic_inclusion_status="semantically_excluded"), "E_SEMANTIC_INCLUSION:31"),
    ("new holding resolution", lambda x: x["rows"][0].update(new_holding_needed="resolved"), "E_NEW_HOLDING:31"),
    ("pre-isolation blob tamper", lambda x: x["rows"][0]["pre_isolation"].update(blob_oid="0" * 40), "E_PRE_PHYSICAL:31"),
    ("archive relation tamper", lambda x: x["rows"][0]["archive"].update(relation_to_pre_isolation="equivalent"), "E_ARCHIVE_RELATION:31"),
    ("product promotion", lambda x: x["rows"][0].update(product_status="approved"), "E_PRODUCT:31"),
    ("phase promotion", lambda x: x["rows"][0].update(phase_status="classified"), "E_PHASE:31"),
    ("implementation promotion", lambda x: x["rows"][0].update(implementation_status="implemented"), "E_IMPLEMENTATION:31"),
    ("degradation promotion", lambda x: x["rows"][0].update(degradation_assessment="degraded_to_candidate"), "E_DEGRADATION:31"),
    ("current path invention", lambda x: x["rows"][0]["current_capture"].update(state="present"), "E_CURRENT_CAPTURE:31"),
    ("holding relation evidence invention", lambda x: x["rows"][0]["live_holding_relations"][0].update(path_match_count=1), "E_RELATION_COUNTS:31:MPR-SH-HEADING-002"),
    ("old execution", lambda x: x.update(old_runtime_test_ci_execution=True), "E_OLD_EXECUTION"),
    ("source set digest tamper", lambda x: x["scope"].update(source_set_sha256="0" * 64), "E_SOURCE_DIGEST"),
    ("prohibited boundary deletion", lambda x: x["prohibited_inference"].pop(), "E_PROHIBITED_INFERENCE"),
    ("findings text replacement", lambda x: x["findings"].__setitem__(0, "changed"), "E_FINDINGS"),
    ("prohibited text reversal", lambda x: x["prohibited_inference"].reverse(), "E_PROHIBITED_INFERENCE"),
    ("extra top-level key", lambda x: x.update(merge_admission="granted"), "E_KEYSET:root"),
    ("extra nested relation key", lambda x: x["rows"][0]["live_holding_relations"][0].update(merge_admission="granted"), "E_KEYSET:rows[].live_holding_relations[]"),
]

for label, mutate, expected_code in cases:
    expect_failure(label, mutate, expected_code)

print("PASS outside-67 rows 31-48 selfcheck: %d negative cases" % len(cases))
