#!/usr/bin/env python3
"""Resolve L7 fixed stimuli and list candidate L4 predicate pointers only.

This inventory does not evaluate L4 predicates, derive findings/class keys, read
L7 expected_proposal, read L9, or execute the embedded L4 algorithm text.
"""

from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
L4_PATH = ROOT / "docs/helix-os/L4-basic-design/management-authority-source-record.json"
L7_PATH = ROOT / "docs/helix-os/L7-function-verification/management-authority-source-record.json"
POPULATION_PATH = Path(__file__).with_name("residual-population-141.json")
OUTPUT_PATH = Path(__file__).with_name("l7-fixed-input-inventory-141.json")


def load(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
        allow_nan=False,
    ).encode("utf-8")


def lookup(root: Any, path: list[str]) -> Any:
    cursor = root
    for component in path:
        cursor = cursor[component]
    return cursor


def replace_existing(root: Any, path: list[str], value: Any) -> None:
    cursor = root
    for component in path[:-1]:
        cursor = cursor[component]
    assert path[-1] in cursor, path
    cursor[path[-1]] = copy.deepcopy(value)


def predicate_candidates(path: list[str], code_indexes: dict[str, int]) -> list[str]:
    path_text = "/".join(path)
    if path == ["phase"]:
        return [
            "/diagnostic_contract/phases",
            f"/diagnostic_contract/codes/{code_indexes['phase_unresolved']}",
        ]
    if "/source/" in path_text:
        return [
            "/diagnostic_contract/source_fields",
            "/diagnostic_contract/algorithm_dependencies/sf",
            "/diagnostic_contract/comparison_facets",
            "/diagnostic_contract/aggregation",
            "/diagnostic_contract/condition_values",
        ]
    if "/original_event/" in path_text:
        return [
            "/diagnostic_contract/event_fields",
            "/diagnostic_contract/algorithm_dependencies/ef",
            "/diagnostic_contract/mutation_rule",
            "/diagnostic_contract/comparison_facets",
            "/diagnostic_contract/aggregation",
            "/diagnostic_contract/condition_values",
        ]
    if path[-1] == "authority_origin":
        return [
            f"/diagnostic_contract/codes/{code_indexes['authority_origin_unresolved']}",
            f"/diagnostic_contract/codes/{code_indexes['authority_origin_forbidden']}",
            "/diagnostic_contract/aggregation",
            "/diagnostic_contract/condition_values",
        ]
    if path[-1] == "authority_state":
        return [
            f"/diagnostic_contract/codes/{code_indexes['authority_state_unresolved']}",
            f"/diagnostic_contract/codes/{code_indexes['authority_stale']}",
            f"/diagnostic_contract/codes/{code_indexes['authority_conflict']}",
            "/diagnostic_contract/aggregation",
            "/diagnostic_contract/condition_values",
        ]
    if path[-1] == "original_classification":
        return [
            f"/diagnostic_contract/codes/{code_indexes['original_classification_mutated']}",
            f"/diagnostic_contract/codes/{code_indexes['first_classification_prior_present']}",
            f"/diagnostic_contract/codes/{code_indexes['first_classification_prior_unresolved']}",
            "/diagnostic_contract/phases",
            "/diagnostic_contract/mutation_rule",
        ]
    if "new_classification" in path:
        return [
            "/diagnostic_contract/classification_fields",
            "/diagnostic_contract/algorithm_dependencies/cf",
            "/diagnostic_contract/phases",
            "/diagnostic_contract/comparison_facets",
            "/diagnostic_contract/aggregation",
        ]
    if path[-1] in ("history", "unresolved_history"):
        return [
            f"/diagnostic_contract/codes/{code_indexes['history_unresolved']}",
            f"/diagnostic_contract/codes/{code_indexes['unresolved_history_unresolved']}",
            "/diagnostic_contract/phases",
            "/diagnostic_contract/raw_retention",
        ]
    if path[-1] == "current_material_claim":
        return [
            f"/diagnostic_contract/codes/{code_indexes['current_material_claim_unresolved']}",
            f"/diagnostic_contract/codes/{code_indexes['unresolved_promoted_to_current']}",
            "/diagnostic_contract/current_material_limit",
        ]
    if "generated_claims" in path:
        return [
            f"/diagnostic_contract/codes/{code_indexes['generated_authority_forbidden']}",
            f"/diagnostic_contract/codes/{code_indexes['generated_authority_claim_unresolved']}",
            "/diagnostic_contract/facets",
        ]
    if path == ["whole_registry_claim"]:
        return [
            f"/diagnostic_contract/codes/{code_indexes['whole_registry_claim_unproven']}",
            f"/diagnostic_contract/codes/{code_indexes['whole_registry_claim_unresolved']}",
        ]
    return ["/diagnostic_contract/input_domain"]


def main() -> None:
    l4 = load(L4_PATH)
    l7 = load(L7_PATH)
    population = load(POPULATION_PATH)
    l4_contract = l4["diagnostic_contract"]
    l7_case = l7["connection_materials"]["OS015"]["case"]
    fixture_inputs = l7_case["fixture_inputs"]
    case_rows = l7_case["cases"]
    case_index = {row["id"]: (index, row) for index, row in enumerate(case_rows)}
    code_indexes = {row["code"]: index for index, row in enumerate(l4_contract["codes"])}

    # This immutable population manifest captures the IDs that lacked a class
    # reference at the WR181 base revision; current L8/L9 outputs do not select
    # or drive the inventory.
    residual_ids = population["case_ids"]
    assert len(residual_ids) == 141
    assert population["source_revision"] == "70b91c73c864b4de1c7b7d591dcf49cdc047c18a"
    assert set(residual_ids) <= set(case_index)

    output_cases = []
    for case_id in residual_ids:
        index, case = case_index[case_id]
        given = case["given"]["input"]
        input_value = copy.deepcopy(fixture_inputs[given["base_ref"]])
        changes = []
        for replacement in given["replacements"]:
            path = replacement["path"]
            before = lookup(input_value, path)
            after = replacement["value"]
            changes.append(
                {
                    "path": path,
                    "before": before,
                    "after": after,
                    "l4_predicate_candidates": predicate_candidates(path, code_indexes),
                }
            )
            replace_existing(input_value, path, after)
        input_sha256 = hashlib.sha256(canonical_bytes(input_value)).hexdigest()
        assert input_sha256 == given["expanded_input_sha256"]
        output_cases.append(
            {
                "case_id": case_id,
                "l7_input_pointer": f"/connection_materials/OS015/case/cases/{index}/given/input",
                "base_ref": given["base_ref"],
                "expanded_input_sha256": input_sha256,
                "changes": changes,
            }
        )

    result = {
        "evidence_kind": "scaffold",
        "authority_effect": "none",
        "scope": "141 IDs captured as classless negative cases at the WR181 base revision, matched to L7 fixed input materials; no expected outputs or L9 data read",
        "method": "resolve only L7 fixture_inputs + given.input replacement recipes; verify expanded_input_sha256; list changed fields and L4 predicate source pointers for human forward review",
        "not_done": [
            "L4 predicates are not evaluated",
            "no finding codes, class keys, or expected values are derived",
            "L7 expected_proposal is not read",
            "L9 data, output, and class combinations are not read",
        ],
        "case_count": len(output_cases),
        "population_source": {
            "path": "scaffold/research/wr181-os015-composite-class-formation-20261030/residual-population-141.json",
            "source_revision": population["source_revision"],
            "source_sha256": population["source_sha256"],
        },
        "cases": output_cases,
    }
    OUTPUT_PATH.write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"l7_fixed_input_records={len(output_cases)}")
    print("l4_predicate_evaluations=0")
    print("l7_expected_proposals_read=0")
    print("l9_records_read=0")
    print(f"output={OUTPUT_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
