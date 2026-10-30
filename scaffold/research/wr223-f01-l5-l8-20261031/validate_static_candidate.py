#!/usr/bin/env python3
"""WR223 F01 source facts / candidate ownershipの静的照合。classifierやruntimeは実行しない。"""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "scaffold/research/wr253-tdd-l8-slim-20261031"))
import validate_uid_table
BASE = "dd5931cfff4ff786da2ced44de2a40529edf7b71"
L5_REV = "87e5d15cdb909e88fd5d132ae7ad1d32c14b71d5"
L8_REV = "07b3462402992d51337b583f9f3d1f895c82e7c8"
L8_SHA = "ee1648c067009e819d41f869733290042e103c39e41c0980d29dcdb46c107392"
WR253_HISTORY_NOTE = "Historical L8 whole-file SHA-256 ee1648c067009e819d41f869733290042e103c39e41c0980d29dcdb46c107392 is fixed evidence at revision 07b3462402992d51337b583f9f3d1f895c82e7c8, not the current L8 bytes. Current compact table has 35 existing L9-mapped rows plus 3 concise F03 head-comparison rows; candidate values and all 38 comparisons are checked by WR253 validator under SCF-B-0215."
REVIEWED = "a715e777bd59291b26f09c0c1c5481273c6eba2e"
L3 = "docs/helix-harness/L3-requirements/functional-requirements.json"
L10 = "docs/helix-harness/L10-verification/functional-verification.json"
L4 = "docs/helix-harness/L4-basic-design/tdd-development-flow.json"
L5 = "docs/helix-harness/L5-detail-design/tdd-development-flow.json"
L8 = "docs/helix-harness/L8-unit-verification/tdd-development-flow.json"
L9 = "docs/helix-harness/L9-integration-verification/tdd-development-flow.json"
R1 = "scaffold/research/wr223-f01-l5-l8-20261031/source/f01-blind-draft-r1.json"
R2 = "scaffold/research/wr223-f01-l5-l8-20261031/source/f01-blind-draft-r2.json"
FACTS = "scaffold/research/wr223-f01-l5-l8-20261031/source/f01-candidate-input-facts.json"
BINDING = "scaffold/bindings/SCF-B-0192.json"
ALL_BINDINGS = (
    "scaffold/bindings/SCF-B-0185.json",
    "scaffold/bindings/SCF-B-0192.json",
    "scaffold/bindings/SCF-B-0193.json",
)
COMMENT = "https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6531844362"
R1_SHA = "e4f7be9befded4f2398209eac0d3ef226c0cd62cefa5e47d013a18e87f265bbd"
R2_SHA = "fa047d5d871913b696ba5e01d9227ce13a68bc827ff6e8c66cc29d8e69d7e647"
L4_BASE_SHA = "8dfbe628d7beb9b449a3ec48e98b7ed89ebbb4be1ea9b3f061dfd02ba464ea2f"
L9_SHA = "3d2257ee9d0f33f367377a3c379af9852973dc11d87c1f23f8f193724adebeb2"
WR231_ARTIFACT = "scaffold/research/wr231-tdd-f01-untraceable-l4l9-20261031/source/f01-blind-retry.json"
WR231_SHA = "2a53b965d023d81e6add971f8693cf633cfd6152c700e863a13da65568de3983"
WR231_IDS = {"WR231-F01-target-binding-unavailable", "WR231-F01-design-oracle-revision-untraceable"}
WR231_SECOND_BASIS = 'L3 F01はL6/L5と対test/oracleを定義・凍結し、対象identity/revision/scopeへ結ぶことを要求する。固定blind /negative_inputs/1 ではtarget_identity=target-A、target_revision=target-r2、scope=scope-A、test_revision=test-r2、expected_result_revision=expect-r2が供給されている一方、design_revisionとoracle_revisionがnullで必須の設計/oracle版traceが未供給。L10 F01は設計/対oracleの版を対象へ辿るよう求め、固定blindも一致/current oracleを推論せずunproven/incompleteを保つ。よって既存state vocabularyに沿いmissingを候補とする。pair_binding軸はL4の設計選択でsourceから一意でない。failure_code_status=unknownはfailure codeの意味が未確定であることを示し、stateとは別。'
WR223_README_SHA = "7e5fe7f82acac693785d4589f9e14752d632dc6ae414c6b652dd03c467d9f60c"
WR223_SUMMARY_SHA = "7f2f84406dffde75ab351eed7c436031c6e01fc8ce1939d9c258606d0fda6ad4"
L5_SHA = "fce881931580d26381df12721dc740a82b685e29c2039a5e1ff838475824c176"
FACTS_SHA = "f16de2d4cb641c34a7289a81496e4618ff5a4a88eb8be3da1896123920db21de"


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
    assert target["current_artifact_sha256"] == sha((ROOT / L4).read_bytes())
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



def without_candidate_annotations(document: dict, collection: str, field: str, record_ids: set[str]) -> dict:
    stripped = json.loads(json.dumps(document))
    for row in stripped.get(collection, []):
        if row.get("id") in record_ids:
            row.pop(field, None)
    return stripped

def one(rows: list[dict], identity: str) -> dict:
    matches = [row for row in rows if row.get("id") == identity]
    assert len(matches) == 1, f"expected one {identity}, found {len(matches)}"
    return matches[0]


def state_at(root, path: str):
    value = root
    for segment in path.split("."):
        if not isinstance(value, dict) or segment not in value:
            return {"presence": "absent"}
        value = value[segment]
    if value is None:
        return {"presence": "null"}
    return {"presence": "provided", "value": value}


def resolve_dot(root, path: str):
    state = state_at(root, path)
    assert state["presence"] == "provided", f"relation path missing/null: {path}"
    return state["value"]


def verify_relation(owner_material: dict, relation: dict):
    kind = relation["kind"]
    left = resolve_dot(owner_material, relation["left"])
    right = resolve_dot(owner_material, relation["right"])
    if kind == "equal_fields":
        assert isinstance(left, dict) and isinstance(right, dict)
        assert all(left[field] == right[field] for field in relation["fields"]), relation
    elif kind == "less_than":
        assert left < right, relation
    elif kind == "greater_than":
        assert left > right, relation
    elif kind == "not_equal":
        assert left != right, relation
    elif kind == "earlier_than":
        left_dt = datetime.fromisoformat(left.replace("Z", "+00:00"))
        right_dt = datetime.fromisoformat(right.replace("Z", "+00:00"))
        assert left_dt < right_dt, relation
    else:
        raise AssertionError(f"unknown research relation kind: {kind}")


def verify_fact_record(record: dict, l9: dict):
    pointer = record["l9_source_pointer"]
    assert pointer.startswith("/cases/1/")
    owner_material = at_pointer(l9, pointer)
    for fact in record["observed_fields"]:
        actual = state_at(owner_material, fact["path"])
        assert actual["presence"] == fact["presence"], (record["case_id"], fact, actual)
        if fact["presence"] == "provided":
            assert actual["value"] == fact["value"], (record["case_id"], fact, actual)
    for relation in record["relations"]:
        verify_relation(owner_material, relation)
    if "candidate_output_mutation" in record:
        mutation = record["candidate_output_mutation"]
        actual = at_pointer(l9, mutation["l9_pointer"])
        assert actual["lane"] == mutation["lane"]
        assert actual["operation"] == mutation["operation"]
        assert actual["field_path"] == mutation["field_path"]
        assert actual["after"] == mutation["after"]


def main() -> None:
    l3, l10, l4, l5, l8, l9 = (read_json(path) for path in (L3, L10, L4, L5, L8, L9))
    l5_base = json.loads(git_bytes(BASE, L5))
    l8_base = json.loads(git_bytes(BASE, L8))
    l4_base_bytes, l9_base_bytes = git_bytes(BASE, L4), git_bytes(BASE, L9)
    l4_base, l9_base = json.loads(l4_base_bytes), json.loads(l9_base_bytes)
    assert sha(l4_base_bytes) == L4_BASE_SHA
    assert sha(l9_base_bytes) == L9_SHA
    wr231_bytes = (ROOT / WR231_ARTIFACT).read_bytes()
    assert sha(wr231_bytes) == WR231_SHA
    wr231 = json.loads(wr231_bytes)
    verify_r2_correction(wr231)
    facts = read_json(FACTS)
    binding = read_json(BINDING)
    assert sha((ROOT / FACTS).read_bytes()) == FACTS_SHA

    assert sha((ROOT / R1).read_bytes()) == R1_SHA
    assert sha((ROOT / R2).read_bytes()) == R2_SHA
    r2 = read_json(R2)
    assert r2["target"]["requirement"] == "HARNESS-L3-015-F01"
    assert r2["target"]["system_oracle"] == "HARNESS-L10-015-F01"

    l3_fixed, l10_fixed = json.loads(git_bytes(REVIEWED, L3)), json.loads(git_bytes(REVIEWED, L10))
    l3_row, l10_case = one(l3["requirements"], "HARNESS-L3-015-F01"), one(l10["cases"], "HARNESS-L10-015-F01")
    assert l3_row == one(l3_fixed["requirements"], "HARNESS-L3-015-F01")
    assert l10_case == one(l10_fixed["cases"], "HARNESS-L10-015-F01")

    l5_f01 = one(l5["contracts"], "HARNESS-L5-015-F01")
    l5_f01_base = one(l5_base["contracts"], "HARNESS-L5-015-F01")
    candidate_l5 = l5_f01["candidate_classification_design"]
    assert {k: v for k, v in l5_f01.items() if k != "candidate_classification_design"} == l5_f01_base
    assert candidate_l5["status"] == "candidate_only_not_approved_or_executed"
    assert candidate_l5["fixed_artifact"]["sha256"] == R2_SHA
    assert candidate_l5["fixed_artifact"]["issue_comment"] == COMMENT
    catalog = candidate_l5["candidate_predicate_catalog"]
    assert catalog["status"] == "candidate_general_predicates_only_not_approved_or_executed"
    assert len(catalog["negative"]) == 6
    assert catalog["negative"][-1]["predicate_id"] == "target_and_pair_refs_untraceable"
    assert catalog["negative"][-1]["required_presence"] == "An evaluation input record is available for inspection."
    assert "member is absent, incomplete, or cannot be related" in catalog["negative"][-1]["condition"]
    assert any("sequence ==" in item for item in catalog["unresolved"])
    assert any("r2 negative condition" in item for item in catalog["unresolved"])
    assert candidate_l5["source_fact_evidence_ref"] == f"{FACTS}#/cases"
    assert not any(pin["path"] == L9 for pin in candidate_l5["candidate_source_pins"])
    l5_text = json.dumps(candidate_l5, ensure_ascii=False)
    for fixture_value in ("TDD-TARGET", "synthetic-T", "synthetic-test", "2026-10-01T", "observed_from_freeze", "F01-CANDIDATE-"):
        assert fixture_value not in l5_text, f"fixture-specific value leaked into L5 candidate: {fixture_value}"
    assert sha(git_bytes(L5_REV, L5)) == L5_SHA

    assert facts["status"] == "scaffold_candidate_source_fact_evidence_only"
    assert facts["meaning_source"]["sha256"] == R2_SHA
    assert facts["source_document"]["revision"] == BASE
    assert facts["source_document"]["sha256"] == L9_SHA
    assert sha(git_bytes(BASE, L9)) == L9_SHA
    assert len(facts["cases"]) == 6
    for record in facts["cases"]:
        verify_fact_record(record, l9)

    l8_f01 = one(l8["cases"], "HARNESS-L8-015-F01")
    l8_f01_base = one(l8_base["cases"], "HARNESS-L8-015-F01")
    candidate_l8 = l8_f01["candidate_unit_design"]
    l8_wr223_fixed = json.loads(git_bytes(L8_REV, L8))
    l8_f01_wr223_fixed = one(l8_wr223_fixed["cases"], "HARNESS-L8-015-F01")
    assert candidate_l8 == l8_f01_wr223_fixed["candidate_unit_design"]
    assert sha(git_bytes(L8_REV, L8)) == L8_SHA
    assert l8_base["unit_cases"] == l8_wr223_fixed["unit_cases"]
    current_l8_without_new_candidates = without_candidate_annotations(
        l8, "cases", "candidate_unit_design",
        {"HARNESS-L8-015-B01", "HARNESS-L8-015-F01", "HARNESS-L8-015-F03", "HARNESS-L8-015-F04"},
    )
    assert validate_uid_table.normalized_pre_slim_l8(current_l8_without_new_candidates) == validate_uid_table.normalized_pre_slim_l8(l8_base)
    assert all(validate_uid_table.run_checks().values()), "current compact U-ID table/candidate validation failed"
    assert candidate_l8["status"] == "scaffold_candidate_only_not_approved_or_executed"
    assert candidate_l8["fixed_artifact"]["sha256"] == R2_SHA
    assert len(candidate_l8["cases"]) == 6
    l5_l8_pin = next(pin for pin in candidate_l8["source_pins"] if pin["path"] == L5)
    assert l5_l8_pin["revision"] == L5_REV and l5_l8_pin["sha256"] == L5_SHA
    assert sha(git_bytes(L5_REV, L5)) == L5_SHA
    for pin in candidate_l5["candidate_source_pins"] + candidate_l8["source_pins"]:
        assert sha(git_bytes(pin["revision"], pin["path"])) == pin["sha256"], pin

    l4_f01 = one(l4["contracts"], "HARNESS-L4-015-F01")
    l9_f01 = one(l9["cases"], "HARNESS-L9-015-F01")
    l4_f01_base = one(l4_base["contracts"], "HARNESS-L4-015-F01")
    l9_f01_base = one(l9_base["cases"], "HARNESS-L9-015-F01")
    l4_rows = [row for row in l4_f01["negative_classifications"] if row.get("id") in WR231_IDS]
    l9_rows = [row for row in l9_f01["negative_cases"] if row.get("id") in WR231_IDS]
    assert {row["id"] for row in l4_rows} == WR231_IDS
    assert {row["id"] for row in l9_rows} == WR231_IDS
    assert len(l4_f01["negative_classifications"]) == len(l4_f01_base["negative_classifications"]) + 2 == 7
    assert len(l9_f01["negative_cases"]) == len(l9_f01_base["negative_cases"]) + 2 == 7
    assert l4_f01["failure_conditions"] == l4_f01_base["failure_conditions"]
    assert l4_f01["output_contract"] == l4_f01_base["output_contract"]
    assert l9_f01["expected_material"] == l9_f01_base["expected_material"]
    assert l9_f01["normal_fixture"] == l9_f01_base["normal_fixture"]
    l4_by_id = {row["id"]: row for row in l4_rows}
    l9_by_id = {row["id"]: row for row in l9_rows}
    for row_id in WR231_IDS:
        l4_row, l9_row = l4_by_id[row_id], l9_by_id[row_id]
        assert "code" not in l4_row and "code" not in l9_row
        assert l4_row["failure_code_status"] == l9_row["failure_code_status"] == "unknown"
        assert l4_row["expected_axis"] == l9_row["expected_axis"] == "pair_binding"
        assert l4_row["expected_state"] == l9_row["expected_state"] == "missing"
        if row_id == "WR231-F01-design-oracle-revision-untraceable":
            assert l4_row["classification_basis"] == WR231_SECOND_BASIS
        assert l4_row["expected_side_effect_count"] == l9_row["expected_side_effect_count"] == 0
        assert l4_row["axis_selection_status"] == l9_row["axis_selection_status"] == "l4_design_choice_not_unique_from_source"
        assert l9_row["execution_state"] == "not_executed"
        assert l9_row["non_target_preserved"].startswith("not_asserted:")
        assert l4_row["expected_non_generation"] == l9_row["expected_non_generation"] == [
            "pair_freeze_established", "TDD success", "implementation_success"
        ]
    l4_by_id, l9_by_id = ({row["id"]: row for row in rows} for rows in (l4_rows, l9_rows))
    expected_source_pointers = {
        "WR231-F01-target-binding-unavailable": "/negative_inputs/0",
        "WR231-F01-design-oracle-revision-untraceable": "/negative_inputs/1",
    }
    assert {row["case_id"] for row in wr231["negative_inputs"]} == {
        "target_binding_unavailable", "design_oracle_revision_untraceable", "timestamp_only_freeze"
    }
    for row_id, pointer in expected_source_pointers.items():
        assert l4_by_id[row_id]["source_artifact"]["path"] == WR231_ARTIFACT
        assert l4_by_id[row_id]["source_artifact"]["sha256"] == WR231_SHA
        assert l4_by_id[row_id]["source_artifact"]["pointer"] == pointer
        assert l9_by_id[row_id]["source_reference"]["path"] == WR231_ARTIFACT
        assert l9_by_id[row_id]["source_reference"]["sha256"] == WR231_SHA
        assert l9_by_id[row_id]["source_reference"]["pointer"] == pointer
    l4_stripped, l9_stripped = json.loads(json.dumps(l4)), json.loads(json.dumps(l9))
    current_l4_f01 = one(l4_stripped["contracts"], "HARNESS-L4-015-F01")
    current_l9_f01 = one(l9_stripped["cases"], "HARNESS-L9-015-F01")
    current_l4_f01["negative_classifications"] = [row for row in current_l4_f01["negative_classifications"] if row.get("id") not in WR231_IDS]
    current_l9_f01["negative_cases"] = [row for row in current_l9_f01["negative_cases"] if row.get("id") not in WR231_IDS]
    assert l4_stripped == l4_base, "current L4 differs from fixed BASE beyond the two WR231 witness rows"
    assert l9_stripped == l9_base, "current L9 differs from fixed BASE beyond the two WR231 witness rows"
    positive, negative = candidate_l8["cases"][0], candidate_l8["cases"][1:]
    assert positive["polarity"] == "positive" and all(x["polarity"] == "negative" for x in negative)
    for index, row in enumerate(candidate_l8["cases"]):
        ref_path, pointer = path_pointer_ref(row["candidate_input_ref"])
        assert ref_path == FACTS
        assert at_pointer(facts, pointer) is facts["cases"][index]
        assert row["case_id"] == facts["cases"][index]["case_id"]
        assert "source_fixture_ref" not in row
    def keys_in(value):
        if isinstance(value, dict):
            return set(value).union(*(keys_in(child) for child in value.values()))
        if isinstance(value, list):
            return set().union(*(keys_in(child) for child in value)) if value else set()
        return set()
    forbidden_l8_keys = {"owner_material", "original_bytes_utf8", "full_return", "fixture_patch", "seed", "rfc6902_patch"}
    assert keys_in(candidate_l8).isdisjoint(forbidden_l8_keys)
    assert all(set(x["expected_projection"]).issubset({"candidate_l4_output", "l4_output_ref", "l9_expected_ref", "candidate_classification_code", "candidate_axis", "candidate_state", "backflow_component", "side_effect_count", "l4_expected_ref", "l9_expected_ref"}) for x in candidate_l8["cases"])

    # Resolve compact source references; do not compare candidate projections for value equality.
    pos_projection = positive["expected_projection"]
    l4_path, l4_ptr = path_pointer_ref(pos_projection["l4_output_ref"])
    l9_path, l9_ptr = path_pointer_ref(pos_projection["l9_expected_ref"])
    assert l4_path == L4 and isinstance(at_pointer(l4, l4_ptr), dict)
    assert l9_path == L9 and isinstance(at_pointer(l9, l9_ptr), dict)
    for index, (l4_ref, l9_ref) in enumerate(zip(l4_f01_base["negative_classifications"], l9_f01_base["negative_cases"])):
        projection = negative[index]["expected_projection"]
        l4_path, l4_ptr = path_pointer_ref(projection["l4_expected_ref"])
        l9_path, l9_ptr = path_pointer_ref(projection["l9_expected_ref"])
        assert l4_path == L4 and at_pointer(l4, l4_ptr) == l4_ref
        assert l9_path == L9 and at_pointer(l9, l9_ptr) == l9_ref

    canonical_ids, all_unit_ids = set(l8_f01["unit_case_ids"]), {x["id"] for c in l8["cases"] for x in c["unit_case_rows"]}
    candidate_ids = {x["case_id"] for x in candidate_l8["cases"]}
    assert candidate_ids.isdisjoint(canonical_ids) and candidate_ids.isdisjoint(all_unit_ids)
    assert len(l8_f01["unit_case_ids"]) == len(l8_f01_base["unit_case_ids"]) == 6
    historical_unit_ids = {row["id"] for row in l8_base["unit_cases"]}
    added_head_ids = {
        "AUDIT-015-F03-HEAD-normal",
        "AUDIT-015-F03-HEAD-other_pre_body_revision",
        "AUDIT-015-F03-HEAD-other_green_revision",
    }
    assert len(historical_unit_ids) == 35
    assert len(all_unit_ids) == 38 and historical_unit_ids <= all_unit_ids and all_unit_ids - historical_unit_ids == added_head_ids

    assert binding["id"] == "SCF-B-0192"
    expected_artifacts = {
        "scaffold/bindings/SCF-B-0185.json": {
            "scaffold/research/wr206-tdd-flow-neg-4way-pr-a-20261031/README.md": "d5d227bc777b2161c10f470bbd9c80daa6c73d58398c382d99fcdf8cf37825ee",
        },
        "scaffold/bindings/SCF-B-0192.json": {
            R2: R2_SHA,
            WR231_ARTIFACT: WR231_SHA,
        },
        "scaffold/bindings/SCF-B-0193.json": {
            WR231_ARTIFACT: WR231_SHA,
            "scaffold/research/wr231-tdd-f01-untraceable-l4l9-20261031/README.md": "a250b1fe93702c140a45071f4ba81f4bd2244f5215ef08dde1a3b89e4ead7e5d",
        },
    }
    for binding_path in ALL_BINDINGS:
        scoped_binding = read_json(binding_path)
        assert all(not row["path"].startswith("scaffold/") for row in scoped_binding["upstream"]), binding_path
        scoped_pins = set(scoped_binding["verification"]["oracles"])
        for artifact_path, digest in expected_artifacts[binding_path].items():
            assert f"candidate artifact SHA-256: {artifact_path}={digest}" in scoped_pins, (binding_path, artifact_path)
    assert sha((ROOT / "scaffold/research/wr223-f01-l5-l8-20261031/README.md").read_bytes()) == WR223_README_SHA
    assert sha((ROOT / "scaffold/research/wr223-f01-l5-l8-20261031/verification-summary.json").read_bytes()) == WR223_SUMMARY_SHA
    assert all(not row["path"].startswith("scaffold/") for row in binding["upstream"])
    current_source_pins = {row["path"]: row for row in binding["upstream"]}
    assert current_source_pins[L4]["sha256"] == sha((ROOT / L4).read_bytes())
    assert current_source_pins[L9]["sha256"] == sha((ROOT / L9).read_bytes())
    assert BASE in current_source_pins[L4]["note"] and L4_BASE_SHA in current_source_pins[L4]["note"]
    assert BASE in current_source_pins[L9]["note"] and L9_SHA in current_source_pins[L9]["note"]
    assert "no row" in current_source_pins[L4]["note"]
    assert "no row" in current_source_pins[L9]["note"]
    assert WR231_ARTIFACT not in current_source_pins
    artifact_pins = set(binding["verification"]["oracles"])
    assert WR253_HISTORY_NOTE in artifact_pins
    binding_0215 = read_json("scaffold/bindings/SCF-B-0215.json")
    l8_current_pin = next(row for row in binding_0215["upstream"] if row["path"] == L8)
    assert l8_current_pin["sha256"] == sha((ROOT / L8).read_bytes())
    assert f"candidate artifact SHA-256: {WR231_ARTIFACT}={WR231_SHA}" in artifact_pins
    assert f"candidate artifact SHA-256: {R2}={R2_SHA}" in artifact_pins
    for evidence_pin in binding["verification"]["oracles"]:
        if not evidence_pin.startswith("candidate artifact SHA-256: "):
            continue
        path, expected = evidence_pin.removeprefix("candidate artifact SHA-256: ").split("=", 1)
        historical_revisions = {
            (L5, L5_SHA): L5_REV,
            (L8, L8_SHA): L8_REV,
            (L5, "426a0b4299a76eaf7a097d33ab56e16244a69163c878ddb265f8bdc4b465b742"): "4c0e29b6d18a8943514ffd25a27cd4e83c11cff0",
            (L8, "9f52fe3f90769cdacee9d147dceb0fabb2c36386839f39fdcb2d4039086ed6b7"): "92cb38ffb792151ddd8029d654ca700126d02681",
        }
        if (path, expected) in historical_revisions:
            assert sha(git_bytes(historical_revisions[(path, expected)], path)) == expected, (path, expected)
        else:
            assert sha((ROOT / path).read_bytes()) == expected, path

    print("static F01 candidate/source-fact validation: PASS")
    print(f"L5 pin: {L5_REV}; SHA-256: {L5_SHA}")
    print(f"r1/r2 hashes and Issue-fixed r2 reference: PASS")
    print("L5 has six value-free negative predicates including r2's untraceable-ref meaning; sequence equality unresolved")
    print("Six scaffold facts re-resolve against base L9 owner_material: PASS")
    print("L8 U-ID rows contain compact fact references and short projections only; no raw owner_material/full return")
    print("L4/L9 fixed BASE hashes and all existing rows preserved; current delta is exactly two WR231 witness rows")
    print("WR231 witness rows retain unknown failure-code status, state=missing, zero side effects, and no success generation")
    print("L4/L9 pointers resolve; candidate projection expected-value equality is not checked")
    print("L4/L9 BASE bytes preserved after removing exactly two WR231 witnesses; historical L8 rows checked at git revision; current compact IDs/candidates checked by WR253; candidate contribution to four-way=0")
    print("SCF-B-0192 candidate artifact SHA pins resolve: PASS")
    print("No algorithm, runtime, test suite, or CI was executed.")


if __name__ == "__main__":
    main()
