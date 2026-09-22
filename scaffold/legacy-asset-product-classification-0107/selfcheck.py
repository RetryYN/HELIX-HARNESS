#!/usr/bin/env python3
"""Exercise SCF-B-0107 validator negative cases with expected error codes."""
from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("scf_b_0107_validate", HERE / "validate.py")
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

original_ledger = module.LEDGER
original_inventory = module.INVENTORY
module.verify()
base_rows = module.local_jsonl(original_ledger)
base_inventory = module.local_json(original_inventory)


def tagged(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def run_case(label: str, expected_code: str, mutate_rows=None, mutate_inventory=None, mutate_module=None) -> None:
    rows = copy.deepcopy(base_rows)
    inventory = copy.deepcopy(base_inventory)
    if mutate_rows:
        mutate_rows(rows)
    if mutate_inventory:
        mutate_inventory(inventory)
    old_base = module.BASE_REVISION
    try:
        with tempfile.TemporaryDirectory(prefix="scf-b-0107-selfcheck-") as tmp:
            root = Path(tmp)
            ledger = root / original_ledger.name
            ledger.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for row in rows))
            inventory["output_sha256"] = tagged(ledger.read_bytes())
            inv = root / original_inventory.name
            inv.write_text(json.dumps(inventory, ensure_ascii=False, sort_keys=True, indent=2) + "\n")
            module.LEDGER = ledger
            module.INVENTORY = inv
            if mutate_module:
                mutate_module(module)
            try:
                module.verify()
            except AssertionError as exc:
                if expected_code not in str(exc):
                    raise AssertionError(f"{label}: expected {expected_code}, got {exc}") from exc
                print(f"PASS negative: {label} [{expected_code}]")
            else:
                raise AssertionError(f"{label}: mutation was accepted")
    finally:
        module.LEDGER = original_ledger
        module.INVENTORY = original_inventory
        module.BASE_REVISION = old_base


def remove_last_record(rows):
    rows.pop()


def duplicate_first_record(rows):
    rows.append(copy.deepcopy(rows[0]))


def remove_edge(rows):
    rows[0]["wave_semantic_links"].pop()


def duplicate_edge(rows):
    rows[0]["wave_semantic_links"].append(copy.deepcopy(rows[0]["wave_semantic_links"][0]))


def source_digest(rows):
    rows[0]["source_exact"]["sha256"] = "sha256:" + "0" * 64


def candidate_product(rows):
    rows[0]["candidate_products"] = ["HELIX-Web"]


def added_formal_owner(rows):
    rows[0]["formal_owner"] = "HELIX-OS"


def source_read_mode(rows):
    rows[0]["source_exact"]["read_mode"] = "executed"


def inventory_authority(inventory):
    inventory["authority_boundary"]["authority_effect"] = "approved"


def inventory_rule(inventory):
    inventory["classification_rule"]["direct_product_basis"] = "filename only"


def authority_promotion(rows):
    rows[0]["authority_effect"] = "approved"
    rows[0]["classification_state"] = "effective"
    rows[0]["formal_asset_classification_updated"] = True
    rows[0]["new_build_allowed"] = True


def boundary_digest(rows):
    rows[0]["boundary_evidence"]["HELIX-OS"]["ranges"][0]["line_text_sha256"] = "sha256:" + "f" * 64


def remove_input(inventory):
    inventory["input_digests"].pop()


def duplicate_input(inventory):
    inventory["input_digests"].append(copy.deepcopy(inventory["input_digests"][0]))


def non_ancestor(module):
    module.BASE_REVISION = "0" * 40


run_case("target record omission", "E_TARGET_SET", mutate_rows=remove_last_record)
run_case("target record duplicate", "E_TARGET_SET", mutate_rows=duplicate_first_record)
run_case("edge omission", "E_EDGE_SET", mutate_rows=remove_edge)
run_case("edge duplicate", "E_EDGE_SET", mutate_rows=duplicate_edge)
run_case("source digest tamper", "E_SOURCE_DIGEST", mutate_rows=source_digest)
run_case("candidate product tamper", "E_CANDIDATE_PRODUCTS", mutate_rows=candidate_product)
run_case("extra formal owner", "E_RECORD_SCHEMA", mutate_rows=added_formal_owner)
run_case("source read mode tamper", "E_SOURCE_DIGEST", mutate_rows=source_read_mode)
run_case("authority promotion", "E_AUTHORITY_PROMOTION", mutate_rows=authority_promotion)
run_case("boundary line digest tamper", "E_BOUNDARY_DIGEST", mutate_rows=boundary_digest)
run_case("input digest omission", "E_INPUT_SET", mutate_inventory=remove_input)
run_case("input digest duplicate", "E_INPUT_SET", mutate_inventory=duplicate_input)
run_case("inventory authority promotion", "E_INVENTORY_DECLARATION", mutate_inventory=inventory_authority)
run_case("inventory classification rule tamper", "E_INVENTORY_DECLARATION", mutate_inventory=inventory_rule)
run_case("fixed BASE non-ancestor", "E_BASE_NOT_ANCESTOR", mutate_module=non_ancestor)
print("SCF-B-0107 selfcheck: PASS negative_cases=15")
