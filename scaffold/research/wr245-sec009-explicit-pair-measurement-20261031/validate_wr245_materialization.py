#!/usr/bin/env python3
"""Validate frozen WR245 evidence bytes and reconstruct its source inputs only.

This utility reads historic Git blobs, copies source input objects, and replays
recorded RFC 6902 context-copy operations. It does not derive classifications,
expected outcomes, or L9 assignments.
"""
from __future__ import annotations

import copy
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
BLIND = HERE / "wr245-casewise-blind-fixed.json"
INPUTS = HERE / "wr245-unlabeled-inputs-fixed.json"
REFERENCES = HERE / "wr245-phase-reference-inputs-fixed.json"
SOURCE_INDEX = HERE / "wr245-input-source-index.json"
REFERENCE_INDEX = HERE / "wr245-reference-source-index.json"
POSTFREEZE = HERE / "wr245-postfreeze-comparison.json"
MEASUREMENT = HERE / "measurement.json"

BLIND_SHA256 = "d047fcec962b1c9d83a191d9fdd777eea47862af2f906f3adf8f0b1450d1db97"
INPUTS_SHA256 = "95343ae906be8e2d64f793eb2bb88eb9d67a42d4dce29d4165689a35ce80cc2f"
REFERENCES_SHA256 = "ea3e12c450c945d51525ed1bde53c64f5b2bd2cf12b9bb21b1bb4fb98921a6e6"
POSTFREEZE_SHA256 = "26611fc2f110fcd538bf0b2829fadfe8819211397a8ce26178d4831305864c07"
BASE_REVISION = "456bf1f4e143811a32ae1314f3146e34098509db"
BASE_L9_SHA256 = "62913b58577cfc0f3c7e6682ad160d8f236157a0ceed9c88ef71822330ed60fc"
SOURCE_REVISION = "4ba3f600df75aa6e860e0ddf53db68644e1edf98"
SOURCE_PATH = "docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json"
SOURCE_SHA256 = "ed74cdc558bd8ba9cad5d8b075eee137bafba9c65e9a4a18bb862c728b646b4f"
REFERENCE_SOURCE_PATH = "docs/helix-security/L8-unit-verification/revoke-quarantine-propagation.json"
REFERENCE_SOURCE_SHA256 = "b9d803fe039eb8ed23623b91724cf54092eb83f4f6af86de8ebe64e36676ca6b"
HISTORY_PATCH_COMMIT = "3f504b89b6f10fb4a696a3922dfa69ca3c9953bf"


def raw_sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical_sha(value: Any) -> str:
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    return raw_sha(raw)


def fail(message: str) -> None:
    raise ValueError(message)


def git_blob(revision: str, path: str) -> bytes:
    return subprocess.check_output(["git", "-C", str(REPO), "show", f"{revision}:{path}"])


def pointer_parts(pointer: str) -> list[str]:
    if pointer == "":
        return []
    if not pointer.startswith("/"):
        fail(f"invalid RFC 6901 pointer: {pointer}")
    return [part.replace("~1", "/").replace("~0", "~") for part in pointer[1:].split("/")]


def pointer_get(document: Any, pointer: str) -> Any:
    current = document
    for part in pointer_parts(pointer):
        current = current[int(part)] if isinstance(current, list) else current[part]
    return current


def pointer_parent(document: Any, pointer: str) -> tuple[Any, str]:
    parts = pointer_parts(pointer)
    if not parts:
        fail("root pointer mutation is not supported")
    parent = document
    for part in parts[:-1]:
        parent = parent[int(part)] if isinstance(parent, list) else parent[part]
    return parent, parts[-1]


def replay_historic_patch() -> None:
    """Prove the original fixture's logged context copy patch restores its parent."""
    current = json.loads(git_blob(HISTORY_PATCH_COMMIT, SOURCE_PATH))
    parent = json.loads(git_blob(HISTORY_PATCH_COMMIT + "^", SOURCE_PATH))
    materialization = current["fixture_contract"]["shared_context_materialization"]
    operations = materialization["materialization_patch"]
    if len(operations) != 311 or materialization["copy_operation_count"] != 310:
        fail("historic RFC 6902 operation counts changed")
    for operation in operations:
        op = operation["op"]
        if op == "copy":
            value = copy.deepcopy(pointer_get(current, operation["from"]))
            target, key = pointer_parent(current, operation["path"])
            if isinstance(target, list):
                target[int(key)] = value
            else:
                target[key] = value
        elif op == "remove":
            target, key = pointer_parent(current, operation["path"])
            if isinstance(target, list):
                del target[int(key)]
            else:
                del target[key]
        else:
            fail(f"unexpected historic RFC 6902 operation: {op}")
    if current != parent:
        fail("historic RFC 6902 copy log does not reconstruct its parent fixture")


def main() -> int:
    for path, expected in ((BLIND, BLIND_SHA256), (INPUTS, INPUTS_SHA256), (REFERENCES, REFERENCES_SHA256), (POSTFREEZE, POSTFREEZE_SHA256)):
        actual = raw_sha(path.read_bytes())
        if actual != expected:
            fail(f"{path.name} SHA-256 mismatch: {actual}")

    source_bytes = git_blob(SOURCE_REVISION, SOURCE_PATH)
    if raw_sha(source_bytes) != SOURCE_SHA256:
        fail("historical L9 fixture SHA-256 mismatch")
    source = json.loads(source_bytes)
    blind = json.loads(BLIND.read_bytes())
    inputs_doc = json.loads(INPUTS.read_bytes())
    references_doc = json.loads(REFERENCES.read_bytes())
    index_doc = json.loads(SOURCE_INDEX.read_bytes())
    reference_index = json.loads(REFERENCE_INDEX.read_bytes())
    reference_source_bytes = git_blob(SOURCE_REVISION, REFERENCE_SOURCE_PATH)
    if raw_sha(reference_source_bytes) != REFERENCE_SOURCE_SHA256:
        fail("historical L8 reference fixture SHA-256 mismatch")
    reference_source = json.loads(reference_source_bytes)

    if blind.get("request_id") != "WR245-SEC009-EXPLICIT-L4L9":
        fail("unexpected frozen blind request id")
    if inputs_doc.get("input_count") != 245 or len(inputs_doc.get("inputs", [])) != 245:
        fail("fixed unlabeled input count is not 245")
    if index_doc.get("row_count") != 245 or len(index_doc.get("rows", [])) != 245:
        fail("source index row count is not 245")
    if len(blind.get("rows", [])) != 245:
        fail("frozen blind row count is not 245")
    refs = references_doc.get("references", [])
    if len(refs) != 4 or len({r["phase"] for r in refs}) != 4:
        fail("expected exactly four unique phase references")
    refs_by_id = {r["reference_id"]: r for r in refs}
    ref_source_rows = reference_index.get("rows", [])
    if reference_index.get("row_count") != 4 or len(ref_source_rows) != 4:
        fail("reference source index row count is not four")
    if reference_index.get("source_revision") != SOURCE_REVISION:
        fail("reference source revision mismatch")
    for ref_row in ref_source_rows:
        phase_ref = refs_by_id.get(ref_row["reference_id"])
        if phase_ref is None:
            fail("unknown reference in source index")
        if ref_row["source_path"] != REFERENCE_SOURCE_PATH or ref_row["source_file_sha256"] != REFERENCE_SOURCE_SHA256:
            fail("reference source pin mismatch")
        source_case = reference_source["cases"][int(ref_row["source_pointer"].split("/")[2])]
        if source_case.get("id") != ref_row["source_case_id"]:
            fail("reference source case id/index mismatch")
        if pointer_get(reference_source, ref_row["source_pointer"]) != phase_ref.get("input"):
            fail(f"phase reference source pointer mismatch for {ref_row["reference_id"]}")
        if phase_ref.get("phase") != ref_row["phase"] or canonical_sha(phase_ref["input"]) != ref_row["input_sha256_canonical_json"]:
            fail(f"phase reference digest/phase mismatch for {ref_row["reference_id"]}")
    ref1_cross = ref_source_rows[0].get("cross_layer_source_pointer")
    if not ref1_cross or ref1_cross.get("source_path") != SOURCE_PATH or raw_sha(git_blob(SOURCE_REVISION, SOURCE_PATH)) != ref1_cross.get("source_file_sha256"):
        fail("REFERENCE-1 L9 cross-layer source pin mismatch")
    if pointer_get(source, ref1_cross["pointer"]) != refs_by_id["REFERENCE-1"]["input"]:
        fail("REFERENCE-1 source value differs between L9 and L8")
    inputs_by_id = {row["input_id"]: row for row in inputs_doc["inputs"]}
    if len(inputs_by_id) != 245:
        fail("duplicate opaque input IDs")

    source_cases = source["cases"]
    measurement = json.loads(MEASUREMENT.read_bytes())
    measured_rows = measurement["assignment_comparison"]["WR245_new_blind_rows"]
    comparison = json.loads(POSTFREEZE.read_bytes())
    comparison_rows = comparison.get("rows", [])
    if len(measured_rows) != 245 or len(comparison_rows) != 245:
        fail("measurement/postfreeze rows are not 245")
    l9_path = SOURCE_PATH
    l9_bytes = git_blob(BASE_REVISION, l9_path)
    if raw_sha(l9_bytes) != BASE_L9_SHA256:
        fail("base L9 assignment fixture SHA-256 mismatch")
    base_l9 = json.loads(l9_bytes)
    l9_by_case_id = {}
    for contract in base_l9["cases"]:
        for population in ("positive_cases", "negative_cases"):
            for case in contract.get(population, []):
                if case.get("id") in l9_by_case_id:
                    fail(f"duplicate base L9 case ID: {case.get("id")}")
                l9_by_case_id[case["id"]] = case
    for n, (row, blind_row, measured, compared) in enumerate(zip(index_doc["rows"], blind["rows"], measured_rows, comparison_rows)):
        input_id = f"WR245-INPUT-{n + 1:03d}"
        if row["input_id"] != input_id or blind_row.get("input_id") != input_id:
            fail(f"opaque input sequence mismatch at row {n + 1}")
        if row["source_revision"] != SOURCE_REVISION or row["source_path"] != SOURCE_PATH:
            fail(f"source pin mismatch for {input_id}")
        if row["source_file_sha256"] != SOURCE_SHA256:
            fail(f"source digest mismatch for {input_id}")

        source_case = source_cases[row["source_case_index"]]
        if source_case.get("id") != row["source_case_id"]:
            fail(f"source ID/index mismatch for {input_id}")
        expected_pointer = f"/cases/{row['source_case_index']}/given/input"
        if row["source_input_pointer"] != expected_pointer:
            fail(f"source pointer mismatch for {input_id}")
        source_input = copy.deepcopy(pointer_get(source, row["source_input_pointer"]))
        if source_input.get("phase") != row["input_phase"]:
            fail(f"source phase mismatch for {input_id}")

        reference = refs_by_id.get(row["phase_reference_id"])
        if reference is None or reference.get("phase") != row["input_phase"]:
            fail(f"phase reference mismatch for {input_id}")
        reconstructed = source_input
        operation = row["rfc6902_copy_operation"]
        if row["source_context_was_null"]:
            expected_op = {
                "op": "copy",
                "from": f"/references/{row['phase_reference_id']}/input/context",
                "path": f"/inputs/{n}/input/context",
            }
            if operation != expected_op:
                fail(f"RFC 6902 context copy log mismatch for {input_id}")
            ref_context = copy.deepcopy(pointer_get(reference, "/input/context"))
            reconstructed["context"] = ref_context
        else:
            if operation is not None or "context" not in reconstructed:
                fail(f"unexpected context operation for {input_id}")

        packaged = inputs_by_id[input_id]
        if packaged.get("input") != reconstructed:
            fail(f"reconstructed source input differs from packaged bytes for {input_id}")
        digest = canonical_sha(reconstructed)
        if digest != row["input_sha256_canonical_json"]:
            fail(f"canonical input digest mismatch for {input_id}")
        if digest != blind_row.get("input_sha256_canonical_json"):
            fail(f"frozen blind input digest mismatch for {input_id}")
        if blind_row.get("phase") != row["input_phase"]:
            fail(f"blind/input phase mismatch for {input_id}")
        if blind_row.get("phase_reference_id") != row["phase_reference_id"]:
            fail(f"blind/reference ID mismatch for {input_id}")
        if measured.get("input_id") != input_id or measured.get("phase") != row["input_phase"]:
            fail(f"measurement/blind row identity mismatch for {input_id}")
        if measured.get("input_sha256_canonical_json") != digest:
            fail(f"measurement input digest mismatch for {input_id}")
        frozen_candidates = blind_row.get("candidate_classes")
        if measured.get("candidate_classes") != [candidate["class_id"] for candidate in frozen_candidates]:
            fail(f"measurement candidate IDs differ from fixed blind for {input_id}")
        if measured.get("candidate_states") != [candidate["expected_state"] for candidate in frozen_candidates]:
            fail(f"measurement candidate states differ from fixed blind for {input_id}")
        if measured.get("candidate_detail") != frozen_candidates:
            fail(f"measurement candidate detail differs from fixed blind for {input_id}")
        if measured.get("derivation_status") != blind_row.get("derivation_status"):
            fail(f"measurement derivation status differs from fixed blind for {input_id}")
        if measured.get("case_id") != row["source_case_id"]:
            fail(f"measurement source ID mismatch for {input_id}")
        if compared.get("input_id") != input_id or compared.get("case_id") != row["source_case_id"]:
            fail(f"postfreeze comparison row mismatch for {input_id}")
        if compared.get("candidate_classes") != measured.get("candidate_classes"):
            fail(f"postfreeze candidates differ from measured blind IDs for {input_id}")
        source_assignment = l9_by_case_id[row["source_case_id"]].get("negative_class_assignment", {}).get("classification")
        if source_assignment is None or source_assignment != compared.get("current_assignment"):
            fail(f"postfreeze assignment differs from base L9 source for {input_id}")
        if measured.get("existing_l9_assignment") != compared.get("current_assignment"):
            fail(f"measurement/postfreeze existing assignment mismatch for {input_id}")
        expected_relation = "matches" if compared.get("candidate_classes") == [compared.get("current_assignment")] else "mismatch"
        if compared.get("relation") != expected_relation or measured.get("relation") != expected_relation:
            fail(f"comparison relation mismatch for {input_id}")
    if comparison.get("counts") != {"matches": 245}:
        fail("postfreeze match count does not report 245 matches")

    replay_historic_patch()
    print("PASS: fixed blind SHA, input/reference SHA, source history, 245 source pointers, four historical phase references, RFC 6902 context copies, 245 fixed-blind/measurement comparisons, and source assignment verification")
    print("BOUNDARY: validator does not derive class, expected outcome, or existing assignment")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, IndexError, TypeError, ValueError, subprocess.CalledProcessError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        raise SystemExit(1)
