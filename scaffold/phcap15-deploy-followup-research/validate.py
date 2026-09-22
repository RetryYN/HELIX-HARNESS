#!/usr/bin/env python3
"""Static validator for the PHCAP-15 follow-up research premise."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path


POOL_EXPECTED = 78
SELECTED_EXPECTED = 12
PR2001_IDS = {
    "LEGACY-ASSET-042D2B732DC68AA7EE9A",
    "LEGACY-ASSET-578A66F54CD01046B7BA",
    "LEGACY-ASSET-18BB86CC5625C31430B8",
    "LEGACY-ASSET-FA8D4E24D8399E8350F1",
    "LEGACY-ASSET-327A88B2141C43045AF1",
    "LEGACY-ASSET-BADD68B87BA5BE0F3906",
    "LEGACY-ASSET-7995556682FC5493C37E",
}
SCF0037_IDS = {
    "LEGACY-ASSET-54330A68064B58B22259",
    "LEGACY-ASSET-1251704E0BE627232E00",
    "LEGACY-ASSET-189702B332643A3BFDAF",
}
PRODUCTS = {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"}
BASE_COMMIT = "685c69c3c174ac6121812dade30ed75e510986e6"
EXPECTED_EQUIVALENCE_CLAIM = None
EXPECTED_SEMANTIC_KINDS = {
    "LEGACY-ASSET-7D081AD1F95E968FA77C": "audit／evidence boundary",
    "LEGACY-ASSET-1C02673C4901B24D963D": "runtime-state／rename evidence inventory",
    "LEGACY-ASSET-0AD2FD852BAB0CEC864B": "compatibility configuration inventory",
    "LEGACY-ASSET-99E3BCA46E08C4A328FC": "plan-specific authority configuration",
    "LEGACY-ASSET-17C4BF78919578FEBB18": "L3 lifecycle/deployment requirement",
    "LEGACY-ASSET-A2F6A697D7FFFD490B57": "L3 release/bundle requirement",
    "LEGACY-ASSET-897CAC574F146D976BD7": "L6 runtime guidance document",
    "LEGACY-ASSET-FD0947CF40FB2B301664": "L7 cloud-deploy source-ledger plan",
    "LEGACY-ASSET-9E033C3E39BE107D4CF1": "Incident workflow process",
    "LEGACY-ASSET-3E3D84D599ED0476926B": "version-up workflow process",
    "LEGACY-ASSET-92811340BD843B5EC3FD": "test source for objective evidence audit",
    "LEGACY-ASSET-7E68FC7E2F08FD31B0C1": "test source for lifecycle operations authority",
}
EXPECTED_PRODUCT_BOUNDARIES = {
    "HELIX-HARNESS": "工程・artifact内容・consumer条件の境界候補。配布運転を所有しない候補。",
    "HELIX-OS": "project authority、release準備、artifact受渡し、deployment evidence統制の候補。展開先runtime authorityを吸収しない。",
    "HELIX-Web": "利用者向けWeb体験の候補。直接deployment evidenceの不在は未実装を意味しない。",
    "HELIX-Web-OS": "tenant/service runtime、配備、監視、復旧の候補。OSとはauthority/stateを分離する。",
}
EXPECTED_PRODUCT_EVIDENCE_STATUS = {
    "HELIX-HARNESS": "boundary_candidate_only",
    "HELIX-OS": "candidate_unresolved",
    "HELIX-Web": "boundary_candidate_only",
    "HELIX-Web-OS": "candidate_unresolved",
}
EXPECTED_ANCHOR_COUNTS = {
    "LEGACY-ASSET-7D081AD1F95E968FA77C": 2,
    "LEGACY-ASSET-1C02673C4901B24D963D": 2,
    "LEGACY-ASSET-0AD2FD852BAB0CEC864B": 2,
    "LEGACY-ASSET-99E3BCA46E08C4A328FC": 2,
    "LEGACY-ASSET-17C4BF78919578FEBB18": 2,
    "LEGACY-ASSET-A2F6A697D7FFFD490B57": 3,
    "LEGACY-ASSET-897CAC574F146D976BD7": 2,
    "LEGACY-ASSET-FD0947CF40FB2B301664": 2,
    "LEGACY-ASSET-9E033C3E39BE107D4CF1": 3,
    "LEGACY-ASSET-3E3D84D599ED0476926B": 3,
    "LEGACY-ASSET-92811340BD843B5EC3FD": 2,
    "LEGACY-ASSET-7E68FC7E2F08FD31B0C1": 2,
}
EXPECTED_ANCHOR_MEANINGS = {
    "LEGACY-ASSET-7D081AD1F95E968FA77C": ["production deploy／post-deploy／PO signoffはlocal closureではない", "local closure、evidence path、historical carryの停止境界"],
    "LEGACY-ASSET-1C02673C4901B24D963D": ["rename baselineのroot、token、hit/file集計", "source/test/runtime/config/consumer/plan/designカテゴリ集計"],
    "LEGACY-ASSET-0AD2FD852BAB0CEC864B": ["compatibility input onlyとentries digest", "L13 post-deploy／L14 operations plan identity"],
    "LEGACY-ASSET-99E3BCA46E08C4A328FC": ["plan-specific V-pair binding authority schema", "runtime capability matrixのverification binding absent entry"],
    "LEGACY-ASSET-17C4BF78919578FEBB18": ["ReleaseとDeployment、runtime observationとauthorityの境界", "DeploymentManifest/Plan/ReceiptとRollback contract"],
    "LEGACY-ASSET-A2F6A697D7FFFD490B57": ["HARNESS authority、Release ModuleとBundleの境界", "Module schemaとlifecycle", "release packet、consumer、rollback、static failure boundary"],
    "LEGACY-ASSET-897CAC574F146D976BD7": ["runtime実装ではなくcommand guidance adapter", "L13 projectionと実副作用なしの境界"],
    "LEGACY-ASSET-FD0947CF40FB2B301664": ["Cloud Deploy verification/canary/rollbackをledgerへ固定する旧review evidence", "source ledger必須rowとURL drift fail-close"],
    "LEGACY-ASSET-9E033C3E39BE107D4CF1": ["Incident sourceのauthority/evidence boundary", "IncidentとRecoveryのworkflow identity分離", "phase禁止とtroubleshoot/recovery/reverseのplan分割"],
    "LEGACY-ASSET-3E3D84D599ED0476926B": ["version-up sourceのauthority/evidence boundary", "activation approval/dry-run/rollback/parked review", "plan-only、activation不可、外部作用なし"],
    "LEGACY-ASSET-92811340BD843B5EC3FD": ["objective evidence audit test sourceとcurrent evidence checks", "L13/L14等のevidence surfaceを参照するtest source"],
    "LEGACY-ASSET-7E68FC7E2F08FD31B0C1": ["lifecycle authority、Release/Deployment分離のtest source", "Module/Bundle lifecycleとrelease planのtest source"],
}
EXPECTED_UNRESOLVED = ["semantic product split", "phase admission", "product owner", "current implementation/degradation/acceptance", "failure outcome", "consumer closure", "successor/decision"]
EXPECTED_PROHIBITED_INFERENCE = [
    "pool membership is a phase classification candidate only",
    "source presence, configuration, implementation source, test source, runtime-state evidence or old command names do not establish current implementation, operation, acceptance, deployment or pass",
    "phase candidate targets do not admit assets to PHCAP-15",
    "current L1/L2/L11 candidate text does not generate authority or owner",
    "empty consumer_refs and pending closure do not prove no historical consumer",
    "missing direct Web evidence does not establish non-implementation",
    "old review evidence, green commands or test source are not current execution receipts",
    "archive is static reference only and not runtime, test, CI or fallback",
]
EXPECTED_REQUIRED_COMMANDS = [
    "python3 -B scaffold/phcap15-deploy-followup-research/validate.py",
    "python3 -B scaffold/phcap15-deploy-followup-research/selfcheck.py",
    "python3 scaffold/tools/scfctl.py validate",
    "python3 scaffold/tools/scfctl.py stale",
    "python3 scaffold/tools/scfctl.py residuals",
    "git diff --check",
]
EXPECTED_NEGATIVE_CASES = [
    "pool denominator/remaining count tamper",
    "PR2001 or SCF-B-0037 overlap",
    "selected asset ID duplication",
    "source span/text/digest tamper",
    "authority promotion",
    "implementation promotion",
    "degradation promotion",
    "phase admission promotion",
    "failure receipt invention",
    "consumer closure invention",
    "product owner/evidence promotion",
    "decision history invention",
]
EXPECTED_KEYSETS = {
    "root": frozenset({"schema", "status", "authority_effect", "meaning_change_applied", "successor_requirement_ids", "human_decision_ref", "equivalence_claim", "old_archive_runtime_test_ci_execution", "base", "task", "provenance", "denominator", "scope", "product_boundary_candidates", "assets", "aggregate_evidence", "prohibited_inference", "verification_contract", "counts"}),
    "root.base": frozenset({"origin_main_commit", "origin_main_at_start", "origin_main_at_final", "changed", "worktree", "captured_at", "stop_condition"}),
    "root.task": frozenset({"task_id", "phase", "title", "phase_inventory_path", "phase_inventory_snapshot"}),
    "root.task.phase_inventory_snapshot": frozenset({"status", "product_targets", "evidence_products", "refs", "legacy_layers_evidenced", "maximum_layer_evidenced", "legacy_capability_status", "transition_assessment", "gaps", "new_build_allowed", "authority_effect"}),
    "root.provenance": frozenset({"ledgers", "phase_pool_basis", "pr_2001_head", "pr_2001_inventory", "existing_binding"}),
    "root.provenance.ledgers.*": frozenset({"sha256", "records"}),
    "root.denominator": frozenset({"pool_rows", "pool_unique_asset_ids", "pr_2001_selected_rows", "scf_b0037_selected_rows", "already_reviewed_excluded_rows", "followup_selected_rows", "reviewed_or_selected_total", "remaining_unreviewed_rows", "pool_coverage_statement"}),
    "root.scope": frozenset({"pool_asset_ids", "excluded_scopes", "selected_asset_ids", "remaining_unreviewed_asset_ids", "overlap_checks"}),
    "root.scope.excluded_scopes.pr_2001": frozenset({"pr_number", "head", "asset_ids"}),
    "root.scope.excluded_scopes.scf_b0037": frozenset({"binding_path", "asset_ids"}),
    "root.scope.overlap_checks": frozenset({"selected_vs_pr_2001", "selected_vs_scf_b0037", "pool_duplicate_ids"}),
    "root.product_boundary_candidates": frozenset({"defined_products", "products", "current_implementation_claim", "authority_effect", "product_owner_status"}),
    "root.product_boundary_candidates.products[]": frozenset({"product", "status", "boundary", "current_evidence_status", "current_authority_status", "current_implementation_status", "refs", "owner_status"}),
    "root.product_boundary_candidates.products[].refs[]": frozenset({"path", "line_start", "line_end", "file_sha256", "span_sha256"}),
    "root.assets[]": frozenset({"asset_id", "semantic_diversity_kind", "phase_ledger_line", "disposition_ledger_line", "source_path", "archive_path", "source_revision", "source_file_sha256", "source_line_count", "ledger_source_sha256", "artifact_evidence_kind", "source_anchors", "candidate_phase_targets", "phase_classification_status", "phase_admission", "candidate_product_targets", "product_classification_status", "product_owner_status", "legacy_implementation_status", "implementation_evidence_state", "legacy_execution_performed", "current_implementation_status", "current_operation_status", "current_acceptance_status", "current_degradation_status", "disposition", "authority_status", "decision_matches", "decision_record_refs", "copy_read_after_matches", "consumer_closure_status", "consumer_refs", "failure_evidence", "consumer_evidence", "unresolved"}),
    "root.assets[].source_anchors[]": frozenset({"line_start", "line_end", "source_span_sha256", "exact_text", "meaning"}),
    "root.assets[].failure_evidence": frozenset({"status", "execution_receipts", "source_failure_or_stop_conditions_observed", "failure_outcome_observed", "unknown"}),
    "root.assets[].consumer_evidence": frozenset({"status", "consumer_refs_observed", "consumer_closure_observed", "unknown"}),
    "root.aggregate_evidence": frozenset({"selected_asset_count", "selected_asset_decision_matches", "selected_asset_copy_read_after_matches", "selected_failure_execution_receipts", "selected_consumer_refs_nonempty", "selected_consumer_closure_pending", "selected_implementation_statuses", "current_implementation_status", "current_degradation_status", "current_phase_admission"}),
    "root.verification_contract": frozenset({"requires_exact_source_spans", "requires_source_archive_digest_reconciliation", "requires_pool_nonoverlap", "requires_four_product_candidate_boundary", "unknowns_must_remain_explicit", "old_archive_runtime_test_ci_execution", "required_commands", "negative_cases"}),
    "root.counts": frozenset({"pool_rows", "selected_rows", "excluded_rows", "remaining_unreviewed_rows", "four_products", "selected_source_anchors"}),
}


def digest_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def digest_file(path: Path) -> str:
    return digest_bytes(path.read_bytes())


def jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines()]


def fail(errors: list[str], code: str, detail: str) -> None:
    errors.append(f"{code}: {detail}")


def line_span(path: Path, start: int, end: int) -> str:
    lines = path.read_text(encoding="utf-8").splitlines()
    return "\n".join(lines[start - 1 : end])


def validate_keysets(value: object) -> list[str]:
    errors: list[str] = []

    def walk(node: object, path: str) -> None:
        expected = EXPECTED_KEYSETS.get(path)
        if expected is None:
            if path.startswith("root.provenance.ledgers.") and not path.endswith((".sha256", ".records")):
                expected = EXPECTED_KEYSETS.get("root.provenance.ledgers.*")
        if expected is not None:
            if not isinstance(node, dict):
                errors.append(f"KEYSET_TYPE:{path}")
            elif set(node) != expected:
                errors.append(f"KEYSET:{path}")
        if isinstance(node, dict):
            for key, child in node.items():
                walk(child, f"{path}.{key}")
        elif isinstance(node, list):
            for child in node:
                if isinstance(child, (dict, list)):
                    walk(child, f"{path}[]")

    walk(value, "root")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--inventory", type=Path, default=Path(__file__).resolve().with_name("inventory.json"))
    args = parser.parse_args()
    root = args.root.resolve()
    inventory_path = args.inventory.resolve()

    try:
        inv = json.loads(inventory_path.read_text(encoding="utf-8"))
    except Exception as exc:  # pragma: no cover - a malformed candidate is a validation error
        print(f"FAIL PHCAP15-FOLLOWUP: inventory unreadable: {exc}")
        return 1
    errors: list[str] = validate_keysets(inv)

    expected_paths = {
        "phase_inventory": root / "docs/governance/phase-capability-inventory.json",
        "disposition": root / "docs/governance/legacy-asset-disposition.jsonl",
        "phase_ledger": root / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl",
        "decisions": root / "docs/governance/legacy-asset-decisions.jsonl",
        "manifest": root / "archive/legacy-generation-2026-09-14/MANIFEST.sha256",
    }
    if inv.get("schema") != "phcap15-deploy-followup-research/v1":
        fail(errors, "SCHEMA", "schema mismatch")
    if inv.get("authority_effect") != "none" or inv.get("meaning_change_applied") is not False:
        fail(errors, "AUTHORITY_EFFECT", "authority_effect must be none and meaning_change_applied false")
    if inv.get("equivalence_claim") != EXPECTED_EQUIVALENCE_CLAIM:
        fail(errors, "EQUIVALENCE_CLAIM", "equivalence claim must remain null")
    if inv.get("old_archive_runtime_test_ci_execution") is not False:
        fail(errors, "OLD_EXECUTION", "old archive/runtime/test/CI execution must remain false")

    base = inv.get("base", {})
    if any(base.get(k) != BASE_COMMIT for k in ("origin_main_commit", "origin_main_at_start", "origin_main_at_final")):
        fail(errors, "BASE", "origin/main exact commit drifted")
    if base.get("changed") is not False:
        fail(errors, "REBASELINE", "origin/main changed flag must remain false")

    phase_rows = jsonl(expected_paths["phase_ledger"])
    disposition_rows = jsonl(expected_paths["disposition"])
    decision_rows = jsonl(expected_paths["decisions"])
    phase_by_id = {row["asset_id"]: row for row in phase_rows}
    disposition_by_id = {row["asset_id"]: row for row in disposition_rows}
    pool = [row["asset_id"] for row in phase_rows if "PHCAP-15" in (row.get("candidate_phase_targets") or [])]
    pool_set = set(pool)
    if len(pool) != POOL_EXPECTED or len(pool_set) != POOL_EXPECTED:
        fail(errors, "POOL_DENOMINATOR", f"expected unique PHCAP-15 pool {POOL_EXPECTED}, got {len(pool)}/{len(pool_set)}")

    scope = inv.get("scope", {})
    if scope.get("pool_asset_ids") != pool:
        fail(errors, "POOL_SCOPE", "inventory pool IDs do not match phase ledger order")
    excluded = scope.get("excluded_scopes", {})
    pr_ids = set(excluded.get("pr_2001", {}).get("asset_ids", []))
    scf_ids = set(excluded.get("scf_b0037", {}).get("asset_ids", []))
    selected = scope.get("selected_asset_ids", [])
    selected_set = set(selected)
    remaining = set(scope.get("remaining_unreviewed_asset_ids", []))
    if pr_ids != PR2001_IDS:
        fail(errors, "PR2001_SCOPE", "PR #2001 exclusion set changed")
    if scf_ids != SCF0037_IDS:
        fail(errors, "SCF0037_SCOPE", "SCF-B-0037 exclusion set changed")
    if len(selected) != SELECTED_EXPECTED or len(selected_set) != SELECTED_EXPECTED:
        fail(errors, "SELECTED_COUNT", "selected follow-up set must contain 12 unique assets")
    if not selected_set <= pool_set:
        fail(errors, "SELECTED_POOL", "selected asset is outside PHCAP-15 pool")
    if selected_set & (pr_ids | scf_ids):
        fail(errors, "NON_OVERLAP", "selected asset overlaps PR #2001 or SCF-B-0037")
    expected_remaining = pool_set - pr_ids - scf_ids - selected_set
    if remaining != expected_remaining:
        fail(errors, "REMAINING", f"remaining set mismatch: expected {len(expected_remaining)}, got {len(remaining)}")

    denominator = inv.get("denominator", {})
    expected_counts = {
        "pool_rows": 78,
        "pool_unique_asset_ids": 78,
        "pr_2001_selected_rows": 7,
        "scf_b0037_selected_rows": 3,
        "already_reviewed_excluded_rows": 10,
        "followup_selected_rows": 12,
        "reviewed_or_selected_total": 22,
        "remaining_unreviewed_rows": 56,
    }
    for key, expected in expected_counts.items():
        if denominator.get(key) != expected:
            fail(errors, "DENOMINATOR", f"{key} expected {expected}, got {denominator.get(key)}")

    provenance = inv.get("provenance", {})
    for key, path in expected_paths.items():
        rel = {
            "phase_inventory": "docs/governance/phase-capability-inventory.json",
            "disposition": "docs/governance/legacy-asset-disposition.jsonl",
            "phase_ledger": "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl",
            "decisions": "docs/governance/legacy-asset-decisions.jsonl",
            "manifest": "archive/legacy-generation-2026-09-14/MANIFEST.sha256",
        }[key]
        if not path.exists():
            fail(errors, "PROVENANCE", f"missing {rel}")
            continue
        recorded = provenance.get("ledgers", {}).get(rel, {}).get("sha256")
        actual = digest_file(path)
        if recorded != actual:
            fail(errors, "LEDGER_DIGEST", f"{rel} digest mismatch")

    boundary = inv.get("product_boundary_candidates", {})
    if set(boundary.get("defined_products", [])) != PRODUCTS:
        fail(errors, "PRODUCT_SET", "four-product boundary set changed")
    product_rows = boundary.get("products", [])
    if {row.get("product") for row in product_rows} != PRODUCTS:
        fail(errors, "PRODUCT_ROWS", "four product candidate rows are incomplete")
    if boundary.get("authority_effect") != "none" or boundary.get("current_implementation_claim") is not False:
        fail(errors, "PRODUCT_PROMOTION", "product boundary cannot create authority or implementation claim")
    for product in product_rows:
        product_name = product.get("product")
        if product.get("boundary") != EXPECTED_PRODUCT_BOUNDARIES.get(product_name):
            fail(errors, "PRODUCT_BOUNDARY_TEXT", f"{product_name} boundary changed")
        if product.get("current_evidence_status") != EXPECTED_PRODUCT_EVIDENCE_STATUS.get(product_name):
            fail(errors, "PRODUCT_EVIDENCE_STATUS", f"{product_name} current evidence changed")
        if product.get("current_authority_status") != "none" or product.get("current_implementation_status") != "unknown":
            fail(errors, "PRODUCT_STATUS", f"{product.get('product')} status promoted")
        for ref in product.get("refs", []):
            path = root / ref["path"]
            if not path.exists():
                fail(errors, "PRODUCT_REF", f"missing current boundary ref {ref['path']}")
                continue
            if digest_file(path) != ref.get("file_sha256"):
                fail(errors, "PRODUCT_REF_DIGEST", f"current boundary digest mismatch {ref['path']}")
            text = line_span(path, ref["line_start"], ref["line_end"])
            if digest_bytes(text.encode("utf-8")) != ref.get("span_sha256"):
                fail(errors, "PRODUCT_REF_SPAN", f"current boundary span mismatch {ref['path']}")

    asset_rows = inv.get("assets", [])
    if [row.get("asset_id") for row in asset_rows] != selected:
        fail(errors, "ASSET_ORDER", "asset rows must follow selected_asset_ids")
    if len(asset_rows) != SELECTED_EXPECTED:
        fail(errors, "ASSET_COUNT", "asset detail rows must contain 12 records")
    for asset in asset_rows:
        aid = asset.get("asset_id")
        if aid not in selected_set:
            fail(errors, "ASSET_ID", f"unexpected selected asset {aid}")
            continue
        phase = phase_by_id.get(aid)
        disp = disposition_by_id.get(aid)
        if phase is None or disp is None:
            fail(errors, "ASSET_LEDGER", f"missing ledger row for {aid}")
            continue
        archive = root / "archive/legacy-generation-2026-09-14/root" / phase["source_path"]
        if not archive.exists():
            fail(errors, "ARCHIVE_SOURCE", f"missing archive source {aid}")
            continue
        actual_sha = digest_file(archive)
        if asset.get("source_file_sha256") != actual_sha or asset.get("ledger_source_sha256") != phase.get("source_sha256") or phase.get("source_sha256") != actual_sha:
            fail(errors, "SOURCE_DIGEST", f"source/archive/ledger digest mismatch {aid}")
        if asset.get("source_path") != phase.get("source_path") or asset.get("source_revision") != phase.get("source_revision"):
            fail(errors, "SOURCE_IDENTITY", f"source identity mismatch {aid}")
        if asset.get("source_line_count") != len(archive.read_text(encoding="utf-8").splitlines()):
            fail(errors, "SOURCE_LINES", f"source line count mismatch {aid}")
        if "PHCAP-15" not in (asset.get("candidate_phase_targets") or []) or asset.get("phase_admission") != "unresolved_candidate_only":
            fail(errors, "PHASE_PROMOTION", f"phase admission promoted or missing {aid}")
        if asset.get("candidate_phase_targets") != phase.get("candidate_phase_targets"):
            fail(errors, "PHASE_TARGETS", f"phase candidate targets changed {aid}")
        if asset.get("candidate_product_targets") != phase.get("candidate_product_targets"):
            fail(errors, "PRODUCT_TARGETS", f"product candidate targets changed {aid}")
        if asset.get("semantic_diversity_kind") != EXPECTED_SEMANTIC_KINDS.get(aid):
            fail(errors, "SEMANTIC_DIVERSITY_KIND", f"semantic evidence kind changed {aid}")
        if asset.get("unresolved") != EXPECTED_UNRESOLVED:
            fail(errors, "UNRESOLVED_BODY", f"unresolved evidence changed {aid}")
        expected_anchor_count = EXPECTED_ANCHOR_COUNTS.get(aid)
        if len(asset.get("source_anchors", [])) != expected_anchor_count:
            fail(errors, "ANCHOR_COUNT", f"expected {expected_anchor_count} anchors for {aid}")
        expected_meanings = EXPECTED_ANCHOR_MEANINGS.get(aid, [])
        if [anchor.get("meaning") for anchor in asset.get("source_anchors", [])] != expected_meanings:
            fail(errors, "ANCHOR_MEANINGS", f"anchor meaning changed {aid}")
        if asset.get("product_owner_status") != "unresolved":
            fail(errors, "OWNER_PROMOTION", f"product owner promoted {aid}")
        for key in ("legacy_implementation_status", "current_implementation_status", "current_operation_status", "current_acceptance_status", "current_degradation_status"):
            if asset.get(key) != "unknown":
                fail(errors, "IMPLEMENTATION_PROMOTION", f"{key} promoted for {aid}")
        if asset.get("legacy_execution_performed") is not False or asset.get("disposition") != "unresolved" or asset.get("authority_status") != "historical":
            fail(errors, "LEGACY_STATUS", f"legacy status promoted for {aid}")
        if asset.get("decision_matches") != 0 or asset.get("decision_record_refs"):
            fail(errors, "DECISION_PROMOTION", f"decision history invented for {aid}")
        if asset.get("copy_read_after_matches") != 0:
            fail(errors, "COPY_PROMOTION", f"copy/read-after history invented for {aid}")
        if asset.get("consumer_closure_status") != "pending" or asset.get("consumer_refs"):
            fail(errors, "CONSUMER_PROMOTION", f"consumer closure promoted for {aid}")
        failure = asset.get("failure_evidence", {})
        if failure.get("execution_receipts") != 0 or failure.get("failure_outcome_observed") is not False:
            fail(errors, "FAILURE_PROMOTION", f"failure receipt/outcome invented for {aid}")
        consumer = asset.get("consumer_evidence", {})
        if consumer.get("consumer_closure_observed") is not False:
            fail(errors, "CONSUMER_EVIDENCE", f"consumer closure invented for {aid}")
        for anchor in asset.get("source_anchors", []):
            start, end = anchor.get("line_start"), anchor.get("line_end")
            if not isinstance(start, int) or not isinstance(end, int) or start < 1 or end < start:
                fail(errors, "SOURCE_SPAN", f"invalid span {aid}")
                continue
            text = line_span(archive, start, end)
            if text != anchor.get("exact_text"):
                fail(errors, "SOURCE_TEXT", f"exact source span mismatch {aid}:{start}-{end}")
            if digest_bytes(text.encode("utf-8")) != anchor.get("source_span_sha256"):
                fail(errors, "SOURCE_SPAN_DIGEST", f"source span digest mismatch {aid}:{start}-{end}")

    aggregate = inv.get("aggregate_evidence", {})
    aggregate_expected = {
        "selected_asset_count": 12,
        "selected_asset_decision_matches": 0,
        "selected_asset_copy_read_after_matches": 0,
        "selected_failure_execution_receipts": 0,
        "selected_consumer_refs_nonempty": 0,
        "selected_consumer_closure_pending": 12,
        "selected_implementation_statuses": ["unknown"],
        "current_implementation_status": "unknown",
        "current_degradation_status": "unknown",
        "current_phase_admission": "unresolved_candidate_only",
    }
    for key, expected in aggregate_expected.items():
        if aggregate.get(key) != expected:
            fail(errors, "AGGREGATE", f"{key} expected {expected}, got {aggregate.get(key)}")

    count_expected = {
        "pool_rows": 78,
        "selected_rows": 12,
        "excluded_rows": 10,
        "remaining_unreviewed_rows": 56,
        "four_products": 4,
        "selected_source_anchors": 27,
    }
    counts = inv.get("counts", {})
    for key, expected in count_expected.items():
        if counts.get(key) != expected:
            fail(errors, "COUNTS", f"{key} expected {expected}, got {counts.get(key)}")
    if inv.get("prohibited_inference") != EXPECTED_PROHIBITED_INFERENCE:
        fail(errors, "PROHIBITED_INFERENCE", "prohibited inference text changed")
    verification = inv.get("verification_contract", {})
    if verification.get("required_commands") != EXPECTED_REQUIRED_COMMANDS:
        fail(errors, "REQUIRED_COMMANDS", "required commands changed")
    if verification.get("negative_cases") != EXPECTED_NEGATIVE_CASES:
        fail(errors, "NEGATIVE_CASES", "negative case contract changed")

    if errors:
        print("FAIL PHCAP15-FOLLOWUP")
        print("\n".join(errors))
        return 1
    print("PASS PHCAP15 follow-up: pool=78 excluded=10 selected=12 remaining=56")
    print("PASS source/archive digest, exact spans, phase/asset/decision/failure/consumer unknowns")
    print("PASS four-product candidate boundary and no authority/implementation promotion")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
