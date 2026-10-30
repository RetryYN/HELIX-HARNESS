#!/usr/bin/env python3
"""Read-only static validator for the WR230 SEC009 L4/L9 research candidate."""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ARTIFACT = Path(__file__).resolve().parent / "compact-candidate.json"


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def pointer_get(document: object, pointer: str) -> object:
    if pointer == "":
        return document
    if not pointer.startswith("/"):
        raise ValueError(f"not a JSON Pointer: {pointer}")
    value = document
    for token in pointer[1:].split("/"):
        token = token.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def source_bytes(revision: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)


def source_order(pointer: str) -> tuple[int, int]:
    # Called only for /cases/<contract-index>/negative_cases/<case-index>/...
    parts = pointer.strip("/").split("/")
    return int(parts[1]), int(parts[3])


def run() -> dict[str, object]:
    failures: list[str] = []
    candidate = json.loads(ARTIFACT.read_text(encoding="utf-8"))
    revision = candidate["source_revision"]
    source_pins = candidate["source_pins"]
    pinned_docs: dict[str, object] = {}
    current_docs: dict[str, object] = {}
    file_pin_results = []

    head = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    if subprocess.run(["git", "merge-base", "--is-ancestor", revision, head], cwd=ROOT).returncode != 0:
        failures.append("pinned_source_revision_not_ancestor_of_worktree_head")

    for pin in source_pins:
        path = pin["path"]
        base_raw = source_bytes(revision, path)
        current_raw = (ROOT / path).read_bytes()
        base_hash, current_hash = digest(base_raw), digest(current_raw)
        file_pin_results.append({
            "path": path,
            "sha256": pin["sha256"],
            "pinned_revision_bytes_match": base_hash == pin["sha256"],
            "current_bytes_match_pinned_revision": current_raw == base_raw,
        })
        if base_hash != pin["sha256"] or current_raw != base_raw:
            failures.append(f"source_pin_mismatch:{path}")
        if path.endswith(".json"):
            pinned_docs[path] = json.loads(base_raw)
            current_docs[path] = json.loads(current_raw)

    l4_path = "docs/helix-security/L4-basic-design/revoke-quarantine-propagation.json"
    l5_path = "docs/helix-security/L5-detail-design/revoke-quarantine-propagation.json"
    l9_path = "docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json"
    l4, l5, l9 = (current_docs[p] for p in (l4_path, l5_path, l9_path))
    base_l4, base_l5, base_l9 = (pinned_docs[p] for p in (l4_path, l5_path, l9_path))

    # The candidate stores only source pointers. Resolve every case row and compare the pinned
    # revision with the working tree without copying IDs, expectations, phases, or owners.
    positive_ptrs = candidate["simple_positive_case_pointers"]
    ambiguous_ptrs = candidate["ambiguous_single_contract_negative_case_pointers"]
    multi_positive_ptrs = candidate["multi_contract_positive_residual_case_pointers"]
    multi_negative_ptrs = candidate["multi_contract_negative_residual_case_pointers"]
    class_rows = candidate["classes"]
    assigned_ptrs = [p for cls in class_rows for p in cls["existing_l9_assignment_pointers"]]

    def case_pointer(assignment_pointer: str) -> str:
        suffix = "/negative_class_assignment"
        if not assignment_pointer.endswith(suffix):
            raise ValueError(f"assignment pointer has unexpected form: {assignment_pointer}")
        return assignment_pointer[:-len(suffix)]

    assigned_case_ptrs = [case_pointer(p) for p in assigned_ptrs]
    simple_negative_ptrs = assigned_case_ptrs + ambiguous_ptrs
    all_case_ptrs = positive_ptrs + simple_negative_ptrs + multi_positive_ptrs + multi_negative_ptrs
    if len(all_case_ptrs) != 356 or len(set(all_case_ptrs)) != 356:
        failures.append("case_pointer_partition_not_356_unique")

    expected_positive_ptrs = [
        f"/cases/{ci}/positive_cases/{ni}"
        for ci, contract in enumerate(l9["cases"])
        for ni, _ in enumerate(contract["positive_cases"])
    ]
    expected_assigned_ptrs = [
        f"/cases/{ci}/negative_cases/{ni}/negative_class_assignment"
        for ci, contract in enumerate(l9["cases"])
        for ni, case in enumerate(contract["negative_cases"])
        if case.get("negative_class_assignment", {}).get("classification")
    ]
    expected_multi_positive_ptrs = [
        f"/multi_contract_residual/positive_cases/{i}"
        for i, _ in enumerate(l9["multi_contract_residual"]["positive_cases"])
    ]
    expected_multi_negative_ptrs = [
        f"/multi_contract_residual/negative_cases/{i}"
        for i, _ in enumerate(l9["multi_contract_residual"]["negative_cases"])
    ]
    if positive_ptrs != expected_positive_ptrs:
        failures.append("simple_positive_pointer_set_or_order_mismatch")
    if set(assigned_ptrs) != set(expected_assigned_ptrs) or len(assigned_ptrs) != len(expected_assigned_ptrs):
        failures.append("existing_assignment_pointer_set_mismatch")
    if multi_positive_ptrs != expected_multi_positive_ptrs:
        failures.append("multi_positive_pointer_set_or_order_mismatch")
    if multi_negative_ptrs != expected_multi_negative_ptrs:
        failures.append("multi_negative_pointer_set_or_order_mismatch")

    # Existing arrays and their numeric pointers are the order source; per-class membership arrays
    # preserve source traversal order, and categories preserve their own source array order.
    for class_row in class_rows:
        class_case_ptrs = class_row["existing_l9_assignment_pointers"]
        if class_case_ptrs != sorted(class_case_ptrs, key=source_order):
            failures.append("class_case_pointer_order_not_source_order")
            break
    if ambiguous_ptrs != [x["case_pointer"] for x in l9["negative_class_assignment_audit"]["unassigned_single_contract_negative_cases"]]:
        failures.append("ambiguous_pointer_order_or_source_mismatch")

    codes_from_l4 = [pointer_get(l4, row["l4_taxonomy_pointer"])["code"] for row in class_rows]
    audit_codes = [row["code"] for row in l9["negative_class_assignment_audit"]["fixed_taxonomy_source_pointers"]]
    if codes_from_l4 != audit_codes:
        failures.append("L4_class_pointer_order_or_taxonomy_mismatch")

    l4_rows = {row["code"]: row for row in l4["failure_classifications"]}
    l5_rows = {row["code"]: row for row in l5["failure_rules"]}
    l5_rule_indices = {row["code"]: i for i, row in enumerate(l5["failure_rules"])}
    seen_keys: set[bytes] = set()
    resolved_assignments = 0
    typed_owner_kinds: dict[str, int] = {}
    case_projection_rows = []

    for class_row in class_rows:
        l4_source_row = pointer_get(l4, class_row["l4_taxonomy_pointer"])
        code = l4_source_row["code"]
        l4_row = l4_rows.get(code)
        l5_row = l5_rows.get(code)
        if l4_row is None or l5_row is None:
            failures.append(f"class_source_unresolved:{code}")
            continue
        if l4_source_row["expected"]["finding_codes"] != l4_row["expected"]["finding_codes"]:
            failures.append(f"contract_class_disagrees_with_failure_classification:{code}")
        if l4_row["expected"]["finding_codes"] != l5_row["expected"]["finding_codes"]:
            failures.append(f"L4_L5_finding_mismatch:{code}")
        if any(l4_row[k] != l5_row.get(k, l5_row.get(k.replace("expected_", ""))) for k in ("backflow_owner", "expected_axis", "expected_state")):
            failures.append(f"L4_L5_owner_axis_state_mismatch:{code}")

        if "function_ref" in l5_row:
            owner_ref = {"kind": "function_ref", "id": l5_row["function_ref"]}
        elif "contract_ref" in l5_row:
            owner_ref = {"kind": "contract_ref", "id": l5_row["contract_ref"]}
        else:
            failures.append(f"L5_typed_owner_missing:{code}")
            continue
        typed_owner_kinds[owner_ref["kind"]] = typed_owner_kinds.get(owner_ref["kind"], 0) + 1
        key = {
            "classification": code,
            "finding_codes": l4_row["expected"]["finding_codes"],
            "backflow_owner": l4_row["backflow_owner"],
            "expected_axis": l4_row["expected_axis"],
            "expected_state": l4_row["expected_state"],
            "owner_ref": owner_ref,
        }
        key_bytes = canonical(key)
        if key_bytes in seen_keys:
            failures.append(f"duplicate_six_attribute_class_key:{code}")
        seen_keys.add(key_bytes)

        l5_index = l5_rule_indices[code]
        # The pointer is resolved for each row so owner provenance remains source-local.
        rule_pointer = f"/failure_rules/{l5_index}"
        if pointer_get(l5, rule_pointer)["function_ref"] != owner_ref.get("id"):
            failures.append(f"L5_owner_pointer_mismatch:{code}")

        for assignment_pointer in class_row["existing_l9_assignment_pointers"]:
            assignment = pointer_get(l9, assignment_pointer)
            case_ptr = case_pointer(assignment_pointer)
            case = pointer_get(l9, case_ptr)
            expected = case["expected_proposal"]
            if assignment.get("classification") != code:
                failures.append(f"existing_assignment_code_mismatch:{assignment_pointer}")
            findings = expected.get("findings", [])
            if [f.get("code") for f in findings] != key["finding_codes"]:
                failures.append(f"case_finding_mismatch:{assignment_pointer}")
            if any(f.get("return_owner") != key["backflow_owner"] for f in findings):
                failures.append(f"case_return_owner_mismatch:{assignment_pointer}")
            if expected.get("operation_effect") != "none":
                failures.append(f"non_none_operation_effect:{assignment_pointer}")
            resolved_assignments += 1

    # Re-resolve every case's ID, phase, trigger, expected bytes, and source pointer from the pinned
    # revision and current source, then compare per-row canonical bytes without storing row values.
    ordered_projection = []
    category_specs = [
        (positive_ptrs, "simple_positive"),
        (sorted(simple_negative_ptrs, key=source_order), "single_contract_negative"),
        (multi_positive_ptrs, "multi_contract_positive_residual"),
        (multi_negative_ptrs, "multi_contract_negative_residual"),
    ]
    seen_ids: set[str] = set()
    projection_pairs = 0
    for pointers, category in category_specs:
        for pointer in pointers:
            current_case = pointer_get(l9, pointer)
            base_case = pointer_get(base_l9, pointer)
            if current_case.get("id") != base_case.get("id") or canonical(current_case["expected_proposal"]) != canonical(base_case["expected_proposal"]):
                failures.append(f"expected_or_case_id_differs_from_pinned_revision:{pointer}")
            case_id = current_case["id"]
            if case_id in seen_ids:
                failures.append(f"duplicate_case_id:{pointer}")
            seen_ids.add(case_id)
            proj = {
                "category": category,
                "pointer": pointer,
                "id": case_id,
                "selected_phase": current_case["expected_proposal"].get("selected_phase"),
                "selected_trigger": current_case["expected_proposal"].get("selected_trigger"),
                "expected_proposal": current_case["expected_proposal"],
            }
            ordered_projection.append(proj)
            projection_pairs += 1
    projection_digest = digest(canonical(ordered_projection))

    expected_counts = {
        "all_l9_source_cases": 356,
        "simple_positive": len(positive_ptrs),
        "single_contract_negative": len(simple_negative_ptrs),
        "assigned_single_contract_negative": resolved_assignments,
        "ambiguous_single_contract_negative": len(ambiguous_ptrs),
        "multi_contract_residual_positive": len(multi_positive_ptrs),
        "multi_contract_residual_negative": len(multi_negative_ptrs),
        "multi_contract_residual_total": len(multi_positive_ptrs) + len(multi_negative_ptrs),
        "fixed_classes": len(class_rows),
    }
    if candidate["population_counts"] != expected_counts:
        failures.append("population_count_mismatch")
    if (len(positive_ptrs), len(simple_negative_ptrs), len(ambiguous_ptrs), len(multi_positive_ptrs), len(multi_negative_ptrs), resolved_assignments) != (8, 277, 2, 28, 43, 275):
        failures.append("expected_population_partition_mismatch")

    return {
        "schema": "wr230-sec009-compact-candidate-validation.v1",
        "evidence_kind": "scaffold",
        "source_revision": revision,
        "worktree_head": head,
        "source_pins": file_pin_results,
        "result": "PASS" if not failures else "FAIL",
        "checks": {
            "pinned_source_files_exact": len(file_pin_results),
            "case_rows_resolved": projection_pairs,
            "case_ids_unique": len(seen_ids),
            "expected_phase_trigger_rows_recomputed": projection_pairs,
            "expected_proposal_pinned_revision_comparisons": projection_pairs,
            "expected_proposal_projection_sha256": projection_digest,
            "unique_six_attribute_class_keys": len(seen_keys),
            "typed_owner_ref_counts": typed_owner_kinds,
            "existing_case_assignment_pointers_resolved": resolved_assignments,
            "source_order_preserved": not any(x.startswith("class_case_pointer_order") or x.startswith("ambiguous_pointer_order") for x in failures),
            "canonical_l4_l9_edited": False,
            "explicit_four_way_claimed": False,
        },
        "population": expected_counts,
        "failures": failures,
        "limits": [
            "Read-only source/pointer validation; no runtime, algorithm, test, or CI execution.",
            "L5 typed owner is source-resolved for candidate key calculation, not an approved L4/L9 parent link.",
            "No explicit mode marker; no formal four-way completion claim.",
        ],
    }


if __name__ == "__main__":
    report = run()
    sys.stdout.write(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    raise SystemExit(0 if report["result"] == "PASS" else 1)
