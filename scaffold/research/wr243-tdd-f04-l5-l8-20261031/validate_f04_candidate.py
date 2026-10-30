#!/usr/bin/env python3
"""WR243 F04 static candidate checks; no algorithm, runtime, or tests are run."""
from __future__ import annotations
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = "988765e9be335f2a1d376721c1b11f808fd03372"
MAIN_BASE = "cf31240384980220249a4f58abe62ce57d47a880"
F04_MERGE_REVISION = "e0438a372065626ea752c31dc6c86b92d3198a9d"
WR249_BASE = "e9cca9f1d3d88b1c2049c3a3e492b36b2c2ec905"
PKG = "scaffold/research/wr243-tdd-f04-l5-l8-20261031"
F03_PKG = "scaffold/research/wr243-tdd-f03-l5-l8-20261031"
B01_PKG = "scaffold/research/wr243-tdd-b01-l5-l8-20261031"
BLIND = f"{F03_PKG}/source/wr243-tdd-clean-source-only.json"
BLIND_SHA = "846907d5802170ed775fbf08664c0b85f42e7b6ac0a9623e8584452f81ead813"
L3 = "docs/helix-harness/L3-requirements/functional-requirements.json"
L10 = "docs/helix-harness/L10-verification/functional-verification.json"
L4 = "docs/helix-harness/L4-basic-design/tdd-development-flow.json"
L9 = "docs/helix-harness/L9-integration-verification/tdd-development-flow.json"
L5 = "docs/helix-harness/L5-detail-design/tdd-development-flow.json"
L8 = "docs/helix-harness/L8-unit-verification/tdd-development-flow.json"


def read_json(path: str):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def sha_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha_json(value) -> str:
    return sha_bytes(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())


def git_bytes(rev: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{rev}:{path}"], cwd=ROOT)


def git_blob_oid(rev: str, path: str) -> str:
    entry = subprocess.check_output(["git", "ls-tree", rev, "--", path], cwd=ROOT, text=True).strip()
    return entry.split()[2]


def project(doc, key, row_id):
    return next(row for row in doc[key] if row.get("id") == row_id)


def remove_candidate(doc, collection, row_id, field):
    doc = json.loads(json.dumps(doc))
    project(doc, collection, row_id).pop(field, None)
    return doc


def main() -> int:
    checks = {}
    blind_bytes = (ROOT / BLIND).read_bytes()
    blind = json.loads(blind_bytes)
    checks["fixed_blind_sha_and_revision"] = sha_bytes(blind_bytes) == BLIND_SHA and blind.get("source_revision") == BASE
    f04_blind = {row["local_id"]: row for row in blind["independent_negative_cases"] if "-F04-" in row["local_id"]}
    checks["fixed_F04_ids"] = list(f04_blind) == ["WR243-SO-F04-01", "WR243-SO-F04-02"]

    l3, l10, l4, l9, l5, l8 = (read_json(path) for path in (L3, L10, L4, L9, L5, L8))
    l3f = project(l3, "requirements", "HARNESS-L3-015-F04")
    l10f = project(l10, "cases", "HARNESS-L10-015-F04")
    l4f = project(l4, "contracts", "HARNESS-L4-015-F04")
    l9f = project(l9, "cases", "HARNESS-L9-015-F04")
    l5f = project(l5, "contracts", "HARNESS-L5-015-F04")
    l8f = project(l8, "cases", "HARNESS-L8-015-F04")
    checks["L3_F04_pointer_hash"] = l3["requirements"].index(l3f) == 43 and sha_json(l3f) == "5a32b65268770bc0f6dd8fdfc592533ff939363d7b7b41547d692fe916bf846f"
    checks["L10_F04_pointer_hash"] = l10["cases"].index(l10f) == 43 and sha_json(l10f) == "868127e5b2bd65ff6f133539ae2e582d5f7864b2ff2bea02dc4cd07de6f475a5"
    checks["L4_L9_bytes_unchanged_from_fixed_base"] = (ROOT / L4).read_bytes() == git_bytes(BASE, L4) and (ROOT / L9).read_bytes() == git_bytes(BASE, L9)

    cmp = read_json(f"{PKG}/comparison.json")
    trans = read_json(f"{PKG}/bilingual-mapping.json")
    condition_map = {row["source_only_ref"]: row for row in trans["mappings"]}
    old_l5 = json.loads(git_bytes(F04_MERGE_REVISION, L5))
    old_l8 = json.loads(git_bytes(F04_MERGE_REVISION, L8))
    old_l5_rows = project(old_l5, "contracts", "HARNESS-L5-015-F04")["candidate_classification_design"]["conditions"]
    old_l8_rows = project(old_l8, "cases", "HARNESS-L8-015-F04")["candidate_unit_design"]["cases"]
    checks["historical_L5_matches_fixed_blind_mapping"] = [row["local_id"] for row in old_l5_rows] == list(f04_blind) and all(row["negative_condition"] == condition_map[row["local_id"]]["negative_condition_ja"] and row["expected_observation"] == condition_map[row["local_id"]]["expected_observation_ja"] for row in old_l5_rows)
    checks["historical_L8_matches_fixed_blind_mapping"] = all(row["counterexample"] == condition_map[row["source_only_ref"]]["l8_counterexample_ja"] and row["candidate_expected_result"] == condition_map[row["source_only_ref"]]["l8_expected_result_ja"] for row in old_l8_rows)
    l4rows, l9rows = l4f["negative_classifications"], l9f["negative_cases"]
    l8_ids = l8f["unit_case_ids"][1:]
    checks["all_five_L4_L9_rows_compared"] = len(l4rows) == len(l9rows) == len(cmp["rows"]) == len(l8_ids) == 5
    checks["all_L4_L9_condition_strings_equal"] = all(a.get("condition") == b.get("condition") for a, b in zip(l4rows, l9rows))
    checks["comparison_rows_resolve"] = all(row.get("l4_pointer") == f"/contracts/4/negative_classifications/{i}" and row.get("l9_pointer") == f"/cases/4/negative_cases/{i}" and row.get("existing_unit_case_ref") == l8_ids[i] and row.get("l4_l9_condition_text_equal") is True for i, row in enumerate(cmp["rows"]))
    checks["comparison_preserves_existing_projection_only"] = all(cmp["rows"][i]["l4_existing_projection_for_comparison_only"] == {k: l4rows[i].get(k) for k in ("expected_axis", "expected_state", "backflow_owner", "expected_side_effect_count")} and cmp["rows"][i]["l9_existing_projection_for_comparison_only"] == {k: l9rows[i].get(k) for k in ("expected_axis", "expected_state", "backflow_owner", "expected_side_effect_count")} for i in range(5))
    checks["comparison_F04_many_to_one_map"] = [r["blind_source_only_ref"] for r in cmp["rows"]] == ["WR243-SO-F04-01"] * 2 + ["WR243-SO-F04-02"] * 3

    l5cand = l5f.get("candidate_classification_design", {})
    l8cand = l8f.get("candidate_unit_design", {})
    l5conditions = l5cand.get("conditions", [])
    l8cases = l8cand.get("cases", [])
    wr249 = read_json("scaffold/research/wr249-tdd-f03-f04-uid-split-20261031/uid-split-correction.json")
    wr249_rows = {row[0]: row for row in wr249["corrected_candidate"]["unit_case_refs"]["F04"]}
    l5_by_uid = {r["unit_case_ref"]: r for r in l5conditions}
    checks["L5_candidate_has_one_condition_per_existing_UID"] = [r.get("unit_case_ref") for r in l5conditions] == [r[0] for r in wr249["corrected_candidate"]["unit_case_refs"]["F04"]]
    checks["L5_candidate_matches_WR249_UID_split"] = set(l5_by_uid) == set(wr249_rows)
    checks["L5_candidate_has_no_new_classifier_projection"] = all(not ({"code", "expected_axis", "expected_state", "backflow_owner", "algorithm", "fixture"} & set(r)) for r in l5conditions)
    checks["L8_candidate_existing_negative_ids_only"] = len(l8cases) == 5 and all(r.get("existing_unit_case_ref") in l8f["unit_case_ids"] for r in l8cases)
    checks["L8_target_L5_contract_and_trace_L9"] = all(r.get("target_ref") == "HARNESS-L5-015-F04" and r.get("source_trace_ref") == f"{L9}#/cases/4/negative_cases/{i}" for i, r in enumerate(l8cases))
    checks["L8_Japanese_text_matches_L5_by_UID"] = all(r.get("counterexample") == l5_by_uid[r["existing_unit_case_ref"]]["negative_condition"] and r.get("candidate_expected_result") == l5_by_uid[r["existing_unit_case_ref"]]["expected_observation"] for r in l8cases)
    checks["L8_contract_and_row_oracle_separated"] = all(r.get("contract_oracle_id") == "HARNESS-L10-015-F04" and r.get("row_oracle_id") is None and r.get("row_oracle_status") == "missing_not_created" for r in l8cases)
    checks["L8_no_test_citation_created"] = all(r.get("test_citation") is None and r.get("test_citation_status") == "not_found_not_created" for r in l8cases)
    checks["L8_candidate_no_fixture_hash_seed_copy"] = not any(term in json.dumps(l8cand).lower() for term in ("sha256", "fixture", "seed", "copy", "rfc6902", "full_return", "same_invocation"))

    base_l5 = json.loads(git_bytes(BASE, L5))
    base_l8 = json.loads(git_bytes(BASE, L8))
    base_l5f = project(base_l5, "contracts", "HARNESS-L5-015-F04")
    base_l8f = project(base_l8, "cases", "HARNESS-L8-015-F04")
    main_l5 = json.loads(git_bytes(MAIN_BASE, L5))
    main_l8 = json.loads(git_bytes(MAIN_BASE, L8))
    f04_merge_l5 = json.loads(git_bytes(F04_MERGE_REVISION, L5))
    f04_merge_l8 = json.loads(git_bytes(F04_MERGE_REVISION, L8))
    historical_hashes = read_json(f"{B01_PKG}/historical-candidate-hashes.json")
    history = {(row["phase"], row["path"]): row for row in historical_hashes["records"]}
    checks["historical_merge_bytes_match_git_objects"] = all(
        sha_bytes(git_bytes(rev, path)) == history[(phase, path)]["sha256_raw_bytes"]
        and git_blob_oid(rev, path) == history[(phase, path)]["git_blob_oid"]
        for phase, rev in (("F03", MAIN_BASE), ("F04", F04_MERGE_REVISION))
        for path in (L5, L8)
    )
    f03_correction = read_json(f"{F03_PKG}/correction-r1-f1.json")
    checks["F03_historical_candidate_hashes_match_merge_blobs"] = all(
        f03_correction["candidate_hashes"].get(path) == history[("F03", path)]["sha256_raw_bytes"]
        for path in (L5, L8)
    )
    checks["F04_merge_time_L5_pin_recorded_in_0208_history"] = any(
        row.get("binding") == "SCF-B-0208"
        and row.get("revision") == F04_MERGE_REVISION
        and row.get("old_pin_sha256") == history[("F04", L5)]["sha256_raw_bytes"]
        for row in historical_hashes.get("historical_binding_pins", [])
    )
    l5_without_f04_and_b01 = remove_candidate(l5, "contracts", "HARNESS-L5-015-F04", "candidate_classification_design")
    l5_without_f04_and_b01 = remove_candidate(l5_without_f04_and_b01, "contracts", "HARNESS-L5-015-B01", "candidate_classification_design")
    l8_without_f04_and_b01 = remove_candidate(l8, "cases", "HARNESS-L8-015-F04", "candidate_unit_design")
    l8_without_f04_and_b01 = remove_candidate(l8_without_f04_and_b01, "cases", "HARNESS-L8-015-B01", "candidate_unit_design")
    l5_without_b01 = remove_candidate(l5, "contracts", "HARNESS-L5-015-B01", "candidate_classification_design")
    l8_without_b01 = remove_candidate(l8, "cases", "HARNESS-L8-015-B01", "candidate_unit_design")
    checks["F04_existing_L5_contract_unchanged"] = project(l5_without_f04_and_b01, "contracts", "HARNESS-L5-015-F04") == project(main_l5, "contracts", "HARNESS-L5-015-F04") and project(main_l5, "contracts", "HARNESS-L5-015-F04").get("candidate_classification_design") is None
    checks["F04_canonical_L8_ids_and_cases_unchanged"] = l8f["unit_case_ids"] == base_l8f["unit_case_ids"] and l8["unit_cases"] == base_l8["unit_cases"]
    checks["WR249_prechange_snapshot_hashes_match_base"] = wr249["prior_candidate_snapshot"]["revision"] == WR249_BASE and wr249["prior_candidate_snapshot"]["l5_sha256"] == sha_bytes(git_bytes(WR249_BASE, L5)) and wr249["prior_candidate_snapshot"]["l8_sha256"] == sha_bytes(git_bytes(WR249_BASE, L8))
    for doc, collection, field, ids in ((l5, "contracts", "candidate_classification_design", ("F03", "F04")), (l8, "cases", "candidate_unit_design", ("F03", "F04"))):
        baseline = json.loads(git_bytes(F04_MERGE_REVISION, L5 if collection == "contracts" else L8))
        for suffix in ids:
            project(doc, collection, f"HARNESS-L{5 if collection == 'contracts' else 8}-015-{suffix}").pop(field, None)
            project(baseline, collection, f"HARNESS-L{5 if collection == 'contracts' else 8}-015-{suffix}").pop(field, None)
        project(doc, collection, f"HARNESS-L{5 if collection == 'contracts' else 8}-015-B01").pop(field, None)
        project(baseline, collection, f"HARNESS-L{5 if collection == 'contracts' else 8}-015-B01").pop(field, None)
        checks[f"{collection}_all_noncandidate_content_unchanged_from_F04_merge"] = doc == baseline
    checks["F03_and_F04_current_hashes_match_WR249_correction"] = sha_bytes((ROOT / L5).read_bytes()) == wr249["corrected_candidate"]["l5_sha256"] and sha_bytes((ROOT / L8).read_bytes()) == wr249["corrected_candidate"]["l8_sha256"]
    checks["F03_fixed_comparison_summary_blind_preserved"] = all((ROOT / f"{F03_PKG}/{p}").read_bytes() == git_bytes(MAIN_BASE, f"{F03_PKG}/{p}") for p in ("comparison.json", "verification-summary.json", "source/wr243-tdd-clean-source-only.json"))

    binding = read_json("scaffold/bindings/SCF-B-0208.json")
    f03_binding = read_json("scaffold/bindings/SCF-B-0204.json")
    checks["0204_old_F03_pin_and_revision_retained"] = any(
        row.get("path") == L5
        and "a7fd79b52e6e5431ed0b5d2e72524c805e3ecdf1226c17f3ee01de5ed4dc24e0" in row.get("note", "")
        and MAIN_BASE in row.get("note", "")
        for row in f03_binding.get("upstream", [])
    )
    checks["0208_old_F04_pin_and_revision_retained"] = any(
        row.get("path") == L5
        and history[("F04", L5)]["sha256_raw_bytes"] in row.get("note", "")
        and F04_MERGE_REVISION in row.get("note", "")
        for row in binding.get("upstream", [])
    )
    l5sha = sha_bytes((ROOT / L5).read_bytes())
    pins = {(r.get("path"), r.get("sha256")) for r in binding.get("upstream", [])}
    f03pins = {(r.get("path"), r.get("sha256")) for r in f03_binding.get("upstream", [])}
    checks["F04_binding_l5_pin_current"] = (L5, l5sha) in pins
    checks["F03_binding_l5_pin_rebound_current"] = (L5, l5sha) in f03pins
    checks["bindings_upstream_excludes_scaffold"] = all(not r.get("path", "").startswith("scaffold/") for b in (binding, f03_binding) for r in b.get("upstream", []))
    checks["binding_no_collision_id"] = binding.get("id") == "SCF-B-0208"

    report = {"schema":"wr243-f04-static-candidate-validation.v1","evidence_kind":"scaffold","authority_effect":"none","checks":checks,"passed":all(checks.values()),"not_run":["L4/L5 algorithm","old runtime/test/CI","new runtime/test/CI"]}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["passed"] else 1

if __name__ == "__main__":
    raise SystemExit(main())
