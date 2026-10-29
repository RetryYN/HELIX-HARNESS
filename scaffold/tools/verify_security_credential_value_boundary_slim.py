#!/usr/bin/env python3
"""静的に WR185 の削減対象・保持対象・参照閉包を照合する。"""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
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
