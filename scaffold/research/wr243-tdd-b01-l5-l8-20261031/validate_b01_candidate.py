#!/usr/bin/env python3
"""Static, source-only checks for WR243 B01 L5/L8 candidate annotations."""
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = "988765e9be335f2a1d376721c1b11f808fd03372"
MAIN = "e0438a372065626ea752c31dc6c86b92d3198a9d"
WR249_BASE = "e9cca9f1d3d88b1c2049c3a3e492b36b2c2ec905"
BLIND = "scaffold/research/wr243-tdd-f03-l5-l8-20261031/source/wr243-tdd-clean-source-only.json"
BLIND_SHA = "846907d5802170ed775fbf08664c0b85f42e7b6ac0a9623e8584452f81ead813"
L5 = "docs/helix-harness/L5-detail-design/tdd-development-flow.json"
L8 = "docs/helix-harness/L8-unit-verification/tdd-development-flow.json"
L4 = "docs/helix-harness/L4-basic-design/tdd-development-flow.json"
L9 = "docs/helix-harness/L9-integration-verification/tdd-development-flow.json"
PKG = "scaffold/research/wr243-tdd-b01-l5-l8-20261031"


def read_json(path):
    return json.loads((ROOT / path).read_text())


def sha(data):
    return hashlib.sha256(data).hexdigest()


def canonical(value):
    raw = json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode()
    return sha(raw)


def git_json(rev, path):
    raw = subprocess.check_output(["git", "show", f"{rev}:{path}"], cwd=ROOT)
    return json.loads(raw)


def strip_b01_candidate(doc, collection, candidate_key, record_id):
    record = next(x for x in doc[collection] if x.get("id") == record_id)
    record.pop(candidate_key, None)
    return doc


def main():
    checks = {}
    blind_bytes = (ROOT / BLIND).read_bytes()
    blind = json.loads(blind_bytes)
    checks["fixed_blind_exact_sha_and_revision"] = sha(blind_bytes) == BLIND_SHA and blind.get("source_revision") == BASE
    b01 = [x for x in blind["independent_negative_cases"] if "-B01-" in x["local_id"]]
    checks["fixed_B01_source_only_ids"] = [x["local_id"] for x in b01] == ["WR243-SO-B01-01", "WR243-SO-B01-02"]

    l3 = read_json("docs/helix-harness/L3-requirements/business-requirements.json")["requirements"][7]
    l10 = read_json("docs/helix-harness/L10-verification/business-verification.json")["cases"][7]
    checks["L3_B01_fixed_record_hash"] = canonical(l3) == "9fff23f4d422ea65245f21dd2e7ac8276977c2216926dc27b2fe1b142ecf8d43"
    checks["L10_B01_fixed_record_hash"] = canonical(l10) == "f725d5f140291596015f190f18eb8a6579787c4cdba387402632c72a250b94b1"

    l5 = read_json(L5)
    l8 = read_json(L8)
    l4 = read_json(L4)
    l9 = read_json(L9)
    l5c = next(x for x in l5["contracts"] if x["id"] == "HARNESS-L5-015-B01")
    l8c = next(x for x in l8["cases"] if x["id"] == "HARNESS-L8-015-B01")
    c5 = l5c.get("candidate_classification_design", {})
    c8 = l8c.get("candidate_unit_design", {})
    checks["L5_candidate_status_and_fixed_blind"] = c5.get("status") == "scaffold_candidate_only_not_approved_or_executed" and c5.get("fixed_artifact", {}).get("sha256") == BLIND_SHA
    conditions = c5.get("conditions", [])
    checks["L5_two_source_only_conditions"] = [x.get("local_id") for x in conditions] == ["WR243-SO-B01-01", "WR243-SO-B01-02"] and all(x.get("status") == "source-derived candidate; not executed" for x in conditions)
    checks["L5_no_classifier_projections"] = all(not any(k in x for k in ("failure_code", "expected_axis", "expected_state", "backflow_owner")) for x in conditions)

    l4root = next(x for x in l4["contracts"] if x["id"] == "HARNESS-L4-015-B01")
    l9root = next(x for x in l9["cases"] if x["id"] == "HARNESS-L9-015-B01")
    rows = read_json(f"{PKG}/comparison.json")["rows"]
    checks["comparison_all_four_L4_L9_rows"] = len(rows) == 4 and len(l4root["negative_classifications"]) == len(l9root["negative_cases"]) == 4
    checks["comparison_conditions_equal"] = all(x["conditions_equal"] and x["l4_condition"] == x["l9_condition"] for x in rows)
    checks["comparison_projection_comparison_only"] = all("comparison_only" in k for row in rows for k in row if k.endswith("projection_comparison_only"))
    expected_refs = {
        "HARNESS-L9-015-B01-os_only": "WR243-SO-B01-01",
        "HARNESS-L9-015-B01-cheap_quality_failure": "WR243-SO-B01-01",
        "HARNESS-L9-015-B01-omission_erased": "WR243-SO-B01-02",
        "HARNESS-L9-015-B01-metric_as_accepted": "WR243-SO-B01-02",
    }
    cases = c8.get("cases", [])
    checks["L8_four_existing_rows_and_source_mapping"] = len(cases) == 4 and {x.get("existing_unit_case_ref"): x.get("source_only_ref") for x in cases} == expected_refs
    checks["L8_target_contract_separate_from_L9_trace"] = all(x.get("target_ref") == "HARNESS-L5-015-B01" and x.get("source_trace_ref", "").startswith(L9 + "#") for x in cases)
    checks["L8_contract_oracle_and_missing_row_oracles"] = all(x.get("contract_oracle_id") == "HARNESS-L10-015-B01" and x.get("row_oracle_id") is None and x.get("row_oracle_status") == "missing_not_created" for x in cases)
    checks["L8_missing_test_citations"] = all(x.get("test_citation") is None and x.get("test_citation_status") == "not_found_not_created" for x in cases)
    checks["L8_no_hash_fixture_seed_copy_or_full_return"] = not any(k in c8 for k in ("sha256", "hash", "fixture", "seed", "copy", "full_return", "return_material"))

    base_l8 = git_json(MAIN, L8)
    current_l8 = json.loads((ROOT / L8).read_text())
    base_case = next(x for x in base_l8["cases"] if x["id"] == "HARNESS-L8-015-B01")
    current_case = next(x for x in current_l8["cases"] if x["id"] == "HARNESS-L8-015-B01")
    checks["canonical_B01_unit_case_ids_unchanged"] = current_case.get("unit_case_ids") == base_case.get("unit_case_ids")
    checks["canonical_B01_unit_cases_unchanged"] = current_l8.get("unit_cases") == base_l8.get("unit_cases")
    correction = read_json("scaffold/research/wr249-tdd-f03-f04-uid-split-20261031/uid-split-correction.json")
    for layer, path, collection, candidate_key in (
        ("L5", L5, "contracts", "candidate_classification_design"),
        ("L8", L8, "cases", "candidate_unit_design"),
    ):
        historical = git_json(WR249_BASE, path)
        predecessor = git_json(MAIN, path)
        b01_id = f"HARNESS-{layer}-015-B01"
        checks[f"historical_{layer}_F03_F04_preserved_after_B01"] = strip_b01_candidate(historical, collection, candidate_key, b01_id) == predecessor
        current = read_json(path)
        prior = git_json(WR249_BASE, path)
        for suffix in ("F03", "F04"):
            record_id = f"HARNESS-{layer}-015-{suffix}"
            next(x for x in current[collection] if x.get("id") == record_id).pop(candidate_key, None)
            next(x for x in prior[collection] if x.get("id") == record_id).pop(candidate_key, None)
        checks[f"current_{layer}_only_F03_F04_candidate_changes"] = current == prior
        checks[f"current_{layer}_matches_WR249_correction_hash"] = sha((ROOT / path).read_bytes()) == correction["corrected_candidate"][f"{layer.lower()}_sha256"]
        checks[f"historical_{layer}_matches_WR249_snapshot_hash"] = sha(subprocess.check_output(["git", "show", f"{WR249_BASE}:{path}"], cwd=ROOT)) == correction["prior_candidate_snapshot"][f"{layer.lower()}_sha256"]
    checks["L4_L9_exact_bytes_unchanged"] = all(sha((ROOT / p).read_bytes()) == sha(subprocess.check_output(["git", "show", f"{MAIN}:{p}"], cwd=ROOT)) for p in (L4, L9))
    binding = read_json("scaffold/bindings/SCF-B-0210.json")
    checks["binding_id_and_no_scaffold_upstream"] = binding.get("id") == "SCF-B-0210" and all(not x.get("path", "").startswith("scaffold/") for x in binding.get("upstream", []))
    checks["binding_upstream_sha_matches"] = all(sha((ROOT / x["path"]).read_bytes()) == x["sha256"] for x in binding.get("upstream", []))
    result = {"checks": checks, "passed": sum(checks.values()), "total": len(checks), "all_pass": all(checks.values())}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(0 if result["all_pass"] else 1)


if __name__ == "__main__":
    main()
