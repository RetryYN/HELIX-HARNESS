#!/usr/bin/env python3
"""Read-only validator for the PHCAP-15/17 orphan-asset research premise."""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INV_PATH = HERE / "inventory.json"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
ASSET_IDS = [
    "LEGACY-ASSET-54330A68064B58B22259",
    "LEGACY-ASSET-1251704E0BE627232E00",
    "LEGACY-ASSET-189702B332643A3BFDAF",
    "LEGACY-ASSET-9E033C3E39BE107D4CF1",
    "LEGACY-ASSET-6582F09E55B33723B679",
    "LEGACY-ASSET-4618C7243C283228809A",
]
EXPECTED_TOP_KEYS = {
    "schema", "status", "authority_effect", "meaning_change_applied", "new_build_allowed",
    "successor_requirement_ids", "human_decision_ref", "old_runtime_test_ci_execution", "base",
    "provenance", "scope", "requirement_link_audit", "routing_candidates", "phase_snapshots",
    "assets", "failure_consumer_decision_audit", "unresolved", "verification_contract", "counts",
}
EXPECTED_SOURCE = {
    ASSET_IDS[0]: {"sha256": "14ec3141c84e122085843b2b5a2ae0a0c83fe257694a76dcc0eb6ab9f5b365d8", "lines": 39},
    ASSET_IDS[1]: {"sha256": "d2f87c2a0cdeef4ef1902737af53638c8125c3e7679c6804207de02d6f6e99ba", "lines": 32},
    ASSET_IDS[2]: {"sha256": "968a2da7ed628f2c69ab4e696327b4dd9e88a61aee99453c210c858a4eaf914a", "lines": 71},
    ASSET_IDS[3]: {"sha256": "bad6448a63dbc6b7867b9845ca8caf96ee144802961504f3793667f49fc28f7c", "lines": 100},
    ASSET_IDS[4]: {"sha256": "d557803078abd240241793e76afc398e28c660999b69809d78bed3a87ab04306", "lines": 93},
    ASSET_IDS[5]: {"sha256": "f5ba60755a67d7aff8a38eb2fd4212a17fa3c9186a63ce4763843f25a458e402", "lines": 78},
}
EXPECTED_PHASE_PRODUCTS = {
    ASSET_IDS[0]: ["HELIX-OS", "HELIX-Web-OS"],
    ASSET_IDS[1]: ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web-OS"],
    ASSET_IDS[2]: ["HELIX-OS", "HELIX-Web-OS"],
    ASSET_IDS[3]: ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web-OS"],
    ASSET_IDS[4]: ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web-OS"],
    ASSET_IDS[5]: ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web-OS"],
}
EXPECTED_PHASES = {
    ASSET_IDS[0]: ["PHCAP-15"],
    ASSET_IDS[1]: ["PHCAP-15"],
    ASSET_IDS[2]: ["PHCAP-07", "PHCAP-15"],
    ASSET_IDS[3]: ["PHCAP-15", "PHCAP-17"],
    ASSET_IDS[4]: ["PHCAP-17"],
    ASSET_IDS[5]: ["PHCAP-16", "PHCAP-17"],
}
EXPECTED_MEMBERSHIP = dict(zip(ASSET_IDS, [0, 0, 68, 0, 0, 1]))
EXPECTED_SCOPE_KEYS = {"phase_ids", "products", "asset_ids"}
EXPECTED_ROUTING_KEYS = {
    "product", "candidate_role", "asset_basis", "current_evidence_status", "routing_status",
}
EXPECTED_PHASE_SNAPSHOT_KEYS = {
    "title", "product_targets", "current_status", "current_evidence_products",
    "legacy_capability_status", "legacy_maximum_layer", "transition_assessment", "new_build_allowed",
}
EXPECTED_REQUIREMENT_LINK_AUDIT_KEYS = {
    "crosswalk_records", "crosswalk_unit_phase_links", "phase_direct_unit_counts",
    "all_direct_legacy_asset_links", "unreferenced_phase_representative_assets", "unreferenced_asset_ids",
    "source_requirement_id_matches", "source_span_exact_matches", "candidate_pool_membership",
    "candidate_pool_semantics", "direct_link_conclusion",
}
EXPECTED_FAILURE_AUDIT_KEYS = {
    "selected_assets", "decision_records_found", "asset_consumer_refs_observed",
    "phase_consumer_refs_observed", "execution_receipts_observed", "consumer_closure",
    "failure_status", "interpretation",
}
EXPECTED_PROVENANCE_KEYS = {
    "phase_inventory", "asset_ledger", "phase_product_ledger", "decision_ledger", "decision_contract",
    "crosswalk", "crosswalk_metadata", "product_boundary", "crosswalk_status",
}
EXPECTED_PROVENANCE_LEAF_KEYS = {
    "phase_inventory": {"path", "sha256"},
    "asset_ledger": {"path", "sha256", "record_count"},
    "phase_product_ledger": {"path", "sha256", "record_count"},
    "decision_ledger": {"path", "sha256", "record_count"},
    "decision_contract": {"path", "sha256"},
    "crosswalk": {"path", "sha256", "record_count"},
    "crosswalk_metadata": {"path", "sha256"},
    "product_boundary": {"path", "sha256"},
    "crosswalk_status": {"path", "sha256"},
}
EXPECTED_COUNTS_KEYS = {
    "assets", "source_anchors", "products", "requirement_units", "unit_phase_links",
    "direct_requirement_links", "decision_records", "consumer_refs", "failure_receipts",
}
EXPECTED_VERIFICATION_KEYS = {
    "archive_read_only", "old_runtime_test_ci_execution", "source_anchor_digests_required",
    "crosswalk_candidate_pool_not_semantic", "unknowns_must_remain_explicit", "negative_cases",
}
EXPECTED_ASSET_KEYS_BASE = {
    "asset_id", "phase", "artifact_evidence_kind", "source_path", "archive_path", "source_sha256",
    "source_line_count", "candidate_products", "implementation_evidence_state",
    "legacy_implementation_status", "legacy_execution_performed", "failure_or_degradation",
    "failure_receipts_observed", "consumer_refs", "consumer_closure_status", "decision_records_found",
    "source_anchors", "direct_requirement_connection",
}
EXPECTED_ASSET_KEYS = {
    aid: EXPECTED_ASSET_KEYS_BASE | optional
    for aid, optional in {
        ASSET_IDS[0]: set(),
        ASSET_IDS[1]: set(),
        ASSET_IDS[2]: {"additional_phase_candidate", "candidate_pool_membership_note"},
        ASSET_IDS[3]: {"additional_phase_candidate"},
        ASSET_IDS[4]: set(),
        ASSET_IDS[5]: {"additional_phase_candidate"},
    }.items()
}
EXPECTED_SOURCE_ANCHOR_KEYS = {"id", "start_line", "end_line", "sha256", "meaning"}
EXPECTED_DIRECT_CONNECTION_KEYS = {"status", "matched_unit_ids", "reason"}
EXPECTED_FAILURE_AUDIT_VALUES = {
    "selected_assets": 6,
    "decision_records_found": 0,
    "asset_consumer_refs_observed": 0,
    "phase_consumer_refs_observed": 0,
    "execution_receipts_observed": 0,
    "consumer_closure": "pending_for_all_selected_assets",
    "failure_status": "historical_conditions_only_no_execution_receipt",
    "interpretation": (
        "absence of decision/consumer/failure receipt does not create adoption, rejection, owner, "
        "implementation, or closure"
    ),
}
EXPECTED_ANCHOR_MEANINGS = {
    "A54330-01": "post-deploy scope and explicit incomplete remote/production boundary",
    "A54330-02": "static source/test/oracle rows and approval-gated cutover blocker",
    "A12517-01": "local smoke/consumer evidence and approval-gated external change boundary",
    "A12517-02": "explicit L13 incomplete blockers",
    "A18970-01": "embedded historical review/test-green metadata retained as unexecuted historical claim",
    "A18970-02": "local smoke versus external rollout boundary and documentation DoD",
    "A9E03-01": "historical current-authority/incident identity claim retained as contradiction",
    "A9E03-02": "incident flow, approval, recovery and reverse/fullback obligations as historical process text",
    "A6582-01": "embedded historical review/test-green metadata retained without execution claim",
    "A6582-02": "route-token scope and approval-dependent acceptance/failure condition",
    "A4618-01": "runbook purpose and L11/incident applicability",
    "A4618-02": "approval-gated live incident entry and missing-procedure escalation",
    "A4618-03": "uncompleted runbook, timeline, approval and recovery checklist",
}


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def fail(errors: list[str], condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


def check_keys(errors: list[str], value: object, expected: set[str], code: str) -> None:
    """Reject schema drift in every bounded nested object, including added keys."""
    if not isinstance(value, dict):
        errors.append(code + ":TYPE")
        return
    fail(errors, set(value) == expected, code)


def archive_span_hash(path: Path, start: int, end: int) -> str | None:
    lines = path.read_text(encoding="utf-8").splitlines()
    if not (1 <= start <= end <= len(lines)):
        return None
    return sha256_bytes(("\n".join(lines[start - 1:end]) + "\n").encode("utf-8"))


def validate(inv: dict) -> list[str]:
    errors: list[str] = []
    fail(errors, set(inv) == EXPECTED_TOP_KEYS, "E_TOP_KEYS")
    fail(errors, inv.get("schema") == "phcap15-17-orphan-asset-links/v1", "E_SCHEMA")
    fail(errors, inv.get("status") == "research_premise_candidate", "E_STATUS")
    fail(errors, inv.get("authority_effect") == "none", "E_AUTHORITY")
    fail(errors, inv.get("meaning_change_applied") is False, "E_MEANING_CHANGE")
    fail(errors, inv.get("new_build_allowed") is False, "E_NEW_BUILD")
    fail(errors, inv.get("successor_requirement_ids") == [] and inv.get("human_decision_ref") is None, "E_DECISION_FIELDS")
    fail(errors, inv.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")
    fail(errors, inv.get("base", {}).get("origin_main_commit") == "2654cf936719dee21dfbf1ceb8140163400f081a", "E_BASE")

    # The research inventory is a closed scaffold contract.  Pin the shape before
    # reading any evidence so nested additions cannot silently become evidence.
    check_keys(errors, inv.get("scope"), EXPECTED_SCOPE_KEYS, "E_SCOPE_KEYS")
    check_keys(errors, inv.get("requirement_link_audit"), EXPECTED_REQUIREMENT_LINK_AUDIT_KEYS, "E_REQUIREMENT_AUDIT_KEYS")
    check_keys(errors, inv.get("failure_consumer_decision_audit"), EXPECTED_FAILURE_AUDIT_KEYS, "E_FAILURE_AUDIT_KEYS")
    check_keys(errors, inv.get("counts"), EXPECTED_COUNTS_KEYS, "E_COUNTS_KEYS")
    check_keys(errors, inv.get("verification_contract"), EXPECTED_VERIFICATION_KEYS, "E_VERIFICATION_KEYS")

    prov_shape = inv.get("provenance")
    check_keys(errors, prov_shape, EXPECTED_PROVENANCE_KEYS, "E_PROVENANCE_KEYS")
    if isinstance(prov_shape, dict):
        for name, expected_keys in EXPECTED_PROVENANCE_LEAF_KEYS.items():
            check_keys(errors, prov_shape.get(name), expected_keys, "E_PROVENANCE_LEAF_KEYS:" + name)

    audit_shape = inv.get("requirement_link_audit")
    if isinstance(audit_shape, dict):
        check_keys(errors, audit_shape.get("phase_direct_unit_counts"), {"PHCAP-15", "PHCAP-17"}, "E_PHASE_DIRECT_UNIT_KEYS")
        check_keys(errors, audit_shape.get("candidate_pool_membership"), set(ASSET_IDS), "E_POOL_MEMBERSHIP_KEYS")

    phase_snapshots = inv.get("phase_snapshots")
    if not isinstance(phase_snapshots, dict):
        errors.append("E_PHASE_SNAPSHOT_KEYS:TYPE")
    else:
        fail(errors, set(phase_snapshots) == {"PHCAP-15", "PHCAP-17"}, "E_PHASE_SNAPSHOT_IDS")
        for phase_id in ("PHCAP-15", "PHCAP-17"):
            check_keys(errors, phase_snapshots.get(phase_id), EXPECTED_PHASE_SNAPSHOT_KEYS, "E_PHASE_SNAPSHOT_KEYS:" + phase_id)

    routing_shape = inv.get("routing_candidates")
    if not isinstance(routing_shape, list):
        errors.append("E_ROUTING_KEYS:TYPE")
    else:
        for index, candidate in enumerate(routing_shape):
            check_keys(errors, candidate, EXPECTED_ROUTING_KEYS, "E_ROUTING_KEYS:" + str(index))

    assets_shape = inv.get("assets")
    if not isinstance(assets_shape, list):
        errors.append("E_ASSET_KEYS:TYPE")
    else:
        for index, asset in enumerate(assets_shape):
            aid = asset.get("asset_id") if isinstance(asset, dict) else str(index)
            check_keys(errors, asset, EXPECTED_ASSET_KEYS.get(aid, EXPECTED_ASSET_KEYS_BASE), "E_ASSET_KEYS:" + str(aid))
            if isinstance(asset, dict):
                anchors = asset.get("source_anchors")
                if not isinstance(anchors, list):
                    errors.append("E_ANCHOR_KEYS:" + str(aid) + ":TYPE")
                else:
                    for anchor_index, anchor in enumerate(anchors):
                        anchor_id = anchor.get("id") if isinstance(anchor, dict) else str(anchor_index)
                        check_keys(errors, anchor, EXPECTED_SOURCE_ANCHOR_KEYS, "E_ANCHOR_KEYS:" + str(anchor_id))
                check_keys(errors, asset.get("direct_requirement_connection"), EXPECTED_DIRECT_CONNECTION_KEYS, "E_DIRECT_CONNECTION_KEYS:" + str(aid))

    failure_audit = inv.get("failure_consumer_decision_audit")
    if isinstance(failure_audit, dict):
        for key, expected in EXPECTED_FAILURE_AUDIT_VALUES.items():
            fail(errors, failure_audit.get(key) == expected, "E_FAILURE_AUDIT_VALUE:" + key)

    prov = inv.get("provenance", {})
    for name, expected in {
        "phase_inventory": ("docs/governance/phase-capability-inventory.json", "9face795f98c660bec02d46106f08a25ba189633f6b555b563a0c7951e173f0c"),
        "asset_ledger": ("docs/governance/legacy-asset-disposition.jsonl", "cd73ac407937ad86c6be2c0b27d70863b1873fe39c2d6c0f89620e648dccad8c"),
        "phase_product_ledger": ("docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl", "2188f236cb7ed316772ee1fcf413f3b098f702cb4c9d9b3dad09a72db7468c1f"),
        "decision_ledger": ("docs/governance/legacy-asset-decisions.jsonl", "cbf7c18fbf0faea7745677091d440e40ba48345740a786404258e705a3cbd59f"),
        "decision_contract": ("docs/governance/legacy-asset-decision-log.md", "748d14fe46da14ef33618e83672be18f290345f5f7f80c38eb3f1094cfe6f91b"),
        "crosswalk": ("docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl", "8610eb2e29d6b23905dba191c0781c4c6e3c22efe591ec6076b95bac8533af65"),
        "crosswalk_metadata": ("docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.meta.json", "a67f248c3dacf4c15af121ec8db1ba14ff8f8711b68cb9b688c20b6eb383df85"),
        "product_boundary": ("docs/concept/product-boundary.md", "097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038"),
        "crosswalk_status": ("docs/governance/audits/source-rebaseline/legacy-requirement-implementation-crosswalk-status-2026-09-21.md", "f1431da8455921dba7c7a25924b23879988119e4df6bcbee80574f207791e338"),
    }.items():
        rec = prov.get(name, {})
        path = ROOT / rec.get("path", "")
        fail(errors, rec.get("path") == expected[0], "E_PROV_PATH:" + name)
        fail(errors, rec.get("sha256") == expected[1], "E_PROV_DIGEST_FIELD:" + name)
        fail(errors, path.is_file(), "E_PROV_MISSING:" + name)
        if path.is_file():
            fail(errors, sha256_bytes(path.read_bytes()) == expected[1], "E_PROV_DIGEST:" + name)

    products = inv.get("scope", {}).get("products")
    fail(errors, products == PRODUCTS, "E_PRODUCTS")
    fail(errors, inv.get("scope", {}).get("phase_ids") == ["PHCAP-15", "PHCAP-17"], "E_PHASE_SCOPE")
    fail(errors, inv.get("scope", {}).get("asset_ids") == ASSET_IDS, "E_ASSET_SCOPE")

    rows = load_jsonl(ROOT / "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl")
    meta = json.loads((ROOT / "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.meta.json").read_text(encoding="utf-8"))
    audit = inv.get("requirement_link_audit", {})
    fail(errors, len(rows) == 218 and audit.get("crosswalk_records") == 218, "E_CROSSWALK_COUNT")
    fail(errors, audit.get("crosswalk_unit_phase_links") == 321 and meta.get("unit_phase_link_count") == 321, "E_UNIT_PHASE_COUNT")
    for phase in ("PHCAP-15", "PHCAP-17"):
        fail(errors, sum(phase in row.get("direct_phase_candidates", []) for row in rows) == 0, "E_PHASE_DIRECT:" + phase)
        fail(errors, audit.get("phase_direct_unit_counts", {}).get(phase) == 0, "E_PHASE_AUDIT:" + phase)
    fail(errors, sum(bool(row.get("direct_legacy_asset_links")) for row in rows) == 0, "E_DIRECT_LINKS")
    fail(errors, audit.get("all_direct_legacy_asset_links") == 0 and meta.get("direct_legacy_asset_link_count") == 0, "E_DIRECT_LINK_COUNT")
    unreferenced = {item.get("asset_id") for item in meta.get("unreferenced_phase_representative_assets", [])}
    fail(errors, unreferenced == set(ASSET_IDS), "E_UNREFERENCED_SET")
    fail(errors, set(audit.get("unreferenced_asset_ids", [])) == set(ASSET_IDS), "E_AUDIT_UNREFERENCED_SET")

    membership: dict[str, int] = {}
    for aid in ASSET_IDS:
        membership[aid] = sum(
            aid in row.get("candidate_asset_pool", {}).get("phase_candidate_asset_ids", [])
            or aid in row.get("candidate_asset_pool", {}).get("phase_and_product_candidate_asset_ids", [])
            for row in rows
        )
    fail(errors, membership == EXPECTED_MEMBERSHIP, "E_MEMBERSHIP")
    fail(errors, audit.get("candidate_pool_membership") == {k: EXPECTED_MEMBERSHIP[k] for k in ASSET_IDS}, "E_AUDIT_MEMBERSHIP")

    requirement_id_matches = 0
    span_matches = 0
    for asset in inv.get("assets", []):
        archive_path = ROOT / asset.get("archive_path", "")
        if not archive_path.is_file():
            continue
        text = archive_path.read_text(encoding="utf-8")
        for row in rows:
            requirement_id_matches += int(row.get("source_requirement_id", "") in text)
            for source_span in row.get("source_text_spans", []):
                source_text = source_span if isinstance(source_span, str) else source_span.get("text", "")
                if len(source_text) >= 25:
                    span_matches += int(source_text in text)
    fail(errors, requirement_id_matches == 0 and audit.get("source_requirement_id_matches") == 0, "E_REQUIREMENT_ID_MATCH")
    fail(errors, span_matches == 0 and audit.get("source_span_exact_matches") == 0, "E_SOURCE_SPAN_MATCH")

    phase_inventory = json.loads((ROOT / "docs/governance/phase-capability-inventory.json").read_text(encoding="utf-8"))
    phase_records = {record.get("task_id"): record for record in phase_inventory.get("records", [])}
    for phase_id, expected in inv.get("phase_snapshots", {}).items():
        record = phase_records.get(phase_id)
        fail(errors, record is not None, "E_PHASE_RECORD:" + phase_id)
        if record:
            fail(errors, record.get("product_targets") == expected.get("product_targets"), "E_PHASE_PRODUCTS:" + phase_id)
            fail(errors, record.get("current", {}).get("status") == expected.get("current_status"), "E_PHASE_STATUS:" + phase_id)
            fail(errors, record.get("current", {}).get("evidence_products") == expected.get("current_evidence_products"), "E_PHASE_EVIDENCE_PRODUCTS:" + phase_id)
            fail(errors, record.get("legacy", {}).get("capability_status") == expected.get("legacy_capability_status"), "E_PHASE_LEGACY_STATUS:" + phase_id)
            fail(errors, record.get("legacy", {}).get("maximum_layer_evidenced") == expected.get("legacy_maximum_layer"), "E_PHASE_LAYER:" + phase_id)
            fail(errors, record.get("transition_assessment") == expected.get("transition_assessment"), "E_PHASE_TRANSITION:" + phase_id)
            fail(errors, record.get("new_build_allowed") is False, "E_PHASE_NEW_BUILD:" + phase_id)

    disposition = {row.get("asset_id"): row for row in load_jsonl(ROOT / "docs/governance/legacy-asset-disposition.jsonl")}
    classification = {row.get("asset_id"): row for row in load_jsonl(ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl")}
    decisions = load_jsonl(ROOT / "docs/governance/legacy-asset-decisions.jsonl")
    selected = inv.get("assets", [])
    fail(errors, len(selected) == 6 and {item.get("asset_id") for item in selected} == set(ASSET_IDS), "E_SELECTED_ASSETS")
    for item in selected:
        aid = item.get("asset_id")
        old = disposition.get(aid)
        phase = classification.get(aid)
        fail(errors, old is not None and phase is not None, "E_LEDGER_RECORD:" + str(aid))
        if old and phase:
            fail(errors, old.get("source_path") == item.get("source_path"), "E_SOURCE_PATH:" + aid)
            fail(errors, old.get("source_sha256") == item.get("source_sha256"), "E_SOURCE_DIGEST_FIELD:" + aid)
            fail(errors, old.get("asset_class") == "Historical" and old.get("disposition") == "unresolved", "E_DISPOSITION:" + aid)
            fail(errors, old.get("implementation_status") == "unknown", "E_LEGACY_IMPL:" + aid)
            fail(errors, old.get("consumer_refs") == [] and old.get("decision_record_ref") is None, "E_ASSET_CONSUMER_DECISION:" + aid)
            fail(errors, phase.get("candidate_product_targets") == item.get("candidate_products"), "E_CANDIDATE_PRODUCTS:" + aid)
            fail(errors, phase.get("consumer_refs") == [] and phase.get("consumer_closure_status") == "pending", "E_PHASE_CONSUMER:" + aid)
            fail(errors, phase.get("legacy_implementation_status") == "unknown" and phase.get("legacy_execution_performed") is False, "E_PHASE_IMPL_EXEC:" + aid)
            fail(errors, phase.get("candidate_phase_targets") == EXPECTED_PHASES[aid], "E_CANDIDATE_PHASES:" + aid)
        fail(errors, item.get("implementation_evidence_state") == "document_present", "E_IMPLEMENTATION_EVIDENCE_STATE:" + aid)
        fail(errors, item.get("legacy_implementation_status") == "unknown" and item.get("legacy_execution_performed") is False, "E_INVENTORY_IMPL_EXEC:" + aid)
        fail(errors, sum(row.get("asset_id") == aid for row in decisions) == 0, "E_DECISION_MATCH:" + aid)
        fail(errors, item.get("failure_receipts_observed") == 0 and item.get("consumer_refs") == [] and item.get("decision_records_found") == 0, "E_RESIDUALS:" + aid)
        archive_path = ROOT / item.get("archive_path", "")
        fail(errors, item.get("archive_path", "").startswith(ARCHIVE_PREFIX), "E_ARCHIVE_PREFIX:" + aid)
        fail(errors, archive_path.is_file(), "E_ARCHIVE_MISSING:" + aid)
        if archive_path.is_file():
            fail(errors, sha256_bytes(archive_path.read_bytes()) == item.get("source_sha256"), "E_ARCHIVE_DIGEST:" + aid)
            fail(errors, len(archive_path.read_text(encoding="utf-8").splitlines()) == item.get("source_line_count"), "E_ARCHIVE_LINES:" + aid)
            for anchor in item.get("source_anchors", []):
                fail(errors, archive_span_hash(archive_path, anchor.get("start_line", 0), anchor.get("end_line", 0)) == anchor.get("sha256"), "E_ANCHOR:" + anchor.get("id", aid))
                expected_meaning = EXPECTED_ANCHOR_MEANINGS.get(anchor.get("id"))
                fail(errors, expected_meaning is not None and anchor.get("meaning") == expected_meaning, "E_ANCHOR_MEANING:" + anchor.get("id", aid))
        link = item.get("direct_requirement_connection", {})
        fail(errors, link.get("status") == "no_exact_evidence_bounded_search" and link.get("matched_unit_ids") == [], "E_DIRECT_CONNECTION:" + aid)

    routing = inv.get("routing_candidates", [])
    fail(errors, [item.get("product") for item in routing] == PRODUCTS, "E_ROUTING_PRODUCTS")
    fail(errors, all(item.get("routing_status") == "candidate_unresolved" for item in routing), "E_ROUTING_STATUS")
    failure_audit = inv.get("failure_consumer_decision_audit", {})
    for key in ("selected_assets", "decision_records_found", "asset_consumer_refs_observed", "phase_consumer_refs_observed", "execution_receipts_observed"):
        expected = {"selected_assets": 6, "decision_records_found": 0, "asset_consumer_refs_observed": 0, "phase_consumer_refs_observed": 0, "execution_receipts_observed": 0}[key]
        fail(errors, failure_audit.get(key) == expected, "E_FAILURE_AUDIT:" + key)
    fail(errors, inv.get("counts", {}).get("assets") == 6 and inv.get("counts", {}).get("direct_requirement_links") == 0, "E_COUNTS")
    fail(errors, isinstance(inv.get("unresolved"), list) and len(inv["unresolved"]) >= 6 and all(isinstance(value, str) and value.strip() for value in inv["unresolved"]), "E_UNRESOLVED")
    return errors


if __name__ == "__main__":
    errors = validate(json.loads(INV_PATH.read_text(encoding="utf-8")))
    if errors:
        print("FAIL PHCAP-15/17 orphan asset validator")
        print("\n".join(errors))
        sys.exit(1)
    print("PASS PHCAP-15/17 orphan asset validator: six assets, crosswalk, source anchors, routing and residuals")
