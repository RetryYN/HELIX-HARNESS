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
        "N07-source-span-tamper": "E_SOURCE_SPAN",
        "N08-l1-evidence-tamper": "E_PRODUCT_EVIDENCE",
        "N09-reason-evidence-tamper": "E_REASON_EVIDENCE",
        "N10-formal-authority-promotion": "E_AUTHORITY",
        "N11-phase-status-promotion": "E_PHASE_STATE",
        "N12-upstream-digest-stale": "E_INPUT_DIGEST",
        "N13-output-digest-stale": "E_OUTPUT_DIGEST",
        "N14-scope-membership-evidence-tamper": "E_REASON_EVIDENCE",
        "N15-json-nan": "E_JSON",
        "N16-json-infinity": "E_JSON",
        "N17-json-negative-infinity": "E_JSON",
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
