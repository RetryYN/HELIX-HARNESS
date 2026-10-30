#!/usr/bin/env python3
"""WR186固定raw・pointer・既存case保持の静的監査。finding predicateは評価しない。"""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = "ca4bd911142cc17789366ae6f9f1f0fee8c7c589"
RAW_REVISION = "ed3981e7b9419d796adf1981f8990c6b626ecabe"
RAW_PATH = "docs/helix-harness/L9-integration-verification/process-state-port.json"
L9_PATH = ROOT / RAW_PATH
L3_PATH = "docs/helix-harness/L3-requirements/functional-requirements.json"
L4_PATH = "docs/helix-harness/L4-basic-design/process-state-port.json"
AUDIT_DIR = Path(__file__).parent
MANIFESTS = (
    AUDIT_DIR / "manual-projection-audit-rows.json",
    AUDIT_DIR / "f05-audit-rows.json",
)


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
    base_l9 = json.loads(git_bytes(BASE, RAW_PATH))
    raw_bytes = git_bytes(RAW_REVISION, RAW_PATH)
    raw = json.loads(raw_bytes)
    l3_current = json.loads((ROOT / L3_PATH).read_bytes())
    l3_pinned = json.loads(git_bytes("827c4ea924a15b6b54bbe9d1f5d2f9fbdefa65de", L3_PATH))
    l4 = json.loads((ROOT / L4_PATH).read_bytes())
    audit = l9["negative_output_projection_audit"]

    assert l9["cases"] == base_l9["cases"], "L9 existing cases/expectations differ from latest-main base"
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
    print("WR186 static audit: PASS; raw/pointers=22; finding_sets=unknown/unformed 22; L9 expectations unchanged; formal_rows=0; marker=off; total_unformed=175")


if __name__ == "__main__":
    main()
