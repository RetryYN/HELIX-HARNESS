#!/usr/bin/env python3
"""WR223 F01候補の文書revision・参照・既存期待不変を静的に確認する。"""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = "dd5931cfff4ff786da2ced44de2a40529edf7b71"
L5_REV = "7d72703bb1fe3e350292751141146f300d70574a"
REVIEWED = "a715e777bd59291b26f09c0c1c5481273c6eba2e"
L3 = "docs/helix-harness/L3-requirements/functional-requirements.json"
L10 = "docs/helix-harness/L10-verification/functional-verification.json"
L4 = "docs/helix-harness/L4-basic-design/tdd-development-flow.json"
L5 = "docs/helix-harness/L5-detail-design/tdd-development-flow.json"
L8 = "docs/helix-harness/L8-unit-verification/tdd-development-flow.json"
L9 = "docs/helix-harness/L9-integration-verification/tdd-development-flow.json"
R1 = "scaffold/research/wr223-f01-l5-l8-20261031/source/f01-blind-draft-r1.json"
R2 = "scaffold/research/wr223-f01-l5-l8-20261031/source/f01-blind-draft-r2.json"
COMMENT = "https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6531844362"
R1_SHA = "e4f7be9befded4f2398209eac0d3ef226c0cd62cefa5e47d013a18e87f265bbd"
R2_SHA = "fa047d5d871913b696ba5e01d9227ce13a68bc827ff6e8c66cc29d8e69d7e647"
L5_SHA = "f1ac1bd4e47365378ebf09f53b0e24b02d3be7033411df881672206363805b4a"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git_bytes(revision: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)


def read_json(path: str) -> dict:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def at_pointer(document, pointer: str):
    value = document
    for segment in pointer.split("/"):
        if not segment:
            continue
        segment = segment.replace("~1", "/").replace("~0", "~")
        value = value[int(segment)] if isinstance(value, list) else value[segment]
    return value


def path_pointer_ref(reference: str):
    path, pointer = reference.split("#", 1)
    return path, pointer


def one(rows: list[dict], identity: str) -> dict:
    matches = [row for row in rows if row.get("id") == identity]
    assert len(matches) == 1, f"expected one {identity}, found {len(matches)}"
    return matches[0]


def verify_pin(pin: dict):
    actual = sha(git_bytes(pin["revision"], pin["path"]))
    assert actual == pin["sha256"], f"source pin mismatch: {pin['path']}@{pin['revision']}"


def main() -> None:
    l3 = read_json(L3)
    l10 = read_json(L10)
    l4 = read_json(L4)
    l5 = read_json(L5)
    l8 = read_json(L8)
    l9 = read_json(L9)
    l5_base = json.loads(git_bytes(BASE, L5))
    l8_base = json.loads(git_bytes(BASE, L8))
    l4_base_bytes = git_bytes(BASE, L4)
    l9_base_bytes = git_bytes(BASE, L9)

    # Both fixed meaning artifacts are byte-preserved and r2 is the Issue-fixed source.
    assert sha((ROOT / R1).read_bytes()) == R1_SHA
    assert sha((ROOT / R2).read_bytes()) == R2_SHA
    r2 = read_json(R2)
    assert r2["target"]["requirement"] == "HARNESS-L3-015-F01"
    assert r2["target"]["system_oracle"] == "HARNESS-L10-015-F01"

    # L3/L10 exact approved source pins resolve, and target rows match current base docs.
    l3_fixed = json.loads(git_bytes(REVIEWED, L3))
    l10_fixed = json.loads(git_bytes(REVIEWED, L10))
    l3_row = one(l3["requirements"], "HARNESS-L3-015-F01")
    l10_case = one(l10["cases"], "HARNESS-L10-015-F01")
    assert l3_row == one(l3_fixed["requirements"], "HARNESS-L3-015-F01")
    assert l10_case == one(l10_fixed["cases"], "HARNESS-L10-015-F01")

    # The L5 change is additive to the existing F01 contract; all other fields remain exact.
    l5_f01 = one(l5["contracts"], "HARNESS-L5-015-F01")
    l5_f01_base = one(l5_base["contracts"], "HARNESS-L5-015-F01")
    candidate_l5 = l5_f01["candidate_classification_design"]
    assert {k: v for k, v in l5_f01.items() if k != "candidate_classification_design"} == l5_f01_base
    assert candidate_l5["status"] == "candidate_only_not_approved_or_executed"
    assert candidate_l5["fixed_artifact"]["sha256"] == R2_SHA
    assert "source predicate" in candidate_l5["classification_authority_note"]
    assert "source_condition" in candidate_l5["positive_candidate_rule"]
    assert all("source_condition" in x for x in candidate_l5["negative_candidate_rules"])
    assert candidate_l5["fixed_artifact"]["issue_comment"] == COMMENT
    assert "6531844362" in candidate_l5["fixed_artifact"]["issue_comment"]
    assert sha(git_bytes(L5_REV, L5)) == L5_SHA

    # The L8 change is additive; existing case rows/expected material and unit cases are unchanged.
    l8_f01 = one(l8["cases"], "HARNESS-L8-015-F01")
    l8_f01_base = one(l8_base["cases"], "HARNESS-L8-015-F01")
    candidate_l8 = l8_f01["candidate_unit_design"]
    assert {k: v for k, v in l8_f01.items() if k != "candidate_unit_design"} == l8_f01_base
    assert l8["unit_cases"] == l8_base["unit_cases"]
    assert [x for x in l8["cases"] if x["id"] != "HARNESS-L8-015-F01"] == [
        x for x in l8_base["cases"] if x["id"] != "HARNESS-L8-015-F01"
    ]
    assert candidate_l8["status"] == "scaffold_candidate_only_not_approved_or_executed"
    assert candidate_l8["fixed_artifact"]["sha256"] == R2_SHA

    # No current L4/L9 bytes or expected records are changed.
    assert (ROOT / L4).read_bytes() == l4_base_bytes
    assert (ROOT / L9).read_bytes() == l9_base_bytes
    l4_f01_index = next(i for i, x in enumerate(l4["contracts"]) if x["id"] == "HARNESS-L4-015-F01")
    l9_f01_index = next(i for i, x in enumerate(l9["cases"]) if x["id"] == "HARNESS-L9-015-F01")
    l4_f01 = l4["contracts"][l4_f01_index]
    l9_f01 = l9["cases"][l9_f01_index]

    # Check every pinned revision/blob and the L8 pin to the first-committed L5 bytes.
    for pin in candidate_l5["candidate_source_pins"]:
        verify_pin(pin)
    l5_l8_pin = next(pin for pin in candidate_l8["source_pins"] if pin["path"] == L5)
    assert l5_l8_pin["revision"] == L5_REV
    assert l5_l8_pin["sha256"] == L5_SHA
    assert sha((ROOT / L5).read_bytes()) == l5_l8_pin["sha256"]
    for pin in candidate_l8["source_pins"]:
        verify_pin(pin)

    # Positive L4 output pointer resolves and matches the existing L9 normal expected material.
    positive = [x for x in candidate_l8["cases"] if x["polarity"] == "positive"]
    negative = [x for x in candidate_l8["cases"] if x["polarity"] == "negative"]
    assert len(positive) == 1 and len(negative) == 5
    positive_row = positive[0]
    l4_path, l4_pointer = path_pointer_ref(positive_row["expected_projection"]["l4_output_ref"])
    assert l4_path == L4
    resolved_l4_output = at_pointer(l4, l4_pointer)
    assert isinstance(resolved_l4_output, dict)
    l9_path, l9_expected_pointer = path_pointer_ref(positive_row["expected_projection"]["l9_expected_ref"])
    assert l9_path == L9
    assert isinstance(at_pointer(l9, l9_expected_pointer), dict)
    input_path, input_pointer = path_pointer_ref(positive_row["source_fixture_ref"])
    assert input_path == L9 and at_pointer(l9, input_pointer) == l9_f01["normal_fixture"]["input"]

    # Negative candidate witnesses correspond one-to-one to existing L4/L9 classes.
    l4_negative = l4_f01["negative_classifications"]
    l9_negative = l9_f01["negative_cases"]
    l5_negative = candidate_l5["negative_candidate_rules"]
    assert len(l4_negative) == len(l9_negative) == len(l5_negative) == len(negative) == 5
    assert len({x["candidate_witness_id"] for x in l5_negative}) == 5
    assert len({x["case_id"] for x in candidate_l8["cases"]}) == 6
    for index, (l4_case, l9_case, l5_rule, candidate_case) in enumerate(zip(l4_negative, l9_negative, l5_negative, negative)):
        projection = candidate_case["expected_projection"]
        assert "source_condition" in l5_rule
        assert set(("candidate_classification_code", "candidate_axis", "candidate_state", "backflow_component", "side_effect_count")).issubset(projection)
        assert at_pointer(l9, f"/cases/{l9_f01_index}/negative_cases/{index}/source_packet/owner_material")
        assert at_pointer(l4, f"/contracts/{l4_f01_index}/negative_classifications/{index}") is l4_case
        assert at_pointer(l9, f"/cases/{l9_f01_index}/negative_cases/{index}") is l9_case
        l4_ref_path, l4_ref_pointer = path_pointer_ref(l5_rule["l4_design_expected_ref"])
        l9_ref_path, l9_ref_pointer = path_pointer_ref(l5_rule["l9_existing_expected_ref"])
        assert l4_ref_path == L4 and at_pointer(l4, l4_ref_pointer) is l4_case
        assert l9_ref_path == L9 and at_pointer(l9, l9_ref_pointer) is l9_case
        assert at_pointer(l4, f"/contracts/{l4_f01_index}/negative_classifications/{index}") == l4_case
        assert at_pointer(l9, f"/cases/{l9_f01_index}/negative_cases/{index}") == l9_case

    # Candidate witness labels do not enter canonical U-ID/unit-case or four-way membership.
    canonical_ids = set(l8_f01["unit_case_ids"])
    all_unit_ids = {x["id"] for x in l8["unit_cases"]}
    candidate_ids = {x["case_id"] for x in candidate_l8["cases"]}
    assert candidate_ids.isdisjoint(canonical_ids)
    assert candidate_ids.isdisjoint(all_unit_ids)
    assert len(l8_f01["unit_case_ids"]) == len(l8_f01_base["unit_case_ids"]) == 6
    assert len(l8["unit_cases"]) == len(l8_base["unit_cases"]) == 35

    print("static F01 candidate validation: PASS")
    print(f"L5 first-commit revision: {L5_REV}; SHA-256: {L5_SHA}")
    print(f"L8 candidate SHA-256: {sha((ROOT / L8).read_bytes())}")
    print("r1/r2 fixed-artifact SHA-256: PASS; r2 Issue comment binding: PASS")
    print("approved L3/L10 target rows and all L4/L9/L5 source pins: PASS")
    print("L4/L9 source pointers resolve; candidate projections are not validated by expected-value equality")
    print("existing L5 contract, L4/L9 bytes, L8 canonical case IDs and unit cases: unchanged")
    print("candidate witnesses: positive=1, negative=5; canonical four-way contribution=0")
    print("No algorithm, runtime, test suite, or CI was executed.")


if __name__ == "__main__":
    main()
