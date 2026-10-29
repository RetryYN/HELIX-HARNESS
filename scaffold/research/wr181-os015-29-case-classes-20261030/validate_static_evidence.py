#!/usr/bin/env python3
"""静的なcase evidence整合性検査。L4 comparatorを実装・実行しない。"""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
EVIDENCE_PATH = "scaffold/research/wr181-os015-29-case-classes-20261030/case-evidence.json"
BASE_REVISION = "dd5787507a9ef3b69f411074e2fcbc7710ca1d62"
L4 = "docs/helix-os/L4-basic-design/management-authority-source-record.json"
L5 = "docs/helix-os/L5-detail-design/management-authority-source-record.json"
L3 = "docs/helix-os/L3-requirements/functional-requirements.json"
L7 = "docs/helix-os/L7-function-verification/management-authority-source-record.json"
L8 = "docs/helix-os/L8-unit-verification/management-authority-source-record.json"
L9 = "docs/helix-os/L9-integration-verification/management-authority-source-record.json"
CLASS_CONFLICT = "OS015-NEG-composite-original_event_mutated-source_conflict-original_event"
CLASS_UNRESOLVED = "OS015-NEG-composite-original_event_mutated-source_unresolved-original_event"
SELECTED_IDS = [
    *(f"HELIXOS-L9-015-C{i:04d}" for i in range(45, 62)),
    *(f"HELIXOS-L9-015-C{i:04d}" for i in range(102, 114)),
]
ALLOWED_CASE_LINK_CHANGES = {
    L8: {"negative_class_ref", "l7_material_ref", "rule_ref", "function_ref"},
    L9: {"negative_class_ref", "material_ref"},
}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load(path: str):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def git_json(revision: str, path: str):
    raw = subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)
    return json.loads(raw), raw


def validate_revision_pin(pin):
    raw = subprocess.check_output(["git", "show", f"{pin['revision']}:{pin['path']}"], cwd=ROOT)
    assert sha256(raw) == pin["sha256"], (pin["path"], pin["revision"])
    subprocess.check_call(["git", "merge-base", "--is-ancestor", pin["revision"], "HEAD"], cwd=ROOT)


def pointer_for(parts) -> str:
    return "/" + "/".join(str(part).replace("~", "~0").replace("/", "~1") for part in parts)


def resolve_pointer(document, pointer: str):
    if pointer == "":
        return document
    assert pointer.startswith("/"), f"RFC 6901 pointerではない: {pointer}"
    value = document
    for token in pointer[1:].split("/"):
        token = token.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def canonical_hash(value) -> str:
    return sha256(json.dumps(value, sort_keys=True, separators=(",", ":")).encode())


def strip_links(row, fields):
    clone = json.loads(json.dumps(row))
    for field in fields:
        clone.pop(field, None)
    return clone


def main():
    evidence = load(EVIDENCE_PATH)
    l3, l4, l5, l7, l8, l9 = (load(path) for path in (L3, L4, L5, L7, L8, L9))
    assignments = evidence["case_assignments"]
    assert evidence["base_revision"] == BASE_REVISION
    assert [row["case_id"] for row in assignments] == SELECTED_IDS
    assert evidence["case_count"] == len(SELECTED_IDS) == 29

    # pair pinsは歴史上の親revisionを参照し、そのcommit内の対象path bytesと
    # 現在branchからの祖先到達性を確認する。L8のL5 pinはL5の確定commitを指す。
    assert len(l5["source_pair_pins"]) == 2
    assert l5["source_pair_pins"] == l8["source_pair_pins"]
    for pin in l5["source_pair_pins"]:
        validate_revision_pin(pin)
    candidate_l5_pin = l8["candidate_l5_bytes"]
    validate_revision_pin(candidate_l5_pin)
    assert candidate_l5_pin["same_candidate"] is True
    assert sha256((ROOT / L5).read_bytes()) == candidate_l5_pin["sha256"]

    # 指定revisionの原本hashと、候補のsource bytesを照合する。L4/L5の
    # comparatorやcase classを入力値から計算することはしない。
    source_documents = {L3: l3, L4: l4, L5: l5, L7: l7, L8: l8, L9: l9}
    for path, pins in evidence["source_pins"].items():
        _, base_raw = git_json(BASE_REVISION, path)
        assert sha256(base_raw) == pins["base_sha256"], path
        assert sha256((ROOT / path).read_bytes()) == pins["candidate_sha256"], path

    l4_classes = {row["class_id"]: row for row in l4["failure_classifications"]}
    l5_rules = {row["id"]: row for row in l5["failure_rules"]}
    definitions = evidence["class_definitions"]
    assert set(definitions) == {CLASS_CONFLICT, CLASS_UNRESOLVED}
    for class_id, definition in definitions.items():
        l4_row, l5_row = l4_classes[class_id], l5_rules[class_id]
        declared = {
            "finding_codes": l4_row["expected"]["finding_codes"],
            "axis": l4_row["expected_axis"],
            "state": l4_row["expected_state"],
            "owner": l4_row["backflow_owner"],
            "function_ref": l5_row["function_ref"],
        }
        for key, value in declared.items():
            assert definition[key] == value, (class_id, key)
        assert l5_row["expected"]["finding_codes"] == declared["finding_codes"]
        assert l5_row["expected_axis"] == declared["axis"]
        assert l5_row["expected_state"] == declared["state"]
        assert l5_row["backflow_owner"] == declared["owner"]

    l7_case = l7["connection_materials"]["OS015"]["case"]
    fixture = l7_case["fixture_inputs"]["inspect"]
    l8_cases, l9_cases = l8["unit_cases"], l9["integration_cases"]
    assert len(l8_cases) == len(l9_cases) == 583
    case_index = {row["id"]: index for index, row in enumerate(l7_case["cases"])}
    assigned_input_pointers = {CLASS_CONFLICT: set(), CLASS_UNRESOLVED: set()}

    for assignment in assignments:
        case_id = assignment["case_id"]
        assert assignment["class_id"] in definitions
        index = case_index[case_id]
        source_pointer = f"/connection_materials/OS015/case/cases/{index}/given/input"
        assert assignment["l7_input_pointer"] == source_pointer
        case = resolve_pointer(l7, source_pointer)
        assert case["base_ref"] == "inspect"
        assert len(case["replacements"]) == 1
        replacement = case["replacements"][0]
        assert assignment["stimulus_path"] == pointer_for(replacement["path"])
        assert assignment["stimulus_value"] == replacement["value"]

        # 固定fixtureと記録済み単一replacementからgiven.input bytesを確認するだけ。
        # 下記の手作業class/finding宣言はこの操作から生成しない。
        expanded = json.loads(json.dumps(fixture))
        cursor = expanded
        for token in replacement["path"][:-1]:
            cursor = cursor[token]
        cursor[replacement["path"][-1]] = replacement["value"]
        input_hash = canonical_hash(expanded)
        assert input_hash == case["expanded_input_sha256"]
        assert input_hash == assignment["expanded_input_sha256"]

        class_id = assignment["class_id"]
        declared_codes = definitions[class_id]["finding_codes"]
        assert [finding["code"] for finding in assignment["l4_findings"]] == declared_codes
        # 手作業記録のfinding pointerがL4の固定入力documentで解決することだけを確認。
        for finding in assignment["l4_findings"]:
            resolve_pointer(expanded, finding["pointer"])
        assigned_input_pointers[class_id].add(source_pointer)

        l8_case, l9_case = l8_cases[index], l9_cases[index]
        assert l8_case["id"] == l9_case["id"] == case_id
        assert l8_case["negative_class_ref"] == class_id
        assert l9_case["negative_class_ref"] == class_id
        assert l8_case["rule_ref"] == class_id
        assert l8_case["function_ref"] == definitions[class_id]["function_ref"]
        assert l8_case["l7_material_ref"]["pointer"] == source_pointer
        assert l9_case["material_ref"]["pointer"] == source_pointer

    # L8/L9 class row source linksは手作業assignment一覧のmemberと一致する。
    for path, document in ((L8, l8), (L9, l9)):
        for class_id in definitions:
            row = next(r for r in document["negative_equivalence_classes"] if r["class_id"] == class_id)
            refs = {
                pointer
                for source in row["source_pointers"]
                if source["path"] == L7
                for pointer in source["pointers"]
            }
            expected = {"/connection_materials/OS015/case/fixture_inputs/inspect"}
            expected.update(assigned_input_pointers[class_id])
            assert refs == expected, (path, class_id, refs, expected)

    # 新規class rowが宣言した全source pointersをRFC 6901 resolverで確認する。
    for document, key, id_field in (
        (l4, "failure_classifications", "class_id"),
        (l5, "failure_rules", "id"),
        (l8, "negative_equivalence_classes", "class_id"),
        (l9, "negative_equivalence_classes", "class_id"),
    ):
        for class_id in definitions:
            row = next(r for r in document[key] if r.get(id_field) == class_id)
            for source in row["source_pointers"]:
                source_document = source_documents[source["path"]]
                for pointer in source["pointers"]:
                    resolve_pointer(source_document, pointer)

    # 583 case全行の期待を基点とcanonical比較し、許可link以外の変化を拒否。
    selected_indices = {case_index[case_id] for case_id in SELECTED_IDS}
    for path, key, current_rows in ((L8, "unit_cases", l8_cases), (L9, "integration_cases", l9_cases)):
        base_document, _ = git_json(BASE_REVISION, path)
        base_rows = base_document[key]
        assert len(base_rows) == len(current_rows)
        for index, (before, after) in enumerate(zip(base_rows, current_rows)):
            assert before["id"] == after["id"]
            assert strip_links(before, ALLOWED_CASE_LINK_CHANGES[path]) == strip_links(after, ALLOWED_CASE_LINK_CHANGES[path]), (path, index)
            if index not in selected_indices:
                for field in ALLOWED_CASE_LINK_CHANGES[path]:
                    assert before.get(field) == after.get(field), (path, index, field)

    counts = {class_id: sum(row["class_id"] == class_id for row in assignments) for class_id in definitions}
    assert counts == evidence["class_counts"]
    print(json.dumps({"static_evidence": "PASS", "case_count": len(assignments), "class_counts": counts, "all_583_l8_l9_rows_preserved_outside_links": True}, ensure_ascii=False))


if __name__ == "__main__":
    main()
