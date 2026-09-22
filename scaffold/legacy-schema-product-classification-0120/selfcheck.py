#!/usr/bin/env python3
"""Static negative checks for SCF-B-0120; archive/runtime code is never executed."""
from __future__ import annotations
import copy, hashlib, importlib.util, json, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("scf_b_0120_validate", HERE / "validate.py")
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
original_ledger, original_inventory = module.LEDGER, module.INVENTORY
module.verify()
base_rows, base_inventory = module.local_jsonl(original_ledger), module.local_json(original_inventory)
TARGET_WITH_EDGE = next(i for i, row in enumerate(base_rows) if row["wave_semantic_links"])
TARGET_DIRECT = next(i for i, row in enumerate(base_rows) if row["classification_category"] == "direct_product_basis")
TARGET_CONFLICT = next(i for i, row in enumerate(base_rows) if row["classification_category"] == "multi_product_conflict")
TARGET_INSUFFICIENT = next(i for i, row in enumerate(base_rows) if row["classification_category"] == "insufficient_basis")


def tagged(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def run_case(label, expected_code, mutate_rows=None, mutate_inventory=None, mutate_module=None):
    rows, inventory = copy.deepcopy(base_rows), copy.deepcopy(base_inventory)
    if mutate_rows: mutate_rows(rows)
    old = {key: getattr(module, key) for key in ("LEDGER", "INVENTORY", "BASE_REVISION", "PHASE_FIXED")}
    try:
        with tempfile.TemporaryDirectory(prefix="scf-b-0120-selfcheck-") as tmp:
            root = Path(tmp)
            ledger = root / original_ledger.name
            ledger.write_text("".join(json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for x in rows))
            inventory["output_sha256"] = tagged(ledger.read_bytes())
            if mutate_inventory: mutate_inventory(inventory)
            inv = root / original_inventory.name
            inv.write_text(json.dumps(inventory, ensure_ascii=False, sort_keys=True, indent=2) + "\n")
            module.LEDGER, module.INVENTORY = ledger, inv
            if mutate_module: mutate_module(module)
            module.git_bytes.cache_clear(); module.git_blob.cache_clear()
            try:
                module.verify()
            except AssertionError as exc:
                if expected_code not in str(exc):
                    raise AssertionError(f"{label}: expected {expected_code}, got {exc}") from exc
                print(f"PASS negative: {label} [{expected_code}]")
            else:
                raise AssertionError(f"{label}: mutation was accepted")
    finally:
        for key, value in old.items(): setattr(module, key, value)
        module.git_bytes.cache_clear(); module.git_blob.cache_clear()


def run_generator_case(label, expected_code, mutate):
    gs = importlib.util.spec_from_file_location("scf_b_0120_generate_mutation", HERE / "generate.py")
    assert gs and gs.loader
    gen = importlib.util.module_from_spec(gs)
    gs.loader.exec_module(gen)
    old_bundle, old_specs, old_l1 = gen.BUNDLE, copy.deepcopy(gen.REVIEW_SPECS), copy.deepcopy(gen.L1_RANGES)
    try:
        with tempfile.TemporaryDirectory(prefix="scf-b-0120-generator-") as tmp:
            gen.BUNDLE = Path(tmp) / "bundle"
            gen.REVIEW_SPECS = copy.deepcopy(old_specs)
            gen.L1_RANGES = copy.deepcopy(old_l1)
            mutate(gen)
            gen.build()
            old = module.LEDGER, module.INVENTORY
            module.LEDGER, module.INVENTORY = gen.BUNDLE / "classification-research.jsonl", gen.BUNDLE / "inventory.json"
            module.git_bytes.cache_clear(); module.git_blob.cache_clear()
            try:
                module.verify()
            except AssertionError as exc:
                if expected_code not in str(exc):
                    raise AssertionError(f"{label}: expected {expected_code}, got {exc}") from exc
                print(f"PASS negative: {label} [{expected_code}]")
            else:
                raise AssertionError(f"{label}: generator mutation was accepted")
            finally:
                module.LEDGER, module.INVENTORY = old
    finally:
        gen.BUNDLE, gen.REVIEW_SPECS, gen.L1_RANGES = old_bundle, old_specs, old_l1
        module.git_bytes.cache_clear(); module.git_blob.cache_clear()


def remove_record(rows): rows.pop()
def duplicate_record(rows): rows.append(copy.deepcopy(rows[0]))
def remove_edge(rows): rows[TARGET_WITH_EDGE]["wave_semantic_links"].pop()
def duplicate_edge(rows): rows[TARGET_WITH_EDGE]["wave_semantic_links"].append(copy.deepcopy(rows[TARGET_WITH_EDGE]["wave_semantic_links"][0]))
def source_digest(rows): rows[0]["source_exact"]["sha256"] = "sha256:" + "0" * 64
def source_anchor(rows): rows[0]["source_exact"]["semantic_anchors"][0]["line_text_sha256"] = "sha256:" + "f" * 64
def source_line(rows): rows[0]["source_exact"]["semantic_anchors"][0]["line_start"] = 0
def profile(rows): rows[0]["source_profile"]["source_products"] = ["HELIX-Web"]
def candidate(rows): rows[0]["candidate_products"] = ["HELIX-Web"]
def category(rows): rows[0]["classification_category"] = "insufficient_basis"
def authority(rows):
    rows[0]["authority_effect"] = "approved"; rows[0]["classification_state"] = "effective"; rows[0]["formal_asset_classification_updated"] = True; rows[0]["new_build_allowed"] = True
def boundary(rows): rows[0]["boundary_evidence"]["HELIX-OS"]["ranges"][0]["line_text_sha256"] = "sha256:" + "f" * 64
def manual(rows): rows[0]["manual_semantic_review"]["interpretation"] = "tampered"
def legacy(rows): rows[0]["legacy_implementation_shrinkage_evidence"]["interpretation"] = "tampered"
def history(rows): rows[0]["legacy_history_failure_consumer"]["disposition"]["row_sha256"] = "sha256:" + "f" * 64
def human(rows): rows[0]["human_judgment_remaining"] = []
def record_schema(rows): rows[0]["formal_owner"] = "HELIX-OS"
def source_read_mode(rows): rows[0]["source_exact"]["read_mode"] = "executed"
def remove_input(inv): inv["input_digests"].pop()
def duplicate_input(inv): inv["input_digests"].append(copy.deepcopy(inv["input_digests"][0]))
def extra_input(inv): inv["input_digests"].append(copy.deepcopy(inv["input_digests"][0])); inv["input_digests"][-1]["path"] = "docs/extra.jsonl"
def input_value(inv): inv["input_digests"][0]["sha256"] = "sha256:" + "f" * 64
def negative_inventory(inv): inv["negative_cases"].pop()
def inventory_authority(inv): inv["authority_boundary"]["authority_effect"] = "approved"
def inventory_scope(inv): inv["scope"] = "all source owners approved"
def inventory_formal_update(inv): inv["formal_update"]["product_route_updated"] = True
def inventory_rule(inv): inv["classification_rule"]["direct_product_basis"] = "filename only"
def inventory_kind(inv): inv["counts"]["target_asset_artifact_evidence_kinds"] = {"implementation_source": 17}
def inventory_edge(inv): inv["counts"]["target_wave_edges"] += 1
def inventory_overlap(inv): inv["research_overlap"]["union_count"] = 999
def output_digest(inv): inv["output_sha256"] = "sha256:" + "f" * 64
def non_ancestor(mod): mod.BASE_REVISION = "0" * 40
def missing_base_source(mod): mod.PHASE_FIXED = "docs/missing-fixed-base.jsonl"
def base_pin(inv): inv["base_revision"] = "0" * 40
def phase_status(rows): rows[0]["phase_ledger"]["product_classification_status"] = "approved"
def category_direct_invariant(rows): rows[TARGET_DIRECT]["manual_semantic_review"]["l1_evidence"] = {}
def category_conflict_invariant(rows): rows[TARGET_CONFLICT]["candidate_products"] = [rows[TARGET_CONFLICT]["candidate_products"][0]]
def category_insufficient_invariant(rows): rows[TARGET_INSUFFICIENT]["candidate_products"] = ["HELIX-HARNESS"]
def static_ref_key_closure(rows): rows[0]["failure_consumer_static_refs"]["failure"]["extra"] = True
def unit_key_closure(rows): rows[TARGET_WITH_EDGE]["unit_product_candidates"][0]["extra"] = True
def asset_id_type(rows): rows[0]["asset_id"] = 123
def unit_type(rows): rows[TARGET_WITH_EDGE]["unit_product_candidates"] = "invalid"

run_case("target record omission", "E_TARGET_SET", mutate_rows=remove_record)
run_case("target record duplicate", "E_TARGET_SET", mutate_rows=duplicate_record)
run_case("edge omission", "E_EDGE_SET", mutate_rows=remove_edge)
run_case("edge duplicate", "E_EDGE_SET", mutate_rows=duplicate_edge)
run_case("source digest tamper", "E_SOURCE_DIGEST", mutate_rows=source_digest)
run_case("source anchor tamper", "E_SOURCE_ANCHOR", mutate_rows=source_anchor)
run_case("source line range tamper", "E_SOURCE_LINE", mutate_rows=source_line)
run_case("source profile tamper", "E_PROFILE", mutate_rows=profile)
run_case("candidate product tamper", "E_CLASSIFICATION", mutate_rows=candidate)
run_case("classification category tamper", "E_CLASSIFICATION", mutate_rows=category)
run_case("semantic review tamper", "E_SEMANTIC_REVIEW", mutate_rows=manual)
run_case("legacy evidence tamper", "E_LEGACY_EVIDENCE", mutate_rows=legacy)
run_case("boundary digest tamper", "E_BOUNDARY_DIGEST", mutate_rows=boundary)
run_case("history tamper", "E_HISTORY", mutate_rows=history)
run_case("human judgment tamper", "E_HUMAN_JUDGMENT", mutate_rows=human)
run_case("authority promotion", "E_AUTHORITY_PROMOTION", mutate_rows=authority)
run_case("record top-level extra key", "E_RECORD_SCHEMA", mutate_rows=record_schema)
run_case("source read mode tamper", "E_SOURCE_DIGEST", mutate_rows=source_read_mode)
run_case("input digest omission", "E_INPUT_SET", mutate_inventory=remove_input)
run_case("input digest duplicate", "E_INPUT_SET", mutate_inventory=duplicate_input)
run_case("input digest extra path", "E_INPUT_SET", mutate_inventory=extra_input)
run_case("input digest value tamper", "E_INPUT_DIGEST", mutate_inventory=input_value)
run_case("inventory negative-case tamper", "E_INVENTORY", mutate_inventory=negative_inventory)
run_case("inventory authority promotion", "E_INVENTORY_DECLARATION", mutate_inventory=inventory_authority)
run_case("inventory scope tamper", "E_INVENTORY_DECLARATION", mutate_inventory=inventory_scope)
run_case("inventory formal update tamper", "E_INVENTORY_DECLARATION", mutate_inventory=inventory_formal_update)
run_case("inventory classification rule tamper", "E_INVENTORY_DECLARATION", mutate_inventory=inventory_rule)
run_case("inventory artifact kind denominator tamper", "E_EXPECTED_DENOMINATOR", mutate_inventory=inventory_kind)
run_case("inventory edge denominator tamper", "E_EXPECTED_DENOMINATOR", mutate_inventory=inventory_edge)
run_case("inventory overlap tamper", "E_OVERLAP", mutate_inventory=inventory_overlap)
run_case("output digest tamper", "E_OUTPUT_DIGEST", mutate_inventory=output_digest)
run_case("fixed BASE non-ancestor", "E_BASE_NOT_ANCESTOR", mutate_module=non_ancestor)
run_case("fixed BASE source missing", "E_BASE_SOURCE", mutate_module=missing_base_source)
run_case("fixed BASE pin tamper", "E_BASE_PIN", mutate_inventory=base_pin)
run_case("phase status tamper", "E_PHASE_STATUS", mutate_rows=phase_status)
run_case("category evidence direct invariant", "E_CLASSIFICATION", mutate_rows=category_direct_invariant)
run_case("category evidence conflict invariant", "E_CLASSIFICATION", mutate_rows=category_conflict_invariant)
run_case("category evidence insufficient invariant", "E_CLASSIFICATION", mutate_rows=category_insufficient_invariant)
run_case("failure consumer static refs key closure", "E_STATIC_REF_SCHEMA", mutate_rows=static_ref_key_closure)
run_case("unit product candidates key closure", "E_CANDIDATE_PRODUCTS", mutate_rows=unit_key_closure)
run_case("asset id type", "E_TARGET_SET", mutate_rows=asset_id_type)
run_case("unit product candidates type", "E_CANDIDATE_PRODUCTS", mutate_rows=unit_type)
run_generator_case("generator review spec tamper", "E_LEGACY_EVIDENCE", lambda g: g.REVIEW_SPECS["atomic-contract-id"].update(legacy="tampered legacy pin"))
run_generator_case("generator category pin tamper", "E_CLASSIFICATION", lambda g: g.REVIEW_SPECS["atomic-contract-id"].update(category="insufficient_basis"))
run_generator_case("generator products pin tamper", "E_CLASSIFICATION", lambda g: g.REVIEW_SPECS["atomic-contract-id"].update(products=[]))
run_generator_case("generator anchor tamper", "E_SOURCE_ANCHOR", lambda g: g.REVIEW_SPECS["atomic-contract-id"].update(marker="export const ATOMIC_CONTRACT_ID_PATTERN"))
run_generator_case("generator L1 tamper", "E_SEMANTIC_REVIEW", lambda g: g.L1_RANGES["HELIX-OS"].__setitem__(0, (22, 26)))
print("SCF-B-0120 selfcheck: PASS negative_cases=47")
