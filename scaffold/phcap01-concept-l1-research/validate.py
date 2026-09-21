#!/usr/bin/env python3
"""PHCAP-01 Concept/L1 static research validator (read-only)."""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INV_PATH = HERE / "inventory.json"
ORIGIN = "fbeee47920ed8b2992ae123b00c224ff88987c50"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
ASSET_IDS = [
    "LEGACY-ASSET-3B16BCFFAF353ADA813A", "LEGACY-ASSET-18F7940E7994634D39A1",
    "LEGACY-ASSET-75776FE016E550F5355F", "LEGACY-ASSET-6F9EA1BA29C41A6DD329",
    "LEGACY-ASSET-583C7CADF804E9E19ED1", "LEGACY-ASSET-49526DFD38C34D9F7236",
    "LEGACY-ASSET-DD53551C74BB4939A325", "LEGACY-ASSET-2E08F9429CA4C061B9AB",
]
CURRENT_REFS = {
    "CUR-CONCEPT": ("HELIX", "docs/concept/helix-concept-v4.1.md", "181b0c555f4e27f83a1f92d315aee0e66a9f3f645e3cebe0a1b8d487878efaad", 280, 25, 75, "ee6d3d950d21ffac1f3bcdbfa6e6acb1d9191ea6a83cbe9b6659d89f424f0828"),
    "CUR-BOUNDARY": ("HELIX", "docs/concept/product-boundary.md", "097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038", 106, 32, 70, "78fa21cc8b020a268fa50f47657373b463f72a96aa60daaaf2d63aecd2980491"),
    "CUR-DECISION": ("HELIX", "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md", "b512098481cb282d066b37383cfcd932ef137e86e604a46f965fc605d52698f2", 72, 21, 64, "7bb0eb2c5a937e3c7d976da5daf98f89f73eb5f304bb39105db51eefbe271817"),
    "CUR-HARNESS-L1": ("HELIX-HARNESS", "docs/helix-harness/L1-planning/product-intent.md", "a49da594e9593557eb42cbfe54edc7e9751ce40fea95d1fe9367f5780184ee04", 64, 15, 64, "68c3f81325ecb673c63b1c4e8f2206d0f732b6d7ab15026b43ae2865ae3eea21"),
    "CUR-OS-L1": ("HELIX-OS", "docs/helix-os/L1-planning/system-intent.md", "0f7f30d9d6984578f09c31ed1ef4e826d7c360bf752297982bde5201e7e99ca8", 69, 15, 69, "20c1215c446516f826de8b77edf4461eef2710d9c2428c7fb28b3d904681c010"),
    "CUR-WEB-L1": ("HELIX-Web", "docs/helix-web/L1-planning/product-intent.md", "26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756", 56, 17, 56, "d04b03ff393a107a6e438aa18a5ee64f6b6136743ad9fc3b554ce5d80b89535a"),
    "CUR-WEBOS-L1": ("HELIX-Web-OS", "docs/helix-web-os/L1-planning/system-intent.md", "600caa1388278abe43c06f01c53f565146c2f2ddd2165f6a8c9e63cbb174a34c", 50, 12, 50, "d57646a08f42cb3096bcf7456498796ecaddc362acfb792269f673928c8d831f"),
}
EXPECTED_PHASE_REFS = [
    "docs/concept/helix-concept-v4.1.md",
    "docs/concept/product-boundary.md",
    "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md",
    "docs/helix-harness/L1-planning/product-intent.md",
    "docs/helix-os/L1-planning/system-intent.md",
    "docs/helix-web/L1-planning/product-intent.md",
    "docs/helix-web-os/L1-planning/system-intent.md",
]
EXPECTED_PRODUCT_MEANINGS = {
    "HELIX-HARNESS": {
        "unit_id": "PHCAP01-UNIT-HARNESS",
        "l1_ref": "CUR-HARNESS-L1",
        "responsibility": "V-model、工程、要求形成、Design Template、検証・受入契約",
        "markers": ("V-model", "検証", "受け入れる"),
    },
    "HELIX-OS": {
        "unit_id": "PHCAP01-UNIT-OS",
        "l1_ref": "CUR-OS-L1",
        "responsibility": "project群の管理・統制、Worker、state、log、CI、learning、distribution operation",
        "markers": ("authority", "Worker", "CI", "継続改善"),
    },
    "HELIX-Web": {
        "unit_id": "PHCAP01-UNIT-WEB",
        "l1_ref": "CUR-WEB-L1",
        "responsibility": "Connector型AI開発SaaSのdashboard、操作、進行表示、service体験",
        "markers": ("Connector", "AI開発SaaS", "ダッシュボード"),
    },
    "HELIX-Web-OS": {
        "unit_id": "PHCAP01-UNIT-WEBOS",
        "l1_ref": "CUR-WEBOS-L1",
        "responsibility": "Web展開時のtenant、Connector、job、service state、配備、監視、復旧",
        "markers": ("tenant", "Connector", "job", "配備・監視・更新・復旧"),
    },
}
EXPECTED_CONNECTIONS = {
    "PHCAP01-CONN-HARNESS-OS": ("HELIX-HARNESS", "HELIX-OS", "requirements_engine_to_registration_management", "HARNESS要求engineの導出結果をOSが登録・管理する候補"),
    "PHCAP01-CONN-OS-WEB": ("HELIX-OS", "HELIX-Web", "development_and_improvement_management", "OSがWebの開発・改善projectを管理する候補"),
    "PHCAP01-CONN-WEBOS-OS": ("HELIX-Web-OS", "HELIX-OS", "permitted_observation_to_improvement_loop", "Web-OSの許可されたlog／telemetry等をOSの改善候補へ返す候補"),
}
EXPECTED_ASSET = {
    "LEGACY-ASSET-3B16BCFFAF353ADA813A": ("LASPH-0419", "design", 76, "Historical", "unresolved", "unknown"),
    "LEGACY-ASSET-18F7940E7994634D39A1": ("LASPH-0425", "requirement", 143, "RequirementSourceSnapshot", "source_snapshot_preservation", "non_executable_read_only_source"),
    "LEGACY-ASSET-75776FE016E550F5355F": ("LASPH-0953", "operation_document", 1328, "Historical", "unresolved", "unknown"),
    "LEGACY-ASSET-6F9EA1BA29C41A6DD329": ("LASPH-0830", "requirement", 44, "Historical", "unresolved", "unknown"),
    "LEGACY-ASSET-583C7CADF804E9E19ED1": ("LASPH-0826", "test_design", 36, "Historical", "unresolved", "unknown"),
    "LEGACY-ASSET-49526DFD38C34D9F7236": ("LASPH-0308", "unknown", 31, "Historical", "unresolved", "unknown"),
    "LEGACY-ASSET-DD53551C74BB4939A325": ("LASPH-0315", "unknown", 583, "Historical", "unresolved", "unknown"),
    "LEGACY-ASSET-2E08F9429CA4C061B9AB": ("LASPH-0301", "unknown", 2215, "Historical", "unresolved", "unknown"),
}

EXPECTED_PROHIBITED_INFERENCE = [
    "phase/product candidateを正式なphase admissionまたはproduct ownerへ変換しない",
    "旧source、old code、test-design、historical decisionを現行implementation、oracle、fallback、acceptanceへ変換しない",
    "18Fのsource_snapshot_preservationをtarget product adoptionやsuccessor assignmentと解釈しない",
    "approved exact revisionをL2/L11合意、L3/L10、runtime、CI、release、deploymentの完了と解釈しない",
    "実装証拠の欠如をunimplemented、degraded、failureの事実と断定しない",
    "archive内のworkflow/runtime/test/CI/hook/adapter/sourceを実行しない",
]

EXPECTED_NESTED_KEYS = {
    "root.base": "origin_main_commit branch worktree captured_at source_revision",
    "root.phase_record": "task_id phase title product_targets current_status evidence_products current_refs scaffold legacy_exists legacy_layers_evidenced legacy_maximum_layer_evidenced legacy_capability_status representative_asset_ids assessment transition_assessment gaps new_build_allowed authority_effect",
    "root.ledger_provenance": "phase_inventory asset_disposition phase_product_classification decisions",
    "root.ledger_provenance.phase_inventory": "path sha256 records",
    "root.ledger_provenance.asset_disposition": "path sha256 records",
    "root.ledger_provenance.phase_product_classification": "path sha256 records",
    "root.ledger_provenance.decisions": "path sha256 records",
    "root.current_evidence": "approval_record approval_record_sha256 approval_status l1_frontmatter_status l2_l11_applied implementation_status degradation_status acceptance_status operation_status refs",
    "root.current_evidence.refs[]": "ref_id product classification path sha256 line_count line_start line_end span_sha256 meaning status authority_effect",
    "root.products[]": "unit_id product candidate_status authority_status current_implementation_status degradation_status operation_status l1_ref responsibility unresolved",
    "root.connections[]": "connection_id from to relation status authority_effect meaning unresolved",
    "root.legacy_assets[]": "asset_id source_path archive_path source_revision source_sha256 source_line_count artifact_kind classification_id candidate_phases candidate_products phase_status product_status ledger_asset_class ledger_disposition implementation_status implementation_evidence_state legacy_execution_performed consumer_refs consumer_closure_status decision_ids source_anchors unresolved",
    "root.legacy_assets[].source_anchors[]": "id start end sha256 meaning",
    "root.aggregates": "phase_candidate_count phase_status_counts artifact_kind_counts legacy_implementation_counts implementation_evidence_counts product_status_counts candidate_product_target_sets product_occurrences asset_disposition_counts consumer_closure_counts decision_match_count decision_match_asset_ids selected_asset_count",
    "root.aggregates.phase_status_counts": "multi_phase_candidate unresolved_with_candidate",
    "root.aggregates.artifact_kind_counts": "plan operation_document unknown requirement design test_design test_source",
    "root.aggregates.legacy_implementation_counts": "unknown non_executable_read_only_source",
    "root.aggregates.implementation_evidence_counts": "document_present test_design_present_unexecuted non_executable_source_snapshot test_source_present_unexecuted",
    "root.aggregates.product_status_counts": "candidate_needs_semantic_review unresolved",
    "root.aggregates.candidate_product_target_sets": "empty all_four harness_only os_only harness_os_webos",
    "root.aggregates.product_occurrences": "HELIX-HARNESS HELIX-OS HELIX-Web HELIX-Web-OS",
    "root.aggregates.asset_disposition_counts": "Historical/unresolved RequirementSourceSnapshot/source_snapshot_preservation",
    "root.aggregates.consumer_closure_counts": "pending",
    "root.failure_residual": "status selected_asset_execution_receipts selected_asset_legacy_execution_all_false current_failure_status current_implementation_status degradation_status observed unknown",
    "root.consumer_residual": "status ledger_consumer_refs runtime_consumer_refs consumer_closed_assets observed unknown",
    "root.consumer_residual.ledger_consumer_refs": "LEGACY-ASSET-18F7940E7994634D39A1",
    "root.consumer_residual.runtime_consumer_refs": "",
    "root.decisions": "selected_asset_ids matching_append_only_records effect adoption owner_assigned successor_assigned human_rehome_pending",
    "root.verification_contract": "archive_read_only old_runtime_test_ci_execution current_source_sha_and_line_span_required legacy_source_sha_line_count_and_anchor_required ledger_state_reconciliation_required unknowns_explicit negative_cases",
}


def validate_nested_keys(data: dict) -> list[str]:
    errors: list[str] = []

    def walk(value: object, path: str) -> None:
        expected = EXPECTED_NESTED_KEYS.get(path)
        if path == "root.legacy_assets[]" and isinstance(value, dict) and value.get("asset_id") == "LEGACY-ASSET-18F7940E7994634D39A1":
            expected += " source_authority_state target_authority_state"
        if expected is not None:
            if not isinstance(value, dict) or set(value) != set(expected.split()):
                errors.append("E_NESTED_KEYS:" + path)
        if isinstance(value, dict):
            for key, child in value.items():
                walk(child, path + "." + str(key))
        elif isinstance(value, list):
            for child in value:
                if isinstance(child, (dict, list)):
                    walk(child, path + "[]")

    walk(data, "root")
    return errors


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_digest(path: Path) -> str:
    return digest(path.read_bytes())


def span_digest(path: Path, start: int, end: int) -> str:
    lines = path.read_text(encoding="utf-8").splitlines()
    return digest("\n".join(lines[start - 1:end]).encode())


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def fail(errors: list[str], condition: bool, code: str) -> None:
    if not condition:
        errors.append(code)


def validate(data: dict, check_files: bool = True) -> list[str]:
    errors: list[str] = validate_nested_keys(data)
    expected_root = {"schema", "status", "authority_effect", "meaning_change_applied", "successor_requirement_ids", "human_decision_ref", "equivalence_claim", "old_runtime_test_ci_execution", "new_build_allowed", "base", "phase_record", "ledger_provenance", "current_evidence", "products", "connections", "legacy_assets", "aggregates", "failure_residual", "consumer_residual", "decisions", "unknowns", "prohibited_inference", "verification_contract"}
    fail(errors, set(data) == expected_root, "E_ROOT_KEYS")
    fail(errors, data.get("schema") == "SCF-PHCAP-01-STATIC-RESEARCH-v1", "E_SCHEMA")
    for key, expected in (("authority_effect", "none"), ("meaning_change_applied", False), ("successor_requirement_ids", []), ("human_decision_ref", None), ("equivalence_claim", None), ("old_runtime_test_ci_execution", False), ("new_build_allowed", False)):
        fail(errors, data.get(key) == expected, "E_BOUNDARY_" + key.upper())
    base = data.get("base", {})
    fail(errors, set(base) == {"origin_main_commit", "branch", "worktree", "captured_at", "source_revision"}, "E_BASE_KEYS")
    fail(errors, base.get("origin_main_commit") == ORIGIN, "E_ORIGIN")
    fail(errors, base.get("branch") == "detached-origin/main", "E_BRANCH")
    phase = data.get("phase_record", {})
    for key, expected in (("task_id", "PHCAP-01"), ("phase", "concept_l1"), ("current_status", "approved_current"), ("legacy_capability_status", "documented_and_governed"), ("transition_assessment", "rederived_current"), ("new_build_allowed", False), ("authority_effect", "inventory_and_work_projection_only")):
        fail(errors, phase.get(key) == expected, "E_PHASE_" + key.upper())
    fail(errors, phase.get("product_targets") == PRODUCTS, "E_PHASE_PRODUCTS")
    fail(errors, phase.get("current_refs") == EXPECTED_PHASE_REFS, "E_PHASE_REFS")

    prov = data.get("ledger_provenance", {})
    prov_expected = {
        "phase_inventory": ("docs/governance/phase-capability-inventory.json", "9face795f98c660bec02d46106f08a25ba189633f6b555b563a0c7951e173f0c", 20),
        "asset_disposition": ("docs/governance/legacy-asset-disposition.jsonl", "cd73ac407937ad86c6be2c0b27d70863b1873fe39c2d6c0f89620e648dccad8c", 4020),
        "phase_product_classification": ("docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl", "2188f236cb7ed316772ee1fcf413f3b098f702cb4c9d9b3dad09a72db7468c1f", 4020),
        "decisions": ("docs/governance/legacy-asset-decisions.jsonl", "cbf7c18fbf0faea7745677091d440e40ba48345740a786404258e705a3cbd59f", 58),
    }
    fail(errors, set(prov) == set(prov_expected), "E_PROVENANCE_KEYS")
    if check_files:
        phase_file = ROOT / "docs/governance/phase-capability-inventory.json"
        if phase_file.is_file():
            phase_records = json.loads(phase_file.read_text(encoding="utf-8")).get("records", [])
            phase_source = next((x for x in phase_records if x.get("task_id") == "PHCAP-01"), None)
            fail(errors, phase_source is not None, "E_PHASE_RECORD_MISSING")
            if phase_source:
                legacy_source = phase_source.get("legacy", {})
                expected_phase_fields = {
                    "task_id": phase_source.get("task_id"), "phase": phase_source.get("phase"),
                    "title": phase_source.get("title"), "product_targets": phase_source.get("product_targets"),
                    "current_status": phase_source.get("current", {}).get("status"),
                    "evidence_products": phase_source.get("current", {}).get("evidence_products"),
                    "current_refs": phase_source.get("current", {}).get("refs"),
                    "scaffold": phase_source.get("scaffold"), "legacy_exists": legacy_source.get("exists"),
                    "legacy_layers_evidenced": legacy_source.get("layers_evidenced"),
                    "legacy_maximum_layer_evidenced": legacy_source.get("maximum_layer_evidenced"),
                    "legacy_capability_status": legacy_source.get("capability_status"),
                    "transition_assessment": phase_source.get("transition_assessment"),
                    "gaps": phase_source.get("gaps"), "new_build_allowed": phase_source.get("new_build_allowed"),
                    "authority_effect": phase_source.get("authority_effect"),
                }
                for key, value in expected_phase_fields.items():
                    fail(errors, phase.get(key) == value, "E_PHASE_SNAPSHOT_" + key.upper())
        for key, (path, sha, records) in prov_expected.items():
            entry = prov.get(key, {})
            fail(errors, (entry.get("path"), entry.get("sha256"), entry.get("records")) == (path, sha, records), "E_PROVENANCE_META_" + key)
            p = ROOT / path
            fail(errors, p.is_file(), "E_MISSING_" + key)
            if p.is_file():
                fail(errors, file_digest(p) == sha, "E_DIGEST_" + key)
                observed_records = len(json.loads(p.read_text(encoding="utf-8")).get("records", [])) if p.suffix == ".json" else sum(1 for line in p.read_text(encoding="utf-8").splitlines() if line.strip())
                fail(errors, observed_records == records, "E_RECORDS_" + key)
    current = data.get("current_evidence", {})
    fail(errors, current.get("approval_record_sha256") == CURRENT_REFS["CUR-DECISION"][2], "E_APPROVAL_DIGEST")
    fail(errors, current.get("approval_status") == "approved_exact_revision", "E_APPROVAL_STATUS")
    for key in ("l2_l11_applied", "implementation_status", "degradation_status", "acceptance_status", "operation_status"):
        expected = {"l2_l11_applied": False, "implementation_status": "unknown", "degradation_status": "not_established", "acceptance_status": "unknown", "operation_status": "unknown"}[key]
        fail(errors, current.get(key) == expected, "E_CURRENT_" + key.upper())
    refs = current.get("refs", [])
    fail(errors, [r.get("ref_id") for r in refs] == list(CURRENT_REFS), "E_CURRENT_REF_IDS")
    if check_files:
        for ref in refs:
            expected = CURRENT_REFS.get(ref.get("ref_id"))
            fail(errors, expected is not None, "E_CURRENT_REF_UNKNOWN")
            if not expected:
                continue
            product, path, sha, lines, start, end, span = expected
            p = ROOT / path
            fail(errors, (ref.get("product"), ref.get("path"), ref.get("sha256"), ref.get("line_count"), ref.get("line_start"), ref.get("line_end"), ref.get("span_sha256")) == (product, path, sha, lines, start, end, span), "E_CURRENT_REF_META_" + ref["ref_id"])
            if p.is_file():
                fail(errors, file_digest(p) == sha, "E_CURRENT_FILE_" + ref["ref_id"])
                fail(errors, len(p.read_text(encoding="utf-8").splitlines()) == lines, "E_CURRENT_LINES_" + ref["ref_id"])
                fail(errors, span_digest(p, start, end) == span, "E_CURRENT_SPAN_" + ref["ref_id"])

    products = data.get("products", [])
    fail(errors, [p.get("product") for p in products] == PRODUCTS, "E_PRODUCT_ORDER")
    for p in products:
        expected_meaning = EXPECTED_PRODUCT_MEANINGS.get(p.get("product"))
        fail(errors, expected_meaning is not None, "E_PRODUCT_UNKNOWN")
        if expected_meaning:
            fail(errors, (p.get("unit_id"), p.get("l1_ref"), p.get("responsibility")) == (expected_meaning["unit_id"], expected_meaning["l1_ref"], expected_meaning["responsibility"]), "E_PRODUCT_MEANING_" + p["product"])
            source_ref = current.get("refs", [])
            ref = next((r for r in source_ref if r.get("ref_id") == expected_meaning["l1_ref"]), None)
            fail(errors, ref is not None, "E_PRODUCT_SOURCE_REF_" + p["product"])
            if ref and check_files:
                source_path = ROOT / ref["path"]
                source_text = source_path.read_text(encoding="utf-8") if source_path.is_file() else ""
                fail(errors, all(marker in source_text for marker in expected_meaning["markers"]), "E_PRODUCT_SOURCE_MEANING_" + p["product"])
        fail(errors, p.get("authority_status") == "none", "E_PRODUCT_AUTHORITY")
        fail(errors, p.get("current_implementation_status") == "unknown", "E_PRODUCT_IMPLEMENTATION")
        fail(errors, p.get("degradation_status") == "not_established", "E_PRODUCT_DEGRADATION")
        fail(errors, p.get("operation_status") == "unknown", "E_PRODUCT_OPERATION")
    connections = data.get("connections", [])
    fail(errors, len(connections) == 3, "E_CONNECTION_COUNT")
    fail(errors, all(c.get("status") == "candidate_unresolved" and c.get("authority_effect") == "none" for c in connections), "E_CONNECTION_BOUNDARY")
    fail(errors, [c.get("connection_id") for c in connections] == list(EXPECTED_CONNECTIONS), "E_CONNECTION_ORDER")
    for connection in connections:
        expected_connection = EXPECTED_CONNECTIONS.get(connection.get("connection_id"))
        fail(errors, expected_connection is not None, "E_CONNECTION_UNKNOWN")
        if expected_connection:
            fail(errors, (connection.get("from"), connection.get("to"), connection.get("relation"), connection.get("meaning")) == expected_connection, "E_CONNECTION_SEMANTICS_" + connection["connection_id"])

    selected = data.get("legacy_assets", [])
    fail(errors, [a.get("asset_id") for a in selected] == ASSET_IDS, "E_ASSET_ORDER")
    if check_files:
        disp = {x["asset_id"]: x for x in read_jsonl(ROOT / "docs/governance/legacy-asset-disposition.jsonl")}
        cls = {x["asset_id"]: x for x in read_jsonl(ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl")}
        decisions = read_jsonl(ROOT / "docs/governance/legacy-asset-decisions.jsonl")
        selected_decisions = [x for x in decisions if x.get("asset_id") in ASSET_IDS]
        fail(errors, len(selected_decisions) == 2 and {x.get("decision_id") for x in selected_decisions} == {"REQ-SNAPSHOT-18F7940E7994634D39A1", "REQ-SNAPSHOT-CORRECTION-18F7940E7994634D39A1"}, "E_DECISION_MATCHES")
        decision_summary = data.get("decisions", {})
        fail(errors, decision_summary.get("selected_asset_ids") == ASSET_IDS, "E_DECISION_ASSET_SET")
        fail(errors, decision_summary.get("matching_append_only_records") == ["REQ-SNAPSHOT-18F7940E7994634D39A1", "REQ-SNAPSHOT-CORRECTION-18F7940E7994634D39A1"], "E_DECISION_RECORD_SET")
        for asset in selected:
            aid = asset.get("asset_id")
            expected = EXPECTED_ASSET.get(aid)
            fail(errors, expected is not None, "E_ASSET_UNKNOWN")
            if not expected:
                continue
            classification, kind, lines, asset_class, disposition, impl = expected
            fail(errors, (asset.get("classification_id"), asset.get("artifact_kind"), asset.get("source_line_count"), asset.get("ledger_asset_class"), asset.get("ledger_disposition"), asset.get("implementation_status")) == expected, "E_ASSET_META_" + aid)
            record = cls.get(aid, {})
            ledger = disp.get(aid, {})
            fail(errors, record.get("classification_id") == classification, "E_CLASSIFICATION_" + aid)
            fail(errors, record.get("legacy_execution_performed") is False and record.get("consumer_closure_status") == "pending", "E_CLASSIFICATION_BOUNDARY_" + aid)
            fail(errors, asset.get("legacy_execution_performed") is False and asset.get("consumer_closure_status") == "pending", "E_ASSET_EXECUTION_BOUNDARY_" + aid)
            fail(errors, asset.get("candidate_phases") == record.get("candidate_phase_targets"), "E_PHASE_TARGETS_" + aid)
            fail(errors, asset.get("candidate_products") == record.get("candidate_product_targets"), "E_PRODUCT_TARGETS_" + aid)
            fail(errors, asset.get("phase_status") == record.get("phase_classification_status") and asset.get("product_status") == record.get("product_classification_status"), "E_CLASSIFICATION_STATUS_" + aid)
            fail(errors, asset.get("implementation_evidence_state") == record.get("implementation_evidence_state"), "E_IMPLEMENTATION_EVIDENCE_" + aid)
            fail(errors, ledger.get("asset_class") == asset_class and ledger.get("disposition") == disposition and ledger.get("implementation_status") == impl, "E_LEDGER_STATE_" + aid)
            fail(errors, asset.get("archive_path") == ARCHIVE_PREFIX + asset.get("source_path", ""), "E_ARCHIVE_PATH_" + aid)
            p = ROOT / asset.get("archive_path", "")
            fail(errors, p.is_file(), "E_ARCHIVE_MISSING_" + aid)
            if p.is_file():
                fail(errors, file_digest(p) == asset.get("source_sha256"), "E_ARCHIVE_DIGEST_" + aid)
                fail(errors, len(p.read_text(encoding="utf-8").splitlines()) == lines, "E_ARCHIVE_LINES_" + aid)
                for anchor in asset.get("source_anchors", []):
                    fail(errors, span_digest(p, anchor["start"], anchor["end"]) == anchor["sha256"], "E_ANCHOR_" + anchor["id"])
        phcap_records = [x for x in cls.values() if "PHCAP-01" in x.get("candidate_phase_targets", [])]
        fail(errors, len(phcap_records) == data.get("aggregates", {}).get("phase_candidate_count"), "E_REDERIVE_PHASE_COUNT")
        phase_counts = Counter(x.get("phase_classification_status") for x in phcap_records)
        product_counts = Counter(x.get("product_classification_status") for x in phcap_records)
        fail(errors, dict(phase_counts) == data.get("aggregates", {}).get("phase_status_counts"), "E_REDERIVE_PHASE_STATUS")
        fail(errors, dict(product_counts) == data.get("aggregates", {}).get("product_status_counts"), "E_REDERIVE_PRODUCT_STATUS")
        kind_counts = Counter(x.get("artifact_evidence_kind") for x in phcap_records)
        fail(errors, dict(kind_counts) == data.get("aggregates", {}).get("artifact_kind_counts"), "E_REDERIVE_ARTIFACT_KIND")
        impl_counts = Counter(x.get("legacy_implementation_status") for x in phcap_records)
        evidence_counts = Counter(x.get("implementation_evidence_state") for x in phcap_records)
        fail(errors, dict(impl_counts) == data.get("aggregates", {}).get("legacy_implementation_counts"), "E_REDERIVE_IMPLEMENTATION")
        fail(errors, dict(evidence_counts) == data.get("aggregates", {}).get("implementation_evidence_counts"), "E_REDERIVE_EVIDENCE")
    agg = data.get("aggregates", {})
    expected_agg = {"phase_candidate_count": 45, "phase_status_counts": {"multi_phase_candidate": 29, "unresolved_with_candidate": 16}, "product_status_counts": {"candidate_needs_semantic_review": 26, "unresolved": 19}, "selected_asset_count": 8, "decision_match_count": 2}
    for key, expected in expected_agg.items():
        fail(errors, agg.get(key) == expected, "E_AGG_" + key.upper())
    fail(errors, data.get("failure_residual", {}).get("selected_asset_execution_receipts") == 0 and data.get("failure_residual", {}).get("selected_asset_legacy_execution_all_false") is True, "E_FAILURE_BOUNDARY")
    fail(errors, data.get("consumer_residual", {}).get("consumer_closed_assets") == 0 and data.get("consumer_residual", {}).get("runtime_consumer_refs") == {}, "E_CONSUMER_BOUNDARY")
    fail(errors, isinstance(data.get("unknowns"), list) and len(data["unknowns"]) == 6, "E_UNKNOWNS")
    fail(errors, data.get("prohibited_inference") == EXPECTED_PROHIBITED_INFERENCE, "E_PROHIBITED_INFERENCE")
    dec = data.get("decisions", {})
    fail(errors, dec.get("effect") == "source_snapshot_history_only" and dec.get("adoption") is False and dec.get("owner_assigned") is False and dec.get("successor_assigned") is False, "E_DECISION_BOUNDARY")
    contract = data.get("verification_contract", {})
    fail(errors, contract.get("archive_read_only") is True and contract.get("old_runtime_test_ci_execution") is False and contract.get("unknowns_explicit") is True, "E_VERIFICATION_BOUNDARY")
    return errors


def main() -> int:
    try:
        data = json.loads(INV_PATH.read_text(encoding="utf-8"))
    except Exception as exc:
        print("FAIL PHCAP-01 inventory load:", exc)
        return 1
    errors = validate(data)
    if errors:
        print("FAIL PHCAP-01 static research validator")
        print(" ".join(errors))
        return 1
    print("PASS PHCAP-01 static research validator: Concept/L1, four products, 8 legacy assets, 45 phase candidates")
    return 0


if __name__ == "__main__":
    sys.exit(main())
