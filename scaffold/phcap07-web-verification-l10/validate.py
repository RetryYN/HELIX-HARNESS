#!/usr/bin/env python3
"""PHCAP-07 Web/Web-OS Verification-L10 research candidate; static checks only."""
from __future__ import annotations
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
    "LEGACY-ASSET-614BF1FA7A7310E3BB4A",
    "LEGACY-ASSET-174B63F415197A4B09C5",
    "LEGACY-ASSET-4674004EAE02B2811AE0",
    "LEGACY-ASSET-0CC674CB78470B86E7A8",
    "LEGACY-ASSET-535EBA960C372C61F999",
    "LEGACY-ASSET-B3866EECAF22235E9EB5",
    "LEGACY-ASSET-FC23AB4BB99DA8F4076A",
]
EXPECTED_EXCLUSIONS = {
    ASSET_IDS[0]: None, ASSET_IDS[1]: None, ASSET_IDS[2]: None,
    ASSET_IDS[3]: "legacy_test_design_or_oracle", ASSET_IDS[4]: None,
    ASSET_IDS[5]: None, ASSET_IDS[6]: "legacy_test_design_or_oracle",
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

    req(data.get("schema") == "phcap07-web-verification-l10/v1", "E_SCHEMA")
    req(data.get("status") == "research_premise_candidate", "E_STATUS")
    req(data.get("authority_effect") == "none", "E_AUTHORITY")
    req(data.get("meaning_change_applied") is False, "E_MEANING_CHANGE")
    req(data.get("successor_requirement_ids") == [], "E_SUCCESSOR")
    req(data.get("human_decision_ref") is None, "E_HUMAN_DECISION")
    req(data.get("equivalence_claim") is None, "E_EQUIVALENCE")
    req(data.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")

    base = data.get("base", {})
    req(base.get("origin_main_commit") == ORIGIN, "E_BASE_ORIGIN")
    req(base.get("branch") == "research/phcap07-web-verification-l10", "E_BASE_BRANCH")
    req(nonempty(base.get("worktree")), "E_BASE_WORKTREE")
    rb = data.get("rebaseline", {})
    req(rb.get("origin_main_at_start") == ORIGIN, "E_REBASE_START")
    req(rb.get("origin_main_at_final") == ORIGIN, "E_REBASE_FINAL")
    req(rb.get("changed") is False, "E_REBASE_CHANGED")
    req("origin/main" in rb.get("stop_condition", "") and "rebaseline" in rb.get("stop_condition", ""), "E_REBASE_STOP")

    task = data.get("task", {})
    req(task.get("task_id") == "PHCAP-07", "E_TASK_ID")
    req(task.get("phase") == "verification_l10", "E_TASK_PHASE")
    inv = ROOT / task.get("inventory_path", "")
    req(inv.is_file(), "E_PHASE_INVENTORY_MISSING")
    if inv.is_file():
        req(file_sha(inv) == task.get("inventory_sha256"), "E_PHASE_INVENTORY_SHA")
        phase = json.loads(inv.read_text(encoding="utf-8"))
        rec = next((x for x in phase.get("records", []) if x.get("task_id") == "PHCAP-07"), None)
        req(rec == task.get("phase_record_snapshot"), "E_PHASE_SNAPSHOT")
        if rec:
            req(rec.get("product_targets") == ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"], "E_PHASE_PRODUCTS")
            req(rec.get("current", {}).get("evidence_products") == ["HELIX-HARNESS", "HELIX-OS"], "E_PHASE_CURRENT_PRODUCTS")
            req(rec.get("legacy", {}).get("maximum_layer_evidenced") == "L12", "E_PHASE_LAYER")
            req(rec.get("legacy", {}).get("capability_status") == "documented_with_test_design", "E_PHASE_CAPABILITY")

    scope = data.get("scope", {})
    req(scope.get("product_targets") == ["HELIX-Web", "HELIX-Web-OS"], "E_SCOPE_PRODUCTS")
    req(scope.get("phase_candidate_product_targets") == ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"], "E_CANDIDATE_PRODUCTS")
    req(scope.get("phase_current_evidence_products") == ["HELIX-HARNESS", "HELIX-OS"], "E_SCOPE_CURRENT_PRODUCTS")
    req(scope.get("legacy_asset_ids") == ASSET_IDS, "E_SCOPE_ASSET_IDS")
    req(scope.get("legacy_layer_reach") == ["L8", "L9", "L10 contract", "L11", "L12"], "E_SCOPE_LAYERS")
    units = scope.get("candidate_units", [])
    req(len(units) == 2, "E_UNIT_COUNT")
    req({u.get("unit_id") for u in units} == {"PHCAP07-UNIT-WEB-VERIFICATION", "PHCAP07-UNIT-WEBOS-VERIFICATION"}, "E_UNIT_IDS")
    req({u.get("product") for u in units} == {"HELIX-Web", "HELIX-Web-OS"}, "E_UNIT_PRODUCTS")
    for u in units:
        uid = str(u.get("unit_id"))
        req(u.get("status") == "research_premise_candidate", "E_UNIT_STATUS:" + uid)
        req(u.get("authority_status") == "candidate_unresolved", "E_UNIT_AUTHORITY:" + uid)
        req(u.get("phase_direct_current_ref_ids") == [], "E_UNIT_DIRECT_REFS:" + uid)
        req(u.get("current_implementation_status") == "unknown", "E_UNIT_IMPL:" + uid)
        req(u.get("current_l10_status") == "unknown", "E_UNIT_L10:" + uid)
        req(u.get("current_l11_status") == "draft_unexecuted", "E_UNIT_L11:" + uid)
        req(u.get("oracle_status") == "unknown_no_formal_product_oracle_registry", "E_UNIT_ORACLE:" + uid)
        req(bool(u.get("unresolved")), "E_UNIT_UNRESOLVED:" + uid)

    edges = scope.get("candidate_edges", [])
    req(len(edges) == 16, "E_EDGE_COUNT")
    edge_ids = [e.get("edge_id") for e in edges]
    req(len(set(edge_ids)) == len(edge_ids), "E_EDGE_DUP")
    req(all(nonempty(e.get("relation")) for e in edges), "E_EDGE_RELATION")
    req(all(e.get("status") in {"unresolved_candidate", "draft_unexecuted_adjacent", "connection_candidate_unresolved"} for e in edges), "E_EDGE_STATUS")
    req(all(e.get("authority_effect") == "none" for e in edges), "E_EDGE_AUTHORITY")
    req(sum(1 for e in edges if e.get("relation") == "legacy_verification_asset_to_product_unit_candidate") == 11, "E_LEGACY_EDGE_COUNT")
    req(sum(1 for e in edges if e.get("relation") == "product_document_to_verification_unit_candidate") == 4, "E_PRODUCT_EDGE_COUNT")
    req(sum(1 for e in edges if e.get("relation") == "user_service_to_service_runtime_verification_connection") == 1, "E_CONNECTION_EDGE_COUNT")
    req(any(x.get("asset_id") == ASSET_IDS[4] for x in scope.get("non_target_selected_assets", [])), "E_NON_TARGET_ASSET")

    assets = data.get("legacy_phase_assessment", {}).get("assets", [])
    req([a.get("asset_id") for a in assets] == ASSET_IDS, "E_ASSET_ORDER")
    catalog = {x.get("asset_id"): x for x in read_jsonl(ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl")}
    disposition = {x.get("asset_id"): x for x in read_jsonl(ROOT / "docs/governance/legacy-asset-disposition.jsonl")}
    snaps = {x.get("asset_id"): x for x in data.get("legacy_phase_assessment", {}).get("ledger_snapshots", [])}
    seen_spans: set[str] = set()
    for asset in assets:
        aid = asset.get("asset_id")
        req(aid in ASSET_IDS, "E_ASSET_ID:" + str(aid))
        old = disposition.get(aid, {})
        cls = catalog.get(aid, {})
        snap = snaps.get(aid, {})
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
        req(asset.get("failure_evidence", {}).get("status") == "source_contract_or_test_design_only_unexecuted", "E_FAILURE_STATUS:" + str(aid))
        req(asset.get("consumer_evidence", {}).get("status") == "source_candidate_only_closure_pending", "E_CONSUMER_STATUS:" + str(aid))
        if snap:
            req(snap.get("disposition", {}).get("implementation_status") == "unknown", "E_SNAP_IMPL:" + str(aid))
            req(snap.get("classification", {}).get("legacy_execution_performed") is False, "E_SNAP_EXECUTION:" + str(aid))
        archive = ROOT / asset.get("archive_path", "")
        req(asset.get("archive_path", "").startswith(ARCHIVE_PREFIX) and archive.is_file(), "E_ARCHIVE:" + str(aid))
        if archive.is_file() and check_files:
            req(file_sha(archive) == asset.get("source_sha256"), "E_SOURCE_SHA:" + str(aid))
            req(len(archive.read_text(encoding="utf8").splitlines()) == asset.get("source_line_count"), "E_SOURCE_LINES:" + str(aid))
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
        for sid in asset.get("failure_evidence", {}).get("anchor_ids", []):
            req(sid in seen_spans, "E_FAILURE_ANCHOR:" + str(aid) + ":" + str(sid))
        for sid in asset.get("consumer_evidence", {}).get("anchor_ids", []):
            req(sid in seen_spans, "E_CONSUMER_ANCHOR:" + str(aid) + ":" + str(sid))

    decisions = data.get("decisions", {})
    req(decisions.get("selected_asset_ids") == ASSET_IDS, "E_DECISION_ASSETS")
    req(decisions.get("matching_append_only_decision_record_count") == 0, "E_DECISION_COUNT")
    req(all(v == 0 for v in decisions.get("per_asset", {}).values()), "E_DECISION_PER_ASSET")
    fail = data.get("failure_residual", {})
    req(fail.get("selected_asset_failure_records") == 0, "E_FAILURE_LEDGER")
    req(fail.get("current_product_failure_receipts") == 0, "E_FAILURE_PRODUCT")
    req(fail.get("current_l10_execution_receipts") == 0, "E_FAILURE_L10")
    cons = data.get("consumer_residual", {})
    req(cons.get("selected_asset_ledger_consumer_refs") == [], "E_CONSUMER_LEDGER")
    req(cons.get("current_consumer_read_after_receipts") == 0, "E_CONSUMER_READ_AFTER")
    req(cons.get("consumer_closure_status") == "pending", "E_CONSUMER_CLOSURE")

    current = data.get("current_evidence", {})
    req(current.get("phase_direct_evidence_products") == ["HELIX-HARNESS", "HELIX-OS"], "E_CURRENT_PHASE_PRODUCTS")
    req(current.get("product_direct_evidence_products") == [], "E_CURRENT_PRODUCT_DIRECT")
    req(set(current.get("product_adjacent_document_products", [])) == {"HELIX-Web", "HELIX-Web-OS"}, "E_CURRENT_ADJACENT_PRODUCTS")
    req(current.get("implementation_status") == "unknown", "E_CURRENT_IMPL")
    req(current.get("l10_status") == "unknown", "E_CURRENT_L10")
    req(current.get("l11_status") == "draft_unexecuted", "E_CURRENT_L11")
    req(current.get("oracle_registry_status") == "unknown", "E_CURRENT_ORACLE")
    req(current.get("formal_ci_relation_status") == "unknown", "E_CURRENT_CI")
    refs = current.get("refs", [])
    req(len(refs) == 10, "E_CURRENT_REF_COUNT")
    ref_ids: set[str] = set()
    for ref in refs:
        rid = ref.get("ref_id")
        req(rid not in ref_ids, "E_CURRENT_REF_DUP:" + str(rid))
        ref_ids.add(rid)
        path = ROOT / ref.get("path", "")
        req(path.is_file(), "E_CURRENT_REF_MISSING:" + str(rid))
        if path.is_file() and check_files:
            req(file_sha(path) == ref.get("file_sha256"), "E_CURRENT_REF_FILE_SHA:" + str(rid))
            actual = span_text(path, ref.get("line_start", 0), ref.get("line_end", 0))
            req(actual == ref.get("exact_text"), "E_CURRENT_REF_TEXT:" + str(rid))
            if actual is not None:
                req(sha(actual.encode()) == ref.get("sha256"), "E_CURRENT_REF_LINE_SHA:" + str(rid))
        req(ref.get("classification") in {"phase_direct_current_ref", "product_document_adjacent", "boundary_adjacent_ref"}, "E_CURRENT_REF_CLASS:" + str(rid))
    req({r.get("ref_id") for r in refs if r.get("classification") == "phase_direct_current_ref"} == {"CUR-PHASE-CI", "CUR-PHASE-CI-L10", "CUR-HARNESS-L11"}, "E_PHASE_DIRECT_REFS")
    req({r.get("ref_id") for r in refs if r.get("classification") == "product_document_adjacent"} == {"CUR-WEB-L2", "CUR-WEB-L2-ROWS", "CUR-WEB-L11", "CUR-WEBOS-L2", "CUR-WEBOS-L11"}, "E_PRODUCT_ADJACENT_REFS")
    # Five product-document refs include both Web L2 rows spans and WebOS L2/L11.

    counts = data.get("counts", {})
    req(counts.get("product_units") == len(units), "E_COUNT_UNITS")
    req(counts.get("candidate_edges") == len(edges), "E_COUNT_EDGES")
    req(counts.get("legacy_assets") == len(assets), "E_COUNT_ASSETS")
    req(counts.get("source_anchors") == len(seen_spans), "E_COUNT_ANCHORS")
    req(counts.get("current_refs") == len(refs), "E_COUNT_CURRENT")
    req(counts.get("decision_matches") == 0, "E_COUNT_DECISIONS")
    req(counts.get("phase_direct_web_products") == 0, "E_COUNT_PHASE_WEB")
    req(counts.get("product_adjacent_refs") == 5, "E_COUNT_ADJACENT")
    req(counts.get("current_failure_receipts") == 0, "E_COUNT_FAILURE")
    req(counts.get("consumer_closed_assets") == 0, "E_COUNT_CONSUMERS")
    for field in ("gaps", "prohibited_inference"):
        req(isinstance(data.get(field), list) and len(data[field]) >= 5, "E_LIST:" + field)
        req(all(nonempty(x) for x in data.get(field, [])), "E_LIST_ITEM:" + field)
    return errors

if __name__ == "__main__":
    payload = json.loads(INV_PATH.read_text(encoding="utf8"))
    problems = validate(payload)
    if problems:
        print("FAIL PHCAP-07 validator")
        print("\n".join(problems))
        sys.exit(1)
    print("PASS PHCAP-07 validator: static source/ledger/product-unit/oracle-gap/unknown checks")
