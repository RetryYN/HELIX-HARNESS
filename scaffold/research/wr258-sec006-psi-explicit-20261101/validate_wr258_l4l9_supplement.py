#!/usr/bin/env python3
"""WR258 L4/L9 casewise supplement: read-only source and candidate audit."""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = "151713275e2c2aa65bb23a8fe38eb63c46d570c8"
L3 = "docs/helix-security/L3-requirements/functional-requirements.json"
L10 = "docs/helix-security/L10-verification/functional-verification.json"
L4 = "docs/helix-security/L4-basic-design/project-scope-isolation.json"
L9 = "docs/helix-security/L9-integration-verification/project-scope-isolation.json"
QA = "docs/governance/design-verification-quality-assurance.md"
HISTORICAL_ORACLE_PREFIX = "SEC003-WR258-L9-ORACLE-"
CURRENT_ORACLE_PREFIX = "SEC003-L9-ORACLE-"


def load(path: str | Path):
    p = Path(path)
    if not p.is_absolute():
        p = ROOT / p
    return json.loads(p.read_text())


def sha(path: str | Path) -> str:
    p = Path(path)
    if not p.is_absolute():
        p = ROOT / p
    return hashlib.sha256(p.read_bytes()).hexdigest()


def resolve_pointer(data, pointer: str):
    current = data
    if not pointer:
        return current
    for part in pointer.lstrip("/").split("/"):
        part = part.replace("~1", "/").replace("~0", "~")
        current = current[int(part)] if isinstance(current, list) else current[part]
    return current


def j(value) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def shown(value) -> str:
    return "省略" if value == "__OMITTED__" else j(value)


def derive_legacy_condition(row: dict) -> tuple[str, list[dict]]:
    """Render the old 98 conditions only from that L9 row and its class axis."""
    class_id = row["negative_class_ref"]
    counterexample = row["counterexample"]
    request = counterexample.get("request", {})
    context = counterexample.get("context", {})
    observation = row["expected_observation"]
    finding = (observation.get("findings") or [{}])[0]
    finding_pointer = finding.get("pointer", "")
    facts: list[dict] = []

    def fact(path: str, obj: dict, key: str):
        value = obj.get(key, "__OMITTED__")
        facts.append({"path": path, "state": "omitted" if value == "__OMITTED__" else "explicit_null" if value is None else "present", "value": value if value != "__OMITTED__" else None})
        return value

    if class_id == "SEC003-F01-IDENTITY-CONFLICT":
        axis = finding_pointer.rsplit("/", 1)[-1]
        actual = fact(f"/counterexample/request/asset_scope/{axis}", request.get("asset_scope", {}), axis)
        expected = fact(f"/counterexample/context/expected_target/{axis}", context.get("expected_target", {}), axis)
        if actual == "__OMITTED__" or expected == "__OMITTED__" or actual == expected:
            raise ValueError(f"上流条件と矛盾するidentity conflict入力: {row['id']}")
        return f"{request.get('asset_kind')}資産の{axis}で、request側={shown(actual)}、expected_target側={shown(expected)}が相反する。", facts

    if class_id == "SEC003-F01-IDENTITY-MISSING":
        parts = finding_pointer.split("/")
        side, axis = parts[2], parts[-1]
        if side not in ("origin", "target"):
            raise ValueError(f"identity missingのsource pointer不明: {row['id']}")
        actual = fact(f"/counterexample/request/{side}/{axis}", request.get(side, {}), axis)
        expected = fact(f"/counterexample/context/expected_{side}/{axis}", context.get(f"expected_{side}", {}), axis)
        if actual not in (None, "__OMITTED__") or expected in (None, "__OMITTED__"):
            raise ValueError(f"上流条件と矛盾するidentity missing入力: {row['id']}")
        return f"{request.get('asset_kind')}資産の{side}.{axis}が{shown(actual)}で、expected_{side}.{axis}={shown(expected)}とのidentity対応を確定できない。", facts

    if class_id == "SEC003-F01-TENANT-INVENTED":
        actual = fact("/counterexample/request/target/tenant", request.get("target", {}), "tenant")
        expected = fact("/counterexample/context/expected_target/tenant", context.get("expected_target", {}), "tenant")
        if actual in (None, "__OMITTED__") or expected is not None:
            raise ValueError(f"上流条件と矛盾するtenant-invented入力: {row['id']}")
        return f"request.target.tenant={j(actual)}だがexpected_target.tenant=nullであり、tenant非適用側に値が与えられている。", facts

    if class_id == "SEC003-F01-TENANT-APPLICABILITY-UNRESOLVED":
        unresolved = [(key, value) for key, value in sorted(context.items()) if key.endswith("_tenant_applicable") and value is None]
        if len(unresolved) != 1:
            raise ValueError(f"上流conditionと矛盾するtenant applicability入力: {row['id']}")
        key, value = unresolved[0]
        facts.append({"path": f"/counterexample/context/{key}", "state": "explicit_null", "value": value})
        side = key.removesuffix("_tenant_applicable")
        actual = request.get(side, {})
        expected = context.get(f"expected_{side}", {})
        if actual:
            facts.append({"path": f"/counterexample/request/{side}", "state": "present", "value": actual})
        if expected:
            facts.append({"path": f"/counterexample/context/expected_{side}", "state": "present", "value": expected})
        condition = f"context.{key}=null"
        if actual:
            condition += f"; request.{side}={j(actual)}"
        if expected:
            condition += f"; context.expected_{side}={j(expected)}"
        if "asset_scope" in request:
            facts.append({"path": "/counterexample/request/asset_scope", "state": "present", "value": request["asset_scope"]})
            condition += f"; request.asset_scope={j(request['asset_scope'])}"
        return f"{condition}であり、tenant適用性は未確定である。", facts

    if class_id == "SEC003-F02-EXPLICIT-CONNECTION-ABSENT":
        operation = fact("/counterexample/request/operation", request, "operation")
        state = fact("/counterexample/request/connection_state", request, "connection_state")
        if state != "absent" or operation != observation.get("requested_operation"):
            raise ValueError(f"上流条件と矛盾するconnection absent入力: {row['id']}")
        facts.append({"path": "/counterexample/comparison_shape_id", "state": "present", "value": counterexample.get("comparison_shape_id")})
        return f"{counterexample.get('comparison_shape_id')}条件でoperation={j(operation)}を要求し、connection_state={j(state)}である。", facts

    if class_id == "SEC003-F02-IMPLICIT-FALLBACK":
        caller = fact("/counterexample/request/caller_kind", request, "caller_kind")
        asset = fact("/counterexample/request/asset_kind", request, "asset_kind")
        operation = fact("/counterexample/request/operation", request, "operation")
        fallback = fact("/counterexample/request/fallback", request, "fallback")
        if fallback not in ("primary_tree", "other_project"):
            raise ValueError(f"fallback source入力未解決: {row['id']}")
        return f"{caller} callerの{asset} operation={j(operation)}でfallback={j(fallback)}を指定している。", facts

    if class_id == "SEC003-F02-FOREIGN-LATEST":
        caller = fact("/counterexample/request/caller_kind", request, "caller_kind")
        claim = fact("/counterexample/request/asset_state_latest_claim", request, "asset_state_latest_claim")
        actual = fact("/counterexample/request/asset_scope/project", request.get("asset_scope", {}), "project")
        expected = fact("/counterexample/context/expected_target/project", context.get("expected_target", {}), "project")
        if claim is not True or actual in (None, "__OMITTED__") or expected in (None, "__OMITTED__") or actual == expected:
            raise ValueError(f"上流conditionと矛盾するforeign latest入力: {row['id']}")
        return f"{caller} callerのlatest claim={j(claim)}に対し、projectがrequest側={j(actual)}、expected_target側={j(expected)}で異なる。", facts

    if class_id == "SEC003-F02-CONNECTION-MATERIAL-CONFLICT":
        actual = fact("/counterexample/request/connection/revision", request.get("connection", {}), "revision")
        expected = fact("/counterexample/context/expected_connection/revision", context.get("expected_connection", {}), "revision")
        if actual in (None, "__OMITTED__") or expected in (None, "__OMITTED__") or actual == expected:
            raise ValueError(f"上流conditionと矛盾するconnection revision入力: {row['id']}")
        return f"request.connection.revision={j(actual)}とexpected_connection.revision={j(expected)}が一致しない。", facts

    if class_id == "SEC003-F02-CONNECTION-MATERIAL-UNRESOLVED":
        operation = fact("/counterexample/request/operation", request, "operation")
        state = fact("/counterexample/request/connection_state", request, "connection_state")
        if state != "unknown":
            raise ValueError(f"上流conditionと矛盾するconnection unknown入力: {row['id']}")
        return f"operation={j(operation)}に対してconnection_state={j(state)}であり、connection materialを確定できない。", facts

    if class_id == "SEC003-F02-OPERATION-SCOPE":
        caller = fact("/counterexample/request/caller_kind", request, "caller_kind")
        asset = fact("/counterexample/request/asset_kind", request, "asset_kind")
        operation = fact("/counterexample/request/operation", request, "operation")
        actual = fact("/counterexample/request/connection/allowed_operations", request.get("connection", {}), "allowed_operations")
        expected = fact("/counterexample/context/expected_connection/allowed_operations", context.get("expected_connection", {}), "allowed_operations")
        if not isinstance(actual, list) or actual != expected or operation in actual:
            raise ValueError(f"上流conditionと矛盾するoperation scope入力: {row['id']}")
        return f"{caller} callerの{asset} operation={j(operation)}はallowed_operations={j(actual)}に含まれない。", facts

    raise ValueError(f"旧98行で未対応のsource class: {row['id']} {class_id}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--candidate-l8", type=Path, help="別branchのL8候補を比較専用で読む")
    parser.add_argument("--candidate-revision", help="比較に使うL8候補の固定commit")
    args = parser.parse_args()
    l3, l10, l4, l9 = (load(p) for p in (L3, L10, L4, L9))
    original_l9 = json.loads(subprocess.check_output(["git", "show", f"{BASE}:{L9}"], cwd=ROOT, text=True))
    original_l4 = json.loads(subprocess.check_output(["git", "show", f"{BASE}:{L4}"], cwd=ROOT, text=True))
    l3_by_id = {row["id"]: row for row in l3["requirements"]}
    l10_by_id = {row["id"]: row for row in l10["cases"]}
    l4_rows = l4["failure_classifications"]
    class_by_id = {row["class_id"]: row for row in l4_rows}
    class_index = {row["class_id"]: i for i, row in enumerate(l4_rows)}
    nested = []
    nested_by_id = {}
    for gi, group in enumerate(l9["cases"]):
        for ni, row in enumerate(group["negative_cases"]):
            nested.append((gi, ni, row))
            nested_by_id[row["id"]] = (gi, ni, row)
    cases = l9.get("integration_cases")
    failures: list[str] = []

    def check(ok: bool, label: str):
        if not ok:
            failures.append(label)

    check(l4 == original_l4, "L4 source bytes/structure are unchanged from pinned main")
    original_rows = {row["id"]: row for group in original_l9["cases"] for row in group["negative_cases"]}
    current_rows = {row["id"]: row for group in l9["cases"] for row in group["negative_cases"]}
    expected_rows = {}
    for old_id, old_row in original_rows.items():
        new_id = old_id.replace(HISTORICAL_ORACLE_PREFIX, CURRENT_ORACLE_PREFIX, 1) if old_id.startswith(HISTORICAL_ORACLE_PREFIX) else old_id
        expected_row = dict(old_row)
        expected_row["id"] = new_id
        expected_rows[new_id] = expected_row
    check(current_rows == expected_rows, "148 nested L9 rows are preserved except the reviewed 50 ID renames")
    check(not any(row_id.startswith(HISTORICAL_ORACLE_PREFIX) for row_id in current_rows), "no work-qualified oracle ID remains in canonical L9")
    check(l9["multi_contract_residual"] == original_l9["multi_contract_residual"], "L9 multi_contract_residual remains unchanged")
    check(len(class_by_id) == 15 and len(l9.get("negative_equivalence_classes", [])) == 15, "L4/L9 each retain 15 class rows")
    check(l4.get("negative_equivalence_classes") == {"source_rows": "failure_classifications"}, "L4 explicit source marker is retained")
    l9_marker = l9.get("negative_equivalence_classes")
    l9_marker_by_id = {row.get("class_id"): row for row in l9_marker if isinstance(row, dict)} if isinstance(l9_marker, list) else {}
    l4_core = {row["class_id"]: {key: row.get(key) for key in ("expected_classification", "expected", "expected_axis", "expected_state", "backflow_owner", "side_effect_count")} for row in l4_rows}
    l9_marker_matches = len(l9_marker_by_id) == 15 and set(l9_marker_by_id) == set(l4_core)
    if l9_marker_matches:
        l9_marker_matches = all({key: l9_marker_by_id[cid].get(key) for key in l4_core[cid]} == l4_core[cid] for cid in l4_core)
    check(l9_marker_matches, "L9 explicit source marker has the same 15 class rows and class keys as L4")
    check(len(nested) == 148 and len(cases) == 148 if isinstance(cases, list) else False, "nested L9 rows and integration_cases each have 148 rows")
    case_by_id = {row.get("id"): row for row in cases} if isinstance(cases, list) else {}
    check(len(case_by_id) == 148, "L9 integration case IDs are unique")
    check(set(case_by_id) == set(nested_by_id), "integration case IDs map exactly to nested L9 negative IDs")

    l3_seen = set()
    l10_seen = set()
    old98 = []
    new50 = []
    conditions = []
    input_conflicts = []
    oracle_mismatches = []
    compact_mismatches = []
    source_pointer_failures = []
    source_layer_failures = []
    for gi, ni, row in nested:
        case = case_by_id.get(row["id"], {})
        cid = row.get("negative_class_ref")
        cls = class_by_id.get(cid)
        if not cls:
            failures.append(f"{row['id']}: unresolved L4 class {cid}")
            continue
        is_new = row["id"].startswith(CURRENT_ORACLE_PREFIX)
        group = new50 if is_new else old98
        group.append(row["id"])
        check(case.get("population_state") == "negative", f"{row['id']}: negative population")
        check(case.get("negative_class_ref") == cid, f"{row['id']}: integration case uses nested L4 class ref")
        check(case.get("expected") == cls.get("expected"), f"{row['id']}: case expected is L4 class projection")
        check(case.get("expected_preserved") == cls.get("expected_preserved"), f"{row['id']}: preserved expectation is L4 class projection")
        check(case.get("execution_state") == "not_executed", f"{row['id']}: no execution claim")
        condition = case.get("condition")
        check(isinstance(condition, str) and condition.strip(), f"{row['id']}: nonempty case condition")
        if isinstance(condition, str):
            conditions.append(condition)

        reqrefs = row.get("requirement_refs", [])
        for reqref in reqrefs:
            req = l3_by_id.get(reqref)
            check(req is not None, f"{row['id']}: L3 requirement resolves {reqref}")
            if req:
                l3_seen.add(reqref)
                oracle_ref = req.get("oracle_ref")
                check(oracle_ref in l10_by_id, f"{row['id']}: L10 oracle resolves {oracle_ref}")
                l10_seen.add(oracle_ref)

        if is_new:
            check(condition == row.get("condition"), f"{row['id']}: new system condition is preserved from L9 source")
            check(row.get("expected") == cls.get("expected"), f"{row['id']}: original 50-row expected matches L4")
            check(row.get("expected_preserved") == cls.get("expected_preserved"), f"{row['id']}: original 50-row preservation matches L4")
            oracle_condition = row["expected"]["condition"]
            oracle_codes = row["expected"]["finding_codes"]
        else:
            try:
                derived, facts = derive_legacy_condition(row)
                check(condition == derived, f"{row['id']}: old condition is independently derived from its L9 source input")
            except Exception as exc:
                input_conflicts.append({"case_id": row["id"], "reason": str(exc)})
                continue
            observation = row.get("expected_observation", {})
            oracle_condition = observation.get("condition")
            oracle_codes = [finding.get("code") for finding in observation.get("findings", [])]
            l4_expected = cls.get("expected", {})
            if oracle_condition != l4_expected.get("condition") or oracle_codes != l4_expected.get("finding_codes"):
                oracle_mismatches.append({"case_id": row["id"], "l9_condition": oracle_condition, "l9_finding_codes": oracle_codes, "l4_expected": l4_expected})
            check(oracle_condition == l4_expected.get("condition") and oracle_codes == l4_expected.get("finding_codes"), f"{row['id']}: source L9 system oracle agrees with L4 class")

        compact = case.get("compact_whole_observation")
        if not isinstance(compact, dict):
            compact_mismatches.append({"case_id": row["id"], "reason": "compact_whole_observation_missing"})
        else:
            findings = compact.get("ordered_findings")
            expected_codes = cls.get("expected", {}).get("finding_codes")
            compact_codes = [f.get("code") for f in findings] if isinstance(findings, list) else None
            compact_owners = {f.get("return_owner") for f in findings if isinstance(f, dict)} if isinstance(findings, list) else set()
            if compact.get("condition") != cls.get("expected", {}).get("condition") or compact_codes != expected_codes or compact_owners != {cls.get("backflow_owner")}:
                compact_mismatches.append({"case_id": row["id"], "reason": "compact observation differs from L4 class"})
            check(compact.get("condition") == cls.get("expected", {}).get("condition") and compact_codes == expected_codes and compact_owners == {cls.get("backflow_owner")}, f"{row['id']}: compact system observation agrees with L4 class")

        check("source_pointers" not in case, f"{row['id']}: case does not duplicate source pointers")
        assignment = row.get("negative_class_assignment", {})
        nested_pointers = row.get("source_pointers") or assignment.get("source_pointers", [])
        class_pointers = cls.get("source_pointers", [])
        if not isinstance(nested_pointers, list) or not nested_pointers:
            source_pointer_failures.append({"case_id": row["id"], "source": "nested row source pointers missing", "kind": "nested"})
            failures.append(f"{row['id']}: nested row source pointers are missing")
            nested_pointers = []
        if not isinstance(class_pointers, list) or not class_pointers:
            source_pointer_failures.append({"case_id": row["id"], "source": "L4 class source pointers missing", "kind": "class"})
            failures.append(f"{row['id']}: L4 class source pointers are missing")
            class_pointers = []
        for kind, pointers in (("nested", nested_pointers), ("L4_class", class_pointers)):
            for source in pointers:
                try:
                    target = load(source["path"])
                    resolve_pointer(target, source["pointer"])
                except Exception as exc:
                    source_pointer_failures.append({"case_id": row["id"], "source": source, "kind": kind, "reason": str(exc)})
                    failures.append(f"{row['id']}: unresolved {kind} source pointer {source}")
        source_paths = {source.get("path", "") for source in nested_pointers + class_pointers if isinstance(source, dict)}
        required_paths = {L3, L10, L4}
        missing_layers = sorted(required_paths - source_paths)
        l8_sources = sorted(path for path in source_paths if "/L8-" in path)
        if missing_layers or l8_sources:
            source_layer_failures.append({"case_id": row["id"], "missing_required_layers": missing_layers, "forbidden_l8_sources": l8_sources})
        check(not missing_layers and not l8_sources, f"{row['id']}: nested row/class refs retain L3/L10/L4 basis without L8 derivation pointer")

    check(len(old98) == 98 and len(new50) == 50, "casewise inventory preserves 98 prior and 50 added L9 rows with the current stable ID scheme")
    check(len(set(conditions)) == 148, "all 148 case condition values are unique")
    check(not input_conflicts, "no L9 counterexample contradicts its L3/L10/L4-derived class")
    check(not oracle_mismatches, "all old L9 system oracles agree with L4 class expectations")
    check(not compact_mismatches, "all 148 compact system observations resolve to the L4 class")
    check(not source_pointer_failures, "all source pointers resolve")
    check(not source_layer_failures, "all nested rows/classes retain L3/L10/L4 source basis and no L8 source")

    candidate_comparison = None
    if args.candidate_l8:
        candidate_l8 = load(args.candidate_l8)
        candidate_rows = candidate_l8.get("unit_cases", [])
        by_ref = {row.get("integration_case_ref"): row for row in candidate_rows}
        candidate_duplicates = len(by_ref) != len(candidate_rows)
        comparison = []
        for case_id, case in case_by_id.items():
            l8row = by_ref.get(case_id)
            if not l8row:
                comparison.append({"case_id": case_id, "status": "unmapped_l8"})
                continue
            comparison.append({
                "case_id": case_id,
                "l8_case_id": l8row.get("case_id"),
                "condition_equal": l8row.get("condition", l8row.get("change")) == case.get("condition"),
                "expected_equal": l8row.get("expected") == case.get("expected"),
                "expected_preserved_equal": l8row.get("expected_preserved") == case.get("expected_preserved"),
                "l8_condition": l8row.get("condition", l8row.get("change")),
                "l9_condition": case.get("condition"),
            })
        candidate_comparison = {
            "candidate_revision": args.candidate_revision,
            "candidate_path": str(args.candidate_l8),
            "candidate_case_count": len(candidate_rows),
            "unique_integration_refs": len(by_ref),
            "duplicate_integration_refs": candidate_duplicates,
            "paired_case_count": sum(row.get("status") != "unmapped_l8" for row in comparison),
            "condition_equal_count": sum(row.get("condition_equal") is True for row in comparison),
            "expected_equal_count": sum(row.get("expected_equal") is True for row in comparison),
            "expected_preserved_equal_count": sum(row.get("expected_preserved_equal") is True for row in comparison),
            "condition_mismatch_ids": [row["case_id"] for row in comparison if row.get("condition_equal") is False],
            "expected_mismatch_ids": [row["case_id"] for row in comparison if row.get("expected_equal") is False],
            "expected_preserved_mismatch_ids": [row["case_id"] for row in comparison if row.get("expected_preserved_equal") is False],
            "unmapped_l9_ids": [row["case_id"] for row in comparison if row.get("status") == "unmapped_l8"],
            "per_case": comparison,
            "oracle_source": "L8 is read only as a post-derivation comparison target; no L8 condition or expected value is used to generate L9 rows.",
        }

    report = {
        "schema": "wr258-l4l9-casewise-validation.v1",
        "evidence_kind": "scaffold",
        "authority_effect": "none",
        "source": {"base_revision": BASE, "l4_sha256": sha(L4), "l9_sha256": sha(L9), "l3_sha256": sha(L3), "l10_sha256": sha(L10), "qa_sha256": sha(QA)},
        "static_validation": {"passed": not failures, "failure_count": len(failures), "failures": failures, "integration_case_count": len(cases) if isinstance(cases, list) else 0, "existing_98": len(old98), "added_50": len(new50), "class_rows": {"L4": len(l4_rows), "L9": len(l9.get("negative_equivalence_classes", []))}, "unique_condition_count": len(set(conditions)), "source_input_conflict_count": len(input_conflicts), "system_oracle_mismatch_count": len(oracle_mismatches), "compact_observation_mismatch_count": len(compact_mismatches), "unresolved_source_pointer_count": len(source_pointer_failures), "source_layer_failure_count": len(source_layer_failures), "l3_requirement_ids": sorted(l3_seen), "l10_oracle_ids": sorted(l10_seen)},
        "source_input_conflicts": input_conflicts,
        "l9_system_oracle_mismatches": oracle_mismatches,
        "compact_observation_mismatches": compact_mismatches,
        "source_pointer_failures": source_pointer_failures,
        "source_layer_failures": source_layer_failures,
        "candidate_comparison": candidate_comparison,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
