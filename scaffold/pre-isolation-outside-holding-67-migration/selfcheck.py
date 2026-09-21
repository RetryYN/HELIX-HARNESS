#!/usr/bin/env python3
"""Negative checks for the independent migration validator."""

from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("migration_validator", HERE / "validate.py")
validator = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(validator)
base_inv = json.loads((HERE / "migration.json").read_text(encoding="utf-8"))
base_proposal = json.loads((HERE / "proposed-register-record.json").read_text(encoding="utf-8"))
base_read_after = json.loads((HERE / "read-after-14.json").read_text(encoding="utf-8"))


def check(inv, proposal, read_after):
    return validator.validate(inv, proposal, read_after)


errors = check(base_inv, base_proposal, base_read_after)
if errors:
    raise SystemExit("FAIL migration selfcheck baseline: " + "; ".join(errors))
print("PASS baseline migration validator")


def expect_failure(label, mutate):
    inv = copy.deepcopy(base_inv)
    proposal = copy.deepcopy(base_proposal)
    read_after = copy.deepcopy(base_read_after)
    mutate(inv, proposal, read_after)
    if check(inv, proposal, read_after):
        print("PASS", label)
    else:
        raise SystemExit("FAIL migration selfcheck: " + label)


cases = [
    ("append flag removal", lambda i, p, r: i.update(formal_register_append=False)),
    ("historical snapshot digest tamper", lambda i, p, r: i["historical_capture"].update(register_sha256="0" * 64)),
    ("source count tamper", lambda i, p, r: i["source_set"].update(count=66)),
    ("source digest tamper", lambda i, p, r: p.update(source_atom_set_digest="sha256:" + "0" * 64)),
    ("coverage receipt scaffold ref", lambda i, p, r: p.update(coverage_receipt_ref="scaffold/pre-isolation-outside-holding-67-proposal/inventory.json")),
    ("proposal authority promotion", lambda i, p, r: p.update(authority_effect="approved")),
    ("register count tamper", lambda i, p, r: i["formal_append"].update(register_record_count=32)),
    ("read-after live count tamper", lambda i, p, r: r.update(live_holding_count=13)),
    ("read-after old capture replacement", lambda i, p, r: r.update(historical_capture_preserved=False)),
    ("read-after new ID deletion", lambda i, p, r: r.update(added_registration_ids=[])),
    ("historical append prefix deletion", lambda i, p, r: i["formal_append"].update(append_only_prefix_preserved=False)),
    ("path item adoption", lambda i, p, r: i["source_set"].update(requirement_atoms=True)),
    ("unmerged dependency deletion", lambda i, p, r: i.update(unmerged_dependencies=[])),
    ("issue projection closure", lambda i, p, r: i["issue_projection"].update(status="updated")),
    ("old execution", lambda i, p, r: i.update(old_runtime_test_ci_execution=True)),
]

for label, mutate in cases:
    expect_failure(label, mutate)

print("PASS outside-67 migration selfcheck: %d negative cases" % len(cases))
