#!/usr/bin/env python3
"""SCF-B-0100 validatorの負例。各変異が狙ったguardで拒否されることを確認する。"""
from __future__ import annotations

import copy
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from validate import base_ancestor_errors, validate_inventory, validate_records  # noqa: E402


def load():
    return [json.loads(line) for line in (HERE / "research.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]


def expects(name, records, code):
    errors = validate_records(records)
    if not any(item.startswith(code + ":") for item in errors):
        raise AssertionError(f"{name}: expected {code}, got {errors[:3]}")


def main():
    base = load()

    duplicate = copy.deepcopy(base)
    duplicate.append(copy.deepcopy(base[0]))
    expects("duplicate_id", duplicate, "E_ID_DUPLICATE")

    missing = copy.deepcopy(base[:-1])
    expects("missing_id", missing, "E_ID_SET")

    digest = copy.deepcopy(base)
    digest[0]["source_exact"]["statement_semantic_digest"] = "sha256:tampered"
    expects("source_statement_digest_tamper", digest, "E_SOURCE_DIGEST")

    source_ref = copy.deepcopy(base)
    source_ref[0]["source_exact"]["line"] = 2
    expects("source_exact_reference_tamper", source_ref, "E_SOURCE_LINE_ANCHOR")

    source_line_digest = copy.deepcopy(base)
    source_line_digest[0]["source_exact"]["line_text_sha256"] = "0" * 64
    expects("source_line_digest_tamper", source_line_digest, "E_SOURCE_LINE_DIGEST")

    queue_status = copy.deepcopy(base)
    queue_status[0]["queue_status"]["target_resolution_status"] = "resolved_target"
    expects("queue_status_tamper", queue_status, "E_QUEUE_STATE")

    boundary_blob = copy.deepcopy(base)
    boundary_blob[0]["product_boundary"]["boundary_refs"][0]["blob"] = "0" * 40
    expects("boundary_blob_tamper", boundary_blob, "E_BOUNDARY_BLOB")

    boundary_interpretation = copy.deepcopy(base)
    boundary_interpretation[0]["product_boundary"]["interpretation"] = "tampered"
    expects("boundary_interpretation_tamper", boundary_interpretation, "E_BOUNDARY_INTERPRETATION")

    target = copy.deepcopy(base)
    target[0]["decomposition_candidate"]["candidate_product_targets"].append("HELIX-Web")
    expects("candidate_product_boundary_tamper", target, "E_CANDIDATE_BOUNDARY")

    authority = copy.deepcopy(base)
    authority[0]["authority_effect"] = "approved"
    expects("authority_promotion", authority, "E_AUTHORITY_BOUNDARY")

    asset = copy.deepcopy(base)
    changed = False
    for unit in asset[0]["decomposition_candidate"]["candidate_units"]:
        if unit["candidate_legacy_assets"]:
            unit["candidate_legacy_assets"][0]["source_sha256"] = "0" * 64
            changed = True
            break
    if not changed:
        raise AssertionError("asset_digest_tamper: fixture unexpectedly has no asset")
    expects("legacy_asset_digest_tamper", asset, "E_ASSET_LEDGER_DIGEST")

    execution = copy.deepcopy(base)
    execution[0]["legacy_execution_performed"] = True
    expects("legacy_execution_promotion", execution, "E_LEGACY_EXECUTION")

    if not any(item.startswith("E_BASE_NOT_ANCESTOR:") for item in base_ancestor_errors("0" * 40)):
        raise AssertionError("base_ancestor_tamper: expected E_BASE_NOT_ANCESTOR")

    inventory = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
    inventory["input_digests"][0]["sha256"] = "0" * 64
    if not any(item.startswith("E_INPUT_DIGEST:") for item in validate_inventory(inventory, check_ancestor=False)):
        raise AssertionError("base_object_digest_tamper: expected E_INPUT_DIGEST")

    print("SCF-B-0100 selfcheck: PASS negative_cases=15")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
