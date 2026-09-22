#!/usr/bin/env python3
"""Static validator for the PHCAP-15 deploy classification-gap scaffold."""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
INVENTORY_PATH = Path(__file__).with_name("inventory.json")
EXPECTED_IDS = {
    "LEGACY-ASSET-042D2B732DC68AA7EE9A",
    "LEGACY-ASSET-578A66F54CD01046B7BA",
    "LEGACY-ASSET-18BB86CC5625C31430B8",
    "LEGACY-ASSET-FA8D4E24D8399E8350F1",
    "LEGACY-ASSET-327A88B2141C43045AF1",
    "LEGACY-ASSET-BADD68B87BA5BE0F3906",
    "LEGACY-ASSET-7995556682FC5493C37E",
}
EXPECTED_PRODUCTS = {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"}
EXPECTED_POOL = {
    "rows": 78,
    "historical_unresolved": 75,
    "source_snapshot_pending": 3,
    "selected": 7,
    "outside_selected": 71,
}
EXPECTED_PHASE = {
    "task_id": "PHCAP-15",
    "current_status": "draft_requirement",
    "legacy_capability_status": "documented_partial",
    "transition_assessment": "degraded_to_draft",
}
EXPECTED_DENOMINATOR = {
    "archive_manifest_assets": 4020,
    "asset_disposition_rows": 4020,
    "asset_disposition_unresolved": 3991,
}


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        try:
            value = json.loads(line)
        except json.JSONDecodeError as exc:
            raise ValueError(f"JSONL_PARSE:{path}:{line_number}:{exc}") from exc
        if not isinstance(value, dict):
            raise ValueError(f"JSONL_ROW:{path}:{line_number}")
        rows.append(value)
    return rows


def span_digest(path: Path, line_start: int, line_end: int) -> str:
    lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
    if line_start < 1 or line_end < line_start or line_end > len(lines):
        return "INVALID_SPAN"
    return sha256_bytes("".join(lines[line_start - 1 : line_end]).encode("utf-8"))


def add(errors: list[str], code: str, detail: str) -> None:
    errors.append(f"{code}:{detail}")


def validate_inventory(data: dict[str, Any], root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    expected_top = {
        "schema", "capture", "phase", "denominator", "products", "assets",
        "evidence_gaps", "prohibited_inference", "verification_contract",
    }
    if set(data) != expected_top:
        add(errors, "E_KEYS", f"top={sorted(data)}")
    if data.get("schema") != "phcap15-deploy-gap-research/v1":
        add(errors, "E_SCHEMA", str(data.get("schema")))

    capture = data.get("capture", {})
    if capture.get("basis_ref") != "origin/main":
        add(errors, "E_BASIS", "basis_ref")
    if capture.get("basis_revision") != "2ff4f888249b350afb624e359eaa8e3f3ea6defb":
        add(errors, "E_BASIS", "basis_revision")
    if capture.get("authority_effect") != "none" or capture.get("new_build_allowed") is not False:
        add(errors, "E_AUTHORITY", "capture boundary promoted")
    if capture.get("old_execution_performed") is not False:
        add(errors, "E_OLD_EXECUTION", "old execution must remain false")

    phase = data.get("phase", {})
    for key, expected in EXPECTED_PHASE.items():
        if phase.get(key) != expected:
            add(errors, "E_PHASE", f"{key}={phase.get(key)!r}")
    if phase.get("new_build_allowed") is not False or phase.get("authority_effect") != "inventory_and_work_projection_only":
        add(errors, "E_PHASE_BOUNDARY", "phase boundary")
    phase_source = phase.get("source", {})
    phase_path = root / phase_source.get("path", "")
    if not phase_path.is_file() or sha256_file(phase_path) != phase_source.get("sha256"):
        add(errors, "E_PHASE_SOURCE", str(phase_source.get("path")))

    denominator = data.get("denominator", {})
    for key, expected in EXPECTED_DENOMINATOR.items():
        if denominator.get(key) != expected:
            add(errors, "E_DENOMINATOR", f"{key}={denominator.get(key)!r}")
    for key, expected in {
        "phcap15_classification_pool_rows": EXPECTED_POOL["rows"],
        "phcap15_pool_historical_unresolved": EXPECTED_POOL["historical_unresolved"],
        "phcap15_pool_source_snapshot_pending": EXPECTED_POOL["source_snapshot_pending"],
        "selected_representative_rows": EXPECTED_POOL["selected"],
        "pool_rows_outside_selected_scope": EXPECTED_POOL["outside_selected"],
    }.items():
        if denominator.get(key) != expected:
            add(errors, "E_DENOMINATOR", f"{key}={denominator.get(key)!r}")

    products = data.get("products", [])
    if {p.get("product_id") for p in products} != EXPECTED_PRODUCTS or len(products) != 4:
        add(errors, "E_PRODUCTS", "four product units changed")
    for product in products:
        for ref in product.get("refs", []):
            path = root / ref.get("path", "")
            if not path.is_file():
                add(errors, "E_CURRENT_REF", ref.get("path", ""))
                continue
            if sha256_file(path) != ref.get("file_sha256"):
                add(errors, "E_CURRENT_DIGEST", ref.get("path", ""))
            if span_digest(path, ref.get("line_start", 0), ref.get("line_end", 0)) != ref.get("span_sha256"):
                add(errors, "E_CURRENT_SPAN", ref.get("path", ""))

    disposition_path = root / "docs/governance/legacy-asset-disposition.jsonl"
    classification_path = root / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
    decision_path = root / "docs/governance/legacy-asset-decisions.jsonl"
    read_after_path = root / "docs/governance/legacy-asset-copy-read-after.jsonl"
    try:
        disposition = {row["asset_id"]: row for row in read_jsonl(disposition_path)}
        classification_rows = read_jsonl(classification_path)
        decisions = read_jsonl(decision_path)
        read_afters = read_jsonl(read_after_path)
    except (OSError, KeyError, ValueError) as exc:
        add(errors, "E_LEDGER_READ", str(exc))
        return errors

    pool = [row for row in classification_rows if "PHCAP-15" in row.get("candidate_phase_targets", [])]
    if len(disposition) != 4020 or len(pool) != EXPECTED_POOL["rows"]:
        add(errors, "E_LEDGER_DENOMINATOR", f"disposition={len(disposition)} pool={len(pool)}")
    pool_ids = {row.get("asset_id") for row in pool}
    pool_unresolved = sum(disposition.get(asset_id, {}).get("disposition") == "unresolved" for asset_id in pool_ids)
    pool_snapshots = sum(disposition.get(asset_id, {}).get("disposition") == "source_snapshot_preservation" for asset_id in pool_ids)
    if pool_unresolved != EXPECTED_POOL["historical_unresolved"] or pool_snapshots != EXPECTED_POOL["source_snapshot_pending"]:
        add(errors, "E_POOL_STATE", f"unresolved={pool_unresolved} snapshots={pool_snapshots}")
    if sum(row.get("disposition") == "unresolved" for row in disposition.values()) != 3991:
        add(errors, "E_GLOBAL_DENOMINATOR", "unresolved asset disposition denominator")

    assets = data.get("assets", [])
    if len(assets) != 7 or {asset.get("asset_id") for asset in assets} != EXPECTED_IDS:
        add(errors, "E_ASSETS", "selected representative set changed")
    classification = {row.get("asset_id"): row for row in pool}
    for asset in assets:
        asset_id = asset.get("asset_id")
        old = disposition.get(asset_id)
        candidate = classification.get(asset_id)
        if asset_id not in EXPECTED_IDS or old is None or candidate is None:
            add(errors, "E_ASSET_JOIN", str(asset_id))
            continue
        if asset_id not in pool_ids:
            add(errors, "E_POOL_LINK", asset_id)
        archive_path = root / asset.get("archive_path", "")
        if not archive_path.is_file():
            add(errors, "E_ARCHIVE_PATH", asset.get("archive_path", ""))
            continue
        if sha256_file(archive_path) != asset.get("source_file_sha256") or sha256_file(archive_path) != old.get("source_sha256"):
            add(errors, "E_ARCHIVE_DIGEST", asset_id)
        if len(archive_path.read_text(encoding="utf-8").splitlines()) != asset.get("source_line_count"):
            add(errors, "E_ARCHIVE_LINES", asset_id)
        for anchor in asset.get("anchors", []):
            if span_digest(archive_path, anchor.get("line_start", 0), anchor.get("line_end", 0)) != anchor.get("span_sha256"):
                add(errors, "E_ANCHOR_DIGEST", f"{asset_id}:{anchor.get('line_start')}-{anchor.get('line_end')}")
        for key in ("artifact_evidence_kind", "candidate_phase_targets", "candidate_product_targets", "implementation_evidence_state", "legacy_execution_performed", "legacy_implementation_status", "consumer_closure_status", "consumer_refs"):
            if asset.get(key) != candidate.get(key):
                add(errors, "E_CLASSIFICATION", f"{asset_id}:{key}")
        if asset.get("disposition") != old.get("disposition") or old.get("disposition") != "unresolved":
            add(errors, "E_DISPOSITION", asset_id)
        if old.get("consumer_refs") != [] or asset.get("consumer_refs") != [] or asset.get("consumer_closure_status") != "pending":
            add(errors, "E_CONSUMER_PROMOTION", asset_id)
        if asset.get("legacy_execution_performed") is not False or asset.get("legacy_implementation_status") != "unknown":
            add(errors, "E_IMPLEMENTATION_PROMOTION", asset_id)
        if sum(row.get("asset_id") == asset_id for row in decisions) != asset.get("decision_matches"):
            add(errors, "E_DECISION_COUNT", asset_id)
        if sum(row.get("asset_id") == asset_id for row in read_afters) != asset.get("copy_read_after_matches"):
            add(errors, "E_READ_AFTER_COUNT", asset_id)
        current = asset.get("current_interpretation", {})
        if current.get("implementation") != "unknown":
            add(errors, "E_CURRENT_IMPLEMENTATION", asset_id)
        if current.get("failure", "").startswith("no failure receipt") is False and "no failure" not in current.get("failure", ""):
            add(errors, "E_FAILURE_PROMOTION", asset_id)
        if "unknown" not in current.get("consumer", "") and "pending" not in current.get("consumer", ""):
            add(errors, "E_CONSUMER_INTERPRETATION", asset_id)

    evidence = data.get("evidence_gaps", {})
    if evidence.get("decision", {}).get("selected_asset_decision_matches") != 0:
        add(errors, "E_DECISION_GAP", "decision matches")
    if evidence.get("failure", {}).get("selected_failure_receipts") != 0:
        add(errors, "E_FAILURE_GAP", "failure receipts")
    if evidence.get("consumer", {}).get("selected_consumer_refs_nonempty") != 0 or evidence.get("consumer", {}).get("selected_consumer_closure_pending") != 7:
        add(errors, "E_CONSUMER_GAP", "consumer gap")
    if len(data.get("prohibited_inference", [])) != 6:
        add(errors, "E_INFERENCE_GUARD", "prohibited inference guard changed")
    return errors


def main() -> int:
    try:
        data = json.loads(INVENTORY_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"E_INVENTORY_READ:{exc}", file=sys.stderr)
        return 2
    errors = validate_inventory(data)
    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        print(f"PHCAP-15 deploy gap validation: FAIL ({len(errors)} errors)", file=sys.stderr)
        return 1
    print("PHCAP-15 deploy gap validation: PASS (static ledger/source/span/unknown checks)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
