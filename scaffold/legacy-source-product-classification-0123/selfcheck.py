#!/usr/bin/env python3
"""Static negative checks for SCF-B-0123; archive/runtime code is never executed."""
from __future__ import annotations
import copy, hashlib, importlib.util, json, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("scf_b_0123_validate", HERE / "validate.py")
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
original_ledger, original_inventory = module.LEDGER, module.INVENTORY
module.verify()
base_rows, base_inventory = module.local_jsonl(original_ledger), module.local_json(original_inventory)
TARGET_WITH_EDGE = next(i for i, row in enumerate(base_rows) if row["wave_semantic_links"])


def tagged(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def run_case(label, expected_code, mutate_rows=None, mutate_inventory=None, mutate_module=None):
    rows, inventory = copy.deepcopy(base_rows), copy.deepcopy(base_inventory)
    if mutate_rows: mutate_rows(rows)
    old = {key: getattr(module, key) for key in ("LEDGER", "INVENTORY", "BASE_REVISION", "PHASE_FIXED", "PINNED_REVIEWS")}
    try:
        with tempfile.TemporaryDirectory(prefix="scf-b-0123-selfcheck-") as tmp:
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
    gs = importlib.util.spec_from_file_location("scf_b_0123_generate_mutation", HERE / "generate.py")
    assert gs and gs.loader
    gen = importlib.util.module_from_spec(gs)
    gs.loader.exec_module(gen)
    old_bundle, old_specs, old_l1 = gen.BUNDLE, copy.deepcopy(gen.REVIEW_SPECS), copy.deepcopy(gen.L1_RANGES)
    try:
        with tempfile.TemporaryDirectory(prefix="scf-b-0123-generator-") as tmp:
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


def strict_json_loader_suite():
    """Exercise duplicate-key, malformed, and non-object ledger/inventory inputs."""
    old = module.LEDGER, module.INVENTORY
    ledger_lines = [json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) for row in base_rows]
    inventory_text = json.dumps(base_inventory, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
    first = ledger_lines[0]
    duplicate_record = first[:-1] + ',"asset_id":"DUPLICATE"}'
    duplicate_nested = first[:-1] + ',"candidate_products":[]}'
    cases = [
        ("record duplicate key", duplicate_record + "\n" + "\n".join(ledger_lines[1:]), inventory_text),
        ("nested duplicate key", duplicate_nested + "\n" + "\n".join(ledger_lines[1:]), inventory_text),
        ("malformed ledger JSON", '{"asset_id":\n' + "\n".join(ledger_lines[1:]), inventory_text),
        ("non-object inventory JSON", "\n".join(ledger_lines), "[]\n"),
    ]
    try:
        with tempfile.TemporaryDirectory(prefix="scf-b-0123-json-loader-") as tmp:
            root = Path(tmp)
            ledger = root / original_ledger.name
            inv = root / original_inventory.name
            module.LEDGER, module.INVENTORY = ledger, inv
            for label, ledger_text, inv_text in cases:
                ledger.write_text(ledger_text + ("\n" if not ledger_text.endswith("\n") else ""))
                inv.write_text(inv_text)
                try:
                    module.verify()
                except AssertionError as exc:
                    if "E_JSON" not in str(exc):
                        raise AssertionError(f"{label}: expected E_JSON, got {exc}") from exc
                else:
                    raise AssertionError(f"{label}: malformed input was accepted")
                module.git_bytes.cache_clear(); module.git_blob.cache_clear()
    finally:
        module.LEDGER, module.INVENTORY = old
        module.git_bytes.cache_clear(); module.git_blob.cache_clear()
    print("PASS negative: strict JSON loader guards [E_JSON]")


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
def asset_ledger(rows): rows[0]["asset_ledger"]["product_target"] = "HELIX-OS"
def phase_nested(rows): rows[0]["phase_ledger"]["candidate_product_targets"] = ["HELIX-OS"]
def history_nested(rows): rows[0]["legacy_history_failure_consumer"]["decisions"].append({"decision_id": "FAKE"})
def failure_consumer(rows): rows[0]["failure_consumer_static_refs"]["failure"]["ranges"][0]["line_text_sha256"] = "sha256:" + "f" * 64
def unit_candidate(rows): rows[TARGET_WITH_EDGE]["unit_product_candidates"][0]["crosswalk"]["unit_candidate_id"] = "FAKE-UNIT"
def semantic_edge_field(rows): rows[TARGET_WITH_EDGE]["wave_semantic_links"][0]["source_statement_text"] = "tampered"
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
def inventory_kind(inv): inv["counts"]["target_asset_artifact_evidence_kinds"] = {"implementation_source": 58}
def inventory_edge(inv): inv["counts"]["target_wave_edges"] += 1
def inventory_overlap(inv): inv["research_overlap"]["union_count"] = 999
def output_digest(inv): inv["output_sha256"] = "sha256:" + "f" * 64
def non_ancestor(mod): mod.BASE_REVISION = "0" * 40
def missing_base_source(mod): mod.PHASE_FIXED = "docs/missing-fixed-base.jsonl"
def base_pin(inv): inv["base_revision"] = "0" * 40
def phase_status(rows): rows[0]["phase_ledger"]["product_classification_status"] = "approved"
def review_pin(mod):
    mod.PINNED_REVIEWS = copy.deepcopy(mod.PINNED_REVIEWS)
    mod.PINNED_REVIEWS.pop(next(iter(mod.PINNED_REVIEWS)))
def asset_id_missing(rows): rows[0].pop("asset_id")
def unit_candidate_non_dict(rows): rows[TARGET_WITH_EDGE]["unit_product_candidates"][0] = "not-an-object"
def unit_candidate_top_level_extra(rows): rows[TARGET_WITH_EDGE]["unit_product_candidates"][0]["extra"] = True
def failure_consumer_top_level_extra(rows): rows[0]["failure_consumer_static_refs"]["extra"] = {}
def failure_consumer_nested_extra(rows): rows[0]["failure_consumer_static_refs"]["failure"]["extra"] = True
def inventory_manual_ids(inv): inv["manual_reviewed_asset_ids"] = list(reversed(inv["manual_reviewed_asset_ids"]))[:-1]
def inventory_top_level_extra(inv): inv["unexpected"] = True
def category_row(rows, category):
    return next(row for row in rows if row.get("classification_category") == category)
def direct_category_cardinality(rows): category_row(rows, "direct_product_basis")["candidate_products"] = []
def conflict_category_cardinality(rows): category_row(rows, "multi_product_conflict")["candidate_products"] = ["HELIX-HARNESS"]
def insufficient_category_cardinality(rows): category_row(rows, "insufficient_basis")["candidate_products"] = ["HELIX-OS"]
def manual_l1_evidence(rows):
    review = category_row(rows, "direct_product_basis")["manual_semantic_review"]
    review["l1_evidence"][next(iter(review["l1_evidence"]))]["path"] = "tampered"

run_case("target record omission", "E_TARGET_SET", mutate_rows=remove_record)
run_case("target record duplicate", "E_TARGET_SET", mutate_rows=duplicate_record)
run_case("edge omission", "E_EDGE_SET", mutate_rows=remove_edge)
run_case("edge duplicate", "E_EDGE_SET", mutate_rows=duplicate_edge)
run_case("source digest tamper", "E_SOURCE_DIGEST", mutate_rows=source_digest)
run_case("source anchor tamper", "E_SOURCE_ANCHOR", mutate_rows=source_anchor)
run_case("source line range tamper", "E_SOURCE_LINE", mutate_rows=source_line)
run_case("source profile tamper", "E_PROFILE", mutate_rows=profile)
run_case("candidate product tamper", "E_SEMANTIC_REVIEW", mutate_rows=candidate)
run_case("classification category tamper", "E_CLASSIFICATION", mutate_rows=category)
run_case("semantic review tamper", "E_SEMANTIC_REVIEW", mutate_rows=manual)
run_case("legacy evidence tamper", "E_LEGACY_EVIDENCE", mutate_rows=legacy)
run_case("boundary digest tamper", "E_BOUNDARY_DIGEST", mutate_rows=boundary)
run_case("history tamper", "E_HISTORY", mutate_rows=history)
run_case("asset ledger nested tamper", "E_HISTORY", mutate_rows=asset_ledger)
run_case("phase nested tamper", "E_PHASE_STATUS", mutate_rows=phase_nested)
run_case("history nested tamper", "E_HISTORY", mutate_rows=history_nested)
run_case("failure/consumer static ref tamper", "E_BOUNDARY_DIGEST", mutate_rows=failure_consumer)
run_case("unit candidate nested tamper", "E_CANDIDATE_PRODUCTS", mutate_rows=unit_candidate)
run_case("semantic edge field tamper", "E_EDGE_SET", mutate_rows=semantic_edge_field)
run_case("human judgment tamper", "E_HUMAN_JUDGMENT", mutate_rows=human)
run_case("authority promotion", "E_AUTHORITY_PROMOTION", mutate_rows=authority)
run_case("record top-level extra key", "E_RECORD_SCHEMA", mutate_rows=record_schema)
strict_json_loader_suite()
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
run_case("review pin omission", "E_REVIEW_PIN", mutate_module=review_pin)
run_case("asset id missing", "E_TARGET_SET", mutate_rows=asset_id_missing)
run_case("unit candidate non-dict", "E_CANDIDATE_PRODUCTS", mutate_rows=unit_candidate_non_dict)
run_case("unit candidate top-level extra", "E_CANDIDATE_PRODUCTS", mutate_rows=unit_candidate_top_level_extra)
run_case("failure/consumer top-level extra", "E_BOUNDARY_DIGEST", mutate_rows=failure_consumer_top_level_extra)
run_case("failure/consumer nested extra", "E_BOUNDARY_DIGEST", mutate_rows=failure_consumer_nested_extra)
run_case("inventory manual IDs tamper", "E_SEMANTIC_REVIEW", mutate_inventory=inventory_manual_ids)
run_case("inventory top-level extra", "E_INVENTORY_DECLARATION", mutate_inventory=inventory_top_level_extra)
run_case("direct category cardinality", "E_CLASSIFICATION", mutate_rows=direct_category_cardinality)
run_case("conflict category cardinality", "E_CLASSIFICATION", mutate_rows=conflict_category_cardinality)
run_case("insufficient category cardinality", "E_CLASSIFICATION", mutate_rows=insufficient_category_cardinality)
run_case("manual L1 evidence mismatch", "E_SEMANTIC_REVIEW", mutate_rows=manual_l1_evidence)
run_generator_case("generator review spec tamper", "E_PROFILE", lambda g: g.REVIEW_SPECS["measurement-evidence-evaluator"].update(category="insufficient_basis"))
run_generator_case("generator anchor tamper", "E_SOURCE_ANCHOR", lambda g: g.REVIEW_SPECS["measurement-evidence-evaluator"].update(marker="export const MEASUREMENT_EVALUATION_SCHEMA_VERSION"))
run_generator_case("generator L1 tamper", "E_SEMANTIC_REVIEW", lambda g: g.L1_RANGES["HELIX-OS"].__setitem__(0, (22, 26)))
run_generator_case("generator products tamper", "E_SOURCE_ANCHOR", lambda g: g.REVIEW_SPECS["measurement-evidence-evaluator"].update(products=["HELIX-OS"]))
print("SCF-B-0123 selfcheck: PASS negative_cases=57")
