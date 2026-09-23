#!/usr/bin/env python3
"""Execute fail-closed negative cases for SCF-B-0142 without running legacy assets."""
from __future__ import annotations

import copy
import importlib.util
import json
import shutil
import tempfile
from pathlib import Path

BUNDLE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("scf_b_0142_validator", BUNDLE / "validate.py")
assert spec and spec.loader
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
EXECUTED_CASES: list[str] = []


def load_json(path: Path):
    return json.loads(path.read_text())


def load_jsonl(path: Path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def dump_json(path: Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n")


def dump_jsonl(path: Path, rows) -> None:
    path.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for row in rows))


def setup_copy():
    root = Path(tempfile.mkdtemp(prefix="scf-b-0142-selfcheck-"))
    target = root / "scaffold" / BUNDLE.name
    target.parent.mkdir(parents=True)
    shutil.copytree(BUNDLE, target)
    (root / "scaffold" / "bindings").mkdir(parents=True, exist_ok=True)
    shutil.copy2(BUNDLE.parent / "bindings" / "SCF-B-0142.json", root / "scaffold" / "bindings" / "SCF-B-0142.json")
    return root, target


def trial(name, mutate, expected):
    root, target = setup_copy()
    old = (validator.BUNDLE, validator.LEDGER, validator.INVENTORY, validator.BINDING, validator.AUDIT)
    validator.BUNDLE = target
    validator.LEDGER = target / "classification-research.jsonl"
    validator.INVENTORY = target / "inventory.json"
    validator.BINDING = root / "scaffold/bindings/SCF-B-0142.json"
    validator.AUDIT = target / "independent-source-audit.json"
    try:
        mutate(target)
        validator.verify()
    except AssertionError as exc:
        if not str(exc).startswith(expected + ":"):
            raise AssertionError(f"{name}: expected {expected}, got {exc}") from exc
        EXECUTED_CASES.append(name)
    else:
        raise AssertionError(f"{name}: mutation unexpectedly passed")
    finally:
        validator.BUNDLE, validator.LEDGER, validator.INVENTORY, validator.BINDING, validator.AUDIT = old
        shutil.rmtree(root, ignore_errors=True)


def direct_trial(name, mutate, expected):
    root, target = setup_copy()
    old = (validator.BUNDLE, validator.LEDGER, validator.INVENTORY, validator.BINDING, validator.AUDIT, validator.archive_tree, validator.manifest_sha)
    validator.BUNDLE = target
    validator.LEDGER = target / "classification-research.jsonl"
    validator.INVENTORY = target / "inventory.json"
    validator.BINDING = root / "scaffold/bindings/SCF-B-0142.json"
    validator.AUDIT = target / "independent-source-audit.json"
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
        validator.BUNDLE, validator.LEDGER, validator.INVENTORY, validator.BINDING, validator.AUDIT, validator.archive_tree, validator.manifest_sha = old
        shutil.rmtree(root, ignore_errors=True)


def records(fn):
    def mutate(target):
        path = target / "classification-research.jsonl"
        value = load_jsonl(path)
        fn(value)
        dump_jsonl(path, value)
    return mutate


def inventory(fn):
    def mutate(target):
        path = target / "inventory.json"
        value = load_json(path)
        fn(value)
        dump_json(path, value)
    return mutate


def binding(fn):
    def mutate(target):
        path = target.parent / "bindings" / "SCF-B-0142.json"
        value = load_json(path)
        fn(value)
        dump_json(path, value)
    return mutate


trial("target_omission", records(lambda value: value.pop()), "E_TARGET_SET")
trial("target_duplicate", records(lambda value: value.__setitem__(1, copy.deepcopy(value[0]))), "E_TARGET_SET")
trial("source_sha_tamper", records(lambda value: value[0]["source_exact"].__setitem__("sha256", "sha256:" + "0" * 64)), "E_SOURCE")
trial("source_anchor_tamper", records(lambda value: value[0]["source_exact"]["semantic_anchor"].__setitem__("line_text_sha256", "sha256:" + "0" * 64)), "E_SOURCE")
trial("empty_source_reclassified", records(lambda value: next(row for row in value if row["source_exact"]["line_count"] == 0)["classification"].update({"category": "direct_product_basis", "candidate_products": ["HELIX-OS"]})), "E_CLASSIFICATION")
trial("phase_admission", records(lambda value: value[0]["phase_evidence"].__setitem__("formal_phase_admission", True)), "E_PHASE")
trial("implementation_promotion", records(lambda value: value[0]["implementation_evidence"].__setitem__("status", "implemented")), "E_IMPLEMENTATION")
trial("history_digest_tamper", records(lambda value: value[0]["legacy_history_failure_consumer"]["failure_consumer_static"]["failure"].__setitem__("sha256", "sha256:" + "0" * 64)), "E_HISTORY_CONSUMER")
trial("boundary_digest_tamper", records(lambda value: value[0]["boundary_evidence"]["product_boundary"].__setitem__("sha256", "sha256:" + "0" * 64)), "E_BOUNDARY_ANCHOR")
trial("wave_edge_injection", records(lambda value: value[0]["wave_evidence"].__setitem__("edge_count", 1)), "E_WAVE")
trial("authority_promotion", records(lambda value: value[0].__setitem__("authority_effect", "formal")), "E_AUTHORITY")
trial("overlap_flag_tamper", inventory(lambda value: value["overlap_status"].__setitem__("all_asset_id_path_sha_identity_counts_zero", False)), "E_OVERLAP")
trial("input_omission", inventory(lambda value: value["input_digests"].pop()), "E_INPUT_DIGEST")
trial("input_stale", inventory(lambda value: value["input_digests"][0].__setitem__("sha256", "sha256:" + "0" * 64)), "E_INPUT_DIGEST")
trial("binding_omission", binding(lambda value: value["upstream"].pop()), "E_BINDING_CLOSURE")
trial("output_digest_tamper", inventory(lambda value: value.__setitem__("output_sha256", "sha256:" + "0" * 64)), "E_OUTPUT_DIGEST")
trial("independent_audit_digest_tamper", lambda target: (target / "independent-source-audit.json").write_text("{}\n"), "E_INDEPENDENT_AUDIT")
direct_trial("archive_symlink_mode", lambda: setattr(validator, "archive_tree", lambda path: ("120000", "blob", "0" * 40)), "E_ARCHIVE_STATIC")
direct_trial("archive_manifest_mismatch", lambda: setattr(validator, "manifest_sha", lambda path: "sha256:" + "0" * 64), "E_INDEPENDENT_AUDIT")
trial("malformed_json", lambda target: (target / "classification-research.jsonl").write_text("{\n"), "E_JSON")
trial("duplicate_json_key", lambda target: (target / "classification-research.jsonl").write_text('{"asset_id":"x","asset_id":"y"}\n'), "E_JSON")
trial("history_disposition_promotion", records(lambda value: value[0]["legacy_history_failure_consumer"]["disposition"].update({"disposition": "adopted", "product_target": "HELIX-OS", "implementation_status": "implemented"})), "E_LEDGER")
trial("bootstrap_candidate_tamper", records(lambda value: value[0]["asset_ledger"]["bootstrap"].update({"candidate_product_targets": ["HELIX-Web"]})), "E_LEDGER")
trial("phase_status_promotion", records(lambda value: value[0]["phase_evidence"].__setitem__("phase_status", "formally_admitted")), "E_PHASE")
trial("human_judgment_clearance", records(lambda value: value[0].__setitem__("human_judgment_remaining", [])), "E_RECORD")
trial("record_extra_key", records(lambda value: value[0].__setitem__("formal_product_authority", "HELIX-OS")), "E_RECORD")
trial("record_null_classification", records(lambda value: value[0].__setitem__("classification", None)), "E_RECORD")
trial("record_list_phase", records(lambda value: value[0].__setitem__("phase_evidence", [])), "E_RECORD")
trial("record_missing_ledger", records(lambda value: value[0].pop("asset_ledger")), "E_RECORD")
trial("strict_bool_integer", records(lambda value: value[0]["source_exact"].__setitem__("bytes", False)), "E_SOURCE")
trial("strict_integer_float", inventory(lambda value: value["classification_counts"].__setitem__("direct_product_basis", 35.0)), "E_CATEGORY_PARTITION")
trial("inventory_target_count_tamper", inventory(lambda value: value["research_scope"].__setitem__("target_id_count", 58)), "E_TARGET_SET")
trial("inventory_wave_count_tamper", inventory(lambda value: value["wave_evidence"].__setitem__("target_edge_count", 9)), "E_INVENTORY")
trial("inventory_bool_integer", inventory(lambda value: value["authority_boundary"].__setitem__("phase_updated", 0)), "E_INVENTORY")
trial("binding_state_promotion", binding(lambda value: value.__setitem__("state", "formal")), "E_BINDING_CLOSURE")
trial("binding_forbidden_clearance", binding(lambda value: value["operations"].__setitem__("forbidden", [])), "E_BINDING_CLOSURE")
trial("binding_replacement_promotion", binding(lambda value: value["replacement"].__setitem__("status", "retired")), "E_BINDING_CLOSURE")
trial("research_union_tamper", inventory(lambda value: value["research_union"].__setitem__("projected_union_count", 999)), "E_RESEARCH_UNION")

if tuple(EXECUTED_CASES) != tuple(validator.EXPECTED_NEGATIVE_CASES):
    raise AssertionError(f"negative case order/set mismatch: executed={EXECUTED_CASES} expected={validator.EXPECTED_NEGATIVE_CASES}")
print(f"SCF-B-0142 selfcheck PASS negative_cases={len(EXECUTED_CASES)}")
