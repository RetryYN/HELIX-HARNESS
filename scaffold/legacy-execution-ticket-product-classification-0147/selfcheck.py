#!/usr/bin/env python3
"""One-field-at-a-time negative checks with explicit expected validator codes."""
from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path

BUNDLE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("scf0147_validate", BUNDLE / "validate.py")
validator = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(validator)
records = [json.loads(line) for line in (BUNDLE / "classification-research.jsonl").read_text().splitlines() if line.strip()]
inventory = json.loads((BUNDLE / "inventory.json").read_text())


def rejected(name: str, mutator, expected_code: str) -> None:
    candidate = copy.deepcopy(records)
    candidate_inventory = copy.deepcopy(inventory)
    mutator(candidate, candidate_inventory)
    errors = validator.validate_records(candidate, candidate_inventory)
    assert any(error.startswith(expected_code) for error in errors), f"{name}: expected {expected_code}, got {errors}"


CASES = [
    ("base revision", lambda r, i: i.__setitem__("base_revision", "0" * 40), "E_BASE_REVISION"),
    ("asset omission", lambda r, i: r.pop(), "E_RECORD_SCHEMA"),
    ("record null object", lambda r, i: r[0].__setitem__("source_exact", None), "E_RECORD_SCHEMA"),
    ("ledger line type", lambda r, i: r[0]["ledger"].__setitem__("line", 1.0), "E_LEDGER"),
    ("semantic anchor omission", lambda r, i: r[0]["source_exact"].__setitem__("semantic_anchors", []), "E_ANCHOR"),
    ("semantic anchor content", lambda r, i: r[0]["source_exact"]["semantic_anchors"][0].__setitem__("text", "tampered"), "E_ANCHOR"),
    ("classification product", lambda r, i: r[0]["classification"].__setitem__("candidate_products", ["HELIX-Web"]), "E_PRODUCT"),
    ("category contradiction", lambda r, i: r[0]["classification"].__setitem__("status", "insufficient_basis"), "E_PRODUCT"),
    ("boundary evidence removal", lambda r, i: r[0]["classification"].__setitem__("boundary_evidence", []), "E_BOUNDARY"),
    ("bootstrap candidate removal", lambda r, i: r[0]["phase"].__setitem__("bootstrap_candidate_product_targets", []), "E_PHASE"),
    ("phase admission promotion", lambda r, i: r[0]["phase"].__setitem__("formal_phase_admission", True), "E_PHASE"),
    ("implementation promotion", lambda r, i: r[0]["implementation_degradation"].__setitem__("implementation_status", "implemented"), "E_IMPLEMENTATION"),
    ("record authority promotion", lambda r, i: r[0]["authority_boundary"].__setitem__("authority_effect", "formal"), "E_AUTHORITY"),
    ("consumer closure promotion", lambda r, i: r[0]["history_failure_consumer"].__setitem__("consumer_closure_status", "closed"), "E_CONSUMER"),
    ("consumer direct ref removal", lambda r, i: r[3]["history_failure_consumer"].__setitem__("direct_refs", []), "E_OUTPUT_DIGEST"),
    ("history match flip", lambda r, i: r[0]["history_failure_consumer"].__setitem__("decision_log_asset_match", True), "E_CONSUMER"),
    ("comparison set revision", lambda r, i: i["comparison_sets"][0].__setitem__("revision", "0" * 40), "E_COMPARISON_SET"),
    ("comparison set type", lambda r, i: i["comparison_sets"][0].__setitem__("rows", True), "E_COMPARISON_SET"),
    ("inventory authority", lambda r, i: i["authority_boundary"].__setitem__("authority_effect", "formal"), "E_AUTHORITY"),
    ("ledger reason tamper", lambda r, i: r[0]["classification"].__setitem__("rationale", "tampered"), "E_OUTPUT_DIGEST"),
    ("unknown inventory key", lambda r, i: i.__setitem__("approved_by", "human"), "E_INVENTORY_SCHEMA"),
    ("null comparison set", lambda r, i: i.__setitem__("comparison_sets", None), "E_INVENTORY_SCHEMA"),
    ("duplicate asset", lambda r, i: r[1].__setitem__("asset_id", r[0]["asset_id"]), "E_DUPLICATE"),
]
for name, mutator, expected_code in CASES:
    rejected(name, mutator, expected_code)
null_inventory_errors = validator.validate_records(copy.deepcopy(records), None)
assert null_inventory_errors == ["E_INVENTORY_SCHEMA"], f"null inventory must fail closed: {null_inventory_errors}"

records_bytes = (BUNDLE / "classification-research.jsonl").read_bytes()
inventory_bytes = (BUNDLE / "inventory.json").read_bytes()
binding_bytes = (BUNDLE.parent / "bindings/SCF-B-0147.json").read_bytes()
for name, data, pin, code in [
    ("record byte pin baseline", records_bytes, validator.PINNED_RECORDS_SHA256, "E_RECORD_BYTES"),
    ("inventory byte pin baseline", inventory_bytes, validator.PINNED_INVENTORY_SHA256, "E_INVENTORY_BYTES"),
    ("Binding byte pin baseline", binding_bytes, validator.PINNED_BINDING_SHA256, "E_BINDING_BYTES"),
]:
    assert validator.artifact_pin_errors(data, pin, code) == [], f"{name}: baseline pin failed"
for name, data, pin, code in [
    ("record unknown nested key", records_bytes.replace(b'"asset_id":', b'"approved_by":"human","asset_id":', 1), validator.PINNED_RECORDS_SHA256, "E_RECORD_BYTES"),
    ("ledger CRLF mutation", records_bytes.replace(b"\n", b"\r\n"), validator.PINNED_RECORDS_SHA256, "E_RECORD_BYTES"),
    ("inventory authority mutation", inventory_bytes.replace(b'"authority_effect": "none"', b'"authority_effect": "formal"', 1), validator.PINNED_INVENTORY_SHA256, "E_INVENTORY_BYTES"),
    ("Binding extra authority key", binding_bytes.replace(b'"id": "SCF-B-0147"', b'"approved_by": "human",\n  "id": "SCF-B-0147"', 1), validator.PINNED_BINDING_SHA256, "E_BINDING_BYTES"),
]:
    errors = validator.artifact_pin_errors(data, pin, code)
    assert errors == [code], f"{name}: expected {[code]}, got {errors}"

original_audit_overlap = validator.audit_overlap
validator.audit_overlap = lambda: ({}, {"main": ["asset_id"]})
overlap_errors = validator.validate_records(copy.deepcopy(records), copy.deepcopy(inventory))
validator.audit_overlap = original_audit_overlap
assert any(error.startswith("E_OVERLAP:main") for error in overlap_errors), f"target overlap guard did not fail closed: {overlap_errors}"

print(f"SCF-B-0147 negative selfcheck PASS: {len(CASES) + 6} isolated mutations with expected error codes")
