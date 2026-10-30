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
BINDING_PATH = "scaffold/bindings/SCF-B-0185.json"
ALL_BINDINGS = (
    "scaffold/bindings/SCF-B-0185.json",
    "scaffold/bindings/SCF-B-0192.json",
    "scaffold/bindings/SCF-B-0193.json",
)
WR231_IDS = {"WR231-F01-target-binding-unavailable", "WR231-F01-design-oracle-revision-untraceable"}
WR231_SECOND_BASIS = 'L3 F01はL6/L5と対test/oracleを定義・凍結し、対象identity/revision/scopeへ結ぶことを要求する。固定blind /negative_inputs/1 ではtarget_identity=target-A、target_revision=target-r2、scope=scope-A、test_revision=test-r2、expected_result_revision=expect-r2が供給されている一方、design_revisionとoracle_revisionがnullで必須の設計/oracle版traceが未供給。L10 F01は設計/対oracleの版を対象へ辿るよう求め、固定blindも一致/current oracleを推論せずunproven/incompleteを保つ。よって既存state vocabularyに沿いmissingを候補とする。pair_binding軸はL4の設計選択でsourceから一意でない。failure_code_status=unknownはfailure codeの意味が未確定であることを示し、stateとは別。'
L4_BASE_SHA = "8dfbe628d7beb9b449a3ec48e98b7ed89ebbb4be1ea9b3f061dfd02ba464ea2f"
L9_BASE_SHA = "3d2257ee9d0f33f367377a3c379af9852973dc11d87c1f23f8f193724adebeb2"
WR206_L5_REV = "4c0e29b6d18a8943514ffd25a27cd4e83c11cff0"
WR206_L5_SHA = "426a0b4299a76eaf7a097d33ab56e16244a69163c878ddb265f8bdc4b465b742"
WR206_L8_REV = "92cb38ffb792151ddd8029d654ca700126d02681"
WR206_L8_SHA = "9f52fe3f90769cdacee9d147dceb0fabb2c36386839f39fdcb2d4039086ed6b7"
WR223_L5_REV = "87e5d15cdb909e88fd5d132ae7ad1d32c14b71d5"
WR223_L5_SHA = "fce881931580d26381df12721dc740a82b685e29c2039a5e1ff838475824c176"
WR223_L8_REV = "07b3462402992d51337b583f9f3d1f895c82e7c8"
WR223_L8_SHA = "ee1648c067009e819d41f869733290042e103c39e41c0980d29dcdb46c107392"


def read_json(path: str) -> dict:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def base_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{BASE}:{path}"], cwd=ROOT)


def revision_bytes(revision: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


CORRECTION_PATH = "scaffold/research/wr231-tdd-f01-untraceable-l4l9-20261031/r2-classification-basis-correction-20261031.json"
CORRECTION_SHA = "b6104eff006fb835de7b910fe600fb9935c831d224ed5dd913cb48b740b6d746"
POST_AUDIT_PATH = "scaffold/research/wr231-tdd-f01-untraceable-l4l9-20261031/post-wr223-binding-recheck-20261031.json"
POST_AUDIT_SHA = "70271a76f37eea270fdcad92c8405d0332c757463ac680b2cc289e70578b5728"


def verify_r2_correction(wr231: dict) -> None:
    correction_bytes = (ROOT / CORRECTION_PATH).read_bytes()
    assert sha(correction_bytes) == CORRECTION_SHA
    assert sha((ROOT / POST_AUDIT_PATH).read_bytes()) == POST_AUDIT_SHA
    correction = json.loads(correction_bytes)
    assert correction["immutable_point_in_time_audit"]["path"] == POST_AUDIT_PATH
    assert correction["immutable_point_in_time_audit"]["sha256"] == POST_AUDIT_SHA
    target = correction["corrected_target"]
    assert target["row_id"] == "WR231-F01-design-oracle-revision-untraceable"
    assert target["field"] == "classification_basis"
    assert target["corrected_value"] == WR231_SECOND_BASIS
    assert target["current_artifact_sha256"] == sha((ROOT / L4_PATH).read_bytes())
    blind_row = wr231["negative_inputs"][1]["synthetic_input"]
    expected_fields = {key: blind_row.get(key) for key in (
        "target_identity", "target_revision", "scope", "test_revision",
        "expected_result_revision", "design_revision", "oracle_revision", "freeze_record"
    )}
    assert correction["observed_blind_fields"] == expected_fields
    assert expected_fields == {
        "target_identity": "target-A", "target_revision": "target-r2", "scope": "scope-A",
        "test_revision": "test-r2", "expected_result_revision": "expect-r2",
        "design_revision": None, "oracle_revision": None, "freeze_record": "present"
    }
    line = f"candidate artifact SHA-256: {CORRECTION_PATH}={CORRECTION_SHA}"
    for binding_path in ALL_BINDINGS:
        binding = read_json(binding_path)
        assert line in binding["verification"]["oracles"], binding_path
    binding_0193 = read_json("scaffold/bindings/SCF-B-0193.json")
    assert f"candidate artifact SHA-256: {POST_AUDIT_PATH}={POST_AUDIT_SHA}" in binding_0193["verification"]["oracles"]


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


def verify_binding_upstream_scope() -> None:
    expected_artifacts = {
        "scaffold/bindings/SCF-B-0185.json": {
            "scaffold/research/wr206-tdd-flow-neg-4way-pr-a-20261031/README.md": "d5d227bc777b2161c10f470bbd9c80daa6c73d58398c382d99fcdf8cf37825ee",
            L5_PATH: WR206_L5_SHA,
            L8_PATH: WR206_L8_SHA,
        },
        "scaffold/bindings/SCF-B-0192.json": {
            L5_PATH: WR223_L5_SHA,
            L8_PATH: WR223_L8_SHA,
            "scaffold/research/wr223-f01-l5-l8-20261031/source/f01-blind-draft-r2.json": "fa047d5d871913b696ba5e01d9227ce13a68bc827ff6e8c66cc29d8e69d7e647",
            "scaffold/research/wr231-tdd-f01-untraceable-l4l9-20261031/source/f01-blind-retry.json": "2a53b965d023d81e6add971f8693cf633cfd6152c700e863a13da65568de3983",
        },
        "scaffold/bindings/SCF-B-0193.json": {
            "scaffold/research/wr231-tdd-f01-untraceable-l4l9-20261031/source/f01-blind-retry.json": "2a53b965d023d81e6add971f8693cf633cfd6152c700e863a13da65568de3983",
            "scaffold/research/wr231-tdd-f01-untraceable-l4l9-20261031/README.md": "a250b1fe93702c140a45071f4ba81f4bd2244f5215ef08dde1a3b89e4ead7e5d",
        },
    }
    for path in ALL_BINDINGS:
        binding = read_json(path)
        assert all(not row["path"].startswith("scaffold/") for row in binding["upstream"]), path
        pins = set(binding["verification"]["oracles"])
        for artifact_path, digest in expected_artifacts[path].items():
            assert f"candidate artifact SHA-256: {artifact_path}={digest}" in pins, (path, artifact_path)
        if path == "scaffold/bindings/SCF-B-0185.json":
            validator_path = "scaffold/research/wr206-f02-l5-l8-pr-b-20261031/validate_static_candidate.py"
            assert f"candidate artifact SHA-256: {validator_path}={sha((ROOT / validator_path).read_bytes())}" in pins


def main() -> None:
    l5 = read_json(L5_PATH)
    l8 = read_json(L8_PATH)
    l4 = read_json(L4_PATH)
    l9 = read_json(L9_PATH)
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
    l8_f01_current = one(l8["cases"], "HARNESS-L8-015-F01")
    l8_wr223_fixed = json.loads(revision_bytes(WR223_L8_REV, L8_PATH))
    l8_f01_wr223_fixed = one(l8_wr223_fixed["cases"], "HARNESS-L8-015-F01")
    assert l8_f01_current["candidate_unit_design"] == l8_f01_wr223_fixed["candidate_unit_design"]
    assert (ROOT / L8_PATH).read_bytes() == revision_bytes(WR223_L8_REV, L8_PATH)
    assert (ROOT / L5_PATH).read_bytes() == revision_bytes(WR223_L5_REV, L5_PATH)
    assert l8["unit_cases"] == l8_base["unit_cases"]
    for old_case in l8_base["cases"]:
        new_case = one(l8["cases"], old_case["id"])
        if old_case["id"] == "HARNESS-L8-015-F02":
            assert {key: value for key, value in new_case.items() if key != "candidate_unit_design"} == old_case
        elif old_case["id"] == "HARNESS-L8-015-F01":
            # Later WR223 adds only a candidate design field to F01; retain every BASE row field.
            assert {key: value for key, value in new_case.items() if key != "candidate_unit_design"} == old_case
            candidate_f01 = new_case.get("candidate_unit_design")
            assert candidate_f01["status"] == "scaffold_candidate_only_not_approved_or_executed"
            assert candidate_f01["fixed_artifact"]["sha256"] == "fa047d5d871913b696ba5e01d9227ce13a68bc827ff6e8c66cc29d8e69d7e647"
        else:
            assert new_case == old_case

    l4_base_bytes, l9_base_bytes = base_bytes(L4_PATH), base_bytes(L9_PATH)
    assert sha(l4_base_bytes) == L4_BASE_SHA
    assert sha(l9_base_bytes) == L9_BASE_SHA
    l4_base, l9_base = json.loads(l4_base_bytes), json.loads(l9_base_bytes)
    l4_current, l9_current = json.loads((ROOT / L4_PATH).read_bytes()), json.loads((ROOT / L9_PATH).read_bytes())
    l4_f01 = one(l4_current["contracts"], "HARNESS-L4-015-F01")
    l9_f01 = one(l9_current["cases"], "HARNESS-L9-015-F01")
    assert {row.get("id") for row in l4_f01["negative_classifications"] if row.get("id") in WR231_IDS} == WR231_IDS
    assert {row.get("id") for row in l9_f01["negative_cases"] if row.get("id") in WR231_IDS} == WR231_IDS
    wr231_l4 = {row["id"]: row for row in l4_f01["negative_classifications"] if row.get("id") in WR231_IDS}
    wr231_l9 = {row["id"]: row for row in l9_f01["negative_cases"] if row.get("id") in WR231_IDS}
    for witness_id in WR231_IDS:
        l4_row, l9_row = wr231_l4[witness_id], wr231_l9[witness_id]
        assert l4_row["expected_state"] == l9_row["expected_state"] == "missing"
        if witness_id == "WR231-F01-design-oracle-revision-untraceable":
            assert l4_row["classification_basis"] == WR231_SECOND_BASIS
        assert l4_row["failure_code_status"] == l9_row["failure_code_status"] == "unknown"
        assert l4_row["expected_side_effect_count"] == l9_row["expected_side_effect_count"] == 0
        assert l4_row["expected_non_generation"] == l9_row["expected_non_generation"] == ["pair_freeze_established", "TDD success", "implementation_success"]
    l4_f01["negative_classifications"] = [row for row in l4_f01["negative_classifications"] if row.get("id") not in WR231_IDS]
    l9_f01["negative_cases"] = [row for row in l9_f01["negative_cases"] if row.get("id") not in WR231_IDS]
    assert l4_current == l4_base, "current L4 differs from fixed WR206 BASE beyond two WR231 witness rows"
    assert l9_current == l9_base, "current L9 differs from fixed WR206 BASE beyond two WR231 witness rows"

    blind = (ROOT / BLIND_PATH).read_bytes()
    assert sha(blind) == BLIND_SHA
    candidate_facts = read_json(INPUT_FACTS_PATH)
    binding = read_json(BINDING_PATH)
    binding_hash_notes = binding["verification"]["oracles"]
    verify_binding_upstream_scope()
    wr231_evidence = read_json("scaffold/research/wr231-tdd-f01-untraceable-l4l9-20261031/source/f01-blind-retry.json")
    verify_r2_correction(wr231_evidence)
    assert sha(revision_bytes(WR206_L5_REV, L5_PATH)) == WR206_L5_SHA
    assert sha(revision_bytes(WR206_L8_REV, L8_PATH)) == WR206_L8_SHA
    for path, digest in ((L5_PATH, WR206_L5_SHA), (L8_PATH, WR206_L8_SHA)):
        assert f"candidate artifact SHA-256: {path}={digest}" in binding_hash_notes, f"historical WR206 candidate hash missing: {path}"
    for path, revision, digest in ((L5_PATH, WR223_L5_REV, WR223_L5_SHA), (L8_PATH, WR223_L8_REV, WR223_L8_SHA)):
        current_bytes = (ROOT / path).read_bytes()
        assert current_bytes == revision_bytes(revision, path), f"WR223 fixed source bytes drift: {path}@{revision}"
        assert sha(current_bytes) == digest
        assert f"candidate artifact SHA-256: {path}={digest}" in read_json("scaffold/bindings/SCF-B-0192.json")["verification"]["oracles"]
    facts_digest = sha((ROOT / INPUT_FACTS_PATH).read_bytes())
    assert f"candidate artifact SHA-256: {INPUT_FACTS_PATH}={facts_digest}" in binding_hash_notes, f"binding candidate artifact hash missing/mismatched: {INPUT_FACTS_PATH}"
    assert candidate_facts["status"].startswith("candidate_synthetic")
    assert candidate_facts["authority_effect"] == "none"
    assert len(candidate_facts["case_deltas"]) == 9

    for pin in candidate_l5["candidate_source_pins"]:
        assert at_revision_sha(pin) == pin["sha256"], f"L5 source pin mismatch: {pin['path']}"
    for pin in candidate_l8["source_pins"]:
        assert at_revision_sha(pin) == pin["sha256"], f"L8 source pin revision/blob mismatch: {pin['path']}"
        if pin["path"] == L5_PATH:
            assert pin["revision"] == WR206_L5_REV and pin["sha256"] == WR206_L5_SHA, (
                "L8 F02 historical L5 pin changed from its exact WR206 source revision"
            )
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
    assert len(negative) == 7
    assert len({case["expected_projection"]["candidate_classification_code"] for case in negative}) == 5
    after_body = [case for case in negative if case["expected_projection"]["candidate_classification_code"] == "after_body_red"]
    assert {case["case_id"] for case in after_body} == {
        "F02-CANDIDATE-NEGATIVE-AFTER-BODY",
        "F02-CANDIDATE-NEGATIVE-AFTER-BODY-REVISION",
    }
    after_rule = rules["after_body_red"]
    assert after_rule["observations"] == [
        "red.executed=true",
        "red.failure_kind=intended_behavior_mismatch",
        "red.oracle_ref equals frozen_oracle.ref",
    ]
    assert after_rule["branch_join"] == "OR across candidate_branches; AND within each branch observations"
    branches = {row["branch_id"]: row for row in after_rule["candidate_branches"]}
    assert set(branches) == {"post_body_target_revision", "pre_body_target_head_late_record"}
    assert branches["post_body_target_revision"]["observations"] == [
        "red.head=body_change.to_head",
        "red.sequence>body_change.sequence",
    ]
    assert branches["pre_body_target_head_late_record"]["observations"] == [
        "red.head=pre_body.head=body_change.from_head",
        "red.sequence>body_change.sequence",
    ]
    old_late_delta = at_pointer(candidate_facts, "/case_deltas/2")
    new_revision_delta = at_pointer(candidate_facts, "/case_deltas/8")
    assert old_late_delta["case_id"] == "F02-CANDIDATE-NEGATIVE-AFTER-BODY"
    assert old_late_delta["input_delta"] == [{
        "path": "red.sequence", "field_value": {"state": "provided", "value": 40}
    }]
    assert new_revision_delta["case_id"] == "F02-CANDIDATE-NEGATIVE-AFTER-BODY-REVISION"
    assert new_revision_delta["input_delta"] == [
        {"path": "red.head", "field_value": {"state": "provided", "value": "H1"}},
        {"path": "red.sequence", "field_value": {"state": "provided", "value": 40}},
    ]
    baseline = at_pointer(candidate_facts, "/shared_input_baseline/source_payload/value")
    assert baseline["body_change"]["value"]["from_head"]["value"] == "H0"
    assert baseline["body_change"]["value"]["to_head"]["value"] == "H1"
    assert baseline["body_change"]["value"]["sequence"]["value"] == 30
    assert baseline["red"]["value"]["head"]["value"] == "H0"
    assert new_revision_delta["input_delta"][0]["field_value"]["value"] == baseline["body_change"]["value"]["to_head"]["value"]
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
        pointer = case["expected_projection"]["l4_output_ref"]
        assert pointer.startswith(L4_PATH + "#")
        resolved = at_pointer(l4, pointer.split("#", 1)[1])
        assert resolved is l4["contracts"][2]["output_contract"]
        assert "expected_output_contract" not in l4["contracts"][2]

    print("static candidate validation: PASS")
    print(f"blind artifact sha256: {BLIND_SHA}")
    print("L5 F02 pre-existing contract: unchanged")
    print(f"L8 existing unit cases: unchanged ({len(l8_base['unit_cases'])})")
    print("L8 F02 candidate: only case/input refs and small semantic projections; synthetic input packet lives in scaffold research")
    print("L4/L9 fixed BASE hashes verified; only two WR231 witness rows are stripped for full-document comparison")
    print("WR206 historical L5/L8 hashes verified at their fixed revisions; current WR223 L5/L8 hashes/bytes verified at fixed revisions")
    print("WR223 L8 F01 candidate_unit_design equals the exact fixed revision candidate bytes; other F01 row fields equal BASE")
    print("SCF-B-0185/0192/0193 upstream arrays contain no scaffold paths; moved artifact SHA oracles verified")
    print("source pins: exact revision/blob SHA match; L8 F02 historical L5 pin remains at its exact WR206 revision; reviewed L3/L10 F02 rows equal current rows")
    print("candidate cases: positives=2 negatives=7 unique negative classes=5")
    print("after-body branches: H1 target revision; H0 late record kept distinct")
    print("L8 positive L4 output pointers: RFC6901 resolution PASS")
    print("candidate L5/L8/L4 code-axis-state-owner-effect references: matched")


if __name__ == "__main__":
    main()
