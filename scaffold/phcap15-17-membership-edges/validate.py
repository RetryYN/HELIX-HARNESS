#!/usr/bin/env python3
"""PHCAP-15/17 candidate-pool membership audit; static checks only."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INV_PATH = HERE / "inventory.json"
ORIGIN = "1310ada35dd8848a8b49b34caf373fc51398cb80"
ASSET_IDS = [
    "LEGACY-ASSET-189702B332643A3BFDAF",
    "LEGACY-ASSET-4618C7243C283228809A",
]
CROSSWALK_PATH = ROOT / "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DISPOSITION_PATH = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
CLASSIFICATION_PATH = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DECISIONS_PATH = ROOT / "docs/governance/legacy-asset-decisions.jsonl"


def sha_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_sha(path: Path) -> str:
    return sha_bytes(path.read_bytes())


def jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def span_text(path: Path, start: int, end: int) -> str | None:
    lines = path.read_text(encoding="utf-8").splitlines()
    if start < 1 or end < start or end > len(lines):
        return None
    return "\n".join(lines[start - 1:end])


def validate(data: dict[str, Any], check_files: bool = True) -> list[str]:
    errors: list[str] = []

    def req(condition: bool, code: str) -> None:
        if not condition:
            errors.append(code)

    expected_top = {
        "schema", "status", "authority_effect", "meaning_change_applied", "successor_requirement_ids",
        "human_decision_ref", "equivalence_claim", "old_runtime_test_ci_execution", "base", "provenance",
        "scope", "assets", "membership_sets", "semantic_link_audit", "failure_consumer_decision_audit",
        "unresolved", "prohibited_inference",
    }
    req(set(data) == expected_top, "E_TOP_KEYS")
    req(data.get("schema") == "phcap15-17-membership-edges/v1", "E_SCHEMA")
    req(data.get("status") == "research_premise_candidate", "E_STATUS")
    req(data.get("authority_effect") == "none", "E_AUTHORITY")
    req(data.get("meaning_change_applied") is False, "E_MEANING_CHANGE")
    req(data.get("successor_requirement_ids") == [], "E_SUCCESSOR")
    req(data.get("human_decision_ref") is None, "E_HUMAN_DECISION")
    req(data.get("equivalence_claim") is None, "E_EQUIVALENCE")
    req(data.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")

    base = data.get("base", {})
    req(base.get("origin_main_commit") == ORIGIN, "E_BASE_ORIGIN")
    req(base.get("branch") == "detached-origin-main", "E_BASE_BRANCH")
    req(bool(base.get("worktree")), "E_BASE_WORKTREE")
    req(base.get("captured_at") == "2026-09-22", "E_BASE_DATE")

    prov = data.get("provenance", {})
    req(set(prov) == {"crosswalk", "crosswalk_meta", "asset_disposition", "asset_phase_product", "asset_decisions", "decision_log", "phase_inventory"}, "E_PROVENANCE_KEYS")
    for name, ref in prov.items():
        path = ROOT / ref.get("path", "")
        req(path.is_file(), "E_PROVENANCE_MISSING:" + name)
        if path.is_file() and check_files:
            req(file_sha(path) == ref.get("sha256"), "E_PROVENANCE_SHA:" + name)

    scope = data.get("scope", {})
    req(scope.get("asset_ids") == ASSET_IDS, "E_SCOPE_ASSETS")
    req(scope.get("membership_semantics") == "search_candidate_only_not_direct_semantic_link", "E_SCOPE_SEMANTICS")
    req(set(scope.get("candidate_products", [])) == {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"}, "E_SCOPE_PRODUCTS")
    req(scope.get("classification_vocabulary") == ["affirmative", "negative", "unknown"], "E_SCOPE_VOCABULARY")

    crosswalk = jsonl(CROSSWALK_PATH)
    by_id = {row.get("crosswalk_id"): row for row in crosswalk}
    req(len(crosswalk) == 218 and len(by_id) == 218, "E_CROSSWALK_COUNT")

    dispositions = {row.get("asset_id"): row for row in jsonl(DISPOSITION_PATH)}
    classifications = {row.get("asset_id"): row for row in jsonl(CLASSIFICATION_PATH)}
    decision_rows = jsonl(DECISIONS_PATH)
    asset_records = {row.get("asset_id"): row for row in data.get("assets", [])}
    req(list(asset_records) == ASSET_IDS, "E_ASSET_ORDER")

    archive_texts: dict[str, str] = {}
    for asset_id in ASSET_IDS:
        inv = asset_records.get(asset_id, {})
        old = dispositions.get(asset_id, {})
        cls = classifications.get(asset_id, {})
        req(inv.get("asset_class") == "Historical", "E_ASSET_CLASS:" + asset_id)
        req(inv.get("disposition") == "unresolved", "E_ASSET_DISPOSITION:" + asset_id)
        req(inv.get("implementation_status") == "unknown", "E_ASSET_IMPL:" + asset_id)
        req(inv.get("legacy_execution_performed") is False, "E_ASSET_EXECUTION:" + asset_id)
        req(inv.get("consumer_refs") == [], "E_ASSET_CONSUMERS:" + asset_id)
        req(inv.get("consumer_closure_status") == "pending", "E_ASSET_CLOSURE:" + asset_id)
        req(inv.get("decision_record_ref") is None, "E_ASSET_DECISION:" + asset_id)
        req(inv.get("candidate_phases") == cls.get("candidate_phase_targets"), "E_ASSET_PHASES:" + asset_id)
        req(inv.get("candidate_products") == cls.get("candidate_product_targets"), "E_ASSET_PRODUCTS:" + asset_id)
        req(inv.get("classification_id") == cls.get("classification_id"), "E_ASSET_CLASSIFICATION:" + asset_id)
        req(inv.get("source_path") == old.get("source_path"), "E_ASSET_LEDGER_PATH:" + asset_id)
        req(inv.get("source_sha256") == old.get("source_sha256") == cls.get("source_sha256"), "E_ASSET_SOURCE_SHA:" + asset_id)
        req(cls.get("product_classification_status") == "candidate_needs_semantic_review", "E_ASSET_PRODUCT_STATE:" + asset_id)
        req(cls.get("consumer_closure_status") == "pending" and cls.get("consumer_refs") == [], "E_CLASS_CONSUMER:" + asset_id)
        req(cls.get("legacy_execution_performed") is False and cls.get("legacy_implementation_status") == "unknown", "E_CLASS_IMPL:" + asset_id)
        req(not any(asset_id in row.get("asset_ids", []) for row in decision_rows if isinstance(row, dict)), "E_DECISION_ASSET_REF:" + asset_id)

        archive = ROOT / inv.get("archive_path", "")
        req(str(inv.get("archive_path", "")).startswith("archive/legacy-generation-2026-09-14/root/"), "E_ARCHIVE_PATH:" + asset_id)
        req(archive.is_file(), "E_ARCHIVE_MISSING:" + asset_id)
        if archive.is_file():
            text = archive.read_text(encoding="utf-8")
            archive_texts[asset_id] = text
            if check_files:
                req(file_sha(archive) == inv.get("source_sha256"), "E_ARCHIVE_SHA:" + asset_id)
                req(len(text.splitlines()) == inv.get("source_line_count"), "E_ARCHIVE_LINES:" + asset_id)
            seen: set[str] = set()
            for anchor in inv.get("anchors", []):
                aid = anchor.get("anchor_id")
                req(aid not in seen, "E_ANCHOR_DUP:" + str(aid))
                seen.add(aid)
                actual = span_text(archive, anchor.get("line_start", 0), anchor.get("line_end", 0))
                req(actual == anchor.get("exact_text"), "E_ANCHOR_TEXT:" + str(aid))
                if actual is not None:
                    req(sha_bytes(actual.encode("utf-8")) == anchor.get("sha256"), "E_ANCHOR_SHA:" + str(aid))
                req(bool(anchor.get("meaning")), "E_ANCHOR_MEANING:" + str(aid))
            for anchor_id in inv.get("failure_evidence", {}).get("anchor_ids", []) + inv.get("consumer_evidence", {}).get("anchor_ids", []):
                req(anchor_id in seen, "E_ANCHOR_REF:" + asset_id + ":" + str(anchor_id))
        req(inv.get("failure_evidence", {}).get("execution_receipts") == 0, "E_FAILURE_RECEIPTS:" + asset_id)
        req(inv.get("consumer_evidence", {}).get("consumer_refs") == [], "E_CONSUMER_EVIDENCE:" + asset_id)

    membership_sets = data.get("membership_sets", [])
    req([m.get("asset_id") for m in membership_sets] == ASSET_IDS, "E_MEMBERSHIP_ORDER")
    expected_total = 0
    classifications_seen: list[str] = []
    exact_id_matches = 0
    exact_span_matches = 0
    for membership in membership_sets:
        aid = membership.get("asset_id")
        ids = membership.get("crosswalk_ids", [])
        expected_total += len(ids)
        classifications_seen.extend([membership.get("classification")] * len(ids))
        req(len(ids) == membership.get("count"), "E_MEMBERSHIP_COUNT:" + str(aid))
        req(membership.get("classification") == "unknown", "E_MEMBERSHIP_CLASS:" + str(aid))
        req(bool(membership.get("source_contract")), "E_MEMBERSHIP_CONTRACT:" + str(aid))
        req(bool(membership.get("scope_anchor_ids")) and bool(membership.get("connection_anchor_ids")) and bool(membership.get("exception_anchor_ids")), "E_MEMBERSHIP_ANCHORS:" + str(aid))
        old_text = archive_texts.get(aid, "")
        for crosswalk_id in ids:
            row = by_id.get(crosswalk_id)
            req(row is not None, "E_MEMBER_MISSING:" + str(crosswalk_id))
            if row is None:
                continue
            pool = row.get("candidate_asset_pool", {})
            pool_ids = set(pool.get("phase_candidate_asset_ids", [])) | set(pool.get("phase_and_product_candidate_asset_ids", []))
            req(aid in pool_ids, "E_MEMBER_POOL:" + str(crosswalk_id))
            req(pool.get("membership_semantics") == "search_candidate_only_not_direct_semantic_link", "E_MEMBER_POOL_SEMANTICS:" + str(crosswalk_id))
            req(row.get("direct_legacy_asset_links") == [], "E_MEMBER_DIRECT_LINK:" + str(crosswalk_id))
            req(row.get("legacy_requirement_implementation_status") == "unknown_pending_direct_asset_semantic_review", "E_MEMBER_LEGACY_STATUS:" + str(crosswalk_id))
            req(row.get("current_requirement_implementation_status") == "not_established", "E_MEMBER_CURRENT_STATUS:" + str(crosswalk_id))
            req(row.get("consumer_closure_status") == "pending" and row.get("legacy_execution_performed") is False, "E_MEMBER_CLOSURE_EXECUTION:" + str(crosswalk_id))
            spans = row.get("source_text_spans", [])
            req(isinstance(spans, list) and all(isinstance(span, str) and span for span in spans), "E_MEMBER_SOURCE_CONTRACT:" + str(crosswalk_id))
            if row.get("source_requirement_id") and row["source_requirement_id"] in old_text:
                exact_id_matches += 1
            exact_span_matches += sum(1 for span in spans if span in old_text)
    req(expected_total == 69 and len(set(sum((m.get("crosswalk_ids", []) for m in membership_sets), []))) == 69, "E_MEMBERSHIP_TOTAL")
    req(not exact_id_matches, "E_EXACT_REQUIREMENT_ID_MATCH")
    req(not exact_span_matches, "E_EXACT_SOURCE_SPAN_MATCH")
    req(classifications_seen == ["unknown"] * 69, "E_PER_MEMBERSHIP_UNKNOWN")

    audit = data.get("semantic_link_audit", {})
    req(audit.get("affirmative") == 0 and audit.get("negative") == 0 and audit.get("unknown") == 69, "E_SEMANTIC_COUNTS")
    req(audit.get("candidate_memberships") == 69, "E_CANDIDATE_COUNT")
    req(audit.get("requirement_id_exact_matches") == exact_id_matches == 0, "E_AUDIT_ID_MATCHES")
    req(audit.get("source_span_exact_matches") == exact_span_matches == 0, "E_AUDIT_SPAN_MATCHES")
    req(audit.get("direct_legacy_asset_links_observed") == 0, "E_AUDIT_DIRECT_LINKS")
    req(audit.get("candidate_pool_membership_is_not_semantic") is True, "E_AUDIT_POOL_RULE")

    residual = data.get("failure_consumer_decision_audit", {})
    req(residual.get("matching_decision_records") == 0, "E_RESIDUAL_DECISIONS")
    req(residual.get("asset_consumer_refs") == 0 and residual.get("phase_consumer_refs") == 0, "E_RESIDUAL_CONSUMERS")
    req(residual.get("execution_receipts") == 0 and residual.get("legacy_execution_performed") is False, "E_RESIDUAL_EXECUTION")
    req(residual.get("failure_status") == "source_contract_only_unexecuted", "E_RESIDUAL_FAILURE")
    req(residual.get("consumer_closure_status") == "pending", "E_RESIDUAL_CLOSURE")

    req(isinstance(data.get("unresolved"), list) and len(data["unresolved"]) >= 8, "E_UNRESOLVED")
    req(isinstance(data.get("prohibited_inference"), list) and len(data["prohibited_inference"]) >= 8, "E_PROHIBITED_INFERENCE")
    return errors


if __name__ == "__main__":
    payload = json.loads(INV_PATH.read_text(encoding="utf-8"))
    problems = validate(payload)
    if problems:
        print("FAIL PHCAP-15/17 membership validator")
        print("\n".join(problems))
        raise SystemExit(1)
    print("PASS PHCAP-15/17 membership validator: assets=2 memberships=69 affirmative=0 negative=0 unknown=69 exact_requirement_id=0 exact_source_span=0")
