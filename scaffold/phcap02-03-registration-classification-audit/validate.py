#!/usr/bin/env python3
"""PHCAP-02/03 registration/classification evidence-gap static validator."""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from collections import Counter
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INV = HERE / "inventory.json"
PHASE = ROOT / "docs/governance/phase-capability-inventory.json"
ROUTING = ROOT / "docs/governance/legacy-ir-product-routing-bootstrap.jsonl"
REGISTER = ROOT / "docs/governance/management-provisional-requirement-register-pre-append-3df81ad.jsonl"
ASSETS = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
PHASE_ASSETS = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DECISIONS = ROOT / "docs/governance/legacy-asset-decisions.jsonl"
OUTSIDE_67 = ROOT / "scaffold/pre-isolation-outside-holding-67/report.json"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
ORIGIN = "2fa9aca42ff3ffdd5dea9b2186c49ee50db7dc2c"
BRANCH = "research/phcap02-03-audit"
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
PHASE_IDS = ["PHCAP-02", "PHCAP-03"]
EXPECTED_DIGESTS = {
    "phase": "9face795f98c660bec02d46106f08a25ba189633f6b555b563a0c7951e173f0c",
    "routing": "c35934693b273e6cfd03e509886dc22bd1367e78ae1aa4568563a7da252c41e1",
    "register": "4e43fadaec48dcb0399e73eff148419671d4ac87fd4f8f68899dadf186ce5b8b",
    "assets": "cd73ac407937ad86c6be2c0b27d70863b1873fe39c2d6c0f89620e648dccad8c",
    "phase_assets": "2188f236cb7ed316772ee1fcf413f3b098f702cb4c9d9b3dad09a72db7468c1f",
    "decisions": "cbf7c18fbf0faea7745677091d440e40ba48345740a786404258e705a3cbd59f",
}
SELECTED = {
    "LEGACY-ASSET-2F4C154611460DD55358",
    "LEGACY-ASSET-3DED4B36AC6A8AD9A68C",
    "LEGACY-ASSET-4DF51DE06C57917FEA9C",
    "LEGACY-ASSET-90ECC62DFFEDE09800F0",
    "LEGACY-ASSET-8D1C0205DFCCE5C0359D",
    "LEGACY-ASSET-41F787DD7C89B20A3732",
    "LEGACY-ASSET-33E80E6D11CC51ADA817",
}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def count_values(rows: list[dict], field: str) -> dict[str, int]:
    return dict(sorted(Counter(str(row.get(field)) for row in rows).items()))


def fail(errors: list[str], condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


def line_span(path: Path, start: int, end: int) -> str | None:
    lines = path.read_text(encoding="utf-8").splitlines()
    if not isinstance(start, int) or not isinstance(end, int) or not (1 <= start <= end <= len(lines)):
        return None
    return "\n".join(lines[start - 1:end])


def run_git(*args: str) -> str:
    return subprocess.run(["git", *args], cwd=ROOT, check=True, stdout=subprocess.PIPE, text=True).stdout.strip()


def is_ancestor(ancestor: str, descendant: str) -> bool:
    """Accept attached, detached, and post-merge checkouts from one capture."""
    return subprocess.run(
        ["git", "merge-base", "--is-ancestor", ancestor, descendant],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    ).returncode == 0


def validate(inv: dict) -> list[str]:
    errors: list[str] = []
    fail(errors, inv.get("schema") == "phcap02-03-registration-classification-evidence-gap/v1", "E_SCHEMA")
    fail(errors, inv.get("status") == "research_premise_candidate", "E_STATUS")
    fail(errors, inv.get("authority_effect") == "none", "E_AUTHORITY")
    fail(errors, inv.get("meaning_change_applied") is False, "E_MEANING")
    fail(errors, inv.get("successor_requirement_ids") == [] and inv.get("human_decision_ref") is None, "E_DECISION_FIELDS")
    fail(errors, inv.get("equivalence_claim") is None, "E_EQUIVALENCE")
    fail(errors, inv.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")
    base = inv.get("base", {})
    fail(errors, base.get("origin_main_commit") == ORIGIN, "E_BASE_ORIGIN")
    fail(errors, base.get("branch") == BRANCH, "E_BASE_BRANCH")
    fail(errors, base.get("rebaseline") == {"origin_main_at_start": ORIGIN, "origin_main_at_final": ORIGIN, "changed": False}, "E_REBASELINE")
    try:
        current_head = run_git("rev-parse", "HEAD")
        fail(errors, is_ancestor(ORIGIN, current_head), "E_CAPTURE_NOT_ANCESTOR")
    except (subprocess.CalledProcessError, OSError) as exc:
        errors.append(f"E_GIT:{exc}")

    scope = inv.get("scope", {})
    fail(errors, scope.get("phase_ids") == PHASE_IDS, "E_SCOPE_PHASES")
    fail(errors, scope.get("approved_products") == PRODUCTS, "E_SCOPE_PRODUCTS")
    fail(errors, scope.get("phase_current_evidence_products") == {
        "PHCAP-02": ["HELIX-OS"], "PHCAP-03": ["HELIX-HARNESS", "HELIX-OS"]
    }, "E_SCOPE_CURRENT_PRODUCTS")
    fail(errors, set(scope.get("selected_legacy_asset_ids", [])) == SELECTED and len(scope.get("selected_legacy_asset_ids", [])) == 7, "E_SCOPE_ASSETS")

    source_files = {
        "phase": PHASE, "routing": ROUTING, "register": REGISTER, "assets": ASSETS,
        "phase_assets": PHASE_ASSETS, "decisions": DECISIONS,
    }
    for name, path in source_files.items():
        fail(errors, path.is_file(), f"E_SOURCE_MISSING:{name}")
        if path.is_file():
            fail(errors, sha(path.read_bytes()) == EXPECTED_DIGESTS[name], f"E_SOURCE_DIGEST:{name}")

    phase_doc = json.loads(PHASE.read_text(encoding="utf-8"))
    phase_rows = phase_doc.get("records", [])
    phase_map = {row.get("task_id"): row for row in phase_rows}
    for phase_id in PHASE_IDS:
        fail(errors, inv.get("phase_records", {}).get(phase_id) == phase_map.get(phase_id), f"E_PHASE_SNAPSHOT:{phase_id}")
    fail(errors, phase_map.get("PHCAP-02", {}).get("product_targets") == ["HELIX-OS"], "E_PHASE02_TARGET")
    fail(errors, phase_map.get("PHCAP-03", {}).get("product_targets") == ["HELIX-HARNESS", "HELIX-OS"], "E_PHASE03_TARGET")
    fail(errors, phase_map.get("PHCAP-02", {}).get("current", {}).get("evidence_products") == ["HELIX-OS"], "E_PHASE02_EVIDENCE")
    fail(errors, phase_map.get("PHCAP-03", {}).get("current", {}).get("evidence_products") == ["HELIX-HARNESS", "HELIX-OS"], "E_PHASE03_EVIDENCE")
    for phase_id in PHASE_IDS:
        fail(errors, phase_map.get(phase_id, {}).get("new_build_allowed") is False, f"E_NEW_BUILD:{phase_id}")
        fail(errors, phase_map.get(phase_id, {}).get("authority_effect") == "inventory_and_work_projection_only", f"E_PHASE_AUTHORITY:{phase_id}")

    routing = load_jsonl(ROUTING)
    routing_audit = inv.get("product_routing_audit", {})
    exact = tuple(PRODUCTS)
    expected_routing = {
        "record_count": len(routing),
        "evaluated_product_set_counts": count_values(routing, "evaluated_product_set"),
        "records_with_exact_four_product_evaluations": sum(1 for row in routing if tuple(row.get("evaluated_product_set", [])) == exact and len(row.get("product_evaluations", [])) == 4),
        "classification_state_counts": count_values(routing, "classification_state"),
        "routing_candidate_counts": count_values(routing, "routing_candidate"),
        "candidate_product_target_counts": count_values(routing, "candidate_product_targets"),
        "phase_field_presence": {field: sum(field in row for row in routing) for field in ("phase_candidates", "candidate_phase_targets")},
        "legacy_evidence_field_presence": {field: sum(field in row for row in routing) for field in ("legacy_implementation_status", "implementation_status", "failure_status", "degraded_status", "consumer_closure_status")},
        "successor_assignment_status_counts": count_values(routing, "successor_assignment_status"),
    }
    fail(errors, routing_audit == expected_routing, "E_ROUTING_AUDIT")
    fail(errors, len(routing) == 153, "E_ROUTING_COUNT")
    for row in routing:
        fail(errors, tuple(row.get("evaluated_product_set", [])) == exact and len(row.get("product_evaluations", [])) == 4, f"E_ROUTING_FOUR_PRODUCTS:{row.get('routing_registration_id')}")
        fail(errors, {x.get("product_target") for x in row.get("product_evaluations", [])} == set(PRODUCTS), f"E_ROUTING_EVALUATIONS:{row.get('routing_registration_id')}")
        fail(errors, row.get("authority_effect") == "none" and row.get("meaning_change_applied") is False, f"E_ROUTING_AUTHORITY:{row.get('routing_registration_id')}")
        fail(errors, row.get("successor_assignment_status") == "unassigned" and row.get("successor_requirement_ids") == [], f"E_ROUTING_SUCCESSOR:{row.get('routing_registration_id')}")

    register = load_jsonl(REGISTER)
    register_audit = inv.get("management_register_audit", {})
    expected_register = {
        "record_count": len(register),
        "registration_kind_counts": count_values(register, "registration_kind"),
        "product_target_counts": count_values(register, "product_target"),
        "requirement_candidate_count": sum(row.get("registration_kind") == "requirement_candidate" for row in register),
        "source_holding_unassigned_count": sum(row.get("registration_kind") == "source_holding" and row.get("product_target") == "unassigned_cross_product" for row in register),
    }
    fail(errors, register_audit == expected_register, "E_REGISTER_AUDIT")
    fail(errors, len(register) == 32 and expected_register["requirement_candidate_count"] == 0, "E_REGISTER_CANDIDATE")
    fail(errors, all(row.get("registration_kind") == "source_holding" and row.get("product_target") == "unassigned_cross_product" for row in register), "E_REGISTER_SOURCE_HOLDING")

    phase_assets = load_jsonl(PHASE_ASSETS)
    phase_asset_map = {row.get("asset_id"): row for row in phase_assets}
    expected_aggregate = {}
    for phase_id in PHASE_IDS:
        candidates = [row for row in phase_assets if phase_id in row.get("candidate_phase_targets", [])]
        expected_aggregate[phase_id] = {
            "record_count": len(candidates),
            "artifact_evidence_kind": count_values(candidates, "artifact_evidence_kind"),
            "implementation_evidence_state": count_values(candidates, "implementation_evidence_state"),
            "legacy_implementation_status": count_values(candidates, "legacy_implementation_status"),
            "consumer_closure_status": count_values(candidates, "consumer_closure_status"),
            "phase_classification_status": count_values(candidates, "phase_classification_status"),
            "product_classification_status": count_values(candidates, "product_classification_status"),
            "legacy_execution_performed": count_values(candidates, "legacy_execution_performed"),
            "decision_record_ref": count_values(candidates, "decision_record_ref"),
            "candidate_product_target_sets": count_values(candidates, "candidate_product_targets"),
            "product_assessment_lengths": count_values(candidates, "product_assessments"),
        }
    fail(errors, inv.get("phase_candidate_aggregates") == expected_aggregate, "E_PHASE_AGGREGATES")
    fail(errors, len(phase_assets) == 4020, "E_PHASE_ASSET_COUNT")

    dispositions = {row.get("asset_id"): row for row in load_jsonl(ASSETS)}
    decisions = load_jsonl(DECISIONS)
    selected_assets = inv.get("legacy_assets", [])
    fail(errors, len(selected_assets) == 7 and {row.get("asset_id") for row in selected_assets} == SELECTED, "E_SELECTED_ASSETS")
    for item in selected_assets:
        aid = item.get("asset_id")
        old = dispositions.get(aid)
        phase = phase_asset_map.get(aid)
        fail(errors, old is not None and phase is not None, f"E_LEDGER:{aid}")
        if old is None or phase is None:
            continue
        for key, expected in {"asset_class": "Historical", "authority_status": "historical", "disposition": "unresolved", "implementation_status": "unknown", "consumer_refs": [], "decision_record_ref": None}.items():
            fail(errors, old.get(key) == expected, f"E_ASSET_STATE:{aid}:{key}")
        for key in ("source_path", "source_sha256", "asset_class", "authority_status", "disposition", "consumer_refs", "decision_record_ref"):
            item_key = "legacy_implementation_status" if key == "implementation_status" else key
            expected = old.get(key)
            if key == "implementation_status":
                expected = old.get(key)
            if key in item:
                fail(errors, item.get(item_key) == expected, f"E_ASSET_SNAPSHOT:{aid}:{key}")
        for key in ("candidate_phase_targets", "candidate_product_targets", "phase_classification_status", "product_classification_status", "consumer_closure_status", "consumer_refs", "legacy_implementation_status", "legacy_execution_performed"):
            item_key = key
            expected = phase.get(key)
            fail(errors, item.get(item_key) == expected, f"E_PHASE_ASSET:{aid}:{key}")
        fail(errors, phase.get("legacy_implementation_status") in ("unknown", "non_executable_read_only_source"), f"E_PHASE_IMPL:{aid}")
        fail(errors, phase.get("legacy_execution_performed") is False and phase.get("consumer_closure_status") == "pending", f"E_PHASE_RESIDUAL:{aid}")
        matches = [row for row in decisions if row.get("asset_id") == aid]
        fail(errors, len(matches) == 0, f"E_DECISION_MATCH:{aid}")
        archive = ROOT / item.get("archive_path", "")
        fail(errors, str(item.get("archive_path", "")).startswith(ARCHIVE_PREFIX) and archive.is_file(), f"E_ARCHIVE:{aid}")
        if archive.is_file():
            blob = archive.read_bytes()
            fail(errors, sha(blob) == item.get("source_sha256") == old.get("source_sha256"), f"E_SOURCE_SHA:{aid}")
            fail(errors, len(blob) == item.get("source_bytes"), f"E_SOURCE_BYTES:{aid}")
            fail(errors, len(archive.read_text(encoding="utf-8").splitlines()) == item.get("source_line_count"), f"E_SOURCE_LINES:{aid}")
            for anchor in item.get("source_anchors", []):
                text = line_span(archive, anchor.get("line_start"), anchor.get("line_end"))
                fail(errors, text == anchor.get("exact_text"), f"E_ANCHOR_TEXT:{anchor.get('anchor_id')}")
                if text is not None:
                    fail(errors, sha(text.encode("utf-8")) == anchor.get("sha256"), f"E_ANCHOR_SHA:{anchor.get('anchor_id')}")
        fail(errors, item.get("failure_evidence", {}).get("execution_receipts") == 0 and item.get("failure_evidence", {}).get("observed_failure_status") == "unknown", f"E_FAILURE_RESIDUAL:{aid}")
        fail(errors, item.get("consumer_evidence", {}).get("read_after_receipts") == 0 and item.get("consumer_evidence", {}).get("consumer_refs") == [], f"E_CONSUMER_RESIDUAL:{aid}")

    decision_summary = inv.get("decisions", {})
    fail(errors, len(decision_summary.get("selected_asset_ids", [])) == 7 and set(decision_summary.get("selected_asset_ids", [])) == SELECTED, "E_DECISION_ASSET_SET")
    fail(errors, decision_summary.get("matching_append_only_decision_record_count") == 58, "E_DECISION_TOTAL")
    fail(errors, decision_summary.get("per_asset") == {aid: 0 for aid in sorted(SELECTED)}, "E_DECISION_SELECTED")
    fail(errors, inv.get("failure_residual") == {"selected_asset_failure_records": 0, "current_product_failure_receipts": 0, "current_l10_execution_receipts": 0, "degraded_observation_receipts": 0, "unimplemented_disposition_receipts": 0}, "E_FAILURE_SUMMARY")
    fail(errors, inv.get("consumer_residual") == {"selected_asset_ledger_consumer_refs": [], "current_consumer_read_after_receipts": 0, "consumer_closure_status": "pending"}, "E_CONSUMER_SUMMARY")

    outside = inv.get("outside_holding_67_audit", {})
    fail(errors, OUTSIDE_67.is_file(), "E_OUTSIDE_REPORT_MISSING")
    if OUTSIDE_67.is_file():
        report = json.loads(OUTSIDE_67.read_text(encoding="utf-8"))
        fail(errors, sha(OUTSIDE_67.read_bytes()) == outside.get("report_sha256"), "E_OUTSIDE_REPORT_SHA")
        fail(errors, outside.get("record_count") == 67 and report.get("denominators", {}).get("external_status_A_count") == 67, "E_OUTSIDE_COUNT")
        fail(errors, outside.get("all_legacy_catalog_record_count_zero") is True and all(row.get("legacy_catalog_record_count") == 0 for row in report.get("rows", [])), "E_OUTSIDE_CATALOG")
        fail(errors, outside.get("direct_phcap02_or_03_join_count") == 0, "E_OUTSIDE_PHASE_JOIN")
        fail(errors, outside.get("classification") == "path_based_adjacent_only_no_direct_phcap02_phcap03_join", "E_OUTSIDE_CLASS")
        fail(errors, all(row.get("classification_state") == "path_based_candidate_only" for row in report.get("rows", [])), "E_OUTSIDE_STATE")

    observations = inv.get("source_observations", [])
    fail(errors, len(observations) == 6, "E_OBSERVATION_COUNT")
    for observation in observations:
        path = ROOT / observation.get("path", "")
        fail(errors, observation.get("path", "").startswith(ARCHIVE_PREFIX) and path.is_file(), f"E_OBSERVATION_PATH:{observation.get('path')}")
        fail(errors, isinstance(observation.get("lines"), str) and "-" in observation.get("lines", "") and bool(observation.get("observation", "").strip()), "E_OBSERVATION_SHAPE")

    gaps = inv.get("gaps", [])
    gap_ids = [gap.get("gap_id") for gap in gaps]
    fail(errors, len(gaps) == 8 and len(set(gap_ids)) == 8 and all(isinstance(x, str) and x for x in gap_ids), "E_GAPS")
    fail(errors, all(gap.get("phase") in PHASE_IDS and gap.get("required_evidence") for gap in gaps), "E_GAP_SCOPE")
    fail(errors, len(inv.get("prohibited_inference", [])) == 7, "E_PROHIBITED_INFERENCE")
    fail(errors, inv.get("consumer_residual", {}).get("consumer_closure_status") == "pending", "E_CONSUMER_OPEN")
    return errors


if __name__ == "__main__":
    errors = validate(json.loads(INV.read_text(encoding="utf-8")))
    if errors:
        print("FAIL PHCAP-02/03 validator")
        print("\n".join(errors))
        sys.exit(1)
    print("PASS PHCAP-02/03 validator: static source/ledger/product/phase/evidence-gap checks")
