#!/usr/bin/env python3
"""PHCAP-12/13 fail-closed static research premise validator."""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INV_PATH = HERE / "inventory.json"
BINDING_PATH = ROOT / "scaffold/bindings/SCF-B-0046.json"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
ORIGIN = "fbeee47920ed8b2992ae123b00c224ff88987c50"
ASSET_IDS = [
    "LEGACY-ASSET-D107FD145A2588FAAD09",
    "LEGACY-ASSET-D6816E22DAF2E990410B",
    "LEGACY-ASSET-4FED0B46C22941761357",
    "LEGACY-ASSET-188DE92635DFB97B0200",
    "LEGACY-ASSET-50A93B0E753DC3840E03",
    "LEGACY-ASSET-A2E186B3A66077923537",
    "LEGACY-ASSET-8686BB8CF396BAF57F2E",
    "LEGACY-ASSET-0CC674CB78470B86E7A8",
    "LEGACY-ASSET-EA1DFC00D984068C2444",
]
PHASE_IDS = ("PHCAP-12", "PHCAP-13")
EXPECTED_ROOT_KEYS = {
    "schema", "status", "authority_effect", "meaning_change_applied", "successor_requirement_ids",
    "human_decision_ref", "equivalence_claim", "old_runtime_test_ci_execution", "base",
    "ledger_provenance", "tasks", "scope", "product_units", "candidate_connections",
    "candidate_phase_joins", "legacy_phase_assessment", "current_evidence", "failure_consumer_residual",
    "unresolved", "verification_contract", "counts",
}
EXPECTED_DECISION_MATCHING_ASSET_IDS = []
EXPECTED_DECISION_MATCHING_ASSET_IDS_DIGEST = "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945"
EXPECTED_FAILURE_CONSUMER_INTERPRETATION = "historical source failure/consumer descriptions remain candidate evidence; current execution, read-after, and closure are unknown"
EXPECTED_FAILURE_CONSUMER_INTERPRETATION_DIGEST = "d224531d8093b7fcfcd991a4bb29ac0163170f7e74ece6f0a380648000c1d1db"
EXPECTED_KEYSETS = {
    "root": frozenset(EXPECTED_ROOT_KEYS),
    "root.base": frozenset({"branch", "captured_at", "commit", "origin", "rebaseline_rule", "repository", "worktree"}),
    "root.ledger_provenance": frozenset({"asset_ledger_path", "asset_ledger_sha256", "asset_record_count", "decision_ledger_path", "decision_ledger_sha256", "decision_record_count", "matching_decision_record_count", "phase_classification_path", "phase_classification_sha256", "phase_inventory_path", "phase_inventory_sha256", "phase_record_count", "selected_asset_count"}),
    "root.tasks[]": frozenset({"phase_record_snapshot", "task_id"}),
    "root.tasks[].phase_record_snapshot": frozenset({"authority_effect", "current", "gaps", "legacy", "new_build_allowed", "phase", "product_targets", "scaffold", "task_id", "title", "transition_assessment"}),
    "root.tasks[].phase_record_snapshot.current": frozenset({"evidence_products", "refs", "status"}),
    "root.tasks[].phase_record_snapshot.legacy": frozenset({"assessment", "capability_status", "exists", "layers_evidenced", "maximum_layer_evidenced", "representative_assets"}),
    "root.tasks[].phase_record_snapshot.legacy.representative_assets[]": frozenset({"asset_id", "implementation_status", "source_path"}),
    "root.scope": frozenset({"candidate_asset_counts", "closure_rule", "legacy_asset_ids", "phase_ids", "product_targets", "selected_source_asset_count", "source_anchor_count"}),
    "root.scope.candidate_asset_counts": frozenset({"PHCAP-12", "PHCAP-13", "both", "either"}),
    "root.product_units[]": frozenset({"acceptance_status", "authority_status", "current_capability", "current_evidence_status", "current_implementation_status", "current_ref_ids", "legacy_asset_ids", "legacy_transition_status", "product", "status", "unit_id", "unresolved"}),
    "root.candidate_connections[]": frozenset({"authority_effect", "edge_id", "from", "kind", "meaning", "status", "to"}),
    "root.candidate_phase_joins[]": frozenset({"interpretation", "phase_id", "selected_asset_ids"}),
    "root.legacy_phase_assessment": frozenset({"assets", "decision_matching_asset_ids", "phase_summary_is_historical_only"}),
    "root.legacy_phase_assessment.assets[]": frozenset({"archive_path", "artifact_evidence_kind", "asset_id", "consumer_evidence", "decision_history", "failure_evidence", "implementation_evidence_state", "ledger_snapshot", "legacy_layers", "phase_classification_snapshot", "source_anchors", "source_line_count", "source_path", "source_revision", "source_sha256"}),
    "root.legacy_phase_assessment.assets[].legacy_layers[]": frozenset({"confidence", "evidence", "phase", "source_batches"}),
    "root.legacy_phase_assessment.assets[].ledger_snapshot": frozenset({"asset_class", "authority_status", "consumer_refs", "decision_record_ref", "disposition", "executability_status", "external_effect_status", "implementation_status", "product_target", "reuse_exclusion_class", "revision", "source_path", "source_revision", "source_sha256"}),
    "root.legacy_phase_assessment.assets[].phase_classification_snapshot": frozenset({"archive_manifest_digest_match", "artifact_evidence_kind", "asset_id", "authority_effect", "candidate_phase_targets", "candidate_product_targets", "classification_id", "consumer_closure_status", "consumer_refs", "implementation_evidence_state", "legacy_execution_performed", "legacy_implementation_status", "phase_assessments", "phase_classification_status", "product_assessments", "product_classification_status", "source_path", "source_revision", "source_sha256", "unresolved"}),
    "root.legacy_phase_assessment.assets[].phase_classification_snapshot.phase_assessments[]": frozenset({"confidence", "evidence", "phase", "source_batches"}),
    "root.legacy_phase_assessment.assets[].phase_classification_snapshot.product_assessments[]": frozenset({"confidence", "evidence_status", "product", "rationale", "source_batches"}),
    "root.legacy_phase_assessment.assets[].decision_history": frozenset({"matching_count", "matching_records", "status"}),
    "root.legacy_phase_assessment.assets[].source_anchors[]": frozenset({"anchor_id", "exact_text", "line_end", "line_start", "meaning", "sha256"}),
    "root.legacy_phase_assessment.assets[].failure_evidence": frozenset({"anchor_ids", "execution_receipts", "finding", "status"}),
    "root.legacy_phase_assessment.assets[].consumer_evidence": frozenset({"anchor_ids", "candidates", "consumer_refs", "finding", "status"}),
    "root.current_evidence": frozenset({"acceptance_status", "implementation_status", "operation_status", "refs", "scaffold_context"}),
    "root.current_evidence.refs[]": frozenset({"classification", "end_line", "exact_text", "execution_status", "implementation_status", "layer", "line_sha256", "path", "product", "ref_id", "role", "sha256", "start_line"}),
    "root.current_evidence.scaffold_context": frozenset({"acceptance_status", "authority_effect", "binding_id", "implementation_status", "meaning", "path", "sha256", "state"}),
    "root.failure_consumer_residual": frozenset({"consumer_candidates", "consumer_closure_status", "failure_execution_receipts", "interpretation", "interpretation_sha256", "selected_asset_consumer_refs"}),
    "root.failure_consumer_residual.consumer_candidates[]": frozenset({"authority_effect", "candidate_input", "closure_status", "consumer_id", "evidence_status", "observed", "product"}),
    "root.verification_contract": frozenset({"evidence_kind", "negative_cases"}),
    "root.counts": frozenset({"candidate_connections", "candidate_phase_joins", "consumer_candidates", "current_refs", "decision_records_found", "failure_execution_receipts", "legacy_consumer_refs_observed", "product_units", "selected_legacy_assets", "source_anchors"}),
}
EXPECTED_UNRESOLVED = [
    "PHCAP-12 review receipt schema、delivery、再開、provider boundaryの正式化",
    "PHCAP-13 canonical merge admission、current CI、DB convergence、main read-afterの再導出",
    "HARNESSとOSのunit／connection／composite splitと正式owner",
    "Web／Web-OSのdirect evidence、service scope、consumer identity",
    "旧sourceのimplemented／test design記述と現行implementation statusの差分",
    "failure finding、receipt、consumer read-after、closureの現行証拠",
    "旧assetの意味再利用、再導出、置換、退役に関する人間decision",
    "L2/L11 adoption、successor requirement、正式なacceptanceとrelease境界",
]
EXPECTED_NEGATIVE_CASES = [
    "authority、successor、human decision、equivalenceを候補から生成する",
    "current implementation、operation、acceptance、product ownerをunknownから昇格する",
    "Web／Web-OSの隣接refをPHCAP-12/13 direct evidenceへ昇格する",
    "old source／test／runtimeをexecution、oracle、pass、fallbackへ昇格する",
    "consumer candidate、pending、failure receipt 0をclosureへ変換する",
    "unit／connection候補をapproved authority、shared writer、shared stateへ変換する",
    "unit capability／transition、connection meaning、phase join interpretationを反転する",
    "phase candidate joinをadmission、successor、要求採否へ変換する",
    "source／ledger/current ref digestまたはexact anchorを改変する",
    "origin/main変更後にrebaselineなしでcandidateをcurrent扱いする",
]
EXPECTED_CURRENT_REF_IDS = {
    "BOUNDARY-UNIT-CONNECTION", "OS-REVIEW-HANDOFF", "GITHUB-UPSTREAM-MODEL", "MERGE-REHOST-ASSESSMENT",
    "HARNESS-L2", "OS-L2", "WEB-L2", "WEBOS-L2", "HARNESS-L11", "OS-L11", "WEB-L11", "WEBOS-L11",
}
EXPECTED_EDGE_IDS = {
    "CONN-HARNESS-OS-REVIEW-CONTRACT", "CONN-OS-HARNESS-RECEIPT-PROJECTION", "CONN-OS-WEB-PROJECT-RESULT",
    "CONN-WEB-WEBOS-SERVICE-REQUEST", "CONN-WEBOS-OS-OBSERVATION-EXPORT",
}
EXPECTED_UNIT_IDS = {
    "PHCAP12-13-UNIT-HARNESS", "PHCAP12-13-UNIT-OS", "PHCAP12-13-UNIT-WEB", "PHCAP12-13-UNIT-WEBOS",
}
EXPECTED_UNIT_KEYS = {
    "unit_id", "product", "status", "current_capability", "current_evidence_status",
    "current_implementation_status", "legacy_transition_status", "authority_status",
    "acceptance_status", "current_ref_ids", "legacy_asset_ids", "unresolved",
}
EXPECTED_UNIT_REF_IDS = {
    "PHCAP12-13-UNIT-HARNESS": ["BOUNDARY-UNIT-CONNECTION", "HARNESS-L2", "HARNESS-L11"],
    "PHCAP12-13-UNIT-OS": [
        "BOUNDARY-UNIT-CONNECTION", "OS-REVIEW-HANDOFF", "GITHUB-UPSTREAM-MODEL",
        "MERGE-REHOST-ASSESSMENT", "OS-L2", "OS-L11",
    ],
    "PHCAP12-13-UNIT-WEB": ["BOUNDARY-UNIT-CONNECTION", "WEB-L2", "WEB-L11"],
    "PHCAP12-13-UNIT-WEBOS": ["BOUNDARY-UNIT-CONNECTION", "WEBOS-L2", "WEBOS-L11"],
}
EXPECTED_UNIT_MEANINGS = {
    "PHCAP12-13-UNIT-HARNESS": {
        "product": "HELIX-HARNESS",
        "status": "research_premise_candidate",
        "current_capability": "V-model review contract, evidence vocabulary, and merge-facing obligation candidate",
        "current_evidence_status": "direct_candidate_refs",
        "legacy_transition_status": "degraded_to_candidate_contract",
        "authority_status": "candidate_unresolved",
        "acceptance_status": "draft_unexecuted",
        "legacy_asset_ids": [
            "LEGACY-ASSET-D6816E22DAF2E990410B",
            "LEGACY-ASSET-8686BB8CF396BAF57F2E",
            "LEGACY-ASSET-0CC674CB78470B86E7A8",
        ],
        "unresolved": ["formal owner", "L2/L11 adoption", "current implementation", "consumer closure"],
    },
    "PHCAP12-13-UNIT-OS": {
        "product": "HELIX-OS",
        "status": "research_premise_candidate",
        "current_capability": "review handoff, progression, receipt/finding, and merge admission management candidate",
        "current_evidence_status": "direct_candidate_refs",
        "legacy_transition_status": "degraded_to_manual_or_candidate_contract",
        "authority_status": "candidate_unresolved",
        "acceptance_status": "draft_unexecuted",
        "legacy_asset_ids": [
            "LEGACY-ASSET-D107FD145A2588FAAD09",
            "LEGACY-ASSET-D6816E22DAF2E990410B",
            "LEGACY-ASSET-4FED0B46C22941761357",
            "LEGACY-ASSET-188DE92635DFB97B0200",
            "LEGACY-ASSET-50A93B0E753DC3840E03",
            "LEGACY-ASSET-A2E186B3A66077923537",
            "LEGACY-ASSET-8686BB8CF396BAF57F2E",
            "LEGACY-ASSET-0CC674CB78470B86E7A8",
            "LEGACY-ASSET-EA1DFC00D984068C2444",
        ],
        "unresolved": ["canonical receipt schema", "DB convergence", "current CI", "formal owner", "consumer closure"],
    },
    "PHCAP12-13-UNIT-WEB": {
        "product": "HELIX-Web",
        "status": "adjacent_boundary_only",
        "current_capability": "user-facing review/result presentation boundary candidate",
        "current_evidence_status": "adjacent_refs_only",
        "legacy_transition_status": "unresolved_adjacent_candidate",
        "authority_status": "adjacent_candidate_only",
        "acceptance_status": "draft_unexecuted",
        "legacy_asset_ids": ["LEGACY-ASSET-0CC674CB78470B86E7A8"],
        "unresolved": ["PHCAP-12/13 direct evidence", "owner", "review consumer", "implementation"],
    },
    "PHCAP12-13-UNIT-WEBOS": {
        "product": "HELIX-Web-OS",
        "status": "adjacent_boundary_only",
        "current_capability": "tenant/job/service observation boundary and permitted export candidate",
        "current_evidence_status": "adjacent_refs_only",
        "legacy_transition_status": "unresolved_adjacent_candidate",
        "authority_status": "adjacent_candidate_only",
        "acceptance_status": "draft_unexecuted",
        "legacy_asset_ids": [
            "LEGACY-ASSET-D6816E22DAF2E990410B",
            "LEGACY-ASSET-8686BB8CF396BAF57F2E",
            "LEGACY-ASSET-0CC674CB78470B86E7A8",
        ],
        "unresolved": ["service consumer scope", "credential/state separation", "implementation", "acceptance"],
    },
}
EXPECTED_EDGE_VALUES = {
    "CONN-HARNESS-OS-REVIEW-CONTRACT": {
        "from": "HELIX-HARNESS", "to": "HELIX-OS", "kind": "contract_to_progression",
        "status": "candidate", "authority_effect": "none",
        "meaning": "HARNESS review/evidence vocabulary may constrain OS progression and admission; no authority or implementation is inferred.",
    },
    "CONN-OS-HARNESS-RECEIPT-PROJECTION": {
        "from": "HELIX-OS", "to": "HELIX-HARNESS", "kind": "receipt_to_contract_feedback",
        "status": "candidate", "authority_effect": "none",
        "meaning": "OS receipt/finding projection may feed HARNESS contract review; a receipt does not create approval or acceptance.",
    },
    "CONN-OS-WEB-PROJECT-RESULT": {
        "from": "HELIX-OS", "to": "HELIX-Web", "kind": "project_to_user_result",
        "status": "adjacent_candidate", "authority_effect": "none",
        "meaning": "OS may expose scoped project/review result state to Web; Web has no WBS, ticket, or merge authority.",
    },
    "CONN-WEB-WEBOS-SERVICE-REQUEST": {
        "from": "HELIX-Web", "to": "HELIX-Web-OS", "kind": "user_request_to_service",
        "status": "adjacent_candidate", "authority_effect": "none",
        "meaning": "Web user operation may reach Web-OS service state through a bounded contract; tenant state and credentials remain separate.",
    },
    "CONN-WEBOS-OS-OBSERVATION-EXPORT": {
        "from": "HELIX-Web-OS", "to": "HELIX-OS", "kind": "scoped_observation_export",
        "status": "adjacent_candidate", "authority_effect": "none",
        "meaning": "Permitted service observation may be exported to OS improvement/review evidence; raw tenant data and writer authority are not shared.",
    },
}
EXPECTED_PHASE_JOIN_INTERPRETATION = "candidate phase join only; no admission, owner, or successor is generated"
EXPECTED_SCOPE_CLOSURE_RULE = "PHCAP-12/13 representative assets and current refs only; unselected asset, failure, consumer, and implementation closure remains residual"
EXPECTED_SCAFFOLD_MEANING = "GUI notification scaffold is a bounded operating projection; it does not establish independent review, canonical receipt, CI, DB convergence, merge authority, or requirement adoption"
EXPECTED_ANCHOR_MEANINGS = {
    "D107-01": "historical independent review boundary and sealed receipt contract",
    "D107-02": "historical non-runtime and later-slice boundary",
    "D681-01": "historical cross-review admission input and independence contract",
    "D681-02": "historical fail-close and receipt lifecycle candidate",
    "4FED-01": "historical review receipt and PLAN binding boundary",
    "4FED-02": "historical receipt evidence and terminal binding candidate",
    "188D-01": "historical review lane closure digest boundary",
    "188D-02": "historical closure manifest and provider material candidate",
    "50A9-01": "historical worker review system-test design and negative cases",
    "A2E-01": "historical review receipt/PLAN binding test fixture and cases",
    "A2E-02": "historical receipt drift and failure test cases",
    "8686-01": "historical merge admission requirement and same-HEAD receipt boundary",
    "8686-02": "historical merge readiness and identity gate candidate",
    "0CC6-01": "historical merge admission system-test design and negative cases",
    "EA1D-01": "historical GitHub cross-review admission input and decision envelope",
    "EA1D-02": "historical admission failure reasons and read-after candidate",
}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def line_text(path: Path, start: int, end: int) -> str | None:
    if not isinstance(start, int) or not isinstance(end, int):
        return None
    lines = path.read_text(encoding="utf-8").splitlines()
    if not (1 <= start <= end <= len(lines)):
        return None
    return "\n".join(lines[start - 1:end]) + "\n"


def ledger_snapshot(row: dict) -> dict:
    keys = [
        "revision", "source_revision", "source_path", "source_sha256", "asset_class",
        "reuse_exclusion_class", "product_target", "authority_status", "disposition",
        "implementation_status", "consumer_refs", "decision_record_ref", "executability_status",
        "external_effect_status",
    ]
    return {key: row.get(key) for key in keys}


def fail(errors: list[str], condition: bool, code: str) -> None:
    if not condition:
        errors.append(code)


def validate_keysets(data: object) -> list[str]:
    errors: list[str] = []

    def walk(value: object, path: str) -> None:
        expected = EXPECTED_KEYSETS.get(path)
        if expected is not None:
            if not isinstance(value, dict):
                errors.append("E_KEYSET_TYPE:" + path)
            elif set(value) != expected:
                errors.append("E_KEYSET:" + path)
        if isinstance(value, dict):
            for key, child in value.items():
                walk(child, path + "." + str(key))
        elif isinstance(value, list):
            for child in value:
                if isinstance(child, (dict, list)):
                    walk(child, path + "[]")

    walk(data, "root")
    return errors


def validate_binding(binding: dict) -> list[str]:
    errors: list[str] = []
    fail(errors, binding.get("id") == "SCF-B-0046", "E_BINDING_ID")
    fail(errors, binding.get("kind") == "scaffold", "E_BINDING_KIND")
    fail(errors, binding.get("state") == "registered", "E_BINDING_STATE")
    fail(errors, binding.get("product") == "HELIX-OS", "E_BINDING_PRODUCT")
    fail(errors, isinstance(binding.get("upstream"), list) and bool(binding.get("upstream")), "E_BINDING_UPSTREAM")
    for row in binding.get("upstream", []):
        path = ROOT / row.get("path", "")
        fail(errors, path.is_file(), "E_BINDING_MISSING:" + str(row.get("path")))
        if path.is_file():
            fail(errors, sha(path.read_bytes()) == row.get("sha256"), "E_BINDING_SHA:" + str(row.get("path")))
    for row in binding.get("artifacts", []):
        fail(errors, (ROOT / row).is_file(), "E_BINDING_ARTIFACT:" + str(row))
    return errors


def validate(data: dict, check_binding: bool = True) -> list[str]:
    errors: list[str] = validate_keysets(data)
    fail(errors, set(data) == EXPECTED_ROOT_KEYS, "E_ROOT_KEYSET")
    fail(errors, data.get("schema") == "phcap12-13-review-research/v1", "E_SCHEMA")
    fail(errors, data.get("status") == "research_premise_candidate", "E_STATUS")
    fail(errors, data.get("authority_effect") == "none", "E_AUTHORITY")
    fail(errors, data.get("meaning_change_applied") is False, "E_MEANING_CHANGE")
    fail(errors, data.get("successor_requirement_ids") == [] and data.get("human_decision_ref") is None, "E_DECISION_FIELDS")
    fail(errors, data.get("equivalence_claim") is None, "E_EQUIVALENCE")
    fail(errors, data.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")
    fail(errors, data.get("unresolved") == EXPECTED_UNRESOLVED, "E_UNRESOLVED")
    contract = data.get("verification_contract", {})
    fail(errors, contract.get("evidence_kind") == "scaffold", "E_EVIDENCE_KIND")
    fail(errors, contract.get("negative_cases") == EXPECTED_NEGATIVE_CASES, "E_NEGATIVE_CASES")

    base = data.get("base", {})
    fail(errors, base.get("commit") == ORIGIN and base.get("origin") == "origin/main", "E_BASE_ORIGIN")
    fail(errors, base.get("branch") == "research/phcap12-13-review", "E_BASE_BRANCH")
    fail(errors, isinstance(base.get("worktree"), str) and base.get("worktree"), "E_BASE_WORKTREE")
    fail(errors, "origin/main" in base.get("rebaseline_rule", "") and "rebaseline" in base.get("rebaseline_rule", ""), "E_REBASE_RULE")

    phase_inv_path = ROOT / "docs/governance/phase-capability-inventory.json"
    disp_path = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
    phase_path = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
    decision_path = ROOT / "docs/governance/legacy-asset-decisions.jsonl"
    provenance = data.get("ledger_provenance", {})
    source_paths = {
        "phase_inventory_path": phase_inv_path,
        "asset_ledger_path": disp_path,
        "phase_classification_path": phase_path,
        "decision_ledger_path": decision_path,
    }
    for key, path in source_paths.items():
        fail(errors, provenance.get(key) == str(path.relative_to(ROOT)), "E_PROVENANCE_PATH:" + key)
        digest_key = key.replace("_path", "_sha256")
        fail(errors, provenance.get(digest_key) == sha(path.read_bytes()), "E_PROVENANCE_SHA:" + key)
    disp_rows = jsonl(disp_path)
    phase_rows = jsonl(phase_path)
    decision_rows = jsonl(decision_path)
    fail(errors, provenance.get("asset_record_count") == len(disp_rows) == 4020, "E_ASSET_COUNT")
    fail(errors, provenance.get("phase_record_count") == len(phase_rows) == 4020, "E_PHASE_COUNT")
    fail(errors, provenance.get("decision_record_count") == len(decision_rows) == 58, "E_DECISION_COUNT")
    fail(errors, provenance.get("selected_asset_count") == 9, "E_SELECTED_COUNT")
    fail(errors, provenance.get("matching_decision_record_count") == 0, "E_MATCHING_DECISIONS")
    disp = {row.get("asset_id"): row for row in disp_rows}
    phase = {row.get("asset_id"): row for row in phase_rows}
    fail(errors, set(disp) >= set(ASSET_IDS) and set(phase) >= set(ASSET_IDS), "E_LEDGER_ASSETS")

    phase_inv = json.loads(phase_inv_path.read_text(encoding="utf-8"))
    phase_records = {row.get("task_id"): row for row in phase_inv.get("records", [])}
    tasks = data.get("tasks", [])
    fail(errors, [task.get("task_id") for task in tasks] == list(PHASE_IDS), "E_TASK_ORDER")
    for task in tasks:
        fail(errors, task.get("phase_record_snapshot") == phase_records.get(task.get("task_id")), "E_TASK_SNAPSHOT:" + str(task.get("task_id")))
        rec = task.get("phase_record_snapshot", {})
        fail(errors, rec.get("new_build_allowed") is False and rec.get("authority_effect") == "inventory_and_work_projection_only", "E_TASK_BOUNDARY:" + str(task.get("task_id")))

    scope = data.get("scope", {})
    fail(errors, scope.get("phase_ids") == list(PHASE_IDS), "E_SCOPE_PHASES")
    fail(errors, scope.get("product_targets") == ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"], "E_SCOPE_PRODUCTS")
    fail(errors, scope.get("legacy_asset_ids") == ASSET_IDS, "E_SCOPE_ASSETS")
    fail(errors, scope.get("selected_source_asset_count") == 9, "E_SCOPE_COUNT")
    fail(errors, scope.get("closure_rule") == EXPECTED_SCOPE_CLOSURE_RULE, "E_SCOPE_CLOSURE_RULE")
    phase12_ids = {row.get("asset_id") for row in phase_rows if "PHCAP-12" in row.get("candidate_phase_targets", [])}
    phase13_ids = {row.get("asset_id") for row in phase_rows if "PHCAP-13" in row.get("candidate_phase_targets", [])}
    fail(errors, scope.get("candidate_asset_counts") == {"PHCAP-12": len(phase12_ids), "PHCAP-13": len(phase13_ids), "both": len(phase12_ids & phase13_ids), "either": len(phase12_ids | phase13_ids)}, "E_CANDIDATE_ASSET_COUNTS")

    selected = data.get("legacy_phase_assessment", {}).get("assets", [])
    fail(errors, [item.get("asset_id") for item in selected] == ASSET_IDS, "E_ASSET_ORDER")
    fail(errors, len(selected) == 9 and scope.get("source_anchor_count") == sum(len(item.get("source_anchors", [])) for item in selected) == 16, "E_ANCHOR_COUNT")
    seen = set()
    for item in selected:
        aid = item.get("asset_id")
        old = disp.get(aid, {})
        cls = phase.get(aid, {})
        fail(errors, item.get("source_path") == old.get("source_path"), "E_ASSET_PATH:" + str(aid))
        fail(errors, item.get("source_sha256") == old.get("source_sha256"), "E_ASSET_LEDGER_SHA:" + str(aid))
        fail(errors, item.get("ledger_snapshot") == ledger_snapshot(old), "E_ASSET_LEDGER_SNAPSHOT:" + str(aid))
        fail(errors, item.get("phase_classification_snapshot") == cls, "E_ASSET_PHASE_SNAPSHOT:" + str(aid))
        fail(errors, old.get("asset_class") == "Historical" and old.get("authority_status") == "historical", "E_ASSET_HISTORICAL:" + str(aid))
        fail(errors, old.get("disposition") == "unresolved" and old.get("implementation_status") == "unknown", "E_ASSET_UNKNOWN:" + str(aid))
        fail(errors, old.get("consumer_refs") == [] and old.get("decision_record_ref") is None, "E_ASSET_CONSUMER_DECISION:" + str(aid))
        fail(errors, cls.get("legacy_execution_performed") is False and cls.get("consumer_closure_status") == "pending", "E_ASSET_EXECUTION_CLOSURE:" + str(aid))
        fail(errors, item.get("decision_history") == {"matching_count": 0, "matching_records": [], "status": "no_matching_append_only_decision_record"}, "E_ASSET_DECISION_HISTORY:" + str(aid))
        fail(errors, not [row for row in decision_rows if aid in json.dumps(row, ensure_ascii=False)], "E_ASSET_DECISION_MATCH:" + str(aid))
        archive_path = item.get("archive_path", "")
        source = ROOT / archive_path
        fail(errors, archive_path == ARCHIVE_PREFIX + item.get("source_path", "") and source.is_file(), "E_ARCHIVE:" + str(aid))
        if source.is_file():
            fail(errors, sha(source.read_bytes()) == item.get("source_sha256"), "E_SOURCE_SHA:" + str(aid))
            fail(errors, len(source.read_text(encoding="utf-8").splitlines()) == item.get("source_line_count"), "E_SOURCE_LINES:" + str(aid))
        anchors = item.get("source_anchors", [])
        for anchor in anchors:
            sid = anchor.get("anchor_id")
            fail(errors, sid not in seen, "E_ANCHOR_DUP:" + str(sid))
            seen.add(sid)
            actual = line_text(source, anchor.get("line_start"), anchor.get("line_end")) if source.is_file() else None
            fail(errors, actual is not None and actual == anchor.get("exact_text"), "E_ANCHOR_TEXT:" + str(sid))
            if actual is not None:
                fail(errors, sha(actual.encode("utf-8")) == anchor.get("sha256"), "E_ANCHOR_SHA:" + str(sid))
            fail(errors, anchor.get("meaning") == EXPECTED_ANCHOR_MEANINGS.get(sid), "E_ANCHOR_MEANING:" + str(sid))
        failure = item.get("failure_evidence", {})
        consumer = item.get("consumer_evidence", {})
        fail(errors, failure.get("status") == "source_contract_only_unexecuted" and failure.get("execution_receipts") == 0, "E_FAILURE_BOUNDARY:" + str(aid))
        fail(errors, consumer.get("status") == "candidate_only_closure_pending" and consumer.get("consumer_refs") == [], "E_CONSUMER_BOUNDARY:" + str(aid))
        local_ids = {a.get("anchor_id") for a in anchors}
        fail(errors, set(failure.get("anchor_ids", [])) <= local_ids and set(consumer.get("anchor_ids", [])) <= local_ids, "E_EVIDENCE_ANCHORS:" + str(aid))

    decision_matching_asset_ids = data.get("legacy_phase_assessment", {}).get("decision_matching_asset_ids")
    fail(errors, decision_matching_asset_ids == EXPECTED_DECISION_MATCHING_ASSET_IDS, "E_DECISION_MATCHING_ASSET_IDS")
    fail(errors, sha(json.dumps(decision_matching_asset_ids, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")) == EXPECTED_DECISION_MATCHING_ASSET_IDS_DIGEST, "E_DECISION_MATCHING_ASSET_IDS_DIGEST")

    refs = data.get("current_evidence", {}).get("refs", [])
    fail(errors, len(refs) == 12 and {ref.get("ref_id") for ref in refs} == EXPECTED_CURRENT_REF_IDS, "E_CURRENT_REF_SET")
    seen_refs = set()
    for ref in refs:
        rid = ref.get("ref_id")
        fail(errors, rid not in seen_refs, "E_CURRENT_REF_DUP:" + str(rid))
        seen_refs.add(rid)
        path = ROOT / ref.get("path", "")
        fail(errors, path.is_file(), "E_CURRENT_REF_FILE:" + str(rid))
        if path.is_file():
            text = line_text(path, ref.get("start_line"), ref.get("end_line"))
            fail(errors, sha(path.read_bytes()) == ref.get("sha256"), "E_CURRENT_REF_SHA:" + str(rid))
            fail(errors, text is not None and text == ref.get("exact_text"), "E_CURRENT_REF_TEXT:" + str(rid))
            if text is not None:
                fail(errors, sha(text.encode("utf-8")) == ref.get("line_sha256"), "E_CURRENT_REF_LINE_SHA:" + str(rid))
        fail(errors, ref.get("implementation_status") == "not_evidence" and ref.get("execution_status") == "not_run", "E_CURRENT_REF_PROMOTION:" + str(rid))
    current = data.get("current_evidence", {})
    fail(errors, current.get("implementation_status") == "unknown" and current.get("operation_status") == "unknown" and current.get("acceptance_status") == "unknown", "E_CURRENT_UNKNOWN")
    scaffold = current.get("scaffold_context", {})
    scf_path = ROOT / "scaffold/bindings/SCF-B-0003.json"
    fail(errors, scaffold.get("binding_id") == "SCF-B-0003" and scaffold.get("path") == "scaffold/bindings/SCF-B-0003.json", "E_SCAFFOLD_CONTEXT_ID")
    fail(errors, scf_path.is_file() and scaffold.get("sha256") == sha(scf_path.read_bytes()), "E_SCAFFOLD_CONTEXT_SHA")
    fail(errors, scaffold.get("state") == "active" and scaffold.get("authority_effect") == "none", "E_SCAFFOLD_CONTEXT_STATE")
    fail(errors, scaffold.get("implementation_status") == "scaffold_only" and scaffold.get("acceptance_status") == "unknown", "E_SCAFFOLD_CONTEXT_PROMOTION")
    fail(errors, scaffold.get("meaning") == EXPECTED_SCAFFOLD_MEANING, "E_SCAFFOLD_CONTEXT_MEANING")

    units = data.get("product_units", [])
    fail(errors, {unit.get("unit_id") for unit in units} == EXPECTED_UNIT_IDS and len(units) == 4, "E_UNIT_SET")
    by_product = {unit.get("product"): unit for unit in units}
    fail(errors, set(by_product) == {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"}, "E_UNIT_PRODUCTS")
    for unit in units:
        uid = unit.get("unit_id")
        fail(errors, set(unit) == EXPECTED_UNIT_KEYS, "E_UNIT_KEYSET:" + str(uid))
        fail(errors, unit.get("current_ref_ids") == EXPECTED_UNIT_REF_IDS.get(uid), "E_UNIT_REFS:" + str(uid))
        expected_meanings = EXPECTED_UNIT_MEANINGS.get(uid, {})
        for field, expected_value in expected_meanings.items():
            fail(errors, unit.get(field) == expected_value, "E_UNIT_MEANING:" + str(uid) + ":" + field)
        fail(errors, unit.get("current_implementation_status") == "unknown", "E_UNIT_IMPL:" + str(uid))
        fail(errors, unit.get("authority_status") in {"candidate_unresolved", "adjacent_candidate_only"}, "E_UNIT_AUTHORITY:" + str(uid))
        fail(errors, unit.get("acceptance_status") == "draft_unexecuted", "E_UNIT_ACCEPTANCE:" + str(uid))
        fail(errors, bool(unit.get("unresolved")), "E_UNIT_UNRESOLVED:" + str(uid))
    for product in ("HELIX-Web", "HELIX-Web-OS"):
        unit = by_product.get(product, {})
        fail(errors, unit.get("status") == "adjacent_boundary_only" and unit.get("current_evidence_status") == "adjacent_refs_only", "E_ADJACENT_PROMOTION:" + product)

    edges = data.get("candidate_connections", [])
    fail(errors, len(edges) == 5 and {edge.get("edge_id") for edge in edges} == EXPECTED_EDGE_IDS, "E_EDGE_SET")
    for edge in edges:
        eid = edge.get("edge_id")
        fail(errors, edge.get("status") in {"candidate", "adjacent_candidate"}, "E_EDGE_STATUS:" + str(eid))
        fail(errors, edge.get("authority_effect") == "none", "E_EDGE_AUTHORITY:" + str(eid))
        fail(errors, edge.get("from") in by_product and edge.get("to") in by_product, "E_EDGE_PRODUCT:" + str(eid))
        expected_edge = EXPECTED_EDGE_VALUES.get(eid, {})
        fail(errors, edge == {"edge_id": eid, **expected_edge}, "E_EDGE_MEANING:" + str(eid))

    joins = data.get("candidate_phase_joins", [])
    fail(errors, [join.get("phase_id") for join in joins] == list(PHASE_IDS), "E_PHASE_JOIN_SET")
    for join in joins:
        expected = [aid for aid in ASSET_IDS if join.get("phase_id") in phase.get(aid, {}).get("candidate_phase_targets", [])]
        fail(errors, join.get("selected_asset_ids") == expected, "E_PHASE_JOIN_ASSETS:" + str(join.get("phase_id")))
        fail(errors, join.get("interpretation") == EXPECTED_PHASE_JOIN_INTERPRETATION, "E_PHASE_JOIN_MEANING:" + str(join.get("phase_id")))

    residual = data.get("failure_consumer_residual", {})
    fail(errors, residual.get("failure_execution_receipts") == 0 and residual.get("selected_asset_consumer_refs") == [], "E_RESIDUAL_COUNTS")
    fail(errors, residual.get("consumer_closure_status") == "pending", "E_RESIDUAL_CLOSURE")
    fail(errors, residual.get("interpretation") == EXPECTED_FAILURE_CONSUMER_INTERPRETATION, "E_RESIDUAL_INTERPRETATION")
    fail(errors, residual.get("interpretation_sha256") == EXPECTED_FAILURE_CONSUMER_INTERPRETATION_DIGEST, "E_RESIDUAL_INTERPRETATION_DIGEST")
    fail(errors, sha(str(residual.get("interpretation", "")).encode("utf-8")) == residual.get("interpretation_sha256"), "E_RESIDUAL_INTERPRETATION_DIGEST_MATCH")
    consumers = residual.get("consumer_candidates", [])
    fail(errors, len(consumers) == 4 and all(c.get("observed") is False and c.get("closure_status") == "pending" and c.get("authority_effect") == "none" for c in consumers), "E_CONSUMER_CANDIDATES")

    counts = data.get("counts", {})
    expected_counts = {
        "selected_legacy_assets": 9, "source_anchors": 16, "current_refs": 12, "product_units": 4,
        "candidate_connections": 5, "candidate_phase_joins": 2, "consumer_candidates": 4,
        "decision_records_found": 0, "failure_execution_receipts": 0, "legacy_consumer_refs_observed": 0,
    }
    for key, expected in expected_counts.items():
        fail(errors, counts.get(key) == expected, "E_COUNT:" + key)

    if check_binding:
        try:
            binding = json.loads(BINDING_PATH.read_text(encoding="utf-8"))
            errors.extend("E_BINDING:" + error for error in validate_binding(binding))
        except Exception as exc:
            errors.append("E_BINDING_READ:" + str(exc))
    return errors


if __name__ == "__main__":
    try:
        inventory = json.loads(INV_PATH.read_text(encoding="utf-8"))
    except Exception as exc:
        print("FAIL PHCAP-12/13 validator: inventory parse", exc)
        raise SystemExit(1)
    errors = validate(inventory)
    if errors:
        print("FAIL PHCAP-12/13 validator")
        print("\n".join(errors))
        raise SystemExit(1)
    print("PASS PHCAP-12/13 validator: static phase/asset/product/unit/connection/consumer checks")
