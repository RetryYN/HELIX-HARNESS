#!/usr/bin/env python3
"""Static audit of the SEC009 L5/L8 pair and its current child-check result."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT_DIR = Path(__file__).resolve().parent
FILES = {
    "l3_business": "docs/helix-security/L3-requirements/business-requirements.json",
    "l3_functional": "docs/helix-security/L3-requirements/functional-requirements.json",
    "l4": "docs/helix-security/L4-basic-design/revoke-quarantine-propagation.json",
    "l5": "docs/helix-security/L5-detail-design/revoke-quarantine-propagation.json",
    "l8": "docs/helix-security/L8-unit-verification/revoke-quarantine-propagation.json",
    "l9": "docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json",
    "l10_business": "docs/helix-security/L10-verification/business-verification.json",
    "checker": "scaffold/tools/design_verification_checker.py",
}
SHARED_CLASS_FIELDS = (
    "expected_classification",
    "expected",
    "backflow_owner",
    "expected_axis",
    "expected_state",
    "side_effect_count",
)


def fail(message: str) -> None:
    raise ValueError(message)


def load_json(path: str) -> Any:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def sha256(path: str) -> str:
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()


def resolve_pointer(value: Any, pointer: str) -> Any:
    if pointer == "":
        return value
    if not pointer.startswith("/"):
        fail(f"invalid JSON Pointer: {pointer}")
    current = value
    for raw in pointer[1:].split("/"):
        part = raw.replace("~1", "/").replace("~0", "~")
        if isinstance(current, list):
            current = current[int(part)]
        elif isinstance(current, dict):
            current = current[part]
        else:
            fail(f"unresolvable JSON Pointer: {pointer}")
    return current


def git_text(*args: str) -> str:
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True).strip()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--audit-dir", type=Path, default=AUDIT_DIR)
    args = parser.parse_args()
    audit_dir = args.audit_dir.resolve()
    audit_dir.mkdir(parents=True, exist_ok=True)

    sources = {name: load_json(path) for name, path in FILES.items() if name != "checker"}
    l3b, l3f = sources["l3_business"], sources["l3_functional"]
    l4, l5, l8, l9, l10 = (sources[k] for k in ("l4", "l5", "l8", "l9", "l10_business"))

    rows_by_layer = {
        "L4": l4.get("failure_classifications", []),
        "L5": l5.get("failure_rules", []),
        "L8": l8.get("negative_equivalence_classes", []),
        "L9": l9.get("negative_equivalence_classes", []),
    }
    class_maps: dict[str, dict[str, dict[str, Any]]] = {}
    for layer, rows in rows_by_layer.items():
        key = "id" if layer == "L5" else "class_id"
        ids = [row.get(key) for row in rows]
        if len(ids) != len(set(ids)):
            fail(f"duplicate class identity in {layer}")
        class_maps[layer] = {row[key]: row for row in rows}
    expected_class_ids = set(class_maps["L4"])
    for layer, mapping in class_maps.items():
        if set(mapping) != expected_class_ids or len(mapping) != 32:
            fail(f"{layer} class identities/count differ from L4: {len(mapping)}")

    l5_functions = {row.get("id"): row for row in l5.get("functions", [])}
    l5_contracts = {row.get("id"): row for row in l5.get("contracts", [])}
    class_audit = []
    for class_id in sorted(expected_class_ids):
        c4, c5, c8, c9 = (class_maps[k][class_id] for k in ("L4", "L5", "L8", "L9"))
        if c5.get("class_id") != class_id:
            fail(f"L5 class_id differs from stable rule id: {class_id}")
        if c5.get("code") != c4.get("code"):
            fail(f"L5 outcome code differs from L4: {class_id}")
        for field in SHARED_CLASS_FIELDS:
            value4 = c4.get(field)
            l5_value = c5.get("code") if field == "expected_classification" else c5.get(field)
            if l5_value != value4 or c8.get(field) != value4 or c9.get(field) != value4:
                fail(f"class field {field} differs across layers: {class_id}")
        for field in ("condition", "expected_preserved"):
            if c5.get(field) != c4.get(field):
                fail(f"L5 rule projection {field} differs from L4: {class_id}")
        owner = (c5.get("owner_ref") or {}).get("id")
        if not owner:
            owner = c5.get("function_ref")
        if not isinstance(owner, str) or owner not in l5_functions:
            fail(f"unresolved L5 owner function: {class_id}")
        contract_id = c5.get("contract_ref")
        contract = l5_contracts.get(contract_id)
        if not isinstance(contract, dict) or owner not in contract.get("function_refs", []):
            fail(f"L5 owner function is not declared by contract: {class_id}")
        class_audit.append({
            "class_id": class_id,
            "stable_l5_rule_id": c5.get("id"),
            "l4_code": c4.get("code"),
            "l5_code": c5.get("code"),
            "l4_l5_condition_match": c4.get("condition") == c5.get("condition"),
            "l4_l5_preservation_match": c4.get("expected_preserved") == c5.get("expected_preserved"),
            "l5_owner_function_ref": owner,
            "contract_ref": contract_id,
            "outcome_sha256": hashlib.sha256(json.dumps(
                {field: c4.get(field) for field in (*SHARED_CLASS_FIELDS, "condition", "expected_preserved")},
                ensure_ascii=False, sort_keys=True, separators=(",", ":")
            ).encode()).hexdigest(),
        })

    source_rows = l9.get("integration_cases", [])
    unit_rows = l8.get("unit_cases", [])
    source_ids = [row.get("id") for row in source_rows]
    uid_rows = [row.get("id") for row in unit_rows]
    unit_case_ids = [row.get("case_id") for row in unit_rows]
    if len(source_ids) != 285 or len(set(source_ids)) != 285:
        fail("L9 source inventory is not 285 unique integration IDs")
    if len(unit_rows) != 285 or len(set(uid_rows)) != 285:
        fail("L8 U-ID inventory is not 285 unique rows")
    if unit_case_ids != source_ids:
        fail("L8 case_id order is not one-to-one with L9 source IDs")
    if any(not re.fullmatch(r"SEC009-U[0-9]{4}", uid or "") for uid in uid_rows):
        fail("L8 row id is not a distinct stable SEC009 U-ID")
    if any(row.get("integration_case_ref") != row.get("case_id") for row in unit_rows):
        fail("L8 integration_case_ref does not preserve source case_id")

    source_index = l8.get("unit_case_source_index", [])
    if len(source_index) != 285 or [row.get("uid") for row in source_index] != uid_rows:
        fail("L8 source index does not cover U-IDs in order")
    source_index_by_uid = {row["uid"]: row for row in source_index}
    for i, (index_row, l9row) in enumerate(zip(source_index, source_rows), 1):
        if index_row.get("source_case_id") != l9row.get("id"):
            fail(f"source index case ID mismatch at row {i}")
        pointer = index_row.get("l9_pointer")
        nested = resolve_pointer(l9, pointer)
        if nested.get("id") != l9row.get("id"):
            fail(f"L9 source pointer does not resolve to case ID at row {i}")

    l4_class_by_id = class_maps["L4"]
    l5_rule_by_id = class_maps["L5"]
    row_audit = []
    positives = []
    counterexample_labels = []
    negative_given_hashes: Counter[str] = Counter()
    negative_count = 0
    for unit, source in zip(unit_rows, source_rows):
        case_id = unit["case_id"]
        if unit.get("population_state") != source.get("population_state"):
            fail(f"population state differs for {case_id}")
        if unit.get("oracle_id") is not None or unit.get("test_citation") is not None:
            fail(f"fabricated individual oracle/test citation for {case_id}")
        if unit.get("system_oracle_ref") != "HELIXSECURITY-L10-009-" + unit["contract_ref"].split("-009-")[-1]:
            fail(f"contract-level L10 oracle reference does not resolve by contract for {case_id}")
        if unit["population_state"] == "positive":
            if any(key in unit for key in ("negative_class_ref", "rule_ref")):
                fail(f"positive case has a negative class/rule ref: {case_id}")
            if unit.get("expected") is not None or unit.get("expected_preserved") is not None or unit.get("condition") is not None:
                fail(f"unresolved positive case contains an invented expected result: {case_id}")
            if unit.get("counterexample") is not None:
                fail(f"positive U-ID has a counterexample label: {case_id}")
            source_pointer = next(x["pointer"] for x in source["source_pointers"] if x["path"].endswith("revoke-quarantine-propagation.json"))
            nested = resolve_pointer(l9, source_pointer)
            given = nested.get("given", {})
            positives.append({
                "uid": unit["id"],
                "case_id": case_id,
                "l9_source_pointer": source_pointer,
                "l9_given_keys": sorted(given),
                "l9_given_sha256": hashlib.sha256(json.dumps(given, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest(),
                "l3_sources": ["business-requirements.json:/requirements/2", "functional-requirements.json:/requirements/21", "functional-requirements.json:/requirements/22"],
                "l10_source": "business-verification.json:/cases/2",
                "l4_source": "revoke-quarantine-propagation.json:/contracts/0",
                "individual_expected_result": "unclosed; L9 given exposes only the shared evidence_limit field, and L3/L10/L4 sources provide contract-level obligations without these case-specific input facts",
            })
            row_audit.append({"uid": unit["id"], "case_id": case_id, "population_state": "positive", "expectation": "unclosed"})
            continue
        if unit["population_state"] != "negative":
            fail(f"unknown population state: {case_id}")
        negative_count += 1
        class_id = unit.get("negative_class_ref")
        rule_id = unit.get("rule_ref")
        expected_label = case_id.removeprefix("SEC009-").replace("_", " ").replace("-", " ").lower()
        counterexample = unit.get("counterexample")
        if not isinstance(counterexample, str) or counterexample == expected_label or len(counterexample) > 200:
            fail(f"negative counterexample is missing, overlong, or only a case-ID rewrite: {case_id}")
        if "scenario detail unresolved" in counterexample:
            fail(f"negative counterexample lacks a row-specific discrepancy: {case_id}")
        counterexample_labels.append(counterexample)
        if class_id not in l4_class_by_id or rule_id != class_id:
            fail(f"negative U-ID does not resolve to same L4 class/L5 rule: {case_id}")
        c4, rule = l4_class_by_id[class_id], l5_rule_by_id[rule_id]
        source_row = source_index_by_uid[unit["id"]]
        l9_pointer = source_row["l9_pointer"]
        l9_source_case = resolve_pointer(l9, l9_pointer)
        given = l9_source_case.get("given", {})
        if set(given) != {"evidence_limit"}:
            fail(f"negative L9 source has unexpected case input fields requiring review: {case_id}")
        given_sha256 = hashlib.sha256(json.dumps(given, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
        negative_given_hashes[given_sha256] += 1
        l4_pointer = source_row.get("l4_class_pointer")
        l5_pointer = source_row.get("l5_rule_pointer")
        if resolve_pointer(l4, l4_pointer).get("class_id") != class_id:
            fail(f"negative U-ID L4 class pointer does not resolve: {case_id}")
        if resolve_pointer(l5, l5_pointer).get("id") != rule_id:
            fail(f"negative U-ID L5 rule pointer does not resolve: {case_id}")
        if unit.get("target") != rule.get("function_ref"):
            fail(f"U-ID target does not resolve to L5 rule owner: {case_id}")
        if unit.get("expected") != c4.get("expected") or unit.get("expected_preserved") != c4.get("expected_preserved") or unit.get("condition") != c4.get("condition"):
            fail(f"U-ID expected result is not the corresponding L4 class projection: {case_id}")
        row_audit.append({"uid": unit["id"], "case_id": case_id, "population_state": "negative", "class_id": class_id, "rule_id": rule_id, "counterexample": counterexample, "l9_pointer": l9_pointer, "l9_given_sha256": given_sha256, "l4_class_pointer": l4_pointer, "l5_rule_pointer": l5_pointer, "expected_sha256": hashlib.sha256(json.dumps({"condition": unit.get("condition"), "expected": unit.get("expected"), "expected_preserved": unit.get("expected_preserved")}, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()})
    if negative_count != 277 or len(positives) != 8:
        fail(f"case polarity counts differ: negative={negative_count} positive={len(positives)}")
    if len(set(counterexample_labels)) != 277:
        fail("negative source-ID counterexample labels are not unique")

    l3_ids = {row.get("id") for row in l3b.get("requirements", [])}
    l3_ids |= {row.get("id") for row in l3f.get("requirements", [])}
    l10_ids = {row.get("id") for row in l10.get("cases", [])}
    if not {"HELIXSECURITY-L3-009-B01", "HELIXSECURITY-L3-009-F01", "HELIXSECURITY-L3-009-F02"}.issubset(l3_ids):
        fail("positive review L3 source identities do not resolve")
    if "HELIXSECURITY-L10-009-B01" not in l10_ids:
        fail("positive review L10 contract oracle does not resolve")
    positive_source_checks = [
        (l3b, "/requirements/2", "HELIXSECURITY-L3-009-B01"),
        (l3f, "/requirements/21", "HELIXSECURITY-L3-009-F01"),
        (l3f, "/requirements/22", "HELIXSECURITY-L3-009-F02"),
        (l10, "/cases/2", "HELIXSECURITY-L10-009-B01"),
        (l4, "/contracts/0", "HELIXSECURITY-L4-009-B01"),
    ]
    for source_doc, pointer, expected_id in positive_source_checks:
        if resolve_pointer(source_doc, pointer).get("id") != expected_id:
            fail(f"positive review pointer does not resolve to {expected_id}: {pointer}")

    checker_args = [
        sys.executable,
        str(ROOT / FILES["checker"]),
        "check-child", "--root", str(ROOT),
        "--l4", FILES["l4"], "--l9", FILES["l9"],
        "--l5", FILES["l5"], "--l8", FILES["l8"],
    ]
    check = subprocess.run(checker_args, cwd=ROOT, text=True, capture_output=True)
    try:
        checker_report = json.loads(check.stdout)
    except json.JSONDecodeError as exc:
        fail(f"static checker did not emit JSON: {exc}; stderr={check.stderr[-500:]}")
    (audit_dir / "check-child-report.json").write_text(json.dumps(checker_report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    negative = checker_report["negative_4way"]
    reasons = Counter(item.get("reason", "unknown") for item in negative.get("failures", []))
    expected_failure_count = 2235
    if check.returncode != 1 or checker_report.get("passed") is not False or negative.get("matched_case_count") != 0 or len(negative.get("failures", [])) != expected_failure_count:
        fail("check-child observation differs from the recorded incomplete outcome")
    if not checker_report.get("L5_L8_pair", {}).get("passed"):
        fail("L5/L8 pair no longer passes its current static pair check")

    report = {
        "schema": "sec009-l5l8-independent-audit.v1",
        "evidence_kind": "scaffold",
        "authority_effect": "none",
        "source_revision": git_text("log", "-1", "--format=%H", "--", FILES["l8"]),
        "source_hashes": {name: sha256(path) for name, path in FILES.items()},
        "counts": {"classes_per_layer": 32, "l8_u_ids": 285, "l9_source_case_ids": 285, "negative": negative_count, "positive_unclosed": len(positives)},
        "class_audit": class_audit,
        "row_audit": row_audit,
        "negative_source_review": {
            "summary": "Each negative L9 nested source pointer was resolved individually. Every `given` object contains only the shared evidence_limit notice; no concrete field values or paired conflicting values are present. Counterexamples therefore state the source ID's missing/conflict dimension plus the L4 class meaning, and conflict rows explicitly avoid inventing values.",
            "negative_case_count": negative_count,
            "distinct_given_hashes": len(negative_given_hashes),
            "given_hash_counts": dict(negative_given_hashes),
            "case_id_and_pointer_are_in_row_audit": True,
        },
        "positive_source_review": {
            "summary": "No positive expected values were copied from L9 expected_proposal. The eight current L9 source cases provide only the shared evidence_limit input field; no case-specific input facts support independent expected/preserved values under the cited L3/L10/L4 contracts.",
            "contract_oracle": "HELIXSECURITY-L10-009-B01 is resolved at contract level; individual oracle_id is null for each U-ID.",
            "resolved_contract_sources": [
                {"layer": "L3", "id": "HELIXSECURITY-L3-009-B01", "path": FILES["l3_business"], "pointer": "/requirements/2"},
                {"layer": "L3", "id": "HELIXSECURITY-L3-009-F01", "path": FILES["l3_functional"], "pointer": "/requirements/21"},
                {"layer": "L3", "id": "HELIXSECURITY-L3-009-F02", "path": FILES["l3_functional"], "pointer": "/requirements/22"},
                {"layer": "L10", "id": "HELIXSECURITY-L10-009-B01", "path": FILES["l10_business"], "pointer": "/cases/2"},
                {"layer": "L4", "id": "HELIXSECURITY-L4-009-B01", "path": FILES["l4"], "pointer": "/contracts/0"},
            ],
            "shared_l9_given_fact": resolve_pointer(l9, positives[0]["l9_source_pointer"])["given"],
            "shared_l9_given_case_count": len(positives),
            "cases": positives,
        },
        "check_child": {
            "exit_code": check.returncode,
            "passed": checker_report.get("passed"),
            "l4_l9_pair_passed": checker_report.get("L4_L9_pair", {}).get("passed"),
            "l5_l8_pair_passed": checker_report.get("L5_L8_pair", {}).get("passed"),
            "negative_4way_matched_case_count": negative.get("matched_case_count"),
            "negative_4way_failure_count": len(negative.get("failures", [])),
            "negative_4way_failure_reasons": dict(sorted(reasons.items())),
            "full_report": "check-child-report.json",
            "interpretation": "L5/L8 pair passes; 4-way remains incomplete because L9 row-level expected/condition/preserved and compact observations are absent, plus class key alignment failures. This evidence does not claim formal verification.",
        },
    }
    (audit_dir / "verification-summary.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"passed": True, "summary": str(audit_dir / "verification-summary.json"), "check_child_failures": expected_failure_count}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (ValueError, KeyError, IndexError, OSError, subprocess.CalledProcessError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
