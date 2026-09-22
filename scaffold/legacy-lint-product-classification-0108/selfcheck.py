#!/usr/bin/env python3
"""Negative selfcheck for SCF-B-0108."""
from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("scf_b_0108_validate", HERE / "validate.py")
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
original_ledger, original_inventory = module.LEDGER, module.INVENTORY
module.verify()
base_rows, base_inventory = module.local_jsonl(original_ledger), module.local_json(original_inventory)
TARGET_WITH_EDGE = next(i for i, row in enumerate(base_rows) if row["wave_semantic_links"])
MANUAL_REVIEWED = next(i for i, row in enumerate(base_rows) if row["manual_semantic_review"]["status"] == "reviewed_candidate")


def tagged(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def run_case(label, expected_code, mutate_rows=None, mutate_inventory=None, mutate_module=None):
    rows, inventory = copy.deepcopy(base_rows), copy.deepcopy(base_inventory)
    if mutate_rows: mutate_rows(rows)
    if mutate_inventory: mutate_inventory(inventory)
    old_base = module.BASE_REVISION
    try:
        with tempfile.TemporaryDirectory(prefix="scf-b-0108-selfcheck-") as tmp:
            root = Path(tmp)
            ledger = root / original_ledger.name
            ledger.write_text("".join(json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for x in rows))
            inventory["output_sha256"] = tagged(ledger.read_bytes())
            inv = root / original_inventory.name
            inv.write_text(json.dumps(inventory, ensure_ascii=False, sort_keys=True, indent=2) + "\n")
            module.LEDGER, module.INVENTORY = ledger, inv
            if mutate_module: mutate_module(module)
            try:
                module.verify()
            except AssertionError as exc:
                if expected_code not in str(exc): raise AssertionError(f"{label}: expected {expected_code}, got {exc}") from exc
                print(f"PASS negative: {label} [{expected_code}]")
            else:
                raise AssertionError(f"{label}: mutation was accepted")
    finally:
        module.LEDGER, module.INVENTORY, module.BASE_REVISION = original_ledger, original_inventory, old_base


def remove_record(rows): rows.pop()
def duplicate_record(rows): rows.append(copy.deepcopy(rows[0]))
def remove_edge(rows): rows[TARGET_WITH_EDGE]["wave_semantic_links"].pop()
def duplicate_edge(rows): rows[TARGET_WITH_EDGE]["wave_semantic_links"].append(copy.deepcopy(rows[TARGET_WITH_EDGE]["wave_semantic_links"][0]))
def source_digest(rows): rows[0]["source_exact"]["sha256"] = "sha256:" + "0" * 64
def source_anchor(rows): rows[0]["source_exact"]["semantic_anchors"][0]["line_text_sha256"] = "sha256:" + "f" * 64
def profile(rows): rows[0]["source_profile"]["source_products"] = ["HELIX-Web"]
def candidate(rows): rows[0]["candidate_products"] = ["HELIX-Web"]
def authority(rows):
    rows[0]["authority_effect"] = "approved"
    rows[0]["classification_state"] = "effective"
    rows[0]["formal_asset_classification_updated"] = True
    rows[0]["new_build_allowed"] = True
def boundary(rows): rows[0]["boundary_evidence"]["HELIX-OS"]["ranges"][0]["line_text_sha256"] = "sha256:" + "f" * 64
def remove_input(inv): inv["input_digests"].pop()
def duplicate_input(inv): inv["input_digests"].append(copy.deepcopy(inv["input_digests"][0]))
def extra_input(inv): inv["input_digests"].append(copy.deepcopy(inv["input_digests"][0])); inv["input_digests"][-1]["path"] = "docs/extra.jsonl"
def non_ancestor(mod): mod.BASE_REVISION = "0" * 40
def manual_review(rows): rows[MANUAL_REVIEWED]["manual_semantic_review"]["interpretation"] = "tampered"
def manual_inventory(inv): inv["review_counts"]["source_semantic_reviewed"] = 999
def record_top_level_key(rows): rows[0]["formal_owner"] = "HELIX-OS"
def source_read_mode(rows): rows[0]["source_exact"]["read_mode"] = "executed"
def inventory_authority(inv): inv["authority_boundary"]["authority_effect"] = "approved"
def inventory_scope(inv): inv["scope"] = "all source owners approved"
def inventory_formal_update(inv): inv["formal_update"]["product_route_updated"] = True
def inventory_classification_rule(inv): inv["classification_rule"]["direct_product_basis"] = "filename only"


run_case("target record omission", "E_TARGET_SET", mutate_rows=remove_record)
run_case("target record duplicate", "E_TARGET_SET", mutate_rows=duplicate_record)
run_case("edge omission", "E_EDGE_SET", mutate_rows=remove_edge)
run_case("edge duplicate", "E_EDGE_SET", mutate_rows=duplicate_edge)
run_case("source digest tamper", "E_SOURCE_DIGEST", mutate_rows=source_digest)
run_case("source line text digest tamper", "E_SOURCE_ANCHOR", mutate_rows=source_anchor)
run_case("source profile tamper", "E_PROFILE", mutate_rows=profile)
run_case("candidate product tamper", "E_CANDIDATE_PRODUCTS", mutate_rows=candidate)
run_case("authority promotion", "E_AUTHORITY_PROMOTION", mutate_rows=authority)
run_case("boundary line digest tamper", "E_BOUNDARY_DIGEST", mutate_rows=boundary)
run_case("input digest omission", "E_INPUT_SET", mutate_inventory=remove_input)
run_case("input digest duplicate", "E_INPUT_SET", mutate_inventory=duplicate_input)
run_case("input digest extra path", "E_INPUT_SET", mutate_inventory=extra_input)
run_case("manual semantic review tamper", "E_SEMANTIC_REVIEW", mutate_rows=manual_review)
run_case("manual review inventory tamper", "E_SEMANTIC_REVIEW", mutate_inventory=manual_inventory)
run_case("record top-level extra key", "E_RECORD_SCHEMA", mutate_rows=record_top_level_key)
run_case("source read mode tamper", "E_SOURCE_DIGEST", mutate_rows=source_read_mode)
run_case("inventory authority promotion", "E_INVENTORY_DECLARATION", mutate_inventory=inventory_authority)
run_case("inventory scope tamper", "E_INVENTORY_DECLARATION", mutate_inventory=inventory_scope)
run_case("inventory formal update tamper", "E_INVENTORY_DECLARATION", mutate_inventory=inventory_formal_update)
run_case("inventory classification rule tamper", "E_INVENTORY_DECLARATION", mutate_inventory=inventory_classification_rule)
run_case("fixed BASE non-ancestor", "E_BASE_NOT_ANCESTOR", mutate_module=non_ancestor)
print("SCF-B-0108 selfcheck: PASS negative_cases=22")
