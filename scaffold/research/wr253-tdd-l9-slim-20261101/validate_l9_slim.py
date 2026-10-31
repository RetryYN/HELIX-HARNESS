#!/usr/bin/env python3
"""WR253 R1 static check for L9's compact contract and oracle allowlist."""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "scaffold/research/wr253-tdd-l8-slim-20261031"))
import validate_uid_table  # noqa: E402

L9 = "docs/helix-harness/L9-integration-verification/tdd-development-flow.json"
L4 = "docs/helix-harness/L4-basic-design/tdd-development-flow.json"
PRE_REMOVAL = "22f14f1866948783a81a7eb665dc3d5da7d97daa"
HASH_REMOVAL_BASE = "6c1ceb0172c0dcb95b843739bee2c15905dd735f"
CURRENT_PRE_REMOVAL_SHA256 = "805ab74d9792775616e10af7b3da92a8be13002f66180e2a1862de17dbd597d3"
ALLOWED_ROOT = {
    "parent", "status", "authority_effect", "source_main", "authority_boundary", "scope",
    "document_id", "layer", "paired_document", "purpose", "verification_boundary", "source_pins",
    "execution_boundary", "cases", "completion", "removed_materials",
}
FORBIDDEN_KEYS = {
    "source_packet", "normal_fixture", "original", "fixture_preparation", "mutation",
    "original_l10", "expected_partial_material", "original_bytes_utf8",
    "owner_material", "raw_utf8", "byte_sha256", "source_change", "normal_variants",
}
NORMAL_ROW_KEYS = {
    "id", "oracle_number", "kind", "requirement_ref", "system_oracle_ref", "property",
    "expected_observation", "execution_state", "expected_contract_observation",
}
NEGATIVE_ROW_KEYS = {
    "id", "oracle_number", "kind", "requirement_ref", "system_oracle_ref", "property",
    "expected_observation", "execution_state", "code", "code_status", "condition", "expected_axis",
    "expected_state", "backflow_owner", "expected_side_effect_count", "non_target_preserved",
    "failure_code_status", "axis_selection_status", "expected_non_generation", "expected_non_generation_status",
}


def read_json(path: str) -> dict:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def git_json(revision: str, path: str) -> dict:
    return json.loads(subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT))


def walk(node):
    if isinstance(node, dict):
        yield node
        for value in node.values():
            yield from walk(value)
    elif isinstance(node, list):
        for value in node:
            yield from walk(value)


def main() -> int:
    current = read_json(L9)
    l4 = read_json(L4)
    historical_raw = subprocess.check_output(["git", "show", f"{PRE_REMOVAL}:{L9}"], cwd=ROOT)
    historical = json.loads(historical_raw)
    checks = {}

    checks["fixed_pre_removal_revision_matches_recorded_hash"] = (
        PRE_REMOVAL == current.get("removed_materials", {}).get("git_commit")
        and hashlib.sha256(historical_raw).hexdigest() == CURRENT_PRE_REMOVAL_SHA256
    )
    l4_at_fixed_revision = subprocess.check_output(["git", "show", f"{PRE_REMOVAL}:{L4}"], cwd=ROOT)
    l4_pin = current.get("source_pins", [{}])[0]
    checks["L4_contract_source_is_fixed_to_pre_removal_bytes"] = (
        current.get("source_pins") == [{"path": L4, "revision": PRE_REMOVAL, "sha256": hashlib.sha256(l4_at_fixed_revision).hexdigest()}]
        and l4_pin.get("sha256") == hashlib.sha256((ROOT / L4).read_bytes()).hexdigest()
    )
    checks["root_and_branch_are_allowlisted"] = (
        set(current) == ALLOWED_ROOT
        and len(current.get("cases", [])) == 5
        and all(set(case) == {"id", "design_ref", "l4_contract_ref", "requirement_ref", "system_oracle_ref", "contract", "expected_material", "normal_cases", "normal_variant_oracles", "negative_cases"} for case in current.get("cases", []))
    )
    checks["execution_material_keys_are_absent"] = not any(FORBIDDEN_KEYS.intersection(node) for node in walk(current))
    record = current.get("removed_materials", {})
    checks["removed_materials_has_exact_six_fields_and_DT_VT_105_boundary"] = (
        set(record) == {"decision_ref", "git_commit", "path", "meaning", "removed_key_rule", "use_boundary"}
        and record.get("git_commit") == PRE_REMOVAL
        and record.get("path") == L9
        and "DT-VT-105" in record.get("use_boundary", "")
        and "prohibited" in current.get("execution_boundary", {}).get("legacy_runtime_test_ci_algorithm", "")
    )
    checks["fixed_l4_branch_contracts_resolve_and_match"] = True
    checks["all_37_numbered_system_oracles_have_expected_semantics"] = True
    checks["five_normal_two_variant_thirty_negative_split"] = True
    ids = []
    expected_number = 1
    old_l9_cases = {row["id"]: row for row in historical["cases"]}
    for index, branch in enumerate(current["cases"]):
        old_branch = old_l9_cases.get(branch["id"], {})
        l4_branch = l4["contracts"][index]
        checks["fixed_l4_branch_contracts_resolve_and_match"] &= (
            branch["l4_contract_ref"] == f"{L4}#/contracts/{index}"
            and branch["design_ref"] == l4_branch["id"]
            and branch["requirement_ref"] == l4_branch["requirement_ref"]
            and branch["system_oracle_ref"] == l4_branch["system_oracle_ref"]
            and branch["contract"].get("title") == l4_branch["title"]
            and branch["contract"].get("behavior") == l4_branch["behavior"]
            and branch["contract"].get("output_contract") == l4_branch["output_contract"]
            and branch["contract"].get("failure_conditions") == l4_branch["failure_conditions"]
            and branch["contract"].get("effect") == l4_branch["effect"]
            and branch.get("expected_material") == branch["normal_cases"][0].get("expected_contract_observation")
            and old_branch.get("requirement_ref") == branch["requirement_ref"]
        )
        for kind in ("normal_cases", "normal_variant_oracles", "negative_cases"):
            checks["five_normal_two_variant_thirty_negative_split"] &= isinstance(branch.get(kind), list)
        for kind, rows in (("normal_cases", branch["normal_cases"]), ("normal_variant_oracles", branch["normal_variant_oracles"]), ("negative_cases", branch["negative_cases"])):
            historical_kind = "normal_variants" if kind == "normal_variant_oracles" else kind
            old_count = 1 if kind == "normal_cases" and old_branch.get("normal_fixture") else len(old_branch.get(historical_kind, []))
            checks["five_normal_two_variant_thirty_negative_split"] &= len(rows) == old_count
            for row_index, row in enumerate(rows):
                ids.append(row.get("id"))
                checks["five_normal_two_variant_thirty_negative_split"] &= row.get("kind") == {"normal_cases": "normal", "normal_variant_oracles": "normal_variant", "negative_cases": "negative"}[kind]
                checks["five_normal_two_variant_thirty_negative_split"] &= row.get("oracle_number") == f"L9-SYSTEM-ORACLE-{expected_number:02d}"
                checks["all_37_numbered_system_oracles_have_expected_semantics"] &= (
                    row.get("requirement_ref") == branch["requirement_ref"]
                    and row.get("system_oracle_ref") == branch["system_oracle_ref"]
                    and row.get("execution_state") == "not_executed"
                    and isinstance(row.get("property"), str) and bool(row["property"])
                    and isinstance(row.get("expected_observation"), str) and bool(row["expected_observation"])
                )
                allowed_row_keys = NEGATIVE_ROW_KEYS if kind == "negative_cases" else NORMAL_ROW_KEYS
                checks["all_37_numbered_system_oracles_have_expected_semantics"] &= set(row) <= allowed_row_keys
                audited = validate_uid_table.COMPACT_MEANING_AUDIT.get(row.get("id"))
                if audited:
                    checks["all_37_numbered_system_oracles_have_expected_semantics"] &= (
                        row.get("property") == audited["counterexample"]
                        and row.get("expected_observation") == audited["expected"]
                    )
                elif row.get("id") and row["id"].startswith("WR231-F01-"):
                    old_negative = next((n for n in old_branch["negative_cases"] if n.get("id") == row["id"]), {})
                    checks["all_37_numbered_system_oracles_have_expected_semantics"] &= (
                        row.get("property") == old_negative.get("condition")
                        and row.get("expected_observation") == old_negative.get("expected_issue")
                    )
                else:
                    checks["all_37_numbered_system_oracles_have_expected_semantics"] = False
                if row.get("kind") == "negative":
                    checks["all_37_numbered_system_oracles_have_expected_semantics"] &= all(
                        isinstance(row.get(key), str) and bool(row[key])
                        for key in ("condition", "expected_axis", "expected_state", "backflow_owner", "non_target_preserved")
                    ) and (isinstance(row.get("code"), str) and bool(row["code"]) or row.get("code_status") == "unknown" and row.get("failure_code_status") == "unknown") and row.get("expected_side_effect_count") == 0
                    if row.get("id", "").startswith("WR231-F01-"):
                        old_negative = next((n for n in old_branch["negative_cases"] if n.get("id") == row["id"]), {})
                        classification = next((n for n in l4_branch.get("negative_classifications", []) if n.get("id") == row["id"]), {})
                        historical_non_target = old_negative.get("non_target_preserved")
                    else:
                        old_negative = next((n for n in old_branch["negative_cases"] if n.get("code") == row.get("code")), {})
                        classification = next((n for n in l4_branch.get("negative_classifications", []) if n.get("code") == row.get("code")), {})
                        historical_non_target = old_negative.get("non_target_preserved")
                    if isinstance(historical_non_target, dict):
                        binding = historical_non_target.get("binding", {})
                        scope = binding.get("scope", {})
                        historical_non_target = f"{binding.get('identity')}@{binding.get('revision')} ({scope.get('project')}) remains {historical_non_target.get('state')}"
                    checks["all_37_numbered_system_oracles_have_expected_semantics"] &= (
                        bool(old_negative)
                        and row.get("condition") == old_negative.get("condition") == classification.get("condition")
                        and row.get("expected_axis") == old_negative.get("expected_axis") == classification.get("expected_axis")
                        and row.get("expected_state") == old_negative.get("expected_state") == classification.get("expected_state")
                        and row.get("backflow_owner") == old_negative.get("backflow_owner") == classification.get("backflow_owner")
                        and row.get("expected_side_effect_count") == old_negative.get("expected_side_effect_count") == classification.get("expected_side_effect_count")
                        and row.get("non_target_preserved") == historical_non_target
                        and (row.get("code") == old_negative.get("code") if old_negative.get("code") else row.get("code") is None and row.get("code_status") == row.get("failure_code_status") == old_negative.get("failure_code_status") == "unknown")
                    )
                else:
                    historical_normal = old_branch.get("expected_material") if kind == "normal_cases" else old_branch.get("normal_variants", [])[row_index].get("expected_material")
                    checks["all_37_numbered_system_oracles_have_expected_semantics"] &= row.get("expected_contract_observation") == historical_normal
                expected_number += 1
    checks["five_normal_two_variant_thirty_negative_split"] &= (
        sum(len(c["normal_cases"]) for c in current["cases"]) == 5
        and sum(len(c["normal_variant_oracles"]) for c in current["cases"]) == 2
        and sum(len(c["negative_cases"]) for c in current["cases"]) == 30
        and len(ids) == 37 and len(set(ids)) == 37
    )
    checks["candidate_unit_design_values_are_unchanged"] = validate_uid_table.candidate_designs_unchanged()
    print(json.dumps({"schema": "wr253-l9-r1-allowlist-validation.v1", "evidence_kind": "scaffold", "authority_effect": "none", "checks": checks, "passed": all(checks.values()), "historical": {"revision": PRE_REMOVAL, "sha256": hashlib.sha256(historical_raw).hexdigest()}, "current_l9_bytes": len((ROOT / L9).read_bytes()), "not_run": ["legacy runtime", "legacy tests", "legacy CI", "algorithm", "product tests"]}, ensure_ascii=False, indent=2))
    return 0 if all(checks.values()) else 1


if __name__ == "__main__":
    raise SystemExit(main())
