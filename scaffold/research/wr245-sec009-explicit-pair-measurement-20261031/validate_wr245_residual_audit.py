#!/usr/bin/env python3
"""Check per-case evidence for the 71 multi-contract and 2 ambiguous rows.

The checker reads pinned Git blobs and verifies the recorded source values,
finding pointers, layer crosswalk, return owners, and PR-B dispositions. It does
not create or alter any class, expectation, assignment, or formal document.
"""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
AUDIT = HERE / "multi-contract-residual-audit.json"
MEASUREMENT = HERE / "measurement.json"
BASE = "456bf1f4e143811a32ae1314f3146e34098509db"
OLD = "4ba3f600df75aa6e860e0ddf53db68644e1edf98"
PATHS = {
    "L9": "docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json",
    "L4": "docs/helix-security/L4-basic-design/revoke-quarantine-propagation.json",
    "L3B": "docs/helix-security/L3-requirements/business-requirements.json",
    "L3F": "docs/helix-security/L3-requirements/functional-requirements.json",
    "L10B": "docs/helix-security/L10-verification/business-verification.json",
    "L10F": "docs/helix-security/L10-verification/functional-verification.json",
}
EXPECTED_SHA = {
    "L9": "62913b58577cfc0f3c7e6682ad160d8f236157a0ceed9c88ef71822330ed60fc",
    "L4": "c0a31c5c663d39854ed1df13b9bf2bfc439fdb46419d089bc617607d6e6ac5b6",
    "L3B": "f1668180a3daccb38da15f471ade0806c64f094a77b0d7a5cef25edc9b6ce901",
    "L3F": "e4eeb70cc303e44199c7d898281e91c22dba89b47666353b9c80a4c634e898b5",
    "L10B": "c34b8f9a99f8f240558458dd63033acd0d756dfe61ad9cd3aac0e8e1c8193f42",
    "L10F": "e6da7eaff29a623b5d069801280c295d9dd7cc43b51d9cde25b12a8110e5072a",
}
OLD_L9_SHA = "ed74cdc558bd8ba9cad5d8b075eee137bafba9c65e9a4a18bb862c728b646b4f"


def fail(message: str) -> None:
    raise ValueError(message)


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def canonical_sha(value: Any) -> str:
    return sha(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())


def git_blob(rev: str, path: str) -> bytes:
    return subprocess.check_output(["git", "-C", str(REPO), "show", f"{rev}:{path}"])


def get(root: Any, pointer: str) -> Any:
    if pointer == "":
        return root
    if not pointer.startswith("/"):
        fail(f"invalid RFC 6901 pointer {pointer}")
    current = root
    for raw in pointer[1:].split("/"):
        part = raw.replace("~1", "/").replace("~0", "~")
        current = current[int(part)] if isinstance(current, list) else current[part]
    return current


def resolve_finding(input_value: dict[str, Any], finding: dict[str, Any]) -> dict[str, Any]:
    pointer = finding.get("pointer")
    if not isinstance(pointer, str):
        fail("finding has no source pointer")
    try:
        value = get(input_value, pointer)
        present = True
    except (KeyError, IndexError, TypeError):
        value = None
        present = False
    return {"code": finding["code"], "input_pointer": pointer, "input_value_present": present, "input_value": value, "return_owner": finding.get("return_owner")}


def row_check(row: dict[str, Any], population: str, l9: dict[str, Any], old_l9: dict[str, Any], layers: dict[str, Any], ref: dict[str, Any] | None) -> None:
    case = get(l9, row["case_pointer"].split("#", 1)[1])
    case_id = case.get("id")
    if case_id != row.get("case_id"):
        fail(f"current L9 case ID mismatch: {row.get('case_id')}")
    source_path, source_ptr = row["source_input_pointer"].split("#", 1)
    if source_path != PATHS["L9"]:
        fail(f"unexpected historical source path for {case_id}")
    source_index = int(source_ptr.split("/")[2])
    source_case = old_l9["cases"][source_index]
    if source_case.get("id") != case_id or row.get("source_case_pointer") != f"{PATHS['L9']}#/cases/{source_index}":
        fail(f"historical source case pointer mismatch: {case_id}")
    input_value = get(old_l9, source_ptr)
    if canonical_sha(input_value) != row.get("source_input_sha256_canonical_json"):
        fail(f"historical input digest mismatch: {case_id}")
    if input_value.get("phase") != row.get("source_input_phase"):
        fail(f"historical input phase mismatch: {case_id}")

    expected = case.get("expected_proposal", {})
    projection = {k: expected.get(k) for k in ("condition", "selected_phase", "selected_trigger", "selected_recipients", "recipient_correspondence", "policy_correspondence", "isolation_correspondence", "recovery_correspondence")}
    if projection != row.get("expected_projection"):
        fail(f"expected-axis projection mismatch: {case_id}")
    findings = [resolve_finding(input_value, f) for f in expected.get("findings", [])]
    if findings != row.get("source_specific_findings"):
        fail(f"finding/input source evidence mismatch: {case_id}")

    if population == "multi_contract_residual":
        if ref is None:
            fail(f"missing residual source reference: {case_id}")
        residual = l9["multi_contract_residual"]
        reason = residual["reasons"][ref["residual_reason"]]
        if row.get("residual_reason_code") != ref["residual_reason"] or row.get("meaning_reason") != reason["explanation"]:
            fail(f"residual reason mismatch: {case_id}")
        if row.get("case_pointer") != f"{PATHS['L9']}#{ref['nested_pointer'][1:]}" or row.get("source_basis_pointers") != ref["basis_pointers"]:
            fail(f"residual pointer/basis mismatch: {case_id}")
        if row.get("population_state") != ref["population_state"] or row.get("group_count") != reason["count"]:
            fail(f"residual population/count mismatch: {case_id}")
        expected_treatment_prefix = "PR-Bでは正例" if ref["population_state"] == "positive" else "PR-Bではmulti-contract residual"
        if not row.get("PR_B_treatment", "").startswith(expected_treatment_prefix):
            fail(f"PR-B disposition does not match population: {case_id}")
    else:
        if row.get("reason_code") != ref["reason_code"] or row.get("meaning_reason") != ref["reason"]:
            fail(f"ambiguous reason mismatch: {case_id}")
        if row.get("case_pointer") != f"{PATHS['L9']}#{ref['case_pointer']}" or row.get("source_basis_pointers") != ref["source_pointers"]:
            fail(f"ambiguous pointer/basis mismatch: {case_id}")
        if not row.get("PR_B_treatment", "").startswith("PR-BではL9 caseと既存expectedを保持"):
            fail(f"ambiguous PR-B disposition missing: {case_id}")

    owner_values = sorted({f["return_owner"] for f in expected.get("findings", []) if f.get("return_owner")})
    if population == "multi_contract_residual" and ref["population_state"] == "positive":
        required_return = {"kind": "not_applicable_positive_no_findings", "owners": []}
    else:
        required_return = {"kind": "finding_return_owner", "owners": owner_values}
    if row.get("return_destination") != required_return:
        fail(f"return destination mismatch: {case_id}")

    requirement_ids = case.get("requirement_refs", l9["multi_contract_residual"]["requirement_refs"] if population == "multi_contract_residual" else [])
    cross = row.get("cross_layer_targets", [])
    if len(cross) != len(requirement_ids):
        fail(f"cross-layer target count mismatch: {case_id}")
    for target, req_id in zip(cross, requirement_ids):
        l3_doc_key = "L3B" if req_id.endswith("B01") else "L3F"
        l3_doc = layers[l3_doc_key]
        l3_idx = next(i for i, item in enumerate(l3_doc["requirements"]) if item["id"] == req_id)
        l3_item = l3_doc["requirements"][l3_idx]
        l4_idx = next(i for i, item in enumerate(layers["L4"]["contracts"]) if item["requirement_ref"] == req_id)
        l4_item = layers["L4"]["contracts"][l4_idx]
        l10_id = l4_item["system_oracle_ref"]
        l10_doc_key = "L10B" if l10_id.endswith("B01") else "L10F"
        l10_doc = layers[l10_doc_key]
        l10_idx = next(i for i, item in enumerate(l10_doc["cases"]) if item["id"] == l10_id)
        l10_item = l10_doc["cases"][l10_idx]
        want = {
            "L3_requirement_id": req_id,
            "L3_pointer": f"{PATHS[l3_doc_key]}#/requirements/{l3_idx}",
            "L3_obligation": l3_item["obligation"],
            "L10_oracle_id": l10_id,
            "L10_pointer": f"{PATHS[l10_doc_key]}#/cases/{l10_idx}",
            "L10_title": l10_item.get("title"),
            "L4_contract_id": l4_item["id"],
            "L4_pointer": f"{PATHS['L4']}#/contracts/{l4_idx}",
            "L4_component": l4_item["component"],
        }
        if target != want:
            fail(f"L3/L10/L4 cross-layer pointer mismatch: {case_id}/{req_id}")


def main() -> int:
    audit = json.loads(AUDIT.read_bytes())
    measurement = json.loads(MEASUREMENT.read_bytes())
    loaded: dict[str, Any] = {}
    for key, path in PATHS.items():
        raw = git_blob(BASE, path)
        if sha(raw) != EXPECTED_SHA[key] or sha(raw) != audit["source_pins"][key]["sha256"]:
            fail(f"source pin mismatch: {key}")
        loaded[key] = json.loads(raw)
    old_raw = git_blob(OLD, PATHS["L9"])
    if sha(old_raw) != OLD_L9_SHA or sha(old_raw) != audit["source_fixture_pin"]["sha256"]:
        fail("historical L9 fixture pin mismatch")
    old_l9 = json.loads(old_raw)
    l9 = loaded["L9"]

    refs = l9["multi_contract_residual"]["source_case_refs"]
    multi_rows = audit.get("multi_contract_cases", [])
    if len(refs) != 71 or len(multi_rows) != 71:
        fail("expected 71 multi-contract cases")
    if audit.get("multi_contract_population_counts") != {"positive": 28, "negative": 43}:
        fail("multi-contract population count mismatch")
    if len(audit.get("ambiguous_cases", [])) != 2:
        fail("expected two ambiguous cases")

    for ref, row in zip(refs, multi_rows):
        row_check(row, "multi_contract_residual", l9, old_l9, loaded, ref)

    ambiguous_refs = measurement["assignment_comparison"]["unassigned_ambiguous_cases"]
    if len(ambiguous_refs) != 2:
        fail("measurement ambiguous inventory mismatch")
    ambiguous_by_id = {row["case_id"]: row for row in audit["ambiguous_cases"]}
    if len(ambiguous_by_id) != 2:
        fail("duplicate ambiguous row ID")
    for ref in ambiguous_refs:
        row = ambiguous_by_id.get(ref["case_id"])
        if row is None:
            fail(f"ambiguous case missing from audit: {ref['case_id']}")
        row_check(row, "unassigned_ambiguous", l9, old_l9, loaded, ref)

    print("PASS: 71 individual residual rows and 2 ambiguous rows verified against historical source inputs, L9 findings, L3/L10/L4 targets, return owners, and PR-B dispositions")
    print("BOUNDARY: no formal source edits or class/expected/assignment generation")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, IndexError, TypeError, ValueError, subprocess.CalledProcessError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        raise SystemExit(1)
