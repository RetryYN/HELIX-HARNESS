#!/usr/bin/env python3
"""PHCAP-15 Deploy research premise candidate; read-only static validation."""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INV_PATH = HERE / "inventory.json"
ORIGIN = "3df81ad27157c471e004083783f37a5860eaa2ee"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
ASSET_IDS = [
    "LEGACY-ASSET-54330A68064B58B22259",
    "LEGACY-ASSET-1251704E0BE627232E00",
    "LEGACY-ASSET-189702B332643A3BFDAF",
]
ASSET_SOURCE_PATHS = {
    ASSET_IDS[0]: "docs/design/helix/L13-post-deploy/post-deploy-evidence-boundary.md",
    ASSET_IDS[1]: "docs/design/harness/L13-post-deploy/post-deploy-evidence-boundary.md",
    ASSET_IDS[2]: "docs/plans/PLAN-L13-00-post-deploy-verification-master.md",
}
PHASE_CLASSIFICATION_IDS = {
    ASSET_IDS[0]: "LASPH-0436",
    ASSET_IDS[1]: "LASPH-0338",
    ASSET_IDS[2]: "LASPH-1060",
}
EXPECTED_PHASE_JOINS = [
    {"asset_id": ASSET_IDS[0], "candidate_phase_targets": ["PHCAP-15"], "phase_classification_status": "classified_candidate"},
    {"asset_id": ASSET_IDS[1], "candidate_phase_targets": ["PHCAP-15"], "phase_classification_status": "classified_candidate"},
    {"asset_id": ASSET_IDS[2], "candidate_phase_targets": ["PHCAP-07", "PHCAP-15"], "phase_classification_status": "multi_phase_candidate"},
]
EXPECTED_SCOPE_PHASE_JOINS = [
    {"asset_id": ASSET_IDS[0], "phase": "PHCAP-15", "status": "unresolved_candidate", "basis": "legacy phase/product classification ledger"},
    {"asset_id": ASSET_IDS[1], "phase": "PHCAP-15", "status": "unresolved_candidate", "basis": "legacy phase/product classification ledger"},
    {"asset_id": ASSET_IDS[2], "phase": "PHCAP-07", "status": "unresolved_candidate", "basis": "legacy phase/product classification ledger"},
    {"asset_id": ASSET_IDS[2], "phase": "PHCAP-15", "status": "unresolved_candidate", "basis": "legacy phase/product classification ledger"},
]
EXPECTED_EDGES = {
    "PHCAP15-EDGE-001": ("PHCAP15-UNIT-HARNESS", "PHCAP15-UNIT-OS", "HARNESS deployment/evidence contract to OS governance candidate"),
    "PHCAP15-EDGE-002": ("PHCAP15-UNIT-OS", "PHCAP15-UNIT-WEBOS", "OS evidence/proposal input from Web-OS deployment runtime"),
    "PHCAP15-EDGE-003": ("PHCAP15-UNIT-WEB", "PHCAP15-UNIT-WEBOS", "Web user-facing deployment/status boundary to Web-OS service runtime"),
    "PHCAP15-EDGE-004": ("PHCAP15-UNIT-WEBOS", "PHCAP15-UNIT-OS", "permitted service log/telemetry improvement proposal candidate"),
    "PHCAP15-EDGE-005": ("PHCAP15-UNIT-HARNESS", "PHCAP15-UNIT-WEB", "HARNESS Version 1 deployment precondition candidate"),
}
EXPECTED_CURRENT_REFS = {
    "CUR-HARNESS-L2-BOUNDARY": ("HELIX-HARNESS", "boundary_current_ref", "docs/helix-harness/L2-requirements/product-requirements.md", 28, 33),
    "CUR-HARNESS-L11-UNEXECUTED": ("HELIX-HARNESS", "boundary_current_ref", "docs/helix-harness/L11-acceptance/product-acceptance.md", 46, 52),
    "CUR-OS-L2-DEPLOY-GOVERNANCE": ("HELIX-OS", "direct_current_ref", "docs/helix-os/L2-requirements/governance-requirements.md", 274, 277),
    "CUR-OS-L2-WEB-BOUNDARY": ("HELIX-OS", "direct_current_ref", "docs/helix-os/L2-requirements/governance-requirements.md", 285, 297),
    "CUR-WEB-L1-BOUNDARY": ("HELIX-Web", "boundary_current_ref", "docs/helix-web/L1-planning/product-intent.md", 45, 50),
    "CUR-WEB-L2-BOUNDARY": ("HELIX-Web", "boundary_current_ref", "docs/helix-web/L2-requirements/product-requirements.md", 46, 50),
    "CUR-WEBOS-L1-DEPLOY": ("HELIX-Web-OS", "direct_current_ref", "docs/helix-web-os/L1-planning/system-intent.md", 14, 24),
    "CUR-WEBOS-L2-DEPLOY": ("HELIX-Web-OS", "direct_current_ref", "docs/helix-web-os/L2-requirements/service-governance-requirements.md", 33, 38),
    "CUR-WEBOS-L11-UNEXECUTED": ("HELIX-Web-OS", "boundary_current_ref", "docs/helix-web-os/L11-acceptance/service-acceptance.md", 13, 24),
}
EXPECTED_GAPS = [
    "deployment authority is not established",
    "tenant/runtime boundary is a candidate contract only",
    "legacy implementation status is unknown for all selected assets",
    "current deployment operation status is unknown for all products",
    "L11 acceptance is draft/unexecuted",
    "historical command execution receipts are absent",
    "failure and rollback outcomes are unknown",
    "consumer identity/read-after is pending",
    "four-product owner/unit split is unresolved",
    "PHCAP-07 join for the plan asset remains a candidate only",
    "meaning equivalence and successor assignment are unresolved",
]
EXPECTED_PROHIBITED_INFERENCE = [
    "source status confirmed does not establish current authority",
    "legacy plan review green text does not establish execution or current oracle pass",
    "consumer setup wording does not establish a consumer relation or closure",
    "missing Web direct deployment ref does not establish non-implementation",
    "phase candidate join does not admit an asset to the phase",
    "current L2/L11 draft text does not establish implementation or acceptance",
    "deployment/release/rollback vocabulary does not establish external effects",
    "four product coverage does not assign a product owner",
    "archive source is not a baseline, fallback, or runtime",
    "Issue or review state does not generate approval, adoption, or completion",
]


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_sha(path: Path) -> str:
    return sha(path.read_bytes())


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def span_text(path: Path, start: int, end: int) -> str | None:
    lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
    if start < 1 or end < start or end > len(lines):
        return None
    return "".join(lines[start - 1:end])


def nonempty(value) -> bool:
    return isinstance(value, str) and bool(value.strip())


def validate(data: dict, check_files: bool = True) -> list[str]:
    errors: list[str] = []

    def req(condition: bool, code: str) -> None:
        if not condition:
            errors.append(code)

    req(data.get("schema") == "phcap15-deploy-research/v1", "E_SCHEMA")
    req(data.get("status") == "research_premise_candidate", "E_STATUS")
    req(data.get("authority_effect") == "none", "E_AUTHORITY")
    req(data.get("meaning_change_applied") is False, "E_MEANING_CHANGE")
    req(data.get("successor_requirement_ids") == [], "E_SUCCESSOR")
    req(data.get("human_decision_ref") is None, "E_HUMAN_DECISION")
    req(data.get("equivalence_claim") is None, "E_EQUIVALENCE")
    req(data.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")

    base = data.get("base", {})
    req(base.get("origin_main_commit") == ORIGIN, "E_BASE_ORIGIN")
    req(base.get("branch") == "audit/phcap15-deploy-static-evidence", "E_BASE_BRANCH")
    req(Path(base.get("worktree", "")).name == "phcap15-deploy-static-evidence", "E_BASE_WORKTREE")
    req(base.get("source_revision") == "legacy-generation-2026-09-14", "E_BASE_SOURCE_REVISION")
    rb = data.get("rebaseline", {})
    req(rb.get("origin_main_at_start") == ORIGIN, "E_REBASE_START")
    req(rb.get("origin_main_at_final") == ORIGIN, "E_REBASE_FINAL")
    req(rb.get("changed") is False, "E_REBASE_CHANGED")
    req("origin/main" in rb.get("stop_condition", "") and "rebaseline" in rb.get("stop_condition", ""), "E_REBASE_STOP")

    task = data.get("task", {})
    req(task.get("task_id") == "PHCAP-15", "E_TASK_ID")
    req(task.get("phase") == "deploy", "E_TASK_PHASE")
    req(task.get("title") == "Deploy", "E_TASK_TITLE")
    inv = ROOT / task.get("inventory_path", "")
    req(inv.is_file(), "E_PHASE_INVENTORY_MISSING")
    phase_record = None
    if inv.is_file() and check_files:
        req(file_sha(inv) == task.get("inventory_sha256"), "E_PHASE_INVENTORY_SHA")
        phase_data = json.loads(inv.read_text(encoding="utf-8"))
        phase_record = next((x for x in phase_data.get("records", []) if x.get("task_id") == "PHCAP-15"), None)
        req(phase_record == task.get("phase_record_snapshot"), "E_PHASE_SNAPSHOT")
    req(task.get("inventory_sha256") == data.get("ledger_provenance", {}).get("phase_inventory_sha256"), "E_PHASE_TASK_LEDGER_SHA")
    if phase_record:
        req(phase_record.get("product_targets") == ["HELIX-Web-OS", "HELIX-OS"], "E_PHASE_PRODUCTS")
        req(phase_record.get("current", {}).get("status") == "draft_requirement", "E_PHASE_CURRENT_STATUS")
        req(phase_record.get("legacy", {}).get("maximum_layer_evidenced") == "L13", "E_PHASE_LAYER")
        req(phase_record.get("legacy", {}).get("capability_status") == "documented_partial", "E_PHASE_CAPABILITY")
        req(phase_record.get("transition_assessment") == "degraded_to_draft", "E_PHASE_TRANSITION")
        req(phase_record.get("new_build_allowed") is False, "E_PHASE_NEW_BUILD")
        req(phase_record.get("authority_effect") == "inventory_and_work_projection_only", "E_PHASE_AUTHORITY")

    provenance = data.get("ledger_provenance", {})
    provenance_specs = [
        ("phase_inventory_path", "phase_inventory_sha256", None, None),
        ("asset_ledger_path", "asset_ledger_sha256", "asset_ledger_record_count", 4020),
        ("phase_ledger_path", "phase_ledger_sha256", "phase_ledger_record_count", 4020),
        ("decision_ledger_path", "decision_ledger_sha256", "decision_ledger_record_count", 58),
    ]
    for path_key, hash_key, count_key, expected_count in provenance_specs:
        path = ROOT / provenance.get(path_key, "")
        req(path.is_file(), "E_LEDGER_MISSING:" + path_key)
        if path.is_file() and check_files:
            req(file_sha(path) == provenance.get(hash_key), "E_LEDGER_SHA:" + path_key)
            if path.suffix == ".jsonl" and count_key:
                req(len(read_jsonl(path)) == provenance.get(count_key), "E_LEDGER_COUNT:" + path_key)
        if count_key:
            req(provenance.get(count_key) == expected_count, "E_LEDGER_EXPECTED_COUNT:" + path_key)

    scope = data.get("scope", {})
    req(scope.get("product_targets") == PRODUCTS, "E_SCOPE_PRODUCTS")
    req(scope.get("phase_inventory_product_targets") == ["HELIX-Web-OS", "HELIX-OS"], "E_SCOPE_PHASE_PRODUCTS")
    req(scope.get("legacy_asset_ids") == ASSET_IDS, "E_SCOPE_ASSET_IDS")
    req(scope.get("legacy_layer_reach") == ["L13 post-deploy", "L13 plan"], "E_SCOPE_LAYERS")
    units = scope.get("candidate_units", [])
    req(len(units) == 4, "E_UNIT_COUNT")
    req([u.get("product") for u in units] == PRODUCTS, "E_UNIT_ORDER")
    req([u.get("unit_id") for u in units] == ["PHCAP15-UNIT-HARNESS", "PHCAP15-UNIT-OS", "PHCAP15-UNIT-WEB", "PHCAP15-UNIT-WEBOS"], "E_UNIT_IDS")
    for unit in units:
        uid = str(unit.get("unit_id"))
        req(unit.get("status") == "research_premise_candidate", "E_UNIT_STATUS:" + uid)
        req(unit.get("authority_status") == "candidate_unresolved", "E_UNIT_AUTHORITY:" + uid)
        req(unit.get("current_implementation_status") == "unknown", "E_UNIT_IMPL:" + uid)
        req(unit.get("current_operation_status") == "unknown", "E_UNIT_OPS:" + uid)
        req(unit.get("current_acceptance_status") == "unknown", "E_UNIT_ACCEPTANCE:" + uid)
        req(isinstance(unit.get("evidence_ref_ids"), list) and unit["evidence_ref_ids"], "E_UNIT_REFS:" + uid)
        req(isinstance(unit.get("unresolved"), list) and unit["unresolved"], "E_UNIT_UNRESOLVED:" + uid)

    edges = scope.get("candidate_edges", [])
    req(len(edges) == len(EXPECTED_EDGES), "E_EDGE_COUNT")
    req([e.get("edge_id") for e in edges] == list(EXPECTED_EDGES), "E_EDGE_IDS")
    for edge in edges:
        eid = str(edge.get("edge_id"))
        expected = EXPECTED_EDGES.get(eid)
        if expected:
            req((edge.get("from_unit"), edge.get("to_unit"), edge.get("relation")) == expected, "E_EDGE_SHAPE:" + eid)
        req(edge.get("status") == "unresolved_candidate", "E_EDGE_STATUS:" + eid)
        req(edge.get("authority_effect") == "none", "E_EDGE_AUTHORITY:" + eid)
        req(isinstance(edge.get("evidence_ref_ids"), list) and edge["evidence_ref_ids"], "E_EDGE_REFS:" + eid)
        req(nonempty(edge.get("unresolved")), "E_EDGE_UNRESOLVED:" + eid)
    joins = scope.get("candidate_phase_joins", [])
    req(joins == EXPECTED_SCOPE_PHASE_JOINS, "E_SCOPE_PHASE_JOINS")

    boundaries = data.get("product_boundary_candidates", {})
    req(boundaries.get("defined_product_set") == PRODUCTS, "E_BOUNDARY_PRODUCTS")
    req([x.get("product") for x in boundaries.get("products", [])] == PRODUCTS, "E_BOUNDARY_ORDER")
    req(boundaries.get("direct_deployment_evidence_products") == ["HELIX-OS", "HELIX-Web-OS"], "E_BOUNDARY_DIRECT")
    req(boundaries.get("boundary_only_products") == ["HELIX-HARNESS", "HELIX-Web"], "E_BOUNDARY_ONLY")
    req(boundaries.get("all_products_status") == "covered_as_candidate_or_unknown", "E_BOUNDARY_COVERAGE")
    req(boundaries.get("current_implementation_claim") is False, "E_BOUNDARY_IMPL_CLAIM")
    req(boundaries.get("authority_effect") == "none", "E_BOUNDARY_AUTHORITY")
    for product in boundaries.get("products", []):
        name = str(product.get("product"))
        req(product.get("status") == "research_premise_candidate", "E_BOUNDARY_STATUS:" + name)
        req(product.get("implementation_status") == "unknown", "E_BOUNDARY_IMPL:" + name)
        req(product.get("operation_status") == "unknown", "E_BOUNDARY_OPS:" + name)
        req(product.get("acceptance_status") == "unknown", "E_BOUNDARY_ACCEPTANCE:" + name)
        req(product.get("authority_status") == "candidate_unresolved", "E_BOUNDARY_PRODUCT_AUTHORITY:" + name)
        req(isinstance(product.get("unresolved"), list) and product["unresolved"], "E_BOUNDARY_UNRESOLVED:" + name)
    web = next((p for p in boundaries.get("products", []) if p.get("product") == "HELIX-Web"), {})
    req(web.get("current_evidence_status") == "adjacent_boundary_only", "E_WEB_DIRECT_STATUS")
    req(web.get("legacy_candidate_status") == "no_direct_product_candidate_in_selected_phase_rows", "E_WEB_LEGACY_STATUS")

    current = data.get("current_evidence", {})
    req(current.get("implementation_status") == "unknown", "E_CURRENT_IMPL")
    req(current.get("operation_status") == "unknown", "E_CURRENT_OPS")
    req(current.get("acceptance_status") == "unknown", "E_CURRENT_ACCEPTANCE")
    req(current.get("authority_status") == "candidate_unresolved", "E_CURRENT_AUTHORITY")
    refs = current.get("refs", [])
    req([r.get("ref_id") for r in refs] == list(EXPECTED_CURRENT_REFS), "E_CURRENT_REF_IDS")
    ref_ids = set()
    for ref in refs:
        rid = ref.get("ref_id")
        expected = EXPECTED_CURRENT_REFS.get(rid)
        req(rid not in ref_ids, "E_CURRENT_REF_DUP:" + str(rid))
        ref_ids.add(rid)
        if expected:
            product, classification, path_name, start, end = expected
            req((ref.get("product"), ref.get("classification"), ref.get("path"), ref.get("start_line"), ref.get("end_line")) == (product, classification, path_name, start, end), "E_CURRENT_REF_SHAPE:" + rid)
            path = ROOT / path_name
            req(path.is_file(), "E_CURRENT_REF_MISSING:" + rid)
            if path.is_file() and check_files:
                actual = span_text(path, start, end)
                req(file_sha(path) == ref.get("sha256"), "E_CURRENT_REF_SHA:" + rid)
                req(actual == ref.get("exact_text"), "E_CURRENT_REF_TEXT:" + rid)
                if actual is not None:
                    req(sha(actual.encode()) == ref.get("line_sha256"), "E_CURRENT_REF_LINE_SHA:" + rid)
        req(ref.get("status") == "candidate_unresolved", "E_CURRENT_REF_STATUS:" + str(rid))
        req(ref.get("authority_effect") == "none", "E_CURRENT_REF_AUTHORITY:" + str(rid))
        req(nonempty(ref.get("meaning")), "E_CURRENT_REF_MEANING:" + str(rid))
    req({r.get("ref_id") for r in refs if r.get("classification") == "direct_current_ref"} == {"CUR-OS-L2-DEPLOY-GOVERNANCE", "CUR-OS-L2-WEB-BOUNDARY", "CUR-WEBOS-L1-DEPLOY", "CUR-WEBOS-L2-DEPLOY"}, "E_CURRENT_DIRECT_REFS")
    req({r.get("ref_id") for r in refs if r.get("product") == "HELIX-Web"} == {"CUR-WEB-L1-BOUNDARY", "CUR-WEB-L2-BOUNDARY"}, "E_CURRENT_WEB_REFS")

    asset_rows = read_jsonl(ROOT / provenance.get("asset_ledger_path", "")) if (ROOT / provenance.get("asset_ledger_path", "")).is_file() else []
    phase_rows = read_jsonl(ROOT / provenance.get("phase_ledger_path", "")) if (ROOT / provenance.get("phase_ledger_path", "")).is_file() else []
    decision_rows = read_jsonl(ROOT / provenance.get("decision_ledger_path", "")) if (ROOT / provenance.get("decision_ledger_path", "")).is_file() else []
    asset_catalog = {r.get("asset_id"): r for r in asset_rows}
    phase_catalog = {r.get("asset_id"): r for r in phase_rows}
    selected_decisions = {aid: [r for r in decision_rows if r.get("asset_id") == aid] for aid in ASSET_IDS}
    assets = data.get("legacy_phase_assessment", {}).get("assets", [])
    req([a.get("asset_id") for a in assets] == ASSET_IDS, "E_ASSET_ORDER")
    req(data.get("legacy_phase_assessment", {}).get("phase_capability_status") == "documented_partial", "E_LEGACY_CAPABILITY")
    req(data.get("legacy_phase_assessment", {}).get("maximum_layer_evidenced") == "L13", "E_LEGACY_LAYER")
    req(data.get("legacy_phase_assessment", {}).get("legacy_execution_performed") is False, "E_LEGACY_EXECUTION")
    req(data.get("legacy_phase_assessment", {}).get("legacy_implementation_status") == "unknown", "E_LEGACY_IMPL")
    all_anchor_ids: set[str] = set()
    for asset in assets:
        aid = asset.get("asset_id")
        req(aid in ASSET_IDS, "E_ASSET_ID:" + str(aid))
        old = asset_catalog.get(aid, {})
        phase = phase_catalog.get(aid, {})
        req(asset.get("source_path") == ASSET_SOURCE_PATHS.get(aid), "E_ASSET_PATH:" + str(aid))
        req(asset.get("ledger_snapshot") == old, "E_ASSET_LEDGER_SNAPSHOT:" + str(aid))
        req(asset.get("phase_classification_snapshot") == phase, "E_ASSET_PHASE_SNAPSHOT:" + str(aid))
        req(asset.get("source_revision") == "legacy-generation-2026-09-14", "E_ASSET_REVISION:" + str(aid))
        req(asset.get("asset_class") == "Historical", "E_ASSET_CLASS:" + str(aid))
        req(asset.get("authority_status") == "historical", "E_ASSET_AUTHORITY:" + str(aid))
        req(asset.get("disposition") == "unresolved", "E_ASSET_DISPOSITION:" + str(aid))
        req(asset.get("implementation_status") == "unknown", "E_ASSET_IMPL:" + str(aid))
        req(asset.get("legacy_execution_performed") is False, "E_ASSET_EXECUTION:" + str(aid))
        req(asset.get("consumer_refs") == [], "E_ASSET_CONSUMERS:" + str(aid))
        req(asset.get("decision_record_ref") is None, "E_ASSET_DECISION:" + str(aid))
        req(asset.get("external_effect_status") == "unreviewed", "E_ASSET_EXTERNAL_EFFECT:" + str(aid))
        req(asset.get("phase_classification_snapshot", {}).get("classification_id") == PHASE_CLASSIFICATION_IDS.get(aid), "E_ASSET_CLASSIFICATION:" + str(aid))
        req(asset.get("phase_classification_snapshot", {}).get("legacy_execution_performed") is False, "E_PHASE_EXECUTION:" + str(aid))
        req(asset.get("phase_classification_snapshot", {}).get("legacy_implementation_status") == "unknown", "E_PHASE_IMPL:" + str(aid))
        req(asset.get("phase_classification_snapshot", {}).get("consumer_closure_status") == "pending", "E_PHASE_CLOSURE:" + str(aid))
        req(asset.get("phase_classification_snapshot", {}).get("consumer_refs") == [], "E_PHASE_CONSUMERS:" + str(aid))
        req(asset.get("phase_classification_snapshot", {}).get("authority_effect") == "none", "E_PHASE_AUTHORITY:" + str(aid))
        req(asset.get("archive_path", "").startswith(ARCHIVE_PREFIX), "E_ARCHIVE_PREFIX:" + str(aid))
        archive = ROOT / asset.get("archive_path", "")
        req(archive.is_file(), "E_ARCHIVE_MISSING:" + str(aid))
        if archive.is_file() and check_files:
            req(file_sha(archive) == asset.get("source_sha256"), "E_SOURCE_SHA:" + str(aid))
            req(len(archive.read_text(encoding="utf-8").splitlines()) == asset.get("source_line_count"), "E_SOURCE_LINES:" + str(aid))
        local_anchor_ids: set[str] = set()
        for anchor in asset.get("source_anchors", []):
            anchor_id = anchor.get("anchor_id")
            req(nonempty(anchor_id) and anchor_id not in all_anchor_ids, "E_ANCHOR_DUP:" + str(anchor_id))
            local_anchor_ids.add(anchor_id)
            all_anchor_ids.add(anchor_id)
            req(nonempty(anchor.get("meaning")), "E_ANCHOR_MEANING:" + str(anchor_id))
            if archive.is_file() and check_files:
                actual = span_text(archive, anchor.get("line_start", 0), anchor.get("line_end", 0))
                req(actual == anchor.get("exact_text"), "E_ANCHOR_TEXT:" + str(anchor_id))
                if actual is not None:
                    req(sha(actual.encode()) == anchor.get("sha256"), "E_ANCHOR_SHA:" + str(anchor_id))
        failure = asset.get("failure_evidence", {})
        req(failure.get("status") == "source_contract_only_unexecuted", "E_FAILURE_STATUS:" + str(aid))
        req(failure.get("execution_receipts") == 0, "E_FAILURE_RECEIPTS:" + str(aid))
        req(set(failure.get("anchor_ids", [])) <= local_anchor_ids, "E_FAILURE_ANCHORS:" + str(aid))
        consumer = asset.get("consumer_evidence", {})
        req(consumer.get("status") == "candidate_only_closure_pending", "E_CONSUMER_STATUS:" + str(aid))
        req(consumer.get("consumer_refs") == [], "E_CONSUMER_REFS:" + str(aid))
        req(set(consumer.get("anchor_ids", [])) <= local_anchor_ids, "E_CONSUMER_ANCHORS:" + str(aid))
        req(selected_decisions.get(aid, []) == [], "E_ASSET_DECISION_ROWS:" + str(aid))

    req(data.get("legacy_phase_assessment", {}).get("candidate_phase_joins") == EXPECTED_PHASE_JOINS, "E_LEGACY_PHASE_JOINS")
    decisions = data.get("decisions", {})
    req(decisions.get("selected_asset_ids") == ASSET_IDS, "E_DECISION_ASSETS")
    req(decisions.get("matching_append_only_decision_record_count") == 0, "E_DECISION_COUNT")
    req(decisions.get("per_asset") == {aid: 0 for aid in ASSET_IDS}, "E_DECISION_PER_ASSET")
    req(decisions.get("status") == "no_matching_append_only_decision_record", "E_DECISION_STATUS")

    failure = data.get("failure_residual", {})
    req(failure.get("status") == "source_contract_only_unexecuted", "E_FAILURE_TOTAL_STATUS")
    req(failure.get("execution_receipts") == 0, "E_FAILURE_TOTAL")
    req(failure.get("historical_failure_or_rollback_obligations_preserved") is True, "E_FAILURE_PRESERVED")
    req(failure.get("current_failure_status") == "unknown", "E_FAILURE_CURRENT")
    consumer = data.get("consumer_residual", {})
    req(consumer.get("status") == "candidate_only_closure_pending", "E_CONSUMER_TOTAL_STATUS")
    req(consumer.get("selected_asset_consumer_refs") == [], "E_CONSUMER_TOTAL_REFS")
    req(consumer.get("consumer_closed_assets") == 0, "E_CONSUMER_CLOSED")
    req(consumer.get("consumer_records_observed") == 0, "E_CONSUMER_RECORDS")

    req(data.get("gaps") == EXPECTED_GAPS, "E_GAPS_CONTENT")
    req(data.get("prohibited_inference") == EXPECTED_PROHIBITED_INFERENCE, "E_PROHIBITED_CONTENT")
    verification = data.get("verification_contract", {})
    req(verification.get("archive_read_only") is True, "E_VERIFY_ARCHIVE_READ_ONLY")
    req(verification.get("old_runtime_test_ci_execution") is False, "E_VERIFY_OLD_EXECUTION")
    req(verification.get("requires_exact_source_spans") is True, "E_VERIFY_SPANS")
    req(verification.get("requires_ledger_state_reconciliation") is True, "E_VERIFY_LEDGER")
    req(verification.get("unknowns_must_remain_explicit") is True, "E_VERIFY_UNKNOWNS")
    req(isinstance(verification.get("negative_cases"), list) and len(verification["negative_cases"]) >= 8, "E_VERIFY_NEGATIVE_CASES")

    counts = data.get("counts", {})
    req(counts.get("defined_products") == len(PRODUCTS), "E_COUNT_PRODUCTS")
    req(counts.get("product_units") == len(units), "E_COUNT_UNITS")
    req(counts.get("candidate_edges") == len(edges), "E_COUNT_EDGES")
    req(counts.get("legacy_assets") == len(assets), "E_COUNT_ASSETS")
    req(counts.get("source_anchors") == len(all_anchor_ids), "E_COUNT_ANCHORS")
    req(counts.get("current_refs") == len(refs), "E_COUNT_CURRENT")
    req(counts.get("decision_matches") == 0, "E_COUNT_DECISIONS")
    req(counts.get("failure_execution_receipts") == 0, "E_COUNT_FAILURE")
    req(counts.get("consumer_closed_assets") == 0, "E_COUNT_CONSUMERS")
    req(counts.get("candidate_phase_joins") == len(EXPECTED_SCOPE_PHASE_JOINS), "E_COUNT_PHASE_JOINS")
    return errors


if __name__ == "__main__":
    try:
        payload = json.loads(INV_PATH.read_text(encoding="utf-8"))
        problems = validate(payload)
    except Exception as exc:
        print("FAIL PHCAP-15 validator: exception: " + repr(exc))
        raise
    if problems:
        print("FAIL PHCAP-15 validator")
        print("\n".join(problems))
        sys.exit(1)
    print("PASS PHCAP-15 validator: static source/ledger/four-product/phase-join/unknown checks")
