#!/usr/bin/env python3
"""Expected-code negative selfcheck for SCF-B-0126; no archive code runs."""
from __future__ import annotations

import copy
import importlib.util
import json
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("scf0126_validate", HERE / "validate.py")
if spec is None or spec.loader is None:
    raise RuntimeError("cannot load validator")
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
gen_spec = importlib.util.spec_from_file_location("scf0126_generate", HERE / "generate.py")
if gen_spec is None or gen_spec.loader is None:
    raise RuntimeError("cannot load generator")
generator = importlib.util.module_from_spec(gen_spec)
gen_spec.loader.exec_module(generator)
BASE_LEDGER = [json.loads(x) for x in (HERE / "classification-research.jsonl").read_text().splitlines()]
BASE_INV = json.loads((HERE / "inventory.json").read_text())
BASE_BINDING = json.loads((HERE.parents[0] / "bindings/SCF-B-0126.json").read_text())


def run_case(name: str, code: str, mutate_rows=None, mutate_inv=None):
    with tempfile.TemporaryDirectory(prefix="scf-b-0126-") as td:
        root = Path(td)
        ledger = root / "classification-research.jsonl"
        inv = root / "inventory.json"
        rows = copy.deepcopy(BASE_LEDGER)
        inventory = copy.deepcopy(BASE_INV)
        if mutate_rows:
            mutate_rows(rows)
        if mutate_inv:
            mutate_inv(inventory)
        ledger.write_text("".join(json.dumps(r, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for r in rows))
        inv.write_text(json.dumps(inventory, ensure_ascii=False, sort_keys=True, indent=2) + "\n")
        old = (validator.BUNDLE, validator.LEDGER, validator.INVENTORY)
        validator.BUNDLE, validator.LEDGER, validator.INVENTORY = root, ledger, inv
        try:
            try:
                validator.check()
            except AssertionError as exc:
                actual = str(exc).split(":", 1)[0]
                if actual != code:
                    raise AssertionError(f"{name}: expected {code}, got {actual}: {exc}")
            else:
                raise AssertionError(f"{name}: validator unexpectedly passed")
        finally:
            validator.BUNDLE, validator.LEDGER, validator.INVENTORY = old


def run_raw_case(name: str, code: str, ledger_text: str | None = None, inventory_text: str | None = None):
    with tempfile.TemporaryDirectory(prefix="scf-b-0126-json-") as td:
        root = Path(td)
        ledger = root / "classification-research.jsonl"
        inv = root / "inventory.json"
        ledger.write_text(ledger_text if ledger_text is not None else "".join(json.dumps(r, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for r in BASE_LEDGER))
        inv.write_text(inventory_text if inventory_text is not None else json.dumps(BASE_INV, ensure_ascii=False, sort_keys=True, indent=2) + "\n")
        old = (validator.BUNDLE, validator.LEDGER, validator.INVENTORY)
        validator.BUNDLE, validator.LEDGER, validator.INVENTORY = root, ledger, inv
        try:
            try:
                validator.check()
            except AssertionError as exc:
                actual = str(exc).split(":", 1)[0]
                if actual != code:
                    raise AssertionError(f"{name}: expected {code}, got {actual}: {exc}")
            else:
                raise AssertionError(f"{name}: validator unexpectedly passed")
        finally:
            validator.BUNDLE, validator.LEDGER, validator.INVENTORY = old


def run_binding_case(name: str, code: str, mutate):
    with tempfile.TemporaryDirectory(prefix="scf-b-0126-binding-") as td:
        binding = Path(td) / "SCF-B-0126.json"
        value = copy.deepcopy(BASE_BINDING)
        mutate(value)
        binding.write_text(json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n")
        old = validator.BINDING_FILE
        validator.BINDING_FILE = binding
        try:
            try:
                validator.check()
            except AssertionError as exc:
                actual = str(exc).split(":", 1)[0]
                if actual != code:
                    raise AssertionError(f"{name}: expected {code}, got {actual}: {exc}")
            else:
                raise AssertionError(f"{name}: validator unexpectedly passed")
        finally:
            validator.BINDING_FILE = old


def remove_row(rows): rows.pop()
def duplicate_row(rows): rows.append(copy.deepcopy(rows[-1]))
def source_blob(rows): rows[0]["source_exact"]["blob"] = "0" * 40
def source_anchor(rows): rows[0]["source_exact"]["semantic_anchor"]["line_text_sha256"] = "sha256:" + "0" * 64
def category(rows): rows[0]["classification"]["category"] = "insufficient_basis"
def product(rows): rows[0]["classification"]["candidate_products"] = ["HELIX-Web"]
def wave_edge(rows): rows[0]["wave_semantic_links"] = [{"wave": 1}]
def phase_status(rows): rows[0]["phase_evidence"]["product_classification_status"] = "approved"
def asset_ledger(rows): rows[0]["legacy_asset_evidence"]["row_sha256"] = "sha256:" + "0" * 64
def legacy_status(rows): rows[0]["legacy_asset_evidence"]["implementation_status"] = "implemented"
def disposition_product(rows):
    rows[0]["legacy_asset_evidence"]["disposition"] = "accepted"
    rows[0]["legacy_asset_evidence"]["product_target"] = "HELIX-OS"
def legacy_consumer(rows): rows[0]["legacy_asset_evidence"]["consumer_refs"] = ["FAKE-CONSUMER"]
def history(rows): rows[0]["legacy_history_failure_consumer"]["failure_consumer_static"]["failure"]["blob"] = "0" * 40
def history_closure(rows): rows[0]["legacy_history_failure_consumer"]["closure_status"] = "closed"
def implementation_evidence(rows): rows[0]["legacy_implementation_shrinkage_evidence"]["implementation_evidence_state"] = "promoted"
def boundary(rows): rows[0]["boundary_evidence"]["product_boundary"]["blob"] = "0" * 40
def authority(rows): rows[0]["authority_effect"] = "approved"
def read_mode(rows): rows[0]["source_exact"]["read_mode"] = "live_worktree"
def input_missing(inv): inv["input_digests"].pop()
def input_duplicate(inv): inv["input_digests"].append(copy.deepcopy(inv["input_digests"][0]))
def input_schema(inv): inv["input_digests"][0]["fabricated"] = True
def scope(inv): inv["scope"] = "filename-only"
def base_pin(inv): inv["base_revision"] = "0" * 40
def output(inv): inv["output_sha256"] = "sha256:" + "0" * 64
def formal_update(inv): inv["formal_update"]["formal_asset_classification_updated"] = True
def inventory_schema(inv): inv["schema_revision"] = 2
def inventory_source_paths(inv): inv["expected_sets"]["source_paths"][0] = "archive/fabricated-source.ts"
def phase_extra_key(rows): rows[0]["phase_evidence"]["fabricated"] = True
def boundary_extra_product(rows): rows[0]["boundary_evidence"]["l1"]["FAKE-PRODUCT"] = {}
def boundary_extra_key(rows): rows[0]["boundary_evidence"]["product_boundary"]["fabricated"] = True
def source_extra_nested_key(rows): rows[0]["source_exact"]["fabricated"] = True
def classification_extra_nested_key(rows): rows[0]["classification"]["fabricated"] = True
def history_extra_nested_key(rows): rows[0]["legacy_history_failure_consumer"]["fabricated"] = True
def shrink_extra_nested_key(rows): rows[0]["legacy_implementation_shrinkage_evidence"]["fabricated"] = True
def anchor_coverage(rows): rows[0]["anchor_line_coverage"]["coverage_ratio"] = 1.0
def research_scope(rows): rows[0]["research_scope"] = "formal_product_authority"
def overlap_reconciliation(inv): inv["overlap_reconciliation"]["overlap_count"] -= 1
def product_research_union(inv): inv["product_research_union"]["union_count"] -= 1


def binding_upstream_stale(binding): binding["upstream"][0]["sha256"] = "0" * 64


def human_judgment(rows): rows[0]["human_judgment_remaining"].pop()
def ledger_digest_match(rows): rows[0]["source_exact"]["ledger_digest_match"] = False
def wave_denominator(inv): inv["counts"]["wave_edges_scanned"] -= 1
def existing_union(inv): inv["existing_research_union"]["existing_union_count"] -= 1
def inventory_top_level_extra(inv): inv["undeclared"] = True
def inventory_top_level_missing(inv): inv.pop("scope")

def run_direct_case(name: str, code: str, mutate) -> None:
    old_profiles = validator.EXPECTED_PROFILES
    profiles = copy.deepcopy(old_profiles)
    mutate(profiles)
    validator.EXPECTED_PROFILES = profiles
    try:
        try:
            validator.check()
        except AssertionError as exc:
            actual = str(exc).split(":", 1)[0]
            if actual != code:
                raise AssertionError(f"{name}: expected {code}, got {actual}: {exc}")
        else:
            raise AssertionError(f"{name}: validator unexpectedly passed")
    finally:
        validator.EXPECTED_PROFILES = old_profiles

def review_pin(profiles): profiles.pop(next(iter(profiles)))

def run_generator_case(name: str, code: str, field: str) -> None:
    with tempfile.TemporaryDirectory(prefix="scf-b-0126-generator-") as td:
        root = Path(td)
        old_bundle = generator.BUNDLE
        old_profiles = generator.REVIEW_SPECS
        old_validator = (validator.BUNDLE, validator.LEDGER, validator.INVENTORY)
        profiles = copy.deepcopy(old_profiles)
        path = "src/web/index.ts"
        if field == "category":
            profiles[path]["category"] = "direct_product_basis"
        else:
            profiles[path]["products"] = ["HELIX-Web"]
        generator.BUNDLE = root
        generator.REVIEW_SPECS = profiles
        validator.BUNDLE = root
        validator.LEDGER = root / "classification-research.jsonl"
        validator.INVENTORY = root / "inventory.json"
        try:
            generator.build()
            try:
                validator.check()
            except AssertionError as exc:
                actual = str(exc).split(":", 1)[0]
                if actual != code:
                    raise AssertionError(f"{name}: expected {code}, got {actual}: {exc}")
            else:
                raise AssertionError(f"{name}: validator unexpectedly passed")
        finally:
            generator.BUNDLE = old_bundle
            generator.REVIEW_SPECS = old_profiles
            validator.BUNDLE, validator.LEDGER, validator.INVENTORY = old_validator

CASES = [
    ("target_set_missing", "E_TARGET_SET", remove_row, None),
    ("target_set_duplicate", "E_TARGET_SET", duplicate_row, None),
    ("source_blob_tamper", "E_OLD_ASSET_SOURCE", source_blob, None),
    ("source_line_anchor_tamper", "E_SOURCE_ANCHOR", source_anchor, None),
    ("classification_category_tamper", "E_CLASSIFICATION", category, None),
    ("classification_product_tamper", "E_CLASSIFICATION", product, None),
    ("wave_edge_injection", "E_WAVE_EDGE_SET", wave_edge, None),
    ("phase_status_tamper", "E_PHASE_STATUS", phase_status, None),
    ("asset_ledger_tamper", "E_OLD_LEDGER_RECORD", asset_ledger, None),
    ("legacy_status_promotion_tamper", "E_OLD_LEDGER_RECORD", legacy_status, None),
    ("legacy_disposition_or_product_resolution_tamper", "E_OLD_LEDGER_RECORD", disposition_product, None),
    ("legacy_consumer_tamper", "E_OLD_LEDGER_RECORD", legacy_consumer, None),
    ("history_tamper", "E_HISTORY", history, None),
    ("history_consumer_closure_tamper", "E_HISTORY", history_closure, None),
    ("implementation_evidence_tamper", "E_IMPLEMENTATION_EVIDENCE", implementation_evidence, None),
    ("boundary_blob_tamper", "E_BOUNDARY_ANCHOR", boundary, None),
    ("authority_promotion", "E_AUTHORITY_PROMOTION", authority, None),
    ("formal_update_reversal_tamper", "E_AUTHORITY_PROMOTION", None, formal_update),
    ("inventory_schema_tamper", "E_INVENTORY_DECLARATION", None, inventory_schema),
    ("inventory_source_paths_tamper", "E_INVENTORY_DECLARATION", None, inventory_source_paths),
    ("phase_evidence_extra_key_tamper", "E_PHASE_STATUS", phase_extra_key, None),
    ("boundary_extra_product_tamper", "E_BOUNDARY_ANCHOR", boundary_extra_product, None),
    ("boundary_extra_key_tamper", "E_BOUNDARY_ANCHOR", boundary_extra_key, None),
    ("source_nested_extra_key_tamper", "E_SOURCE_ANCHOR", source_extra_nested_key, None),
    ("classification_nested_extra_key_tamper", "E_RECORD_SCHEMA", classification_extra_nested_key, None),
    ("history_nested_extra_key_tamper", "E_HISTORY", history_extra_nested_key, None),
    ("shrink_nested_extra_key_tamper", "E_IMPLEMENTATION_EVIDENCE", shrink_extra_nested_key, None),
    ("read_mode_tamper", "E_READ_MODE", read_mode, None),
    ("input_digest_missing", "E_INPUT_DIGEST", None, input_missing),
    ("input_digest_duplicate", "E_INPUT_DIGEST", None, input_duplicate),
    ("input_digest_schema_tamper", "E_INPUT_DIGEST", None, input_schema),
    ("inventory_scope_tamper", "E_INVENTORY_DECLARATION", None, scope),
    ("fixed_base_pin_tamper", "E_BASE_PIN", None, base_pin),
    ("output_digest_tamper", "E_OUTPUT_DIGEST", None, output),
]
for name, code, rows, inventory in CASES:
    run_case(name, code, rows, inventory)
run_case("human_judgment_tamper", "E_HUMAN_JUDGMENT", human_judgment, None)
run_case("ledger_digest_match_tamper", "E_OLD_ASSET_SOURCE", ledger_digest_match, None)
run_case("wave_denominator_tamper", "E_WAVE_EDGE_SET", None, wave_denominator)
run_case("existing_union_tamper", "E_INVENTORY_DECLARATION", None, existing_union)
run_case("inventory_top_level_extra_key_tamper", "E_INVENTORY_DECLARATION", None, inventory_top_level_extra)
run_case("inventory_top_level_missing_key_tamper", "E_INVENTORY_DECLARATION", None, inventory_top_level_missing)
run_direct_case("review_pin_tamper", "E_REVIEW_PIN", review_pin)
run_generator_case("generator_profile_category_tamper", "E_CLASSIFICATION", "category")
run_generator_case("generator_profile_products_tamper", "E_CLASSIFICATION", "products")

base_lines = [json.dumps(r, ensure_ascii=False, sort_keys=True, separators=(",", ":")) for r in BASE_LEDGER]
duplicate_record = base_lines[0][:-1] + ',"asset_id":"DUPLICATE"}'
duplicate_nested = base_lines[0].replace('"authority_effect":"none"', '"authority_effect":"none","authority_effect":"none"', 1)
duplicate_inventory = json.dumps(BASE_INV, ensure_ascii=False, sort_keys=True, separators=(",", ":"))[:-1] + ',"schema_revision":1}'
run_raw_case("ledger_duplicate_key_json", "E_JSON", ledger_text="\n".join([duplicate_record, *base_lines[1:]]) + "\n")
run_raw_case("nested_duplicate_key_json", "E_JSON", ledger_text="\n".join([duplicate_nested, *base_lines[1:]]) + "\n")
run_raw_case("inventory_duplicate_key_json", "E_JSON", inventory_text=duplicate_inventory)
run_raw_case("malformed_json", "E_JSON", ledger_text="{\"asset_id\":\n")
run_raw_case("nonobject_json", "E_JSON", inventory_text="[]\n")
run_case("anchor_line_coverage_tamper", "E_ANCHOR_COVERAGE", anchor_coverage, None)
run_binding_case("binding_upstream_stale_tamper", "E_BINDING_UPSTREAM", binding_upstream_stale)
run_case("research_scope_tamper", "E_RECORD_SCHEMA", research_scope, None)
run_case("overlap_reconciliation_tamper", "E_OVERLAP_RECONCILIATION", None, overlap_reconciliation)
run_case("product_research_union_tamper", "E_PRODUCT_RESEARCH_UNION", None, product_research_union)
print(f"SCF-B-0126 selfcheck: PASS negative_cases={len(CASES) + 19}")
