#!/usr/bin/env python3
"""Execute the exact, ordered negative contract for SCF-B-0144."""
from __future__ import annotations

import copy
import hashlib
import json
import tempfile
from pathlib import Path

from validate import BUNDLE, EXPECTED_NEGATIVE_CASES, CheckError, validate_bundle


def read_rows(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write_rows(path: Path, rows: list[dict]) -> None:
    path.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for row in rows), encoding="utf-8")


def run_case(case_id: str) -> str:
    with tempfile.TemporaryDirectory(prefix="scf-b-0144-") as temp:
        temp_bundle = Path(temp)
        raw_records = (BUNDLE / "classification-reconciliation.jsonl").read_bytes()
        inventory = json.loads((BUNDLE / "inventory.json").read_text(encoding="utf-8"))
        rows = read_rows(BUNDLE / "classification-reconciliation.jsonl")
        if case_id == "N01-json-duplicate-key":
            (temp_bundle / "classification-reconciliation.jsonl").write_text('{"asset_id":"a","asset_id":"b"}\n', encoding="utf-8")
        elif case_id == "N14-scope-membership-evidence-tamper":
            changed = copy.deepcopy(rows)
            changed[0]["target_2078_result"]["method"]["scope"]["scope_membership_evidence"]["main_union_contains_asset_id"] = False
            write_rows(temp_bundle / "classification-reconciliation.jsonl", changed)
        elif case_id == "N15-json-nan":
            (temp_bundle / "classification-reconciliation.jsonl").write_text('{"asset_id":"a","value":NaN}\n', encoding="utf-8")
        elif case_id == "N16-json-infinity":
            (temp_bundle / "classification-reconciliation.jsonl").write_text('{"asset_id":"a","value":Infinity}\n', encoding="utf-8")
        elif case_id == "N17-json-negative-infinity":
            (temp_bundle / "classification-reconciliation.jsonl").write_text('{"asset_id":"a","value":-Infinity}\n', encoding="utf-8")
        else:
            changed = copy.deepcopy(rows)
            if case_id == "N02-target-set-omission":
                changed.pop()
            elif case_id == "N03-target-set-duplicate":
                changed.append(copy.deepcopy(changed[0]))
            elif case_id == "N04-main-result-mutation":
                changed[0]["main_existing_result"]["result"]["category"] = "insufficient_basis"
            elif case_id == "N05-target-result-mutation":
                changed[0]["target_2078_result"]["classification_result"]["candidate_products"] = ["HELIX-OS"]
            elif case_id == "N06-source-sha-alias":
                changed[0]["source_identity"]["source_sha256"] = "sha256:" + "0" * 64
            elif case_id == "N07-source-span-tamper":
                changed[0]["main_existing_result"]["source_spans"][0]["line_start"] += 1
            elif case_id == "N08-l1-evidence-tamper":
                changed[0]["main_existing_result"]["l1_evidence"].pop("HELIX-OS")
            elif case_id == "N09-reason-evidence-tamper":
                changed[0]["difference_reason_candidates"][0]["evidence_refs"] = []
            elif case_id == "N10-formal-authority-promotion":
                changed[0]["new_build_allowed"] = True
            elif case_id == "N11-phase-status-promotion":
                changed[0]["target_2078_result"]["phase_implementation_context"]["phase"]["product_classification_status"] = "reviewed_candidate"
            elif case_id == "N12-upstream-digest-stale":
                inventory["input_digests"][0]["sha256"] = "sha256:" + "0" * 64
            elif case_id == "N13-output-digest-stale":
                inventory["outputs"]["records_sha256"] = "sha256:" + "0" * 64
            elif case_id == "N18-nested-authority-promotion":
                changed[0]["target_2078_result"]["new_build_allowed"] = True
            elif case_id == "N19-main-review-unbound":
                changed[0]["main_existing_result"].pop("manual_semantic_review")
            elif case_id == "N20-source-provenance-forgery":
                changed[0]["source_identity"]["archive_provenance"]["execution_performed"] = True
            elif case_id == "N21-inventory-id-and-pin-forgery":
                inventory["exact_target_asset_ids"][0] = "FAKE"
            elif case_id == "N22-reason-wording-drift":
                changed[0]["difference_reason_candidates"][0]["basis"] = "x"
            elif case_id == "N23-strict-json-types":
                category_counts = inventory["category_counts_main_existing"]
                first = next(iter(category_counts))
                category_counts[first] = float(category_counts[first])
            elif case_id == "N24-inventory-policy-drift":
                inventory["target_head_follow_policy"] += " Automatically follow new HEADs."
            elif case_id == "N25-repin-stability-drift":
                inventory["repin_stability_from_previous_head"]["changed_overlap_row_count"] = 1
            elif case_id == "N26-main-union-drift":
                inventory["current_main_union"]["current_main_union_count"] = 495
            elif case_id == "N27-main-rebaseline-drift":
                inventory["main_rebaseline"]["unchanged_fixed_input_count"] = 19
            elif case_id == "N28-binding-drift":
                inventory["binding_upstream_digests"][0]["sha256"] = "0" * 64
            elif case_id == "N29-negative-case-contract-drift":
                inventory["negative_cases"].pop()
            elif case_id == "N30-malformed-container-fails-closed":
                changed[0]["resolution"] = None
            elif case_id == "N31-nested-unknown-key":
                changed[0]["target_2078_result"]["method"]["unknown_authority"] = "approved"
            else:
                raise AssertionError(f"unexpected negative case {case_id}")
            write_rows(temp_bundle / "classification-reconciliation.jsonl", changed)
        if case_id not in {"N01-json-duplicate-key", "N15-json-nan", "N16-json-infinity", "N17-json-negative-infinity"}:
            unsigned = {key: value for key, value in inventory.items() if key != "inventory_sha256"}
            canonical = json.dumps(unsigned, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
            inventory["inventory_sha256"] = "sha256:" + hashlib.sha256(canonical).hexdigest()
            (temp_bundle / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n", encoding="utf-8")
        try:
            validate_bundle(temp_bundle)
        except CheckError as exc:
            return str(exc).split(" ", 1)[0]
        raise AssertionError(f"negative case accepted: {case_id}; input_bytes={len(raw_records)}")


def main() -> None:
    inventory = json.loads((BUNDLE / "inventory.json").read_text(encoding="utf-8"))
    if inventory.get("negative_cases") != EXPECTED_NEGATIVE_CASES:
        raise SystemExit("SCF-B-0144 selfcheck FAIL ordered negative case contract drift")
    expected_codes = {
        "N01-json-duplicate-key": "E_JSON",
        "N02-target-set-omission": "E_TARGET_SET",
        "N03-target-set-duplicate": "E_TARGET_SET",
        "N04-main-result-mutation": "E_MAIN_RESULT",
        "N05-target-result-mutation": "E_TARGET_RESULT",
        "N06-source-sha-alias": "E_SOURCE_IDENTITY",
        "N07-source-span-tamper": "E_MAIN_RESULT",
        "N08-l1-evidence-tamper": "E_MAIN_RESULT",
        "N09-reason-evidence-tamper": "E_REASON_EVIDENCE",
        "N10-formal-authority-promotion": "E_AUTHORITY",
        "N11-phase-status-promotion": "E_PHASE_STATE",
        "N12-upstream-digest-stale": "E_INPUT_DIGEST",
        "N13-output-digest-stale": "E_OUTPUT_DIGEST",
        "N14-scope-membership-evidence-tamper": "E_TARGET_RESULT",
        "N15-json-nan": "E_JSON",
        "N16-json-infinity": "E_JSON",
        "N17-json-negative-infinity": "E_JSON",
        "N18-nested-authority-promotion": "E_AUTHORITY",
        "N19-main-review-unbound": "E_MAIN_RESULT",
        "N20-source-provenance-forgery": "E_SOURCE_IDENTITY",
        "N21-inventory-id-and-pin-forgery": "E_INVENTORY_PIN",
        "N22-reason-wording-drift": "E_REASON_EVIDENCE",
        "N23-strict-json-types": "E_INVENTORY_PIN",
        "N24-inventory-policy-drift": "E_INVENTORY_PIN",
        "N25-repin-stability-drift": "E_REPIN_STABILITY",
        "N26-main-union-drift": "E_MAIN_UNION",
        "N27-main-rebaseline-drift": "E_MAIN_REBASELINE",
        "N28-binding-drift": "E_BINDING",
        "N29-negative-case-contract-drift": "E_NEGATIVE_CASES",
        "N30-malformed-container-fails-closed": "E_AUTHORITY",
        "N31-nested-unknown-key": "E_TARGET_RESULT",
    }
    executed = []
    codes = []
    for case_id in EXPECTED_NEGATIVE_CASES:
        code = run_case(case_id)
        if code != expected_codes[case_id]:
            raise SystemExit(f"SCF-B-0144 selfcheck FAIL {case_id}: expected={expected_codes[case_id]} actual={code}")
        executed.append(case_id)
        codes.append(code)
    if executed != inventory["negative_cases"]:
        raise SystemExit("SCF-B-0144 selfcheck FAIL exact executed set mismatch")
    print(f"SCF-B-0144 selfcheck PASS negative_cases={len(executed)} exact_order=true codes={len(set(codes))}")


if __name__ == "__main__":
    main()
