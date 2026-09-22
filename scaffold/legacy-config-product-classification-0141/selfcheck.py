#!/usr/bin/env python3
"""Negative self-checks for SCF-B-0141; no legacy artifact is executed."""
from __future__ import annotations

import copy
import importlib.util
import json
import shutil
import tempfile
from pathlib import Path

BUNDLE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("scf_b_0141_validator", BUNDLE / "validate.py")
validator = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(validator)


def load_json(path: Path):
    return json.loads(path.read_text())


def load_jsonl(path: Path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def dump_json(path: Path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n")


def dump_jsonl(path: Path, rows):
    path.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for row in rows))


def trial(name, mutate, expected):
    root = Path(tempfile.mkdtemp(prefix="scf-b-0141-selfcheck-"))
    target = root / BUNDLE.name
    shutil.copytree(BUNDLE, target)
    mutate(target)
    old_bundle, old_ledger, old_inventory = validator.BUNDLE, validator.LEDGER, validator.INVENTORY
    validator.BUNDLE = target; validator.LEDGER = target / "classification-research.jsonl"; validator.INVENTORY = target / "inventory.json"
    try:
        validator.verify()
    except AssertionError as exc:
        if not str(exc).startswith(expected + ":"):
            raise AssertionError(f"{name}: expected {expected}, got {exc}") from exc
    else:
        raise AssertionError(f"{name}: mutation unexpectedly passed")
    finally:
        validator.BUNDLE, validator.LEDGER, validator.INVENTORY = old_bundle, old_ledger, old_inventory
        shutil.rmtree(root, ignore_errors=True)


def records(fn):
    def mutate(target):
        path = target / "classification-research.jsonl"; rows = load_jsonl(path); fn(rows); dump_jsonl(path, rows)
    return mutate


def inventory(fn):
    def mutate(target):
        path = target / "inventory.json"; value = load_json(path); fn(value); dump_json(path, value)
    return mutate


trial("target_omission", records(lambda rows: rows.pop()), "E_TARGET_SET")
trial("target_duplicate", records(lambda rows: rows.__setitem__(1, copy.deepcopy(rows[0]))), "E_TARGET_SET")
trial("target_extra", records(lambda rows: rows.append(copy.deepcopy(rows[0]) | {"asset_id": "LEGACY-ASSET-EXTRA"})), "E_TARGET_SET")
trial("source_sha_tamper", records(lambda rows: rows[0]["source_exact"].__setitem__("sha256", "sha256:" + "0" * 64)), "E_SOURCE")
trial("source_blob_tamper", records(lambda rows: rows[0]["source_exact"].__setitem__("blob", "0" * 40)), "E_SOURCE")
trial("source_anchor_tamper", records(lambda rows: rows[0]["source_exact"]["semantic_anchor"].__setitem__("line_text_sha256", "sha256:" + "0" * 64)), "E_SOURCE")
trial("phase_status_tamper", records(lambda rows: rows[0]["phase_evidence"].__setitem__("legacy_implementation_status", "implemented")), "E_PHASE")
trial("classification_category_tamper", records(lambda rows: rows[0]["classification"].__setitem__("category", "multi_product_conflict")), "E_CLASSIFICATION")
trial("classification_products_tamper", records(lambda rows: rows[0]["classification"].__setitem__("candidate_products", ["HELIX-Web"])), "E_CLASSIFICATION")
trial("implementation_tamper", records(lambda rows: rows[0]["implementation_evidence"].__setitem__("status", "implemented")), "E_IMPLEMENTATION")
trial("history_failure_tamper", records(lambda rows: rows[0]["legacy_history_failure_consumer"]["observed_failure_status"].__setitem__("x", "y") if False else rows[0]["legacy_history_failure_consumer"].__setitem__("degradation_status", "implemented")), "E_HISTORY_CONSUMER")
trial("boundary_tamper", records(lambda rows: rows[0]["boundary_evidence"]["product_boundary"].__setitem__("sha256", "sha256:" + "0" * 64)), "E_BOUNDARY_ANCHOR")
trial("edge_injection", records(lambda rows: rows[0].__setitem__("wave_edge_count", 1)), "E_EDGE_SET")
trial("authority_promotion", records(lambda rows: rows[0].__setitem__("authority_effect", "formal")), "E_AUTHORITY")
trial("inventory_input_omission", inventory(lambda value: value["input_digests"].pop()), "E_INPUT_DIGEST")
trial("inventory_input_duplicate", inventory(lambda value: value["input_digests"].append(copy.deepcopy(value["input_digests"][0]))), "E_INPUT_DIGEST")
trial("inventory_target_tamper", inventory(lambda value: value["target_count"].__class__ and value.__setitem__("target_count", 40)), "E_TARGET_SET")
trial("inventory_category_count", inventory(lambda value: value["classification_counts"].__setitem__("direct_product_basis", 14)), "E_CATEGORY_PARTITION")
trial("inventory_union_tamper", inventory(lambda value: value["research_union"].__setitem__("union_count", 495)), "E_RESEARCH_UNION")
trial("inventory_authority_tamper", inventory(lambda value: value["authority_boundary"].__setitem__("new_build_allowed", True)), "E_AUTHORITY")
trial("inventory_output_tamper", inventory(lambda value: value.__setitem__("output_sha256", "sha256:" + "0" * 64)), "E_OUTPUT_DIGEST")
trial("inventory_base_tamper", inventory(lambda value: value.__setitem__("base_revision", "0" * 40)), "E_BASE_PIN")
trial("malformed_json", lambda target: (target / "classification-research.jsonl").write_text("{\n"), "E_JSON")
trial("duplicate_json_key", lambda target: (target / "classification-research.jsonl").write_text('{"asset_id":"x","asset_id":"y"}\n'), "E_JSON")

print("SCF-B-0141 selfcheck PASS negative_cases=24")
