#!/usr/bin/env python3
"""SCF-B-0146の独立validator。生成物ではなく固定BASE入力から期待値を再導出する。"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from collections import Counter
from pathlib import Path

from common import (
    BASE_COMMIT,
    BUNDLE_REL,
    CANONICAL_INPUTS,
    FIELD_SPECS,
    INPUT_PATHS,
    NEGATIVE_CASE_CODES,
    SOURCE_PARTITIONS,
    check_base_ancestor,
    counts,
    derive_all,
    input_digests,
    sha256_obj,
)


ROOT = Path(__file__).resolve().parents[2]
BUNDLE = Path(__file__).resolve().parent
EXPECTED_TOP_KEYS = {
    "schema", "authority_boundary", "subject", "source_record", "coverage",
    "raw_observations", "status_partition", "unresolved", "prohibited_inference",
    "ledger_asset_ids_checked",
}
FOCUSED_REQUIREMENT_IDS = (
    "HIL-BR-02", "HIL-BR-06", "HIL-BR-16", "HIL-BR-20",
    "HIL-FR-01", "HIL-FR-12", "HIL-FR-23",
)
FOCUSED_ARCHIVE = "archive/legacy-generation-2026-09-14"


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:  # pragma: no cover - fail-closed diagnostic
        raise ValueError(f"{path}: JSONを読めない: {exc}") from exc


def read_records(path: Path):
    rows = []
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if line.strip():
            try:
                rows.append((line_no, json.loads(line)))
            except Exception as exc:
                raise ValueError(f"evidence line {line_no}: JSONを読めない: {exc}") from exc
    return rows


def focused_investigation_errors(bundle: Path, expected_records):
    """固定7 ID／10 unit閉包とBinding digest/status境界を検査する。"""
    try:
        focus_path = bundle / "focused-investigation.jsonl"
        focus_bytes = focus_path.read_bytes()
        rows = [json.loads(x) for x in focus_bytes.decode("utf-8").splitlines() if x.strip()]
        manifest = (ROOT / f"{FOCUSED_ARCHIVE}/MANIFEST.sha256").read_bytes()
        binding = read_json(ROOT / "scaffold/bindings/SCF-B-0146.json")
        pins = {x["path"]: x["sha256"] for x in binding["upstream"]}
    except Exception as exc:
        return [f"E_RECORD_SET: focused evidenceまたはarchive pinを読めない: {exc}"]
    ids = [x.get("requirement_id") if isinstance(x, dict) else None for x in rows]
    if len(ids) != 7 or set(ids) != set(FOCUSED_REQUIREMENT_IDS) or len(set(ids)) != 7:
        return ["E_RECORD_SET: focused evidenceの固定7 IDに欠落・重複・余分がある"]
    expected = {rid: [x for x in expected_records if x["subject"].get("source_requirement_id") == rid]
                for rid in FOCUSED_REQUIREMENT_IDS}
    if sum(map(len, expected.values())) != 10:
        return ["E_RECORD_RELATION: fixed BASE上のunit候補数が10ではない"]
    errors = []
    focus_rel = "scaffold/legacy-evidence-crosswalk-0146/focused-investigation.jsonl"
    if focus_rel not in binding["artifacts"] or hashlib.sha256(focus_bytes).hexdigest() != pins.get(focus_rel):
        errors.append("E_INPUT_DIGEST: focused evidenceがBinding artifact digestと不一致")
    if hashlib.sha256(manifest).hexdigest() != pins.get(f"{FOCUSED_ARCHIVE}/MANIFEST.sha256"):
        errors.append("E_INPUT_DIGEST: archive manifestがBinding pinと不一致")
    for row in rows:
        rid = row["requirement_id"]; units = expected[rid]
        unit_ids = [x["subject"]["unit_candidate_id"] for x in units]
        missing = row.get("missing_evidence_by_unit", [])
        missing_ids = [x.get("unit_candidate_id") for x in missing if isinstance(x, dict)] if isinstance(missing, list) else []
        if row.get("unit_candidate_ids") != unit_ids or missing_ids != unit_ids or len(set(missing_ids)) != len(unit_ids):
            errors.append(f"E_RECORD_RELATION: {rid}のunit候補に欠落・重複がある")
        if (row.get("historical_run_receipt_candidates") != [] or any(key in row for key in ("unit_status", "implementation_status", "acceptance_status", "failure_status"))
                or row.get("status_effect") != "none; existing SCF-B-0146 status_partition remains authoritative for this research bundle and unchanged"):
            errors.append(f"E_AUTHORITY_BOUNDARY: {rid}でstatusまたはreceipt候補を昇格")
    return errors


def expected_inventory(records):
    bundle_counts = counts(records)
    return {
        "schema": "legacy-evidence-crosswalk-0146/v1/inventory",
        "binding_id": "SCF-B-0146",
        "bundle_kind": "research-only-static-crosswalk",
        "authority_effect": "none",
        "base": {
            "repository": "HELIX-HARNESS",
            "branch": "main",
            "commit": BASE_COMMIT,
            "required_ancestor": BASE_COMMIT,
            "input_mode": "git_object_bytes_at_fixed_base",
        },
        "scope": {
            "source_partition_paths": list(SOURCE_PARTITIONS),
            "canonical_relation_paths": list(CANONICAL_INPUTS),
            "excluded_as_oracle": [
                "scaffold/fr-os-first10-evidence-0129/evidence.jsonl",
                "scaffold/fr-harness-first10-evidence-0132/evidence.jsonl",
            ],
            "subject_kinds": {"product_unit": 217, "connection": 1},
            "connection_ids": [
                r["subject"]["unit_candidate_id"]
                for r in records if r["subject"]["subject_kind"] == "connection"
            ],
        },
        "counts": bundle_counts,
        "input_digests": input_digests(),
        "status_expectations": {
            field: {
                "status": spec["expected_status"],
                "count": 218,
                "reason_code": spec["reason_code"],
                "direct_evidence_present": False,
            }
            for field, spec in FIELD_SPECS.items()
        },
        "required_evidence_schema": FIELD_SPECS,
        "negative_case_codes": NEGATIVE_CASE_CODES,
        "prohibited_inference": [
            "source/design/requirement presence is not unit implementation",
            "static coverage.failure is not a failure receipt",
            "pending consumer references are not closure",
            "current source candidate is not current implementation",
            "missing evidence is not explicit non-implementation",
            "connection record is not a product unit",
        ],
        "record_set_digest": "sha256:" + sha256_obj([r["subject"]["unit_candidate_id"] for r in records]),
        "status_partition_digest": "sha256:" + sha256_obj([
            [r["subject"]["unit_candidate_id"], r["status_partition"]] for r in records
        ]),
    }


def validate(bundle: Path):
    errors = []
    inventory_path = bundle / "inventory.json"
    evidence_path = bundle / "evidence.jsonl"
    if not inventory_path.is_file() or not evidence_path.is_file():
        return ["E_BUNDLE: inventory.json/evidence.jsonlが揃っていない"]
    try:
        inventory = read_json(inventory_path)
        actual_rows = read_records(evidence_path)
        expected_records, crosswalk, decomposition, ledger = derive_all()
    except Exception as exc:
        return [f"E_BUNDLE: 固定BASE再導出に失敗: {exc}"]
    if not check_base_ancestor():
        errors.append("E_BASE_NOT_ANCESTOR: 固定BASEが現HEADの祖先ではない")
    if inventory.get("base", {}).get("commit") != BASE_COMMIT:
        errors.append("E_BASE_COMMIT: inventory.base.commitが固定BASEと一致しない")
    expected_inv = expected_inventory(expected_records)
    if inventory != expected_inv:
        for key in expected_inv:
            if inventory.get(key) != expected_inv[key]:
                code = "E_INPUT_DIGEST" if key == "input_digests" else "E_INVENTORY_DECLARATION"
                if key == "base":
                    code = "E_BASE_COMMIT"
                if key == "authority_effect":
                    code = "E_AUTHORITY_BOUNDARY"
                errors.append(f"{code}: inventory.{key}が固定BASE再導出値と一致しない")
        for key in set(inventory) - set(expected_inv):
            errors.append(f"E_INVENTORY_DECLARATION: 未知のinventory key {key}")
    if inventory.get("authority_effect") != "none":
        errors.append("E_AUTHORITY_BOUNDARY: authority_effectはnone固定")
    declared_counts = inventory.get("counts", {}) if isinstance(inventory.get("counts"), dict) else {}
    if declared_counts.get("product_units") != 217:
        errors.append("E_PRODUCT_DENOMINATOR: inventory product_unitsは217固定")
    if declared_counts.get("connections") != 1:
        errors.append("E_IRCONN_DENOMINATOR: inventory connectionsは1固定")
    actual = {row.get("subject", {}).get("unit_candidate_id"): row for _, row in actual_rows}
    expected = {row["subject"]["unit_candidate_id"]: row for row in expected_records}
    if len(actual_rows) != len(actual):
        errors.append("E_RECORD_SET: evidence内のunit_candidate_idが重複または欠落")
    if set(actual) != set(expected):
        errors.append("E_RECORD_SET: evidenceのrecord集合がBASE source partitionと一致しない")
    for unit_id in sorted(set(actual) & set(expected)):
        got = actual[unit_id]
        want = expected[unit_id]
        if set(got) != EXPECTED_TOP_KEYS:
            errors.append(f"E_TOP_LEVEL_KEY: {unit_id}")
        if got.get("authority_boundary") != want["authority_boundary"]:
            errors.append(f"E_AUTHORITY_BOUNDARY: {unit_id}")
        if got.get("subject") != want["subject"] or got.get("source_record") != want["source_record"]:
            errors.append(f"E_RECORD_RELATION: {unit_id}のsource/crosswalk/decomposition結合")
        got_edges = got.get("coverage", {}).get("edge_ids")
        want_edges = want["coverage"]["edge_ids"]
        if not isinstance(got_edges, list) or len(got_edges) != len(set(got_edges)):
            errors.append(f"E_EDGE_DUPLICATE: {unit_id}")
        if got_edges != want_edges:
            errors.append(f"E_EDGE_SET: {unit_id}")
        got_assets = got.get("coverage", {}).get("asset_ids")
        want_assets = want["coverage"]["asset_ids"]
        if not isinstance(got_assets, list) or len(got_assets) != len(set(got_assets)):
            errors.append(f"E_ASSET_DUPLICATE: {unit_id}")
        if got_assets != want_assets:
            errors.append(f"E_ASSET_SET: {unit_id}")
        if got.get("coverage", {}).get("edge_refs") != want["coverage"]["edge_refs"]:
            errors.append(f"E_RECORD_RELATION: {unit_id}のedge/source relation")
        if got.get("coverage", {}).get("asset_record_count") != len(want_assets):
            errors.append(f"E_ASSET_SET: {unit_id}のasset count")
        if got.get("raw_observations") != want["raw_observations"]:
            errors.append(f"E_RECORD_RELATION: {unit_id}のraw observation")
        if got.get("status_partition") != want["status_partition"]:
            errors.append(f"E_STATUS_PARTITION: {unit_id}")
        for field in FIELD_SPECS:
            got_field = got.get("status_partition", {}).get(field, {})
            want_field = want["status_partition"][field]
            if got_field.get("required_evidence_schema") != want_field["required_evidence_schema"]:
                errors.append(f"E_REQUIRED_EVIDENCE_SCHEMA: {unit_id}.{field}")
        if got.get("unresolved") != want["unresolved"]:
            errors.append(f"E_STATUS_PARTITION: {unit_id}.unresolved")
        if got.get("ledger_asset_ids_checked") != want["ledger_asset_ids_checked"]:
            errors.append(f"E_RECORD_RELATION: {unit_id}.ledger assets")
    errors.extend(focused_investigation_errors(bundle, expected_records))
    if len([e for e in errors if e.startswith("E_")]) > 0:
        return errors
    expected_counts = counts(expected_records)
    if expected_counts["records"] != 218 or expected_counts["product_units"] != 217 or expected_counts["connections"] != 1:
        errors.append("E_PRODUCT_DENOMINATOR: fixed BASE source分母が217 product／1 connectionではない")
    if expected_counts["semantic_review_edges"] != 598 or expected_counts["unique_semantic_review_edges"] != 598:
        errors.append("E_EDGE_SET: fixed BASE edge集合が598 uniqueではない")
    if expected_counts["unique_old_assets"] != 355:
        errors.append("E_ASSET_SET: fixed BASE asset集合が355 uniqueではない")
    edge_ids = [e for record in expected_records for e in record["coverage"]["edge_ids"]]
    asset_ids = [a for record in expected_records for a in record["coverage"]["asset_ids"]]
    if len(edge_ids) != len(set(edge_ids)):
        errors.append("E_EDGE_DUPLICATE: fixed BASE source edge集合に重複")
    # 同一assetが複数unitへ候補参照されることは許す。重複拒否は各unitのasset_idsで行う。
    return errors


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--bundle", default=str(BUNDLE))
    args = parser.parse_args()
    errors = validate(Path(args.bundle).resolve())
    if errors:
        for error in errors:
            print(error)
        return 1
    print("PASS legacy-evidence-crosswalk-0146: 218 records (217 product units/1 connection), 598 edges, 355 unique assets; all status boundaries match fixed BASE")
    return 0


if __name__ == "__main__":
    sys.exit(main())
