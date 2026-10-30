#!/usr/bin/env python3
"""Static WR249 U-ID split checks; no algorithm, runtime, test, or CI execution."""
from __future__ import annotations
import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "scaffold/research/wr253-tdd-l8-slim-20261031"))
import validate_uid_table
BASE = "e9cca9f1d3d88b1c2049c3a3e492b36b2c2ec905"
L3 = "docs/helix-harness/L3-requirements/functional-requirements.json"
L10 = "docs/helix-harness/L10-verification/functional-verification.json"
L4 = "docs/helix-harness/L4-basic-design/tdd-development-flow.json"
L9 = "docs/helix-harness/L9-integration-verification/tdd-development-flow.json"
L5 = "docs/helix-harness/L5-detail-design/tdd-development-flow.json"
L8 = "docs/helix-harness/L8-unit-verification/tdd-development-flow.json"
PKG = "scaffold/research/wr249-tdd-f03-f04-uid-split-20261031"


def read(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{BASE}:{path}"], cwd=ROOT)


def keyed(doc, collection, key):
    return next(row for row in doc[collection] if row.get("id") == key)


def main() -> int:
    checks = {}
    checks.update({f"WR253_{k}": v for k, v in validate_uid_table.run_checks().items()})
    l3, l10, l4, l9, l5, l8 = (read(p) for p in (L3, L10, L4, L9, L5, L8))
    baseline_l4, baseline_l9 = git_bytes(L4), git_bytes(L9)
    checks["L3_L10_L4_L9_bytes_unchanged"] = all((ROOT / p).read_bytes() == git_bytes(p) for p in (L3, L10, L4, L9))
    blind_path = "scaffold/research/wr243-tdd-f03-l5-l8-20261031/source/wr243-tdd-clean-source-only.json"
    checks["fixed_blind_unchanged"] = (ROOT / blind_path).read_bytes() == git_bytes(blind_path)
    for pkg, files in {
        "scaffold/research/wr243-tdd-f03-l5-l8-20261031": ("comparison.json", "verification-summary.json", "correction-r1-f1.json"),
        "scaffold/research/wr243-tdd-f04-l5-l8-20261031": ("comparison.json", "verification-summary.json", "bilingual-mapping.json"),
        "scaffold/research/wr243-tdd-b01-l5-l8-20261031": ("comparison.json", "verification-summary.json", "bilingual-mapping.json"),
    }.items():
        checks[f"fixed_{pkg.rsplit('/',1)[-1]}_evidence_unchanged"] = all((ROOT / f"{pkg}/{name}").read_bytes() == git_bytes(f"{pkg}/{name}") for name in files)

    pairs = {"F03": ("HARNESS-L5-015-F03", "HARNESS-L8-015-F03", 3, 9), "F04": ("HARNESS-L5-015-F04", "HARNESS-L8-015-F04", 4, 5)}
    all_refs = []
    for label, (l5id, l8id, index, count) in pairs.items():
        c5 = keyed(l5, "contracts", l5id)["candidate_classification_design"]["conditions"]
        c8_obj = keyed(l8, "cases", l8id)
        c8 = c8_obj["candidate_unit_design"]["cases"]
        refs5 = [row["unit_case_ref"] for row in c5]
        refs8 = [row["existing_unit_case_ref"] for row in c8]
        all_refs.extend(refs5)
        checks[f"{label}_candidate_count_and_one_to_one_ids"] = len(c5) == len(c8) == count and refs5 == refs8 and len(set(refs5)) == count
        checks[f"{label}_L5_L8_source_text_matches_by_UID"] = all(a["negative_condition"] == b["counterexample"] and a["expected_observation"] == b["candidate_expected_result"] for a, b in zip(c5, c8))
        checks[f"{label}_existing_L9_trace_refs"] = all(row["source_trace_ref"] == f"{L9}#/cases/{index}/negative_cases/{i}" for i, row in enumerate(c8))
        checks[f"{label}_canonical_unit_case_ids_preserved"] = c8_obj["unit_case_ids"] == keyed(json.loads(git_bytes(L8)), "cases", l8id)["unit_case_ids"]
        checks[f"{label}_missing_row_oracle_and_test_citation_preserved"] = all(row["row_oracle_id"] is None and row["row_oracle_status"] == "missing_not_created" and row["test_citation"] is None and row["test_citation_status"] == "not_found_not_created" for row in c8)
        checks[f"{label}_contract_oracle_preserved"] = all(row["contract_oracle_id"] == f"HARNESS-L10-015-{label}" and row["target_ref"] == l5id for row in c8)
    checks["all_14_existing_U_IDs_are_unique"] = len(all_refs) == 14 and len(set(all_refs)) == 14
    checks["L8_historical_unit_cases_preserved_at_WR249_revision"] = json.loads(git_bytes(L8))["unit_cases"] == json.loads(subprocess.check_output(["git", "show", f"{validate_uid_table.CURRENT_SOURCE_REVISION}:{L8}"], cwd=ROOT))["unit_cases"]
    checks["F04_core_verification_022_named"] = "コア検証/受入022" in keyed(l5, "contracts", "HARNESS-L5-015-F04")["candidate_classification_design"]["conditions"][2]["expected_observation"]
    checks["B01_and_other_fields_unchanged"] = all(
        keyed(l5, "contracts", f"HARNESS-L5-015-{fid}") == keyed(json.loads(git_bytes(L5)), "contracts", f"HARNESS-L5-015-{fid}")
        for fid in ("B01", "F01", "F02")
    ) and all(
        keyed(l8, "cases", f"HARNESS-L8-015-{fid}").get("unit_case_ids") == keyed(json.loads(git_bytes(L8)), "cases", f"HARNESS-L8-015-{fid}").get("unit_case_ids")
        and keyed(l8, "cases", f"HARNESS-L8-015-{fid}").get("candidate_unit_design") == keyed(json.loads(git_bytes(L8)), "cases", f"HARNESS-L8-015-{fid}").get("candidate_unit_design")
        for fid in ("B01", "F01", "F02")
    )

    corr = read(f"{PKG}/uid-split-correction.json")
    source = corr["source_artifact"]
    checks["source_only_draft_is_accessible_and_fixed"] = digest((ROOT / source["path"]).read_bytes()) == source["sha256"]
    checks["correction_records_historical_base_and_corrected_hashes"] = corr["prior_candidate_snapshot"]["revision"] == BASE and corr["prior_candidate_snapshot"]["l5_sha256"] == digest(git_bytes(L5)) and corr["prior_candidate_snapshot"]["l8_sha256"] == digest(git_bytes(L8)) and corr["corrected_candidate"]["l5_sha256"] == digest(subprocess.check_output(["git", "show", f"{validate_uid_table.CURRENT_SOURCE_REVISION}:{L5}"], cwd=ROOT)) and corr["corrected_candidate"]["l8_sha256"] == digest(subprocess.check_output(["git", "show", f"{validate_uid_table.CURRENT_SOURCE_REVISION}:{L8}"], cwd=ROOT))
    for bid in ("SCF-B-0204", "SCF-B-0208", "SCF-B-0210"):
        binding = read(f"scaffold/bindings/{bid}.json")
        pins = {row["path"]: row for row in binding["upstream"]}
        checks[f"{bid}_pins_current_and_have_history"] = all(p in pins and pins[p]["sha256"] == digest((ROOT / p).read_bytes()) and BASE in pins[p].get("note", "") and "prior pin " in pins[p].get("note", "") for p in (L5, L8) if any(x.get("path") == p for x in binding["upstream"]))
        checks[f"{bid}_upstream_has_no_scaffold_paths"] = all(not row["path"].startswith("scaffold/") for row in binding["upstream"])
        checks[f"{bid}_correction_artifact_registered"] = f"{PKG}/uid-split-correction.json" in binding["artifacts"]

    report = {"schema": "wr249-static-validation.v1", "evidence_kind": "scaffold", "authority_effect": "none", "checks": checks, "passed": all(checks.values()), "not_run": ["L4/L5 algorithm", "runtime", "product tests", "CI"]}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
