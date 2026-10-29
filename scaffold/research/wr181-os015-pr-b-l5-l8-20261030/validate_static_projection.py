#!/usr/bin/env python3
"""WR181 PR-BのL5/L8文書を静的に照合する。期待・findingは算出しない。"""
from __future__ import annotations
import hashlib, json, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = "1d12ab087e9ffb1935ee23da85a6bd4ee51538f6"  # L8 expectation comparison baseline; identical at latest main 97e0ee18
LATEST_MAIN = "97e0ee18a98d6f9714e29fa0fae3a3c58cdeead1"
PAIR_REV = "36947baf69999c99d5370d804d69ee2f3acaed72"
L3 = "docs/helix-os/L3-requirements/functional-requirements.json"
L4 = "docs/helix-os/L4-basic-design/management-authority-source-record.json"
L5 = "docs/helix-os/L5-detail-design/management-authority-source-record.json"
L7 = "docs/helix-os/L7-function-verification/management-authority-source-record.json"
L8 = "docs/helix-os/L8-unit-verification/management-authority-source-record.json"
L9 = "docs/helix-os/L9-integration-verification/management-authority-source-record.json"
CASE_EVIDENCE = "scaffold/research/wr181-os015-pr-a-l4-l9-20261030/case-evidence.json"
L5_REV = "d0b9aadf37a53a182bf6188495771c17fd06e16c"
L5_SHA = "c7d979d397f7ebc9b82b1cb5fa3e32f82737956c6a54adc2080342b729607c7f"
CLASS_IDS = [
    "OS015-NEG-COMPOSITE-07c9fd844a293140f5dc77476ab8ed90116889361788956739abfdcf65b874c4",
    "OS015-NEG-COMPOSITE-4e0c28b06920d3a9665cbe4beeaf48cea44d7b0d350dddfaec9c8471de1e86b5",
]
SELECTED = [*(f"HELIXOS-L9-015-C{i:04d}" for i in range(45, 62)), *(f"HELIXOS-L9-015-C{i:04d}" for i in range(102, 114))]
LINK_FIELDS = {"l7_material_ref", "negative_class_ref", "rule_ref", "function_ref"}

def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()

def load(path: str):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))

def git_raw(revision: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)

def resolve(doc, pointer: str):
    assert pointer == "" or pointer.startswith("/"), pointer
    value = doc
    for raw in pointer[1:].split("/") if pointer else []:
        token = raw.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value

def main() -> dict:
    l3, l4, l5, l7, l8, l9 = (load(p) for p in (L3, L4, L5, L7, L8, L9))
    evidence = load(CASE_EVIDENCE)
    base5 = json.loads(git_raw(BASE, L5))
    base8 = json.loads(git_raw(BASE, L8))
    assert sha(git_raw(LATEST_MAIN, L8)) == sha(git_raw(BASE, L8))
    assert sha(git_raw(PAIR_REV, L4)) == "9146ffd557bc5da60f79cdcd462578b38edf6ec524143a705ab07eeb34c7997b"
    assert sha(git_raw(PAIR_REV, L9)) == "392417ce60ff10beed23d1aee27aadc7afaaf4062fb1dc04473325e30ad2c7e5"
    assert sha(git_raw(L5_REV, L5)) == L5_SHA
    assert sha((ROOT / L5).read_bytes()) == L5_SHA
    assert L5_REV in subprocess.check_output(["git", "rev-list", "HEAD"], cwd=ROOT, text=True).splitlines()

    expected_pair = [
        {"path": L4, "revision": PAIR_REV, "sha256": "9146ffd557bc5da60f79cdcd462578b38edf6ec524143a705ab07eeb34c7997b"},
        {"path": L9, "revision": PAIR_REV, "sha256": "392417ce60ff10beed23d1aee27aadc7afaaf4062fb1dc04473325e30ad2c7e5"},
    ]
    assert l5["source_pair_pins"] == expected_pair
    assert l8["source_pair_pins"] == expected_pair
    assert l8["candidate_l5_bytes"] == {"path": L5, "revision": L5_REV, "same_candidate": True, "sha256": L5_SHA}

    assert len(base5["failure_rules"]) == 31 and len(l5["failure_rules"]) == 33
    assert l5["failure_rules"][:31] == base5["failure_rules"]
    assert len(base8["negative_equivalence_classes"]) == 25 and len(l8["negative_equivalence_classes"]) == 27
    assert l8["negative_equivalence_classes"][:25] == base8["negative_equivalence_classes"]
    assert len(base8["unit_cases"]) == len(l8["unit_cases"]) == 583
    changed = []
    for before, after in zip(base8["unit_cases"], l8["unit_cases"]):
        assert before["case_id"] == after["case_id"]
        assert before.get("condition") == after.get("condition")
        assert before.get("expected") == after.get("expected")
        assert before.get("expected_preserved") == after.get("expected_preserved")
        delta = {key for key in set(before) | set(after) if before.get(key) != after.get(key)}
        if delta:
            assert delta <= LINK_FIELDS, (before["case_id"], delta)
            changed.append(before["case_id"])
    assert changed == SELECTED, (len(changed), changed)
    evidence_by_case = {row["case_id"]: row for row in evidence["case_assignments"]}
    assert list(evidence_by_case) == SELECTED

    l4_rows = l4["failure_classifications"]
    l5_rows = l5["failure_rules"]
    l8_rows = l8["negative_equivalence_classes"]
    l5_by_id = {x["id"]: x for x in l5_rows}
    l8_by_id = {x["class_id"]: x for x in l8_rows}
    for idx, cid in enumerate(CLASS_IDS):
        l4row = resolve(l4, f"/failure_classifications/{31 + idx}")
        l5row = resolve(l5, f"/failure_rules/{31 + idx}")
        l8row = l8_by_id[cid]
        assert l4row["class_id"] == l5row["id"] == l8row["class_id"] == cid
        assert l4row["expected"]["finding_codes"] == l5row["expected"]["finding_codes"] == l8row["expected"]["finding_codes"]
        assert l4row["expected_axis"] == l5row["expected_axis"] == l8row["expected_axis"]
        assert l4row["expected_state"] == l5row["expected_state"] == l8row["expected_state"]
        for layer_doc, rows in ((l5, [l5row]), (l8, [l8row])):
            for row in rows:
                for source in row.get("source_pointers", []):
                    assert source["path"] in (L3, L4, L5, L7), (cid, source["path"])
                    source_doc = {L3:l3,L4:l4,L5:l5,L7:l7}[source["path"]]
                    for pointer in source["pointers"]:
                        resolve(source_doc, pointer)
    class_size = {cid: 0 for cid in CLASS_IDS}
    for case_id in SELECTED:
        row = next(x for x in l8["unit_cases"] if x["case_id"] == case_id)
        evidence_row = evidence_by_case[case_id]
        cid = row["negative_class_ref"]
        assert cid == evidence_row["class_id"]
        assert cid in CLASS_IDS and row["rule_ref"] == cid and row["function_ref"] == "FN-OS015-01"
        assert row["l7_material_ref"]["path"] == L7
        assert row["l7_material_ref"]["pointer"] == evidence_row["l7_input_pointer"]
        resolve(l7, row["l7_material_ref"]["pointer"])
        assert l5_by_id[cid]["function_ref"] == row["function_ref"]
        class_size[cid] += 1
    assert class_size == {CLASS_IDS[0]: 15, CLASS_IDS[1]: 14}, class_size
    assert sha((ROOT / L9).read_bytes()) == expected_pair[1]["sha256"]
    assert len(l4_rows) == 33 and len(l5_rows) == 33 and len(l8_rows) == 27 and len(l9["negative_equivalence_classes"]) == 27
    return {
        "status": "PASS",
        "base_revision": BASE,
        "latest_main_revision": LATEST_MAIN,
        "pair_pin_revision": PAIR_REV,
        "l5_candidate_revision": L5_REV,
        "class_ids": CLASS_IDS,
        "selected_l8_case_count": len(SELECTED),
        "class_case_counts": class_size,
        "l8_case_rows": len(l8["unit_cases"]),
        "l8_existing_expectations_preserved": len(l8["unit_cases"]),
        "l4_l5_l8_l9_class_counts": [len(l4_rows), len(l5_rows), len(l8_rows), len(l9["negative_equivalence_classes"])],
        "l9_changed": False,
    }

if __name__ == "__main__":
    print(json.dumps(main(), ensure_ascii=False, indent=2))
