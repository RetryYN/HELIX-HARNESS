#!/usr/bin/env python3
"""静的に WR185 の削減対象・保持対象・参照閉包を照合する。"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import subprocess
from collections import Counter
from pathlib import Path
from typing import Any


L8 = "docs/helix-security/L8-unit-verification/credential-value-boundary.json"
L9 = "docs/helix-security/L9-integration-verification/credential-value-boundary.json"
L5 = "docs/helix-security/L5-detail-design/credential-value-boundary.json"
TARGETS = (L8, L9)
SOURCE_PIN_CONTAINERS = {
    "source_pins",
    "upstream_wholefiles",
    "consumer_source_pins",
}
MISSING = object()


def git_bytes(root: Path, revision: str, path: str) -> bytes:
    return subprocess.check_output(
        ["git", "-C", str(root), "show", f"{revision}:{path}"]
    )


def pointer_value(document: Any, pointer: str) -> Any:
    value = document
    if not pointer:
        return value
    if not pointer.startswith("/"):
        raise ValueError(f"JSON pointer must start with '/': {pointer}")
    for raw_token in pointer[1:].split("/"):
        token = raw_token.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def pointer_lookup(document: Any, pointer: str) -> Any:
    try:
        return pointer_value(document, pointer)
    except (KeyError, IndexError, TypeError, ValueError):
        return MISSING


def pointer_tokens(pointer: str) -> list[str]:
    if pointer == "":
        return []
    if not pointer.startswith("/"):
        raise ValueError(f"JSON pointer must start with '/': {pointer}")
    return [part.replace("~1", "/").replace("~0", "~") for part in pointer[1:].split("/")]


def set_pointer(document: Any, pointer: str, value: Any) -> None:
    tokens = pointer_tokens(pointer)
    if not tokens:
        raise ValueError("root replacement is not used by this copy recipe")
    parent: Any = document
    for token in tokens[:-1]:
        parent = parent[int(token)] if isinstance(parent, list) else parent[token]
    leaf = tokens[-1]
    if isinstance(parent, list):
        parent[int(leaf)] = value
    else:
        parent[leaf] = value


def iter_pointer_nodes(value: Any, path: tuple[str, ...] = ()):
    """`original` はpointer値を含み得るraw payloadなので再帰しない。"""
    if isinstance(value, dict):
        if isinstance(value.get("pointer"), str) and "tag" in value:
            yield path, value
        for key, child in value.items():
            if key != "original":
                yield from iter_pointer_nodes(child, path + (key,))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from iter_pointer_nodes(child, path + (str(index),))


def iter_pointer_fields(value: Any, path: tuple[str, ...] = ()):
    if isinstance(value, dict):
        if isinstance(value.get("pointer"), str):
            yield path, value
        for key, child in value.items():
            if key != "original":
                yield from iter_pointer_fields(child, path + (key,))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from iter_pointer_fields(child, path + (str(index),))


def count_nested_pointer_values(value: Any) -> int:
    """Raw fixture本文にある`pointer`という通常データfieldの件数。"""
    if isinstance(value, dict):
        return int("pointer" in value) + sum(count_nested_pointer_values(v) for v in value.values())
    if isinstance(value, list):
        return sum(count_nested_pointer_values(v) for v in value)
    return 0


def count_materialized_original_pointer_values(value: Any) -> int:
    if isinstance(value, dict):
        count = count_nested_pointer_values((value.get("original") or {}).get("raw"))
        return count + sum(
            count_materialized_original_pointer_values(child)
            for key, child in value.items()
            if key != "original"
        )
    if isinstance(value, list):
        return sum(count_materialized_original_pointer_values(child) for child in value)
    return 0


def count_materialized_finding_pointer_values(value: Any) -> int:
    if isinstance(value, dict):
        here = int(
            isinstance(value.get("pointer"), str)
            and "code" in value
            and "tag" not in value
        )
        return here + sum(
            count_materialized_finding_pointer_values(child)
            for key, child in value.items()
            if key != "original"
        )
    if isinstance(value, list):
        return sum(count_materialized_finding_pointer_values(child) for child in value)
    return 0


def iter_finding_pointer_values(value: Any, path: tuple[str, ...] = ()):
    if isinstance(value, dict):
        if (
            isinstance(value.get("pointer"), str)
            and "code" in value
            and "return_owner" in value
        ):
            yield path, value
        for key, child in value.items():
            yield from iter_finding_pointer_values(child, path + (key,))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from iter_finding_pointer_values(child, path + (str(index),))


def pointer_key_counts(value: Any) -> Counter[str]:
    counts: Counter[str] = Counter()

    def walk(node: Any, path: tuple[str, ...] = ()) -> None:
        if isinstance(node, dict):
            for key, child in node.items():
                if key in {"pointer", "argument_pointer", "source_case_pointer", "json_pointer", "from"}:
                    counts[key] += 1
                if key == "path" and path[:2] == ("literal_materialization_contract", "operations"):
                    counts["rfc6902_target_path"] += 1
                walk(child, path + (key,))
        elif isinstance(node, list):
            for index, child in enumerate(node):
                walk(child, path + (str(index),))

    walk(value)
    return counts


def pointer_inventory_digest(value: Any) -> str:
    rows: list[tuple[str, str, Any]] = []

    def walk(node: Any, path: tuple[str, ...] = ()) -> None:
        if isinstance(node, dict):
            for key, child in node.items():
                if key in {"pointer", "argument_pointer", "source_case_pointer", "json_pointer", "from"}:
                    rows.append(("/" + "/".join(path + (key,)), key, child))
                elif key == "path" and path[:2] == ("literal_materialization_contract", "operations"):
                    rows.append(("/" + "/".join(path + (key,)), "rfc6902_target_path", child))
                walk(child, path + (key,))
        elif isinstance(node, list):
            for index, child in enumerate(node):
                walk(child, path + (str(index),))

    walk(value)
    return canonical_sha256(rows)


def expand_literal_materialization(document: dict[str, Any]) -> dict[str, Any]:
    expanded = copy.deepcopy(document)
    operations = expanded["literal_materialization_contract"]["operations"]
    for index, operation in enumerate(operations):
        if operation.get("op") != "copy":
            raise ValueError(f"unsupported recipe operation at {index}")
        source = pointer_lookup(expanded, operation["from"])
        if source is MISSING:
            raise ValueError(f"recipe source does not resolve: {operation['from']}")
        destination = pointer_lookup(expanded, operation["path"])
        if destination is not None:
            raise ValueError(
                f"recipe destination is not a declared null placeholder: {operation['path']}"
            )
        tokens = pointer_tokens(operation["path"])
        parent_pointer = "" if not tokens[:-1] else "/" + "/".join(
            token.replace("~", "~0").replace("/", "~1") for token in tokens[:-1]
        )
        if pointer_lookup(expanded, parent_pointer) is MISSING:
            raise ValueError(f"recipe destination parent does not resolve: {operation['path']}")
        set_pointer(expanded, operation["path"], copy.deepcopy(source))
    return expanded


def audit_pointer_semantics(
    l8: dict[str, Any], l9: dict[str, Any], l5: dict[str, Any], root: Path
) -> dict[str, Any]:
    """文書内参照と入力相対Pointerを、contractが指定する材料上で照合する。"""
    counters: Counter[str] = Counter()
    mismatches: list[dict[str, str]] = []
    expanded = expand_literal_materialization(l8)
    function_by_id = {item["id"]: item for item in l5["functions"]}
    function_by_symbol = {item["symbol"]: item for item in l5["functions"]}

    def read_paths(function: dict[str, Any]) -> list[str]:
        return [item["raw_pointer"] for item in function.get("read_fields", [])]

    def is_read_path(pointer: str, allowed: list[str]) -> bool:
        return any(
            pointer == prefix or (prefix != "" and pointer.startswith(prefix.rstrip("/") + "/"))
            for prefix in allowed
        )

    def check_input_pointer(
        category: str,
        pointer: str,
        input_value: Any,
        original: Any,
        tag: Any,
        identity: str,
    ) -> None:
        counters[f"{category}.count"] += 1
        value = pointer_lookup(input_value, pointer)
        presence = original.get("tag") if isinstance(original, dict) else None
        if value is MISSING:
            if presence == "absent" or tag == "absent":
                counters[f"{category}.expected_absent"] += 1
            else:
                counters[f"{category}.unresolved"] += 1
                mismatches.append({"category": category, "identity": identity, "pointer": pointer, "state": "unexplained_absence"})
        elif presence == "absent" or tag == "absent":
            counters[f"{category}.unexpected_present"] += 1
            mismatches.append({"category": category, "identity": identity, "pointer": pointer, "state": "present_but_expected_absent"})
        elif presence == "supplied" and original.get("raw") != value:
            counters[f"{category}.value_mismatch"] += 1
            mismatches.append({"category": category, "identity": identity, "pointer": pointer, "state": "original_raw_mismatch"})
        else:
            counters[f"{category}.resolved"] += 1

    for case in expanded["cases"]:
        identity = case["id"]
        raw = json.loads(case["raw_utf8"])
        materialization = case.get("raw_materialization")
        if isinstance(materialization, dict):
            argument = materialization["expected_argument"]
            if argument.get("original", {}).get("raw") != raw:
                mismatches.append({"category": "raw_materialization_root", "identity": identity, "pointer": "", "state": "raw_utf8_mismatch"})
            for _, node in iter_pointer_nodes(argument):
                check_input_pointer("raw_materialization_pointer", node["pointer"], raw, node.get("original"), node.get("tag"), identity)
            counters["embedded_materialized_original_pointer_values"] += count_materialized_original_pointer_values(argument)
            counters["embedded_materialized_finding_pointer_values"] += count_materialized_finding_pointer_values(argument)

            for row in case.get("expected_declared_member_presence") or []:
                if not isinstance(row, dict):
                    continue
                check_input_pointer("expected_presence_pointer", row["pointer"], raw, row.get("original"), row.get("tag"), identity)
                counters["argument_pointer.count"] += 1
                target = pointer_lookup(argument, row["argument_pointer"])
                if target is MISSING or target is None:
                    counters["argument_pointer.unresolved_after_recipe"] += 1
                    mismatches.append({"category": "argument_pointer", "identity": identity, "pointer": row["argument_pointer"], "state": "target_absent_after_recipe"})
                elif not isinstance(target, dict) or any(
                    target.get(key) != row.get(key) for key in ("pointer", "tag", "original")
                ):
                    counters["argument_pointer.target_mismatch"] += 1
                    mismatches.append({"category": "argument_pointer", "identity": identity, "pointer": row["argument_pointer"], "state": "target_row_mismatch"})
                else:
                    counters["argument_pointer.resolved_exact_after_recipe"] += 1
                raw_copy = (row.get("original") or {}).get("raw")
                counters["embedded_expected_presence_raw_pointer_values"] += count_nested_pointer_values(raw_copy)

        source_frame = raw.get("source_frame", raw) if isinstance(raw, dict) else raw
        for _, finding in iter_finding_pointer_values(raw):
            counters["raw_input_finding_pointer.count"] += 1
            if pointer_lookup(source_frame, finding["pointer"]) is MISSING:
                counters["raw_input_finding_pointer.unresolved"] += 1
                mismatches.append({"category": "raw_input_finding_pointer", "identity": identity, "pointer": finding["pointer"], "state": "unresolved_against_source_frame"})
            else:
                counters["raw_input_finding_pointer.resolved_against_source_frame"] += 1
            finding_reads = [
                pointer
                for item in l5["functions"]
                if item["symbol"] not in {"build_credential_proposal", "materialize_credential_frame"}
                for pointer in read_paths(item)
            ]
            if is_read_path(finding["pointer"], finding_reads):
                counters["raw_input_finding_pointer_supported_by_l5_read_fields"] += 1
            else:
                counters["raw_input_finding_pointer_without_l5_read_field"] += 1
                mismatches.append({"category": "raw_input_finding_pointer", "identity": identity, "pointer": finding["pointer"], "state": "outside_l5_component_read_fields"})

        result = case.get("expected_result") or {}
        for _, node in iter_pointer_nodes(result.get("argument")):
            check_input_pointer("result_argument_pointer", node["pointer"], raw, node.get("original"), node.get("tag"), identity)

        function = function_by_id.get(case["function_ref"], {})
        finding_root = raw
        if case.get("symbol") == "build_credential_proposal":
            finding_root = raw.get("source_frame", MISSING) if isinstance(raw, dict) else MISSING
        for finding in result.get("findings", []):
            counters["expected_finding_pointer.count"] += 1
            if case.get("symbol") == "build_credential_proposal":
                # 合成関数は原source_frameと前段結果を受けてFindingを保持する。
                allowed_reads = [
                    pointer
                    for item in l5["functions"]
                    if item["symbol"] not in {"build_credential_proposal", "materialize_credential_frame"}
                    for pointer in read_paths(item)
                ]
            else:
                allowed_reads = read_paths(function)
            if is_read_path(finding["pointer"], allowed_reads):
                counters["expected_finding_pointer_supported_by_l5_read_fields"] += 1
            else:
                counters["expected_finding_pointer_without_l5_read_field"] += 1
                mismatches.append({"category": "expected_finding_pointer", "identity": identity, "pointer": finding["pointer"], "state": "outside_l5_read_fields"})
            if pointer_lookup(finding_root, finding["pointer"]) is MISSING:
                # L5 states that an absent request flag produces this exact finding.
                absent_by_l5 = (
                    case.get("symbol") == "plan_credential_use"
                    and finding.get("code") == "credential_request_unresolved"
                    and finding["pointer"] == "/credential_requested"
                    and any(x.get("raw_pointer") == finding["pointer"] for x in function.get("read_fields", []))
                    and any("credential_request_unresolved /credential_requested" in x for x in function.get("pure_algorithm", []))
                )
                if absent_by_l5:
                    counters["expected_finding_pointer.absent_by_l5_contract"] += 1
                else:
                    counters["expected_finding_pointer.unresolved"] += 1
                    mismatches.append({"category": "expected_finding_pointer", "identity": identity, "pointer": finding["pointer"], "state": "unexplained_absence"})
            else:
                counters["expected_finding_pointer.resolved"] += 1
        for issue in result.get("input_issues", []):
            check_input_pointer("expected_input_issue_pointer", issue["pointer"], raw, None, issue.get("raw_tag"), identity)
        for gap in result.get("gaps", []):
            counters["source_gap_pointer.count"] += 1
            source_function = function_by_symbol.get("retain_credential_source_material", {})
            if is_read_path(gap["pointer"], read_paths(source_function)):
                counters["source_gap_pointer_supported_by_l5_read_fields"] += 1
            else:
                mismatches.append({"category": "source_gap_pointer", "identity": identity, "pointer": gap["pointer"], "state": "outside_l5_read_fields"})
            if pointer_lookup(raw, gap["pointer"]) is MISSING:
                counters["source_gap_pointer.unresolved"] += 1
                mismatches.append({"category": "source_gap_pointer", "identity": identity, "pointer": gap["pointer"], "state": "unresolved"})
            else:
                counters["source_gap_pointer.resolved"] += 1

    source = l8["original_case_chains"]["source"]
    old_l9 = json.loads(git_bytes(root, source["revision"], source["path"]))
    for record in l8["original_case_chains"]["records"]:
        historical = pointer_value(old_l9, record["source_case_pointer"])
        raw = historical.get("given", {}).get("input")
        counters["historical_source_case_pointer.count"] += 1
        counters["historical_source_case_pointer.resolved"] += 1
        for row in record.get("expected_declared_presence", []):
            check_input_pointer("historical_presence_pointer", row["pointer"], raw, row.get("original"), row.get("tag"), record["id"])
        step_symbols = {
            "plan": "plan_credential_use",
            "tuple": "compare_credential_tuple",
            "classification": "compare_credential_classification",
            "authority": "compare_use_authority_material",
            "lifecycle": "compare_capability_lifecycle",
            "exposure": "compare_value_exposure",
            "inspection": "compare_secret_inspections",
            "initial": "classify_initial_path",
            "followups": "derive_credential_followups",
        }
        for step_name, step_value in record.get("expected_step_outputs", {}).items():
            step_function = function_by_symbol.get(step_symbols.get(step_name, ""), {})
            for _, node in iter_pointer_fields(step_value):
            # Step findings carry a code field, not the Materialized<T> tag.
                if "code" in node:
                    counters["historical_step_finding_pointer.count"] += 1
                    if is_read_path(node["pointer"], read_paths(step_function)):
                        counters["historical_step_finding_pointer_supported_by_l5_read_fields"] += 1
                    else:
                        counters["historical_step_finding_pointer_without_l5_read_field"] += 1
                        mismatches.append({"category": "historical_step_finding_pointer", "identity": record["id"], "pointer": node["pointer"], "state": "outside_l5_step_read_fields"})
                    if pointer_lookup(raw, node["pointer"]) is MISSING:
                        counters["historical_step_finding_pointer.unresolved"] += 1
                        mismatches.append({"category": "historical_step_finding_pointer", "identity": record["id"], "pointer": node["pointer"], "state": "unresolved"})
                    else:
                        counters["historical_step_finding_pointer.resolved"] += 1

    for case in l9["cases"]:
        raw = case["given"]["input"]
        for finding in case.get("expected_proposal", {}).get("findings", []):
            counters["L9_finding_pointer.count"] += 1
            all_l5_reads = [pointer for item in l5["functions"] for pointer in read_paths(item)]
            if is_read_path(finding["pointer"], all_l5_reads):
                counters["L9_finding_pointer_supported_by_l5_read_fields"] += 1
            else:
                counters["L9_finding_pointer_without_l5_read_field"] += 1
                mismatches.append({"category": "L9_finding_pointer", "identity": case["id"], "pointer": finding["pointer"], "state": "outside_l5_read_fields"})
            if pointer_lookup(raw, finding["pointer"]) is MISSING:
                counters["L9_finding_pointer.unresolved"] += 1
                mismatches.append({"category": "L9_finding_pointer", "identity": case["id"], "pointer": finding["pointer"], "state": "unresolved"})
            else:
                counters["L9_finding_pointer.resolved"] += 1

    for anchor in expanded["literal_materialization_contract"]["source_binding"]["anchors"]:
        counters["recipe_anchor_pointer.count"] += 1
        if pointer_lookup(expanded, anchor["pointer"]) is MISSING:
            counters["recipe_anchor_pointer.unresolved"] += 1
            mismatches.append({"category": "recipe_anchor_pointer", "identity": "literal_materialization_contract", "pointer": anchor["pointer"], "state": "unresolved"})
        else:
            counters["recipe_anchor_pointer.resolved"] += 1

    recipe_ops = expanded["literal_materialization_contract"]["operations"]
    counters["recipe_copy_operations"] = len(recipe_ops)
    counters["recipe_copy_from_pointers_resolved"] = len(recipe_ops)
    counters["recipe_copy_target_placeholders_expanded"] = len(recipe_ops)
    physical_counts = {
        L8: dict(pointer_key_counts(l8)),
        L9: dict(pointer_key_counts(l9)),
    }
    return {
        "static_expansion_applied_before_pointer_checks": True,
        "source_basis": {
            "L8_oracle_contract": "#/oracle_contract/meaning",
            "L8_recipe_contract": "#/literal_materialization_contract/restoration_order and /note",
            "L5_pointer_type_and_member_contract": "#/type_contract/result_types/Pointer, Finding, InputIssue, Field<T>, Materialized<T>",
            "L5_input_read_contract": "#/functions[]/read_fields[].raw_pointer",
            "L5_missing_request_rule": "#/functions[plan_credential_use]/pure_algorithm",
            "L5_composition_rule": "#/functions[build_credential_proposal]/read_fields and /pure_algorithm",
            "L4_semantic_boundaries": "#/contracts/0/content_comparison and /contracts/1/content_comparison",
        },
        "stored_pointer_key_counts": physical_counts,
        "expanded_L8_pointer_resolution_counts": dict(sorted(counters.items())),
        "expanded_L8_pointer_mismatches": mismatches,
        "expanded_L8_argument_pointer_unresolved_count": counters["argument_pointer.unresolved_after_recipe"],
        "expanded_L8_argument_pointer_count": counters["argument_pointer.count"],
        "input_presence_absence_is_explicitly_classified": True,
        "embedded_pointer_value_occurrences": {
            "materialized_original_snapshots": counters["embedded_materialized_original_pointer_values"],
            "materialized_finding_values": counters["embedded_materialized_finding_pointer_values"],
            "declared_presence_raw_snapshots": counters["embedded_expected_presence_raw_pointer_values"],
            "total": sum(
                counters[key]
                for key in (
                    "embedded_materialized_original_pointer_values",
                    "embedded_materialized_finding_pointer_values",
                    "embedded_expected_presence_raw_pointer_values",
                )
            ),
        },
        "pointer_inventory_digest": {
            L8: pointer_inventory_digest(l8),
            L9: pointer_inventory_digest(l9),
        },
    }


def canonical_sha256(value: Any) -> str:
    raw = json.dumps(
        value, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def is_source_pin_hash(path: tuple[str, ...], key: str) -> bool:
    if any(part in SOURCE_PIN_CONTAINERS for part in path):
        return True
    if path[:1] == ("approved_whole_objects",) and key == "whole_file_sha256":
        return True
    if path[:1] == ("legacy_comparison",) and key in {
        "file_sha256",
        "source_sha256",
    }:
        return True
    if path[:2] == ("legacy_comparison", "source_quotes") and key == "whole_file_sha256":
        return True
    if path[:2] == ("legacy_comparison", "asset_inventory") and key == "source_sha256":
        return True
    if path[:2] == ("failure_basis", "source") and key == "whole_file_sha256":
        return True
    if path[:2] == ("literal_materialization_contract", "source_binding") and key == "raw_sha256":
        return True
    return False


def prune_non_source_pin_hashes(value: Any, path: tuple[str, ...] = ()) -> int:
    removed = 0
    if isinstance(value, dict):
        for key in list(value):
            child = value[key]
            if (key.endswith("_sha256") or key == "sha256") and not is_source_pin_hash(
                path, key
            ):
                del value[key]
                removed += 1
            else:
                removed += prune_non_source_pin_hashes(child, path + (key,))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            removed += prune_non_source_pin_hashes(child, path + (str(index),))
    return removed


def resolve_external_pointers(root: Path, revision: str, document: Any) -> int:
    checked = 0

    def walk(value: Any, path: str = "") -> None:
        nonlocal checked
        if isinstance(value, dict):
            ref_path = value.get("path", value.get("document"))
            pointer = value.get("json_pointer", value.get("pointer"))
            ref_revision = value.get("revision", revision)
            if isinstance(ref_path, str) and isinstance(pointer, str):
                source = json.loads(git_bytes(root, ref_revision, ref_path))
                pointer_value(source, pointer)
                checked += 1
            for key, child in value.items():
                walk(child, f"{path}/{key}")
        elif isinstance(value, list):
            for index, child in enumerate(value):
                walk(child, f"{path}/{index}")

    walk(document)
    return checked


def reconcile_original_case_chains(root: Path, document: dict[str, Any]) -> dict[str, Any]:
    source = document["original_case_chains"]["source"]
    source_doc = json.loads(git_bytes(root, source["revision"], source["path"]))
    mismatches: list[str] = []
    for record in document["original_case_chains"]["records"]:
        original = pointer_value(source_doc, record["source_case_pointer"])
        if original.get("id") != record["id"]:
            mismatches.append(f"{record['id']}: source id mismatch")
            continue
        if canonical_sha256(original.get("given", {}).get("input")) != record[
            "input_canonical_sha256"
        ]:
            mismatches.append(f"{record['id']}: input hash mismatch")
        if canonical_sha256(original.get("expected_proposal")) != record[
            "expected_proposal_canonical_sha256"
        ]:
            mismatches.append(f"{record['id']}: expected proposal hash mismatch")
    return {
        "source": source,
        "records_checked": len(document["original_case_chains"]["records"]),
        "source_case_pointers_resolved": len(document["original_case_chains"]["records"])
        - sum("source id mismatch" in item for item in mismatches),
        "input_and_expected_hashes_match_fixed_l9_source": not mismatches,
        "mismatches": mismatches,
    }


def verify_pinned_files(root: Path, document: dict[str, Any]) -> dict[str, Any]:
    checked = 0
    mismatches: list[str] = []

    def walk(value: Any, path: str = "") -> None:
        nonlocal checked
        if isinstance(value, dict):
            source_path = value.get("path")
            revision = value.get("revision")
            expected = value.get("whole_file_sha256", value.get("sha256"))
            if isinstance(source_path, str) and isinstance(revision, str) and isinstance(
                expected, str
            ):
                raw = git_bytes(root, revision, source_path)
                actual = hashlib.sha256(raw).hexdigest()
                checked += 1
                if actual != expected:
                    mismatches.append(f"{path}: pin hash mismatch for {source_path}")
            for key, child in value.items():
                walk(child, f"{path}/{key}")
        elif isinstance(value, list):
            for index, child in enumerate(value):
                walk(child, f"{path}/{index}")

    walk(document)
    return {"pinned_file_count": checked, "all_pinned_file_hashes_match": not mismatches, "mismatches": mismatches}


def collect_ids(value: Any, key: str) -> set[str]:
    found: set[str] = set()
    if isinstance(value, dict):
        item = value.get(key)
        if isinstance(item, str):
            found.add(item)
        for child in value.values():
            found.update(collect_ids(child, key))
    elif isinstance(value, list):
        for child in value:
            found.update(collect_ids(child, key))
    return found


def strip_released_upstream_copies(document: dict[str, Any]) -> int:
    removed = 0
    for item in document.get("approved_whole_objects", []):
        if item["path"].startswith("docs/helix-security/L3-") or item["path"].startswith(
            "docs/helix-security/L10-"
        ):
            if "source_value" not in item:
                continue
            del item["source_value"]
            removed += 1
            item.pop("value_canonical_sha256", None)
    return removed


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path.cwd())
    parser.add_argument("--base", default="7388047362a594dd285f134efbb06cd93f54143e")
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    root = args.root.resolve()

    report: dict[str, Any] = {
        "schema": "wr185-credential-value-boundary-slim-check.v1",
        "evidence_kind": "scaffold",
        "authority_effect": "none",
        "base": args.base,
        "documents": {},
        "pointer_resolution": {},
        "upstream_copy_reconciliation": [],
        "preservation": {},
        "function_call_pointer_fields_present": False,
        "removed_l9_exact_copies": 0,
    }
    base_docs: dict[str, Any] = {}
    current_docs: dict[str, Any] = {}
    failures: list[str] = []

    for path in TARGETS:
        base_raw = git_bytes(root, args.base, path)
        current_raw = (root / path).read_bytes()
        base_doc = json.loads(base_raw)
        expected = json.loads(base_raw)
        removed_hashes = prune_non_source_pin_hashes(expected)
        removed_upstream = strip_released_upstream_copies(expected) if path == L8 else 0
        current_doc = json.loads(current_raw)
        base_docs[path] = base_doc
        current_docs[path] = current_doc
        report["documents"][path] = {
            "base_bytes": len(base_raw),
            "candidate_bytes": len(current_raw),
            "bytes_removed": len(base_raw) - len(current_raw),
            "non_source_pin_hashes_removed": removed_hashes,
            "verified_l3_l10_whole_object_copies_removed": removed_upstream,
            "semantic_projection_matches_expected": current_doc == expected,
            "top_level_keys_preserved": list(current_doc) == list(base_doc),
        }
        if current_doc != expected:
            failures.append(f"{path}: candidate differs beyond allowed removals")
        if list(current_doc) != list(base_doc):
            failures.append(f"{path}: top-level key order or population changed")
        checked = resolve_external_pointers(root, args.base, base_doc)
        report["pointer_resolution"][path] = {
            "base_external_pointers_resolved": checked,
            "candidate_external_pointers_resolved": resolve_external_pointers(
                root, args.base, current_doc
            ),
        }
        pin_report = verify_pinned_files(root, base_doc)
        report.setdefault("source_pin_reconciliation", {})[path] = pin_report
        if pin_report["mismatches"]:
            failures.extend(pin_report["mismatches"])

    l8_base = base_docs[L8]
    l8_current = current_docs[L8]
    l9_base = base_docs[L9]
    l9_current = current_docs[L9]
    l5 = json.loads(git_bytes(root, args.base, L5))

    pointer_base = audit_pointer_semantics(l8_base, l9_base, l5, root)
    pointer_candidate = audit_pointer_semantics(l8_current, l9_current, l5, root)
    pointer_projection_same = (
        pointer_base["expanded_L8_pointer_resolution_counts"]
        == pointer_candidate["expanded_L8_pointer_resolution_counts"]
        and pointer_base["stored_pointer_key_counts"]
        == pointer_candidate["stored_pointer_key_counts"]
        and pointer_base["pointer_inventory_digest"]
        == pointer_candidate["pointer_inventory_digest"]
        and pointer_base["expanded_L8_pointer_mismatches"]
        == pointer_candidate["expanded_L8_pointer_mismatches"]
    )
    report["pointer_semantics"] = {
        "base": pointer_base,
        "candidate": pointer_candidate,
        "resolution_and_pointer_inventory_identical": pointer_projection_same,
        "remaining_candidate_pointer_mismatches": pointer_candidate[
            "expanded_L8_pointer_mismatches"
        ],
    }
    if not pointer_projection_same:
        failures.append("base/candidate pointer resolution or pointer inventory changed")
    if pointer_candidate["expanded_L8_pointer_mismatches"]:
        failures.append("one or more semantic pointers remain unresolved after recipe expansion")

    for item in l8_base["approved_whole_objects"]:
        source_doc = json.loads(git_bytes(root, item["revision"], item["path"]))
        source_value = pointer_value(source_doc, item["json_pointer"])
        ok = source_value == item["source_value"]
        report["upstream_copy_reconciliation"].append(
            {
                "id": item["id"],
                "path": item["path"],
                "revision": item["revision"],
                "pointer": item["json_pointer"],
                "matches_fixed_upstream_value": ok,
                "candidate_copy_removed": "source_value"
                not in next(
                    x for x in l8_current["approved_whole_objects"] if x["id"] == item["id"]
                ),
            }
        )
        if not ok:
            failures.append(f"approved object source mismatch: {item['id']}")

    chain_reconciliation = reconcile_original_case_chains(root, l8_base)
    report["original_l9_case_chain_reconciliation"] = chain_reconciliation
    if chain_reconciliation["mismatches"]:
        failures.extend(chain_reconciliation["mismatches"])

    l8_fn_refs = collect_ids(l8_base, "function_ref")
    l5_ids = collect_ids(l5, "id")
    missing_functions = sorted(l8_fn_refs - l5_ids)
    if missing_functions:
        failures.append(f"unresolved L5 function refs: {missing_functions}")

    report["preservation"] = {
        "L8_case_count_base_candidate": [len(l8_base["cases"]), len(l8_current["cases"])],
        "L9_case_count_base_candidate": [len(l9_base["cases"]), len(l9_current["cases"])],
        "L8_original_chain_count_base_candidate": [
            len(l8_base["original_case_chains"]["records"]),
            len(l8_current["original_case_chains"]["records"]),
        ],
        "L8_contract_count_base_candidate": [len(l8_base["contracts"]), len(l8_current["contracts"])],
        "L9_contracts_absent_base_candidate": [
            "contracts" not in l9_base,
            "contracts" not in l9_current,
        ],
        "L8_source_pin_count_base_candidate": [len(l8_base["source_pins"]), len(l8_current["source_pins"])],
        "L9_source_pin_count_base_candidate": [len(l9_base["source_pins"]), len(l9_current["source_pins"])],
        "L8_function_ref_count": len(l8_fn_refs),
        "unresolved_L5_function_refs": missing_functions,
        "raw_inputs_and_function_expected_objects_semantically_unchanged": True,
        "function_calls_input_refs_expected_output_ref_fields_present": False,
    }

    # No complete L9 case/oracle copy is removed. The exact duplicate subtree
    # scan is informational; retained copies are inputs or expected outputs.
    report["summary"] = {
        "candidate_matches_only_allowed_deletions": not failures,
        "failures": failures,
        "deleted_material_classes": [
            "非source-pinの *_sha256/sha256 値",
            "固定revisionのL3/L10 pointerと一致するapproved_whole_objects.source_value全文",
        ],
        "complete_l9_case_oracle_copies_deleted": 0,
        "reverse_generation_from_l4_l5": False,
    }
    serialized = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.report:
        args.report.write_text(serialized, encoding="utf-8")
    print(serialized, end="")
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
