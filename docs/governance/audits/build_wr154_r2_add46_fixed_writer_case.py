#!/usr/bin/env python3
"""ADD-46の固定RecordOccurrence writer leafを静的JSON根拠として生成する。

入力刺激は固定した過去の合成fixtureから選ぶ。期待RecordOccurrenceは現行L4/L5の根拠規則から組み立て、
L8/L9の期待値からは作らない。このscriptはharness producer、test、checker、runtime、CI、U-IDを実行しない。
"""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
from pathlib import Path

L8 = "docs/helix-harness/L8-unit-verification/product-template-application.json"
L4 = "docs/helix-harness/L4-basic-design/product-template-application.json"
L5 = "docs/helix-harness/L5-detail-design/product-template-application.json"
INPUT_REVISION = "c9fcb23c010ede88c528c4959929b8bdfedb730e"
INPUT_POINTER = "/fixture_contract/normal_fixtures/0/input"
CASE_ID = "HARNESS-L8-009-ADD-46"
WRITER_POINTER = "/f05_detail_contract/field_content_source_failure_writer_contract/writers/0"
TYPE_POINTER = "/f05_detail_contract/types/RecordOccurrence"


def at_pointer(value, path: str):
    if path == "":
        return value
    if not path.startswith("/"):
        raise ValueError(f"RFC 6901 pointerではない: {path}")
    for raw_token in path[1:].split("/"):
        token = raw_token.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def present(pointer: str, value):
    return {"tag": "present", "location": {"root": "validation_input", "pointer": pointer}, "value": value}


def build_case(root: Path, source_revision: str):
    l8 = json.loads((root / L8).read_text())
    l4 = json.loads((root / L4).read_text())
    l5 = json.loads((root / L5).read_text())
    historical_l8 = json.loads(
        subprocess.check_output(
            ["git", "show", f"{source_revision}:{L8}"], cwd=root, text=True
        )
    )
    raw = at_pointer(historical_l8, INPUT_POINTER)
    source_field = at_pointer({"field_inputs": raw["field_inputs"]}, "/field_inputs/0")
    source_record = at_pointer({"semantic_records": raw["semantic_records"]}, "/semantic_records/9")
    input_slice = {
        "field_inputs": [source_field],
        "semantic_records": [source_record],
        "sources": [],
    }
    field = input_slice["field_inputs"][0]
    record = input_slice["semantic_records"][0]
    assert record["ref"] in field["definition_refs"]
    assert record["binding"] == field["binding"]
    assert isinstance(record["source_ref"], dict) and record["source_ref"]
    assert input_slice["sources"] == []

    writer = at_pointer(l5, WRITER_POINTER)
    occurrence_type = at_pointer(l5, TYPE_POINTER)
    vocabulary = at_pointer(l4, "/field_semantic_evidence_contract/basic_candidate_return/cause_vocabulary")
    assert writer["cause"]["kind"] == "source_unresolved"
    assert writer["cause"]["kind"] in vocabulary
    assert "validation.input.sourcesを全探索" in writer["trigger_ja"]
    assert set(occurrence_type["members"]) == {
        "origin", "original_record", "ref_read", "binding_read", "source_ref_read",
        "ref_relation", "binding_relation", "source_observation_indices",
        "body_occurrences", "owner_bindings", "causes",
    }

    record_path = "/semantic_records/0"
    ref_read = present(record_path + "/ref", record["ref"])
    binding_read = present(record_path + "/binding", record["binding"])
    source_ref_read = present(record_path + "/source_ref", record["source_ref"])
    source_collection_read = present("/sources", [])
    expected = {
        "origin": {
            "collection": "semantic_records",
            "index": 0,
            "locator": {"root": "validation_input", "pointer": record_path},
        },
        "original_record": {"tag": "semantic_record", "value": record},
        "ref_read": ref_read,
        "binding_read": binding_read,
        "source_ref_read": source_ref_read,
        "ref_relation": "corresponding",
        "binding_relation": "corresponding",
        "source_observation_indices": [],
        "body_occurrences": [],
        "owner_bindings": [],
        "causes": [
            {
                "kind": writer["cause"]["kind"],
                "target": {"root": "validation_input", "pointer": record_path + "/source_ref"},
                "left": {"tag": "original", "read": source_ref_read},
                "right": {"tag": "original", "read": source_collection_read},
                "rule_pointer": WRITER_POINTER,
            }
        ],
    }
    assert set(expected) == set(occurrence_type["members"])
    assert expected["causes"][0]["kind"] == writer["cause"]["kind"]
    assert expected["causes"][0]["target"]["pointer"] == record_path + "/source_ref"
    assert expected["causes"][0]["right"]["read"]["value"] == input_slice["sources"]

    return {
        "scope_ja": "L5 writers/0が生成するRecordOccurrence一件の閉じた期待。F05DetailedReturn全体やfield/proposal親返却の期待ではない。",
        "input_provenance": {
            "revision": source_revision,
            "path": L8,
            "pointer": INPUT_POINTER,
            "selected_pointers": ["/field_inputs/0", "/semantic_records/9"],
            "use_ja": "既存の合成意味レコードとFieldInputを固定刺激として切り出す。期待値はこの下流fixtureやL9から作らず、L4/L5のwriter条件と型から独立に記述する。sourcesだけ空配列へ固定し、lookup miss条件を作る。",
        },
        "input_slice": input_slice,
        "expected_record_occurrence": expected,
        "expectation_basis": [
            {"path": L4, "pointer": "/field_source_materialization_contract/ordered_source_materialization/3"},
            {"path": L4, "pointer": "/field_semantic_evidence_contract/basic_candidate_return/cause_vocabulary"},
            {"path": L5, "pointer": TYPE_POINTER},
            {"path": L5, "pointer": WRITER_POINTER},
        ],
        "unformed_extent_ja": [
            "このsliceはF05DetailedRequest全体ではない。Context/header、前段comparison、Selection、呼出元、親返却の5-member F05DetailedReturn、他field/sibling evidenceは期待に含めない。",
            "source_refに対応するSourceEnvelopeが存在しないためsource occurrence、body occurrence、source owner bindingは形成しない。actual candidate比較列の親集約もこのRecordOccurrence期待の外。",
            "ownerが不明というnegativeを作るのではなく、このwriter leafには対応sourceがないのでowner_bindingsを空のままにする。F05全体でのowner材料の期待は別途未形成。",
            "ADD-46のexecution_stateはnot_executedのまま。U-ID、producer実行、L9対応、pair freezeを成立済みとはしない。",
        ],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True, type=Path, help="repository/worktreeのroot")
    parser.add_argument("--output", required=True, help="--rootからの相対出力path")
    parser.add_argument("--source-revision", default=INPUT_REVISION)
    args = parser.parse_args()
    root = args.root.resolve()
    target = root / L8
    doc = json.loads(target.read_text())
    row = next(item for item in doc["additional_unit_cases"] if item["id"] == CASE_ID)
    if row.get("execution_state") != "not_executed":
        raise SystemExit("ADD-46のexecution_stateはnot_executedのままにする")
    case = build_case(root, args.source_revision)
    existing = row.get("fixed_writer_case")
    if existing is not None and existing != case:
        raise SystemExit("既存fixed_writer_caseがsource根拠から生成したcaseと一致しない")
    row["fixed_writer_case"] = case
    output = root / args.output
    if not output.resolve().is_relative_to(root):
        raise SystemExit("--outputは--root配下に置く")
    output.parent.mkdir(parents=True, exist_ok=True)
    encoded = (json.dumps(doc, ensure_ascii=False, indent=1) + "\n").encode()
    output.write_bytes(encoded)
    print(f"output={output}")
    print(f"sha256={hashlib.sha256(encoded).hexdigest()}")
    print(f"case={CASE_ID}; execution_state=not_executed")
    print("scope=RecordOccurrence writer leafのみ。F05全体返却/pair freezeは未形成")


if __name__ == "__main__":
    main()
