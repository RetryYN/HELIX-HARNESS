#!/usr/bin/env python3
"""Static WR181 OS015 L5/L8 checks; L9 expected material is not loaded."""
from __future__ import annotations

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
SCENARIOS = {
    "HELIXOS-L9-015-C0584": {
        "class_id": "OS015-NEG-COMPOSITE-62fb66a6e279702c28b1aa4f8ee9380369f59c8322c999587e174c6c4992b558",
        "finding_codes": ["original_event_mutated", "source_unresolved", "unresolved_promoted_to_current"],
        "condition": "management_material_violation",
        "axis": "original_event",
        "state": "violation",
        "replacements": [
            {"path": ["records", "target_a", "original_event", "event_id"], "value": None},
            {"path": ["records", "target_a", "current_material_claim"], "value": True},
        ],
    },
    "HELIXOS-L9-015-C0585": {
        "class_id": "OS015-NEG-COMPOSITE-deac8ce9011311dc91b808f2f94e7d2dcd7320bd68b2b820d7eeef6ac092e7f9",
        "finding_codes": ["authority_state_unresolved", "unresolved_promoted_to_current"],
        "condition": "management_material_violation",
        "axis": "authority",
        "state": "violation",
        "replacements": [
            {"path": ["records", "target_a", "authority_state"], "value": None},
            {"path": ["records", "target_a", "current_material_claim"], "value": True},
        ],
    },
}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git_raw(revision: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)


def load(path: str) -> dict:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def resolve(doc: dict, pointer: str):
    value = doc
    for part in pointer[1:].split("/") if pointer else []:
        part = part.replace("~1", "/").replace("~0", "~")
        value = value[int(part)] if isinstance(value, list) else value[part]
    return value


def expand_l7(l7: dict, replacements: list[dict]) -> tuple[dict, str]:
    value = copy.deepcopy(l7["connection_materials"]["OS015"]["case"]["fixture_inputs"]["inspect"])
    for replacement in replacements:
        target = value
        for part in replacement["path"][:-1]:
            target = target[part]
        target[replacement["path"][-1]] = replacement["value"]
    digest = sha(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())
    return value, digest


def without_source_pointers(row: dict) -> dict:
    result = copy.deepcopy(row)
    result.pop("source_pointers", None)
    return result


def main() -> dict:
    l3, l4, l5, l7, l8 = (load(p) for p in (L3, L4, L5, L7, L8))
    base5, base8 = (json.loads(git_raw(BASE, p)) for p in (L5, L8))
    base7 = git_raw(BASE, L7)
    assert sha(base7) == sha((ROOT / L7).read_bytes()), "L7 raw source changed"
    assert len(l4["failure_classifications"]) == len(l5["failure_rules"]) == 47
    assert len(l8["negative_equivalence_classes"]) == 47
    assert len(base8["unit_cases"]) == 583 and len(l8["unit_cases"]) == 585

    l4_by_id = {row["class_id"]: (i, row) for i, row in enumerate(l4["failure_classifications"])}
    l5_by_id = {row["id"]: (i, row) for i, row in enumerate(l5["failure_rules"])}
    l8_by_id = {row["class_id"]: row for row in l8["negative_equivalence_classes"]}
    assert set(l4_by_id) == set(l5_by_id) == set(l8_by_id)
    assert not (SINGLETONS & set(l5_by_id))
    assert {row["id"] for row in base5["failure_rules"]} - set(l5_by_id) == SINGLETONS
    assert {row["id"] for row in l5["failure_rules"] if row["id"] not in {x["id"] for x in base5["failure_rules"]}} == {s["class_id"] for s in SCENARIOS.values()}
    assert {row["class_id"] for row in base8["negative_equivalence_classes"]} <= set(l8_by_id)
    assert {row["class_id"] for row in l8["negative_equivalence_classes"] if row["class_id"] not in {x["class_id"] for x in base8["negative_equivalence_classes"]}} == {s["class_id"] for s in SCENARIOS.values()}

    for cid, (_, row4) in l4_by_id.items():
        row5 = l5_by_id[cid][1]
        row8 = l8_by_id[cid]
        expected = (row4["expected_classification"], row4["expected"]["finding_codes"], row4["expected_axis"], row4["expected_state"], row4["side_effect_count"])
        for row in (row5, row8):
            actual = (row["expected_classification"], row["expected"]["finding_codes"], row["expected_axis"], row["expected_state"], row["side_effect_count"])
            assert actual == expected, cid
            if "backflow_owner" in row:
                assert row["backflow_owner"] == row4["backflow_owner"], cid

    # Existing L5 rules retain every field other than repaired source pointers.
    current5 = {row["id"]: row for row in l5["failure_rules"]}
    for old in base5["failure_rules"]:
        if old["id"] in SINGLETONS:
            continue
        assert without_source_pointers(current5[old["id"]]) == without_source_pointers(old), old["id"]
    # Existing L8 classes retain their full values except repaired index pointers.
    current8_classes = {row["class_id"]: row for row in l8["negative_equivalence_classes"]}
    for old in base8["negative_equivalence_classes"]:
        assert without_source_pointers(current8_classes[old["class_id"]]) == without_source_pointers(old), old["class_id"]

    # Check source pointers resolve and class-index pointers target the named class.
    cache = {L3: l3, L4: l4, L5: l5, L7: l7, L8: l8}
    for class_row in l8["negative_equivalence_classes"]:
        cid = class_row["class_id"]
        for source in class_row.get("source_pointers", []):
            if source["path"] not in cache:
                cache[source["path"]] = load(source["path"])
            for pointer in source["pointers"]:
                target = resolve(cache[source["path"]], pointer)
                if source["path"] == L4 and pointer.startswith("/failure_classifications/"):
                    assert target["class_id"] == cid, cid
                if source["path"] == L5 and pointer.startswith("/failure_rules/"):
                    assert target["id"] == cid, cid
    for class_row in l5["failure_rules"]:
        for source in class_row.get("source_pointers", []):
            if source["path"] not in cache:
                cache[source["path"]] = load(source["path"])
            for pointer in source["pointers"]:
                resolve(cache[source["path"]], pointer)

    # All old 583 unit cases, including the existing 112 residual links, stay byte-semantic identical.
    base_cases = {row["case_id"]: row for row in base8["unit_cases"]}
    current_cases = {row["case_id"]: row for row in l8["unit_cases"]}
    assert len(base_cases) == 583 and len(current_cases) == 585
    assert list(current_cases)[:583] == list(base_cases)
    for case_id, old in base_cases.items():
        assert current_cases[case_id] == old, case_id
    base_links = {cid: row["negative_class_ref"] for cid, row in base_cases.items() if "negative_class_ref" in row}
    current_links = {cid: row["negative_class_ref"] for cid, row in current_cases.items() if "negative_class_ref" in row}
    assert len(base_links) == 572 and all(current_links.get(cid) == class_id for cid, class_id in base_links.items())

    # Reconcile the earlier residual projection manifest against its fixed L7 raw sources.
    manifest = load("scaffold/research/wr181-os015-residual-l4-l9-20261030/projection-manifest.json")
    linked112 = {}
    for group in manifest["classes"]:
        for item in group["l7_raw_inputs"]:
            case_id = item["case_id"]
            assert case_id not in linked112
            assert current_links.get(case_id) == group["class_id"]
            actual_input = resolve(l7, item["l7_input_pointer"])
            assert actual_input["expanded_input_sha256"] == item["expanded_input_sha256"]
            linked112[case_id] = group["class_id"]
    assert len(linked112) == 112
    pr_a = load("scaffold/research/wr181-os015-pr-a-l4-l9-20261030/case-evidence.json")
    links29 = {item["case_id"]: item["class_id"] for item in pr_a["case_assignments"]}
    assert len(links29) == 29 and all(current_links.get(cid) == class_id for cid, class_id in links29.items())

    # The two new inputs are forward-projected from L7 fixture_inputs.inspect.
    new_cases = {row["case_id"]: row for row in l8["unit_cases"][583:]}
    assert set(new_cases) == set(SCENARIOS)
    evidence = load("scaffold/research/wr181-os015-l5-l8-successor-20261031/source-projection-evidence.json")
    evidence_by_id = {row["case_id"]: row for row in evidence["cases"]}
    assert set(evidence_by_id) == set(SCENARIOS)
    for case_id, spec in SCENARIOS.items():
        row = new_cases[case_id]
        evidence_row = evidence_by_id[case_id]
        assert row["l7_material_ref"] == {"path": L7, "pointer": "/connection_materials/OS015/case/fixture_inputs/inspect"}
        assert row["forward_stimulus_replacements"] == spec["replacements"]
        expanded, digest = expand_l7(l7, spec["replacements"])
        assert evidence_row["expanded_input_sha256"] == digest
        assert evidence_row["stimulus_replacements"] == spec["replacements"]
        assert evidence_row["l4_class_id"] == spec["class_id"]
        assert expanded["phase"] == row["phase"] == "inspect"
        _, row4 = l4_by_id[spec["class_id"]]
        _, row5 = l5_by_id[spec["class_id"]]
        manual = (spec["condition"], spec["finding_codes"], spec["axis"], spec["state"])
        assert manual == (row4["expected_classification"], row4["expected"]["finding_codes"], row4["expected_axis"], row4["expected_state"])
        assert manual == (row5["expected_classification"], row5["expected"]["finding_codes"], row5["expected_axis"], row5["expected_state"])
        for code in set(spec["finding_codes"]):
            owner_rows = [r for r in l5["failure_rules"] if code in r.get("expected", {}).get("finding_codes", [])]
            assert owner_rows and {r.get("function_ref") for r in owner_rows} == {FUNCTION}
            assert {r.get("contract_ref") for r in owner_rows} == {None}
        assert row["condition"] == spec["condition"]
        assert row["expected"]["finding_codes"] == spec["finding_codes"]
        assert row["negative_class_ref"] == row["rule_ref"] == spec["class_id"]
        assert row["function_ref"] == FUNCTION
        assert row["expected_preserved"] is True and row["noneffects_all_false"] is True

    expected_pair = [
        {"path": L4, "revision": BASE, "sha256": sha(git_raw(BASE, L4))},
        {"path": L9, "revision": BASE, "sha256": sha(git_raw(BASE, L9))},
    ]
    assert l5["source_pair_pins"] == expected_pair
    assert l8["source_pair_pins"] == expected_pair
    candidate = l8["candidate_l5_bytes"]
    assert candidate["path"] == L5 and candidate["same_candidate"] is True
    assert sha(git_raw(candidate["revision"], L5)) == candidate["sha256"] == sha((ROOT / L5).read_bytes())
    reachable = subprocess.check_output(["git", "rev-list", "HEAD"], cwd=ROOT, text=True).splitlines()
    assert candidate["revision"] in reachable

    return {
        "result": "PASS",
        "source_base": BASE,
        "l4_class_count": len(l4_by_id),
        "l5_rule_count": len(l5_by_id),
        "l8_class_count": len(l8_by_id),
        "l8_unit_case_count": len(current_cases),
        "removed_singleton_count": len(SINGLETONS),
        "new_composite_count": 2,
        "old_case_rows_exactly_preserved": 583,
        "old_class_link_count_preserved": len(base_links),
        "residual_manifest_links_preserved": len(linked112),
        "earlier_pr_a_links_preserved": len(links29),
        "new_forward_input_case_ids": sorted(new_cases),
        "source_input_hashes": {case_id: evidence_by_id[case_id]["expanded_input_sha256"] for case_id in sorted(evidence_by_id)},
        "candidate_l5_revision": candidate["revision"],
        "source_pair_revision": BASE,
        "l9_expected_material_loaded": False,
        "l7_expected_proposal_used": False,
    }


if __name__ == "__main__":
    print(json.dumps(main(), ensure_ascii=False, indent=2))
