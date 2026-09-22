#!/usr/bin/env python3
"""Expected-code negative selfcheck; no archive asset is executed."""
from __future__ import annotations

import copy
import importlib.util
import json
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("scf0127_validate", HERE / "validate.py")
if spec is None or spec.loader is None:
    raise RuntimeError("cannot load validator")
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
BASE_ROWS = [json.loads(x) for x in (HERE / "classification-research.jsonl").read_text().splitlines()]
BASE_INV = json.loads((HERE / "inventory.json").read_text())


def run_case(name: str, code: str, row_mut=None, inv_mut=None):
    with tempfile.TemporaryDirectory(prefix="scf-b-0128-") as td:
        root = Path(td)
        ledger = root / "classification-research.jsonl"
        inventory = root / "inventory.json"
        rows = copy.deepcopy(BASE_ROWS)
        inv = copy.deepcopy(BASE_INV)
        if row_mut:
            row_mut(rows)
        if inv_mut:
            inv_mut(inv)
        ledger.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for row in rows))
        inventory.write_text(json.dumps(inv, ensure_ascii=False, sort_keys=True, indent=2) + "\n")
        old = validator.BUNDLE, validator.LEDGER, validator.INVENTORY
        validator.BUNDLE, validator.LEDGER, validator.INVENTORY = root, ledger, inventory
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


def remove_row(rows): rows.pop()
def duplicate_row(rows): rows.append(copy.deepcopy(rows[-1]))
def extra_source_path(rows): rows[0]["source_path"] = "src/state-db/fake.ts"
def source_blob(rows): rows[0]["source_exact"]["blob"] = "0" * 40
def record_shape(rows): rows[0]["unexpected"] = True
def source_anchor(rows): rows[0]["source_exact"]["semantic_anchor"]["line_text_sha256"] = "sha256:" + "0" * 64
def read_mode(rows): rows[0]["source_exact"]["read_mode"] = "live_worktree"
def category(rows): rows[0]["classification"]["category"] = "insufficient_basis"
def product(rows): rows[0]["classification"]["candidate_products"] = ["HELIX-Web"]
def reason(rows): rows[0]["classification"]["reason"] = "filename based guess"
def counter(rows): rows[0]["classification"]["counter_evidence"] = ""
def boundary(rows): rows[0]["boundary_evidence"]["product_boundary"]["blob"] = "0" * 40
def l1_approval(rows): rows[0]["boundary_evidence"]["l1"]["HELIX-OS"]["effective_approval"]["approved_l1_sha256"] = "sha256:" + "0" * 64
def l1_basis(rows): rows[0]["classification"]["candidate_product_basis"]["HELIX-OS"]["l1_line"] = 999
def phase_status(rows): rows[0]["phase_evidence"]["row"]["product_classification_status"] = "approved"
def asset_ledger(rows): rows[0]["legacy_asset_evidence"]["row_sha256"] = "sha256:" + "0" * 64
def history(rows): rows[0]["legacy_history_failure_consumer"]["failure_consumer_static"]["failure"]["matched_lines"] = [{"line": 1}]
def implementation(rows): rows[0]["legacy_implementation_shrinkage_evidence"]["degradation_status"] = "reused"
def wave(rows): rows[0]["wave_edge_count"] += 1
def authority(rows): rows[0]["authority_effect"] = "approved"
def formal(rows): rows[0]["formal_asset_classification_updated"] = True
def human_judgment(rows): rows[0]["human_judgment_remaining"].pop()
def input_missing(inv): inv["input_digests"].pop()
def input_duplicate(inv): inv["input_digests"].append(copy.deepcopy(inv["input_digests"][0]))
def inventory_scope(inv): inv["scope"] = "filename-only"
def inventory_rules(inv): inv["classification_rule"]["direct_product_basis"] = "path"
def base_pin(inv): inv["base_revision"] = "0" * 40
def output(inv): inv["output_sha256"] = "sha256:" + "0" * 64
def old_exec(inv): inv["old_archive_execution"]["runtime"] = True
def inventory_schema(inv): inv["schema_revision"] = 2
def inventory_binding(inv): inv["binding_id"] = "SCF-B-9999"
def inventory_target_count(inv): inv["target_count"] = 50
def inventory_candidate_total(inv): inv["candidate_needs_semantic_review_total"] = 2227
def inventory_existing_count(inv): inv["existing_0108_target_count"] = 94
def inventory_existing_digest(inv): inv["existing_0108_target_asset_ids_sha256"] = "sha256:" + "0" * 64
def inventory_overlap(inv): inv["existing_research_overlap"]["SCF-B-0108"] = ["fake"]
def inventory_overlap_rule(inv): inv["overlap_rule"] = "all overlap accepted"
def inventory_l1_approval(inv): inv["l1_approval"]["decision_record"]["decision_status"] = "pending"
def inventory_top_key_missing(inv): inv.pop("classification_counts")
def inventory_top_key_extra(inv): inv["unexpected"] = True




def direct_case(name, code, mutate):
    old_values = (validator.subprocess.call, validator.subprocess.check_output, validator.git_bytes, validator.EXPECTED_PROFILES, validator.parse_jsonl)
    try:
        mutate()
        try:
            validator.check()
        except AssertionError as exc:
            actual = str(exc).split(":", 1)[0]
            if actual != code:
                raise AssertionError(f"{name}: expected {code}, got {actual}: {exc}")
        else:
            raise AssertionError(f"{name}: validator unexpectedly passed")
    finally:
        validator.subprocess.call, validator.subprocess.check_output, validator.git_bytes, validator.EXPECTED_PROFILES, validator.parse_jsonl = old_values


def non_ancestor():
    validator.subprocess.call = lambda *args, **kwargs: 1


def missing_base_source():
    original = validator.subprocess.check_output
    target = f"{validator.BASE_REVISION}:{validator.PHASE}"
    def missing(command, *args, **kwargs):
        if len(command) >= 3 and command[0:2] == ["git", "show"] and command[2] == target:
            raise validator.subprocess.CalledProcessError(128, command)
        return original(command, *args, **kwargs)
    validator.subprocess.check_output = missing


def missing_profile():
    altered = dict(validator.EXPECTED_PROFILES)
    altered.pop(next(iter(altered)))
    validator.EXPECTED_PROFILES = altered


def overlapping_prior_set():
    original = validator.parse_jsonl
    def altered(path):
        rows = original(path)
        if path == validator.PHASE:
            duplicate = copy.deepcopy(next(r for r in rows if r.get("source_path") in validator.EXPECTED_PROFILES))
            duplicate["product_classification_status"] = "unresolved"
            rows.append(duplicate)
        return rows
    validator.parse_jsonl = altered

CASES = [
    ("target missing", "E_TARGET_SET", remove_row, None),
    ("target duplicate", "E_TARGET_SET", duplicate_row, None),
    ("target extra path", "E_TARGET_SET", extra_source_path, None),
    ("source blob", "E_OLD_ASSET_SOURCE", source_blob, None),
    ("record shape", "E_RECORD_SHAPE", record_shape, None),
    ("source anchor", "E_SOURCE_ANCHOR", source_anchor, None),
    ("read mode", "E_READ_MODE", read_mode, None),
    ("classification category", "E_CLASSIFICATION", category, None),
    ("classification product", "E_CLASSIFICATION", product, None),
    ("classification reason", "E_CLASSIFICATION", reason, None),
    ("classification counter", "E_CLASSIFICATION", counter, None),
    ("boundary blob", "E_BOUNDARY_ANCHOR", boundary, None),
    ("L1 approval row", "E_L1_APPROVAL", l1_approval, None),
    ("L1 semantic basis", "E_CLASSIFICATION", l1_basis, None),
    ("phase status", "E_PHASE_STATUS", phase_status, None),
    ("asset ledger", "E_OLD_LEDGER_RECORD", asset_ledger, None),
    ("history", "E_HISTORY", history, None),
    ("implementation evidence", "E_IMPLEMENTATION_EVIDENCE", implementation, None),
    ("wave edge", "E_WAVE_EDGE_SET", wave, None),
    ("authority effect", "E_AUTHORITY_PROMOTION", authority, None),
    ("formal classification", "E_AUTHORITY_PROMOTION", formal, None),
    ("human judgment", "E_HUMAN_JUDGMENT", human_judgment, None),
    ("input missing", "E_INPUT_DIGEST", None, input_missing),
    ("input duplicate", "E_INPUT_DIGEST", None, input_duplicate),
    ("inventory scope", "E_INVENTORY_DECLARATION", None, inventory_scope),
    ("inventory rules", "E_INVENTORY_DECLARATION", None, inventory_rules),
    ("old execution", "E_INVENTORY_DECLARATION", None, old_exec),
    ("inventory schema", "E_INVENTORY_DECLARATION", None, inventory_schema),
    ("inventory binding", "E_INVENTORY_DECLARATION", None, inventory_binding),
    ("inventory target count", "E_INVENTORY_DECLARATION", None, inventory_target_count),
    ("inventory candidate total", "E_INVENTORY_DECLARATION", None, inventory_candidate_total),
    ("inventory existing count", "E_INVENTORY_DECLARATION", None, inventory_existing_count),
    ("inventory existing digest", "E_INVENTORY_DECLARATION", None, inventory_existing_digest),
    ("inventory overlap", "E_INVENTORY_DECLARATION", None, inventory_overlap),
    ("inventory overlap rule", "E_INVENTORY_DECLARATION", None, inventory_overlap_rule),
    ("inventory L1 approval", "E_L1_APPROVAL", None, inventory_l1_approval),
    ("inventory top key missing", "E_INVENTORY_SCHEMA", None, inventory_top_key_missing),
    ("inventory top key extra", "E_INVENTORY_SCHEMA", None, inventory_top_key_extra),
    ("fixed BASE pin", "E_BASE_PIN", None, base_pin),
    ("output digest", "E_OUTPUT_DIGEST", None, output),
]
for name, code, rows, inv in CASES:
    run_case(name, code, rows, inv)
direct_case("fixed BASE non-ancestor", "E_BASE_NOT_ANCESTOR", non_ancestor)
direct_case("fixed BASE source missing", "E_BASE_SOURCE", missing_base_source)
direct_case("fixed profile set", "E_PROFILE_SET", missing_profile)
direct_case("fixed overlap", "E_OVERLAP", overlapping_prior_set)
print(f"SCF-B-0128 selfcheck: PASS negative_cases={len(CASES) + 4}")
