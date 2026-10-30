#!/usr/bin/env python3
"""WR206 F02候補の文書間参照だけを確認する静的validator。

F-015-05の述語やalgorithmは実行しない。L9 expectedを読む判定も行わない。
"""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = "fa3d2d515ce8df79c0a74d5360a4d1254863a6f1"
BLIND_SHA = "7adbbee23d54e79773c5c7462c14250b6640c0afb4707495275aab069fb46152"
L5_PATH = "docs/helix-harness/L5-detail-design/tdd-development-flow.json"
L8_PATH = "docs/helix-harness/L8-unit-verification/tdd-development-flow.json"
L4_PATH = "docs/helix-harness/L4-basic-design/tdd-development-flow.json"
L9_PATH = "docs/helix-harness/L9-integration-verification/tdd-development-flow.json"
BLIND_PATH = "scaffold/research/wr206-f02-l5-l8-pr-b-20261031/source/f02-blind-draft.json"
INPUT_FACTS_PATH = "scaffold/research/wr206-f02-l5-l8-pr-b-20261031/source/f02-candidate-input-facts.json"


def read_json(path: str) -> dict:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def base_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{BASE}:{path}"], cwd=ROOT)


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def at_revision_sha(pin: dict) -> str:
    data = subprocess.check_output(
        ["git", "show", f"{pin['revision']}:{pin['path']}"], cwd=ROOT
    )
    return sha(data)


def at_pointer(document: dict, pointer: str):
    value = document
    for segment in pointer.split("/"):
        if not segment:
            continue
        segment = segment.replace("~1", "/").replace("~0", "~")
        value = value[int(segment)] if isinstance(value, list) else value[segment]
    return value


def one(rows: list[dict], identity: str) -> dict:
    matches = [row for row in rows if row.get("id") == identity]
    assert len(matches) == 1, f"expected one {identity}, found {len(matches)}"
    return matches[0]


def main() -> None:
    l5 = read_json(L5_PATH)
    l8 = read_json(L8_PATH)
    l4 = read_json(L4_PATH)
    l5_base = json.loads(base_bytes(L5_PATH))
    l8_base = json.loads(base_bytes(L8_PATH))

    f5 = one(l5["contracts"], "HARNESS-L5-015-F02")
    f5_base = one(l5_base["contracts"], "HARNESS-L5-015-F02")
    candidate_l5 = f5["candidate_classification_design"]
    assert {key: value for key, value in f5.items() if key != "candidate_classification_design"} == f5_base
    candidate_function = one(l5["pure_function_signatures"], "F-015-05")
    assert "input.candidate_case_id" not in candidate_function["reads"]
    assert "candidate_case_id" not in candidate_function["returns"]
    input_type = next(row for row in l5["type_contract"]["other_types"] if row.get("name") == "F02CandidateInput")
    classification_type = next(row for row in l5["type_contract"]["other_types"] if row.get("name") == "F02CandidateClassification")
    assert "candidate_case_id" not in input_type["fields"]
    assert "candidate_case_id" not in classification_type["fields"]

    f8 = one(l8["cases"], "HARNESS-L8-015-F02")
    candidate_l8 = f8["candidate_unit_design"]
    assert l8["unit_cases"] == l8_base["unit_cases"]
    for old_case in l8_base["cases"]:
        new_case = one(l8["cases"], old_case["id"])
        if old_case["id"] == "HARNESS-L8-015-F02":
            assert {key: value for key, value in new_case.items() if key != "candidate_unit_design"} == old_case
        else:
            assert new_case == old_case

    for path in (L4_PATH, L9_PATH):
        assert (ROOT / path).read_bytes() == base_bytes(path), f"out-of-scope file changed: {path}"

    blind = (ROOT / BLIND_PATH).read_bytes()
    assert sha(blind) == BLIND_SHA
    candidate_facts = read_json(INPUT_FACTS_PATH)
    assert candidate_facts["status"].startswith("candidate_synthetic")
    assert candidate_facts["authority_effect"] == "none"
    assert len(candidate_facts["case_deltas"]) == 8

    for pin in candidate_l5["candidate_source_pins"]:
        assert at_revision_sha(pin) == pin["sha256"], f"L5 source pin mismatch: {pin['path']}"
    for pin in candidate_l8["source_pins"]:
        assert at_revision_sha(pin) == pin["sha256"], f"L8 source pin mismatch: {pin['path']}"
    for path, pointer, revision in (
        ("docs/helix-harness/L3-requirements/functional-requirements.json", "/requirements/41", "a715e777bd59291b26f09c0c1c5481273c6eba2e"),
        ("docs/helix-harness/L10-verification/functional-verification.json", "/cases/41", "a715e777bd59291b26f09c0c1c5481273c6eba2e"),
    ):
        historical = json.loads(subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT))
        current = json.loads((ROOT / path).read_text(encoding="utf-8"))
        assert at_pointer(historical, pointer) == at_pointer(current, pointer), f"reviewed F02 row drift: {path}{pointer}"

    rules = {row["code"]: row for row in candidate_l5["negative_classification_rules"]}
    l4_rows = {row["code"]: row for row in l4["contracts"][2]["negative_classifications"]}
    assert "shared_input_baseline" not in candidate_l8
    assert "source_payload" not in json.dumps(candidate_l8, ensure_ascii=False)
    assert candidate_l8["input_artifact_ref"] == INPUT_FACTS_PATH
    assert candidate_l8["shared_input_ref"] == f"{INPUT_FACTS_PATH}#/shared_input_baseline"
    assert at_pointer(candidate_facts, candidate_l8["shared_input_ref"].split("#", 1)[1])
    assert "PayloadF02.tag.value相対" in candidate_l8["case_input_resolution"]
    assert "case_id" in candidate_l8["expectation_boundary"] and "期待値選択にも使わない" in candidate_l8["expectation_boundary"]
    deltas = {row["case_id"]: row for row in candidate_facts["case_deltas"]}
    for index, case in enumerate(candidate_l8["cases"]):
        assert case["input_ref"] == f"{INPUT_FACTS_PATH}#/case_deltas/{index}"
        pointer = case["input_ref"].split("#", 1)[1]
        assert at_pointer(candidate_facts, pointer)["case_id"] == case["case_id"]
        assert case["case_id"] in deltas
    negative = [case for case in candidate_l8["cases"] if case["polarity"] == "negative"]
    positive = [case for case in candidate_l8["cases"] if case["polarity"] == "positive"]
    assert len(positive) == 2
    assert len(negative) == 6
    assert len({case["expected_projection"]["candidate_classification_code"] for case in negative}) == 5
    for case in negative:
        expected = case["expected_projection"]
        code = expected["candidate_classification_code"]
        rule = rules[code]["candidate_l4_result"]
        l4_row = l4_rows[code]
        assert expected["candidate_axis"] == rule["expected_axis"] == l4_row["expected_axis"]
        assert expected["candidate_state"] == rule["expected_state"] == l4_row["expected_state"]
        assert expected["backflow_component"] == rule["backflow_owner"] == l4_row["backflow_owner"]
        assert expected["side_effect_count"] == rule["side_effect_count"] == l4_row["expected_side_effect_count"]
        assert case["input_ref"].startswith(INPUT_FACTS_PATH + "#")
    for case in positive:
        assert case["expected_projection"]["l4_output_ref"].startswith(L4_PATH + "#")

    print("static candidate validation: PASS")
    print(f"blind artifact sha256: {BLIND_SHA}")
    print("L5 F02 pre-existing contract: unchanged")
    print(f"L8 existing unit cases: unchanged ({len(l8_base['unit_cases'])})")
    print("L8 F02 candidate: only case/input refs and small semantic projections; synthetic input packet lives in scaffold research")
    print("L4/L9 bytes: unchanged")
    print("source pins: exact revision/blob SHA match; reviewed L3/L10 F02 rows equal current rows")
    print("candidate cases: positives=2 negatives=6 unique negative classes=5")
    print("candidate L5/L8/L4 code-axis-state-owner-effect references: matched")


if __name__ == "__main__":
    main()
