#!/usr/bin/env python3
"""WR186固定raw・pointer・既存case保持の静的監査。finding predicateは評価しない。"""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = "ca4bd911142cc17789366ae6f9f1f0fee8c7c589"
WR192_BASE = "62d7db6aa076d81c1b1f1fd584adeacf76c2f815"
RAW_REVISION = "ed3981e7b9419d796adf1981f8990c6b626ecabe"
RAW_PATH = "docs/helix-harness/L9-integration-verification/process-state-port.json"
L9_PATH = ROOT / RAW_PATH
L3_PATH = "docs/helix-harness/L3-requirements/functional-requirements.json"
L4_PATH = "docs/helix-harness/L4-basic-design/process-state-port.json"
L5_PATH = "docs/helix-harness/L5-detail-design/process-state-port.json"
AUDIT_DIR = Path(__file__).parent
MANIFESTS = (
    AUDIT_DIR / "manual-projection-audit-rows.json",
    AUDIT_DIR / "f05-audit-rows.json",
)
F04_MANIFEST = AUDIT_DIR / "f04-audit-rows.json"


def git_bytes(revision: str, path: str) -> bytes:
    return subprocess.check_output(["git", "-C", str(ROOT), "show", f"{revision}:{path}"])


def resolve(doc, pointer: str):
    value = doc
    for raw in pointer.strip("/").split("/") if pointer else []:
        token = raw.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def rows_by_id(rows):
    result = {row["case_id"]: row for row in rows}
    assert len(result) == len(rows)
    return result


def main() -> None:
    l9 = json.loads(L9_PATH.read_bytes())
    previous_audit_base_l9 = json.loads(git_bytes(BASE, RAW_PATH))
    wr192_base_l9 = json.loads(git_bytes(WR192_BASE, RAW_PATH))
    raw_bytes = git_bytes(RAW_REVISION, RAW_PATH)
    raw = json.loads(raw_bytes)
    l3_current = json.loads((ROOT / L3_PATH).read_bytes())
    l3_pinned = json.loads(git_bytes("827c4ea924a15b6b54bbe9d1f5d2f9fbdefa65de", L3_PATH))
    l4 = json.loads((ROOT / L4_PATH).read_bytes())
    l5 = json.loads((ROOT / L5_PATH).read_bytes())
    audit = l9["negative_output_projection_audit"]

    assert l9["cases"] == previous_audit_base_l9["cases"], "L9 existing cases/expectations differ from prior audit baseline"
    assert l9["cases"] == wr192_base_l9["cases"], "L9 existing cases/expectations differ from WR192 base"
    assert hashlib.sha256(raw_bytes).hexdigest() == "91d0bcd34b8b451bc8e81f5d13d0c5f413de3ad5f7c70ba90a704134c4af3735"
    assert audit["mode"] == "audit_only_no_checker_marker"
    assert audit["source_population_count"] == 182
    assert audit["case_projection_rows_added"] == 0
    expected_single_f04: set[str] = set()
    expected_unformed_f04 = {
        "H003-F04-MISSING-Provisional",
        "H003-F04-MISSING-Integrated",
        "H003-F04-MISSING-Verified",
        "H003-F04-MISSING-Accepted",
        "H003-F04-MISSING-Release-eligible",
        "H003-F04-MISSING-Deployed",
        "H003-F04-MISSING-Observed",
    }
    assert audit["single_finding_candidate_count"] == len(audit["single_finding_candidates"]) == 0
    assert {x["case_id"] for x in audit["single_finding_candidates"]} == expected_single_f04
    assert audit["single_finding_candidates"] == []
    assert audit["unformed_case_count"] == 182
    assert audit["upper_classification_count"] == 34
    formed_codes = {x["class_code"] for x in audit["single_finding_candidates"]}
    assert audit["candidate_classification_count"] == len(formed_codes) == 0
    assert audit["not_formed_classification_count"] == audit["upper_classification_count"] - len(formed_codes) == 34
    assert audit["target_condition_code_count"] == 7
    assert "no candidate is formed" in audit["classification_count_basis"]
    assert audit["manual_projection_audit_row_count"] == len(audit["manual_projection_audit_rows"]) == 14
    assert audit["supplemental_audit_row_count"] == len(audit["supplemental_audit_rows"]) == 8
    assert "manual_projection_candidates" not in audit and "supplemental_candidate_cases" not in audit
    assert audit["fixed_raw_source"]["revision"] == RAW_REVISION
    assert audit["fixed_raw_source"]["path"] == RAW_PATH
    assert audit["fixed_raw_source"]["sha256"] == hashlib.sha256(raw_bytes).hexdigest()

    f04 = json.loads(F04_MANIFEST.read_bytes())
    f04_rows = rows_by_id(f04["audit_rows"])
    common_proof_review = f04["common_other_state_proof_review"]
    assert common_proof_review["raw_packet_qualification"] == "synthetic_design_fixture_not_actual_owner_or_authority"
    common_proof_rows = {row["state"]: row for row in common_proof_review["states"]}
    assert len(common_proof_rows) == len(common_proof_review["states"]) == 8
    f04_raw = next(x for x in raw["verification_obligations"] if x["id"] == "HARNESS-L9-003-F04")
    f04_live = next(x for x in l9["cases"] if x["id"] == "HARNESS-L9-003-F04")
    f04_classes = l4["contracts"][4]["negative_classifications"]
    f04_states = ["Provisional", "Integrated", "Verified", "Accepted", "Release-eligible", "Deployed", "Observed"]
    expected_f04_ids = {f"H003-F04-MISSING-{state}" for state in f04_states}
    assert f04["candidate_count"] == f04["single_finding_candidate_count"] == 0
    assert f04["unknown_unformed_case_count"] == 7
    assert f04["audit_row_count"] == len(f04_rows) == 7
    assert f04["formal_projection_rows_added"] == 0
    assert f04["formal_expectations_changed"] is False
    assert f04["fixed_raw_source"]["revision"] == RAW_REVISION
    assert f04["fixed_raw_source"]["path"] == RAW_PATH
    assert f04["fixed_raw_source"]["sha256"] == hashlib.sha256(raw_bytes).hexdigest()
    assert set(f04_rows) == expected_f04_ids
    assert expected_single_f04 | expected_unformed_f04 == expected_f04_ids
    for i, state in enumerate(f04_states):
        cid = f"H003-F04-MISSING-{state}"
        row = f04_rows[cid]
        historical = next(x for x in f04_raw["negative_cases"] if x["id"] == cid)
        live = next(x for x in f04_live["negative_cases"] if x["id"] == cid)
        source = row["raw_input_source"]
        raw_value = resolve(raw, source["pointer"])
        assert source["revision"] == RAW_REVISION and source["path"] == RAW_PATH
        assert hashlib.sha256(raw_value.encode("utf-8")).hexdigest() == source["sha256"]
        assert source["sha256"] == historical["independent_source_packet"]["sha256"]
        assert historical["independent_source_packet"]["qualification"] == common_proof_review["raw_packet_qualification"]
        assert resolve(raw, row["raw_packet_qualification"]["pointer"]) == row["raw_packet_qualification"]["value"]
        audited_condition_code = row.get("target_condition_code") or row.get("finding_code")
        assert audited_condition_code == f04_classes[i]["code"]
        assert row["axis"] == f04_classes[i]["axis"]
        assert row["condition_source"] == f04_classes[i]["change"]
        assert row["owner_role"] == f04_classes[i]["backflow_owner"]
        assert row["l4_source_pointer"]["pointer"] == f"/contracts/4/negative_classifications/{i}"
        assert resolve(l4, row["l4_source_pointer"]["pointer"]) == f04_classes[i]
        assert row["l4_state_basis_pointer"]["pointer"] == f"/artifact_state_basis/{i + 1}"
        assert resolve(l4, row["l4_state_basis_pointer"]["pointer"])["state"] == state
        assert row["l5_condition_crosscheck_pointer"]["pointer"] == f"/functions/4/failure_output_contract/conditions/{i}"
        assert resolve(l5, row["l5_condition_crosscheck_pointer"]["pointer"])["code"] == f04_classes[i]["code"]
        assert resolve(l5, row["l5_condition_crosscheck_pointer"]["pointer"])["condition_source"] == f04_classes[i]["change"]
        assert row["raw_condition_evidence"]["missing_state_pointer"] == f"/state_proofs/{state}"
        recorded_non_firing_codes = (
            row["raw_condition_evidence"]["non_firing_f04_codes"]
            + row["raw_condition_evidence"]["non_firing_unknown_f04_codes"]
        )
        assert set(recorded_non_firing_codes) == {x["code"] for j, x in enumerate(f04_classes) if j != i}
        assert live["execution_state"] == historical["execution_state"] == "not_executed"
        assert live["effect"] == historical["effect"] == "none"
        assert row["case_provenance"]["mutation_pointer"] == f"/cases/4/negative_cases/{i + 1}/mutation"
        assert live["mutation"] == historical["mutation"]
        assert "expected_material" not in row
        assert raw_value == historical["independent_source_packet"]["raw_utf8"]
        if cid in expected_unformed_f04:
            assert row["candidate_status"] == "withdrawn_single_finding_candidate_nonfiring_unknown"
            assert row["finding_set_status"] == "unknown/unformed"
            assert row["finding_code"] is None
            assert row["finding_code_status"] == "not_formed_unknown_set"
            assert row["raw_condition_evidence"]["single_finding_set_status"] == "unknown/unformed"
            assert row["raw_condition_evidence"]["non_firing_unknown_f04_codes"]
            assert row["non_firing_unknown_reason"]
            assert row["definition_gap_return"]["layer"] == "L5"
            assert row["definition_gap_return"]["owner"] == "L5 function 4 detail-design owner"
            assert "未定義" in row["definition_gap_return"]["reason"]
            for gap_ref in row["definition_gap_return"]["source_pointers"]:
                assert gap_ref["path"] in (L4_PATH, L5_PATH)
                assert resolve(l4 if gap_ref["path"] == L4_PATH else l5, gap_ref["pointer"])
            assert row["ordered_output"].startswith("unknown/unformed")
            assert "no single-finding candidate" in row["output_scope"]
            assert row["non_firing_basis_scope"].startswith("incomplete_unknown_unformed")
        else:
            raise AssertionError(f"unexpected formed F04 candidate: {cid}")
        assert row["non_firing_actual_source_qualification"] == "unknown"
        assert row["state_establishment"] == "unknown_not_claimed"
    for state, review in common_proof_rows.items():
        state_index = ["Working", *f04_states].index(state)
        assert review["l4_state_basis_pointer"] == f"/artifact_state_basis/{state_index}"
        assert resolve(l4, review["l4_state_basis_pointer"])["state"] == state
        assert review["source_material_key"] == f"state_proofs.{state}"
        assert review["proof_pointer"] == f"/state_proofs/{state}"
        assert review["proof_content_pointer"] == f"/state_proofs/{state}/content"
        assert review["reference_pointer"] == f"/state_proofs/{state}/ref"
        assert review["binding_pointer"] == f"/state_proofs/{state}/binding"
        assert review["binding"] == common_proof_review["target_binding"]
        for case_id in review["present_in_audit_case_ids"]:
            case_index = next(j for j, x in enumerate(f04_raw["negative_cases"]) if x["id"] == case_id)
            packet_ptr = f"/verification_obligations/4/negative_cases/{case_index}/independent_source_packet/raw_utf8"
            packet_value = resolve(raw, packet_ptr)
            proof = json.loads(packet_value)["state_proofs"][state]
            proof_hash = hashlib.sha256(
                json.dumps(proof, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
            ).hexdigest()
            assert proof_hash == review["canonical_proof_sha256"]
            assert proof["ref"] == review["reference"]
            assert proof["binding"] == review["binding"]

    # The unresolved cross-state references remain unknown; they are never
    # promoted to firing findings by this static validator.
    verified_ref_review = common_proof_rows["Verified"]["lower_proof_refs_resolution"]
    assert verified_ref_review["l4_state_basis_pointer"] == "/artifact_state_basis/3"
    assert verified_ref_review["l5_qualification_pointer"] == "/functions/4/state_detail/qualification_groups/Verified_lower_proof_refs"
    assert resolve(l5, verified_ref_review["l5_qualification_pointer"]) == {
        "affected_state": "Verified",
        "qualification_role": "state_basis",
    }
    for cid in ("H003-F04-MISSING-Provisional", "H003-F04-MISSING-Integrated"):
        row = f04_rows[cid]
        packet_index = next(i for i, x in enumerate(f04_raw["negative_cases"]) if x["id"] == cid)
        packet = json.loads(resolve(raw, f"/verification_obligations/4/negative_cases/{packet_index}/independent_source_packet/raw_utf8"))
        state = "Provisional" if cid.endswith("Provisional") else "Integrated"
        assert packet["state_proofs"][state] is None
        assert packet["state_proofs"]["Verified"]["content"]["lower_proof_refs"] == verified_ref_review["raw_values"]
        assert "F04_STATE_VERIFIED_PROOF_MISSING" in row["raw_condition_evidence"]["non_firing_unknown_f04_codes"]
    release_ref_review = common_proof_rows["Release-eligible"]["proofs_observation_resolution"]
    assert release_ref_review["l4_state_basis_pointer"] == "/artifact_state_basis/5"
    assert release_ref_review["l5_qualification_pointer"] == "/functions/4/state_detail/qualification_groups/Release-eligible_observations_proofs"
    assert resolve(l5, release_ref_review["l5_qualification_pointer"]) == {
        "affected_state": "Release-eligible",
        "qualification_role": "state_basis",
    }
    for cid in expected_unformed_f04:
        row = f04_rows[cid]
        if cid != "H003-F04-MISSING-Release-eligible":
            assert "F04_STATE_RELEASE-ELIGIBLE_PROOF_MISSING" in row["raw_condition_evidence"]["non_firing_unknown_f04_codes"]
            assert row["raw_condition_evidence"]["non_firing_unknown_basis"]["release_eligible_proofs"]["raw_value"] == {
                "required_ref": "proofs@r1",
                "observed_ref": "proofs@r1",
            }
    release_case_id = "H003-F04-MISSING-Release-eligible"
    release_row = f04_rows[release_case_id]
    release_packet_index = next(i for i, x in enumerate(f04_raw["negative_cases"]) if x["id"] == release_case_id)
    release_packet = json.loads(resolve(raw, f"/verification_obligations/4/negative_cases/{release_packet_index}/independent_source_packet/raw_utf8"))
    recheck = f04["candidate_nonfiring_reference_recheck"]
    assert recheck["release_null_case_id"] == release_case_id
    assert recheck["same_shape_state_basis_reference_count"] == 9
    assert recheck["result"] == "withdraw candidate; all seven F04 cases remain unknown/unformed; no finding is inferred to fire"
    refs = release_row["raw_condition_evidence"]["non_firing_unknown_basis"]["same_shape_state_basis_references"]
    assert refs == recheck["references"] and len(refs) == 9
    for ref in refs:
        assert resolve(release_packet, ref["raw_pointer"]) == ref["raw_value"]
        l5_qualification = resolve(l5, ref["l5_pointer"])
        assert l5_qualification["qualification_role"] == "state_basis"
        assert l5_qualification["affected_state"] == ref["state"]
        assert isinstance(ref["raw_value"], (str, list))
        assert "unknown" in ref["resolution"]
    assert resolve(release_packet, "/state_proofs/Release-eligible") is None
    l4_connection = resolve(l4, "/state_evidence_connection")
    assert "独立原証拠→同revision/scope/artifact/environmentの結合" in l4_connection["flow"]
    l5_rule = resolve(l5, "/functions/4/state_detail/qualification_rule")
    assert "個別に照合する" in l5_rule
    assert release_row["finding_code"] is None
    assert release_row["raw_condition_evidence"]["non_firing_f04_codes"] == []
    assert set(release_row["raw_condition_evidence"]["non_firing_unknown_f04_codes"]) == {x["code"] for x in f04_classes if x["code"] != release_row["target_condition_code"]}

    # Verify the currently pinned L3 clauses without deriving any output.
    assert resolve(l3_pinned, "/requirements/66/obligation") == resolve(l3_current, "/requirements/66/obligation")
    assert resolve(l3_pinned, "/requirements/68/obligation") == resolve(l3_current, "/requirements/68/obligation")

    f03_live = {x["id"]: x for x in next(c for c in l9["cases"] if c["id"] == "HARNESS-L9-003-F03")["negative_cases"]}
    f05_live = {x["id"]: x for x in next(c for c in l9["cases"] if c["id"] == "HARNESS-L9-003-F05")["negative_cases"]}
    f03_raw = {x["id"]: x for x in next(c for c in raw["verification_obligations"] if c["id"] == "HARNESS-L9-003-F03")["negative_cases"]}
    f05_raw = {x["id"]: x for x in next(c for c in raw["verification_obligations"] if c["id"] == "HARNESS-L9-003-F05")["negative_cases"]}

    all_audit_rows = audit["manual_projection_audit_rows"] + audit["supplemental_audit_rows"]
    assert len({row["case_id"] for row in all_audit_rows}) == 22
    for row in all_audit_rows:
        assert row["finding_set_status"] == "unknown/unformed"
        assert row["finding_set"] == "unknown/unformed"
        assert row["owner_status"] == "unknown/unformed"
        assert row["ordered_output_status"] == "unknown/unformed"
        assert row["not_an_empty_set"] is True
        assert row["invalidated_prior_candidate_codes"]
        assert isinstance(row["raw_input_source"], dict)
        source = row["raw_input_source"]
        assert source["revision"] == RAW_REVISION and source["path"] == RAW_PATH
        raw_doc = raw
        raw_value = resolve(raw_doc, source["pointer"])
        assert hashlib.sha256(raw_value.encode("utf-8")).hexdigest() == source["sha256"]
        assert row["mutation_pointer"]["path"] == RAW_PATH
        assert row["l3_source_pointer"]["path"] == L3_PATH
        assert resolve(l3_current, row["l3_source_pointer"]["pointer"])
        assert row["l3_source_pointer"]["revision"] == "827c4ea924a15b6b54bbe9d1f5d2f9fbdefa65de"
        for ref in row["l4_classification_source_pointers"]:
            assert ref["path"] == L4_PATH
            assert resolve(l4, ref["pointer"])
        if row["case_id"].startswith("H003-F03-"):
            case = f03_live[row["case_id"]]
            historical = f03_raw[row["case_id"]]
            expected_l3_pointer = "/requirements/66/obligation"
        else:
            case = f05_live[row["case_id"]]
            historical = f05_raw[row["case_id"]]
            expected_l3_pointer = "/requirements/68/obligation"
        assert row["l3_source_pointer"]["pointer"] == expected_l3_pointer
        assert resolve(l9, row["mutation_pointer"]["pointer"]) == case["mutation"]
        assert resolve(raw, source["pointer"]) == historical["independent_source_packet"]["raw_utf8"]
        assert case["base_case_ref"] == historical["base_case_ref"]

    for manifest_path in MANIFESTS:
        manifest = json.loads(manifest_path.read_bytes())
        assert manifest["candidate_count"] == 0
        assert manifest["audit_row_count"] == len(manifest["audit_rows"])
        assert manifest["invalidated_prior_candidate_count"] == len(manifest["audit_rows"])
        assert all(x["finding_set"] == "unknown/unformed" for x in manifest["audit_rows"])
        assert all(x["not_an_empty_set"] is True for x in manifest["audit_rows"])
        assert all("l9_candidate_singleton_output" not in x for x in manifest["audit_rows"])
        assert all("l4_expected_finding_set" not in x for x in manifest["audit_rows"])

    # The L9 audit must not acquire a scaffold dependency or a formal checker marker.
    assert "scaffold/research/wr186-psp-negative-residual/" not in json.dumps(audit)
    assert "candidate_ref" not in json.dumps(audit)
    print("WR186/WR192 static audit: PASS; F03/F05 raw pointers=22 unknown/unformed; F04 candidate=0, unknown/unformed=7; L9 expectations unchanged; formed_classifications=0/34; target_condition_codes=7; formal_rows=0; marker=off")


if __name__ == "__main__":
    main()
