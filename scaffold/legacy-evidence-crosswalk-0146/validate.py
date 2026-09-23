#!/usr/bin/env python3
"""SCF-B-0146 validator。common.pyの固定BASE再導出を期待値に使い、生成物を照合する。"""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path
import re

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
EVIDENCE_BYTES_SHA256 = "6d6d7b06126ea1e1ac21d1de52017c930a032699b13a1053ca8963dc73db19f2"
FOCUSED_BYTES_SHA256 = "36ca9a4913e6352ba1c32596f8d1493f6d38ca7173ea6cde503fad51f17eefdf"
TRANSFER_DESTINATION_SHA256 = {
    "PR-DRAFT.md": "73dafe93f5c4bafec342f2243d4d42a731ca349fbcd2f36d63d352e01aff2299",
    "README.md": "c86857d8752be83024a5eb4528d1862be8ad34c096ee6da179aaa0872a76d556",
    "build.py": "27be723e326c54a175bdac7ad175ae86b9e93f05ca13de033f6d4d793485338a",
    "common.py": "9d2c22a56e1ea8e941405b2eb8cb6275375a706a015415d74d7762b51699455c",
    "evidence.jsonl": "6d6d7b06126ea1e1ac21d1de52017c930a032699b13a1053ca8963dc73db19f2",
    "inventory.json": "138bd736779bc7c261b89c02313f748fd9b8bf84a3b4812f13ce1b44a79cdf0b",
    "selfcheck.py": "63bb1eed52c3fda110789bba1e7567da51bc7645857490b77b497716259300c7",
    "validate.py": "a794e4f2212679ba14ac7246b6ec2da214ac7981e7b60fa78735ddd0dbc9f0b3",
}


def same_typed(left, right):
    """JSON structural equality that distinguishes bool/int and exact keys."""
    try:
        return json.dumps(left, ensure_ascii=False, sort_keys=True, separators=(",", ":")) == json.dumps(
            right, ensure_ascii=False, sort_keys=True, separators=(",", ":")
        )
    except (TypeError, ValueError):
        return False


def git_show(commit: str, path: str) -> bytes:
    result = subprocess.run(
        ["git", "-C", str(ROOT), "show", f"{commit}:{path}"],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
    )
    if result.returncode:
        raise ValueError(f"{commit}:{path}を読めない")
    return result.stdout


def transfer_manifest_errors(bundle: Path = BUNDLE):
    """移管記録のdestination digestを、到達可能性に依存せず固定値と照合する。"""
    try:
        manifest = read_json(bundle / "source-transfer-manifest.json")
        expected_notes = [
            "README.md receives an additional Japanese transfer/provenance section after the exact identity-only replacement.",
            "destination_sha256 values record the transfer-time bytes observed at commit 793cf4859; validator checks these values against pinned SHA-256 constants and does not read or depend on that commit. Later branch edits and rebases are not covered by these historical digests. evidence.jsonl and inventory.json were regenerated deterministically from pinned Git objects at source_base.",
            "SCF-B-0134 is already allocated on destination_base to a separate binding; SCF-B-0146 was verified unallocated there.",
        ]
        if (not isinstance(manifest, dict)
                or not same_typed(manifest.get("notes"), expected_notes)
                or not isinstance(manifest.get("source_files"), dict)
                or set(manifest["source_files"]) != set(TRANSFER_DESTINATION_SHA256)):
            return ["E_TRANSFER_MANIFEST: 移管manifestのnotes/source_filesが固定記録と一致しない"]
        for name, digest in TRANSFER_DESTINATION_SHA256.items():
            entry = manifest["source_files"].get(name)
            expected_path = f"{BUNDLE_REL}/{name}"
            if (not isinstance(entry, dict)
                    or not same_typed(entry.get("destination"), expected_path)
                    or not same_typed(entry.get("destination_sha256"), digest)):
                return [f"E_TRANSFER_MANIFEST: {name}の移管時destination digest/pathが固定値と不一致"]
    except Exception as exc:
        return [f"E_TRANSFER_MANIFEST: 移管manifestを検査できない: {exc}"]
    return []


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


def focused_investigation_errors(bundle: Path, expected_records, expected_bytes_sha256=None):
    """固定7 ID／10 unit閉包とBinding digest/status境界を検査する。"""
    try:
        focus_path = bundle / "focused-investigation.jsonl"
        focus_bytes = focus_path.read_bytes()
        pinned_digest = expected_bytes_sha256 or FOCUSED_BYTES_SHA256
        if hashlib.sha256(focus_bytes).hexdigest() != pinned_digest:
            return ["E_OUTPUT_DIGEST: focused-investigation.jsonlのbyte digestが固定値と不一致"]
        rows = []
        for line_no, raw_line in enumerate(focus_bytes.splitlines(keepends=True), 1):
            if not raw_line.strip():
                continue
            row = json.loads(raw_line.decode("utf-8"))
            canonical = (json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8")
            if raw_line != canonical:
                return [f"E_OUTPUT_DIGEST: focused-investigation.jsonl line {line_no}がcanonical JSONLではない"]
            rows.append(row)
        manifest = git_show(BASE_COMMIT, f"{FOCUSED_ARCHIVE}/MANIFEST.sha256")
        binding = read_json(ROOT / "scaffold/bindings/SCF-B-0146.json")
        pins = {x["path"]: x["sha256"] for x in binding["upstream"]}
    except Exception as exc:
        return [f"E_RECORD_SET: focused evidenceまたはarchive pinを読めない: {exc}"]
    ids = [x.get("requirement_id") if isinstance(x, dict) else None for x in rows]
    if any(not isinstance(value, str) for value in ids):
        return ["E_RECORD_SET: focused requirement_idは文字列でなければならない"]
    if len(ids) != 7 or set(ids) != set(FOCUSED_REQUIREMENT_IDS) or len(set(ids)) != 7:
        return ["E_RECORD_SET: focused evidenceの固定7 IDに欠落・重複・余分がある"]
    expected = {rid: [x for x in expected_records if x["subject"].get("source_requirement_id") == rid]
                for rid in FOCUSED_REQUIREMENT_IDS}
    if sum(map(len, expected.values())) != 10:
        return ["E_RECORD_RELATION: fixed BASE上のunit候補数が10ではない"]
    errors = []
    focus_rel = "scaffold/legacy-evidence-crosswalk-0146/focused-investigation.jsonl"
    if focus_rel not in binding.get("artifacts", []):
        errors.append("E_RECORD_RELATION: focused evidence artifactがBindingへ登録されていない")
    manifest_path = f"{FOCUSED_ARCHIVE}/MANIFEST.sha256"
    if (hashlib.sha256(manifest).hexdigest() != "10eda61dae461ec505fcabce89b42327bfbb968534793daf3a4758127a7dacc6"
            or hashlib.sha256(manifest).hexdigest() != pins.get(manifest_path)):
        errors.append("E_INPUT_DIGEST: archive manifestがBinding pinと不一致")
    for row in rows:
        rid = row["requirement_id"]; units = expected[rid]
        unit_ids = [x["subject"]["unit_candidate_id"] for x in units]
        missing = row.get("missing_evidence_by_unit", [])
        missing_ids = [x.get("unit_candidate_id") for x in missing if isinstance(x, dict)] if isinstance(missing, list) else []
        if not same_typed(row.get("unit_candidate_ids"), unit_ids) or not same_typed(missing_ids, unit_ids) or len(set(missing_ids)) != len(unit_ids):
            errors.append(f"E_RECORD_RELATION: {rid}のunit候補に欠落・重複がある")
        if (row.get("historical_run_receipt_candidates") != [] or any(key in row for key in ("unit_status", "implementation_status", "acceptance_status", "failure_status", "formal_acceptance", "formal_status_change", "formal_implementation"))
                or not same_typed(row.get("status_effect"), "none; existing SCF-B-0146 status_partition remains authoritative for this research bundle and unchanged")):
            errors.append(f"E_AUTHORITY_BOUNDARY: {rid}でstatusまたはreceipt候補を昇格")
    errors.extend(focused_base_projection_errors(rows, expected_records, manifest))
    return errors


def focused_base_projection_errors(rows, expected_records, manifest_bytes):
    """7行全体をBASEのarchive blob、partition rows、asset ledgersから再導出する。"""
    try:
        snapshot = "2d4991042be55268bac30a8bbcdac45b3865030a"
        manifest = {}
        for line in manifest_bytes.decode("utf-8").splitlines():
            digest, path = line.split("  ", 1)
            manifest[path] = digest
        req_path = f"{FOCUSED_ARCHIVE}/root/requirements-ir/requirements.json"
        req_bytes = git_show(snapshot, "requirements-ir/requirements.json")
        req = json.loads(req_bytes)
        l1_path = f"{FOCUSED_ARCHIVE}/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md"
        l1_bytes = git_show(snapshot, "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md")
        l1_text = l1_bytes.decode("utf-8")
        l9_path = f"{FOCUSED_ARCHIVE}/root/docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md"
        l9_bytes = git_show(snapshot, "docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md")
        l9_lines = l9_bytes.decode("utf-8").splitlines()
        source_rows = {}
        for path in SOURCE_PARTITIONS:
            for line in git_show(BASE_COMMIT, path).decode("utf-8").splitlines():
                source_row = json.loads(line)
                source_rows[source_row["unit_candidate_id"]] = source_row
        dispositions = [json.loads(line) for line in git_show(BASE_COMMIT, CANONICAL_INPUTS[2]).decode("utf-8").splitlines() if line.strip()]
        decisions = [json.loads(line) for line in git_show(BASE_COMMIT, CANONICAL_INPUTS[3]).decode("utf-8").splitlines() if line.strip()]
        read_afters = [json.loads(line) for line in git_show(BASE_COMMIT, CANONICAL_INPUTS[4]).decode("utf-8").splitlines() if line.strip()]
    except Exception as exc:
        return [f"E_INPUT_DIGEST: focused BASE原文を導出できない: {exc}"]

    errors = []
    manifest_hash = hashlib.sha256(manifest_bytes).hexdigest()
    if manifest_hash != "10eda61dae461ec505fcabce89b42327bfbb968534793daf3a4758127a7dacc6":
        return ["E_INPUT_DIGEST: focused BASE manifest digestが固定値と不一致"]
    checked_paths = {
        "requirements-ir/requirements.json",
        "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md",
        "docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md",
    }
    for row in rows:
        rid = row["requirement_id"]
        atom = req.get(rid)
        if not isinstance(atom, dict):
            errors.append(f"E_RECORD_RELATION: {rid}がBASE requirements.jsonにない")
            continue
        source_row = next((line for line in l1_text.splitlines() if f"**{rid}**" in line), None)
        test_rows = []
        for line_no, line in enumerate(l9_lines, 1):
            if rid in line:
                match = re.match(r"^\|\s*(HST-[^ |]+)\s*\|", line)
                if match:
                    test_rows.append({
                        "artifact": {"manifest_match": True, "path": l9_path, "sha256": "sha256:" + manifest.get("docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md", "")},
                        "line": line_no, "row": line, "test_id": match.group(1),
                    })
        unit_ids = [record["subject"]["unit_candidate_id"] for record in expected_records
                    if record["subject"].get("source_requirement_id") == rid]
        statement = atom.get("statement", {})
        projection = {
            "schema": "legacy-evidence-crosswalk-0146/v1/focused-investigation",
            "requirement_id": rid,
            "requirement_artifact": {
                "manifest_match": True, "path": req_path,
                "sha256": "sha256:" + manifest.get("requirements-ir/requirements.json", ""),
            },
            "requirement_atom": {
                "acceptance_ids": atom.get("acceptance_ids"),
                "downstream_obligation": atom.get("downstream_obligation"),
                "pointer": atom.get("source", {}).get("canonical_pointer"),
                "semantic_digest": statement.get("semantic_digest"),
                "statement": statement.get("text"),
                "system_test_id": atom.get("system_test_id"),
            },
            "legacy_l1_source": {
                "artifact": {
                    "manifest_match": True, "path": l1_path,
                    "sha256": "sha256:" + manifest.get("docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md", ""),
                },
                "row": source_row,
            },
            "unit_candidate_ids": unit_ids,
            "missing_evidence_by_unit": [
                {
                    "unit_candidate_id": unit_id,
                    "acceptance_atoms": atom.get("acceptance_ids"),
                    "missing": {
                        "acceptance": "verdict, evidence refs tied to unit/requirement atom, revision, and acceptance receipt digest",
                        "consumer": "consumer identity, closure receipt, decision ref, read-after ref, and unit/requirement relation",
                        "failure": "failure code, observed status/exit, revision, receipt digest, and atom/edge relation",
                        "human_decision": "decision ID, authority, field-specific verdict/classification, and decision revision",
                    },
                }
                for unit_id in unit_ids
            ],
            "system_test_design_candidates": test_rows,
            "status_effect": "none; existing SCF-B-0146 status_partition remains authoritative for this research bundle and unchanged",
        }
        direct_assets = []
        seen_assets = set()
        for unit_id in unit_ids:
            source_row = source_rows[unit_id]
            contribution = {}
            for item in source_row.get("semantic_review_edges", []) or []:
                edge = item.get("edge") if isinstance(item, dict) and isinstance(item.get("edge"), dict) else item
                if isinstance(edge, dict) and edge.get("asset_id"):
                    contribution.setdefault(edge["asset_id"], edge.get("legacy_requirement_implementation_contribution"))
            for asset in source_row.get("old_asset_evidence", {}).get("assets", []) or []:
                asset_id = asset.get("asset_id")
                rel = asset.get("source_path") or asset.get("ledger_record", {}).get("source_path")
                if not rel:
                    rel = asset.get("archive_path", "").split("/root/", 1)[-1]
                if not asset_id or not rel or rel == "requirements-ir/requirements.json" or asset_id in seen_assets:
                    continue
                archive_path = f"{FOCUSED_ARCHIVE}/root/{rel}"
                if asset_id not in contribution or rel not in manifest:
                    errors.append(f"E_RECORD_RELATION: {rid}のasset candidate {asset_id}をBASE edge/manifestへ結合できない")
                    continue
                kind = ("plan" if "/docs/plans/" in archive_path else
                        "test_design" if "/docs/test-design/" in archive_path else
                        "design" if "/docs/design/" in archive_path else "source")
                direct_assets.append({
                    "asset_id": asset_id,
                    "crosswalk_contribution": contribution[asset_id],
                    "kind": kind,
                    "manifest_match": True,
                    "path": archive_path,
                    "sha256": "sha256:" + manifest[rel],
                })
                checked_paths.add(rel)
                seen_assets.add(asset_id)
        tests = []
        for asset in direct_assets:
            if asset["kind"] != "source":
                continue
            basename = Path(asset["path"]).stem
            rel = f"tests/{basename}.test.ts"
            if rel in manifest:
                tests.append({
                    "manifest_match": True, "path": f"{FOCUSED_ARCHIVE}/root/{rel}",
                    "sha256": "sha256:" + manifest[rel], "source_basename": basename,
                })
                checked_paths.add(rel)
        unit_assets = []
        for unit_id in unit_ids:
            for asset in source_rows[unit_id].get("old_asset_evidence", {}).get("assets", []) or []:
                asset_id = asset.get("asset_id")
                disposition = next((x for x in dispositions if x.get("asset_id") == asset_id), None)
                if not disposition or disposition.get("disposition") != "source_snapshot_preservation":
                    continue
                read_ref = disposition.get("read_after_record_ref")
                read_id = read_ref.rsplit("#", 1)[-1] if isinstance(read_ref, str) else None
                read_after = next((x for x in read_afters if x.get("read_after_id") == read_id), None)
                asset_decisions = [x for x in decisions if x.get("asset_id") == asset_id]
                observed = {
                    "asset_id": asset_id,
                    "asset_disposition": disposition.get("disposition"),
                    "asset_revision_current": disposition.get("revision"),
                    "copy_read_after_ref": read_ref,
                    "copy_read_after_result": read_after.get("result") if read_after else None,
                    "decision_record_refs": [f"{CANONICAL_INPUTS[3]}#{x.get('decision_id')}" for x in asset_decisions],
                    "latest_decision_status": disposition.get("decision_status"),
                    "observed_asset_consumers": disposition.get("consumer_refs"),
                    "scope_limit": "要求sourceのread-only同一digest保全とasset consumer observationのみ。unit implementation、unit acceptance、unit consumer closure、formal product placementを示さない",
                    "unit_candidate_id": unit_id,
                }
                if observed not in unit_assets:
                    unit_assets.append(observed)
        receipt_paths = [
            "docs/governance/evidence/PR-1679/vitest-targeted.json",
            "docs/governance/evidence/PR-1699/vitest-targeted.json",
            "docs/governance/evidence/PR-1767/vitest-targeted.json",
        ]
        checked_paths.update(receipt_paths)
        complete = {
            **projection,
            "archive_manifest": {"path": f"{FOCUSED_ARCHIVE}/MANIFEST.sha256", "sha256": "sha256:" + manifest_hash, "snapshot_commit": snapshot},
            "asset_level_history_observations": unit_assets,
            "direct_asset_candidates": direct_assets,
            "historical_run_receipt_candidates": [],
            "run_receipt_search_scope": {
                "directory": f"{FOCUSED_ARCHIVE}/root/docs/governance/evidence",
                "files_reviewed": [f"{FOCUSED_ARCHIVE}/root/{path}" for path in receipt_paths],
                "receipt_artifacts": [
                    {"path": f"{FOCUSED_ARCHIVE}/root/{path}", "sha256": "sha256:" + manifest.get(path, "")}
                    for path in receipt_paths
                ],
                "result": "3件のreceiptのtestResultsに対象sourceと同名のtest fileはなく、unit_candidate_id／requirement atomへのbindingも無いため対象候補として紐付けていない",
            },
            "test_definition_candidates": tests,
        }
        if not same_typed(row, complete):
            errors.append(f"E_RECORD_RELATION: focused {rid}全体が固定BASE再導出値と一致しない")
    for path in sorted(checked_paths):
        expected_digest = manifest.get(path)
        try:
            actual_digest = hashlib.sha256(git_show(snapshot, path)).hexdigest()
        except Exception as exc:
            errors.append(f"E_INPUT_DIGEST: focused artifact {path}をsnapshotから読めない: {exc}")
            continue
        if not expected_digest or actual_digest != expected_digest:
            errors.append(f"E_INPUT_DIGEST: focused artifact {path}のsnapshot bytesがBASE MANIFESTと不一致")
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
    if not isinstance(inventory, dict):
        return ["E_BUNDLE: inventory.jsonのrootはobjectでなければならない"]
    if not check_base_ancestor():
        errors.append("E_BASE_NOT_ANCESTOR: 固定BASEが現HEADの祖先ではない")
    if not isinstance(inventory, dict) or not isinstance(inventory.get("base"), dict) or not same_typed(inventory.get("base", {}).get("commit"), BASE_COMMIT):
        errors.append("E_BASE_COMMIT: inventory.base.commitが固定BASEと一致しない")
    declared_counts = inventory.get("counts", {}) if isinstance(inventory.get("counts"), dict) else {}
    if not same_typed(declared_counts.get("product_units"), 217):
        errors.append("E_PRODUCT_DENOMINATOR: inventory product_unitsは217固定")
    if not same_typed(declared_counts.get("connections"), 1):
        errors.append("E_IRCONN_DENOMINATOR: inventory connectionsは1固定")
    expected_inv = expected_inventory(expected_records)
    if not same_typed(inventory, expected_inv):
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
    if not isinstance(inventory, dict) or not same_typed(inventory.get("authority_effect"), "none"):
        errors.append("E_AUTHORITY_BOUNDARY: authority_effectはnone固定")
    actual = {}
    for line_no, row in actual_rows:
        if not isinstance(row, dict) or not isinstance(row.get("subject"), dict):
            errors.append(f"E_RECORD_SET: evidence line {line_no}はobject/subject objectではない")
            continue
        unit_id = row["subject"].get("unit_candidate_id")
        if not isinstance(unit_id, str) or not unit_id:
            errors.append(f"E_RECORD_SET: evidence line {line_no}のunit_candidate_idが不正")
            continue
        if unit_id in actual:
            errors.append(f"E_RECORD_SET: evidence line {line_no}のunit_candidate_idが重複")
        else:
            actual[unit_id] = row
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
        for key in ("authority_boundary", "subject", "source_record", "coverage", "raw_observations", "status_partition"):
            if not isinstance(got.get(key), dict):
                errors.append(f"E_RECORD_RELATION: {unit_id}.{key}はobjectではない")
        if not isinstance(got.get("coverage"), dict) or not isinstance(got.get("status_partition"), dict):
            continue
        if not same_typed(got.get("authority_boundary"), want["authority_boundary"]):
            errors.append(f"E_AUTHORITY_BOUNDARY: {unit_id}")
        if not same_typed(got.get("subject"), want["subject"]) or not same_typed(got.get("source_record"), want["source_record"]):
            errors.append(f"E_RECORD_RELATION: {unit_id}のsource/crosswalk/decomposition結合")
        got_edges = got.get("coverage", {}).get("edge_ids")
        want_edges = want["coverage"]["edge_ids"]
        if not isinstance(got_edges, list) or any(not isinstance(value, str) for value in got_edges):
            errors.append(f"E_EDGE_SET: {unit_id}のedge idは文字列配列でなければならない")
        elif len(got_edges) != len(set(got_edges)):
            errors.append(f"E_EDGE_DUPLICATE: {unit_id}")
        if got_edges != want_edges:
            errors.append(f"E_EDGE_SET: {unit_id}")
        got_assets = got.get("coverage", {}).get("asset_ids")
        want_assets = want["coverage"]["asset_ids"]
        if not isinstance(got_assets, list) or any(not isinstance(value, str) for value in got_assets):
            errors.append(f"E_ASSET_SET: {unit_id}のasset idは文字列配列でなければならない")
        elif len(got_assets) != len(set(got_assets)):
            errors.append(f"E_ASSET_DUPLICATE: {unit_id}")
        if got_assets != want_assets:
            errors.append(f"E_ASSET_SET: {unit_id}")
        if not isinstance(got.get("coverage"), dict):
            errors.append(f"E_RECORD_RELATION: {unit_id}のcoverageがobjectではない")
            continue
        if not same_typed(got.get("coverage", {}).get("edge_refs"), want["coverage"]["edge_refs"]):
            errors.append(f"E_RECORD_RELATION: {unit_id}のedge/source relation")
        if not same_typed(got.get("coverage", {}).get("asset_record_count"), len(want_assets)):
            errors.append(f"E_ASSET_SET: {unit_id}のasset count")
        if not same_typed(got.get("raw_observations"), want["raw_observations"]):
            errors.append(f"E_RECORD_RELATION: {unit_id}のraw observation")
        for field in FIELD_SPECS:
            got_field = got.get("status_partition", {}).get(field, {})
            want_field = want["status_partition"][field]
            if not isinstance(got_field, dict) or not same_typed(got_field.get("required_evidence_schema"), want_field["required_evidence_schema"]):
                errors.append(f"E_REQUIRED_EVIDENCE_SCHEMA: {unit_id}.{field}")
        if not same_typed(got.get("status_partition"), want["status_partition"]):
            errors.append(f"E_STATUS_PARTITION: {unit_id}")
        if not same_typed(got.get("unresolved"), want["unresolved"]):
            errors.append(f"E_STATUS_PARTITION: {unit_id}.unresolved")
        if not same_typed(got.get("ledger_asset_ids_checked"), want["ledger_asset_ids_checked"]):
            errors.append(f"E_RECORD_RELATION: {unit_id}.ledger assets")
    errors.extend(focused_investigation_errors(bundle, expected_records))
    errors.extend(transfer_manifest_errors(bundle))
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
    if not errors and hashlib.sha256(evidence_path.read_bytes()).hexdigest() != EVIDENCE_BYTES_SHA256:
        errors.append("E_OUTPUT_DIGEST: evidence.jsonlのbyte digestが固定生成物と不一致")
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
