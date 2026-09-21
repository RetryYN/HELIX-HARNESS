#!/usr/bin/env python3
"""Negative checks for the independent outside-67 proposal validator."""

from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("proposal_validator", HERE / "validate.py")
validator = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(validator)
base_inventory = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
base_items = json.loads("[" + ",".join(HERE.joinpath("source-items.jsonl").read_text(encoding="utf-8").splitlines()) + "]")
base_proposal = json.loads((HERE / "proposed-register-record.json").read_text(encoding="utf-8"))


def check(inv, items, proposal):
    return validator.validate(inv, items, proposal)


baseline_errors = check(base_inventory, base_items, base_proposal)
if baseline_errors:
    raise SystemExit("FAIL selfcheck baseline: " + "; ".join(baseline_errors))
print("PASS baseline validator")


def expect_failure(label, mutate):
    inv = copy.deepcopy(base_inventory)
    items = copy.deepcopy(base_items)
    proposal = copy.deepcopy(base_proposal)
    mutate(inv, items, proposal)
    if check(inv, items, proposal):
        print("PASS", label)
    else:
        raise SystemExit("FAIL selfcheck: " + label)


cases = [
    ("authority promotion", lambda i, s, p: i.update(authority_effect="adopted")),
    ("formal register append", lambda i, s, p: i.update(formal_register_append=True)),
    ("item count loss", lambda i, s, p: s.pop()),
    ("item path tamper", lambda i, s, p: s[0].update(source_path="docs/other.md")),
    ("pre-isolation OID tamper", lambda i, s, p: s[0]["pre_isolation"].update(blob_oid="0" * 40)),
    ("archive relation tamper", lambda i, s, p: s[0]["archive"].update(relation_to_pre_isolation="equivalent")),
    ("holding relation invention", lambda i, s, p: s[57]["live_holding_relations"][12].update(path_match_count=2)),
    ("new holding resolution", lambda i, s, p: s[0].update(new_holding_needed="resolved")),
    ("product promotion", lambda i, s, p: s[0]["reported_path_scope"].update(product_status="approved")),
    ("semantic disposition", lambda i, s, p: s[0].update(semantic_disposition="preserve_and_rehome")),
    ("source set digest tamper", lambda i, s, p: i.update(proposal_source_set_sha256="0" * 64)),
    ("proposal atom count tamper", lambda i, s, p: p.update(source_atom_count=66)),
    ("append blocker removal", lambda i, s, p: i["append_assessment"].update(status="ready")),
    ("old execution", lambda i, s, p: i.update(old_runtime_test_ci_execution=True)),
    ("prohibited boundary deletion", lambda i, s, p: i["prohibited_inference"].pop()),
]

for label, mutate in cases:
    expect_failure(label, mutate)

print("PASS outside-67 source_holding proposal selfcheck: %d negative cases" % len(cases))
