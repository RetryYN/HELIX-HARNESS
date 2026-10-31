#!/usr/bin/env python3
"""WR258 PR-B: L5/L8 class, case source, and current structural measurements."""
from __future__ import annotations
import argparse
import hashlib
import json
import subprocess
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = "docs/helix-security"
L3 = f"{BASE}/L3-requirements/functional-requirements.json"
L10 = f"{BASE}/L10-verification/functional-verification.json"
L4 = f"{BASE}/L4-basic-design/project-scope-isolation.json"
L5 = f"{BASE}/L5-detail-design/project-scope-isolation.json"
L8 = f"{BASE}/L8-unit-verification/project-scope-isolation.json"
L9 = f"{BASE}/L9-integration-verification/project-scope-isolation.json"
QA = "docs/governance/design-verification-quality-assurance.md"
MAPPING = "scaffold/research/wr258-sec006-psi-explicit-20261101/pr-b-l8-integration-case-ref-candidate-r2.json"
ROWWISE = "scaffold/research/wr250-sec006-psi-l5l8-20261031/rowwise-comparison-r1.json"
R2_VALIDATOR = "scaffold/research/wr258-sec006-psi-explicit-20261101/validate_pr4007_r2.py"
PRB_BINDING = "scaffold/bindings/SCF-B-0224.json"


def load(path: str):
    return json.loads((ROOT / path).read_text())


def sha(path: str) -> str:
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()


def pointer(data, value: str):
    current = data
    if not value:
        return current
    for part in value.lstrip("/").split("/"):
        part = part.replace("~1", "/").replace("~0", "~")
        current = current[int(part)] if isinstance(current, list) else current[part]
    return current


def run(args: list[str]):
    result = subprocess.run(args, cwd=ROOT, text=True, capture_output=True)
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--record", type=Path, help="新しい追補記録先。既存ファイルは上書きしない。")
    args = parser.parse_args()
    if args.record:
        target = args.record if args.record.is_absolute() else ROOT / args.record
        if target.exists():
            raise FileExistsError(f"record_path_must_be_new:{target}")
    failures: list[str] = []
    def check(ok: bool, label: str):
        if not ok:
            failures.append(label)

    l3, l10, l4, l5, l8, l9 = (load(p) for p in (L3, L10, L4, L5, L8, L9))
    mapping, rowwise = load(MAPPING), load(ROWWISE)
    prb_binding = load(PRB_BINDING)
    l4_by_id = {row["class_id"]: row for row in l4["failure_classifications"]}
    l5_by_class = {row["class_id"]: row for row in l5["failure_rules"]}
    l5_contracts = {row["id"]: row for row in l5["contracts"]}
    l5_functions = {row["id"]: row for row in l5["functions"]}
    l8_by_id = {row["id"]: row for group in l8["cases"] for row in group["negative_cases"]}
    l8_candidates = {row["id"]: row for row in l8["candidate_unit_cases"]}
    l9_rows = {row["id"]: row for group in l9["cases"] for row in group["negative_cases"]}
    units = {row["case_id"]: row for row in l8.get("unit_cases", [])}

    check(len(l4_by_id) == 15, "L4 has 15 negative classes")
    check(len(l5_by_class) == 15, "L5 has 15 failure rules")
    check(len(l8.get("negative_equivalence_classes", [])) == 15, "L8 has 15 class projections")
    check(l5.get("negative_equivalence_classes") == {"source_rows": "failure_rules"}, "L5 explicit source marker resolves")
    check(set(l4_by_id) == set(l5_by_class), "L4/L5 class IDs are one-to-one")
    check(set(l4_by_id) == {row["class_id"] for row in l8["negative_equivalence_classes"]}, "L4/L8 class IDs are one-to-one")

    # Current PR-B binding and legacy current pins follow the edited L5/L8 bytes.
    check(prb_binding.get("id") == "SCF-B-0224", "PR-B uses its reserved binding ID")
    check(not any(json.loads(path.read_text()).get("id") == "SCF-B-0224"
                  for path in (ROOT / "scaffold/bindings").glob("*.json") if path.name != "SCF-B-0224.json"),
          "PR-B binding ID is unique")
    for bind_path in (PRB_BINDING, "scaffold/bindings/SCF-B-0201.json", "scaffold/bindings/SCF-B-0218.json"):
        bind = load(bind_path)
        pins = {row.get("path"): row.get("sha256") for row in bind.get("upstream", [])}
        check(pins.get(L5) == sha(L5), f"{bind_path} current L5 pin resolves")
        check(pins.get(L8) == sha(L8), f"{bind_path} current L8 pin resolves")
        for path in (L5, L8):
            pinrow = next((row for row in bind.get("upstream", []) if row.get("path") == path), {})
            note = pinrow.get("note", "")
            check("historical pin" in note or "旧pin" in note or "歴史的hash" in note,
                  f"{bind_path} retains prior {path.rsplit('/', 1)[-1]} pin")
    check("scaffold/bindings/SCF-B-0224.json" in prb_binding.get("artifacts", []), "PR-B binding records itself")
    check("scaffold/research/wr258-sec006-psi-explicit-20261101/validate_wr258_prb_l5l8.py" in prb_binding.get("artifacts", []),
          "PR-B binding registers its current validator")

    for cid, cls in l4_by_id.items():
        rule = l5_by_class.get(cid)
        if not rule:
            continue
        check(rule.get("l4_class_ref") == cid, f"L5 rule links L4 class: {cid}")
        check(rule.get("code") == cls.get("code"), f"L5 code follows L4 class: {cid}")
        for field in ("expected", "expected_axis", "expected_state", "backflow_owner", "side_effect_count"):
            check(rule.get(field) == cls.get(field), f"L5.{field} follows L4 class: {cid}")
        contract = l5_contracts.get(rule.get("contract_ref"))
        check(contract is not None, f"L5 class owner contract resolves: {cid}")
        if contract:
            check(contract.get("requirement_ref") in cls.get("source_pointers", [{}])[0].get("path", "") or
                  contract.get("requirement_ref") in ("HELIXSECURITY-L3-003-F01", "HELIXSECURITY-L3-003-F02"),
                  f"L5 class contract is an SEC003 requirement owner: {cid}")
    for row in l8["negative_equivalence_classes"]:
        cls = l4_by_id[row["class_id"]]
        for field in ("expected_classification", "expected", "expected_axis", "expected_state", "backflow_owner", "side_effect_count"):
            check(row.get(field) == (cls.get("code") if field == "expected_classification" else cls.get(field)),
                  f"L8.{field} follows L4 class: {row['class_id']}")

    # Caller provenance remains a typed, effect-free field projection.
    caller = l5_functions.get("HELIXSECURITY-L5-003-compare_caller_material", {})
    compose = l5_functions.get("HELIXSECURITY-L5-003-compose_scope_proposal", {})
    check(caller.get("output_type") == "CallerPartAnalysis", "caller function exposes typed provenance output")
    check(caller.get("return_root_fields", {}).get("caller_kind_provenance") == "Field<CallerKind>", "caller output retains raw presence/tag/value")
    check(caller.get("effect") == "none", "caller provenance has no effect")
    check(compose.get("return_root_fields", {}).get("caller_kind_provenance") == "Field<CallerKind>|null", "proposal copies caller provenance")
    check(compose.get("effect") == "none", "proposal provenance has no effect")
    caller_contract = l8.get("caller_provenance_contract", {})
    caller_fixture_state = caller_contract.get("fixture_state", "")
    check(("未供給" in caller_fixture_state or "未実行" in caller_fixture_state or
           "not supplied" in caller_fixture_state or "not executed" in caller_fixture_state),
          "caller composition fixture/execution limits are explicit")

    # Verify 50 fixed R2 mappings against actual L8 and L9 source rows.
    mapping_rows = mapping.get("rows", [])
    check(len(mapping_rows) == 50, "fixed R2 mapping has 50 candidate rows")
    mapping_by_l8 = {row["l8_case_id"]: row for row in mapping_rows}
    check(len(mapping_by_l8) == 50, "R2 mapping L8 IDs are unique")
    applied_mapping = set()
    for row in mapping_rows:
        cid, l8id, l9id = row["candidate_id"], row["l8_case_id"], row["l9_integration_case_ref"]
        source = l8_by_id.get(l8id)
        target = l9_rows.get(l9id)
        check(source is not None, f"mapping L8 source resolves: {cid}")
        check(target is not None, f"mapping L9 target resolves: {cid}")
        if source:
            check(source.get("function_ref") == row.get("function_ref"), f"mapping function agrees with L8 source: {cid}")
            try:
                check(pointer(l8, row["l8_case_pointer"]) is source, f"mapping pointer resolves to row: {cid}")
            except Exception:
                check(False, f"mapping pointer resolves to row: {cid}")
        if target:
            check(target.get("negative_class_ref") == row.get("l4_class_id"), f"mapping class agrees with L9 target: {cid}")
        unit = next((u for u in units.values() if u.get("mapping_candidate_id") == cid), None)
        if l8id == "SEC003-L8-OPERATION-DEFER":
            check(unit is None, "operation-defer mapping is not applied as a negative unit case")
            check(l8id not in units, "local operation-defer is outside explicit system-negative inventory")
            continue
        check(unit is not None, f"mapped case is present in L8 unit_cases: {cid}")
        if unit:
            applied_mapping.add(cid)
            cls = l4_by_id[row["l4_class_id"]]
            check(unit.get("integration_case_ref") == l9id, f"unit case maps one-to-one to L9 row: {cid}")
            check(unit.get("expected") == cls.get("expected"), f"L8 expected is sourced from L4: {cid}")
            check(unit.get("expected_preserved") == cls.get("expected_preserved"), f"L8 preserved expectation is sourced from L4: {cid}")
    check(len(applied_mapping) == 49, "49/50 R2 mapping rows are applied; local defer is separated")
    check(all(row.get("status") == "candidate_not_applied" for row in mapping_rows), "historical mapping artifact remains unchanged")

    # Verify all 91 retained L8 candidates against fixed rowwise source identity and class.
    retained = [row for row in rowwise.get("l9_rows", []) if row.get("disposition") == "retained_candidate"]
    check(len(retained) == 91, "fixed rowwise source has 91 retained candidates")
    rowwise_by_candidate = {row["candidate_id"]: row for row in retained}
    check(len(rowwise_by_candidate) == 91, "rowwise candidate IDs are unique")
    candidate_units = [u for u in units.values() if u.get("candidate_status") == "retained_candidate_not_executed"]
    check(len(candidate_units) == 91, "91 retained candidates are explicit not-executed unit designs")
    for unit in candidate_units:
        cid = unit["case_id"]
        candidate = l8_candidates.get(cid)
        rowwise_row = rowwise_by_candidate.get(cid)
        check(candidate is not None, f"retained candidate resolves in L8: {cid}")
        check(rowwise_row is not None, f"retained candidate resolves in fixed rowwise source: {cid}")
        if not candidate or not rowwise_row:
            continue
        cls = l4_by_id.get(candidate.get("negative_class_ref"))
        check(cls is not None, f"retained candidate class resolves: {cid}")
        check(candidate.get("function_ref") in l5_functions, f"retained candidate function resolves: {cid}")
        try:
            pointer(l8, unit["candidate_source_pointer"])
        except Exception:
            check(False, f"retained candidate source pointer resolves: {cid}")
        check(unit.get("integration_case_ref") == rowwise_row.get("l9_case_id"), f"retained candidate L9 mapping agrees: {cid}")
        if cls:
            check(unit.get("expected") == cls.get("expected"), f"retained candidate expectation derives from L4: {cid}")
            check(unit.get("expected_preserved") == cls.get("expected_preserved"), f"retained candidate preservation derives from L4: {cid}")

    # Every explicit row references one unique existing L9 identity and an L4-derived class.
    check(len(units) == 148, "L8 explicit inventory has 148 rows")
    refs = [row.get("integration_case_ref") for row in units.values()]
    check(len(set(refs)) == 148, "L8 integration references are one-to-one")
    check(set(refs) == set(l9_rows), "L8 unit inventory covers the current 148 L9 row identities")
    for row in units.values():
        cls = l4_by_id.get(row.get("negative_class_ref"))
        target = l9_rows.get(row.get("integration_case_ref"))
        check(cls is not None, f"unit class resolves from L4: {row['case_id']}")
        check(target is not None, f"unit integration ID resolves to nested L9 source: {row['case_id']}")
        if cls:
            check(row.get("expected") == cls.get("expected") and row.get("expected_preserved") == cls.get("expected_preserved"),
                  f"unit expectations use L4 class projection: {row['case_id']}")
        if target:
            check(target.get("negative_class_ref") == row.get("negative_class_ref"), f"unit and L9 source class agree: {row['case_id']}")

    # Six caller rows preserve provenance as a local projection, not as a fabricated L9 finding.
    expected_callers = {"Worker", "Agent", "Hook", "memory", "credential", "configuration"}
    caller_units = [row for row in units.values() if row["case_id"].startswith("SEC003-L8-CALLER-PRIMARY-TREE-")]
    check(len(caller_units) == 6, "six caller provenance unit rows exist")
    observed_callers = set()
    caller_l9_refs = set()
    for unit in caller_units:
        kind = unit.get("caller_provenance_projection", {}).get("input_value")
        observed_callers.add(kind)
        caller_l9_refs.add(unit.get("integration_case_ref"))
        target = l9_rows.get(unit.get("integration_case_ref"), {})
        source_kind = target.get("counterexample", {}).get("request", {}).get("caller_kind")
        check(source_kind == kind, f"caller source and L9 row agree: {unit['case_id']}")
        check(unit.get("function_ref") == compose.get("id"), f"caller row exercises proposal composition: {unit['case_id']}")
        check("caller_kind" not in unit.get("expected_preserved", {}), f"caller provenance is separate from system expected_preserved: {unit['case_id']}")
    check(observed_callers == expected_callers, "all six declared callers are represented distinctly")
    check(len(caller_l9_refs) == 6, "six caller rows refer to six distinct L9 cases")
    check(not any("caller_kind" in row.get("expected_preserved", {}) for row in l9_rows.values()), "L9 system expectations are not edited to mirror caller provenance")

    # OPERATION-DEFER and system absent are distinct observations; the system row has a new composite U-ID.
    defer = l8_by_id.get("SEC003-L8-OPERATION-DEFER", {})
    composite = units.get("SEC003-L8-COMPOSE-READ-CONNECTION-ABSENT", {})
    map046 = mapping_by_l8.get("SEC003-L8-OPERATION-DEFER", {})
    check(defer.get("expected_result") == {"grade": "unknown", "findings": []}, "local operation-defer remains unknown with empty findings")
    check("negative_class_ref" not in defer, "local operation-defer has no system negative class")
    check(map046.get("l9_integration_case_ref") == composite.get("integration_case_ref"), "candidate 046 is replaced by a separate compose U-ID")
    check(composite.get("negative_class_ref") == "SEC003-F02-EXPLICIT-CONNECTION-ABSENT", "composed system absent case uses existing L4 class")
    check(composite.get("local_component_case_refs") == ["SEC003-L8-OPERATION-DEFER", "SEC003-L8-CONNECTION-ABSENT"], "system composite references both local source observations")
    composite_fixture_state = composite.get("input_condition", {}).get("fixture_state", "")
    check(("未供給" in composite_fixture_state or "未実行" in composite_fixture_state or
           "not supplied" in composite_fixture_state or "not executed" in composite_fixture_state),
          "composite raw fixture limits are explicit")

    # Nine former L8 no-class rows: eight move to five new L4 classes; defer remains local-only.
    formerly_unassigned = [
        "SEC003-L8-SIDE-UNKNOWN-SIDE", "SEC003-L8-ASSET-UNKNOWN-KIND",
        "SEC003-L8-OWNERS-STALE-OS", "SEC003-L8-OWNERS-STALE-INFRA", "SEC003-L8-OWNERS-STALE-CONNECT",
        "SEC003-L8-OPERATION-UNKNOWN", "SEC003-L8-OPERATION-DEFER",
        "SEC003-L8-FALLBACK-UNKNOWN", "SEC003-L8-FALLBACK-NULL"]
    check(len(formerly_unassigned) == 9, "all nine original no-class rows are accounted for")
    resolved_count = 0
    for case_id in formerly_unassigned:
        row = l8_by_id[case_id]
        if case_id == "SEC003-L8-OPERATION-DEFER":
            check("negative_class_ref" not in row and case_id not in units, "operation-defer remains local-only")
        else:
            cls = l4_by_id.get(row.get("negative_class_ref"))
            check(cls is not None, f"previously unassigned row now references L4 class: {case_id}")
            if cls:
                resolved_count += 1
                check((row.get("negative_class_assignment") or {}).get("expected_classification") == cls.get("code"), f"local class assignment follows L4: {case_id}")
    check(resolved_count == 8, "eight former no-class rows map to five L4 unresolved classes")

    # Caller missing/null/malformed stays a local unresolved result with no invented system row.
    unresolved = caller_contract.get("unresolved_input_rows", [])
    check(len(unresolved) == 3, "caller missing/null/malformed local rows are stated")
    unresolved_class = l4_by_id.get("SEC003-F01-SIDE-INPUT-UNRESOLVED", {})
    for row in unresolved:
        check(row.get("candidate_l4_class_ref") == unresolved_class.get("class_id"), f"unresolved caller class candidate resolves: {row.get('case_id')}")
        check(row.get("local_only") is True and row.get("integration_case_ref") is None, f"unresolved caller row is not falsely linked to L9: {row.get('case_id')}")
        check(row.get("expected_local_result", {}).get("grade") == "unknown", f"unresolved caller stays unknown: {row.get('case_id')}")

    # Existing 98 L9 rows lack all three QA casewise fields; these remain an explicit prerequisite.
    legacy_l9 = [row for row in l9_rows.values() if not row["id"].startswith("SEC003-WR258-L9-ORACLE-")]
    missing = {field: [row["id"] for row in legacy_l9 if field not in row] for field in ("condition", "expected", "expected_preserved")}
    check(len(legacy_l9) == 98, "98 preexisting L9 rows remain in source")
    check(all(len(values) == 98 for values in missing.values()), "all 98 old L9 rows still need all three QA casewise fields")
    check(not isinstance(l9.get("integration_cases"), list), "L9 integration_cases array is still pending the separate L4/L9 supplement")

    # The exact formal check-child and Scaffold measurements are recorded honestly.
    checker = run([sys.executable, "-B", "scaffold/tools/design_verification_checker.py", "check-child", "--root", ".", "--l4", L4, "--l5", L5, "--l8", L8, "--l9", L9])
    checker_report = json.loads(checker.stdout)
    four = checker_report["negative_4way"]
    fail_groups = Counter(f"{row.get('attribute')}:{row.get('reason')}" for row in four["failures"])
    scf_validate = run([sys.executable, "-B", "scaffold/tools/scfctl.py", "validate"])
    scf_stale = run([sys.executable, "-B", "scaffold/tools/scfctl.py", "stale"])
    validate_summary = scf_validate.stdout.strip().splitlines()[-1] if scf_validate.stdout.strip() else ""
    stale_summary = scf_stale.stdout.strip().splitlines()[-1] if scf_stale.stdout.strip() else ""

    base = subprocess.check_output(["git", "merge-base", "HEAD", "origin/main"], cwd=ROOT, text=True).strip()
    head = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    report = {
        "schema": "wr258-prb-l5l8-validation.v1",
        "evidence_kind": "scaffold",
        "authority_effect": "none",
        "source": {"origin_main": subprocess.check_output(["git", "rev-parse", "origin/main"], cwd=ROOT, text=True).strip(), "merge_base": base, "head": head},
        "static_checks": {"passed": not failures, "failure_count": len(failures), "failures": failures,
                          "class_rows": {"L4": len(l4_by_id), "L5": len(l5_by_class), "L8": len(l8.get("negative_equivalence_classes", [])), "L9": len(l9.get("negative_equivalence_classes", []))},
                          "unit_cases": len(units), "unique_l9_refs": len(set(refs)), "applied_fixed_mappings": len(applied_mapping), "retained_l8_candidates": len(candidate_units), "caller_rows": len(caller_units), "former_no_class_rows": {"mapped": resolved_count, "local_defer": 1},
                          "legacy_l9_missing_casewise_fields": {k: len(v) for k, v in missing.items()}, "l9_integration_cases_present": isinstance(l9.get("integration_cases"), list)},
        "formal_check_child": {"exit": checker.returncode, "passed": checker_report.get("passed"), "pair_statuses": {"L4_L9": checker_report["L4_L9_pair"]["passed"], "L5_L8": checker_report["L5_L8_pair"]["passed"]}, "fourway_counts": four.get("counts"), "class_rows": four.get("class_row_counts"), "case_rows": four.get("case_row_counts"), "matched_case_count": four.get("matched_case_count"), "failure_count": len(four["failures"]), "failure_groups": dict(fail_groups)},
        "scfctl": {"validate_exit": scf_validate.returncode, "validate_summary": validate_summary, "stale_exit": scf_stale.returncode, "stale_summary": stale_summary},
        "sha256": {path: sha(path) for path in (L3, L10, L4, L5, L8, L9, QA, MAPPING, ROWWISE)},
    }
    encoded = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.record:
        with target.open("x", encoding="utf-8") as stream:
            stream.write(encoded)
    print(encoded, end="")
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
