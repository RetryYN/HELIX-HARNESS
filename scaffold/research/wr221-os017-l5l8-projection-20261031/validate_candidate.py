"""Validate WR221's scaffold-only U-ID correspondence without running algorithms."""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = "a53f04482ff883decf1019dc9c212ab712271749"
REVIEWED = "5c62d19b78fca3be1964c0cd3157a540950150dc"
MERGE = "2945b75bc5a71c19885a62a867b0a884399bffae"
L3F = "docs/helix-os/L3-requirements/functional-requirements.json"
L10F = "docs/helix-os/L10-verification/functional-verification.json"
L3B = "docs/helix-os/L3-requirements/business-requirements.json"
L10B = "docs/helix-os/L10-verification/business-verification.json"
L4 = "docs/helix-os/L4-basic-design/ticket-workflow-derivation.json"
L5 = "docs/helix-os/L5-detail-design/ticket-workflow-derivation.json"
L7 = "docs/helix-os/L7-function-verification/ticket-workflow-derivation.json"
L8 = "docs/helix-os/L8-unit-verification/ticket-workflow-derivation.json"
L9 = "docs/helix-os/L9-integration-verification/ticket-workflow-derivation.json"
DECISION = "docs/governance/decisions/helix-os-workflow-prerequisite-l3-l10-delegated-decision-2026-10-12.md"
ADMISSION_AUDIT = "docs/governance/audits/prerequisite-l3-l10-definition-audit-2026-10-12.json"
QA = "docs/governance/design-verification-quality-assurance.md"
BINDING = "scaffold/bindings/SCF-B-0189.json"
RESEARCH = Path("scaffold/research/wr221-os017-l5l8-projection-20261031")
PROJECTION = RESEARCH / "u-id-candidate-projection.json"
EXPECTED_CLASSES = {
    "OS017-NEG-inputs-source_unresolved": ("workflow_material_unknown", ["source_unresolved"], "inputs", "unknown", "ticket-workflow-owner"),
    "OS017-NEG-inputs-source_conflict": ("workflow_material_violation", ["source_conflict"], "inputs", "violation", "ticket-workflow-owner"),
    "OS017-NEG-ownership-source_unresolved": ("workflow_material_unknown", ["source_unresolved"], "ownership", "unknown", "ticket-workflow-owner"),
    "OS017-NEG-ownership-source_conflict": ("workflow_material_violation", ["source_conflict"], "ownership", "violation", "ticket-workflow-owner"),
}


def read(path: str | Path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def base_bytes(path: str):
    return subprocess.check_output(["git", "show", f"{BASE}:{path}"], cwd=ROOT)


def reviewed_bytes(path: str):
    return subprocess.check_output(["git", "show", f"{REVIEWED}:{path}"], cwd=ROOT)


def base(path: str):
    return json.loads(base_bytes(path))


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def resolve(doc, pointer):
    value = doc
    if pointer == "":
        return value
    assert pointer.startswith("/")
    for token in pointer[1:].split("/"):
        token = token.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def main():
    l3f, l10f, l3b, l10b = (read(p) for p in (L3F, L10F, L3B, L10B))
    l4, l5, l7, l8, l9 = (read(p) for p in (L4, L5, L7, L8, L9))
    l4_base, l5_base, l7_base, l8_base, l9_base = (base(p) for p in (L4, L5, L7, L8, L9))
    # The formal V-pair documents must remain byte-identical to this task's base.
    for path in (L5, L8):
        assert (ROOT / path).read_bytes() == base_bytes(path), path
    assert l7 == l7_base
    # #3965 added a fifth L4 candidate and two L9 candidate references. Compare
    # the four WR221 classes by identity/content to the historical task base,
    # while preserving all existing L9 expected objects exactly.
    selected_ids = set(EXPECTED_CLASSES)
    current_selected = {r["class_id"]: r for r in l4["failure_classifications"] if r.get("class_id") in selected_ids}
    base_selected = {r["class_id"]: r for r in l4_base["failure_classifications"] if r.get("class_id") in selected_ids}
    assert current_selected == base_selected and set(current_selected) == selected_ids
    assert len(l4["failure_classifications"]) == len(l4_base["failure_classifications"]) + 1
    assert {r["class_id"] for r in l4["failure_classifications"]} - selected_ids == {"OS017-NEG-workflow-resume-source_unresolved"}
    assert l9["integration_cases"] and l9_base["integration_cases"]
    l9_current_expected = {r["id"]: r.get("expected") for r in l9["integration_cases"]}
    l9_base_expected = {r["id"]: r.get("expected") for r in l9_base["integration_cases"]}
    assert l9_current_expected == l9_base_expected and len(l9_current_expected) == 217
    assert l8["unit_cases"] == l8_base["unit_cases"] and len(l8["unit_cases"]) == 217

    decision = (ROOT / DECISION).read_text(encoding="utf-8")
    audit = read(ADMISSION_AUDIT)
    assert "reviewed_content_head: 5c62d19b78fca3be1964c0cd3157a540950150dc" in decision
    assert "OS017/020/023の追加12組を、このexact本文revisionに限って承認する" in decision
    assert "draft/not_executedは固定bytesとして保持する" in decision
    assert "effective_when_this_record_is_admitted_to_main" in decision
    assert subprocess.run(["git", "merge-base", "--is-ancestor", MERGE, "HEAD"], cwd=ROOT).returncode == 0
    pr_row = next(x for x in audit["admissions"] if x.get("pr") == 2952)
    assert pr_row["approved_content_head"] == "5c62d19b78fca3be1964c0cd3157a540950150dc"
    assert pr_row["approval_comment"] == 6113847591
    assert pr_row["merge_commit"] == MERGE
    assert pr_row["decision_record"] == DECISION
    approved_file_hashes = {
        L3F: "d45e4c646433151cd9d5b463c325326c7a40be0869982ed4abe8244e5cba30e2",
        L3B: "08f26ff3a748c96ec118b97cbadea000a5b1087038478f2e78ea01cd1b6adc20",
        L10F: "49de53593f32bffb922ef82c2a4fa1e7d85ba7cb8dd9ac5928f3bd55f1fc89f4",
        L10B: "5dade451ce3fa234f458536674b8dbb36f2a17d5fb2fe8cf9741ca998a8a2dd8",
    }
    reviewed_docs = {path: json.loads(reviewed_bytes(path)) for path in approved_file_hashes}
    for path, expected_hash in approved_file_hashes.items():
        assert sha(reviewed_bytes(path)) == expected_hash, path
    approved_objects = {}
    for path, doc in reviewed_docs.items():
        key = "requirements" if path in (L3F, L3B) else "cases"
        for row in doc[key]:
            if row.get("id") in {"HELIXOS-L3-017-F01", "HELIXOS-L3-017-B01", "HELIXOS-L10-017-F01", "HELIXOS-L10-017-B01"}:
                approved_objects[row["id"]] = row
    current_objects = {}
    for doc, key in ((l3f, "requirements"), (l3b, "requirements"), (l10f, "cases"), (l10b, "cases")):
        for row in doc[key]:
            if row.get("id") in {"HELIXOS-L3-017-F01", "HELIXOS-L3-017-B01", "HELIXOS-L10-017-F01", "HELIXOS-L10-017-B01"}:
                current_objects[row["id"]] = row
    for row_id, row in current_objects.items():
        assert approved_objects[row_id] == row, row_id
    assert set(current_objects) == {"HELIXOS-L3-017-F01", "HELIXOS-L3-017-B01", "HELIXOS-L10-017-F01", "HELIXOS-L10-017-B01"}
    assert l3f["status"] == l3b["status"] == l10f["status"] == l10b["status"] == "draft_not_approved"

    projection = read(PROJECTION)
    assert projection["status"] == "candidate_partial_incomplete"
    assert projection["authority_effect"] == "none"
    assert projection["source_boundary"]["L4_or_L5_algorithm_executed"] is False
    assert projection["source_boundary"]["runtime_test_ci_executed"] is False
    assert projection["qa_section_3"]["oracle_id"]["status"] == "unassigned_per_uid"
    assert projection["qa_section_3"]["test_citation"]["value"] is None
    assert len(projection["classes"]) == 4
    l4_rows = {r["class_id"]: r for r in l4["failure_classifications"]}
    units = {r["id"]: r for r in l8["unit_cases"]}
    l7_calls = {r["id"]: r for r in l7["function_calls"]}
    l5_functions = {r["id"] for r in l5["functions"]}
    l8_case_memberships = [r for r in l8["cases"]]
    l9_cases = {r.get("source_case_pointer"): r for r in l9["integration_cases"] if r.get("source_case_pointer")}
    common_target_functions = ["F01701", "F01702", "F01703", "F01704", "F01705", "F01706", "F01707", "F01708"]
    assert projection["declared_unit_contract_oracle_refs"] == [
        {
            "unit_contract_id": contract["id"],
            "system_oracle_ref": contract.get("system_oracle_ref"),
            "source_l9_oracle_ref": contract.get("source_l9_oracle_ref"),
            "meaning": "preserved declaration only; not assigned as a per-U-ID oracle",
        }
        for contract in l8["unit_contracts"]
    ]

    total = 0
    seen = set()
    for class_record in projection["classes"]:
        class_id = class_record["class_id"]
        assert class_id in EXPECTED_CLASSES and class_id in l4_rows
        condition, codes, axis, state, owner = EXPECTED_CLASSES[class_id]
        l4_row = l4_rows[class_id]
        assert class_record["source_basis"] == {
            "condition": l4_row["expected_classification"],
            "finding_codes": l4_row["expected"]["finding_codes"],
            "expected_axis": l4_row["expected_axis"],
            "expected_state": l4_row["expected_state"],
            "backflow_owner": l4_row["backflow_owner"],
        }
        assert (l4_row["expected_classification"], l4_row["expected"]["finding_codes"], l4_row["expected_axis"], l4_row["expected_state"], l4_row["backflow_owner"]) == (condition, codes, axis, state, owner)
        assert class_record["candidate_compact_expected"] == {"condition": condition, "finding_codes": codes}
        assert class_record["target_function_refs_common"] == common_target_functions
        assert class_record["l5_class_output_crosswalk"] == "unformed"
        expected_cases = []
        for source in l4_row["source_pointers"]:
            if source["path"] == L7:
                expected_cases.extend(p[:-len("/given_input_ref")] for p in source["pointers"] if p.endswith("/given_input_ref"))
        members = class_record["members"]
        assert len(members) == class_record["member_count"] == len(expected_cases)
        assert {m["l7_case_pointer"] for m in members} == set(expected_cases)
        single_membership_counts = {}
        multi_membership = []
        for member in members:
            uid = member["unit_case_id"]
            assert uid not in seen
            seen.add(uid)
            total += 1
            assert uid in units
            unit = units[uid]
            case_pointer = member["l7_case_pointer"]
            assert case_pointer in expected_cases and unit["source_case_pointer"] == case_pointer
            raw_pointer = case_pointer + "/given_input_ref"
            given_ref = resolve(l7, raw_pointer)
            raw_input = resolve(l7, given_ref["pointer"])
            assert isinstance(raw_input, dict)
            assert unit["condition"] == condition and unit["expected"]["finding_codes"] == codes
            call_ids = [unit["project_call"], *unit["function_calls"]]
            calls = [l7_calls[x] for x in call_ids]
            target_functions = list(dict.fromkeys(x["function"] for x in calls))
            assert len(call_ids) == 8
            assert target_functions == common_target_functions
            assert all(fn in l5_functions for fn in target_functions)
            l5refs = []
            for case in l8_case_memberships:
                if uid in case["unit_case_refs"] and case["l5_contract_ref"] not in l5refs:
                    l5refs.append(case["l5_contract_ref"])
            if len(l5refs) == 1:
                single_membership_counts[l5refs[0]] = single_membership_counts.get(l5refs[0], 0) + 1
            else:
                multi_membership.append({"unit_case_id": uid, "l7_case_pointer": case_pointer, "existing_l5_contract_refs": l5refs})
            if case_pointer in l9_cases:
                assert l9_cases[case_pointer].get("l4_source_class_candidate_ref", {}).get("class_id") == class_id
                assert l9_cases[case_pointer]["condition"] == condition
                assert l9_cases[case_pointer]["expected"]["finding_codes"] == codes
        assert class_record["existing_single_l5_contract_membership_counts"] == single_membership_counts
        assert class_record["multi_contract_exceptions"] == multi_membership
        assert class_record["existing_l8_expected_check"]["selected_phase_observed_common_value"] == "resume"
    assert total == 63 and len(seen) == 63
    assert all("test_citation" not in row for row in units.values())

    binding = read(BINDING)
    upstream_by_path = {item["path"]: item["sha256"] for item in binding["upstream"]}
    for pin in binding["upstream"]:
        assert sha((ROOT / pin["path"]).read_bytes()) == pin["sha256"], pin["path"]
    for path in (L3F, L10F, L3B, L10B, L4, L5, L7, L8, L9, DECISION, ADMISSION_AUDIT, QA):
        assert path in upstream_by_path
    print("WR221 scaffold U-ID static validation: PASS")
    print("formal L5/L8 paths: byte-identical to task base; four scoped classes / 63 unit rows preserved")
    print("#3965 fifth L4 class is explicitly out of scope; all 217 L9 expected objects match task base")
    print("L7 project_call + function-call target refs resolved; all 217 compact expectations retained")
    print("L5 class crosswalk: unformed; 3 input-unknown U-IDs have multiple L5 contract refs")
    print("QA §3 test citations and per-U-ID oracle assignment: incomplete, left unresolved")
    print("PR #2952 delegated decision: merged/admitted; four exact current F01/B01 rows match approved objects")


if __name__ == "__main__":
    main()
