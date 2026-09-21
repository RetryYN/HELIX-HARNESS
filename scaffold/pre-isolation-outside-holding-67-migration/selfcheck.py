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


def expect_error_code(label, mutate, expected_code):
    inv = copy.deepcopy(base_inv)
    proposal = copy.deepcopy(base_proposal)
    read_after = copy.deepcopy(base_read_after)
    mutate(inv, proposal, read_after)
    errors = check(inv, proposal, read_after)
    if any(error.startswith(expected_code) for error in errors):
        print("PASS", label, expected_code)
    else:
        raise SystemExit("FAIL migration selfcheck: " + label + " expected " + expected_code + ": " + "; ".join(errors))


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
    ("affected capture deletion", lambda i, p, r: i["affected_historical_captures"].pop()),
    ("affected capture count tamper", lambda i, p, r: i.update(affected_historical_capture_count=10)),
    ("repointed source path tamper", lambda i, p, r: i["repointed_sources"][0].update(path="scaffold/current-register.py")),
    ("repointed source historical ref tamper", lambda i, p, r: i["repointed_sources"][0].update(historical_register_ref="docs/governance/management-provisional-requirement-register.jsonl")),
    ("prohibited inference literal tamper", lambda i, p, r: i["prohibited_inference"].__setitem__(0, "historical capture may be regenerated")),
    ("recursive keyset addition", lambda i, p, r: i["base"].update(unexpected_key=True)),
    ("first dependency unknown key", lambda i, p, r: i["dependencies"][0].update(unexpected_key=True)),
    ("first repointed source unknown key", lambda i, p, r: i["repointed_sources"][0].update(unexpected_key=True)),
    ("merged dependency stale status", lambda i, p, r: i["dependencies"][0].update(status="unmerged")),
    ("parent exact head drift", lambda i, p, r: i["dependencies"][1].update(head="0" * 40)),
    ("dependency deletion", lambda i, p, r: i.update(dependencies=[])),
    ("issue projection closure", lambda i, p, r: i["issue_projection"].update(status="updated")),
    ("old execution", lambda i, p, r: i.update(old_runtime_test_ci_execution=True)),
]

for label, mutate in cases:
    expect_failure(label, mutate)

expect_error_code(
    "captured main non-ancestor base",
    lambda i, p, r: i["base"].update(latest_main_commit="41878fff1309ad35a76c8ad439dbc8238cbfd1ea"),
    "E_CAPTURED_MAIN_NOT_ANCESTOR",
)
expect_error_code(
    "recorded PR1978 merge non-ancestor",
    lambda i, p, r: i["dependencies"][1].update(merge_commit="41878fff1309ad35a76c8ad439dbc8238cbfd1ea"),
    "E_PR1978_MERGE_NOT_ANCESTOR",
)

print("PASS outside-67 migration selfcheck: %d existing negative cases + 2 expected-code ancestry cases" % len(cases))
