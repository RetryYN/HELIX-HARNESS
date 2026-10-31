#!/usr/bin/env python3
"""WR258 L4/L9 casewise supplement: read-only source and candidate audit."""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import subprocess
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = "0e218828fbb3b487eff1469cd57ead8e3dfa7b67"
L3 = "docs/helix-security/L3-requirements/functional-requirements.json"
L10 = "docs/helix-security/L10-verification/functional-verification.json"
L4 = "docs/helix-security/L4-basic-design/project-scope-isolation.json"
L5 = "docs/helix-security/L5-detail-design/project-scope-isolation.json"
L8 = "docs/helix-security/L8-unit-verification/project-scope-isolation.json"
L9 = "docs/helix-security/L9-integration-verification/project-scope-isolation.json"
QA = "docs/governance/design-verification-quality-assurance.md"
HISTORICAL_ORACLE_PREFIX = "SEC003-WR258-L9-ORACLE-"
CURRENT_ORACLE_PREFIX = "SEC003-L9-ORACLE-"
CLASS_MIGRATIONS = {
    **{f"SEC003-L9-ORACLE-{n:03}": "SEC003-F01-SCOPE-IDENTITY-CONFLICT" for n in (2, 4, 6, 8, 10, 12)},
    **{f"SEC003-L9-ORACLE-{n:03}": "SEC003-F02-CONNECTION-SCOPE-CONFLICT" for n in (36, 37)},
}
CLASS_EXPECTATIONS = {
    "SEC003-F01-SCOPE-IDENTITY-CONFLICT": {
        "axis": "scope_identity",
        "finding_code": "scope_identity_conflict",
        "source_class": "SEC003-F01-IDENTITY-CONFLICT",
    },
    "SEC003-F02-CONNECTION-SCOPE-CONFLICT": {
        "axis": "explicit_connection",
        "finding_code": "connection_scope_conflict",
        "source_class": "SEC003-F02-CONNECTION-MATERIAL-CONFLICT",
    },
}
ORACLE_048_CONDITION = 'request.operation="read"かつconnection.allowed_operations=["read",null]であり、不正itemを捨てて読取許可として扱わない。'
ASSET_IDENTITY_CONDITION = "asset_scopeの既知identity値が、expected_targetの同じidentity軸にある既知値と相反し、当該資産のscope対応を成立させない。"
CONNECTION_MATERIAL_CONDITION = "実connection memberが独立expected connectionの同じmemberと既知値で相反する。"


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

    if class_id in ("SEC003-F01-IDENTITY-CONFLICT", "SEC003-F01-SCOPE-IDENTITY-CONFLICT"):
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

    if class_id in ("SEC003-F02-CONNECTION-MATERIAL-CONFLICT", "SEC003-F02-CONNECTION-SCOPE-CONFLICT"):
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
    l5, l8 = load(L5), load(L8)
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

    original_classes = {row["class_id"]: row for row in original_l4["failure_classifications"]}
    current_classes = {row["class_id"]: row for row in l4["failure_classifications"]}
    expected_class_ids = set(original_classes) | set(CLASS_EXPECTATIONS)
    check(set(current_classes) == expected_class_ids and len(l4["failure_classifications"]) == 17, "L4 adds only the two scope-conflict classes")
    expected_original_classes = copy.deepcopy(original_classes)
    expected_original_classes["SEC003-F01-IDENTITY-CONFLICT"]["condition"] = ASSET_IDENTITY_CONDITION
    check(all(current_classes.get(cid) == row for cid, row in expected_original_classes.items()),
          "the original 15 L4 classes retain keys/expectations; only the asset identity-conflict wording is narrowed")
    asset_identity_class = current_classes.get("SEC003-F01-IDENTITY-CONFLICT", {})
    check(asset_identity_class.get("condition") == ASSET_IDENTITY_CONDITION,
          "legacy identity-conflict condition names asset_scope and expected_target explicitly")
    side_identity_class = current_classes.get("SEC003-F01-SCOPE-IDENTITY-CONFLICT", {})
    check("asset_scope" not in side_identity_class.get("condition", "") and "expected_target" not in side_identity_class.get("condition", ""),
          "request-side identity conflicts remain distinct from asset-scope comparison")
    for class_id, details in CLASS_EXPECTATIONS.items():
        cls = current_classes.get(class_id, {})
        check(cls.get("expected_axis") == details["axis"], f"{class_id}: axis is explicit")
        check(cls.get("expected", {}).get("finding_codes") == [details["finding_code"]], f"{class_id}: L4 expected code matches the distinct scope finding")
        check(cls.get("expected_classification") == "isolation_violation" and cls.get("expected_state") == "violation", f"{class_id}: classification and state are violation")
        check(cls.get("side_effect_count") == 0 and cls.get("backflow_owner") == "scope-binding-owner", f"{class_id}: owner and effect projection are complete")
        check(cls.get("source_pointers") and all(source.get("path") in (L3, L10, L4) for source in cls.get("source_pointers", [])), f"{class_id}: sources stay within L3/L10/L4")
    l5_functions = {row.get("id"): row for row in l5.get("functions", [])}
    expected_l8_codes = {
        **{f"SEC003-L8-SIDE-CONFLICT-{axis}": "scope_identity_conflict" for axis in ("PROJECT", "TENANT", "ENVIRONMENT", "ASSIGNMENT", "WORKTREE", "REVISION")},
        "SEC003-L8-CONNECTION-JOIN-ORIGIN": "connection_scope_conflict",
        "SEC003-L8-CONNECTION-JOIN-TARGET": "connection_scope_conflict",
    }
    l8_cases_by_id = {row.get("id"): row for group in l8.get("cases", []) for row in group.get("negative_cases", [])}
    direct_case_failures = []
    for case_id, finding_code in expected_l8_codes.items():
        row = l8_cases_by_id.get(case_id, {})
        findings = row.get("expected_result", {}).get("findings", [])
        codes = [finding.get("code") for finding in findings]
        expected_function = "HELIXSECURITY-L5-003-compare_scope_side" if case_id.startswith("SEC003-L8-SIDE-CONFLICT-") else "HELIXSECURITY-L5-003-compare_connection_content"
        if row.get("function_ref") != expected_function or codes != [finding_code]:
            direct_case_failures.append({"case_id": case_id, "function_ref": row.get("function_ref"), "finding_codes": codes, "expected_function": expected_function, "expected_finding_code": finding_code})
    side_function = l5_functions.get("HELIXSECURITY-L5-003-compare_scope_side", {})
    connection_function = l5_functions.get("HELIXSECURITY-L5-003-compare_connection_content", {})
    compose_function = l5_functions.get("HELIXSECURITY-L5-003-compose_scope_proposal", {})
    check("known差はscope_identity_conflict" in " ".join(side_function.get("pure_algorithm", [])), "L5 compare_scope_side declares the scope-identity conflict code")
    check("known差はconnection_scope_conflict" in " ".join(connection_function.get("pure_algorithm", [])), "L5 compare_connection_content declares the connection-scope conflict code")
    check("全findingを保持" in " ".join(compose_function.get("pure_algorithm", [])), "L5 compose_scope_proposal preserves part findings")
    check(not direct_case_failures and len(expected_l8_codes) == 8, "eight L8 original local cases map to their corresponding L5 function findings")
    residual_conflicts = []
    for row in l9.get("multi_contract_residual", {}).get("negative_cases", []):
        codes = [finding.get("code") for finding in row.get("expected_observation", {}).get("findings", [])]
        if "scope_identity_conflict" in codes and "connection_scope_conflict" in codes:
            residual_conflicts.append(row.get("id"))
    check(len(residual_conflicts) == 12, "twelve L9 multi-contract residual cases already preserve both distinct conflict findings")
    for index, original_contract in enumerate(original_l4["contracts"]):
        current_contract = copy.deepcopy(l4["contracts"][index])
        current_contract["negative_classifications"] = [row for row in current_contract["negative_classifications"] if row.get("code") not in {"SEC003_F01_SCOPE_IDENTITY_CONFLICT", "SEC003_F02_CONNECTION_SCOPE_CONFLICT"}]
        current_contract["negative_class_refs"] = [ref for ref in current_contract["negative_class_refs"] if ref not in CLASS_EXPECTATIONS]
        expected_contract = copy.deepcopy(original_contract)
        if index == 0:
            old_class = next(row for row in expected_contract["negative_classifications"] if row.get("code") == "SEC003_F01_IDENTITY_CONFLICT")
            old_change = old_class["change"]
            old_class["change"] = ASSET_IDENTITY_CONDITION
            old_class["expected_text"] = old_class["expected_text"].replace(old_change, ASSET_IDENTITY_CONDITION, 1)
            current_class = next(row for row in current_contract["negative_classifications"] if row.get("code") == "SEC003_F01_IDENTITY_CONFLICT")
            check(current_class.get("expected") == old_class.get("expected"), "asset class contract key/expected remain unchanged")
        if index == 1:
            material_class = next(row for row in current_contract["negative_classifications"] if row.get("code") == "SEC003_F02_CONNECTION_MATERIAL_CONFLICT")
            text = material_class.get("change", "")
            check(all(term in text for term in ("connection member", "expected connection", "同じmember")),
                  "connection-material class wording identifies same-member content comparison")
        check(current_contract == expected_contract, f"L4 contract {index} changes only by scoped asset wording and added scope-conflict classification/ref")
    l4_other = copy.deepcopy(l4)
    original_l4_other = copy.deepcopy(original_l4)
    for doc in (l4_other, original_l4_other):
        del doc["failure_classifications"]
        del doc["contracts"]
    check(l4_other == original_l4_other, "all other L4 content remains unchanged")
    original_rows = {row["id"]: row for group in original_l9["cases"] for row in group["negative_cases"]}
    current_rows = {row["id"]: row for group in l9["cases"] for row in group["negative_cases"]}
    asset_identity_rows = [row for row in current_rows.values() if row.get("negative_class_ref") == "SEC003-F01-IDENTITY-CONFLICT"]
    check(len(asset_identity_rows) == 54, "54 existing identity-conflict rows retain the asset-scope class")
    asset_input_mismatches = []
    for row in asset_identity_rows:
        request = row.get("counterexample", {}).get("request", {})
        context = row.get("counterexample", {}).get("context", {})
        findings = row.get("expected_observation", {}).get("findings", [])
        pointer = findings[0].get("pointer", "") if findings else ""
        axis = pointer.rsplit("/", 1)[-1]
        actual = request.get("asset_scope", {}).get(axis)
        expected = context.get("expected_target", {}).get(axis)
        if isinstance(row.get("counterexample"), dict):
            matches_asset_scope = (
                "asset_scope" in request
                and axis in request.get("asset_scope", {})
                and axis in context.get("expected_target", {})
                and isinstance(actual, str)
                and isinstance(expected, str)
                and actual != expected
            )
        else:
            # Six system-oracle rows are abstract source-derived contracts, not fixtures.
            # Their own condition names the compared asset_scope axis and expected target.
            condition = row.get("condition", "")
            condition_axis = condition.split("asset_scope.", 1)[1].split("が", 1)[0] if "asset_scope." in condition else ""
            matches_asset_scope = (
                bool(condition_axis)
                and "比較対象のexpected targetと不一致" in condition
                and "state assetのscopeを別軸から補完しない" in condition
            )
        if not matches_asset_scope:
            asset_input_mismatches.append(row["id"])
    check(not asset_input_mismatches, "all 54 retained class-0 rows have an asset_scope/expected_target comparison: 48 concrete cases and six abstract source-derived system oracles")
    material_class = current_classes.get("SEC003-F02-CONNECTION-MATERIAL-CONFLICT", {})
    material_text = material_class.get("condition", "")
    check(all(term in material_text for term in ("connection", "expected connection", "同じmember")),
          "connection-material class remains a same-member connection-content comparison")
    expected_rows = {}
    class_indexes = {row["class_id"]: i for i, row in enumerate(l4["failure_classifications"])}
    for old_id, old_row in original_rows.items():
        new_id = old_id.replace(HISTORICAL_ORACLE_PREFIX, CURRENT_ORACLE_PREFIX, 1) if old_id.startswith(HISTORICAL_ORACLE_PREFIX) else old_id
        expected_row = dict(old_row)
        expected_row["id"] = new_id
        new_class = CLASS_MIGRATIONS.get(new_id)
        if new_class:
            cls = current_classes[new_class]
            expected_row["negative_class_ref"] = new_class
            expected_row["expected_classification"] = cls["expected_classification"]
            expected_row["expected"] = cls["expected"]
            expected_row["expected_preserved"] = cls["expected_preserved"]
            expected_row["expected_axis"] = cls["expected_axis"]
            expected_row["expected_state"] = cls["expected_state"]
            expected_row["side_effect_count"] = cls["side_effect_count"]
            expected_row["source_pointers"] = [
                dict(source, pointer=(f"/failure_classifications/{class_indexes[new_class]}" if source.get("pointer", "").startswith("/failure_classifications/") else source["pointer"]))
                for source in expected_row.get("source_pointers", [])
            ]
        if new_id == "SEC003-L9-ORACLE-048":
            expected_row["condition"] = ORACLE_048_CONDITION
        expected_rows[new_id] = expected_row
    check(current_rows == expected_rows, "148 nested L9 rows are preserved except stable-ID renames and the eight reviewed class projections plus ORACLE-048 condition")
    check(not any(row_id.startswith(HISTORICAL_ORACLE_PREFIX) for row_id in current_rows), "no work-qualified oracle ID remains in canonical L9")
    check(l9["multi_contract_residual"] == original_l9["multi_contract_residual"], "L9 multi_contract_residual remains unchanged")
    check(len(class_by_id) == 17 and len(l9.get("negative_equivalence_classes", [])) == 17, "L4/L9 each have 17 class rows after two distinct scope-conflict classes")
    check(l4.get("negative_equivalence_classes") == {"source_rows": "failure_classifications"}, "L4 explicit source marker is retained")
    l9_marker = l9.get("negative_equivalence_classes")
    l9_marker_by_id = {row.get("class_id"): row for row in l9_marker if isinstance(row, dict)} if isinstance(l9_marker, list) else {}
    l4_core = {row["class_id"]: {key: row.get(key) for key in ("expected_classification", "expected", "expected_axis", "expected_state", "backflow_owner", "side_effect_count")} for row in l4_rows}
    l9_marker_matches = len(l9_marker_by_id) == 17 and set(l9_marker_by_id) == set(l4_core)
    if l9_marker_matches:
        l9_marker_matches = all({key: l9_marker_by_id[cid].get(key) for key in l4_core[cid]} == l4_core[cid] for cid in l4_core)
    check(l9_marker_matches, "L9 explicit source marker has the same 17 class rows and class keys as L4")
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
        "static_validation": {"passed": not failures, "failure_count": len(failures), "failures": failures, "integration_case_count": len(cases) if isinstance(cases, list) else 0, "existing_98": len(old98), "added_50": len(new50), "class_rows": {"L4": len(l4_rows), "L9": len(l9.get("negative_equivalence_classes", []))}, "unique_condition_count": len(set(conditions)), "source_input_conflict_count": len(input_conflicts), "system_oracle_mismatch_count": len(oracle_mismatches), "compact_observation_mismatch_count": len(compact_mismatches), "unresolved_source_pointer_count": len(source_pointer_failures), "source_layer_failure_count": len(source_layer_failures), "l3_requirement_ids": sorted(l3_seen), "l10_oracle_ids": sorted(l10_seen), "direct_case_audit": {"l8_case_count": len(expected_l8_codes), "l8_case_mismatches": direct_case_failures, "l9_multi_contract_conflict_count": len(residual_conflicts), "l9_multi_contract_conflict_ids": residual_conflicts, "class0_asset_identity_rows": len(asset_identity_rows), "class0_asset_input_mismatches": asset_input_mismatches, "connection_material_same_member_wording": all(term in material_text for term in ("connection", "expected connection", "同じmember")), "reviewed_l5_functions": ["HELIXSECURITY-L5-003-compare_scope_side", "HELIXSECURITY-L5-003-compare_connection_content", "HELIXSECURITY-L5-003-compose_scope_proposal"]}},
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
