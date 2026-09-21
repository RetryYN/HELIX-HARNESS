#!/usr/bin/env python3
"""PHCAP-16 Operations/Monitoring research candidate; static checks only."""
from __future__ import annotations
import copy
import hashlib
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INV_PATH = HERE / "inventory.json"
ORIGIN = "569d7373c32287bbafadeec6043472563937c5c7"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
ASSET_IDS = [
    "LEGACY-ASSET-17C4BF78919578FEBB18",
    "LEGACY-ASSET-11770E4E81583B408E67",
    "LEGACY-ASSET-7339DBE16914B6461DBC",
    "LEGACY-ASSET-CC461E26D160DA910B4C",
    "LEGACY-ASSET-F46AB11BD14F2C0469F4",
]
EXPECTED_EXCLUSIONS = {
    "LEGACY-ASSET-17C4BF78919578FEBB18": None,
    "LEGACY-ASSET-11770E4E81583B408E67": None,
    "LEGACY-ASSET-7339DBE16914B6461DBC": "legacy_runtime_cli_or_adapter",
    "LEGACY-ASSET-CC461E26D160DA910B4C": "legacy_test_fixture_or_oracle",
    "LEGACY-ASSET-F46AB11BD14F2C0469F4": "legacy_test_design_or_oracle",
}

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def file_sha(path: Path) -> str:
    return sha(path.read_bytes())

def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]

def span_text(path: Path, start: int, end: int) -> str | None:
    lines = path.read_text(encoding="utf-8").splitlines()
    if start < 1 or end < start or end > len(lines):
        return None
    return "\n".join(lines[start - 1:end])

def nonempty(value) -> bool:
    return isinstance(value, str) and bool(value.strip())

def validate(data: dict, check_files: bool = True) -> list[str]:
    errors: list[str] = []
    def req(condition: bool, code: str) -> None:
        if not condition:
            errors.append(code)

    req(data.get("schema") == "phcap16-operations-monitoring/v1", "E_SCHEMA")
    req(data.get("status") == "research_premise_candidate", "E_STATUS")
    req(data.get("authority_effect") == "none", "E_AUTHORITY")
    req(data.get("meaning_change_applied") is False, "E_MEANING_CHANGE")
    req(data.get("successor_requirement_ids") == [], "E_SUCCESSOR")
    req(data.get("human_decision_ref") is None, "E_HUMAN_DECISION")
    req(data.get("equivalence_claim") is None, "E_EQUIVALENCE")
    req(data.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")

    base = data.get("base", {})
    req(base.get("origin_main_commit") == ORIGIN, "E_BASE_ORIGIN")
    req(base.get("branch") == "research/phcap16-operations-monitoring", "E_BASE_BRANCH")
    req(nonempty(base.get("worktree")), "E_BASE_WORKTREE")
    rb = data.get("rebaseline", {})
    req(rb.get("origin_main_at_start") == ORIGIN, "E_REBASE_START")
    req(rb.get("origin_main_at_final") == ORIGIN, "E_REBASE_FINAL")
    req(rb.get("changed") is False, "E_REBASE_CHANGED")
    req("origin/main" in rb.get("stop_condition", "") and "rebaseline" in rb.get("stop_condition", ""), "E_REBASE_STOP")

    task = data.get("task", {})
    req(task.get("task_id") == "PHCAP-16", "E_TASK_ID")
    req(task.get("phase") == "operations_monitoring", "E_TASK_PHASE")
    inv = ROOT / task.get("inventory_path", "")
    req(inv.is_file(), "E_PHASE_INVENTORY_MISSING")
    if inv.is_file():
        req(file_sha(inv) == task.get("inventory_sha256"), "E_PHASE_INVENTORY_SHA")
        phase = json.loads(inv.read_text(encoding="utf-8"))
        rec = next((x for x in phase.get("records", []) if x.get("task_id") == "PHCAP-16"), None)
        req(rec == task.get("phase_record_snapshot"), "E_PHASE_SNAPSHOT")
        if rec:
            req(rec.get("product_targets") == ["HELIX-OS", "HELIX-Web-OS"], "E_PHASE_PRODUCTS")
            req(rec.get("legacy", {}).get("maximum_layer_evidenced") == "L10", "E_PHASE_LAYER")
            req(rec.get("legacy", {}).get("capability_status") == "implemented_partial_with_tests", "E_PHASE_CAPABILITY")

    scope = data.get("scope", {})
    req(scope.get("product_targets") == ["HELIX-OS", "HELIX-Web-OS"], "E_SCOPE_PRODUCTS")
    req(scope.get("legacy_asset_ids") == ASSET_IDS, "E_SCOPE_ASSET_IDS")
    req(scope.get("legacy_layer_reach") == ["L3", "L6", "L7 implementation/test", "L10 test design"], "E_SCOPE_LAYERS")
    units = scope.get("candidate_units", [])
    req(len(units) == 2, "E_UNIT_COUNT")
    req({u.get("unit_id") for u in units} == {"PHCAP16-UNIT-OS-OPERATIONS", "PHCAP16-UNIT-WEBOS-SERVICE"}, "E_UNIT_IDS")
    req({u.get("product") for u in units} == {"HELIX-OS", "HELIX-Web-OS"}, "E_UNIT_PRODUCTS")
    for u in units:
        req(u.get("status") == "research_premise_candidate", "E_UNIT_STATUS:" + str(u.get("unit_id")))
        req(u.get("authority_status") == "candidate_unresolved", "E_UNIT_AUTHORITY:" + str(u.get("unit_id")))
        req(u.get("current_implementation_status") == "unknown", "E_UNIT_IMPL:" + str(u.get("unit_id")))
        req(u.get("current_operation_status") == "unknown", "E_UNIT_OPS:" + str(u.get("unit_id")))
        req(bool(u.get("unresolved")), "E_UNIT_UNRESOLVED:" + str(u.get("unit_id")))

    edges = scope.get("candidate_edges", [])
    req(len(edges) == 15, "E_EDGE_COUNT")
    edge_ids = [e.get("edge_id") for e in edges]
    req(len(set(edge_ids)) == len(edge_ids), "E_EDGE_DUP")
    req(all(nonempty(e.get("relation")) for e in edges), "E_EDGE_RELATION")
    req(all(e.get("status") in {"unresolved_candidate", "draft_requirement_only", "reapproval_required", "connection_candidate_unresolved"} for e in edges), "E_EDGE_STATUS")
    req(all(e.get("authority_effect") == "none" for e in edges), "E_EDGE_AUTHORITY")

    assets = data.get("legacy_phase_assessment", {}).get("assets", [])
    req([a.get("asset_id") for a in assets] == ASSET_IDS, "E_ASSET_ORDER")
    catalog = {x.get("asset_id"): x for x in read_jsonl(ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl")}
    disposition = {x.get("asset_id"): x for x in read_jsonl(ROOT / "docs/governance/legacy-asset-disposition.jsonl")}
    selected_catalog = {x.get("asset_id"): x for x in data.get("legacy_phase_assessment", {}).get("ledger_snapshots", [])}
    seen_spans: set[str] = set()
    for asset in assets:
        aid = asset.get("asset_id")
        req(aid in ASSET_IDS, "E_ASSET_ID:" + str(aid))
        old = disposition.get(aid, {})
        cls = catalog.get(aid, {})
        snap = selected_catalog.get(aid, {})
        req(asset.get("asset_class") == "Historical", "E_ASSET_CLASS:" + str(aid))
        req(asset.get("authority_status") == "historical", "E_ASSET_AUTHORITY:" + str(aid))
        req(asset.get("disposition") == "unresolved", "E_ASSET_DISPOSITION:" + str(aid))
        req(asset.get("legacy_implementation_status") == "unknown", "E_ASSET_IMPL:" + str(aid))
        req(asset.get("legacy_execution_performed") is False, "E_ASSET_EXECUTION:" + str(aid))
        req(asset.get("consumer_refs") == [], "E_ASSET_CONSUMER:" + str(aid))
        req(asset.get("decision_record_ref") is None, "E_ASSET_DECISION:" + str(aid))
        req(asset.get("reuse_exclusion_class") == EXPECTED_EXCLUSIONS[aid], "E_ASSET_EXCLUSION:" + str(aid))
        req(asset.get("source_sha256") == old.get("source_sha256"), "E_ASSET_LEDGER_SHA:" + str(aid))
        req(asset.get("source_path") == old.get("source_path"), "E_ASSET_LEDGER_PATH:" + str(aid))
        req(asset.get("classification_id") == cls.get("classification_id"), "E_ASSET_CLASSIFICATION:" + str(aid))
        req(asset.get("candidate_phase_targets") == cls.get("candidate_phase_targets"), "E_ASSET_PHASES:" + str(aid))
        req(asset.get("candidate_product_targets") == cls.get("candidate_product_targets"), "E_ASSET_CANDIDATE_PRODUCTS:" + str(aid))
        req(asset.get("consumer_closure_status") == "pending", "E_ASSET_CLOSURE:" + str(aid))
        req(asset.get("unresolved") == cls.get("unresolved"), "E_ASSET_UNRESOLVED:" + str(aid))
        req(asset.get("implementation_evidence", "").endswith("unexecuted"), "E_ASSET_EVIDENCE:" + str(aid))
        req(asset.get("failure_evidence", {}).get("execution_receipts") == 0, "E_FAILURE_RECEIPT:" + str(aid))
        req(asset.get("consumer_evidence", {}).get("consumer_refs") == [], "E_CONSUMER_REFS:" + str(aid))
        req(asset.get("failure_evidence", {}).get("status") == "source_contract_only_unexecuted", "E_FAILURE_STATUS:" + str(aid))
        req(asset.get("consumer_evidence", {}).get("status") == "candidate_only_closure_pending", "E_CONSUMER_STATUS:" + str(aid))
        if snap:
            req(snap.get("disposition", {}).get("implementation_status") == "unknown", "E_SNAP_IMPL:" + str(aid))
            req(snap.get("classification", {}).get("legacy_execution_performed") is False, "E_SNAP_EXECUTION:" + str(aid))
        archive = ROOT / asset.get("archive_path", "")
        req(asset.get("archive_path", "").startswith(ARCHIVE_PREFIX) and archive.is_file(), "E_ARCHIVE:" + str(aid))
        if archive.is_file() and check_files:
            req(file_sha(archive) == asset.get("source_sha256"), "E_SOURCE_SHA:" + str(aid))
            req(len(archive.read_text(encoding="utf-8").splitlines()) == asset.get("source_line_count"), "E_SOURCE_LINES:" + str(aid))
        for anchor in asset.get("source_anchors", []):
            sid = anchor.get("anchor_id")
            req(nonempty(sid) and sid not in seen_spans, "E_ANCHOR_DUP:" + str(sid))
            seen_spans.add(sid)
            if archive.is_file() and check_files:
                actual = span_text(archive, anchor.get("line_start", 0), anchor.get("line_end", 0))
                req(actual == anchor.get("exact_text"), "E_ANCHOR_TEXT:" + str(sid))
                if actual is not None:
                    req(sha(actual.encode()) == anchor.get("sha256"), "E_ANCHOR_SHA:" + str(sid))
            req(nonempty(anchor.get("meaning")), "E_ANCHOR_MEANING:" + str(sid))
        anchor_ids = seen_spans
        for sid in asset.get("failure_evidence", {}).get("anchor_ids", []):
            req(sid in anchor_ids, "E_FAILURE_ANCHOR:" + str(aid) + ":" + str(sid))
        for sid in asset.get("consumer_evidence", {}).get("anchor_ids", []):
            req(sid in anchor_ids, "E_CONSUMER_ANCHOR:" + str(aid) + ":" + str(sid))

    decisions = data.get("decisions", {})
    req(decisions.get("selected_asset_ids") == ASSET_IDS, "E_DECISION_ASSETS")
    req(decisions.get("matching_append_only_decision_record_count") == 0, "E_DECISION_COUNT")
    req(all(v == 0 for v in decisions.get("per_asset", {}).values()), "E_DECISION_PER_ASSET")
    req(data.get("failure_residual", {}).get("execution_receipts") == 0, "E_FAILURE_TOTAL")
    req(data.get("consumer_residual", {}).get("selected_asset_consumer_refs") == [], "E_CONSUMER_TOTAL")
    req(data.get("consumer_residual", {}).get("consumer_closure_status") == "pending", "E_CONSUMER_CLOSURE")

    current = data.get("current_evidence", {})
    req(current.get("implementation_status") == "unknown", "E_CURRENT_IMPL")
    req(current.get("operation_status") == "unknown", "E_CURRENT_OPS")
    req(current.get("acceptance_status") == "unknown", "E_CURRENT_ACCEPTANCE")
    refs = current.get("refs", [])
    req(len(refs) == 7, "E_CURRENT_REF_COUNT")
    ref_ids = set()
    for ref in refs:
        rid = ref.get("ref_id")
        req(rid not in ref_ids, "E_CURRENT_REF_DUP:" + str(rid))
        ref_ids.add(rid)
        path = ROOT / ref.get("path", "")
        req(path.is_file(), "E_CURRENT_REF_MISSING:" + str(rid))
        if path.is_file() and check_files:
            req(file_sha(path) == ref.get("sha256"), "E_CURRENT_REF_SHA:" + str(rid))
            actual = span_text(path, ref.get("line_start", 0), ref.get("line_end", 0))
            req(actual == ref.get("exact_text"), "E_CURRENT_REF_TEXT:" + str(rid))
            if actual is not None:
                req(sha(actual.encode()) == ref.get("line_sha256"), "E_CURRENT_REF_LINE_SHA:" + str(rid))
        req(ref.get("classification") in {"direct_current_ref", "supporting_current_ref", "boundary_current_ref"}, "E_CURRENT_REF_CLASS:" + str(rid))
    req({r.get("ref_id") for r in refs if r.get("classification") == "direct_current_ref"} == {"CUR-OS-L2-OPS", "CUR-OS-L2-BOUNDARY", "CUR-WEBOS-L2-SERVICE"}, "E_CURRENT_DIRECT_REFS")

    counts = data.get("counts", {})
    req(counts.get("product_units") == len(units), "E_COUNT_UNITS")
    req(counts.get("candidate_edges") == len(edges), "E_COUNT_EDGES")
    req(counts.get("legacy_assets") == len(assets), "E_COUNT_ASSETS")
    req(counts.get("source_anchors") == len(seen_spans), "E_COUNT_ANCHORS")
    req(counts.get("current_refs") == len(refs), "E_COUNT_CURRENT")
    req(counts.get("decision_matches") == 0, "E_COUNT_DECISIONS")
    req(counts.get("failure_execution_receipts") == 0, "E_COUNT_FAILURE")
    req(counts.get("consumer_closed_assets") == 0, "E_COUNT_CONSUMERS")

    for field in ("gaps", "prohibited_inference"):
        req(isinstance(data.get(field), list) and len(data[field]) >= 5, "E_LIST:" + field)
        req(all(nonempty(x) for x in data.get(field, [])), "E_LIST_ITEM:" + field)
    return errors

if __name__ == "__main__":
    try:
        payload = json.loads(INV_PATH.read_text(encoding="utf-8"))
        problems = validate(payload)
    except Exception as exc:
        print("FAIL PHCAP-16 validator: exception: " + repr(exc))
        raise
    if problems:
        print("FAIL PHCAP-16 validator")
        print("\n".join(problems))
        sys.exit(1)
    print("PASS PHCAP-16 validator: static source/ledger/product-unit/edge/unknown checks")
