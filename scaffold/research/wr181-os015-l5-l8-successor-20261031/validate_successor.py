#!/usr/bin/env python3
"""Static validation for the WR181 residual L5/L8 successor; no L9 oracle."""
from __future__ import annotations

import copy
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DIR = ROOT / "scaffold/research/wr181-os015-l5-l8-successor-20261031"
MANIFEST = ROOT / "scaffold/research/wr181-os015-residual-l4-l9-20261030/projection-manifest.json"
CORRECTION = ROOT / "scaffold/research/wr181-os015-residual-l4-l9-20261030/class-correction-cases.json"
PR_A = ROOT / "scaffold/research/wr181-os015-pr-a-l4-l9-20261030/case-evidence.json"
BASE = "0dd2045801e9e30def00913b57a6177d8d9be3a8"
PAIR_REVISION = "be407b48779ea1125f12a1a78f998c73316ed2e7"
L5_CANDIDATE_REVISION = "34f315ea69522e113433f3b16ef71ddb262e2b80"
L3 = "docs/helix-os/L3-requirements/functional-requirements.json"
L4 = "docs/helix-os/L4-basic-design/management-authority-source-record.json"
L5 = "docs/helix-os/L5-detail-design/management-authority-source-record.json"
L7 = "docs/helix-os/L7-function-verification/management-authority-source-record.json"
L8 = "docs/helix-os/L8-unit-verification/management-authority-source-record.json"
L9 = "docs/helix-os/L9-integration-verification/management-authority-source-record.json"
FUNCTION = "FN-OS015-01"
SINGLETONS = {
    "OS015-NEG-source_unresolved-original_event",
    "OS015-NEG-source_conflict-original_event",
    "OS015-NEG-original_event_mutated",
    "OS015-NEG-unresolved_promoted_to_current",
    "OS015-NEG-first_classification_prior_present",
    "OS015-NEG-first_classification_prior_unresolved",
}


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def git_raw(revision: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)


def load(path: str) -> dict:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def parse(raw: bytes) -> dict:
    return json.loads(raw)


def resolve(doc: dict, pointer: str):
    assert pointer == "" or pointer.startswith("/"), pointer
    value = doc
    for token in pointer[1:].split("/") if pointer else []:
        token = token.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def canonical_key(row: dict) -> dict:
    return {
        "expected_classification": row["expected_classification"],
        "finding_codes": row["expected"]["finding_codes"],
        "backflow_owner": row["backflow_owner"],
        "expected_axis": row["expected_axis"],
        "expected_state": row["expected_state"],
        "owner_ref": {"kind": "function_ref", "id": FUNCTION},
    }


def expanded_input(l7: dict, case_id: str) -> tuple[str, dict]:
    cases = l7["connection_materials"]["OS015"]["case"]["cases"]
    row = next(item for item in cases if item["id"] == case_id)
    given = row["given"]["input"]
    data = copy.deepcopy(l7["connection_materials"]["OS015"]["case"]["fixture_inputs"][given["base_ref"]])
    for replacement in given.get("replacements", []):
        target = data
        for component in replacement["path"][:-1]:
            target = target[component]
        target[replacement["path"][-1]] = replacement["value"]
    actual = sha(json.dumps(data, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())
    return actual, given


def main() -> dict:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    correction = json.loads(CORRECTION.read_text(encoding="utf-8"))
    pr_a = json.loads(PR_A.read_text(encoding="utf-8"))
    l3, l4, l5, l7, l8 = (load(path) for path in (L3, L4, L5, L7, L8))
    base5 = parse(git_raw(BASE, L5))
    base8 = parse(git_raw(BASE, L8))
    base7 = git_raw(BASE, L7)
    assert sha(base7) == sha((ROOT / L7).read_bytes())
    assert sha(base7) == manifest["source_revisions"]["L7_sha256"]
    assert sha(git_raw(BASE, L4)) == "5038893210d772bc46fa75802757a90d9658ec4f427f76adcc3cf8a6702ce96f"
    assert sha(git_raw(BASE, L8)) == manifest["source_revisions"]["L8_sha256"]
    assert len(base5["failure_rules"]) == 33 and len(l5["failure_rules"]) == 51
    assert l5["failure_rules"][:33] == base5["failure_rules"]
    assert len(base8["negative_equivalence_classes"]) == 27
    assert len(l8["negative_equivalence_classes"]) == 45
    assert l8["negative_equivalence_classes"][:27] == base8["negative_equivalence_classes"]
    assert l5["formal_reference"]["composite_class_formation"] == base5["formal_reference"]["composite_class_formation"]
    assert l5["input_boundary"] == base5["input_boundary"]
    assert l5["functions"] == base5["functions"]
    assert l5["source_pair_pins"] == [
        {"path": L4, "revision": PAIR_REVISION, "sha256": sha(git_raw(PAIR_REVISION, L4))},
        {"path": L9, "revision": PAIR_REVISION, "sha256": sha(git_raw(PAIR_REVISION, L9))},
    ]
    assert l8["source_pair_pins"] == l5["source_pair_pins"]
    candidate_l5 = l8["candidate_l5_bytes"]
    assert candidate_l5 == {
        "path": L5,
        "revision": L5_CANDIDATE_REVISION,
        "same_candidate": True,
        "sha256": sha((ROOT / L5).read_bytes()),
    }
    reachable = set(subprocess.check_output(["git", "rev-list", "HEAD"], cwd=ROOT, text=True).splitlines())
    merge_head = subprocess.run(
        ["git", "rev-parse", "--verify", "MERGE_HEAD"],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if merge_head.returncode == 0:
        reachable.update(
            subprocess.check_output(
                ["git", "rev-list", merge_head.stdout.strip()], cwd=ROOT, text=True
            ).splitlines()
        )
    assert candidate_l5["revision"] in reachable

    l4_by_id = {row["class_id"]: (i, row) for i, row in enumerate(l4["failure_classifications"])}
    l5_by_id = {row["id"]: (i, row) for i, row in enumerate(l5["failure_rules"])}
    l8_by_id = {row["class_id"]: row for row in l8["negative_equivalence_classes"]}
    manifest_groups = manifest["classes"]
    assert len(manifest_groups) == 20 and len({c["class_id"] for c in manifest_groups}) == 20
    new_groups = [c for c in manifest_groups if c["is_new"]]
    assert len(new_groups) == 18
    added_l5 = l5["failure_rules"][33:]
    added_l8 = l8["negative_equivalence_classes"][27:]
    expected_ids = sorted(c["class_id"] for c in new_groups)
    assert [r["id"] for r in added_l5] == expected_ids
    assert [r["class_id"] for r in added_l8] == expected_ids

    existing_rules = base5["failure_rules"]
    for group in new_groups:
        cid = group["class_id"]
        key = group["key"]
        i4, row4 = l4_by_id[cid]
        i5, row5 = l5_by_id[cid]
        row8 = l8_by_id[cid]
        assert key == canonical_key(row4) == canonical_key(row5) == canonical_key(row8)
        assert row5["function_ref"] == FUNCTION
        for code in key["finding_codes"]:
            owners = {
                item.get("function_ref")
                for item in existing_rules
                if code in item.get("expected", {}).get("finding_codes", [])
            }
            contracts = {
                item.get("contract_ref")
                for item in existing_rules
                if code in item.get("expected", {}).get("finding_codes", [])
            }
            assert owners == {FUNCTION} and contracts == {None}, (code, owners, contracts)
        for row, source_path, source_doc in (
            (row5, L5, l5),
            (row8, L8, l8),
        ):
            for src in row.get("source_pointers", []):
                docs = {L3: l3, L4: l4, L5: l5, L7: l7}
                assert src["path"] in docs, (cid, src["path"])
                for pointer in src["pointers"]:
                    resolve(docs[src["path"]], pointer)

    case_base = {row["case_id"]: row for row in base8["unit_cases"]}
    case_current = {row["case_id"]: row for row in l8["unit_cases"]}
    assert len(case_base) == len(case_current) == 583
    assert list(case_base) == list(case_current)
    case_assignments = {}
    class_sizes = {}
    raw_input_pointers = {}
    for group in manifest_groups:
        cid = group["class_id"]
        raw = {item["case_id"]: item for item in group["l7_raw_inputs"]}
        assert set(raw) == set(group["case_ids"])
        class_sizes[cid] = len(group["case_ids"])
        for case_id in group["case_ids"]:
            item = raw[case_id]
            actual_hash, given = expanded_input(l7, case_id)
            assert actual_hash == item["expanded_input_sha256"] == given["expanded_input_sha256"]
            pointer = item["l7_input_pointer"]
            assert pointer.endswith("/given/input")
            assert resolve(l7, pointer) == given
            raw_input_pointers[case_id] = pointer
            case_assignments[case_id] = cid
    assert len(case_assignments) == 112 and len(set(case_assignments)) == 112
    assert sum(class_sizes.values()) == 112

    prior = {item["case_id"]: item["class_id"] for item in pr_a["case_assignments"]}
    assert len(prior) == 29 and not (set(prior) & set(case_assignments))
    for case_id, before in case_base.items():
        after = case_current[case_id]
        assert before["condition"] == after["condition"]
        assert before["expected"] == after["expected"]
        assert before["expected_preserved"] == after["expected_preserved"]
        if case_id in prior:
            assert before == after
            assert after["negative_class_ref"] == prior[case_id]
        if case_id in case_assignments:
            cid = case_assignments[case_id]
            assert after["negative_class_ref"] == cid
            assert after["rule_ref"] == cid
            assert after["function_ref"] == FUNCTION
            assert after["l7_material_ref"] == {"path": L7, "pointer": raw_input_pointers[case_id]}
            changed = {k for k in set(before) | set(after) if before.get(k) != after.get(k)}
            assert changed <= {"l7_material_ref", "negative_class_ref", "rule_ref", "function_ref"}
    baseline_link_count = sum("negative_class_ref" in row for row in base8["unit_cases"])
    assert baseline_link_count == 460
    assert sum("negative_class_ref" in row for row in l8["unit_cases"]) == baseline_link_count + 112

    corrected = {case_id: cid for cid, cases in ((g["class_id"], g["case_ids"]) for g in correction["corrected_groups"]) for case_id in cases}
    correction_by_case = {row["case_id"]: row for row in correction["cases"]}
    code_rows = {row["code"]: row for row in l4["diagnostic_contract"]["codes"]}
    assert code_rows["original_classification_mutated"]["facet"] == "history"
    assert code_rows["original_classification_mutated"]["disposition"] == "violation"
    assert code_rows["first_classification_prior_unresolved"]["facet"] == "classification"
    assert code_rows["first_classification_prior_unresolved"]["disposition"] == "unknown"
    assert code_rows["source_unresolved"]["facet"] == "comparison"
    corrected_expected = {
        "HELIXOS-L9-015-C0574": (["first_classification_prior_present", "original_classification_mutated"] + ["source_unresolved"] * 4, "violation", "management_material_violation"),
        "HELIXOS-L9-015-C0575": (["first_classification_prior_present"] * 2 + ["source_unresolved"] * 4, "violation", "management_material_violation"),
        "HELIXOS-L9-015-C0577": (["first_classification_prior_unresolved", "original_classification_mutated"] + ["source_unresolved"] * 4, "unknown", "management_material_violation"),
        "HELIXOS-L9-015-C0578": (["first_classification_prior_unresolved"] * 2 + ["source_unresolved"] * 4, "unknown", "management_material_unknown"),
        "HELIXOS-L9-015-C0580": (["first_classification_prior_unresolved", "original_classification_mutated"] + ["source_unresolved"] * 4, "unknown", "management_material_violation"),
        "HELIXOS-L9-015-C0581": (["first_classification_prior_unresolved"] * 2 + ["source_unresolved"] * 4, "unknown", "management_material_unknown"),
    }
    assert set(corrected_expected) <= set(corrected)
    unresolved_pointer_order = [
        "/context/records/target_a/new_classification/prior_classification_ref",
        "/context/records/target_a/new_classification/prior_classification_revision",
        "/records/target_a/new_classification/prior_classification_ref",
        "/records/target_a/new_classification/prior_classification_revision",
    ]
    for case_id, (codes, state, overall) in corrected_expected.items():
        cid = corrected[case_id]
        correction_row = correction_by_case[case_id]
        assert [f["code"] for f in correction_row["ordered_findings"]] == codes
        assert [f["pointer"] for f in correction_row["ordered_findings"] if f["code"] == "source_unresolved"] == unresolved_pointer_order
        group = next(x for x in manifest_groups if case_id in x["case_ids"])
        assert group["key"]["finding_codes"] == codes
        assert group["key"]["expected_axis"] == "classification"
        assert group["key"]["expected_state"] == state
        assert group["key"]["expected_classification"] == overall
        if case_id in {"HELIXOS-L9-015-C0577", "HELIXOS-L9-015-C0580"}:
            assert cid == "OS015-NEG-COMPOSITE-a0f8ffe7cb48eb9237554e7c9344182b48c98fed14721acb96cafa89481c6429"
            assert overall == "management_material_violation" and state == "unknown"
        assert case_current[case_id]["negative_class_ref"] == cid

    l4_ids = {row["class_id"] for row in l4["failure_classifications"]}
    l8_ids = {row["class_id"] for row in l8["negative_equivalence_classes"]}
    missing = l4_ids - l8_ids
    assert missing == SINGLETONS, (missing, SINGLETONS)
    assert len(l4_ids) == len(l5["failure_rules"]) == 51
    assert len(l8_ids) == 45 and len(missing) == 6
    assert len(l8["unit_cases"]) == 583
    assert l8["composite_class_formation_verification"]["raw_input_source"]["path"] == L7
    assert "L9 case expected" in l8["composite_class_formation_verification"]["method"]
    assert "L9" not in l8["composite_class_formation_verification"]["population_source"]["path"]
    return {
        "status": "PASS",
        "base_revision": BASE,
        "l4_l5_l8_counts": [len(l4_ids), len(l5["failure_rules"]), len(l8_ids)],
        "new_l5_rules": 18,
        "new_l8_classes": 18,
        "new_l8_case_links": len(case_assignments),
        "preserved_prior_case_links": len(prior),
        "l8_case_count": len(l8["unit_cases"]),
        "expected_condition_preserved_all_583": True,
        "corrected_cases_axis_state_verified": len(corrected_expected),
        "singleton_less_ids": sorted(missing),
        "l5_sha256": sha((ROOT / L5).read_bytes()),
        "l8_sha256": sha((ROOT / L8).read_bytes()),
        "l9_expected_loaded": False,
    }


if __name__ == "__main__":
    print(json.dumps(main(), ensure_ascii=False, indent=2))
