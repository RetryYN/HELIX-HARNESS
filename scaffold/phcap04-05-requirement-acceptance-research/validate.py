#!/usr/bin/env python3
"""PHCAP-04/05 requirement and L11 research premise; static read-only checks."""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INV_PATH = HERE / "inventory.json"
ORIGIN = "b27e61f079edf64eeddc43eb8095159b19730b94"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
TASK_IDS = ["PHCAP-04", "PHCAP-05"]
ASSET_IDS = [
    "LEGACY-ASSET-9F48ADEEB477DCA54039",
    "LEGACY-ASSET-B5B5E71B2AF1459D59A1",
    "LEGACY-ASSET-02319C2481B9E01698D5",
    "LEGACY-ASSET-D6339A02201B20481C3F",
    "LEGACY-ASSET-F17ABDB90E1340D09746",
    "LEGACY-ASSET-B3866EECAF22235E9EB5",
    "LEGACY-ASSET-EA8C51BDF69B34E896AA",
    "LEGACY-ASSET-2CA9EFB00A24A7346674",
]
ASSET_SOURCE_PATHS = {
    ASSET_IDS[0]: "docs/design/harness/L1-requirements/business-requirements.md",
    ASSET_IDS[1]: "docs/design/harness/L3-functional/functional-requirements.md",
    ASSET_IDS[2]: "docs/governance/helix-harness-requirements_v1.3.md",
    ASSET_IDS[3]: "src/requirements/requirement-authority.ts",
    ASSET_IDS[4]: "src/requirements/requirement-discovery.ts",
    ASSET_IDS[5]: "docs/design/helix/L11-uat/uat-evidence-boundary.md",
    ASSET_IDS[6]: "docs/design/helix/L12-acceptance/acceptance-evidence-index.md",
    ASSET_IDS[7]: "docs/test-design/helix/vmodel-docgen-fit-acceptance.md",
}
EXPECTED_UNIT_IDS = [
    "PHCAP0405-UNIT-HARNESS",
    "PHCAP0405-UNIT-OS",
    "PHCAP0405-UNIT-Web",
    "PHCAP0405-UNIT-WebOS",
]
EXPECTED_REF_SHAPES = {
    "CUR-HARNESS-L2": ("HELIX-HARNESS", "L2_current_ref", "docs/helix-harness/L2-requirements/product-requirements.md", 1, 35),
    "CUR-OS-L2": ("HELIX-OS", "L2_current_ref", "docs/helix-os/L2-requirements/governance-requirements.md", 1, 34),
    "CUR-WEB-L2": ("HELIX-Web", "L2_current_ref", "docs/helix-web/L2-requirements/product-requirements.md", 1, 23),
    "CUR-WEBOS-L2": ("HELIX-Web-OS", "L2_current_ref", "docs/helix-web-os/L2-requirements/service-governance-requirements.md", 1, 36),
    "CUR-HARNESS-L11": ("HELIX-HARNESS", "L11_current_ref", "docs/helix-harness/L11-acceptance/product-acceptance.md", 1, 36),
    "CUR-OS-L11": ("HELIX-OS", "L11_current_ref", "docs/helix-os/L11-acceptance/governance-acceptance.md", 1, 33),
    "CUR-WEB-L11": ("HELIX-Web", "L11_current_ref", "docs/helix-web/L11-acceptance/product-acceptance.md", 1, 31),
    "CUR-WEBOS-L11": ("HELIX-Web-OS", "L11_current_ref", "docs/helix-web-os/L11-acceptance/service-acceptance.md", 1, 24),
}
EXPECTED_GAPS = [
    "PHCAP-04 current L2 containers remain draft and individual adoption/IR admission is not established",
    "PHCAP-05 current L11 documents remain draft and all acceptance execution is unexecuted",
    "legacy assets mix preserved source snapshots, design, code and test-design; implementation status is not uniform",
    "source/decision history does not assign current product owner or successor requirement",
    "legacy phase joins are candidate classifications and do not admit phase work",
    "failure/incident/rollback execution receipts are absent from selected ledgers",
    "consumer refs for preserved snapshots are review surfaces, not runtime closure",
    "four-product L2/L11 boundary split, unit/connection/composite split and acceptance ownership remain unresolved",
    "new_build_allowed is false for both tasks",
]
EXPECTED_PROHIBITED = [
    "legacy source status confirmed does not establish current L2 adoption",
    "source snapshot preservation decision does not establish target product approval",
    "old code shape does not establish current implementation or runtime",
    "test-design/HAT/HAC declarations do not establish executed acceptance",
    "draft L2/L11 text does not establish requirement agreement or acceptance",
    "phase classification does not admit an asset to PHCAP-04/05",
    "Issue/PR/close/merge or old review text does not generate human decision",
    "consumer preservation refs do not establish current runtime consumer closure",
    "four-product coverage does not assign owner or authority",
    "Scaffold validator pass does not authorize build, deployment, CI, release or external effect",
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

    req(data.get("schema") == "phcap04-05-requirement-acceptance-research/v1", "E_SCHEMA")
    req(data.get("status") == "research_premise_candidate", "E_STATUS")
    req(data.get("authority_effect") == "none", "E_AUTHORITY")
    req(data.get("meaning_change_applied") is False, "E_MEANING_CHANGE")
    req(data.get("successor_requirement_ids") == [], "E_SUCCESSOR")
    req(data.get("human_decision_ref") is None, "E_HUMAN_DECISION")
    req(data.get("equivalence_claim") is None, "E_EQUIVALENCE")
    req(data.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")

    base = data.get("base", {})
    req(base.get("origin_main_commit") == ORIGIN, "E_BASE_ORIGIN")
    req(base.get("branch") == "audit/phcap04-05-static-evidence", "E_BASE_BRANCH")
    req(Path(base.get("worktree", "")).name == "phcap04-05-static-evidence", "E_BASE_WORKTREE")
    req(base.get("source_revision") == "legacy-generation-2026-09-14", "E_BASE_SOURCE_REVISION")
    rb = data.get("rebaseline", {})
    req(rb.get("origin_main_at_start") == ORIGIN, "E_REBASE_START")
    req(rb.get("origin_main_at_final") == ORIGIN, "E_REBASE_FINAL")
    req(rb.get("changed") is False, "E_REBASE_CHANGED")
    req("origin/main" in rb.get("stop_condition", "") and "rebaseline" in rb.get("stop_condition", ""), "E_REBASE_STOP")

    provenance = data.get("ledger_provenance", {})
    specs = [
        ("phase_inventory_path", "phase_inventory_sha256", None, None),
        ("asset_ledger_path", "asset_ledger_sha256", "asset_ledger_record_count", 4020),
        ("phase_ledger_path", "phase_ledger_sha256", "phase_ledger_record_count", 4020),
        ("decision_ledger_path", "decision_ledger_sha256", "decision_ledger_record_count", 58),
    ]
    for path_key, hash_key, count_key, expected_count in specs:
        path = ROOT / provenance.get(path_key, "")
        req(path.is_file(), "E_LEDGER_MISSING:" + path_key)
        if path.is_file() and check_files:
            req(file_sha(path) == provenance.get(hash_key), "E_LEDGER_SHA:" + path_key)
            if count_key:
                req(len(read_jsonl(path)) == provenance.get(count_key), "E_LEDGER_COUNT:" + path_key)
        if count_key:
            req(provenance.get(count_key) == expected_count, "E_LEDGER_EXPECTED_COUNT:" + path_key)

    phase_inv = ROOT / provenance.get("phase_inventory_path", "")
    phase_data = json.loads(phase_inv.read_text(encoding="utf-8")) if phase_inv.is_file() else {}
    phase_records = {r.get("task_id"): r for r in phase_data.get("records", [])}
    tasks = data.get("tasks", [])
    req(data.get("task_ids") == TASK_IDS, "E_TASK_IDS")
    req([t.get("task_id") for t in tasks] == TASK_IDS, "E_TASK_ORDER")
    expected_task_values = {
        "PHCAP-04": ("requirement_adoption_l2", "draft_containers", "documented_with_runtime_support", "degraded_to_unapproved_routing_containers"),
        "PHCAP-05": ("acceptance_l11", "draft", "documented_with_test_design_partial", "degraded_to_draft"),
    }
    for task in tasks:
        tid = task.get("task_id")
        phase = phase_records.get(tid)
        req(phase is not None, "E_PHASE_RECORD:" + str(tid))
        req(task.get("phase_record_snapshot") == phase, "E_PHASE_SNAPSHOT:" + str(tid))
        if phase:
            expected_phase, expected_current, expected_legacy, expected_transition = expected_task_values[tid]
            req(phase.get("phase") == expected_phase, "E_PHASE_NAME:" + tid)
            req(phase.get("current", {}).get("status") == expected_current, "E_PHASE_CURRENT:" + tid)
            req(phase.get("legacy", {}).get("capability_status") == expected_legacy, "E_PHASE_LEGACY:" + tid)
            req(phase.get("transition_assessment") == expected_transition, "E_PHASE_TRANSITION:" + tid)
            req(phase.get("product_targets") == PRODUCTS, "E_PHASE_PRODUCTS:" + tid)
            req(phase.get("current", {}).get("evidence_products") == PRODUCTS, "E_PHASE_EVIDENCE_PRODUCTS:" + tid)
            req(phase.get("new_build_allowed") is False, "E_PHASE_NEW_BUILD:" + tid)
            req(phase.get("authority_effect") == "inventory_and_work_projection_only", "E_PHASE_AUTHORITY:" + tid)
        req(task.get("current_status") == phase.get("current", {}).get("status") if phase else False, "E_TASK_CURRENT:" + str(tid))
        req(task.get("legacy_capability_status") == phase.get("legacy", {}).get("capability_status") if phase else False, "E_TASK_LEGACY:" + str(tid))
        req(task.get("transition_assessment") == phase.get("transition_assessment") if phase else False, "E_TASK_TRANSITION:" + str(tid))
        req(task.get("new_build_allowed") is False, "E_TASK_NEW_BUILD:" + str(tid))
        req(task.get("authority_effect") == "inventory_and_work_projection_only", "E_TASK_AUTHORITY:" + str(tid))

    scope = data.get("scope", {})
    req(scope.get("product_targets") == PRODUCTS, "E_SCOPE_PRODUCTS")
    req(scope.get("phase_ids") == TASK_IDS, "E_SCOPE_PHASES")
    req(scope.get("legacy_asset_ids") == ASSET_IDS, "E_SCOPE_ASSETS")
    req(scope.get("legacy_layers") == ["L1", "L3", "L11", "L12"], "E_SCOPE_LAYERS")
    units = scope.get("candidate_units", [])
    req([u.get("unit_id") for u in units] == EXPECTED_UNIT_IDS, "E_UNIT_IDS")
    req([u.get("product") for u in units] == PRODUCTS, "E_UNIT_PRODUCTS")
    all_ref_ids = {r.get("ref_id") for r in data.get("current_evidence", {}).get("refs", [])}
    for unit in units:
        uid = str(unit.get("unit_id"))
        req(unit.get("status") == "research_premise_candidate", "E_UNIT_STATUS:" + uid)
        req(unit.get("authority_status") == "candidate_unresolved", "E_UNIT_AUTHORITY:" + uid)
        req(unit.get("l2_status") == "draft", "E_UNIT_L2:" + uid)
        req(unit.get("l11_status") == "draft", "E_UNIT_L11:" + uid)
        req(unit.get("implementation_status") == "unknown", "E_UNIT_IMPL:" + uid)
        req(unit.get("acceptance_status") == "unknown", "E_UNIT_ACCEPTANCE:" + uid)
        req(unit.get("operation_status") == "unknown", "E_UNIT_OPERATION:" + uid)
        req(set(unit.get("evidence_ref_ids", [])) <= all_ref_ids and unit.get("evidence_ref_ids"), "E_UNIT_REFS:" + uid)
        req(set(unit.get("legacy_asset_ids", [])) <= set(ASSET_IDS) and unit.get("legacy_asset_ids"), "E_UNIT_ASSETS:" + uid)
        req(isinstance(unit.get("unresolved"), list) and unit["unresolved"], "E_UNIT_UNRESOLVED:" + uid)

    edges = scope.get("candidate_edges", [])
    req(len(edges) == 8, "E_EDGE_COUNT")
    req(len({e.get("edge_id") for e in edges}) == 8, "E_EDGE_DUP")
    for edge in edges:
        eid = str(edge.get("edge_id"))
        req(edge.get("status") == "unresolved_candidate", "E_EDGE_STATUS:" + eid)
        req(edge.get("authority_effect") == "none", "E_EDGE_AUTHORITY:" + eid)
        req(nonempty(edge.get("relation")), "E_EDGE_RELATION:" + eid)
        req(edge.get("from_unit") in EXPECTED_UNIT_IDS and edge.get("to_unit") in EXPECTED_UNIT_IDS, "E_EDGE_ENDPOINT:" + eid)
        req(set(edge.get("evidence_ref_ids", [])) <= all_ref_ids and edge.get("evidence_ref_ids"), "E_EDGE_REFS:" + eid)
        req(nonempty(edge.get("unresolved")), "E_EDGE_UNRESOLVED:" + eid)

    phase_rows_path = ROOT / provenance.get("phase_ledger_path", "")
    phase_rows = read_jsonl(phase_rows_path) if phase_rows_path.is_file() else []
    phase_catalog = {r.get("asset_id"): r for r in phase_rows}
    expected_joins = []
    for aid in ASSET_IDS:
        row = phase_catalog.get(aid, {})
        for tid in TASK_IDS:
            if tid in row.get("candidate_phase_targets", []):
                expected_joins.append({"asset_id": aid, "phase": tid, "status": "unresolved_candidate", "basis": "legacy phase/product classification ledger", "classification_id": row.get("classification_id")})
    joins = scope.get("candidate_phase_joins", [])
    req(joins == expected_joins, "E_PHASE_JOINS")

    boundaries = data.get("product_boundary_candidates", {})
    req(boundaries.get("defined_product_set") == PRODUCTS, "E_BOUNDARY_PRODUCTS")
    req([p.get("product") for p in boundaries.get("products", [])] == PRODUCTS, "E_BOUNDARY_ORDER")
    req(boundaries.get("current_implementation_claim") is False, "E_BOUNDARY_IMPL_CLAIM")
    req(boundaries.get("current_acceptance_claim") is False, "E_BOUNDARY_ACCEPTANCE_CLAIM")
    req(boundaries.get("authority_effect") == "none", "E_BOUNDARY_AUTHORITY")
    for product in boundaries.get("products", []):
        name = str(product.get("product"))
        req(product.get("l2_status") == "draft", "E_BOUNDARY_L2:" + name)
        req(product.get("l11_status") == "draft", "E_BOUNDARY_L11:" + name)
        req(product.get("implementation_status") == "unknown", "E_BOUNDARY_IMPL:" + name)
        req(product.get("acceptance_status") == "unknown", "E_BOUNDARY_ACCEPTANCE:" + name)
        req(product.get("authority_status") == "candidate_unresolved", "E_BOUNDARY_AUTHORITY:" + name)
        req(product.get("current_evidence_status") == "draft_boundary_candidate", "E_BOUNDARY_EVIDENCE:" + name)
        req(isinstance(product.get("unresolved"), list) and product["unresolved"], "E_BOUNDARY_UNRESOLVED:" + name)

    current = data.get("current_evidence", {})
    req(current.get("l2_status") == "draft", "E_CURRENT_L2")
    req(current.get("l11_status") == "draft", "E_CURRENT_L11")
    req(current.get("implementation_status") == "unknown", "E_CURRENT_IMPL")
    req(current.get("acceptance_status") == "unknown", "E_CURRENT_ACCEPTANCE")
    req(current.get("authority_status") == "candidate_unresolved", "E_CURRENT_AUTHORITY")
    refs = current.get("refs", [])
    req([r.get("ref_id") for r in refs] == list(EXPECTED_REF_SHAPES), "E_REF_IDS")
    for ref in refs:
        rid = ref.get("ref_id")
        expected = EXPECTED_REF_SHAPES.get(rid)
        req(expected is not None, "E_REF_UNKNOWN:" + str(rid))
        if expected:
            product, classification, path_name, start, end = expected
            req((ref.get("product"), ref.get("classification"), ref.get("path"), ref.get("start_line"), ref.get("end_line")) == (product, classification, path_name, start, end), "E_REF_SHAPE:" + rid)
            path = ROOT / path_name
            req(path.is_file(), "E_REF_MISSING:" + rid)
            if path.is_file() and check_files:
                actual = span_text(path, start, end)
                req(file_sha(path) == ref.get("sha256"), "E_REF_SHA:" + rid)
                req(actual == ref.get("exact_text"), "E_REF_TEXT:" + rid)
                if actual is not None:
                    req(sha(actual.encode()) == ref.get("line_sha256"), "E_REF_LINE_SHA:" + rid)
        req(ref.get("status") == "candidate_unresolved", "E_REF_STATUS:" + str(rid))
        req(ref.get("authority_effect") == "none", "E_REF_AUTHORITY:" + str(rid))
        req(nonempty(ref.get("meaning")), "E_REF_MEANING:" + str(rid))

    asset_rows_path = ROOT / provenance.get("asset_ledger_path", "")
    asset_rows = read_jsonl(asset_rows_path) if asset_rows_path.is_file() else []
    asset_catalog = {r.get("asset_id"): r for r in asset_rows}
    decision_rows_path = ROOT / provenance.get("decision_ledger_path", "")
    decision_rows = read_jsonl(decision_rows_path) if decision_rows_path.is_file() else []
    assets = data.get("legacy_assessment", {}).get("assets", [])
    req([a.get("asset_id") for a in assets] == ASSET_IDS, "E_ASSET_ORDER")
    all_anchor_ids: set[str] = set()
    for asset in assets:
        aid = asset.get("asset_id")
        row = asset_catalog.get(aid, {})
        phase = phase_catalog.get(aid, {})
        req(asset.get("source_path") == ASSET_SOURCE_PATHS.get(aid), "E_ASSET_PATH:" + str(aid))
        req(asset.get("ledger_snapshot") == row, "E_ASSET_LEDGER_SNAPSHOT:" + str(aid))
        req(asset.get("phase_classification_snapshot") == phase, "E_ASSET_PHASE_SNAPSHOT:" + str(aid))
        req(asset.get("source_revision") == "legacy-generation-2026-09-14", "E_ASSET_REVISION:" + str(aid))
        req(asset.get("archive_path", "").startswith(ARCHIVE_PREFIX), "E_ASSET_ARCHIVE_PREFIX:" + str(aid))
        archive = ROOT / asset.get("archive_path", "")
        req(archive.is_file(), "E_ASSET_ARCHIVE_MISSING:" + str(aid))
        if archive.is_file() and check_files:
            req(file_sha(archive) == asset.get("source_sha256"), "E_ASSET_SOURCE_SHA:" + str(aid))
            req(len(archive.read_text(encoding="utf-8").splitlines()) == asset.get("source_line_count"), "E_ASSET_SOURCE_LINES:" + str(aid))
        req(asset.get("source_sha256") == row.get("source_sha256"), "E_ASSET_SOURCE_LEDGER_SHA:" + str(aid))
        req(asset.get("asset_class") == row.get("asset_class"), "E_ASSET_CLASS:" + str(aid))
        req(asset.get("disposition") == row.get("disposition"), "E_ASSET_DISPOSITION:" + str(aid))
        req(asset.get("implementation_status") == row.get("implementation_status"), "E_ASSET_IMPL:" + str(aid))
        req(asset.get("legacy_execution_performed") is False, "E_ASSET_EXECUTION:" + str(aid))
        req(asset.get("consumer_refs") == row.get("consumer_refs", []), "E_ASSET_CONSUMERS:" + str(aid))
        local_ids: set[str] = set()
        for anchor in asset.get("source_anchors", []):
            anchor_id = anchor.get("anchor_id")
            req(nonempty(anchor_id) and anchor_id not in all_anchor_ids, "E_ANCHOR_DUP:" + str(anchor_id))
            local_ids.add(anchor_id); all_anchor_ids.add(anchor_id)
            req(nonempty(anchor.get("meaning")), "E_ANCHOR_MEANING:" + str(anchor_id))
            if archive.is_file() and check_files:
                actual = span_text(archive, anchor.get("line_start", 0), anchor.get("line_end", 0))
                req(actual == anchor.get("exact_text"), "E_ANCHOR_TEXT:" + str(anchor_id))
                if actual is not None:
                    req(sha(actual.encode()) == anchor.get("sha256"), "E_ANCHOR_SHA:" + str(anchor_id))
        failure = asset.get("failure_evidence", {})
        req(failure.get("status") == "source_contract_only_unexecuted", "E_FAILURE_STATUS:" + str(aid))
        req(failure.get("execution_receipts") == 0, "E_FAILURE_RECEIPTS:" + str(aid))
        req(set(failure.get("anchor_ids", [])) == local_ids, "E_FAILURE_ANCHORS:" + str(aid))
        consumer = asset.get("consumer_evidence", {})
        req(consumer.get("status") == "candidate_only_closure_pending", "E_CONSUMER_STATUS:" + str(aid))
        req(consumer.get("ledger_consumer_refs") == row.get("consumer_refs", []), "E_CONSUMER_LEDGER_REFS:" + str(aid))
        req(consumer.get("runtime_consumer_refs") == [], "E_CONSUMER_RUNTIME_REFS:" + str(aid))
        req(consumer.get("closure_status") == "pending", "E_CONSUMER_CLOSURE:" + str(aid))
        req(set(consumer.get("anchor_ids", [])) == local_ids, "E_CONSUMER_ANCHORS:" + str(aid))
        matching = [r for r in decision_rows if r.get("asset_id") == aid]
        req(asset.get("decision_evidence", {}).get("matching_records") == matching, "E_DECISION_RECORDS:" + str(aid))
        req(asset.get("decision_evidence", {}).get("matching_record_count") == len(matching), "E_DECISION_RECORD_COUNT:" + str(aid))
    req(data.get("decisions", {}).get("selected_asset_ids") == ASSET_IDS, "E_DECISIONS_ASSETS")
    req(data.get("decisions", {}).get("matching_append_only_decision_record_count") == 4, "E_DECISIONS_COUNT")
    req(data.get("decisions", {}).get("matching_asset_ids") == [ASSET_IDS[0], ASSET_IDS[2]], "E_DECISIONS_MATCHING_ASSETS")
    req(data.get("decisions", {}).get("per_asset") == {a["asset_id"]: a["decision_evidence"]["matching_record_count"] for a in assets}, "E_DECISIONS_PER_ASSET")
    req(data.get("decisions", {}).get("decision_effect") == "source_snapshot_preservation_only_pending_human_confirmation", "E_DECISIONS_EFFECT")
    req(data.get("decisions", {}).get("status") == "no_requirement_adoption_or_product_acceptance_decision", "E_DECISIONS_STATUS")

    failure = data.get("failure_residual", {})
    req(failure.get("status") == "source_contract_only_unexecuted", "E_FAILURE_TOTAL_STATUS")
    req(failure.get("execution_receipts") == 0, "E_FAILURE_TOTAL_RECEIPTS")
    req(failure.get("selected_asset_legacy_execution_flags") == {a["asset_id"]: False for a in assets}, "E_FAILURE_FLAGS")
    req(failure.get("current_failure_status") == "unknown", "E_FAILURE_CURRENT")
    req(failure.get("current_implementation_status") == "unknown", "E_FAILURE_IMPL")
    consumer = data.get("consumer_residual", {})
    req(consumer.get("status") == "candidate_only_closure_pending", "E_CONSUMER_TOTAL_STATUS")
    req(consumer.get("runtime_consumer_refs_by_asset") == {a["asset_id"]: [] for a in assets}, "E_CONSUMER_TOTAL_RUNTIME")
    req(consumer.get("consumer_closed_assets") == 0, "E_CONSUMER_TOTAL_CLOSED")
    req(consumer.get("consumer_records_observed") == 0, "E_CONSUMER_TOTAL_RECORDS")
    req(data.get("gaps") == EXPECTED_GAPS, "E_GAPS_CONTENT")
    req(data.get("prohibited_inference") == EXPECTED_PROHIBITED, "E_PROHIBITED_CONTENT")
    verification = data.get("verification_contract", {})
    req(verification.get("archive_read_only") is True, "E_VERIFY_ARCHIVE")
    req(verification.get("old_runtime_test_ci_execution") is False, "E_VERIFY_OLD_EXECUTION")
    req(verification.get("requires_exact_source_spans") is True, "E_VERIFY_SPANS")
    req(verification.get("requires_ledger_state_reconciliation") is True, "E_VERIFY_LEDGER")
    req(verification.get("unknowns_must_remain_explicit") is True, "E_VERIFY_UNKNOWNS")
    req(isinstance(verification.get("negative_cases"), list) and len(verification["negative_cases"]) >= 8, "E_VERIFY_NEGATIVE_CASES")
    counts = data.get("counts", {})
    req(counts.get("tasks") == len(tasks), "E_COUNT_TASKS")
    req(counts.get("defined_products") == len(PRODUCTS), "E_COUNT_PRODUCTS")
    req(counts.get("product_units") == len(units), "E_COUNT_UNITS")
    req(counts.get("candidate_edges") == len(edges), "E_COUNT_EDGES")
    req(counts.get("candidate_phase_joins") == len(joins), "E_COUNT_JOINS")
    req(counts.get("legacy_assets") == len(assets), "E_COUNT_ASSETS")
    req(counts.get("source_anchors") == len(all_anchor_ids), "E_COUNT_ANCHORS")
    req(counts.get("current_refs") == len(refs), "E_COUNT_REFS")
    req(counts.get("decision_matches") == 4, "E_COUNT_DECISIONS")
    req(counts.get("failure_execution_receipts") == 0, "E_COUNT_FAILURE")
    req(counts.get("consumer_closed_assets") == 0, "E_COUNT_CONSUMERS")
    return errors


if __name__ == "__main__":
    try:
        payload = json.loads(INV_PATH.read_text(encoding="utf-8"))
        problems = validate(payload)
    except Exception as exc:
        print("FAIL PHCAP-04/05 validator: exception: " + repr(exc))
        raise
    if problems:
        print("FAIL PHCAP-04/05 validator")
        print("\n".join(problems))
        sys.exit(1)
    print("PASS PHCAP-04/05 validator: static phase/ledger/source/decision/failure/consumer/four-product checks")
