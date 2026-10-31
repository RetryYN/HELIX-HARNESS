#!/usr/bin/env python3
"""Static audit of the SEC009 L5/L8 pair and its current child-check result."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import time
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
    "l10_functional": "docs/helix-security/L10-verification/functional-verification.json",
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
POSITIVE_EXPECTATION_REFS = {
    "SEC009-ONLY-OS_ASSIGNMENT-UNSELECTED-ABSENT": "positive_expectation_basis/rules/B01_UNSELECTED_ABSENT",
    "SEC009-ONLY-WORKER_EXECUTION-UNSELECTED-ABSENT": "positive_expectation_basis/rules/B01_UNSELECTED_ABSENT",
    "SEC009-ONLY-CONNECT_COMMUNICATION-UNSELECTED-ABSENT": "positive_expectation_basis/rules/B01_UNSELECTED_ABSENT",
    "SEC009-ONLY-CREDENTIAL_USE-UNSELECTED-ABSENT": "positive_expectation_basis/rules/B01_UNSELECTED_ABSENT",
    "SEC009-ONLY-ARTIFACT_ACCESS-UNSELECTED-ABSENT": "positive_expectation_basis/rules/B01_UNSELECTED_ABSENT",
    "SEC009-EMPTY-RECIPIENT-SET": "positive_expectation_basis/rules/B01_EMPTY_RECIPIENT_SET",
    "SEC009-OS-OFFLINE-INDEPENDENT-RECOVERY-SELECTION": "positive_expectation_basis/rules/B01_INDEPENDENT_RECOVERY",
    "SEC009-GENERAL-MEANING-UNKNOWN": "positive_expectation_basis/rules/F02_GENERAL_MEANING_UNKNOWN",
}


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


def write_new_json(path: Path, value: Any) -> None:
    rendered = json.dumps(value, ensure_ascii=False, indent=2) + "\n"
    try:
        with path.open("x", encoding="utf-8") as stream:
            stream.write(rendered)
    except FileExistsError:
        fail(f"append-only evidence path already exists; refusing to overwrite: {path.name}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--audit-dir", type=Path, default=AUDIT_DIR)
    parser.add_argument("--record", action="store_true", help="保存先へ新規の監査証拠を書き出す")
    args = parser.parse_args()
    audit_dir = args.audit_dir.resolve()

    sources = {name: load_json(path) for name, path in FILES.items() if name != "checker"}
    l3b, l3f = sources["l3_business"], sources["l3_functional"]
    l4, l5, l8, l9, l10, l10f = (sources[k] for k in ("l4", "l5", "l8", "l9", "l10_business", "l10_functional"))

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
            expectation_ref = POSITIVE_EXPECTATION_REFS.get(case_id)
            if unit.get("positive_expectation_ref") != expectation_ref:
                fail(f"positive minimum expectation does not resolve to its contract rule: {case_id}")
            if not isinstance(unit.get("condition"), dict) or not isinstance(unit.get("expected"), dict) or not isinstance(unit.get("expected_preserved"), dict):
                fail(f"positive minimum contract expectation is missing: {case_id}")
            if unit.get("expected_result_status") != "contract_minimum_designed_not_observed":
                fail(f"positive expectation is not marked as unobserved: {case_id}")
            if unit.get("oracle_id") is not None or unit.get("test_citation") is not None:
                fail(f"positive row has a fabricated individual oracle or test citation: {case_id}")
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
                "l10_source": "business-verification.json:/cases/2" if unit["contract_ref"].endswith("B01") else "functional-verification.json:/cases/22",
                "l4_source": "revoke-quarantine-propagation.json:/contracts/0" if unit["contract_ref"].endswith("B01") else "revoke-quarantine-propagation.json:/contracts/2",
                "condition": unit["condition"],
                "expected": unit["expected"],
                "expected_preserved": unit["expected_preserved"],
                "expectation_ref": expectation_ref,
                "individual_expected_result": "contract-derived minimum meaning is designed from the case marker and L3/L10/L4; case-specific inputs are absent, so this is not a measured result",
            })
            row_audit.append({"uid": unit["id"], "case_id": case_id, "population_state": "positive", "expectation": unit["expected"], "expectation_status": unit["expected_result_status"]})
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
        if unit.get("function_ref") != rule.get("function_ref") or unit.get("target") != unit.get("function_ref"):
            fail(f"negative U-ID function_ref does not resolve to its L5 owner: {case_id}")
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
    l10_ids = {row.get("id") for row in l10.get("cases", [])} | {row.get("id") for row in l10f.get("cases", [])}
    if not {"HELIXSECURITY-L3-009-B01", "HELIXSECURITY-L3-009-F01", "HELIXSECURITY-L3-009-F02"}.issubset(l3_ids):
        fail("positive review L3 source identities do not resolve")
    if "HELIXSECURITY-L10-009-B01" not in l10_ids:
        fail("positive review L10 contract oracle does not resolve")
    positive_source_checks = [
        (l3b, "/requirements/2", "HELIXSECURITY-L3-009-B01"),
        (l3f, "/requirements/21", "HELIXSECURITY-L3-009-F01"),
        (l3f, "/requirements/22", "HELIXSECURITY-L3-009-F02"),
        (l10, "/cases/2", "HELIXSECURITY-L10-009-B01"),
        (l10f, "/cases/22", "HELIXSECURITY-L10-009-F02"),
        (l4, "/contracts/0", "HELIXSECURITY-L4-009-B01"),
    ]
    for source_doc, pointer, expected_id in positive_source_checks:
        if resolve_pointer(source_doc, pointer).get("id") != expected_id:
            fail(f"positive review pointer does not resolve to {expected_id}: {pointer}")
    positive_basis = l8.get("positive_expectation_basis", {})
    if positive_basis.get("authority_effect") != "none" or not positive_basis.get("source_refs"):
        fail("positive minimum expectation source basis is missing or has authority effect")
    for ref in positive_basis["source_refs"]:
        source_doc = sources.get(next((key for key, path in FILES.items() if path == ref["path"]), ""))
        if source_doc is None or resolve_pointer(source_doc, ref["pointer"]) is None:
            fail(f"positive expectation source pointer does not resolve: {ref}")
    for key in set(POSITIVE_EXPECTATION_REFS.values()):
        rule_key = key.rsplit("/", 1)[-1]
        if rule_key not in positive_basis.get("rules", {}):
            fail(f"positive expectation basis rule is missing: {key}")

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
    source_revisions = {
        layer: git_text("log", "-1", "--format=%H", "--", FILES[layer])
        for layer in ("l4", "l5", "l8", "l9")
    }
    source_revision = source_revisions["l8"]
    l8_digest = sha256(FILES["l8"])
    pair_revision_stem = "-".join(
        f"{layer}-{source_revisions[layer][:10]}-{sha256(FILES[layer])[:8]}"
        for layer in ("l4", "l5", "l8", "l9")
    )
    report_stem = pair_revision_stem
    negative = checker_report["negative_4way"]
    reasons = Counter(item.get("reason", "unknown") for item in negative.get("failures", []))
    expected_matched_case_count = 277
    expected_failure_count = 0
    if (
        check.returncode != 0
        or checker_report.get("passed") is not True
        or negative.get("matched_case_count") != expected_matched_case_count
        or len(negative.get("failures", [])) != expected_failure_count
    ):
        fail("latest-main overlay check-child is not 277 matched / 0 failures")
    if not checker_report.get("L4_L9_pair", {}).get("passed"):
        fail("latest-main L4/L9 pair check-child failed")
    if not checker_report.get("L5_L8_pair", {}).get("passed"):
        fail("L5/L8 pair no longer passes its current static pair check")

    report = {
        "schema": "sec009-l5l8-independent-audit.v1",
        "evidence_kind": "scaffold",
        "authority_effect": "none",
        "source_revision": source_revision,
        "source_revisions": source_revisions,
        "source_hashes": {name: sha256(path) for name, path in FILES.items()},
        "counts": {"classes_per_layer": 32, "l8_u_ids": 285, "l9_source_case_ids": 285, "negative": negative_count, "positive_contract_minimum_designed_not_observed": len(positives)},
        "class_audit_summary": {
            "count": len(class_audit),
            "canonical_sha256": hashlib.sha256(json.dumps(
                class_audit, ensure_ascii=False, sort_keys=True, separators=(",", ":")
            ).encode()).hexdigest(),
            "identity_and_projection_checks": "recomputed by this validator; full class values remain in the pinned L4/L5/L8/L9 source documents",
        },
        "row_audit_summary": {
            "count": len(row_audit),
            "negative_count": negative_count,
            "positive_count": len(positives),
            "canonical_sha256": hashlib.sha256(json.dumps(
                row_audit, ensure_ascii=False, sort_keys=True, separators=(",", ":")
            ).encode()).hexdigest(),
            "row_details": "recomputed by this validator from the pinned 285 source/unit rows; positive minimum expectations are retained below, while negative expected fields and pointers remain in the canonical documents",
        },
        "negative_source_review": {
            "summary": "Each negative L9 nested source pointer was resolved individually. Every `given` object contains only the shared evidence_limit notice; no concrete field values or paired conflicting values are present. Counterexamples therefore state the source ID's missing/conflict dimension plus the L4 class meaning, and conflict rows explicitly avoid inventing values.",
            "negative_case_count": negative_count,
            "distinct_given_hashes": len(negative_given_hashes),
            "given_hash_counts": dict(negative_given_hashes),
            "case_id_and_pointer_are_in_row_audit": True,
        },
        "positive_source_review": {
            "summary": "No positive expected values were copied from L9 expected_proposal. A minimum positive contract expectation was derived independently from each abstract case marker and the cited L3/L10/L4 meaning. L9 given still provides only the shared evidence_limit field, so the designed expectations are not fixture-backed or observed outcomes.",
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
            "full_report": None,
            "full_report_sha256": hashlib.sha256(json.dumps(
                checker_report, ensure_ascii=False, sort_keys=True, separators=(",", ":")
            ).encode()).hexdigest(),
            "interpretation": "L4/L9 and L5/L8 pair checks pass, with 277 matched cases and zero 4-way checker failures. The eight positive rows remain contract-minimum designs, not observed fixture outcomes; this evidence does not claim runtime behavior or formal security verification.",
        },
    }
    if args.record:
        run_id = f"{time.time_ns()}-{os.getpid()}"
        audit_dir.mkdir(parents=True, exist_ok=True)
        check_report_name = f"check-child-report-{report_stem}-record-{run_id}.json"
        validator_hash = sha256("scaffold/research/wr255-sec009-l5l8-audit-20261101/validate_wr255_l5l8.py")[:8]
        report_name = f"verification-summary-{report_stem}-validator-{validator_hash}-record-{run_id}.json"
        report["check_child"]["full_report"] = check_report_name
        write_new_json(audit_dir / check_report_name, checker_report)
        write_new_json(audit_dir / report_name, report)
        print(json.dumps({
            "passed": True,
            "recorded": True,
            "summary": str(audit_dir / report_name),
            "check_child_report": str(audit_dir / check_report_name),
        }, ensure_ascii=False))
    else:
        print(json.dumps({"passed": True, "recorded": False, "evidence": report}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (ValueError, KeyError, IndexError, OSError, subprocess.CalledProcessError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
