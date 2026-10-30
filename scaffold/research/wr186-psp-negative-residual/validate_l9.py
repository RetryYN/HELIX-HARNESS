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
    assert audit["single_finding_candidate_count"] == len(audit["single_finding_candidates"]) == 7
    assert audit["unformed_case_count"] == 175
    assert audit["upper_classification_count"] == 34
    assert audit["candidate_classification_count"] == 7
    assert audit["not_formed_classification_count"] == 27
    assert audit["manual_projection_audit_row_count"] == len(audit["manual_projection_audit_rows"]) == 14
    assert audit["supplemental_audit_row_count"] == len(audit["supplemental_audit_rows"]) == 8
    assert "manual_projection_candidates" not in audit and "supplemental_candidate_cases" not in audit
    assert audit["fixed_raw_source"]["revision"] == RAW_REVISION
    assert audit["fixed_raw_source"]["path"] == RAW_PATH
    assert audit["fixed_raw_source"]["sha256"] == hashlib.sha256(raw_bytes).hexdigest()

    f04 = json.loads(F04_MANIFEST.read_bytes())
    f04_rows = rows_by_id(f04["audit_rows"])
    f04_raw = next(x for x in raw["verification_obligations"] if x["id"] == "HARNESS-L9-003-F04")
    f04_live = next(x for x in l9["cases"] if x["id"] == "HARNESS-L9-003-F04")
    f04_classes = l4["contracts"][4]["negative_classifications"]
    f04_states = ["Provisional", "Integrated", "Verified", "Accepted", "Release-eligible", "Deployed", "Observed"]
    expected_f04_ids = {f"H003-F04-MISSING-{state}" for state in f04_states}
    assert f04["candidate_count"] == f04["audit_row_count"] == len(f04_rows) == 7
    assert f04["formal_projection_rows_added"] == 0
    assert f04["formal_expectations_changed"] is False
    assert f04["fixed_raw_source"]["revision"] == RAW_REVISION
    assert f04["fixed_raw_source"]["path"] == RAW_PATH
    assert f04["fixed_raw_source"]["sha256"] == hashlib.sha256(raw_bytes).hexdigest()
    assert set(f04_rows) == expected_f04_ids
    assert {x["case_id"] for x in audit["single_finding_candidates"]} == expected_f04_ids
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
        assert row["finding_code"] == f04_classes[i]["code"]
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
        assert row["raw_condition_evidence"]["non_firing_f04_codes"] == [x["code"] for j, x in enumerate(f04_classes) if j != i]
        assert live["execution_state"] == historical["execution_state"] == "not_executed"
        assert live["effect"] == historical["effect"] == "none"
        assert row["case_provenance"]["mutation_pointer"] == f"/cases/4/negative_cases/{i + 1}/mutation"
        assert live["mutation"] == historical["mutation"]
        assert "expected_material" not in row
        assert row["finding_set_status"] == "candidate_from_fixed_input"
        assert row["output_scope"].startswith("one L4 state-missing condition")

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
    print("WR186/WR192 static audit: PASS; F03/F05 raw pointers=22 unknown/unformed; F04 fixed-input candidates=7; L9 expectations unchanged; formal_rows=0; marker=off")


if __name__ == "__main__":
    main()
