#!/usr/bin/env python3
"""SCF-B-0133 negative self-checks; all reads are fixed-base static reads."""
from __future__ import annotations
import copy
import importlib.util
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-runtime-residual-product-classification-0133"
VALIDATOR_PATH = BUNDLE / "validate.py"

spec = importlib.util.spec_from_file_location("scf_b_0133_validator", VALIDATOR_PATH)
validator = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(validator)


def load_json(path: Path):
    return json.loads(path.read_text())


def load_jsonl(path: Path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def dump_json(path: Path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n")


def dump_jsonl(path: Path, value):
    path.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for row in value))


def trial(name: str, mutate, expected: str):
    root = Path(tempfile.mkdtemp(prefix="scf-b-0133-selfcheck-"))
    target = root / BUNDLE.name
    shutil.copytree(BUNDLE, target)
    mutate(target)
    validator.BUNDLE = target
    try:
        validator.verify()
    except AssertionError as exc:
        actual = str(exc)
        if not actual.startswith(expected + ":"):
            raise AssertionError(f"{name}: expected {expected}, got {actual}") from exc
    else:
        raise AssertionError(f"{name}: mutation unexpectedly passed")
    finally:
        validator.BUNDLE = BUNDLE
        shutil.rmtree(root, ignore_errors=True)


def records_mutator(fn):
    def mutate(target):
        path = target / "classification-research.jsonl"
        rows = load_jsonl(path)
        fn(rows)
        dump_jsonl(path, rows)
    return mutate


def inventory_mutator(fn):
    def mutate(target):
        path = target / "inventory.json"
        value = load_json(path)
        fn(value)
        dump_json(path, value)
    return mutate


# Record schema, evidence, classification, phase, legacy history, and wave guards.
trial("target_record_omission", records_mutator(lambda rows: rows.pop()), "E_TARGET_SET")
trial("target_record_duplicate", records_mutator(lambda rows: rows.__setitem__(1, copy.deepcopy(rows[0]))), "E_TARGET_SET")
trial("target_record_extra", records_mutator(lambda rows: rows.append(copy.deepcopy(rows[0]) | {"asset_id": "LEGACY-ASSET-EXTRA"})), "E_TARGET_SET")
trial("source_digest_tamper", records_mutator(lambda rows: rows[0]["source_exact"].__setitem__("sha256", "sha256:tampered")), "E_RECORD_EVIDENCE")
trial("source_line_text_digest_tamper", records_mutator(lambda rows: rows[0]["source_exact"]["semantic_anchor"].__setitem__("line_text_sha256", "sha256:tampered")), "E_RECORD_EVIDENCE")
trial("source_line_range_tamper", records_mutator(lambda rows: rows[0]["source_exact"]["semantic_anchor"].__setitem__("line_end", rows[0]["source_exact"]["semantic_anchor"]["line_end"] + 1)), "E_RECORD_EVIDENCE")
trial("source_profile_tamper", records_mutator(lambda rows: rows[0]["classification"].__setitem__("reason", "filename-only")), "E_RECORD_EVIDENCE")
trial("classification_category_tamper", records_mutator(lambda rows: rows[0]["classification"].__setitem__("category", "direct_product_basis")), "E_CLASSIFICATION")
trial("candidate_product_tamper", records_mutator(lambda rows: rows[0]["classification"].__setitem__("candidate_products", ["HELIX-Web"])), "E_CLASSIFICATION")
trial("l1_anchor_tamper", records_mutator(lambda rows: rows[0]["boundary_evidence"]["l1"]["HELIX-OS"]["semantic_anchor"].__setitem__("line_text_sha256", "sha256:tampered")), "E_RECORD_EVIDENCE")
trial("boundary_anchor_tamper", records_mutator(lambda rows: rows[0]["boundary_evidence"]["product_boundary"]["product_spans"]["HELIX-OS"].__setitem__("line_text_sha256", "sha256:tampered")), "E_RECORD_EVIDENCE")
trial("decision_anchor_tamper", records_mutator(lambda rows: rows[0]["classification"]["candidate_product_basis"]["HELIX-OS"].__setitem__("decision_meaning_line_text_sha256", "sha256:tampered")), "E_RECORD_EVIDENCE")
trial("phase_status_tamper", records_mutator(lambda rows: rows[0]["phase_semantics"].__setitem__("implementation_evidence_state", "implemented")), "E_RECORD_EVIDENCE")
trial("history_tamper", records_mutator(lambda rows: rows[0]["legacy_history_failure_consumer"]["decision_records"].append({"tampered": True})), "E_RECORD_EVIDENCE")
trial("failure_consumer_tamper", records_mutator(lambda rows: rows[0]["legacy_history_failure_consumer"]["failure_consumer_static"]["failure"]["sha256"] if False else rows[0]["legacy_history_failure_consumer"]["failure_consumer_static"]["failure"].__setitem__("sha256", "sha256:tampered")), "E_RECORD_EVIDENCE")
trial("edge_omission", records_mutator(lambda rows: rows[0]["wave_semantic_links"].pop()), "E_RECORD_EVIDENCE")
trial("edge_duplicate", records_mutator(lambda rows: rows[0]["wave_semantic_links"].append(copy.deepcopy(rows[0]["wave_semantic_links"][0]))), "E_RECORD_EVIDENCE")
trial("authority_promotion", records_mutator(lambda rows: rows[0].__setitem__("authority_effect", "formal")), "E_RECORD_EVIDENCE")
trial("human_judgment_tamper", records_mutator(lambda rows: rows[0]["human_judgment_remaining"].pop()), "E_RECORD_EVIDENCE")
trial("record_top_level_extra_key", records_mutator(lambda rows: rows[0].__setitem__("formal_product_owner", "HELIX-OS")), "E_RECORD_SCHEMA")
trial("source_read_mode_tamper", records_mutator(lambda rows: rows[0]["source_exact"].__setitem__("read_mode", "archive_runtime")), "E_RECORD_EVIDENCE")

# Inventory declarations and fixed-set/digest guards.
trial("inventory_scope_tamper", inventory_mutator(lambda inv: inv.__setitem__("scope", "all assets")), "E_INVENTORY")
trial("inventory_base_source_mode_tamper", inventory_mutator(lambda inv: inv.__setitem__("base_source_mode", "live worktree bytes")), "E_BASE_SOURCE")
trial("inventory_top_level_tamper", inventory_mutator(lambda inv: inv.__setitem__("undeclared", True)), "E_INVENTORY_SCHEMA")
trial("inventory_target_set_tamper", inventory_mutator(lambda inv: inv["target_asset_ids"].pop()), "E_TARGET_SET")
trial("inventory_input_omission", inventory_mutator(lambda inv: inv["input_digests"].pop()), "E_INPUT_DIGEST")
trial("inventory_input_duplicate", inventory_mutator(lambda inv: inv["input_digests"].append(copy.deepcopy(inv["input_digests"][0]))), "E_INPUT_DIGEST")
trial("inventory_input_extra_path", inventory_mutator(lambda inv: inv["input_digests"].append({"path": "extra", "blob": "x", "bytes": 0, "sha256": "sha256:x"})), "E_INPUT_DIGEST")
trial("inventory_input_value_tamper", inventory_mutator(lambda inv: inv["input_digests"][0].__setitem__("sha256", "sha256:tampered")), "E_INPUT_DIGEST")
trial("inventory_denominator_tamper", inventory_mutator(lambda inv: inv["target_asset_artifact_evidence_kinds"].__setitem__("implementation_source", 58)), "E_EXPECTED_DENOMINATOR")
trial("inventory_overlap_tamper", inventory_mutator(lambda inv: inv["overlap_control"].__setitem__("target_overlap_main", 1)), "E_OVERLAP")
trial("inventory_authority_promotion", inventory_mutator(lambda inv: inv["authority_boundary"].__setitem__("formal_product_authority", "HELIX-OS")), "E_INVENTORY")
trial("inventory_output_digest_tamper", inventory_mutator(lambda inv: inv.__setitem__("output_sha256", "sha256:tampered")), "E_OUTPUT_DIGEST")
trial("inventory_negative_case_tamper", inventory_mutator(lambda inv: inv["negative_cases"].pop()), "E_INVENTORY")
trial("base_pin_tamper", inventory_mutator(lambda inv: inv.__setitem__("base_revision", "0" * 40)), "E_BASE_PIN")

# The generator-oracle guard: changing generator's pinned reason and regenerating
# a separate bundle must fail against this validator's independent PROFILE_PINS.
def generator_profile_tamper(target: Path, field: str):
    original = (BUNDLE / "generate.py").read_text()
    path = next(iter(validator.PROFILE_PINS))
    original_profile = validator.PROFILE_PINS[path]
    mutated = copy.deepcopy(original_profile)
    if field == "category":
        mutated["category"] = "insufficient_basis"
    elif field == "products":
        mutated["products"] = []
    elif field == "l1":
        mutated["l1"] = {"HELIX-OS": "| HELIXOS-L1-001 |"}
    elif field == "marker":
        mutated["marker"] = "export const ADAPTER_AVAILABLE_MESSAGE"
    elif field == "reason":
        mutated["reason"] += " generator-tampered"
    else:
        raise AssertionError(f"unknown profile field: {field}")
    old_entry = f'"{path}": {json.dumps(original_profile, ensure_ascii=False)}'
    new_entry = f'"{path}": {json.dumps(mutated, ensure_ascii=False)}'
    if original.count(old_entry) != 1:
        raise AssertionError(f"generator profile entry not unique: {field}")
    changed = original.replace(old_entry, new_entry, 1)
    gen_dir = Path(tempfile.mkdtemp(prefix=f"scf-b-0133-generator-{field}-"))
    changed = changed.replace(
        "ROOT=Path(__file__).resolve().parents[2]",
        f"ROOT=Path({str(ROOT)!r})",
        1,
    )
    changed = changed.replace(
        'BUNDLE=ROOT/"scaffold/legacy-runtime-residual-product-classification-0133"',
        f"BUNDLE=Path({str(gen_dir)!r})",
        1,
    )
    gen_file = gen_dir / "generate.py"
    gen_file.write_text(changed)
    try:
        subprocess.check_call(["python3", str(gen_file)], cwd=ROOT)
        shutil.copy2(gen_dir / "classification-research.jsonl", target / "classification-research.jsonl")
        shutil.copy2(gen_dir / "inventory.json", target / "inventory.json")
    finally:
        shutil.rmtree(gen_dir, ignore_errors=True)

def generator_oracle_tamper(target: Path):
    generator_profile_tamper(target, "reason")

trial("generator_profile_oracle_tamper", generator_oracle_tamper, "E_RECORD_EVIDENCE")
trial("generator_profile_category_tamper", lambda target: generator_profile_tamper(target, "category"), "E_CLASSIFICATION")
trial("generator_profile_products_tamper", lambda target: generator_profile_tamper(target, "products"), "E_CLASSIFICATION")
trial("generator_profile_l1_tamper", lambda target: generator_profile_tamper(target, "l1"), "E_RECORD_EVIDENCE")
trial("generator_profile_marker_tamper", lambda target: generator_profile_tamper(target, "marker"), "E_RECORD_EVIDENCE")

# Profile/evidence category guards are exercised on the actual output shape.
trial("profile_category_tamper", records_mutator(lambda rows: rows[0]["classification"].__setitem__("category", "direct_product_basis")), "E_CLASSIFICATION")
trial("profile_products_tamper", records_mutator(lambda rows: rows[0]["classification"].__setitem__("candidate_products", [rows[0]["classification"]["candidate_products"][0]])), "E_CLASSIFICATION")
trial("profile_l1_anchor_tamper", records_mutator(lambda rows: rows[0]["boundary_evidence"]["l1"][rows[0]["classification"]["candidate_products"][0]].pop("semantic_anchor")), "E_CLASSIFICATION")
trial("profile_source_marker_tamper", records_mutator(lambda rows: rows[0]["classification"]["candidate_product_basis"][rows[0]["classification"]["candidate_products"][0]].__setitem__("source_marker", "tampered")), "E_CLASSIFICATION")
trial("classification_count_tamper", inventory_mutator(lambda inv: inv["classification_counts"].__setitem__("direct_product_basis", 30)), "E_CLASSIFICATION")
trial("target_wave_edge_count_tamper", inventory_mutator(lambda inv: inv.__setitem__("target_wave_edge_count", 39)), "E_EDGE_SET")

# These guards alter validator state directly, then restore it. They exercise fixed
# independent pins and the real subprocess exception boundary.
def direct_trial(name: str, mutate, expected: str):
    saved = {
        "PROFILE_PINS": validator.PROFILE_PINS,
        "PRIOR_MAIN_IDS": validator.PRIOR_MAIN_IDS,
        "check_call": validator.subprocess.check_call,
        "check_output": validator.subprocess.check_output,
    }
    try:
        mutate()
        if hasattr(validator.expected_state, "cache_clear"):
            validator.expected_state.cache_clear()
        try:
            validator.verify()
        except AssertionError as exc:
            actual = str(exc)
            if not actual.startswith(expected + ":"):
                raise AssertionError(f"{name}: expected {expected}, got {actual}") from exc
        else:
            raise AssertionError(f"{name}: mutation unexpectedly passed")
    finally:
        validator.PROFILE_PINS = saved["PROFILE_PINS"]
        validator.PRIOR_MAIN_IDS = saved["PRIOR_MAIN_IDS"]
        validator.subprocess.check_call = saved["check_call"]
        validator.subprocess.check_output = saved["check_output"]
        if hasattr(validator.expected_state, "cache_clear"):
            validator.expected_state.cache_clear()

def profile_pin_pop():
    pins = dict(validator.PROFILE_PINS)
    pins.pop(next(iter(pins)))
    validator.PROFILE_PINS = pins

def prior_main_overlap():
    row = load_jsonl(BUNDLE / "classification-research.jsonl")[0]
    validator.PRIOR_MAIN_IDS = frozenset(set(validator.PRIOR_MAIN_IDS) | {row["asset_id"]})

def base_not_ancestor():
    original = validator.subprocess.check_call
    def fail_merge_base(command, *args, **kwargs):
        if list(command[:3]) == ["git", "merge-base", "--is-ancestor"]:
            raise validator.subprocess.CalledProcessError(1, command)
        return original(command, *args, **kwargs)
    validator.subprocess.check_call = fail_merge_base

def missing_source():
    original = validator.subprocess.check_output
    target = f"{validator.BASE_REVISION}:{validator.PHASE}"
    def fail_phase(command, *args, **kwargs):
        if len(command) >= 3 and list(command[:3]) == ["git", "show", target]:
            raise validator.subprocess.CalledProcessError(128, command)
        return original(command, *args, **kwargs)
    validator.subprocess.check_output = fail_phase

direct_trial("profile_pin_set_tamper", profile_pin_pop, "E_TARGET_SET")
direct_trial("prior_main_overlap_pin_tamper", prior_main_overlap, "E_OVERLAP")
direct_trial("fixed_BASE_non_ancestor", base_not_ancestor, "E_BASE_NOT_ANCESTOR")
direct_trial("base_source_missing", missing_source, "E_BASE_SOURCE")

validator.BUNDLE = BUNDLE
print("SCF-B-0133 selfcheck PASS negative_cases=50")
