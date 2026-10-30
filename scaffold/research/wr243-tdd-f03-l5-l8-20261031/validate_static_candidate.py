#!/usr/bin/env python3
"""WR243 F03 candidate static checks; no algorithm, runtime, or tests are run."""
from __future__ import annotations
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = "988765e9be335f2a1d376721c1b11f808fd03372"
PKG = "scaffold/research/wr243-tdd-f03-l5-l8-20261031"
BLIND_SHA = "846907d5802170ed775fbf08664c0b85f42e7b6ac0a9623e8584452f81ead813"
L5_PATH = "docs/helix-harness/L5-detail-design/tdd-development-flow.json"
L8_PATH = "docs/helix-harness/L8-unit-verification/tdd-development-flow.json"
L4_PATH = "docs/helix-harness/L4-basic-design/tdd-development-flow.json"
L9_PATH = "docs/helix-harness/L9-integration-verification/tdd-development-flow.json"
L3_PATH = "docs/helix-harness/L3-requirements/functional-requirements.json"
L10_PATH = "docs/helix-harness/L10-verification/functional-verification.json"


def read_json(path: str):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def digest_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def digest_json(value) -> str:
    encoded = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    return digest_bytes(encoded)


def at_pointer(value, pointer: str):
    for part in pointer.strip("/").split("/"):
        part = part.replace("~1", "/").replace("~0", "~")
        value = value[int(part)] if isinstance(value, list) else value[part]
    return value


def base_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{BASE}:{path}"], cwd=ROOT)


def main() -> int:
    checks = {}
    blind_path = ROOT / PKG / "source/wr243-tdd-clean-source-only.json"
    blind_bytes = blind_path.read_bytes()
    blind = json.loads(blind_bytes)
    checks["fixed_artifact_sha256"] = digest_bytes(blind_bytes) == BLIND_SHA
    checks["fixed_artifact_base"] = blind.get("source_revision") == BASE

    l3, l10 = read_json(L3_PATH), read_json(L10_PATH)
    l4, l9 = read_json(L4_PATH), read_json(L9_PATH)
    l5, l8 = read_json(L5_PATH), read_json(L8_PATH)
    comparison = read_json(f"{PKG}/comparison.json")
    correction = read_json(f"{PKG}/correction-r1-f1.json")
    l3row, l10row = l3["requirements"][42], l10["cases"][42]
    checks["L3_F03_pointer_hash"] = l3row.get("id") == "HARNESS-L3-015-F03" and digest_json(l3row) == "b641eb43bd5164ab55101bac10aaa0fbf0fb24a55d4429ad0f013af9594cd6ce"
    checks["L10_F03_pointer_hash"] = l10row.get("id") == "HARNESS-L10-015-F03" and digest_json(l10row) == "c41bc44981b5cdd6abe939405535a44c163d9714374e168dfe589dac4ce7cd7a"
    checks["L4_L9_unchanged_from_base"] = (ROOT / L4_PATH).read_bytes() == base_bytes(L4_PATH) and (ROOT / L9_PATH).read_bytes() == base_bytes(L9_PATH)
    fixed_hashes = {row["path"]: row["sha256"] for row in correction["fixed_evidence"]}
    checks["fixed_comparison_and_summary_unchanged"] = all(digest_bytes((ROOT / path).read_bytes()) == expected for path, expected in fixed_hashes.items())

    l4f, l9f = l4["contracts"][3], l9["cases"][3]
    l8f = next(row for row in l8["cases"] if row["id"] == "HARNESS-L8-015-F03")
    l5f = next(row for row in l5["contracts"] if row["id"] == "HARNESS-L5-015-F03")
    blind_rows = [row for row in blind["independent_negative_cases"] if "-F03-" in row["local_id"]]
    comp_rows = comparison["rows"]
    checks["all_nine_L4_L9_rows_compared"] = len(l4f["negative_classifications"]) == len(l9f["negative_cases"]) == len(comp_rows) == 9
    checks["all_L4_L9_conditions_equal"] = all(a.get("condition") == b.get("condition") for a, b in zip(l4f["negative_classifications"], l9f["negative_cases"]))
    checks["comparison_rows_resolve"] = all(row.get("l4_pointer") == f"/contracts/3/negative_classifications/{i}" and row.get("l9_pointer") == f"/cases/3/negative_cases/{i}" for i, row in enumerate(comp_rows))
    checks["L5_candidate_matches_fixed_conditions"] = [row.get("local_id") for row in l5f["candidate_classification_design"]["conditions"]] == [row["local_id"] for row in blind_rows]
    bilingual = {row["source_only_ref"]: row for row in correction["mappings"]}
    l5_by_id = {row["local_id"]: row for row in l5f["candidate_classification_design"]["conditions"]}
    checks["L5_Japanese_text_matches_correction"] = all(l5_by_id[key]["negative_condition"] == row["negative_condition_ja"] and l5_by_id[key]["expected_observation"] == row["expected_observation_ja"] for key, row in bilingual.items())
    checks["L5_candidate_has_no_classifier_projection"] = all(not ({"code", "expected_axis", "expected_state", "backflow_owner", "algorithm", "fixture"} & set(row)) for row in l5f["candidate_classification_design"]["conditions"])
    checks["L8_candidate_nine_existing_ids_only"] = len(l8f["candidate_unit_design"]["cases"]) == 9 and all(row["existing_unit_case_ref"] in l8f["unit_case_ids"] for row in l8f["candidate_unit_design"]["cases"])
    checks["L8_Japanese_text_matches_L5_and_correction"] = all(row["counterexample"] == bilingual[row["source_only_ref"]]["negative_condition_ja"] and row["candidate_expected_result"] == bilingual[row["source_only_ref"]]["expected_observation_ja"] for row in l8f["candidate_unit_design"]["cases"])
    checks["L8_contract_oracle_row_oracle_separated"] = all(row.get("contract_oracle_id") == "HARNESS-L10-015-F03" and row.get("row_oracle_id") is None and row.get("row_oracle_status") == "missing_not_created" for row in l8f["candidate_unit_design"]["cases"])
    checks["L8_target_is_L5_contract_and_L9_is_trace"] = all(row.get("target_ref") == "HARNESS-L5-015-F03" and row.get("source_trace_ref", "").startswith("docs/helix-harness/L9-integration-verification/tdd-development-flow.json#/cases/3/negative_cases/") for row in l8f["candidate_unit_design"]["cases"])
    checks["L8_no_test_citation_invented"] = all(row.get("test_citation") is None and row.get("test_citation_status") == "not_found_not_created" for row in l8f["candidate_unit_design"]["cases"])
    checks["L8_candidate_has_no_fixture_payload"] = all(not ({"fixture", "seed", "copy", "same_invocation", "full_return", "rfc6902_copy", "test_citation_ref"} & set(row)) for row in l8f["candidate_unit_design"]["cases"])
    checks["L8_candidate_has_no_hash_fields"] = not any("sha256" in key.lower() for key in json.dumps(l8f["candidate_unit_design"]).lower().split()) and "source_pins" not in l8f["candidate_unit_design"] and "fixed_artifact" not in l8f["candidate_unit_design"]
    binding = read_json("scaffold/bindings/SCF-B-0204.json")
    binding_pins = {(row.get("path"), row.get("sha256")) for row in binding.get("upstream", [])}
    blind_oracle = f"Independent digest check: `sha256sum {PKG}/source/wr243-tdd-clean-source-only.json` must report {BLIND_SHA}."
    checks["binding_holds_fixed_and_candidate_L5_sha"] = blind_oracle in binding["verification"]["oracles"] and (L5_PATH, digest_bytes((ROOT / L5_PATH).read_bytes())) in binding_pins
    checks["binding_upstream_excludes_scaffold"] = all(not row["path"].startswith("scaffold/") for row in binding["upstream"])
    checks["correction_candidate_hashes_match"] = correction["candidate_hashes"].get(L5_PATH) == digest_bytes((ROOT / L5_PATH).read_bytes()) and correction["candidate_hashes"].get(L8_PATH) == digest_bytes((ROOT / L8_PATH).read_bytes())
    checks["correction_L5_pin_matches_binding"] = correction["l5_pin"]["current_sha256"] == digest_bytes((ROOT / L5_PATH).read_bytes()) and (L5_PATH, correction["l5_pin"]["current_sha256"]) in binding_pins

    base_l8 = json.loads(base_bytes(L8_PATH))
    base_l8f = next(row for row in base_l8["cases"] if row["id"] == "HARNESS-L8-015-F03")
    checks["canonical_L8_F03_ids_and_unit_cases_unchanged"] = l8f["unit_case_ids"] == base_l8f["unit_case_ids"] and l8["unit_cases"] == base_l8["unit_cases"]
    base_l5 = json.loads(base_bytes(L5_PATH))
    base_l5f = next(row for row in base_l5["contracts"] if row["id"] == "HARNESS-L5-015-F03")
    current_l5_without_candidate = dict(l5f); current_l5_without_candidate.pop("candidate_classification_design", None)
    checks["existing_L5_F03_contract_unchanged"] = current_l5_without_candidate == base_l5f
    base_l5_without_candidate = base_l5
    current_l5_without_candidate_doc = l5
    base_l5_without_candidate = json.loads(json.dumps(base_l5))
    current_l5_without_candidate_doc = json.loads(json.dumps(l5))
    next(row for row in base_l5_without_candidate["contracts"] if row["id"] == "HARNESS-L5-015-F03").pop("candidate_classification_design", None)
    next(row for row in current_l5_without_candidate_doc["contracts"] if row["id"] == "HARNESS-L5-015-F03").pop("candidate_classification_design", None)
    checks["all_other_L5_bytes_structurally_unchanged"] = current_l5_without_candidate_doc == base_l5_without_candidate
    base_l8_without_candidate = json.loads(base_bytes(L8_PATH))
    current_l8_without_candidate = json.loads(json.dumps(l8))
    next(row for row in base_l8_without_candidate["cases"] if row["id"] == "HARNESS-L8-015-F03").pop("candidate_unit_design", None)
    next(row for row in current_l8_without_candidate["cases"] if row["id"] == "HARNESS-L8-015-F03").pop("candidate_unit_design", None)
    checks["all_other_L8_bytes_structurally_unchanged"] = current_l8_without_candidate == base_l8_without_candidate
    checks["L8_candidate_only_field"] = len(l8f["candidate_unit_design"]["cases"]) == 9

    report = {"schema":"wr243-static-candidate-validation.v1","evidence_kind":"scaffold","authority_effect":"none","checks":checks,"passed":all(checks.values()),"not_run":["L4/L5 algorithm","old runtime/test/CI","new runtime/test/CI"]}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["passed"] else 1

if __name__ == "__main__":
    raise SystemExit(main())
