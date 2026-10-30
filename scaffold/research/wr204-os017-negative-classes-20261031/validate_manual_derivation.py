#!/usr/bin/env python3
"""Static source-pointer and preservation validation; never executes L4/L5 behavior."""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
EVIDENCE = ROOT / "scaffold/research/wr204-os017-negative-classes-20261031/manual-derivation.json"
L4_PATH = "docs/helix-os/L4-basic-design/ticket-workflow-derivation.json"
L9_PATH = "docs/helix-os/L9-integration-verification/ticket-workflow-derivation.json"
L7_PATH = "docs/helix-os/L7-function-verification/ticket-workflow-derivation.json"
BASE = "e465b3b2edcf8951ea3a5bbedc271543eb2e094e"
EXPECTED_DIGEST = "0899fc16c319b4ad2a321048215066e4e2cee47bf5112dccbb4086b2f6220b02"


def read_json(path: str) -> Any:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def resolve_pointer(document: Any, pointer: str) -> Any:
    """Resolve an RFC6901 JSON Pointer without interpreting domain behavior."""
    if pointer == "":
        return document
    if not pointer.startswith("/"):
        raise AssertionError(f"invalid JSON Pointer: {pointer}")
    value = document
    for raw_token in pointer[1:].split("/"):
        token_chars: list[str] = []
        i = 0
        while i < len(raw_token):
            if raw_token[i] != "~":
                token_chars.append(raw_token[i])
                i += 1
                continue
            if i + 1 >= len(raw_token) or raw_token[i + 1] not in "01":
                raise AssertionError(f"invalid RFC6901 escape in {pointer}")
            token_chars.append("~" if raw_token[i + 1] == "0" else "/")
            i += 2
        token = "".join(token_chars)
        if isinstance(value, dict):
            if token not in value:
                raise AssertionError(f"unresolved pointer {pointer} at {token}")
            value = value[token]
        elif isinstance(value, list):
            if token == "-" or not token.isdigit() or (len(token) > 1 and token[0] == "0"):
                raise AssertionError(f"invalid array index in {pointer}: {token}")
            index = int(token)
            if index >= len(value):
                raise AssertionError(f"unresolved pointer {pointer} at index {index}")
            value = value[index]
        else:
            raise AssertionError(f"pointer traverses scalar in {pointer} at {token}")
    return value


def source_documents() -> dict[str, Any]:
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    paths = {row["path"] for row in evidence["source_pointers"]}
    for row in read_json(L4_PATH)["failure_classifications"]:
        paths.update(ref["path"] for ref in row.get("source_pointers", []))
    return {path: read_json(path) for path in paths}


def validate_declared_pointers() -> int:
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    documents = source_documents()
    checked = 0
    for row in evidence["source_pointers"]:
        pointers = [row["pointer"]] if "pointer" in row else row.get("pointers", [])
        for pointer in pointers:
            resolve_pointer(documents[row["path"]], pointer)
            checked += 1
    l4 = documents[L4_PATH]
    for row in l4["failure_classifications"]:
        for source in row.get("source_pointers", []):
            for pointer in source.get("pointers", []):
                resolve_pointer(documents[source["path"]], pointer)
                checked += 1
    return checked


def expand_l7_value(document: dict[str, Any], value: Any, seen: frozenset[str] = frozenset()) -> Any:
    """Follow only L7 object references to compare fixed raw input graphs."""
    if isinstance(value, dict):
        pointer = value.get("pointer")
        if isinstance(pointer, str) and pointer.startswith("/objects/") and set(value) == {
            "pointer",
            "canonical_sha256",
        }:
            if pointer in seen:
                raise AssertionError(f"cyclic L7 object reference: {pointer}")
            return expand_l7_value(
                document,
                resolve_pointer(document, pointer),
                seen | {pointer},
            )
        return {key: expand_l7_value(document, child, seen) for key, child in value.items()}
    if isinstance(value, list):
        return [expand_l7_value(document, child, seen) for child in value]
    return value


def leaf_differences(left: Any, right: Any, path: str = "") -> list[str]:
    if type(left) is not type(right):
        return [path]
    if isinstance(left, dict):
        if left.keys() != right.keys():
            return [path]
        differences: list[str] = []
        for key in sorted(left):
            differences.extend(leaf_differences(left[key], right[key], f"{path}/{key}"))
        return differences
    if isinstance(left, list):
        if len(left) != len(right):
            return [path]
        differences = []
        for index, (left_item, right_item) in enumerate(zip(left, right)):
            differences.extend(leaf_differences(left_item, right_item, f"{path}/{index}"))
        return differences
    return [] if left == right else [path]


def validate_l7_input_refs() -> None:
    l7 = read_json(L7_PATH)
    l9 = read_json(L9_PATH)
    audit = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    cases = {case["id"]: case for case in l7["cases"]}
    case_pointers = [
        audit["cohort"]["comparison_baseline"]["l7_case_pointer"],
        *[item["l7_case_pointer"] for item in audit["cohort"]["negative_candidates"]],
    ]
    ids = [resolve_pointer(l7, pointer)["id"] for pointer in case_pointers]
    expanded: dict[str, Any] = {}
    for case_id in ids:
        case = cases[case_id]
        input_pointer = case["given_input_ref"]["pointer"]
        raw_input = resolve_pointer(l7, input_pointer)
        expanded[case_id] = expand_l7_value(l7, raw_input)
    baseline_id = ids[0]
    for case_id in ids[1:]:
        differences = leaf_differences(expanded[baseline_id], expanded[case_id])
        if differences != ["/binding/project"]:
            raise AssertionError(f"unexpected raw input diff {baseline_id} -> {case_id}: {differences}")

    witnesses = audit["cohort"].get("additional_raw_witnesses", [])
    if len(witnesses) != 49:
        raise AssertionError(f"expected 49 additional raw witnesses, got {len(witnesses)}")
    l4 = read_json(L4_PATH)
    comparison_table = l4["diagnostic_contract"]["comparison_table"]
    class_counts: dict[str, int] = {}
    for witness in witnesses:
        case_pointer = witness["l7_case_pointer"]
        case = resolve_pointer(l7, case_pointer)
        case_id = case["id"]
        input_pointer = case["given_input_ref"]["pointer"]
        raw_input = resolve_pointer(l7, input_pointer)
        family = witness["field_family"]
        field = witness["field"]
        if family not in ("binding", "management"):
            raise AssertionError(f"non-input comparison family in {case_id}: {family}")
        if field not in comparison_table[family]["fields"]:
            raise AssertionError(f"field is not covered by L4 {family} table: {case_id} {field}")
        phase = raw_input["phase"]
        baseline_case_id, phase_baseline = next(
            (baseline_case_id, value)
            for baseline_case_id, value in (
                (candidate_id, expand_l7_value(l7, resolve_pointer(l7, candidate["given_input_ref"]["pointer"])))
                for candidate_id, candidate in cases.items()
                if candidate_id.endswith("NORMAL-" + phase.upper())
            )
        )
        if phase != phase_baseline["phase"]:
            raise AssertionError(f"phase baseline mismatch for {case_id}")

        # Resolve the actual and context references from the raw input graph itself.
        actual_ref = raw_input[family]["pointer"]
        context_pointer = raw_input["context"]["pointer"]
        context_object = resolve_pointer(l7, context_pointer)
        context_ref = context_object[family]["pointer"]
        actual_value = resolve_pointer(l7, actual_ref + "/" + field)
        context_value = resolve_pointer(l7, context_ref + "/" + field)
        expanded_input = expand_l7_value(l7, resolve_pointer(l7, input_pointer))
        differences = leaf_differences(phase_baseline, expanded_input)
        if witness["changed_side"] == "actual":
            expected_difference = f"/{family}/{field}"
            if actual_value == phase_baseline[family][field] or context_value != phase_baseline["context"][family][field]:
                raise AssertionError(f"actual-side operand is not the single changed leaf: {case_id}")
        elif witness["changed_side"] == "context":
            expected_difference = f"/context/{family}/{field}"
            if context_value == phase_baseline["context"][family][field] or actual_value != phase_baseline[family][field]:
                raise AssertionError(f"context-side operand is not the single changed leaf: {case_id}")
        else:
            raise AssertionError(f"invalid changed_side for {case_id}")
        if differences != [expected_difference]:
            raise AssertionError(f"raw input is not a single-leaf witness for {case_id}: {differences}")

        if actual_value is None or context_value is None:
            if not ((actual_value is None) != (context_value is None)):
                raise AssertionError(f"unresolved witness must have exactly one null operand: {case_id}")
            expected_class_id = "OS017-NEG-inputs-source_unresolved"
        elif (
            isinstance(actual_value, str) and actual_value
            and isinstance(context_value, str) and context_value
            and actual_value != context_value
        ):
            expected_class_id = "OS017-NEG-inputs-source_conflict"
        else:
            raise AssertionError(f"raw operands do not witness either class: {case_id}")
        if witness["class_id"] != expected_class_id:
            raise AssertionError(f"raw operands resolve to a different class for {case_id}")
        class_counts[expected_class_id] = class_counts.get(expected_class_id, 0) + 1

        row = next(row for row in l4["failure_classifications"] if row["class_id"] == expected_class_id)
        declared_pointers = next(
            source["pointers"] for source in row["source_pointers"] if source["path"] == L7_PATH
        )
        if case_pointer + "/given_input_ref" not in declared_pointers:
            raise AssertionError(f"L4 row does not declare the given_input_ref witness for {case_id}")
        l9_pointer = "/integration_cases/" + case_pointer.split("/")[-1]
        if resolve_pointer(l9, l9_pointer)["source_case_pointer"] != case_pointer:
            raise AssertionError(f"L9 case mapping differs for {case_id}")

    if class_counts != {
        "OS017-NEG-inputs-source_unresolved": 33,
        "OS017-NEG-inputs-source_conflict": 16,
    }:
        raise AssertionError(f"additional witness class distribution differs: {class_counts}")

    validate_cross_facet_reuse(l7, l4, audit)

    for case_id, input_obj_pointer, context_obj_pointer in [
        (
            ids[1],
            "/objects/503f5d7a9aa22046ec2e55ee05ee1b9a362553e1a8f881af99e05997244d0ccb",
            "/objects/3067a4f2dd8a085db4b59cdda7e6d9e8aaa9d413dc63e33087048d828a61911f",
        ),
        (
            ids[2],
            "/objects/6f5cccd81e8bf8f4de90ff3d1f5029bda2b0eeed9285be8e04b7a4808a05c790",
            "/objects/3067a4f2dd8a085db4b59cdda7e6d9e8aaa9d413dc63e33087048d828a61911f",
        ),
    ]:
        case = cases[case_id]
        raw_input = resolve_pointer(l7, case["given_input_ref"]["pointer"])
        actual_ref = raw_input["binding"]["pointer"]
        context_pointer = raw_input["context"]["pointer"]
        context_object = resolve_pointer(l7, context_pointer)
        context_ref = context_object["binding"]["pointer"]
        if actual_ref != input_obj_pointer or context_ref != context_obj_pointer:
            raise AssertionError(f"raw binding object refs changed for {case_id}")
        actual = resolve_pointer(l7, actual_ref + "/project")
        context = resolve_pointer(l7, context_ref + "/project")
        candidate = next(
            row for row in audit["cohort"]["negative_candidates"]
            if resolve_pointer(l7, row["l7_case_pointer"])["id"] == case_id
        )
        if actual != candidate["actual_value"] or context != candidate["context_value"]:
            raise AssertionError(f"binding.project values differ from audit for {case_id}")
        if resolve_pointer(l7, raw_input["binding"]["pointer"] + "/project") != actual:
            raise AssertionError(f"actual binding leaf does not resolve for {case_id}")
        if resolve_pointer(l7, context_pointer + "/binding") != context_object["binding"]:
            raise AssertionError(f"context binding reference leaf does not resolve for {case_id}")
        if resolve_pointer(l7, context_ref + "/project") != context:
            raise AssertionError(f"context binding project leaf does not resolve for {case_id}")


def validate_cross_facet_reuse(
    l7: dict[str, Any], l4: dict[str, Any], audit: dict[str, Any]
) -> None:
    """Check cited L4 prose and raw inputs; do not calculate findings or facet states."""
    reuse = audit["cohort"]["cross_facet_reuse_analysis"]
    diagnostic = l4["diagnostic_contract"]
    prose = diagnostic["algorithm"]
    required_anchors = {
        "/diagnostic_contract/algorithm/0": (
            "process.revision→context.binding.contract_revision",
            "proposal/dependency/提供levelのrequirement_revision/scope→context.binding",
        ),
        "/diagnostic_contract/algorithm/1": (
            "parent_revision/scopeをcontext bindingへも照合",
        ),
        "/diagnostic_contract/algorithm/2": (
            "重複findingはcode/pointer/return_ownerで一意化",
        ),
        "/diagnostic_contract/algorithm/5": (
            "actual selected=true時だけlevel recordを読む",
        ),
        "/diagnostic_contract/algorithm/7": (
            "constraintsのbudget_limit/deadline/cost_spent/failures/now",
        ),
        "/diagnostic_contract/algorithm/8": (
            "backflow/resumeだけintermediateのrequirement_revision/scopeを独立context.bindingへ",
        ),
    }
    for pointer, phrases in required_anchors.items():
        index = int(pointer.rsplit("/", 1)[1])
        text = prose[index]
        if any(phrase not in text for phrase in phrases):
            raise AssertionError(f"L4 prose changed for reuse premise {pointer}")
    if "context.binding" in prose[7]:
        raise AssertionError("L4 algorithm/7 constraints prose is not expected to reuse context.binding")
    if "/diagnostic_contract/algorithm/0" not in reuse["l4_prose_pointers"]:
        raise AssertionError("reuse audit does not cite L4 algorithm/0 prose")

    case_rows = {row["l7_case_pointer"]: row for row in reuse["shared_context_binding_cases"]}
    expected_cases = {
        "/cases/92": (
            "requirement_revision",
            [
                "ticket_graph/0/parent_revision",
                "proposal/requirement_revision",
                "dependency/requirement_revision",
                "intermediate/requirement_revision",
            ],
        ),
        "/cases/93": (
            "scope",
            ["ticket_graph/0/scope", "proposal/scope", "dependency/scope", "intermediate/scope"],
        ),
        "/cases/95": ("contract_revision", ["process/revision"]),
    }
    if set(case_rows) != set(expected_cases):
        raise AssertionError("shared context.binding case set differs from reviewed scope")

    def get_path(value: Any, path: str) -> Any:
        current = value
        for token in path.split("/"):
            current = current[int(token)] if isinstance(current, list) else current[token]
        return current

    cases_by_pointer = {
        f"/cases/{index}": case for index, case in enumerate(l7["cases"])
    }
    for pointer, (field, comparison_paths) in expected_cases.items():
        row = case_rows[pointer]
        if row.get("changed_context_leaf") != f"/context/binding/{field}":
            raise AssertionError(f"reuse leaf differs for {pointer}")
        if row.get("dependent_comparison_paths") != comparison_paths:
            raise AssertionError(f"reuse comparison list differs for {pointer}")
        case = cases_by_pointer[pointer]
        raw = expand_l7_value(l7, resolve_pointer(l7, case["given_input_ref"]["pointer"]))
        context_value = get_path(raw, f"context/binding/{field}")
        if context_value is not None:
            raise AssertionError(f"reviewed shared context leaf is not null: {pointer}")
        for comparison_path in comparison_paths:
            operand = get_path(raw, comparison_path)
            if not isinstance(operand, str) or not operand:
                raise AssertionError(f"shared comparison operand is not known in raw input: {pointer} {comparison_path}")
        if raw.get("phase") != "resume" or raw.get("proposal_selected") is not True:
            raise AssertionError(f"resume/proposal selection condition differs for {pointer}")
        if raw.get("level_selected") is not False:
            raise AssertionError(f"level should be unselected under the cited L4 rule: {pointer}")
        if pointer in ("/cases/92", "/cases/93"):
            field_value = get_path(raw, f"intermediate/{field}")
            if not isinstance(field_value, str) or not field_value:
                raise AssertionError(f"intermediate operand is not known in raw input: {pointer}")
            if row.get("raw_conditions", {}).get("intermediate_operand") != "known nonempty string":
                raise AssertionError(f"intermediate operand condition is not recorded for {pointer}")
            expected_facets = ["inputs", "ticket", "workflow", "backflow"]
        else:
            expected_facets = ["inputs", "workflow"]
        if row.get("affected_facets") != expected_facets:
            raise AssertionError(f"source-only facet reuse record differs for {pointer}")
        if list(row.get("local_states_from_l4_prose", {}).values()) != ["unknown"] * len(expected_facets):
            raise AssertionError(f"source-only local facet state record differs for {pointer}")
        if row.get("deduplicated_finding_signature") != ["source_unresolved"]:
            raise AssertionError(f"manual deduplication derivation differs for {pointer}")
        if row.get("overall_condition") != "workflow_material_unknown":
            raise AssertionError(f"manual overall-condition derivation differs for {pointer}")

    additional = audit["cohort"]["additional_raw_witnesses"]
    shared_case_pointers = set(expected_cases)
    for witness in additional:
        pointer = witness["l7_case_pointer"]
        is_reused_context = (
            witness["changed_side"] == "context"
            and witness["field_family"] == "binding"
            and witness["field"] in {"requirement_revision", "scope", "contract_revision"}
        )
        if is_reused_context != (pointer in shared_case_pointers):
            raise AssertionError(f"context binding reuse coverage mismatch for {pointer}")


def expected_projection(revision: str | None = None) -> tuple[str, int]:
    if revision:
        raw = subprocess.check_output(["git", "show", f"{revision}:{L9_PATH}"], cwd=ROOT)
        document = json.loads(raw)
    else:
        document = read_json(L9_PATH)
    rows = [
        {key: case.get(key) for key in ("id", "condition", "expected", "expected_preserved")}
        for case in document["integration_cases"]
    ]
    encoded = json.dumps(rows, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(encoded).hexdigest(), len(rows)


def validate_class_rows_and_unmarked_mode() -> None:
    l4 = read_json(L4_PATH)
    l9 = read_json(L9_PATH)
    l5 = read_json("docs/helix-os/L5-detail-design/ticket-workflow-derivation.json")
    l8 = read_json("docs/helix-os/L8-unit-verification/ticket-workflow-derivation.json")
    expected_ids = [
        "OS017-NEG-inputs-source_unresolved",
        "OS017-NEG-inputs-source_conflict",
    ]
    rows = l4.get("failure_classifications")
    if not isinstance(rows, list) or [row.get("class_id") for row in rows] != expected_ids:
        raise AssertionError("L4 formal failure_classifications rows differ")
    condition_invariants = [
        ("workflow_material_unknown", ["source_unresolved"], "unknown"),
        ("workflow_material_violation", ["source_conflict"], "violation"),
    ]
    for row, (overall_condition, finding_signature, comparison_state) in zip(rows, condition_invariants):
        condition = row.get("condition", "")
        if "phase非依存" not in condition or "resume" in condition.lower():
            raise AssertionError(f"class condition must be phase-independent: {row.get('class_id')}")
        if "binding.project" in condition or "inputs facetの局所state" not in condition:
            raise AssertionError(f"class condition must describe facet state without a field/slot: {row.get('class_id')}")
        if (
            row.get("code") != overall_condition
            or row.get("expected", {}).get("finding_codes") != finding_signature
            or row.get("expected_axis") != "inputs"
            or row.get("expected_state") != comparison_state
        ):
            raise AssertionError(f"class-wide finding/condition invariant differs: {row.get('class_id')}")
        if "全体finding signatureが異なるcaseは本classに含めない" not in condition:
            raise AssertionError(f"class condition must constrain complete finding signature: {row.get('class_id')}")
    contract_refs = {contract["id"]: contract.get("negative_class_refs") for contract in l4["contracts"]}
    if contract_refs.get("HELIXOS-L4-017-F01") != expected_ids:
        raise AssertionError("L4 F01 reverse parent link differs")
    if any(contract_refs.get(cid) != [] for cid in (
        "HELIXOS-L4-017-F02", "HELIXOS-L4-017-F03", "HELIXOS-L4-017-B01"
    )):
        raise AssertionError("L4 non-F01 reverse parent links must be empty arrays")

    def has_marker(document: dict[str, Any]) -> bool:
        if "negative_equivalence_classes" in document:
            return True
        for collection in ("contracts", "functions"):
            rows = document.get(collection, [])
            if isinstance(rows, list) and any(
                isinstance(row, dict) and "negative_equivalence_classes" in row for row in rows
            ):
                return True
        return False

    if any(has_marker(doc) for doc in (l4, l5, l8, l9)):
        raise AssertionError("explicit class marker must remain absent in all four layers")
    if any("negative_class_ref" in row for row in l9["integration_cases"]):
        raise AssertionError("unmarked L9 case rows must not claim explicit class membership")
    candidate_rows = [(5, 0), (6, 1)]
    audit = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    for witness in audit["cohort"].get("additional_raw_witnesses", []):
        class_index = 0 if witness["class_id"] == expected_ids[0] else 1
        candidate_rows.append((int(witness["l7_case_pointer"].split("/")[-1]), class_index))
    for case_index, class_index in candidate_rows:
        case = l9["integration_cases"][case_index]
        if case.get("source_case_pointer") != f"/cases/{case_index}":
            raise AssertionError(f"L9 source case does not match candidate index {case_index}")
        ref = case.get("l4_source_class_candidate_ref")
        if not isinstance(ref, dict) or ref.get("path") != L4_PATH:
            raise AssertionError(f"L9 source candidate reference missing for case {case_index}")
        row = resolve_pointer(l4, ref.get("pointer", ""))
        expected_class_id = l4["failure_classifications"][class_index].get("class_id")
        if ref.get("class_id") != row.get("class_id") or row.get("class_id") != expected_class_id:
            raise AssertionError(f"candidate class ID does not match referenced L4 row for case {case_index}")
        if row is not l4["failure_classifications"][class_index]:
            raise AssertionError(f"L9 source candidate pointer targets wrong L4 row for case {case_index}")


def main() -> None:
    checked = validate_declared_pointers()
    validate_l7_input_refs()
    validate_class_rows_and_unmarked_mode()
    base_hash, base_count = expected_projection(BASE)
    candidate_hash, candidate_count = expected_projection()
    if (base_count, base_hash) != (217, EXPECTED_DIGEST):
        raise AssertionError("L9 base expected projection differs from recorded preservation digest")
    if (candidate_count, candidate_hash) != (base_count, base_hash):
        raise AssertionError("L9 expected projection changed")
    print(
        f"static source validation: pointers={checked}, raw cases=52, class witnesses=51, L4 classes=2, "
        f"cross_facet_reuse_cases=3, L9 cases={candidate_count}, expected_digest={candidate_hash}, "
        f"four_layer_marker=absent"
    )


if __name__ == "__main__":
    main()
