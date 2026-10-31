#!/usr/bin/env python3
"""Read-only static validator for the WR260 L8 process-state compaction."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
BASE = "569bde0bc5792349f0833461f0bb1bb6db33c592"
L8 = "docs/helix-harness/L8-unit-verification/process-state-port.json"
L4 = "docs/helix-harness/L4-basic-design/process-state-port.json"
L5 = "docs/helix-harness/L5-detail-design/process-state-port.json"
L9 = "docs/helix-harness/L9-integration-verification/process-state-port.json"


def read(path: str) -> Any:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def at_pointer(document: Any, pointer: str) -> Any:
    if not pointer.startswith("/"):
        raise ValueError(f"JSON pointer must start with '/': {pointer}")
    value = document
    for token in pointer[1:].split("/"):
        token = token.replace("~1", "/").replace("~0", "~")
        if isinstance(value, list):
            if not token.isdigit():
                raise ValueError(f"non-numeric RFC6901 array index: {pointer}")
            value = value[int(token)]
        else:
            value = value[token]
    return value


def normalized_expected(value: Any) -> Any:
    """Drop only synthetic fixture provenance/rationale already moved to pins/conditions."""
    if isinstance(value, dict):
        return {
            key: normalized_expected(item)
            for key, item in value.items()
            if key not in {"source_packet_ref", "source_ref", "reason"}
            and not key.endswith("_sha256")
            and key != "sha256"
            and not (
                key == "revision"
                and isinstance(item, str)
                and item.startswith(("fixture-", "FIXTURE-"))
            )
        }
    if isinstance(value, list):
        return [normalized_expected(item) for item in value]
    return value


def compact_expected(value: Any) -> Any:
    """Project expected state/value while dropping fixture refs and repeated rationale."""
    if isinstance(value, dict):
        if "state" in value and "value" in value:
            return {"state": value["state"], "value": compact_expected(value["value"])}
        return {
            key: compact_expected(item)
            for key, item in value.items()
            if key not in {"reason", "source_packet_ref", "source_ref", "revision", "sha256"}
            and not key.endswith("_sha256")
        }
    if isinstance(value, list):
        return [compact_expected(item) for item in value]
    return value


def compact_source_ref(value: Any) -> dict[str, Any] | None:
    if not isinstance(value, dict):
        return None
    ref = value.get("original_source_ref")
    if not isinstance(ref, dict):
        return None
    return {key: ref[key] for key in ("identity", "scope", "owner") if key in ref}


def short_condition(mutation: dict[str, Any]) -> dict[str, Any]:
    path = "/" + "/".join(str(item) for item in mutation.get("path", []))
    if mutation.get("op"):
        op = mutation["op"]
        change = {
            "remove": "remove",
            "add": "add matching association",
            "replace": "replace with a differing value",
        }.get(op, op)
        result = {"path": path, "change": change}
        if op == "add":
            result["selected_role"] = mutation.get("value", {}).get("role")
        return result
    if mutation.get("delete") is True:
        change = "delete"
    elif mutation.get("after") is None:
        change = "set null"
    else:
        after = mutation.get("after")
        if isinstance(after, (str, int, float, bool)):
            change = f"set to {json.dumps(after, ensure_ascii=False)}"
        elif isinstance(after, list):
            change = f"replace with list ({len(after)} items)"
        elif isinstance(after, dict):
            change = "replace with structured value"
        else:
            change = "change"
    return {"path": path, "change": change}


def compact_counterexample_expected(row: dict[str, Any]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    typed = row.get("expected_typed_assessment")
    if isinstance(typed, dict):
        partial = typed.get("partial_values", {})
        if partial:
            out["partial_values"] = compact_expected(partial)
        if "readable_original_materials" in typed:
            out["readable_original_materials"] = typed["readable_original_materials"]
        definition = typed.get("definition_return")
        if isinstance(definition, dict):
            compact_definition = {
                key: definition[key]
                for key in ("state", "owner_target_state", "owner_target", "operation_effect")
                if key in definition
            }
            ref = compact_source_ref(definition)
            if ref:
                compact_definition["owner_ref"] = ref
            context = definition.get("affected_context")
            if isinstance(context, dict):
                compact_definition["affected_context"] = {
                    key: context[key] for key in ("revision", "scope") if key in context
                }
            out["definition_return"] = compact_definition
        unaffected = typed.get("unaffected_scope")
        if isinstance(unaffected, dict):
            compact_unaffected = {key: unaffected[key] for key in ("value", "state") if key in unaffected}
            ref = unaffected.get("ref")
            if isinstance(ref, dict):
                compact_unaffected["ref"] = {
                    key: ref[key] for key in ("identity", "scope", "owner") if key in ref
                }
            out["unaffected_scope"] = compact_unaffected
        if "operation_effect" in typed:
            out["operation_effect"] = typed["operation_effect"]
    elif "expected_partial_values" in row:
        out["partial_values"] = compact_expected(row["expected_partial_values"])
        owner = row.get("expected_owner_return")
        if isinstance(owner, dict):
            compact_owner = {
                key: owner[key]
                for key in ("owner_target_state", "owner_target", "operation_effect")
                if key in owner
            }
            ref = compact_source_ref(owner)
            if ref:
                compact_owner["owner_ref"] = ref
            out["owner_return"] = compact_owner
    return out


def merge_delta(base: Any, delta: Any) -> Any:
    if isinstance(base, dict) and isinstance(delta, dict):
        merged = dict(base)
        for key, value in delta.items():
            if key in merged and isinstance(merged[key], dict) and isinstance(value, dict):
                merged[key] = merge_delta(merged[key], value)
            else:
                merged[key] = value
        return merged
    return delta


def remove_path(value: Any, path: list[Any]) -> None:
    if not path:
        raise ValueError("empty expected_delta_remove path")
    parent = value
    for token in path[:-1]:
        parent = parent[token] if isinstance(parent, list) else parent[str(token)]
    final = path[-1]
    if isinstance(parent, list):
        del parent[int(final)]
    else:
        parent.pop(str(final), None)


def git_json(revision: str, path: str) -> Any:
    raw = subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)
    return json.loads(raw)


def add(checks: dict[str, bool], name: str, value: bool) -> None:
    checks[name] = bool(value)


def run() -> dict[str, Any]:
    current = read(L8)
    old = git_json(BASE, L8)
    l4, l5, l9 = read(L4), read(L5), read(L9)
    checks: dict[str, bool] = {}

    groups = current.get("cases", [])
    old_groups = old.get("cases", [])
    add(checks, "canonical_case_groups_match", [x.get("id") for x in groups] == [x.get("id") for x in old_groups])
    add(checks, "L5_public_functions_all_retained", [x.get("function_ref") for x in groups] == [x.get("id") for x in l5.get("functions", [])])
    add(checks, "L9_basic_branches_all_retained", [x.get("l9_ref") for x in groups] == [x.get("id") for x in l9.get("cases", [])])

    unit_ids_ok = qualification_ids_ok = True
    expected_ok = True
    input_ptrs_ok = True
    matrix_meaning_ok = mixed_qualification_ok = True
    content_meaning_ok = valley_meaning_ok = source_binding_meaning_ok = True
    source_groups_ok = True
    matrix_count = content_count = valley_count = control_count = source_group_count = mixed_count = 0
    unit_count = qualification_count = input_pointer_count = 0
    l9_id_set = {
        row.get("id")
        for branch in l9.get("cases", [])
        for kind in ("normal_cases", "negative_cases")
        for row in branch.get(kind, [])
    }
    for index, group in enumerate(groups):
        before = old_groups[index]
        previous_units = {row["id"]: row for row in before.get("cases", [])}
        current_units = group.get("cases", [])
        current_unit_ids = [row.get("id") for row in current_units]
        unit_count += len(current_units)
        unit_ids_ok &= len(current_unit_ids) == len(set(current_unit_ids)) and set(current_unit_ids) == set(previous_units)
        baseline = group.get("common_expected")
        for row in current_units:
            if not isinstance(row.get("condition"), str) or not row["condition"]:
                expected_ok = False
            source_id = row.get("input_case_id")
            if source_id in l9_id_set:
                ref = row.get("source_case_ref")
                if not isinstance(ref, str) or not ref.startswith(L9 + "#/"):
                    input_ptrs_ok = False
                else:
                    try:
                        target = at_pointer(l9, ref[len(L9) + 1 :])
                        if target.get("id") != source_id:
                            input_ptrs_ok = False
                        input_pointer_count += 1
                    except (KeyError, IndexError, ValueError, TypeError):
                        input_ptrs_ok = False
            elif row.get("source_case_ref"):
                input_ptrs_ok = False
            reconstructed = merge_delta(baseline, row.get("expected_delta", {}))
            for path in row.get("expected_delta_remove", []):
                remove_path(reconstructed, path)
            source_expected = normalized_expected(previous_units[row["id"]].get("expected_partial_values", {}))
            expected_ok &= reconstructed == source_expected

        previous_quals = {row["id"]: row for row in before.get("qualification_cases", [])}
        current_quals = group.get("qualification_cases", [])
        current_qual_ids = [row.get("id") for row in current_quals]
        qualification_count += len(current_quals)
        qualification_ids_ok &= len(current_qual_ids) == len(set(current_qual_ids)) and set(current_qual_ids) == set(previous_quals)
        if current_quals:
            qbaseline = group.get("qualification_baseline_expected")
            for row in current_quals:
                condition = row.get("condition")
                if not condition:
                    expected_ok = False
                reconstructed = merge_delta(qbaseline, row.get("expected_delta", {}))
                for path in row.get("expected_delta_remove", []):
                    remove_path(reconstructed, path)
                source_expected = normalized_expected(previous_quals[row["id"]].get("expected_typed_assessment", {}))
                expected_ok &= reconstructed == source_expected

        matrix_before = before.get("qualification_matrix")
        matrix_after = group.get("qualification_matrix")
        if isinstance(matrix_before, dict) and isinstance(matrix_after, dict):
            old_matrix_rows = matrix_before.get("cases", [])
            new_matrix_rows = matrix_after.get("cases", [])
            matrix_count += len(new_matrix_rows)
            old_mixed_rows = matrix_before.get("mixed_cases", [])
            new_mixed_rows = matrix_after.get("mixed_cases", [])
            mixed_count += len(new_mixed_rows)
            matrix_meaning_ok &= [r.get("id") for r in old_matrix_rows] == [r.get("id") for r in new_matrix_rows]
            matrix_meaning_ok &= len(old_mixed_rows) == len(new_mixed_rows)
            for row_index, (old_row, new_row) in enumerate(zip(old_mixed_rows, new_mixed_rows)):
                current_row = dict(new_row)
                base_ref = current_row.pop("base_row_ref", None)
                expected_ref = f"{BASE}:{L8}#/cases/{index}/qualification_matrix/mixed_cases/{row_index}"
                matrix_meaning_ok &= base_ref == expected_ref and current_row == old_row
            matrix_meaning_ok &= matrix_after.get("effect") == matrix_before.get("effect")
            matrix_meaning_ok &= matrix_after.get("execution_state") == matrix_before.get("execution_state")
            old_reasons = {
                update["reason"]
                for row in old_matrix_rows
                for update in row.get("expected_partial_updates", [])
                if "reason" in update
            }
            new_reasons = set(matrix_after.get("expected_update_rationale", {}).values())
            matrix_meaning_ok &= old_reasons == new_reasons
            for row_index, (old_row, new_row) in enumerate(zip(old_matrix_rows, new_matrix_rows)):
                expected_ref = f"{BASE}:{L8}#/cases/{index}/qualification_matrix/cases/{row_index}"
                matrix_meaning_ok &= new_row.get("base_row_ref") == expected_ref
                if "qualification_changes" in old_row:
                    matrix_meaning_ok &= new_row.get("qualification_changes") == old_row["qualification_changes"]
                    matrix_meaning_ok &= new_row.get("expected_return_groups") == old_row.get("expected_return_groups")
                    expected_states = {u.get("state") for u in old_row.get("expected_partial_updates", [])}
                    matrix_meaning_ok &= new_row.get("expected_projection") == {
                        "aggregate_state": "unknown" if expected_states == {"unknown"} else None,
                        "operation_effect": old_row.get("effect", "none"),
                    }
                    matrix_meaning_ok &= "expected_owner_return" not in new_row
                else:
                    matrix_meaning_ok &= new_row.get("qualification_change") == old_row.get("qualification_change")
                    matrix_meaning_ok &= "qualification_changes" not in new_row
                    matrix_meaning_ok &= "expected_owner_return" in new_row
                matrix_meaning_ok &= new_row.get("expected_partial_updates") == normalized_expected(old_row.get("expected_partial_updates", []))
                if "expected_owner_return" in old_row:
                    matrix_meaning_ok &= new_row.get("expected_owner_return") == normalized_expected(old_row["expected_owner_return"])
                matrix_meaning_ok &= "effect" not in new_row and "execution_state" not in new_row

        # The 12 mixed-qualification rows live in qualification_matrix.mixed_cases.
        mixed_qualification_ok = mixed_qualification_ok and matrix_meaning_ok

        for kind, flag_name in (
            ("content_counterexamples", "content"),
            ("valley_content_counterexamples", "valley"),
            ("source_binding_controls", "source_binding"),
        ):
            old_rows = before.get(kind, [])
            new_rows = group.get(kind, [])
            if flag_name == "content": content_count += len(new_rows)
            elif flag_name == "valley": valley_count += len(new_rows)
            else: control_count += len(new_rows)
            ids_ok = [r.get("id") for r in old_rows] == [r.get("id") for r in new_rows]
            if flag_name == "content": content_meaning_ok &= ids_ok
            elif flag_name == "valley": valley_meaning_ok &= ids_ok
            else: source_binding_meaning_ok &= ids_ok
            for row_index, (old_row, new_row) in enumerate(zip(old_rows, new_rows)):
                expected_ref = f"{BASE}:{L8}#/cases/{index}/{kind}/{row_index}"
                row_ok = new_row.get("base_row_ref") == expected_ref
                for key in ("function_ref", "base_basic_case_ref", "baseline_source_case_ref", "mutation_lane", "source_scope", "base_caller_case_id", "selected_role", "expected_rule", "scope_limit", "expected_projection", "expected_source_binding", "execution_state", "effect"):
                    if key in old_row:
                        row_ok &= new_row.get(key) == old_row[key]
                mutations = old_row.get("mutations")
                if isinstance(mutations, list):
                    expected_condition = [short_condition(item) for item in mutations]
                    row_ok &= new_row.get("condition") == expected_condition
                elif isinstance(old_row.get("mutation"), dict):
                    row_ok &= new_row.get("condition") == short_condition(old_row["mutation"])
                if "expected_typed_assessment" in old_row or "expected_partial_values" in old_row:
                    row_ok &= new_row.get("expected") == compact_counterexample_expected(old_row)
                if flag_name == "source_binding":
                    expected_condition = [short_condition(item) for item in old_row.get("input_patch", [])]
                    for condition, patch in zip(expected_condition, old_row.get("input_patch", [])):
                        if patch.get("op") == "add":
                            condition["selected_role"] = patch.get("value", {}).get("role")
                    row_ok &= new_row.get("condition") == expected_condition
                    try:
                        caller = at_pointer(current, new_row["base_caller_case_ref"].split("#", 1)[1])
                        row_ok &= caller.get("id") == old_row.get("base_caller_case_id")
                    except (KeyError, IndexError, ValueError, TypeError):
                        row_ok = False
                if flag_name == "content": content_meaning_ok &= row_ok
                elif flag_name == "valley": valley_meaning_ok &= row_ok
                else: source_binding_meaning_ok &= row_ok

        # Preserve all source-group IDs and supported meaning while removing fixture locators/revisions.
        for section in ("qualification_matrix", "mixed_qualification"):
            old_block, new_block = before.get(section), group.get(section)
            if not isinstance(old_block, dict) or "source_groups" not in old_block:
                continue
            old_sources = old_block.get("source_groups", {})
            new_sources = new_block.get("source_groups", {}) if isinstance(new_block, dict) else {}
            source_group_count += len(new_sources)
            source_groups_ok &= set(old_sources) == set(new_sources)
            for source_id, old_source in old_sources.items():
                new_source = new_sources.get(source_id, {})
                for key in ("affected_partial_paths", "qualification_limit", "qualification_role", "affected_state", "member"):
                    if key in old_source:
                        source_groups_ok &= new_source.get(key) == old_source[key]
                    else:
                        source_groups_ok &= key not in new_source
                old_ref = old_source.get("source_ref")
                if isinstance(old_ref, dict):
                    compact_ref = {key: old_ref[key] for key in ("identity", "scope", "owner") if key in old_ref}
                    source_groups_ok &= new_source.get("source_ref") == compact_ref
                else:
                    source_groups_ok &= "source_ref" not in new_source
                source_groups_ok &= "material_locator" not in new_source

        for kind in ("qualification_matrix", "content_counterexamples", "valley_content_counterexamples", "source_binding_controls"):
            old_value, new_value = before.get(kind), group.get(kind)
            if isinstance(old_value, dict):
                for key in ("cases", "mixed_cases"):
                    old_rows = old_value.get(key)
                    new_rows = new_value.get(key) if isinstance(new_value, dict) else None
                    if isinstance(old_rows, list):
                        expected_ids = [row.get("id") for row in old_rows]
                        actual_ids = [row.get("id") for row in (new_rows or [])]
                        unit_ids_ok &= expected_ids == actual_ids
            elif isinstance(old_value, list):
                unit_ids_ok &= [row.get("id") for row in old_value] == [row.get("id") for row in (new_value or [])]

    add(checks, "215_unit_ids_preserved", unit_count == 215 and unit_ids_ok)
    add(checks, "172_qualification_ids_preserved", qualification_count == 172 and qualification_ids_ok)
    add(checks, "all_unit_and_qualification_expected_deltas_reconstruct", expected_ok)
    add(checks, "all_current_numeric_l9_input_pointers_resolve", input_ptrs_ok)
    add(checks, "141_qualification_matrix_conditions_and_expectations_preserved", matrix_count == 141 and matrix_meaning_ok)
    add(checks, "12_mixed_qualification_rows_preserved", mixed_count == 12 and mixed_qualification_ok)
    add(checks, "14_content_counterexamples_meaning_preserved", content_count == 14 and content_meaning_ok)
    add(checks, "10_valley_counterexamples_meaning_preserved", valley_count == 10 and valley_meaning_ok)
    add(checks, "7_source_binding_controls_meaning_and_current_callers_resolve", control_count == 7 and source_binding_meaning_ok)
    add(checks, "305_source_group_ids_and_supported_boundaries_preserved", source_group_count == 305 and source_groups_ok)

    rules = l5.get("failure_rules", [])
    l4_by_code = {row.get("code"): row for contract in l4.get("contracts", []) for row in contract.get("negative_classifications", [])}
    negative_rows = [row for group in groups for row in group.get("negative_cases", [])]
    negative_ok = len(rules) == len(negative_rows) == 34
    seen_codes: set[str] = set()
    rules_by_id = {row.get("id"): row for row in rules}
    for row in negative_rows:
        rule = rules_by_id.get(row.get("rule_ref"), {})
        code = rule.get("code")
        source = l4_by_code.get(code, {})
        seen_codes.add(code)
        negative_ok &= (
            row.get("rule_ref") == rule.get("id")
            and row.get("function_ref") == rule.get("function_ref")
            and row.get("expected_classification") == code
            and row.get("change") == rule.get("change") == source.get("change")
            and row.get("expected_axis") == source.get("axis") == rule.get("expected_axis", rule.get("axis"))
            and row.get("expected_state") == source.get("state") == rule.get("expected_state", rule.get("state"))
            and row.get("expected") == source.get("expected") == rule.get("expected")
            and row.get("expected_preserved") == source.get("expected_preserved") == rule.get("expected_preserved")
            and row.get("backflow_owner") == source.get("backflow_owner") == rule.get("backflow_owner")
            and row.get("expected_side_effect_count") == source.get("expected_side_effect_count") == rule.get("expected_side_effect_count")
            and isinstance(row.get("input_case_pointer"), str)
            and row.get("operation_effect") == "none"
        )
    add(checks, "34_negative_rows_derive_from_L4_L5_and_existing_L8_inputs", negative_ok and seen_codes == set(l4_by_code) == {r.get("code") for r in rules})

    removed = current.get("removed_materials", {})
    add(checks, "removed_materials_six_keys_and_DT_VT_105", set(removed) == {"decision_ref", "git_commit", "path", "meaning", "removed_key_rule", "use_boundary"} and "DT-VT-105" in removed.get("use_boundary", ""))
    add(checks, "L9_pseudo_ID_fixture_pointers_removed", not any(token in json.dumps(groups, ensure_ascii=False) for token in ("packet_source_pointer", "payload_source_pointer", "source_packet_pointer", "#/cases/HARNESS-L9-015-F03")))
    forbidden_material_keys = {"expected_private_call_records", "expanded_whole_sha256", "literal_bases", "fixture_preparation", "source_packet", "original_source_packet_ref"}
    add(checks, "no_execution_material_payload_keys", not (forbidden_material_keys & set(walk_keys(groups))))
    add(checks, "no_python_repr_or_digest_maps", not any("object at 0x" in value for value in walk_strings(current)))

    return {
        "schema": "wr260-process-state-l8-validation.v1",
        "evidence_kind": "scaffold",
        "authority_effect": "none",
        "base_revision": BASE,
        "document": L8,
        "current_bytes": (ROOT / L8).stat().st_size,
        "current_sha256": hashlib.sha256((ROOT / L8).read_bytes()).hexdigest(),
        "counts": {
            "unit_rows": unit_count,
            "qualification_rows": qualification_count,
            "qualification_matrix_rows": sum(len(g.get("qualification_matrix", {}).get("cases", [])) for g in groups),
            "mixed_qualification_rows": mixed_count,
            "content_counterexample_rows": content_count,
            "valley_content_counterexample_rows": valley_count,
            "source_binding_control_rows": control_count,
            "source_group_rows": source_group_count,
            "negative_rule_rows": len(negative_rows),
            "resolved_current_l9_input_pointers": input_pointer_count,
        },
        "checks": checks,
        "passed": all(checks.values()),
        "recording": "disabled_by_default; use --record PATH only for a new, non-existing destination",
    }


def walk_strings(node: Any):
    if isinstance(node, dict):
        for key, value in node.items():
            yield from walk_strings(key)
            yield from walk_strings(value)
    elif isinstance(node, list):
        for value in node:
            yield from walk_strings(value)
    elif isinstance(node, str):
        yield node


def walk_keys(node: Any):
    if isinstance(node, dict):
        for key, value in node.items():
            yield key
            yield from walk_keys(value)
    elif isinstance(node, list):
        for value in node:
            yield from walk_keys(value)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--record", type=Path, help="write summary to a new path; existing files are never overwritten")
    args = parser.parse_args()
    result = run()
    rendered = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.record:
        target = args.record if args.record.is_absolute() else ROOT / args.record
        try:
            with target.open("x", encoding="utf-8") as stream:
                stream.write(rendered)
        except FileExistsError:
            print(f"record destination already exists; refusing overwrite: {target}", file=sys.stderr)
            return 2
    print(rendered, end="")
    return 0 if result["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
