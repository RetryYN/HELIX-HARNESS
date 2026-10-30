#!/usr/bin/env python3
"""Static WR181 OS015 L5/L8 projection after #3939.

This document builder reads fixed L4 contract rows and L7 fixture input only.
It does not import or execute the embedded L4 algorithm and does not load L9.
The two new scenario expectations are manually declared below and checked
against their L4 class rows.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = "e3a16010cce138001d33df19afef92e3fa049d81"
L3 = "docs/helix-os/L3-requirements/functional-requirements.json"
L4 = "docs/helix-os/L4-basic-design/management-authority-source-record.json"
L5 = "docs/helix-os/L5-detail-design/management-authority-source-record.json"
L7 = "docs/helix-os/L7-function-verification/management-authority-source-record.json"
L8 = "docs/helix-os/L8-unit-verification/management-authority-source-record.json"
L9 = "docs/helix-os/L9-integration-verification/management-authority-source-record.json"
FUNCTION = "FN-OS015-01"
SINGLETONS = {
    "OS015-NEG-first_classification_prior_present",
    "OS015-NEG-first_classification_prior_unresolved",
    "OS015-NEG-original_event_mutated",
    "OS015-NEG-source_conflict-original_event",
    "OS015-NEG-source_unresolved-original_event",
    "OS015-NEG-unresolved_promoted_to_current",
}

# Manually derived from L7 fixture_inputs.inspect + the stated replacements,
# then matched to the corresponding L4 classification row and L5 contract.
SCENARIOS = [
    {
        "case_id": "HELIXOS-L9-015-C0584",
        "class_id": "OS015-NEG-COMPOSITE-62fb66a6e279702c28b1aa4f8ee9380369f59c8322c999587e174c6c4992b558",
        "requirement_ref": "HELIXOS-L3-015-F03",
        "oracle_ref": "HELIXOS-L10-015-F03",
        "replacements": [
            {"path": ["records", "target_a", "original_event", "event_id"], "value": None},
            {"path": ["records", "target_a", "current_material_claim"], "value": True},
        ],
        "finding_codes": ["original_event_mutated", "source_unresolved", "unresolved_promoted_to_current"],
        "expected_classification": "management_material_violation",
        "expected_axis": "original_event",
        "expected_state": "violation",
        "finding_pointers": [
            "/records/target_a/original_event",
            "/records/target_a/original_event/event_id",
            "/records/target_a/current_material_claim",
        ],
        "l4_source_pointers": [
            "/contracts/2", "/contracts/3", "/diagnostic_contract/codes/0",
            "/diagnostic_contract/codes/3", "/diagnostic_contract/codes/10",
            "/diagnostic_contract/comparison_facets", "/diagnostic_contract/aggregation",
            "/diagnostic_contract/current_material_limit", "/diagnostic_contract/condition_values",
        ],
    },
    {
        "case_id": "HELIXOS-L9-015-C0585",
        "class_id": "OS015-NEG-COMPOSITE-deac8ce9011311dc91b808f2f94e7d2dcd7320bd68b2b820d7eeef6ac092e7f9",
        "requirement_ref": "HELIXOS-L3-015-F03",
        "oracle_ref": "HELIXOS-L10-015-F03",
        "replacements": [
            {"path": ["records", "target_a", "authority_state"], "value": None},
            {"path": ["records", "target_a", "current_material_claim"], "value": True},
        ],
        "finding_codes": ["authority_state_unresolved", "unresolved_promoted_to_current"],
        "expected_classification": "management_material_violation",
        "expected_axis": "authority",
        "expected_state": "violation",
        "finding_pointers": [
            "/records/target_a/authority_state",
            "/records/target_a/current_material_claim",
        ],
        "l4_source_pointers": [
            "/contracts/3", "/diagnostic_contract/codes/10", "/diagnostic_contract/codes/14",
            "/diagnostic_contract/aggregation", "/diagnostic_contract/current_material_limit",
            "/diagnostic_contract/condition_values",
        ],
    },
]


def read(path: str) -> dict:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def write(path: str, value: dict) -> None:
    (ROOT / path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def git_raw(revision: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)


def pin_pair() -> list[dict]:
    return [
        {"path": L4, "revision": BASE, "sha256": sha(git_raw(BASE, L4))},
        {"path": L9, "revision": BASE, "sha256": sha(git_raw(BASE, L9))},
    ]


def resolve(doc: dict, pointer: str):
    value = doc
    for part in pointer[1:].split("/") if pointer else []:
        part = part.replace("~1", "/").replace("~0", "~")
        value = value[int(part)] if isinstance(value, list) else value[part]
    return value


def scenario_input(l7: dict, spec: dict) -> tuple[dict, str]:
    base = copy.deepcopy(l7["connection_materials"]["OS015"]["case"]["fixture_inputs"]["inspect"])
    for replacement in spec["replacements"]:
        target = base
        for part in replacement["path"][:-1]:
            target = target[part]
        target[replacement["path"][-1]] = replacement["value"]
    digest = sha(json.dumps(base, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())
    return base, digest


def verify_manual_scenarios(l3: dict, l4: dict, l5: dict, l7: dict) -> dict[str, tuple[dict, str]]:
    rows4 = {row["class_id"]: (index, row) for index, row in enumerate(l4["failure_classifications"])}
    rows5 = {row["id"]: (index, row) for index, row in enumerate(l5["failure_rules"])}
    inputs = {}
    for spec in SCENARIOS:
        index4, row4 = rows4[spec["class_id"]]
        _, row5 = rows5[spec["class_id"]]
        assert row4["expected_classification"] == spec["expected_classification"]
        assert row4["expected"]["finding_codes"] == spec["finding_codes"]
        assert row4["expected_axis"] == spec["expected_axis"]
        assert row4["expected_state"] == spec["expected_state"]
        assert row4["side_effect_count"] == 0
        assert row5["expected_classification"] == spec["expected_classification"]
        assert row5["expected"]["finding_codes"] == spec["finding_codes"]
        assert row5["expected_axis"] == spec["expected_axis"]
        assert row5["expected_state"] == spec["expected_state"]
        assert row5["function_ref"] == FUNCTION
        assert row5["backflow_owner"] == row4["backflow_owner"] == "management-authority-owner"
        assert len(spec["finding_codes"]) == len(spec["finding_pointers"])
        # Each occurrence joins to a surviving existing L5 rule owned by FN-OS015-01.
        for code in set(spec["finding_codes"]):
            joins = [r for r in l5["failure_rules"] if code in r.get("expected", {}).get("finding_codes", [])]
            assert joins and {r.get("function_ref") for r in joins} == {FUNCTION}
            assert {r.get("contract_ref") for r in joins} == {None}
        for pointer in spec["l4_source_pointers"]:
            resolve(l4, pointer)
        resolve(l3, "/requirements/26")
        raw, digest = scenario_input(l7, spec)
        assert raw["phase"] == "inspect"
        inputs[spec["case_id"]] = (raw, digest)
    return inputs


def build_l5() -> None:
    l3, l4 = (read(p) for p in (L3, L4))
    base5 = json.loads(git_raw(BASE, L5))
    assert len(l4["failure_classifications"]) == 47
    assert len(base5["failure_rules"]) == 51
    old_rules = base5["failure_rules"]
    l4_by_id = {row["class_id"]: (index, row) for index, row in enumerate(l4["failure_classifications"])}
    keep = [row for row in old_rules if row["id"] not in SINGLETONS]
    assert len(keep) == 45
    keep_index = {row["id"]: index for index, row in enumerate(keep)}

    # Remap any same-document rule pointers in retained L5 records by target ID.
    old_id_by_index = {index: row["id"] for index, row in enumerate(old_rules)}
    for row in keep:
        for source in row.get("source_pointers", []):
            mapped = []
            for pointer in source.get("pointers", []):
                if source.get("path") == L4 and pointer.startswith("/failure_classifications/"):
                    # Older L5 rows may retain pre-correction L4 indices.
                    mapped.append(f"/failure_classifications/{l4_by_id[row['id']][0]}")
                elif source.get("path") == L5 and pointer.startswith("/failure_rules/"):
                    old_index = int(pointer.rsplit("/", 1)[1])
                    target_id = old_id_by_index[old_index]
                    if target_id in keep_index:
                        mapped.append(f"/failure_rules/{keep_index[target_id]}")
                    else:
                        # A removed singleton pointer becomes the surviving
                        # owner evidence for that code, selected by code ID.
                        old_target = old_rules[old_index]
                        codes = old_target.get("expected", {}).get("finding_codes", [])
                        replacement = next((
                            keep_index[candidate["id"]]
                            for candidate in keep
                            if candidate.get("function_ref") == FUNCTION
                            and set(candidate.get("expected", {}).get("finding_codes", [])) & set(codes)
                        ), None)
                        assert replacement is not None, (row["id"], target_id, codes)
                        mapped.append(f"/failure_rules/{replacement}")
                else:
                    mapped.append(pointer)
            source["pointers"] = mapped

    additions = []
    for spec in SCENARIOS:
        l4_index, row4 = l4_by_id[spec["class_id"]]
        assert row4["expected"]["finding_codes"] == spec["finding_codes"]
        owner_indexes = sorted({
            index for index, rule in enumerate(keep)
            if set(rule.get("expected", {}).get("finding_codes", [])) & set(spec["finding_codes"])
        })
        assert owner_indexes
        additions.append({
            "id": spec["class_id"],
            "code": spec["expected_classification"],
            "expected_classification": spec["expected_classification"],
            "function_ref": FUNCTION,
            "expected": {"finding_codes": list(spec["finding_codes"])},
            "expected_axis": spec["expected_axis"],
            "expected_state": spec["expected_state"],
            "backflow_owner": "management-authority-owner",
            "side_effect_count": 0,
            "handling": (
                "L4の固定class rowからordered finding occurrence・全体condition・axis/stateを投影。"
                "L5 composite_class_formationに従い各code occurrenceを残存existing failure_rulesへ一意owner joinし、"
                "input_boundaryの固定carrier条件を保持する。L7 fixture入力・stimulusはL8 caseで別途固定する。"
            ),
            "source_pointers": [
                {"path": L3, "pointers": ["/requirements/26"]},
                {"path": L4, "pointers": [f"/failure_classifications/{l4_index}"]},
                {"path": L5, "pointers": [
                    "/formal_reference/composite_class_formation", "/input_boundary", "/functions/0",
                    *[f"/failure_rules/{i}" for i in owner_indexes],
                ]},
            ],
        })
    out = copy.deepcopy(base5)
    out["failure_rules"] = keep + additions
    out["source_pair_pins"] = pin_pair()
    assert len(out["failure_rules"]) == 47
    assert {row["id"] for row in out["failure_rules"]} == set(l4_by_id)
    inputs = verify_manual_scenarios(l3, l4, out, read(L7))
    write(L5, out)
    print(json.dumps({"stage": "L5", "rule_count": len(out["failure_rules"]), "removed_singletons": sorted(SINGLETONS), "added_classes": [x["id"] for x in additions], "input_hashes": {k:v[1] for k,v in inputs.items()}}, ensure_ascii=False, indent=2))


def remap_class_pointers(l8: dict, l4: dict, old_l5: dict, new_l5: dict) -> None:
    index4 = {row["class_id"]: i for i, row in enumerate(l4["failure_classifications"])}
    new5 = {row["id"]: i for i, row in enumerate(new_l5["failure_rules"])}
    for class_row in l8["negative_equivalence_classes"]:
        cid = class_row["class_id"]
        assert cid in index4 and cid in new5
        for source in class_row.get("source_pointers", []):
            pointers = []
            for pointer in source.get("pointers", []):
                if source.get("path") == L4 and pointer.startswith("/failure_classifications/"):
                    pointers.append(f"/failure_classifications/{index4[cid]}")
                elif source.get("path") == L5 and pointer.startswith("/failure_rules/"):
                    # Class-index pointers are rebound by class ID because the
                    # L5 row ordering changes when six singleton rows leave.
                    pointers.append(f"/failure_rules/{new5[cid]}")
                else:
                    pointers.append(pointer)
            source["pointers"] = pointers


def case_row(spec: dict, l7: dict, digest: str) -> dict:
    input_pointer = "/connection_materials/OS015/case/fixture_inputs/inspect"
    ordered_findings = [
        {"code": code, "pointer": pointer, "return_owner": "management-authority-owner"}
        for code, pointer in zip(spec["finding_codes"], spec["finding_pointers"])
    ]
    return {
        "id": spec["case_id"],
        "source_trace": {"requirement_ref": spec["requirement_ref"], "oracle_ref": spec["oracle_ref"]},
        "function_roster_ref": {"path": L8, "pointer": "/common_call_contract/function_order"},
        "counterexample_summary": {
            "ordered_findings": ordered_findings,
            "noneffects_all_false": True,
            "retention_all_true": True,
        },
        "l7_material_ref": {"path": L7, "pointer": input_pointer},
        "forward_stimulus_replacements": copy.deepcopy(spec["replacements"]),
        "case_id": spec["case_id"],
        "integration_case_ref": spec["case_id"],
        "contract_ref": "HELIXOS-L5-015-P-F03",
        "population_state": "negative",
        "condition": spec["expected_classification"],
        "expected": {"finding_codes": list(spec["finding_codes"])},
        "expected_preserved": True,
        "phase": "inspect",
        "ordered_finding_codes": list(spec["finding_codes"]),
        "noneffects_all_false": True,
        "retention_all_true": {
            "material_retention_checks": True,
            "retained_new_classification_equal_input": True,
            "correction_reference_equal_input": True,
        },
        "classification_states": {
            "target_a": {"original": "not_evaluated", "new": "not_evaluated"},
            "target_b": {"original": "not_evaluated", "new": "not_evaluated"},
        },
        "negative_class_ref": spec["class_id"],
        "rule_ref": spec["class_id"],
        "function_ref": FUNCTION,
    }


def build_l8() -> None:
    l3, l4, l5, l7 = (read(p) for p in (L3, L4, L5, L7))
    base8 = json.loads(git_raw(BASE, L8))
    base5 = json.loads(git_raw(BASE, L5))
    assert len(base8["unit_cases"]) == 583
    assert len(base8["negative_equivalence_classes"]) == 45
    assert len(l5["failure_rules"]) == 47
    assert len(l4["failure_classifications"]) == 47

    inputs = verify_manual_scenarios(l3, l4, l5, l7)
    out = copy.deepcopy(base8)
    remap_class_pointers(out, l4, base5, l5)
    l4_by_id = {row["class_id"]: (index, row) for index, row in enumerate(l4["failure_classifications"])}
    l5_by_id = {row["id"]: (index, row) for index, row in enumerate(l5["failure_rules"])}
    for spec in SCENARIOS:
        index4, row4 = l4_by_id[spec["class_id"]]
        index5, row5 = l5_by_id[spec["class_id"]]
        assert spec["class_id"] not in {row["class_id"] for row in out["negative_equivalence_classes"]}
        out["negative_equivalence_classes"].append({
            "class_id": spec["class_id"],
            "expected_classification": row4["expected_classification"],
            "expected": {"finding_codes": list(row4["expected"]["finding_codes"])},
            "expected_axis": row4["expected_axis"],
            "expected_state": row4["expected_state"],
            "backflow_owner": row4["backflow_owner"],
            "side_effect_count": row4["side_effect_count"],
            "source_pointers": [
                {"path": L4, "pointers": [f"/failure_classifications/{index4}"]},
                {"path": L5, "pointers": [f"/failure_rules/{index5}"]},
                {"path": L7, "pointers": ["/connection_materials/OS015/case/fixture_inputs/inspect"]},
            ],
        })
        raw, digest = inputs[spec["case_id"]]
        assert raw["phase"] == "inspect"
        out["unit_cases"].append(case_row(spec, l7, digest))

    out["source_pair_pins"] = pin_pair()
    l5_revision = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    out["candidate_l5_bytes"] = {
        "path": L5,
        "revision": l5_revision,
        "same_candidate": True,
        "sha256": sha((ROOT / L5).read_bytes()),
    }
    out["composite_class_formation_verification"] = {
        "source": f"{L5}#/formal_reference/composite_class_formation",
        "population_source": {"path": L8, "pointer": "/unit_cases"},
        "raw_input_source": {"path": L7, "pointer": "/connection_materials/OS015/case/fixture_inputs/inspect"},
        "method": (
            "二件のclass/caseはL7固定inspect fixtureへ明示stimulus replacementを適用するsource-forward projection。"
            "finding occurrence順・全体condition・axis/stateはL4固定class rowをsourceとして手作業で対応づけ、"
            "L5 composite_class_formationと既存failure rule owner joinを照合した。L7 expected_proposal、"
            "L8/L9 expected、L9 class rowは期待導出に使用しない。"
        ),
        "coverage": "L4/L5全47 class IDsを対応させ、C0584/C0585の2 caseを追加。6 singleton ruleはL5から除き、L8 classへ形成しない。",
        "preservation": "従来583 unit_casesとそのcondition/expected/expected_preserved、112既存class linksを保持。追加2 case以外のcase rowはbaseと同一。",
    }
    write(L8, out)
    evidence = {
        "evidence_kind": "scaffold",
        "source_main": BASE,
        "method": "固定L7 inspect fixtureに明示stimulus replacementを適用して入力hashを照合し、L4 class rowとL5 composite contractから手動投影を記録。L4 algorithmは実行せず、L7 expected_proposalとL9 expected/classは導出に使わない。",
        "cases": [],
    }
    for spec in SCENARIOS:
        row4 = l4_by_id[spec["class_id"]][1]
        evidence["cases"].append({
            "case_id": spec["case_id"],
            "l4_class_id": spec["class_id"],
            "l7_fixture_pointer": "/connection_materials/OS015/case/fixture_inputs/inspect",
            "stimulus_replacements": spec["replacements"],
            "expanded_input_sha256": inputs[spec["case_id"]][1],
            "manual_l4_projection": {
                "condition": row4["expected_classification"],
                "ordered_finding_codes": row4["expected"]["finding_codes"],
                "expected_axis": row4["expected_axis"],
                "expected_state": row4["expected_state"],
                "side_effect_count": row4["side_effect_count"],
            },
            "finding_pointers": spec["finding_pointers"],
            "l4_source_pointers": spec["l4_source_pointers"],
        })
    write("scaffold/research/wr181-os015-l5-l8-successor-20261031/source-projection-evidence.json", evidence)
    print(json.dumps({"stage": "L8", "class_count": len(out["negative_equivalence_classes"]), "case_count": len(out["unit_cases"]), "candidate_l5_revision": l5_revision, "input_hashes": {k:v[1] for k,v in inputs.items()}}, ensure_ascii=False, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("stage", choices=("l5", "l8"))
    args = parser.parse_args()
    if args.stage == "l5":
        build_l5()
    else:
        build_l8()


if __name__ == "__main__":
    main()
