#!/usr/bin/env python3
"""Static WR242 source/case crosswalk; does not run layer algorithms."""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
BASE = "dd07a3498be74f32519adf42a221caf51e547ea1"
EXPECTED_BLIND_SHA = "5e69cd0c3c472090947fec9454d892ffa2caa24ed0aa2a1b2540f7d9c18f408b"
BLIND_PATH = HERE / "blind-source-only.json"
L4_PATH = "docs/helix-harness/L4-basic-design/semantic-asset-lineage.json"
L5_PATH = "docs/helix-harness/L5-detail-design/semantic-asset-lineage.json"
L8_PATH = "docs/helix-harness/L8-unit-verification/semantic-asset-lineage.json"
L9_PATH = "docs/helix-harness/L9-integration-verification/semantic-asset-lineage.json"
QA_PATH = "docs/governance/design-verification-quality-assurance.md"


def read_json(path: str | Path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical_value_hash(value) -> str:
    raw = json.dumps(
        value, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")
    return sha256(raw)


def git_source(revision: str, path: str) -> bytes:
    return subprocess.run(
        ["git", "show", f"{revision}:{path}"],
        cwd=ROOT,
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    ).stdout


def pointer_value(value, pointer: str):
    current = value
    if pointer in ("", "/"):
        return current
    for token in pointer.lstrip("/").split("/"):
        token = token.replace("~1", "/").replace("~0", "~")
        current = current[int(token)] if isinstance(current, list) else current[token]
    return current


def l4_contract_index(design_ref: str) -> int:
    return {
        "HARNESS-L4-053-F01": 0,
        "HARNESS-L4-053-F02": 1,
        "HARNESS-L4-053-F03": 2,
        "HARNESS-L4-053-F04": 3,
        "HARNESS-L4-053-N01": 4,
        "HARNESS-L4-053-B01": 5,
    }[design_ref]


def main() -> None:
    blind_bytes = BLIND_PATH.read_bytes()
    blind_sha = sha256(blind_bytes)
    assert blind_sha == EXPECTED_BLIND_SHA, blind_sha
    blind = json.loads(blind_bytes)
    assert blind["source_revision"] == BASE
    assert blind["hash_verification"]["verified_leaf_count"] == 32
    assert blind["hash_verification"]["all_match"] is True

    l4 = read_json(ROOT / L4_PATH)
    l5 = read_json(ROOT / L5_PATH)
    l8 = read_json(ROOT / L8_PATH)
    l9 = read_json(ROOT / L9_PATH)
    current_hashes = {
        path: sha256((ROOT / path).read_bytes())
        for path in (L4_PATH, L5_PATH, L8_PATH, L9_PATH, QA_PATH)
    }
    for path in (L4_PATH, L5_PATH, L8_PATH, L9_PATH, QA_PATH):
        assert (ROOT / path).read_bytes() == git_source(BASE, path), path
    assert current_hashes[L4_PATH] == blind["source_hashes"]["l4"]
    assert current_hashes[QA_PATH] == blind["source_hashes"]["qa"]

    # Re-resolve each frozen leaf using its declared git revision, then verify
    # the exact pointer value hash and the unchanged worktree source blob.
    resolved_leaves = 0
    for leaf in blind["source_leaf_inventory"]:
        source = leaf["source"]
        assert source["revision"] == BASE
        raw = git_source(source["revision"], source["path"])
        source_hash_key = {
            L4_PATH: "l4",
            "docs/helix-harness/L3-requirements/functional-requirements.json": "l3f",
            "docs/helix-harness/L3-requirements/business-requirements.json": "l3b",
            "docs/helix-harness/L10-verification/functional-verification.json": "l10f",
            "docs/helix-harness/L10-verification/business-verification.json": "l10b",
        }[source["path"]]
        assert sha256(raw) == blind["source_hashes"][source_hash_key]
        source_doc = json.loads(raw) if source["path"].endswith(".json") else None
        assert source_doc is not None
        assert canonical_value_hash(pointer_value(source_doc, source["pointer"])) == source["value_sha256"]
        assert (ROOT / source["path"]).read_bytes() == raw
        resolved_leaves += 1
    assert resolved_leaves == 32

    candidate_by_id = {x["candidate_id"]: x for x in blind["provisional_candidates"]}
    leaf_by_id = {x["leaf_id"]: x for x in blind["source_leaf_inventory"]}
    l9_cases_by_id: dict[str, list[tuple[int, int, dict, dict]]] = {}
    for case_index, case in enumerate(l9["cases"]):
        for negative_index, negative in enumerate(case.get("negative_cases", [])):
            l9_cases_by_id.setdefault(negative["id"], []).append(
                (case_index, negative_index, case, negative)
            )
    l5_rules_by_case: dict[str, list[dict]] = {}
    for rule in l5["failure_rules"]:
        ref = rule.get("integration_negative_ref")
        if ref:
            l5_rules_by_case.setdefault(ref, []).append(rule)

    row_reports = []
    used_l9_ids = []
    code_matches = 0
    change_matches = 0
    owner_matches = 0
    axes_matches = 0
    claim_state_matches = 0
    operation_state_matches = 0
    operation_selection_matches = 0
    reference_state_matches = 0
    side_effect_matches = 0
    owner_refs_declared = 0
    for row_index, row in enumerate(l4["failure_classifications"]):
        assert len(row.get("oracle_refs", [])) == 1
        case_id = row["oracle_refs"][0]
        matches = l9_cases_by_id.get(case_id, [])
        assert len(matches) == 1, (row["code"], case_id, len(matches))
        case_index, negative_index, case, negative = matches[0]
        used_l9_ids.append(case_id)
        code_match = negative.get("expected_classification") == row.get("code")
        code_matches += int(code_match)
        condition_match = (
            len(row.get("conditions", [])) == 1
            and row["conditions"][0] == negative.get("change")
        )
        change_matches += int(condition_match)
        owner_match = row.get("backflow_owner") == negative.get("backflow_owner")
        owner_matches += int(owner_match)
        axes_match = row.get("expected_record_axes") == negative.get("expected_record_axes")
        axes_matches += int(axes_match)
        claim_match = row.get("expected_claim_state") == negative.get("expected_claim_state")
        claim_state_matches += int(claim_match)
        operation_match = row.get("expected_operation_state") == negative.get("expected_operation_state")
        operation_state_matches += int(operation_match)
        selection_match = row.get("expected_operation_selection") == negative.get("expected_operation_selection")
        operation_selection_matches += int(selection_match)
        reference_match = row.get("expected_reference_state") == negative.get("expected_reference_state")
        reference_state_matches += int(reference_match)
        side_effect_match = row.get("expected_side_effect_count") == negative.get("expected_side_effect_count")
        side_effect_matches += int(side_effect_match)

        contract_index = l4_contract_index(row["design_ref"])
        contract_leaf_ids = [
            leaf["leaf_id"]
            for leaf in blind["source_leaf_inventory"]
            if leaf["source"]["path"] == L4_PATH
            and leaf["source"]["pointer"] in (
                f"/contracts/{contract_index}/behavior",
                f"/contracts/{contract_index}/backflow",
            )
        ]
        assert len(contract_leaf_ids) == 2
        candidate_ids = sorted(
            {
                candidate_id
                for leaf_id in contract_leaf_ids
                for candidate_id in leaf_by_id[leaf_id]["candidate_groups"]
            }
        )
        candidate_source_leaf_ids = sorted(
            {
                leaf_id
                for candidate_id in candidate_ids
                for leaf_id in candidate_by_id[candidate_id]["source_leaf_refs"]
            }
        )
        rules = l5_rules_by_case.get(case_id, [])
        assert len(rules) == 1
        rule = rules[0]
        if rule.get("function_ref") or rule.get("contract_ref"):
            owner_refs_declared += 1

        row_reports.append(
            {
                "l4_row_index": row_index,
                "l4_pointer": f"/{'failure_classifications'}/{row_index}",
                "l4_code": row.get("code"),
                "l4_design_ref": row.get("design_ref"),
                "l4_source_contract_leaf_ids": contract_leaf_ids,
                "l4_oracle_refs": row.get("oracle_refs"),
                "l4_condition": row.get("conditions"),
                "l4_backflow_owner": row.get("backflow_owner"),
                "l4_expected_record_axes": row.get("expected_record_axes"),
                "l4_expected_claim_state": row.get("expected_claim_state"),
                "l9_case_id": case_id,
                "l9_case_pointer": f"/cases/{case_index}/negative_cases/{negative_index}",
                "l9_code": negative.get("expected_classification"),
                "l9_change": negative.get("change"),
                "l9_backflow_owner": negative.get("backflow_owner"),
                "l9_expected_record_axes": negative.get("expected_record_axes"),
                "l9_expected_claim_state": negative.get("expected_claim_state"),
                "l9_expected_operation_state": negative.get("expected_operation_state"),
                "l9_expected_operation_selection": negative.get("expected_operation_selection"),
                "l9_expected_reference_state": negative.get("expected_reference_state"),
                "l9_expected_side_effect_count": negative.get("expected_side_effect_count"),
                "legacy_casewise_checks": {
                    "oracle_ref_resolves_once": True,
                    "classification_code_matches": code_match,
                    "condition_equals_change": condition_match,
                    "backflow_owner_matches": owner_match,
                    "record_axes_match": axes_match,
                    "claim_state_matches": claim_match,
                    "operation_state_matches": operation_match,
                    "operation_selection_matches": selection_match,
                    "reference_state_matches": reference_match,
                    "side_effect_count_matches": side_effect_match,
                },
                "l5_rule": {
                    "id": rule.get("id"),
                    "raw_function": rule.get("function"),
                    "function_ref_declared": bool(rule.get("function_ref")),
                    "contract_ref_declared": bool(rule.get("contract_ref")),
                },
                "six_field_key_observation": {
                    "classification_code": {
                        "observed_l4_value": row.get("code"),
                        "state": "present_on_existing_l4_row",
                    },
                    "finding_codes_ordered": {
                        "observed_l4_value": None,
                        "state": "unknown_no_explicit_ordered_finding_codes_field",
                    },
                    "backflow_owner": {
                        "observed_l4_value": row.get("backflow_owner"),
                        "state": "raw_casewise_value_present; class key still unasserted",
                    },
                    "expected_axis": {
                        "observed_l4_value": row.get("expected_record_axes"),
                        "state": "multi-axis record observation; no source-only single class axis asserted",
                    },
                    "expected_state": {
                        "observed_l4_record_axes": row.get("expected_record_axes"),
                        "observed_l4_claim_state": row.get("expected_claim_state"),
                        "observed_l4_operation_state": row.get("expected_operation_state"),
                        "state": "several independent axis/claim/operation values; no source-only single class state asserted",
                    },
                    "owner_ref_typed": {
                        "observed_l5_function": rule.get("function"),
                        "function_ref_declared": bool(rule.get("function_ref")),
                        "contract_ref_declared": bool(rule.get("contract_ref")),
                        "state": "unknown_no_qa_typed_owner_ref_declaration",
                    },
                    "class_key_status": "unresolved_do_not_create_or_merge_membership",
                },
                "source_only_candidate_groups": candidate_ids,
                "source_only_candidate_group_context": [
                    {
                        "candidate_id": candidate_id,
                        "meaning": candidate_by_id[candidate_id]["provisional_failure_meaning"],
                        "source_leaf_refs": candidate_by_id[candidate_id]["source_leaf_refs"],
                    }
                    for candidate_id in candidate_ids
                ],
                "candidate_source_leaf_ids": candidate_source_leaf_ids,
                "candidate_relation": "contract_level_source_support_only; not a case/class membership",
                "explicit_class_membership": "unresolved_no_class_table_or_negative_class_ref",
            }
        )

    assert len(row_reports) == 38
    assert len(set(used_l9_ids)) == 38
    assert code_matches == 38
    assert owner_refs_declared == 0

    markers = {
        "L4": "negative_equivalence_classes" in l4,
        "L5": "negative_equivalence_classes" in l5,
        "L8": "negative_equivalence_classes" in l8,
        "L9": "negative_equivalence_classes" in l9,
    }
    assert markers == {"L4": False, "L5": False, "L8": False, "L9": False}

    comparison = {
        "artifact_id": "WR242-H053-POST-FREEZE-L4-L9-COMPARISON-2026-10-31",
        "evidence_kind": "scaffold_static_comparison",
        "authority_effect": "none",
        "base_revision": BASE,
        "fixed_blind_artifact": {
            "path": "scaffold/research/wr242-h053-l4-l9-comparison-20261031/blind-source-only.json",
            "sha256": blind_sha,
            "issue_comment": 6534090409,
            "bytes_copied_unchanged": True,
        },
        "source_hashes": current_hashes,
        "source_only_result": {
            "unique_leaf_count": len(blind["source_leaf_inventory"]),
            "unique_source_leaf_hashes_reverified": resolved_leaves,
            "provisional_group_count": len(candidate_by_id),
            "candidate_keys_asserted": blind["counts"]["candidate_keys_asserted"],
            "unknown_classification_code": blind["counts"]["unknown_classification_code"],
            "unknown_backflow_owner": blind["counts"]["unknown_backflow_owner"],
            "unknown_owner_ref": blind["counts"]["unknown_owner_ref"],
            "repeated_leaf_identity": "(source.revision, source.path, source.pointer); one leaf record may be referenced by several overlapping provisional groups",
            "equal_value_different_pointer": blind["repeated_reference_handling"]["same_value_distinct_pointer_groups"],
        },
        "current_l4_l9_correspondence": {
            "l4_failure_classification_rows": len(l4["failure_classifications"]),
            "l9_negative_case_rows": len(used_l9_ids),
            "resolved_l4_oracle_refs": len(used_l9_ids),
            "unique_l9_case_ids": len(set(used_l9_ids)),
            "classification_code_matches": code_matches,
            "condition_change_exact_matches": change_matches,
            "backflow_owner_matches": owner_matches,
            "record_axes_matches": axes_matches,
            "claim_state_matches": claim_state_matches,
            "operation_state_matches": operation_state_matches,
            "operation_selection_matches": operation_selection_matches,
            "reference_state_matches": reference_state_matches,
            "side_effect_count_matches": side_effect_matches,
            "l5_rules_with_qa_typed_owner_ref": owner_refs_declared,
            "pair_link_kind": "existing L4 oracle_refs to L9 case; casewise correspondence only, not explicit class membership",
            "class_markers": markers,
            "rows": row_reports,
        },
        "six_field_key_assessment": {
            "fields": [
                "classification_code",
                "finding_codes_ordered",
                "backflow_owner",
                "expected_axis",
                "expected_state",
                "owner_ref_typed",
            ],
            "classification_code": "row code and linked L9 expected_classification match for 38/38 legacy case pairs; does not establish class boundaries",
            "finding_codes_ordered": "unresolved: fixed artifact asserts unknown; current L4 classification rows have no ordered finding_codes field",
            "backflow_owner": "raw L4/L9 values can be compared casewise; fixed source-only artifact does not derive a canonical owner for a six-field class",
            "expected_axis_and_state": "unresolved as class key: source-only groups span axes/states; L4 rows carry structured record-axis arrays plus separate claim/operation states, not a single source-derived class axis/state",
            "owner_ref_typed": "unresolved: QA key requires L5-declared function_ref or contract_ref; current rows do not establish such typed owner_ref from the permitted derivation",
            "class_key_assertion": "not supported; do not synthesize singleton classes or convert overlapping provisional groups into memberships",
        },
        "remaining_effects": {
            "confirmed_dropped_source_meanings": [],
            "unresolved_candidate_groups": [
                {
                    "candidate_id": candidate_id,
                    "meaning": candidate_by_id[candidate_id]["provisional_failure_meaning"],
                    "source_leaf_refs": candidate_by_id[candidate_id]["source_leaf_refs"],
                    "status": "candidate only; no six-field key or explicit L4/L9 member established",
                }
                for candidate_id in sorted(candidate_by_id)
            ],
            "l4_l9_remaining_edit": "not made: no candidate was removed because of L9 population and no source-derived class was proven absent; candidate dispositions remain unresolved in this comparison artifact",
        },
        "decision": {
            "l4_l9_class_migration": "not feasible from fixed artifact plus current L4/L9 under PR-A scope",
            "reason": "fixed artifact intentionally asserts zero six-field keys; class membership cannot be derived from broad overlapping candidate groups; L4/L9 expose one-to-one legacy case references but no explicit class membership",
            "canonical_l4_l9_changed": False,
            "formal_four_layer_mode": "not enabled; no marker added",
            "proposed_partial_result": "retain the byte-fixed source-only artifact and this 38-row crosswalk as scaffold evidence; leave L4/L9 rows and expectations unchanged; resolve missing key/member evidence in a later authorized derivation before class migration",
        },
    }
    (HERE / "comparison.json").write_text(
        json.dumps(comparison, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    summary = {
        "evidence_kind": "scaffold_static_comparison",
        "base_revision": BASE,
        "fixed_artifact_sha256": blind_sha,
        "fixed_artifact_bytes_unchanged": True,
        "source_leaf_hashes_reverified": resolved_leaves,
        "l4_rows": len(row_reports),
        "l9_cases_linked_once": len(set(used_l9_ids)),
        "classification_code_matches": code_matches,
        "condition_change_exact_matches": change_matches,
        "backflow_owner_matches": owner_matches,
        "record_axes_matches": axes_matches,
        "claim_state_matches": claim_state_matches,
        "operation_state_matches": operation_state_matches,
        "operation_selection_matches": operation_selection_matches,
        "reference_state_matches": reference_state_matches,
        "side_effect_count_matches": side_effect_matches,
        "l5_rules_with_qa_typed_owner_ref": owner_refs_declared,
        "explicit_markers": markers,
        "class_keys_asserted": 0,
        "migration_feasible": False,
        "canonical_l4_l9_changed": False,
        "binding_validation": {
            "scfctl_validate_exit_code": 0,
            "bindings": 184,
            "failures": 0,
            "scfctl_stale_exit_code": 0,
            "stale": 0,
            "measurement_note": "new-generation scfctl static binding validation; no legacy CLI/runtime",
        },
        "check_child_base_measurement": {
            "command": "python3 scaffold/tools/design_verification_checker.py check-child --root . --l4 docs/helix-harness/L4-basic-design/semantic-asset-lineage.json --l5 docs/helix-harness/L5-detail-design/semantic-asset-lineage.json --l8 docs/helix-harness/L8-unit-verification/semantic-asset-lineage.json --l9 docs/helix-harness/L9-integration-verification/semantic-asset-lineage.json",
            "exit_code": 1,
            "overall_passed": False,
            "L4_L9_pair": "PASS 6/6",
            "L5_L8_pair": "PASS 6/6",
            "negative_4way": {
                "comparison_mode": "legacy_casewise_four_layer",
                "counts": {"L4": 38, "L9": 38, "L8": 38, "L5": 38},
                "matched": 0,
                "failures": 76,
            },
            "ownership_cap_failures": {"L4": 0, "L9": 0, "L5": 0, "L8": 30},
            "pin_checks": {"all_passed": True, "checked_counts": [15, 15, 17, 17]},
            "measurement_note": "現行document checkerを指定baseで実行した実測。比較作業ではcheckerを変更していない。",
        },
        "forbidden_execution": "no L4 algorithm/runtime/test/CI/old-generation runtime was invoked",
    }
    (HERE / "verification-summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
