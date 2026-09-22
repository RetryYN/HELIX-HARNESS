#!/usr/bin/env python3
"""Static validator for the PHCAP-15 follow-up research premise."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path


POOL_EXPECTED = 78
SELECTED_EXPECTED = 12
PR2001_IDS = {
    "LEGACY-ASSET-042D2B732DC68AA7EE9A",
    "LEGACY-ASSET-578A66F54CD01046B7BA",
    "LEGACY-ASSET-18BB86CC5625C31430B8",
    "LEGACY-ASSET-FA8D4E24D8399E8350F1",
    "LEGACY-ASSET-327A88B2141C43045AF1",
    "LEGACY-ASSET-BADD68B87BA5BE0F3906",
    "LEGACY-ASSET-7995556682FC5493C37E",
}
SCF0037_IDS = {
    "LEGACY-ASSET-54330A68064B58B22259",
    "LEGACY-ASSET-1251704E0BE627232E00",
    "LEGACY-ASSET-189702B332643A3BFDAF",
}
PRODUCTS = {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"}
BASE_COMMIT = "685c69c3c174ac6121812dade30ed75e510986e6"


def digest_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def digest_file(path: Path) -> str:
    return digest_bytes(path.read_bytes())


def jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines()]


def fail(errors: list[str], code: str, detail: str) -> None:
    errors.append(f"{code}: {detail}")


def line_span(path: Path, start: int, end: int) -> str:
    lines = path.read_text(encoding="utf-8").splitlines()
    return "\n".join(lines[start - 1 : end])


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--inventory", type=Path, default=Path(__file__).resolve().with_name("inventory.json"))
    args = parser.parse_args()
    root = args.root.resolve()
    inventory_path = args.inventory.resolve()
    errors: list[str] = []

    try:
        inv = json.loads(inventory_path.read_text(encoding="utf-8"))
    except Exception as exc:  # pragma: no cover - a malformed candidate is a validation error
        print(f"FAIL PHCAP15-FOLLOWUP: inventory unreadable: {exc}")
        return 1

    expected_paths = {
        "phase_inventory": root / "docs/governance/phase-capability-inventory.json",
        "disposition": root / "docs/governance/legacy-asset-disposition.jsonl",
        "phase_ledger": root / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl",
        "decisions": root / "docs/governance/legacy-asset-decisions.jsonl",
        "manifest": root / "archive/legacy-generation-2026-09-14/MANIFEST.sha256",
    }
    if inv.get("schema") != "phcap15-deploy-followup-research/v1":
        fail(errors, "SCHEMA", "schema mismatch")
    if inv.get("authority_effect") != "none" or inv.get("meaning_change_applied") is not False:
        fail(errors, "AUTHORITY_EFFECT", "authority_effect must be none and meaning_change_applied false")
    if inv.get("old_archive_runtime_test_ci_execution") is not False:
        fail(errors, "OLD_EXECUTION", "old archive/runtime/test/CI execution must remain false")

    base = inv.get("base", {})
    if any(base.get(k) != BASE_COMMIT for k in ("origin_main_commit", "origin_main_at_start", "origin_main_at_final")):
        fail(errors, "BASE", "origin/main exact commit drifted")
    if base.get("changed") is not False:
        fail(errors, "REBASELINE", "origin/main changed flag must remain false")

    phase_rows = jsonl(expected_paths["phase_ledger"])
    disposition_rows = jsonl(expected_paths["disposition"])
    decision_rows = jsonl(expected_paths["decisions"])
    phase_by_id = {row["asset_id"]: row for row in phase_rows}
    disposition_by_id = {row["asset_id"]: row for row in disposition_rows}
    pool = [row["asset_id"] for row in phase_rows if "PHCAP-15" in (row.get("candidate_phase_targets") or [])]
    pool_set = set(pool)
    if len(pool) != POOL_EXPECTED or len(pool_set) != POOL_EXPECTED:
        fail(errors, "POOL_DENOMINATOR", f"expected unique PHCAP-15 pool {POOL_EXPECTED}, got {len(pool)}/{len(pool_set)}")

    scope = inv.get("scope", {})
    if scope.get("pool_asset_ids") != pool:
        fail(errors, "POOL_SCOPE", "inventory pool IDs do not match phase ledger order")
    excluded = scope.get("excluded_scopes", {})
    pr_ids = set(excluded.get("pr_2001", {}).get("asset_ids", []))
    scf_ids = set(excluded.get("scf_b0037", {}).get("asset_ids", []))
    selected = scope.get("selected_asset_ids", [])
    selected_set = set(selected)
    remaining = set(scope.get("remaining_unreviewed_asset_ids", []))
    if pr_ids != PR2001_IDS:
        fail(errors, "PR2001_SCOPE", "PR #2001 exclusion set changed")
    if scf_ids != SCF0037_IDS:
        fail(errors, "SCF0037_SCOPE", "SCF-B-0037 exclusion set changed")
    if len(selected) != SELECTED_EXPECTED or len(selected_set) != SELECTED_EXPECTED:
        fail(errors, "SELECTED_COUNT", "selected follow-up set must contain 12 unique assets")
    if not selected_set <= pool_set:
        fail(errors, "SELECTED_POOL", "selected asset is outside PHCAP-15 pool")
    if selected_set & (pr_ids | scf_ids):
        fail(errors, "NON_OVERLAP", "selected asset overlaps PR #2001 or SCF-B-0037")
    expected_remaining = pool_set - pr_ids - scf_ids - selected_set
    if remaining != expected_remaining:
        fail(errors, "REMAINING", f"remaining set mismatch: expected {len(expected_remaining)}, got {len(remaining)}")

    denominator = inv.get("denominator", {})
    expected_counts = {
        "pool_rows": 78,
        "pool_unique_asset_ids": 78,
        "pr_2001_selected_rows": 7,
        "scf_b0037_selected_rows": 3,
        "already_reviewed_excluded_rows": 10,
        "followup_selected_rows": 12,
        "reviewed_or_selected_total": 22,
        "remaining_unreviewed_rows": 56,
    }
    for key, expected in expected_counts.items():
        if denominator.get(key) != expected:
            fail(errors, "DENOMINATOR", f"{key} expected {expected}, got {denominator.get(key)}")

    provenance = inv.get("provenance", {})
    for key, path in expected_paths.items():
        rel = {
            "phase_inventory": "docs/governance/phase-capability-inventory.json",
            "disposition": "docs/governance/legacy-asset-disposition.jsonl",
            "phase_ledger": "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl",
            "decisions": "docs/governance/legacy-asset-decisions.jsonl",
            "manifest": "archive/legacy-generation-2026-09-14/MANIFEST.sha256",
        }[key]
        if not path.exists():
            fail(errors, "PROVENANCE", f"missing {rel}")
            continue
        recorded = provenance.get("ledgers", {}).get(rel, {}).get("sha256")
        actual = digest_file(path)
        if recorded != actual:
            fail(errors, "LEDGER_DIGEST", f"{rel} digest mismatch")

    boundary = inv.get("product_boundary_candidates", {})
    if set(boundary.get("defined_products", [])) != PRODUCTS:
        fail(errors, "PRODUCT_SET", "four-product boundary set changed")
    product_rows = boundary.get("products", [])
    if {row.get("product") for row in product_rows} != PRODUCTS:
        fail(errors, "PRODUCT_ROWS", "four product candidate rows are incomplete")
    if boundary.get("authority_effect") != "none" or boundary.get("current_implementation_claim") is not False:
        fail(errors, "PRODUCT_PROMOTION", "product boundary cannot create authority or implementation claim")
    for product in product_rows:
        if product.get("current_authority_status") != "none" or product.get("current_implementation_status") != "unknown":
            fail(errors, "PRODUCT_STATUS", f"{product.get('product')} status promoted")
        for ref in product.get("refs", []):
            path = root / ref["path"]
            if not path.exists():
                fail(errors, "PRODUCT_REF", f"missing current boundary ref {ref['path']}")
                continue
            if digest_file(path) != ref.get("file_sha256"):
                fail(errors, "PRODUCT_REF_DIGEST", f"current boundary digest mismatch {ref['path']}")
            text = line_span(path, ref["line_start"], ref["line_end"])
            if digest_bytes(text.encode("utf-8")) != ref.get("span_sha256"):
                fail(errors, "PRODUCT_REF_SPAN", f"current boundary span mismatch {ref['path']}")

    asset_rows = inv.get("assets", [])
    if [row.get("asset_id") for row in asset_rows] != selected:
        fail(errors, "ASSET_ORDER", "asset rows must follow selected_asset_ids")
    if len(asset_rows) != SELECTED_EXPECTED:
        fail(errors, "ASSET_COUNT", "asset detail rows must contain 12 records")
    for asset in asset_rows:
        aid = asset.get("asset_id")
        if aid not in selected_set:
            fail(errors, "ASSET_ID", f"unexpected selected asset {aid}")
            continue
        phase = phase_by_id.get(aid)
        disp = disposition_by_id.get(aid)
        if phase is None or disp is None:
            fail(errors, "ASSET_LEDGER", f"missing ledger row for {aid}")
            continue
        archive = root / "archive/legacy-generation-2026-09-14/root" / phase["source_path"]
        if not archive.exists():
            fail(errors, "ARCHIVE_SOURCE", f"missing archive source {aid}")
            continue
        actual_sha = digest_file(archive)
        if asset.get("source_file_sha256") != actual_sha or asset.get("ledger_source_sha256") != phase.get("source_sha256") or phase.get("source_sha256") != actual_sha:
            fail(errors, "SOURCE_DIGEST", f"source/archive/ledger digest mismatch {aid}")
        if asset.get("source_path") != phase.get("source_path") or asset.get("source_revision") != phase.get("source_revision"):
            fail(errors, "SOURCE_IDENTITY", f"source identity mismatch {aid}")
        if asset.get("source_line_count") != len(archive.read_text(encoding="utf-8").splitlines()):
            fail(errors, "SOURCE_LINES", f"source line count mismatch {aid}")
        if "PHCAP-15" not in (asset.get("candidate_phase_targets") or []) or asset.get("phase_admission") != "unresolved_candidate_only":
            fail(errors, "PHASE_PROMOTION", f"phase admission promoted or missing {aid}")
        if asset.get("candidate_phase_targets") != phase.get("candidate_phase_targets"):
            fail(errors, "PHASE_TARGETS", f"phase candidate targets changed {aid}")
        if asset.get("candidate_product_targets") != phase.get("candidate_product_targets"):
            fail(errors, "PRODUCT_TARGETS", f"product candidate targets changed {aid}")
        if asset.get("product_owner_status") != "unresolved":
            fail(errors, "OWNER_PROMOTION", f"product owner promoted {aid}")
        for key in ("legacy_implementation_status", "current_implementation_status", "current_operation_status", "current_acceptance_status", "current_degradation_status"):
            if asset.get(key) != "unknown":
                fail(errors, "IMPLEMENTATION_PROMOTION", f"{key} promoted for {aid}")
        if asset.get("legacy_execution_performed") is not False or asset.get("disposition") != "unresolved" or asset.get("authority_status") != "historical":
            fail(errors, "LEGACY_STATUS", f"legacy status promoted for {aid}")
        if asset.get("decision_matches") != 0 or asset.get("decision_record_refs"):
            fail(errors, "DECISION_PROMOTION", f"decision history invented for {aid}")
        if asset.get("copy_read_after_matches") != 0:
            fail(errors, "COPY_PROMOTION", f"copy/read-after history invented for {aid}")
        if asset.get("consumer_closure_status") != "pending" or asset.get("consumer_refs"):
            fail(errors, "CONSUMER_PROMOTION", f"consumer closure promoted for {aid}")
        failure = asset.get("failure_evidence", {})
        if failure.get("execution_receipts") != 0 or failure.get("failure_outcome_observed") is not False:
            fail(errors, "FAILURE_PROMOTION", f"failure receipt/outcome invented for {aid}")
        consumer = asset.get("consumer_evidence", {})
        if consumer.get("consumer_closure_observed") is not False:
            fail(errors, "CONSUMER_EVIDENCE", f"consumer closure invented for {aid}")
        for anchor in asset.get("source_anchors", []):
            start, end = anchor.get("line_start"), anchor.get("line_end")
            if not isinstance(start, int) or not isinstance(end, int) or start < 1 or end < start:
                fail(errors, "SOURCE_SPAN", f"invalid span {aid}")
                continue
            text = line_span(archive, start, end)
            if text != anchor.get("exact_text"):
                fail(errors, "SOURCE_TEXT", f"exact source span mismatch {aid}:{start}-{end}")
            if digest_bytes(text.encode("utf-8")) != anchor.get("source_span_sha256"):
                fail(errors, "SOURCE_SPAN_DIGEST", f"source span digest mismatch {aid}:{start}-{end}")

    aggregate = inv.get("aggregate_evidence", {})
    aggregate_expected = {
        "selected_asset_count": 12,
        "selected_asset_decision_matches": 0,
        "selected_asset_copy_read_after_matches": 0,
        "selected_failure_execution_receipts": 0,
        "selected_consumer_refs_nonempty": 0,
        "selected_consumer_closure_pending": 12,
        "selected_implementation_statuses": ["unknown"],
        "current_implementation_status": "unknown",
        "current_degradation_status": "unknown",
        "current_phase_admission": "unresolved_candidate_only",
    }
    for key, expected in aggregate_expected.items():
        if aggregate.get(key) != expected:
            fail(errors, "AGGREGATE", f"{key} expected {expected}, got {aggregate.get(key)}")

    if errors:
        print("FAIL PHCAP15-FOLLOWUP")
        print("\n".join(errors))
        return 1
    print("PASS PHCAP15 follow-up: pool=78 excluded=10 selected=12 remaining=56")
    print("PASS source/archive digest, exact spans, phase/asset/decision/failure/consumer unknowns")
    print("PASS four-product candidate boundary and no authority/implementation promotion")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
