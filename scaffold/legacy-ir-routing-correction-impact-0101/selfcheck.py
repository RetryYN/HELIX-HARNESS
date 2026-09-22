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


def main() -> int:
    base = load_records()

    duplicate = copy.deepcopy(base)
    duplicate.append(copy.deepcopy(base[0]))
    expects("duplicate_id", duplicate, "E_ID_DUPLICATE")

    missing = copy.deepcopy(base[:-1])
    expects("missing_id", missing, "E_ID_SET")

    correction = copy.deepcopy(base)
    correction[0]["correction_exact"]["correction_rationale"] = "tampered"
    expects("correction_digest_tamper", correction, "E_CORRECTION_DIGEST")

    source = copy.deepcopy(base)
    source[0]["source_exact"]["line"] = 1
    expects("source_anchor_tamper", source, "E_SOURCE_ANCHOR")

    before = copy.deepcopy(base)
    before[0]["before"]["routing"]["candidate_product_targets"].append("HELIX-Web")
    expects("before_candidate_tamper", before, "E_BEFORE_CANDIDATE")

    wave = copy.deepcopy(base)
    wave[0]["wave_semantic_review"]["review_rows"][0]["ref"]["row_sha256"] = "0" * 64
    expects("wave_digest_tamper", wave, "E_WAVE_DIGEST")

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

    if not any(item.startswith("E_BASE_NOT_ANCESTOR:") for item in ancestor_errors("0" * 40)):
        raise AssertionError("base_ancestor_tamper: expected E_BASE_NOT_ANCESTOR")

    print("SCF-B-0103 selfcheck: PASS negative_cases=20")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
