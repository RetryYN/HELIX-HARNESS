#!/usr/bin/env python3
"""Build the WR181 residual L5/L8 successor from L4/L5 contracts and L7 raw input refs.

This is a document projection only. It does not evaluate L4 predicates and does
not load L9 or use any L8/L9 expected value as a class oracle.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = "0dd2045801e9e30def00913b57a6177d8d9be3a8"
DIR = ROOT / "scaffold/research/wr181-os015-l5-l8-successor-20261031"
MANIFEST = ROOT / "scaffold/research/wr181-os015-residual-l4-l9-20261030/projection-manifest.json"
L3 = "docs/helix-os/L3-requirements/functional-requirements.json"
L4 = "docs/helix-os/L4-basic-design/management-authority-source-record.json"
L5 = "docs/helix-os/L5-detail-design/management-authority-source-record.json"
L7 = "docs/helix-os/L7-function-verification/management-authority-source-record.json"
L8 = "docs/helix-os/L8-unit-verification/management-authority-source-record.json"
L9 = "docs/helix-os/L9-integration-verification/management-authority-source-record.json"
FUNCTION = "FN-OS015-01"
PR_A_EVIDENCE = ROOT / "scaffold/research/wr181-os015-pr-a-l4-l9-20261030/case-evidence.json"


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def raw_at(revision: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)


def load(path: str) -> dict:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def parse(raw: bytes) -> dict:
    return json.loads(raw)


def dump(data: dict) -> bytes:
    return (json.dumps(data, ensure_ascii=False, indent=2) + "\n").encode()


def resolve(doc: dict, pointer: str):
    assert pointer == "" or pointer.startswith("/"), pointer
    value = doc
    for token in pointer[1:].split("/") if pointer else []:
        token = token.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def owner_join(code: str, rules: list[dict]) -> tuple[list[int], str]:
    matches = [
        (i, row)
        for i, row in enumerate(rules)
        if code in row.get("expected", {}).get("finding_codes", [])
    ]
    owners = {row.get("function_ref") for _, row in matches}
    contracts = {row.get("contract_ref") for _, row in matches}
    assert matches and owners == {FUNCTION} and contracts == {None}, (code, matches)
    return [i for i, _ in matches], FUNCTION


def build_l5(l3: dict, l4: dict, l5_base: dict, manifest: dict) -> tuple[dict, list[dict]]:
    rows4 = l4["failure_classifications"]
    rules_base = l5_base["failure_rules"]
    l4_by_id = {row["class_id"]: (i, row) for i, row in enumerate(rows4)}
    l5_by_id = {row["id"]: row for row in rules_base}
    classes = manifest["classes"]
    new_classes = sorted((x for x in classes if x["is_new"]), key=lambda x: x["class_id"])
    assert len(new_classes) == 18 and len(classes) == 20
    assert len(rules_base) == 33
    out = json.loads(json.dumps(l5_base))
    additions = []
    for group in new_classes:
        cid = group["class_id"]
        l4_index, l4row = l4_by_id[cid]
        assert cid not in l5_by_id
        key = group["key"]
        assert l4row["expected_classification"] == key["expected_classification"]
        assert l4row["expected"]["finding_codes"] == key["finding_codes"]
        assert l4row["expected_axis"] == key["expected_axis"]
        assert l4row["expected_state"] == key["expected_state"]
        assert l4row["backflow_owner"] == key["backflow_owner"] == "management-authority-owner"
        owner_rule_indexes = set()
        for code in key["finding_codes"]:
            indexes, owner = owner_join(code, rules_base)
            assert owner == key["owner_ref"]["id"] == FUNCTION
            owner_rule_indexes.update(indexes)
        l5_pointers = [
            {"path": L3, "pointers": ["/requirements/25"]},
            {"path": L4, "pointers": [f"/failure_classifications/{l4_index}"]},
            {
                "path": L5,
                "pointers": [
                    "/formal_reference/composite_class_formation",
                    "/input_boundary",
                    "/functions/0",
                    *[f"/failure_rules/{i}" for i in sorted(owner_rule_indexes)],
                ],
            },
        ]
        for source in l5_pointers:
            doc = {L3: l3, L4: l4, L5: l5_base}[source["path"]]
            for pointer in source["pointers"]:
                resolve(doc, pointer)
        row = {
            "id": cid,
            "code": l4row["expected_classification"],
            "expected_classification": l4row["expected_classification"],
            "function_ref": FUNCTION,
            "expected": {"finding_codes": list(l4row["expected"]["finding_codes"])},
            "expected_axis": l4row["expected_axis"],
            "expected_state": l4row["expected_state"],
            "backflow_owner": l4row["backflow_owner"],
            "side_effect_count": 0,
            "handling": (
                "L5 composite_class_formationに従い、L4のordered finding occurrencesを保持する。"
                "各occurrenceのcodeを既存failure_rulesへ照合し、FN-OS015-01へ一意にowner joinした。"
                "expected_axis/stateと全体conditionはL4 keyから投影し、input_boundaryの固定carrier条件内で扱う。"
                "L7 raw inputとの対応はL8側のcase sourceで記録し、case expectedから形成しない。"
            ),
            "source_pointers": l5_pointers,
        }
        additions.append(row)
    out["failure_rules"].extend(additions)
    out["source_pair_pins"] = [
        {"path": L4, "revision": BASE, "sha256": sha(raw_at(BASE, L4))},
        {"path": L9, "revision": BASE, "sha256": sha(raw_at(BASE, L9))},
    ]
    return out, additions


def build_l8(
    l3: dict,
    l4: dict,
    l5: dict,
    l7: dict,
    l8_base: dict,
    manifest: dict,
    l5_revision: str,
) -> tuple[dict, dict]:
    assert l5_revision and len(l5_revision) == 40
    groups = manifest["classes"]
    new_groups = [x for x in groups if x["is_new"]]
    assert len(groups) == 20 and len(new_groups) == 18
    rows4 = l4["failure_classifications"]
    rows5 = l5["failure_rules"]
    rows8_base = l8_base["negative_equivalence_classes"]
    cases8 = l8_base["unit_cases"]
    assert len(rows5) == 51 and len(rows8_base) == 27 and len(cases8) == 583
    l4_by_id = {row["class_id"]: (i, row) for i, row in enumerate(rows4)}
    l5_by_id = {row["id"]: (i, row) for i, row in enumerate(rows5)}
    l8_ids = {row["class_id"] for row in rows8_base}
    assert len(l4_by_id) == 51 and len(l5_by_id) == 51
    out = json.loads(json.dumps(l8_base))
    l7cases = l7["connection_materials"]["OS015"]["case"]["cases"]
    l7_by_id = {row["id"]: (i, row) for i, row in enumerate(l7cases)}
    case8_by_id = {row["case_id"]: row for row in out["unit_cases"]}
    assert len(case8_by_id) == len(out["unit_cases"])
    pr_a = load("scaffold/research/wr181-os015-pr-a-l4-l9-20261030/case-evidence.json")
    prior = {item["case_id"]: item["class_id"] for item in pr_a["case_assignments"]}
    assert len(prior) == 29
    assignments = {}
    new_l8_classes = []
    for group in sorted(groups, key=lambda x: x["class_id"]):
        cid = group["class_id"] if group["is_new"] else group["existing_class_id"]
        assert cid == group["class_id"] or not group["is_new"]
        l4_index, row4 = l4_by_id[cid]
        l5_index, row5 = l5_by_id[cid]
        key = group["key"]
        assert row5["expected_classification"] == key["expected_classification"]
        assert row5["expected"]["finding_codes"] == key["finding_codes"]
        assert row5["expected_axis"] == key["expected_axis"]
        assert row5["expected_state"] == key["expected_state"]
        assert row5["function_ref"] == FUNCTION
        assert row5["backflow_owner"] == key["backflow_owner"]
        raw_pointers = []
        raw_by_case = {x["case_id"]: x for x in group["l7_raw_inputs"]}
        assert set(raw_by_case) == set(group["case_ids"])
        for case_id in group["case_ids"]:
            i7, row7 = l7_by_id[case_id]
            item = raw_by_case[case_id]
            expected_pointer = f"/connection_materials/OS015/case/cases/{i7}/given/input"
            assert item["l7_input_pointer"] == expected_pointer
            given = resolve(l7, expected_pointer)
            assert given["expanded_input_sha256"] == item["expanded_input_sha256"]
            case8 = case8_by_id[case_id]
            assert case8.get("negative_class_ref") in (None, cid)
            if case_id in prior:
                assert prior[case_id] == cid
                assert case8.get("negative_class_ref") == cid
            else:
                assert case8.get("negative_class_ref") is None
                assignments[case_id] = cid
                case8["l7_material_ref"] = {"path": L7, "pointer": expected_pointer}
                case8["negative_class_ref"] = cid
                case8["rule_ref"] = cid
                case8["function_ref"] = FUNCTION
            raw_pointers.append(expected_pointer)
        if group["is_new"]:
            assert cid not in l8_ids
            new_l8_classes.append(
                {
                    "class_id": cid,
                    "expected_classification": row5["expected_classification"],
                    "expected": {"finding_codes": list(row5["expected"]["finding_codes"])},
                    "expected_axis": row5["expected_axis"],
                    "expected_state": row5["expected_state"],
                    "backflow_owner": row5["backflow_owner"],
                    "side_effect_count": row5["side_effect_count"],
                    "source_pointers": [
                        {"path": L4, "pointers": [f"/failure_classifications/{l4_index}"]},
                        {"path": L5, "pointers": [f"/failure_rules/{l5_index}"]},
                        {"path": L7, "pointers": raw_pointers},
                    ],
                }
            )
    assert len(assignments) == 112
    assert len(set(assignments)) == 112
    assert not (set(assignments) & set(prior))
    out["negative_equivalence_classes"].extend(new_l8_classes)
    out["source_pair_pins"] = [
        {"path": L4, "revision": BASE, "sha256": sha(raw_at(BASE, L4))},
        {"path": L9, "revision": BASE, "sha256": sha(raw_at(BASE, L9))},
    ]
    out["candidate_l5_bytes"] = {
        "path": L5,
        "revision": l5_revision,
        "same_candidate": True,
        "sha256": sha(dump(l5)),
    }
    out["composite_class_formation_verification"] = {
        "source": f"{L5}#/formal_reference/composite_class_formation",
        "population_source": {"path": L8, "pointer": "/unit_cases"},
        "raw_input_source": {"path": L7, "pointer": "/connection_materials/OS015/case/cases/*/given/input"},
        "method": (
            "L8 unit_casesのcase_idとl7_material_refからL7固定given.inputへ結び、"
            "manifestに固定されたL4/L7独立manual classificationをL5 composite_class_formationで"
            "owner joinした。L5 existing rulesは全ordered code occurrenceのowner条件として照合。"
            "L7 expected_proposal、L8/L9 case expected、L9 class rowsを分類oracleに使わない。"
        ),
        "coverage": (
            "先行29 assignmentsを保持し、追加112件（既存2 class residual 75、新規18 class 37）を"
            "L8 unit_casesへraw given.input pointerとclass/rule/function refsで接続。"
            "L8 classesは18件追加。singleton-less 6 classは未形成のまま。"
        ),
        "preservation": (
            "583 unit_casesのcondition/expected/expected_preserved、全L7 own input以外の既存期待を保持。"
            "先行29 linksは変更しない。追加caseで変更するのはl7_material_ref、negative_class_ref、"
            "rule_ref、function_refのみ。"
        ),
    }
    return out, {"assignments": assignments, "class_rows": new_l8_classes}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--l5-only", action="store_true")
    parser.add_argument("--l5-revision")
    args = parser.parse_args()
    manifest = load(str(MANIFEST.relative_to(ROOT)))
    l3, l4, l7 = (load(path) for path in (L3, L4, L7))
    l5_base = parse(raw_at(BASE, L5))
    l8_base = parse(raw_at(BASE, L8))
    assert sha(raw_at(BASE, L4)) == "5038893210d772bc46fa75802757a90d9658ec4f427f76adcc3cf8a6702ce96f"
    assert sha(raw_at(BASE, L5)) == manifest["source_revisions"]["L5_sha256"]
    assert sha(raw_at(BASE, L7)) == manifest["source_revisions"]["L7_sha256"]
    assert sha(raw_at(BASE, L8)) == manifest["source_revisions"]["L8_sha256"]
    l5, l5_additions = build_l5(l3, l4, l5_base, manifest)
    (ROOT / L5).write_bytes(dump(l5))
    result = {
        "status": "BUILT_L5_ONLY" if args.l5_only else "BUILT",
        "base_revision": BASE,
        "new_l5_rule_rows": len(l5_additions),
        "l5_rule_count": len(l5["failure_rules"]),
        "l5_sha256": sha(dump(l5)),
    }
    if not args.l5_only:
        assert args.l5_revision, "--l5-revision is required for an L8 successor pin"
        assert args.l5_revision in subprocess.check_output(["git", "rev-list", "HEAD"], cwd=ROOT, text=True).splitlines()
        l8, evidence = build_l8(l3, l4, l5, l7, l8_base, manifest, args.l5_revision)
        (ROOT / L8).write_bytes(dump(l8))
        result.update(
            {
                "new_l8_class_rows": len(evidence["class_rows"]),
                "new_l8_case_links": len(evidence["assignments"]),
                "l8_class_count": len(l8["negative_equivalence_classes"]),
                "l8_case_count": len(l8["unit_cases"]),
                "l8_sha256": sha(dump(l8)),
            }
        )
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
