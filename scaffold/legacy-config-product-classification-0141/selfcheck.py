#!/usr/bin/env python3
"""Fail-closed negative checks for SCF-B-0141; legacy assets are never executed."""
from __future__ import annotations

import copy
import importlib.util
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

BUNDLE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("scf_b_0141_validator", BUNDLE / "validate.py")
validator = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(validator)

EXECUTED_CASES = []

def load_json(path: Path):
    return json.loads(path.read_text())


def load_jsonl(path: Path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def dump_json(path: Path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n")


def dump_jsonl(path: Path, rows):
    path.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for row in rows))


def setup_copy():
    root = Path(tempfile.mkdtemp(prefix="scf-b-0141-selfcheck-"))
    target = root / "scaffold" / BUNDLE.name
    target.parent.mkdir(parents=True)
    shutil.copytree(BUNDLE, target)
    (root / "scaffold" / "bindings").mkdir(parents=True, exist_ok=True)
    shutil.copy2(BUNDLE.parent / "bindings" / "SCF-B-0141.json", root / "scaffold" / "bindings" / "SCF-B-0141.json")
    return root, target


def trial(name, mutate, expected):
    root, target = setup_copy()
    mutate(target)
    old = (validator.BUNDLE, validator.LEDGER, validator.INVENTORY, validator.BINDING)
    validator.BUNDLE = target; validator.LEDGER = target / "classification-research.jsonl"; validator.INVENTORY = target / "inventory.json"; validator.BINDING = root / "scaffold/bindings/SCF-B-0141.json"
    try:
        validator.verify()
    except AssertionError as exc:
        if not str(exc).startswith(expected + ":"):
            raise AssertionError(f"{name}: expected {expected}, got {exc}") from exc
        EXECUTED_CASES.append(name)
    else:
        raise AssertionError(f"{name}: mutation unexpectedly passed")
    finally:
        validator.BUNDLE, validator.LEDGER, validator.INVENTORY, validator.BINDING = old
        shutil.rmtree(root, ignore_errors=True)


def direct_trial(name, mutate, expected):
    root, target = setup_copy()
    old = (validator.BUNDLE, validator.LEDGER, validator.INVENTORY, validator.BINDING, validator.archive_tree, validator.manifest_sha)
    validator.BUNDLE = target; validator.LEDGER = target / "classification-research.jsonl"; validator.INVENTORY = target / "inventory.json"; validator.BINDING = root / "scaffold/bindings/SCF-B-0141.json"
    try:
        mutate()
        validator.verify()
    except AssertionError as exc:
        if not str(exc).startswith(expected + ":"):
            raise AssertionError(f"{name}: expected {expected}, got {exc}") from exc
        EXECUTED_CASES.append(name)
    else:
        raise AssertionError(f"{name}: mutation unexpectedly passed")
    finally:
        validator.BUNDLE, validator.LEDGER, validator.INVENTORY, validator.BINDING, validator.archive_tree, validator.manifest_sha = old
        shutil.rmtree(root, ignore_errors=True)


def records(fn):
    def mutate(target):
        path = target / "classification-research.jsonl"; rows = load_jsonl(path); fn(rows); dump_jsonl(path, rows)
    return mutate


def inventory(fn):
    def mutate(target):
        path = target / "inventory.json"; value = load_json(path); fn(value); dump_json(path, value)
    return mutate


def binding(fn):
    def mutate(target):
        path = target.parent / "bindings" / "SCF-B-0141.json"; value = load_json(path); fn(value); dump_json(path, value)
    return mutate


trial("target_omission", records(lambda rows: rows.pop()), "E_TARGET_SET")
trial("target_duplicate", records(lambda rows: rows.__setitem__(1, copy.deepcopy(rows[0]))), "E_TARGET_SET")
trial("target_extra", records(lambda rows: rows.append(copy.deepcopy(rows[0]) | {"asset_id": "LEGACY-ASSET-EXTRA"})), "E_TARGET_SET")
trial("source_sha_tamper", records(lambda rows: rows[0]["source_exact"].__setitem__("sha256", "sha256:" + "0" * 64)), "E_SOURCE")
trial("source_blob_tamper", records(lambda rows: rows[0]["source_exact"].__setitem__("blob", "0" * 40)), "E_SOURCE")
trial("source_anchor_tamper", records(lambda rows: rows[0]["source_exact"]["semantic_anchor"].__setitem__("line_text_sha256", "sha256:" + "0" * 64)), "E_SOURCE")
trial("source_coverage_tamper", records(lambda rows: rows[0]["source_exact"]["anchor_line_coverage"].__setitem__("unanchored_line_ranges", [])), "E_SOURCE")
trial("phase_status_tamper", records(lambda rows: rows[0]["phase_evidence"].__setitem__("legacy_implementation_status", "implemented")), "E_PHASE")
trial("manual_category_tamper", records(lambda rows: rows[0]["classification"].__setitem__("category", "multi_product_conflict")), "E_CLASSIFICATION")
trial("bootstrap_all_product_rewrap_rejected", records(lambda rows: next(r for r in rows if r["source_path"] == "config/drive-route-catalog.json")["classification"].update({"category": "multi_product_conflict", "candidate_products": ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]})), "E_CLASSIFICATION")
trial("manual_product_tamper", records(lambda rows: rows[0]["classification"].__setitem__("candidate_products", ["HELIX-Web"])), "E_CLASSIFICATION")
trial("manual_product_basis_tamper", records(lambda rows: rows[0]["classification"]["product_basis"].clear()), "E_CLASSIFICATION")
trial("manual_counterevidence_tamper", records(lambda rows: rows[0]["classification"].__setitem__("counterevidence", [])), "E_CLASSIFICATION")
trial("implementation_tamper", records(lambda rows: rows[0]["implementation_evidence"].__setitem__("status", "implemented")), "E_IMPLEMENTATION")
trial("history_failure_nested_tamper", records(lambda rows: rows[0]["legacy_history_failure_consumer"]["failure_consumer_static"]["failure"].__setitem__("sha256", "sha256:" + "0" * 64)), "E_HISTORY_CONSUMER")
trial("history_consumer_nested_tamper", records(lambda rows: rows[0]["legacy_history_failure_consumer"]["failure_consumer_static"]["consumer"].__setitem__("sha256", "sha256:" + "0" * 64)), "E_HISTORY_CONSUMER")
trial("boundary_tamper", records(lambda rows: rows[0]["boundary_evidence"]["product_boundary"].__setitem__("sha256", "sha256:" + "0" * 64)), "E_BOUNDARY_ANCHOR")
trial("edge_injection", records(lambda rows: rows[0].__setitem__("wave_edge_count", 1)), "E_EDGE_SET")
trial("authority_promotion", records(lambda rows: rows[0].__setitem__("authority_effect", "formal")), "E_AUTHORITY")
trial("inventory_input_omission", inventory(lambda value: value["input_digests"].pop()), "E_INPUT_DIGEST")
trial("inventory_input_duplicate", inventory(lambda value: value["input_digests"].append(copy.deepcopy(value["input_digests"][0]))), "E_INPUT_DIGEST")
trial("input_wave1_stale", inventory(lambda value: value["input_digests"][value["input_digests"].index(next(x for x in value["input_digests"] if "wave1" in x["path"]))].__setitem__("sha256", "sha256:" + "0" * 64)), "E_INPUT_DIGEST")
trial("input_wave37_stale", inventory(lambda value: value["input_digests"][value["input_digests"].index(next(x for x in value["input_digests"] if "wave37" in x["path"]))].__setitem__("sha256", "sha256:" + "0" * 64)), "E_INPUT_DIGEST")
trial("input_wave50_stale", inventory(lambda value: value["input_digests"][value["input_digests"].index(next(x for x in value["input_digests"] if "wave50" in x["path"]))].__setitem__("sha256", "sha256:" + "0" * 64)), "E_INPUT_DIGEST")
trial("input_main_bundle_stale", inventory(lambda value: value["input_digests"][value["input_digests"].index(next(x for x in value["input_digests"] if "0126/classification-research" in x["path"]))].__setitem__("sha256", "sha256:" + "0" * 64)), "E_INPUT_DIGEST")
trial("inventory_nested_duplicate", lambda target: (target / "inventory.json").write_text('{"schema_revision":2,"research_scope":{"source_prefix":"config/","source_prefix":"duplicate"}}\n'), "E_JSON")
trial("ledger_nested_duplicate", lambda target: (target / "classification-research.jsonl").write_text('{"asset_id":"x","classification":{"category":"direct_product_basis","category":"duplicate"}}\n'), "E_JSON")
trial("inventory_target_tamper", inventory(lambda value: value.__setitem__("target_count", 40)), "E_TARGET_SET")
trial("inventory_category_count", inventory(lambda value: value["classification_counts"].__setitem__("direct_product_basis", 25)), "E_CATEGORY_PARTITION")
trial("inventory_union_tamper", inventory(lambda value: value["research_union"]["authoritative"].__setitem__("target_overlap", 1)), "E_RESEARCH_UNION")
trial("inventory_overlap_tamper", inventory(lambda value: value["overlap_status"].__setitem__("target_vs_authoritative_current_main", 1)), "E_OVERLAP")
trial("inventory_authoritative_union_count_tamper", inventory(lambda value: value["research_union"]["authoritative"].__setitem__("count", 495)), "E_RESEARCH_UNION")
trial("inventory_authority_tamper", inventory(lambda value: value["authority_boundary"].__setitem__("new_build_allowed", True)), "E_AUTHORITY")
trial("inventory_output_tamper", inventory(lambda value: value.__setitem__("output_sha256", "sha256:" + "0" * 64)), "E_OUTPUT_DIGEST")
trial("inventory_base_tamper", inventory(lambda value: value.__setitem__("base_revision", "0" * 40)), "E_BASE_PIN")
trial("binding_omission", binding(lambda value: value["upstream"].pop()), "E_BINDING_CLOSURE")
trial("binding_extra", binding(lambda value: value["upstream"].append(copy.deepcopy(value["upstream"][0]))), "E_BINDING_CLOSURE")
trial("binding_stale", binding(lambda value: value["upstream"][0].__setitem__("sha256", "0" * 64)), "E_BINDING_CLOSURE")
trial("malformed_json", lambda target: (target / "classification-research.jsonl").write_text("{\n"), "E_JSON")
trial("duplicate_json_key", lambda target: (target / "classification-research.jsonl").write_text('{"asset_id":"x","asset_id":"y"}\n'), "E_JSON")

direct_trial("archive_symlink_mode", lambda: setattr(validator, "archive_tree", lambda path: ("120000", "blob", "0" * 40)), "E_ARCHIVE_STATIC")
direct_trial("archive_nonregular_type", lambda: setattr(validator, "archive_tree", lambda path: ("100644", "tree", "0" * 40)), "E_ARCHIVE_STATIC")
direct_trial("archive_path_mismatch", lambda: setattr(validator, "archive_tree", lambda path: ("100644", "blob", "0" * 40)), "E_ARCHIVE_STATIC")
direct_trial("manifest_mismatch", lambda: setattr(validator, "manifest_sha", lambda path: "sha256:" + "0" * 64), "E_ARCHIVE_STATIC")

def generator_pin_tamper(target):
    path = target / "generate.py"
    text = path.read_text()
    old = '"config/artifact-retirement-authority.json": ("direct_product_basis", ["HELIX-OS"], 6, 15,'
    new = '"config/artifact-retirement-authority.json": ("direct_product_basis", ["HELIX-Web"], 6, 15,'
    if old not in text: raise AssertionError("generator profile marker missing")
    path.write_text(text.replace(old, new, 1))
    subprocess.check_call(["python3", str(path)], cwd=Path.cwd(), stdout=subprocess.DEVNULL)

trial("generator_manual_pin_drift", generator_pin_tamper, "E_SOURCE")

if len(EXECUTED_CASES) != len(set(EXECUTED_CASES)):
    raise AssertionError(f"duplicate executed negative case IDs: {EXECUTED_CASES}")
if tuple(EXECUTED_CASES) != tuple(validator.EXPECTED_NEGATIVE_CASES):
    raise AssertionError(f"negative case order/set mismatch: executed={EXECUTED_CASES} expected={validator.EXPECTED_NEGATIVE_CASES}")
print(f"SCF-B-0141 selfcheck PASS negative_cases={len(EXECUTED_CASES)}")
