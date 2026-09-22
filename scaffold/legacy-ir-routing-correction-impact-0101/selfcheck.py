#!/usr/bin/env python3
"""SCF-B-0103の負例。各変異が狙ったguardで拒否されることを確認する。"""
from __future__ import annotations

import copy
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from validate import ancestor_errors, validate_inventory, validate_records  # noqa: E402


def load_records():
    return [json.loads(line) for line in (HERE / "impact.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]


def expects(name, records, code):
    errors = validate_records(records)
    if not any(item.startswith(code + ":") for item in errors):
        raise AssertionError(f"{name}: expected {code}, got {errors[:5]}")


def expects_inventory(name, inventory, code):
    errors = validate_inventory(inventory, check_ancestor=False)
    if not any(item.startswith(code + ":") for item in errors):
        raise AssertionError(f"{name}: expected {code}, got {errors[:5]}")


def main() -> int:
    base = load_records()

    duplicate = copy.deepcopy(base)
    duplicate.append(copy.deepcopy(base[0]))
    expects("duplicate_id", duplicate, "E_ID_DUPLICATE")
    expects("record_count_guard", duplicate, "E_ID_COUNT")

    missing = copy.deepcopy(base[:-1])
    expects("missing_id", missing, "E_ID_SET")

    correction = copy.deepcopy(base)
    correction[0]["correction_exact"]["correction_rationale"] = "tampered"
    expects("correction_digest_tamper", correction, "E_CORRECTION_DIGEST")

    source = copy.deepcopy(base)
    source[0]["source_exact"]["line"] = 1
    expects("source_anchor_tamper", source, "E_SOURCE_ANCHOR")

    source_digest = copy.deepcopy(base)
    source_digest[0]["source_exact"]["source_file_sha256"] = "0" * 64
    expects("source_digest_tamper", source_digest, "E_SOURCE_DIGEST")

    before = copy.deepcopy(base)
    before[0]["before"]["routing"]["candidate_product_targets"].append("HELIX-Web")
    expects("before_candidate_tamper", before, "E_BEFORE_CANDIDATE")

    routing_ref = copy.deepcopy(base)
    routing_ref[0]["before"]["routing"]["ref"]["line"] = 999
    expects("routing_reference_guard", routing_ref, "E_ROUTING_REFERENCE")

    unit_impact = copy.deepcopy(base)
    unit_impact[0]["before"]["decomposition"]["unit_set"] = []
    expects("unit_impact_guard", unit_impact, "E_UNIT_IMPACT")

    wave = copy.deepcopy(base)
    wave[0]["wave_semantic_review"]["review_rows"][0]["ref"]["row_sha256"] = "0" * 64
    expects("wave_digest_tamper", wave, "E_WAVE_DIGEST")

    wave_method = copy.deepcopy(base)
    wave_method[0]["wave_semantic_review"]["method_premise_refs"] = []
    expects("wave_method_reference_guard", wave_method, "E_WAVE_METHOD_REFERENCE")

    boundary = copy.deepcopy(base)
    boundary[0]["product_boundary"]["refs"][0]["blob"] = "0" * 40
    expects("boundary_reference_tamper", boundary, "E_BOUNDARY_REFERENCE")

    l1 = copy.deepcopy(base)
    l1[0]["l1_evidence"][0]["line_text_sha256"] = "0" * 64
    expects("l1_reference_tamper", l1, "E_L1_REFERENCE")

    impact = copy.deepcopy(base)
    impact[0]["after_proposal"]["unit_impact"]["projected_unit_count"] = 999
    expects("impact_count_tamper", impact, "E_IMPACT_COUNT")

    authority = copy.deepcopy(base)
    authority[0]["after_proposal"]["applied"] = True
    expects("authority_promotion", authority, "E_AUTHORITY_BOUNDARY")

    asset = copy.deepcopy(base)
    asset[0]["legacy_asset_evidence"]["candidate_assets"][0]["source_sha256"] = "0" * 64
    expects("asset_digest_tamper", asset, "E_ASSET")

    asset_set = copy.deepcopy(base)
    asset_set[0]["legacy_asset_evidence"]["candidate_assets"] = []
    expects("asset_set_tamper", asset_set, "E_ASSET_SET")

    human = copy.deepcopy(base)
    human[0]["human_judgment_remaining"] = []
    expects("human_judgment_tamper", human, "E_HUMAN_JUDGMENT")

    successor = copy.deepcopy(base)
    successor[0]["after_proposal"]["successor_impact"]["projected_successor_ids"] = ["SUCCESSOR-TAMPER"]
    expects("successor_promotion", successor, "E_SUCCESSOR")

    after = copy.deepcopy(base)
    after[0]["after_proposal"]["routing_candidate"] = "tampered"
    expects("after_proposal_guard", after, "E_AFTER_PROPOSAL")

    consumer_impact = copy.deepcopy(base)
    consumer_impact[0]["after_proposal"]["consumer_impact"]["before_unit_consumer_closure_status"] = "closed"
    expects("consumer_impact_guard", consumer_impact, "E_CONSUMER_IMPACT")

    successor_impact = copy.deepcopy(base)
    successor_impact[0]["after_proposal"]["successor_impact"]["before_successor_assignment_status"] = "assigned"
    expects("successor_impact_guard", successor_impact, "E_SUCCESSOR")

    projected_unit = copy.deepcopy(base)
    projected_unit[0]["after_proposal"]["projected_added_unit"]["phase_status"] = "approved"
    expects("projected_unit_guard", projected_unit, "E_AFTER_PROPOSAL")

    impact_interpretation = copy.deepcopy(base)
    impact_interpretation[0]["after_proposal"]["consumer_impact"]["human_action"] = "tampered"
    expects("impact_interpretation_guard", impact_interpretation, "E_IMPACT_INTERPRETATION")

    asset_ref = copy.deepcopy(base)
    asset_ref[0]["legacy_asset_evidence"]["candidate_assets"][0]["ledger_ref"]["line"] = 999
    expects("asset_reference_guard", asset_ref, "E_ASSET_REFERENCE")

    asset_state = copy.deepcopy(base)
    asset_state[0]["legacy_asset_evidence"]["candidate_assets"][0]["legacy_implementation_status"] = "implemented"
    expects("asset_state_guard", asset_state, "E_ASSET_STATE")

    boundary_interpretation = copy.deepcopy(base)
    boundary_interpretation[0]["product_boundary"]["interpretation"] = "tampered"
    expects("boundary_interpretation_guard", boundary_interpretation, "E_BOUNDARY_INTERPRETATION")

    correction_ref = copy.deepcopy(base)
    correction_ref[0]["correction_exact"]["ref"]["line"] = 999
    expects("correction_reference_guard", correction_ref, "E_CORRECTION_REFERENCE")

    crosswalk_ref = copy.deepcopy(base)
    crosswalk_ref[0]["before"]["decomposition"]["unit_set"][0]["crosswalk_ref"]["line"] = 999
    expects("crosswalk_reference_guard", crosswalk_ref, "E_CROSSWALK_REFERENCE")

    crosswalk_state = copy.deepcopy(base)
    crosswalk_state[0]["before"]["decomposition"]["unit_set"][0]["crosswalk_status"]["new_build_allowed"] = True
    expects("crosswalk_state_guard", crosswalk_state, "E_CROSSWALK_STATE")

    decomp_ref = copy.deepcopy(base)
    decomp_ref[0]["before"]["decomposition"]["ref"]["line"] = 999
    expects("decomp_reference_guard", decomp_ref, "E_DECOMP_REFERENCE")

    failure_ref = copy.deepcopy(base)
    failure_ref[0]["legacy_asset_evidence"]["source_history_failure_consumer_refs"][0]["line"] = 999
    expects("failure_consumer_reference_guard", failure_ref, "E_FAILURE_CONSUMER_REFERENCE")

    history_ref = copy.deepcopy(base)
    history_ref[0]["legacy_asset_evidence"]["candidate_assets"][0]["history"]["decision_refs"].append({"path": "tampered"})
    expects("history_reference_guard", history_ref, "E_HISTORY_REFERENCE")

    history_state = copy.deepcopy(base)
    history_state[0]["legacy_asset_evidence"]["candidate_assets"][0]["history"]["closure_status"] = "closed"
    expects("history_state_guard", history_state, "E_HISTORY_STATE")

    source_missing = copy.deepcopy(base)
    source_missing[0]["source_exact"]["path"] = "docs/FABRICATED.json"
    expects("source_missing_guard", source_missing, "E_SOURCE_MISSING")

    wave_asset = copy.deepcopy(base)
    wave_asset[0]["wave_semantic_review"]["review_rows"][0]["asset_id"] = "LEGACY-ASSET-FABRICATED"
    expects("wave_asset_guard", wave_asset, "E_WAVE_ASSET")

    inventory = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
    inventory["input_digests"][0]["sha256"] = "0" * 64
    if not any(item.startswith("E_INPUT_DIGEST:") for item in validate_inventory(inventory, check_ancestor=False)):
        raise AssertionError("input_digest_tamper: expected E_INPUT_DIGEST")

    input_missing = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
    input_missing["input_digests"].pop()
    if not any(item.startswith("E_INPUT_SET:") for item in validate_inventory(input_missing, check_ancestor=False)):
        raise AssertionError("input_set_missing: expected E_INPUT_SET")

    input_duplicate = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
    input_duplicate["input_digests"].append(copy.deepcopy(input_duplicate["input_digests"][-1]))
    if not any(item.startswith("E_INPUT_SET:") for item in validate_inventory(input_duplicate, check_ancestor=False)):
        raise AssertionError("input_set_duplicate: expected E_INPUT_SET")

    input_extra = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
    input_extra["input_digests"].append({"path": "docs/governance/new-generation-start-here.md", "blob": "0" * 40, "sha256": "0" * 64})
    if not any(item.startswith("E_INPUT_SET:") for item in validate_inventory(input_extra, check_ancestor=False)):
        raise AssertionError("input_set_extra: expected E_INPUT_SET")

    input_blob = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
    input_blob["input_digests"][0]["blob"] = "0" * 40
    expects_inventory("input_blob_guard", input_blob, "E_INPUT_BLOB")

    base_head = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
    base_head["base_head"] = "0" * 40
    expects_inventory("base_head_guard", base_head, "E_BASE_HEAD")

    source_provenance = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
    source_provenance["source_snapshot"]["working_tree_used_for_source_digest"] = True
    expects_inventory("source_provenance_guard", source_provenance, "E_SOURCE_PROVENANCE")

    current_counts = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
    current_counts["current_decomposition"]["unit_count"] = 999
    expects_inventory("current_counts_guard", current_counts, "E_CURRENT_COUNTS")

    inventory_decl = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
    inventory_decl["schema_revision"] = 999
    expects_inventory("inventory_guard", inventory_decl, "E_INVENTORY")

    legacy_execution = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
    legacy_execution["legacy_execution_performed"] = True
    expects_inventory("legacy_execution_guard", legacy_execution, "E_LEGACY_EXECUTION")

    inventory_authority = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
    inventory_authority["authority_effect"] = "approved"
    expects_inventory("inventory_authority_guard", inventory_authority, "E_AUTHORITY_BOUNDARY")

    if not any(item.startswith("E_BASE_NOT_ANCESTOR:") for item in ancestor_errors("0" * 40)):
        raise AssertionError("base_ancestor_tamper: expected E_BASE_NOT_ANCESTOR")

    print("SCF-B-0103 selfcheck: PASS negative_cases=48")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
