#!/usr/bin/env python3
"""Static validator for the PHCAP-10/11 research premise candidate."""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INV_PATH = HERE / "inventory.json"
ORIGIN = "43bd941b5fea92e132566e0004e9b9a03f1f84f5"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
ASSET_IDS = [
    "LEGACY-ASSET-F67008331E92FA0A5773",
    "LEGACY-ASSET-25EB3B29EA909B050987",
    "LEGACY-ASSET-6DA5F7026F38B4C091AF",
    "LEGACY-ASSET-44F2DE5EBB3DF3A4744A",
    "LEGACY-ASSET-08488BBF033F37F536AB",
    "LEGACY-ASSET-DA012A9B04D5BE9419CE",
    "LEGACY-ASSET-D888FB040D52499EE09E",
    "LEGACY-ASSET-E9998EF887555DBB2751",
    "LEGACY-ASSET-CA0C7F22EA2ACBBF417E",
    "LEGACY-ASSET-1C7E5C0B33364FBF9EC6",
    "LEGACY-ASSET-8DE0535125B1E39C6FEA",
]
EXPECTED_EXCLUSIONS = {
    ASSET_IDS[0]: None,
    ASSET_IDS[1]: None,
    ASSET_IDS[2]: None,
    ASSET_IDS[3]: "legacy_runtime_cli_or_adapter",
    ASSET_IDS[4]: "legacy_test_fixture_or_oracle",
    ASSET_IDS[5]: None,
    ASSET_IDS[6]: None,
    ASSET_IDS[7]: None,
    ASSET_IDS[8]: "legacy_runtime_cli_or_adapter",
    ASSET_IDS[9]: "legacy_ci_workflow",
    ASSET_IDS[10]: "legacy_test_design_or_oracle",
}
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]

EXPECTED_ANCHOR_COUNTS = {
    ASSET_IDS[0]: 2,
    ASSET_IDS[1]: 2,
    ASSET_IDS[2]: 1,
    ASSET_IDS[3]: 2,
    ASSET_IDS[4]: 2,
    ASSET_IDS[5]: 4,
    ASSET_IDS[6]: 3,
    ASSET_IDS[7]: 1,
    ASSET_IDS[8]: 2,
    ASSET_IDS[9]: 2,
    ASSET_IDS[10]: 1,
}
EXPECTED_ANCHOR_MEANING = "static source span; no execution, pass or authority claim"
EXPECTED_PROHIBITED_INFERENCE = [
    "旧sourceの存在からimplemented/tested/verified/operationalを生成しない",
    "旧CI green、旧test design、旧runtime sourceを新世代CIのoracle・baseline・fallbackにしない",
    "product_targetsやpathからproduct owner、要求採否、successorを確定しない",
    "Web／Web-OS direct ref欠落から未実装と推定しない",
    "Scaffold validator/selfcheckの合格からL2/L11承認、L3/L10、CI green、完了、外部作用を生成しない",
    "bootstrap approvalからlease、executor、SCF-B-0004、operation_changeの成立を推定しない",
]

EXPECTED_KEYSETS = {
    "root": frozenset({"authority_effect", "base", "consumer_residual", "counts", "current_evidence", "decisions", "equivalence_claim", "failure_residual", "gaps", "human_decision_ref", "legacy_phase_assessment", "meaning_change_applied", "old_runtime_test_ci_execution", "prohibited_inference", "rebaseline", "schema", "scope", "status", "successor_requirement_ids", "task"}),
    "root.base": frozenset({"branch", "candidate_parent_status", "captured_at", "origin_main_commit", "repository", "worktree"}),
    "root.rebaseline": frozenset({"changed", "origin_main_at_final", "origin_main_at_start", "stop_condition"}),
    "root.task": frozenset({"inventory_path", "inventory_sha256", "phase_record_snapshots", "phases", "task_ids", "title"}),
    "root.task.phase_record_snapshots[]": frozenset({"authority_effect", "current", "gaps", "legacy", "new_build_allowed", "phase", "product_targets", "scaffold", "task_id", "title", "transition_assessment"}),
    "root.task.phase_record_snapshots[].current": frozenset({"evidence_products", "refs", "status"}),
    "root.task.phase_record_snapshots[].legacy": frozenset({"assessment", "capability_status", "exists", "layers_evidenced", "maximum_layer_evidenced", "representative_assets"}),
    "root.task.phase_record_snapshots[].legacy.representative_assets[]": frozenset({"asset_id", "implementation_status", "source_path"}),
    "root.scope": frozenset({"candidate_edges", "candidate_units", "closure_rule", "legacy_asset_ids", "legacy_layer_reach", "phase_current_evidence_products", "product_targets"}),
    "root.scope.phase_current_evidence_products": frozenset({"PHCAP-10", "PHCAP-11"}),
    "root.scope.legacy_layer_reach": frozenset({"PHCAP-10", "PHCAP-11"}),
    "root.scope.candidate_units[]": frozenset({"adjacent_ref_ids", "authority_status", "current_ci_status", "current_implementation_status", "current_worker_status", "direct_current_ref_ids", "old_asset_ids", "phase_status", "product", "status", "unit_id", "unresolved"}),
    "root.scope.candidate_units[].phase_status": frozenset({"PHCAP-10", "PHCAP-11"}),
    "root.scope.candidate_edges[]": frozenset({"asset_id", "authority_effect", "consumer_status", "edge_id", "implementation_status", "product", "relation", "status", "unit_id"}),
    "root.current_evidence": frozenset({"acceptance_status", "ci_status", "formal_ci_profile_status", "formal_oracle_registry_status", "implementation_status", "phase_direct_products", "refs", "worker_status"}),
    "root.current_evidence.phase_direct_products": frozenset({"PHCAP-10", "PHCAP-11"}),
    "root.current_evidence.refs[]": frozenset({"classification", "exact_text", "line_end", "line_sha256", "line_start", "meaning", "path", "ref_id", "sha256"}),
    "root.legacy_phase_assessment": frozenset({"asset_level_implementation_claim", "assets", "decision_matches", "legacy_execution_performed", "phase_records"}),
    "root.legacy_phase_assessment.phase_records[]": frozenset({"authority_effect", "current", "gaps", "legacy", "new_build_allowed", "phase", "product_targets", "scaffold", "task_id", "title", "transition_assessment"}),
    "root.legacy_phase_assessment.phase_records[].current": frozenset({"evidence_products", "refs", "status"}),
    "root.legacy_phase_assessment.phase_records[].legacy": frozenset({"assessment", "capability_status", "exists", "layers_evidenced", "maximum_layer_evidenced", "representative_assets"}),
    "root.legacy_phase_assessment.phase_records[].legacy.representative_assets[]": frozenset({"asset_id", "implementation_status", "source_path"}),
    "root.legacy_phase_assessment.assets[]": frozenset({"archive_path", "artifact_evidence_kind", "asset_class", "asset_id", "authority_status", "candidate_phase_targets", "candidate_product_targets", "classification_id", "consumer_closure_status", "consumer_evidence", "consumer_refs", "decision_record_ref", "disposition", "failure_evidence", "implementation_evidence_state", "layers_evidenced", "legacy_execution_performed", "legacy_implementation_status", "phase_classification_status", "phase_role", "product_classification_status", "reuse_exclusion_class", "source_anchors", "source_line_count", "source_path", "source_sha256", "unresolved"}),
    "root.legacy_phase_assessment.assets[].source_anchors[]": frozenset({"anchor_id", "exact_text", "line_end", "line_start", "meaning", "sha256"}),
    "root.legacy_phase_assessment.assets[].failure_evidence": frozenset({"anchor_ids", "execution_receipts", "status"}),
    "root.legacy_phase_assessment.assets[].consumer_evidence": frozenset({"anchor_ids", "consumer_refs", "status"}),
    "root.failure_residual": frozenset({"execution_receipts", "failure_consumer_closure", "status"}),
    "root.consumer_residual": frozenset({"closure_scope", "consumer_closure_status", "selected_asset_consumer_refs"}),
    "root.decisions": frozenset({"matching_append_only_decision_record_count", "per_asset", "selected_asset_ids"}),
    "root.decisions.per_asset": frozenset(ASSET_IDS),
    "root.counts": frozenset({"candidate_edges", "consumer_closed_assets", "current_refs", "decision_matches", "failure_execution_receipts", "legacy_assets", "missing_direct_product_pairs", "phase_direct_product_pairs", "product_units", "source_anchors"}),
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


def run_git(*args: str) -> str:
    return subprocess.run(
        ["git", *args],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()


def is_ancestor(ancestor: str, descendant: str) -> bool:
    return subprocess.run(
        ["git", "merge-base", "--is-ancestor", ancestor, descendant],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    ).returncode == 0


def validate(data: dict, check_files: bool = True) -> list[str]:
    errors: list[str] = validate_keysets(data)

    def req(condition: bool, code: str) -> None:
        if not condition:
            errors.append(code)

    req(data.get("schema") == "phcap10-11-worker-ci-static/v1", "E_SCHEMA")
    req(data.get("status") == "research_premise_candidate", "E_STATUS")
    req(data.get("authority_effect") == "none", "E_AUTHORITY")
    req(data.get("meaning_change_applied") is False, "E_MEANING_CHANGE")
    req(data.get("successor_requirement_ids") == [], "E_SUCCESSOR")
    req(data.get("human_decision_ref") is None, "E_HUMAN_DECISION")
    req(data.get("equivalence_claim") is None, "E_EQUIVALENCE")
    req(data.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")

    base = data.get("base", {})
    req(base.get("origin_main_commit") == ORIGIN, "E_BASE_ORIGIN")
    req(base.get("branch") == "audit/phcap10-11-worker-ci-static", "E_BASE_BRANCH")
    req(nonempty(base.get("worktree")), "E_BASE_WORKTREE")
    rb = data.get("rebaseline", {})
    req(rb.get("origin_main_at_start") == ORIGIN, "E_REBASE_START")
    req(rb.get("origin_main_at_final") == ORIGIN, "E_REBASE_FINAL")
    req(rb.get("changed") is False, "E_REBASE_CHANGED")
    req("origin/main" in rb.get("stop_condition", "") and "rebaseline" in rb.get("stop_condition", ""), "E_REBASE_STOP")
    try:
        current_head = run_git("rev-parse", "HEAD")
        req(is_ancestor(ORIGIN, current_head), "E_CAPTURE_NOT_ANCESTOR")
    except (OSError, subprocess.CalledProcessError):
        errors.append("E_CAPTURE_ANCESTOR_READ")

    phase_inventory = ROOT / "docs/governance/phase-capability-inventory.json"
    task = data.get("task", {})
    req(task.get("task_ids") == ["PHCAP-10", "PHCAP-11"], "E_TASK_IDS")
    req(phase_inventory.is_file(), "E_PHASE_INVENTORY_MISSING")
    phase = {}
    if phase_inventory.is_file():
        req(file_sha(phase_inventory) == task.get("inventory_sha256"), "E_PHASE_INVENTORY_SHA")
        phase = json.loads(phase_inventory.read_text(encoding="utf-8"))
        actual = [x for x in phase.get("records", []) if x.get("task_id") in {"PHCAP-10", "PHCAP-11"}]
        req(actual == task.get("phase_record_snapshots"), "E_PHASE_SNAPSHOTS")
        by_id = {x["task_id"]: x for x in actual}
        req(by_id.get("PHCAP-10", {}).get("product_targets") == ["HELIX-OS"], "E_PH10_PRODUCTS")
        req(by_id.get("PHCAP-10", {}).get("current", {}).get("evidence_products") == ["HELIX-OS"], "E_PH10_CURRENT_PRODUCTS")
        req(by_id.get("PHCAP-10", {}).get("current", {}).get("status") == "draft_requirement_and_bootstrap_decision", "E_PH10_CURRENT_STATUS")
        req(by_id.get("PHCAP-10", {}).get("legacy", {}).get("maximum_layer_evidenced") == "L7", "E_PH10_LAYER")
        req(by_id.get("PHCAP-10", {}).get("legacy", {}).get("capability_status") == "implemented_with_tests", "E_PH10_LEGACY_STATUS")
        req(by_id.get("PHCAP-11", {}).get("product_targets") == ["HELIX-HARNESS", "HELIX-OS"], "E_PH11_PRODUCTS")
        req(by_id.get("PHCAP-11", {}).get("current", {}).get("evidence_products") == ["HELIX-HARNESS", "HELIX-OS"], "E_PH11_CURRENT_PRODUCTS")
        req(by_id.get("PHCAP-11", {}).get("current", {}).get("status") == "candidate", "E_PH11_CURRENT_STATUS")
        req(by_id.get("PHCAP-11", {}).get("legacy", {}).get("maximum_layer_evidenced") == "L10", "E_PH11_LAYER")
        req(by_id.get("PHCAP-11", {}).get("legacy", {}).get("capability_status") == "implemented_with_workflow_and_test_design", "E_PH11_LEGACY_STATUS")

    scope = data.get("scope", {})
    req(scope.get("product_targets") == PRODUCTS, "E_SCOPE_PRODUCTS")
    req(scope.get("legacy_asset_ids") == ASSET_IDS, "E_SCOPE_ASSET_IDS")
    req(scope.get("legacy_layer_reach") == {"PHCAP-10": ["L4", "L5", "L6", "L7 implementation/test"], "PHCAP-11": ["L3", "L4", "L6", "L7 implementation/workflow", "L10 test design"]}, "E_SCOPE_LAYERS")

    units = scope.get("candidate_units", [])
    req(len(units) == 4, "E_UNIT_COUNT")
    req({u.get("product") for u in units} == set(PRODUCTS), "E_UNIT_PRODUCTS")
    units_by_product = {u.get("product"): u for u in units}
    req(len(units_by_product) == 4, "E_UNIT_DUP")
    expected_direct = {"HELIX-HARNESS": {"PHCAP-11"}, "HELIX-OS": {"PHCAP-10", "PHCAP-11"}, "HELIX-Web": set(), "HELIX-Web-OS": set()}
    for product in PRODUCTS:
        unit = units_by_product.get(product, {})
        req(unit.get("status") == "research_premise_candidate", "E_UNIT_STATUS:" + product)
        req(unit.get("authority_status") == "candidate_unresolved", "E_UNIT_AUTHORITY:" + product)
        req(unit.get("current_implementation_status") == "unknown", "E_UNIT_IMPL:" + product)
        req(set(unit.get("direct_current_ref_ids", [])) != set() if product in {"HELIX-HARNESS", "HELIX-OS"} else unit.get("direct_current_ref_ids") == [], "E_UNIT_DIRECT_REFS:" + product)
        req(bool(unit.get("unresolved")), "E_UNIT_UNRESOLVED:" + product)
        statuses = unit.get("phase_status", {})
        req(set(statuses) == {"PHCAP-10", "PHCAP-11"}, "E_UNIT_PHASE_KEYS:" + product)
    req(units_by_product.get("HELIX-Web", {}).get("phase_status") == {"PHCAP-10": "missing_direct_phase_ref", "PHCAP-11": "missing_direct_phase_ref"}, "E_WEB_MISSING")
    req(units_by_product.get("HELIX-Web-OS", {}).get("phase_status") == {"PHCAP-10": "missing_direct_phase_ref", "PHCAP-11": "missing_direct_phase_ref"}, "E_WEBOS_MISSING")

    edges = scope.get("candidate_edges", [])
    req(len(edges) == 22, "E_EDGE_COUNT")
    edge_ids = [e.get("edge_id") for e in edges]
    req(len(set(edge_ids)) == len(edge_ids), "E_EDGE_DUP")
    req(all(e.get("status") == "unresolved_candidate" for e in edges), "E_EDGE_STATUS")
    req(all(e.get("authority_effect") == "none" for e in edges), "E_EDGE_AUTHORITY")
    req(sum(1 for e in edges if e.get("product") is None) == 1, "E_EDGE_UNRESOLVED_PRODUCT")

    disposition = {x.get("asset_id"): x for x in read_jsonl(ROOT / "docs/governance/legacy-asset-disposition.jsonl")}
    catalog = {x.get("asset_id"): x for x in read_jsonl(ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl")}
    decision_rows = read_jsonl(ROOT / "docs/governance/legacy-asset-decisions.jsonl")
    decision_counts = {
        aid: sum(1 for row in decision_rows if row.get("asset_id") == aid)
        for aid in ASSET_IDS
    }
    assets = data.get("legacy_phase_assessment", {}).get("assets", [])
    req([a.get("asset_id") for a in assets] == ASSET_IDS, "E_ASSET_ORDER")
    seen_anchors: set[str] = set()
    for asset in assets:
        aid = asset.get("asset_id")
        old = disposition.get(aid, {})
        cls = catalog.get(aid, {})
        req(aid in ASSET_IDS, "E_ASSET_ID:" + str(aid))
        req(decision_counts.get(aid) == 0, "E_ASSET_DECISION_LEDGER:" + str(aid))
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
        req(asset.get("candidate_product_targets") == cls.get("candidate_product_targets"), "E_ASSET_PRODUCTS:" + str(aid))
        req(asset.get("consumer_closure_status") == "pending", "E_ASSET_CLOSURE:" + str(aid))
        req(asset.get("implementation_evidence_state") == cls.get("implementation_evidence_state"), "E_ASSET_EVIDENCE_STATE:" + str(aid))
        req(asset.get("unresolved") == cls.get("unresolved"), "E_ASSET_UNRESOLVED:" + str(aid))
        archive = ROOT / asset.get("archive_path", "")
        req(asset.get("archive_path", "").startswith(ARCHIVE_PREFIX) and archive.is_file(), "E_ARCHIVE:" + str(aid))
        if archive.is_file() and check_files:
            req(file_sha(archive) == asset.get("source_sha256"), "E_SOURCE_SHA:" + str(aid))
            req(len(archive.read_text(encoding="utf-8").splitlines()) == asset.get("source_line_count"), "E_SOURCE_LINES:" + str(aid))
        expected_anchor_ids = [f"{aid}-A{index:02d}" for index in range(1, EXPECTED_ANCHOR_COUNTS.get(aid, 0) + 1)]
        actual_anchor_ids = [anchor.get("anchor_id") for anchor in asset.get("source_anchors", [])]
        req(actual_anchor_ids == expected_anchor_ids, "E_ANCHOR_ORDER:" + str(aid))
        for anchor in asset.get("source_anchors", []):
            sid = anchor.get("anchor_id")
            req(nonempty(sid) and sid not in seen_anchors, "E_ANCHOR_DUP:" + str(sid))
            seen_anchors.add(sid)
            if archive.is_file() and check_files:
                actual = span_text(archive, anchor.get("line_start", 0), anchor.get("line_end", 0))
                req(actual == anchor.get("exact_text"), "E_ANCHOR_TEXT:" + str(sid))
                if actual is not None:
                    req(sha(actual.encode("utf-8")) == anchor.get("sha256"), "E_ANCHOR_SHA:" + str(sid))
            req(anchor.get("meaning") == EXPECTED_ANCHOR_MEANING, "E_ANCHOR_MEANING:" + str(sid))
        req(asset.get("failure_evidence", {}).get("execution_receipts") == 0, "E_FAILURE_RECEIPT:" + str(aid))
        req(asset.get("consumer_evidence", {}).get("consumer_refs") == [], "E_CONSUMER_REFS:" + str(aid))
    decision_total = sum(decision_counts.values())
    req(data.get("legacy_phase_assessment", {}).get("decision_matches") == decision_total, "E_DECISIONS_TOTAL")
    req(data.get("legacy_phase_assessment", {}).get("asset_level_implementation_claim") is False, "E_IMPL_CLAIM")

    current = data.get("current_evidence", {})
    req(current.get("phase_direct_products") == {"PHCAP-10": ["HELIX-OS"], "PHCAP-11": ["HELIX-HARNESS", "HELIX-OS"]}, "E_CURRENT_DIRECT_PRODUCTS")
    req(current.get("implementation_status") == "unknown", "E_CURRENT_IMPL")
    req(current.get("acceptance_status") == "unknown", "E_CURRENT_ACCEPTANCE")
    req(current.get("formal_ci_profile_status") == "unknown_not_constructed", "E_FORMAL_CI")
    req(current.get("formal_oracle_registry_status") == "unknown_not_constructed", "E_FORMAL_ORACLE")
    refs = current.get("refs", [])
    req(len(refs) == 9, "E_REF_COUNT")
    ref_ids: set[str] = set()
    direct_refs: set[str] = set()
    for ref in refs:
        rid = ref.get("ref_id")
        req(rid not in ref_ids, "E_REF_DUP:" + str(rid))
        ref_ids.add(rid)
        path = ROOT / ref.get("path", "")
        req(path.is_file(), "E_REF_MISSING:" + str(rid))
        if path.is_file() and check_files:
            req(file_sha(path) == ref.get("sha256"), "E_REF_SHA:" + str(rid))
            actual = span_text(path, ref.get("line_start", 0), ref.get("line_end", 0))
            req(actual == ref.get("exact_text"), "E_REF_TEXT:" + str(rid))
            if actual is not None:
                req(sha(actual.encode("utf-8")) == ref.get("line_sha256"), "E_REF_LINE_SHA:" + str(rid))
        req(ref.get("classification") in {"direct_current_ref", "boundary_candidate", "adjacent_boundary_ref"}, "E_REF_CLASS:" + str(rid))
        if ref.get("classification") == "direct_current_ref":
            direct_refs.add(rid)
    req({"CUR-HARNESS-L2-CI", "CUR-OS-L2-WORKER-CI", "CUR-OS-BOOTSTRAP", "CUR-CI-CANDIDATE-BOUNDARY", "CUR-CI-CANDIDATE-REBUILD"}.issubset(direct_refs), "E_DIRECT_REF_SET")

    req(data.get("failure_residual", {}).get("execution_receipts") == 0, "E_FAILURE_TOTAL")
    req(data.get("consumer_residual", {}).get("selected_asset_consumer_refs") == [], "E_CONSUMER_TOTAL")
    req(data.get("consumer_residual", {}).get("consumer_closure_status") == "pending", "E_CONSUMER_CLOSURE")
    decisions = data.get("decisions", {})
    req(decisions.get("selected_asset_ids") == ASSET_IDS, "E_DECISION_ASSETS")
    req(decisions.get("matching_append_only_decision_record_count") == decision_total, "E_DECISION_COUNT")
    req(decisions.get("per_asset") == decision_counts, "E_DECISION_PER_ASSET")
    counts = data.get("counts", {})
    req(counts.get("product_units") == len(units), "E_COUNT_UNITS")
    req(counts.get("candidate_edges") == len(edges), "E_COUNT_EDGES")
    req(counts.get("legacy_assets") == len(assets), "E_COUNT_ASSETS")
    req(counts.get("source_anchors") == len(seen_anchors), "E_COUNT_ANCHORS")
    req(counts.get("current_refs") == len(refs), "E_COUNT_REFS")
    req(counts.get("decision_matches") == decision_total, "E_COUNT_DECISIONS")
    req(counts.get("failure_execution_receipts") == 0, "E_COUNT_FAILURE")
    req(counts.get("consumer_closed_assets") == 0, "E_COUNT_CONSUMERS")
    req(counts.get("phase_direct_product_pairs") == 3, "E_COUNT_DIRECT_PAIRS")
    req(counts.get("missing_direct_product_pairs") == 4, "E_COUNT_MISSING_PAIRS")
    for field in ("gaps", "prohibited_inference"):
        req(isinstance(data.get(field), list) and len(data[field]) >= 5, "E_LIST:" + field)
        req(all(nonempty(x) for x in data.get(field, [])), "E_LIST_ITEM:" + field)
    req(data.get("prohibited_inference") == EXPECTED_PROHIBITED_INFERENCE, "E_PROHIBITED_CONTENT")
    return errors


if __name__ == "__main__":
    try:
        payload = json.loads(INV_PATH.read_text(encoding="utf-8"))
        problems = validate(payload)
    except Exception as exc:
        print("FAIL PHCAP-10/11 validator: exception: " + repr(exc))
        raise
    if problems:
        print("FAIL PHCAP-10/11 validator")
        print("\n".join(problems))
        sys.exit(1)
    print("PASS PHCAP-10/11 validator: static source/ledger/phase/product/unknown checks")
