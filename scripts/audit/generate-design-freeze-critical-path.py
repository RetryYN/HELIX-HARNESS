#!/usr/bin/env python3
"""Generate the Design Freeze critical path without mixing runtime acceptance."""

from __future__ import annotations

import hashlib
import json
import re
import sys
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
GENERATED = ROOT / "docs/governance/generated"
READINESS = ROOT / "docs/governance/helix-requirements-freeze-readiness-ledger.md"


def load(name: str) -> tuple[Path, dict]:
    path = GENERATED / name
    return path, json.loads(path.read_text(encoding="utf-8"))


def source(path: Path, *, volatile_custody_hashes: bool = False) -> dict[str, object]:
    raw = path.read_bytes()
    profile = "raw-bytes-v1"
    if volatile_custody_hashes:
        text = raw.decode("utf-8")
        raw = re.sub(r"`[0-9a-f]{64}`", "`<VOLATILE_GENERATED_SHA256>`", text).encode("utf-8")
        profile = "utf8-backtick-sha256-custody-normalized-v1"
    return {
        "path": path.relative_to(ROOT).as_posix(),
        "sha256": hashlib.sha256(raw).hexdigest(),
        "digest_profile": profile,
    }


def blocker(
    blocker_id: str,
    workstream: str,
    axis: str,
    path: Path,
    denominator: object,
    closed: object,
    open_count: object,
    owner_class: str,
    next_evidence: str,
    status: str = "open",
    authority_state: str = "candidate_or_pending",
) -> dict[str, object]:
    return {
        "blocker_id": blocker_id,
        "workstream": workstream,
        "axis": axis,
        "source_artifact": source(path),
        "denominator": denominator,
        "closed": closed,
        "open": open_count,
        "status": status,
        "authority_state": authority_state,
        "owner_class": owner_class,
        "next_evidence": next_evidence,
    }


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: generate-design-freeze-critical-path.py OUTPUT.json")

    po_path, po = load("universal-workflow-po-decision-packet-v1.json")
    vm_path, vm = load("vmodel-authority-decision-packet-v1.json")
    bun_route_path, bun_route = load("helix-bun-plan-exact-design-route-candidates-v1.json")
    bun_route_review_path, bun_route_review = load("helix-bun-plan-exact-design-route-independent-review-v1.json")
    bun_review_path, bun_review = load("helix-bun-plan-replacement-reachability-review-v1.json")
    bun_historical_path, bun_historical = load("helix-bun-historical-stale-adjudication-v1.json")
    bun_historical_review_path, bun_historical_review = load("helix-bun-historical-stale-adjudication-independent-review-v1.json")
    bun_retain_path, bun_retain = load("helix-bun-historical-retain-evidence-readjudication-v1.json")
    bun_retain_review_path, bun_retain_review = load("helix-bun-historical-retain-evidence-independent-review-v1.json")
    bun_terminal_path, bun_terminal = load("helix-df-bun-002-terminal-design-receipts-v1.json")
    bun_terminal_review_path, bun_terminal_review = load("helix-df-bun-002-terminal-design-receipts-independent-review-v1.json")
    hybrid_path, hybrid = load("hybrid-python-disposition-semantic-review-v1.json")
    universal_route_path, universal_route = load("universal-workflow-anchor-route-semantic-review-v1.json")
    answer_path, answer = load("universal-workflow-interview-answerability-audit-v1.json")
    nonpo_path, nonpo = load("universal-nonpo-question-design-closure-v1.json")
    nonpo_review_path, nonpo_review = load("universal-nonpo-question-design-closure-independent-review-v1.json")
    nonpo_authority_path, nonpo_authority = load("universal-nonpo-authority-resolution-v1.json")
    nonpo_authority_review_path, nonpo_authority_review = load("universal-nonpo-authority-resolution-independent-review-v1.json")
    rebaseline_path, rebaseline = load("helix-rebaseline-v040-route51-design-ac18-review-v1.json")
    exact2_path, exact2 = load("exact2-custody-replay-readiness-v1.json")
    exact2_atoms_path, exact2_atoms = load("exact2-atomic-behavior-manifest-v1.json")
    exact2_normalization_path, exact2_normalization = load("exact2-semantic-normalization-manifest-v1.json")
    exact2_normalization_review_path, exact2_normalization_review = load("exact2-semantic-normalization-independent-review-v1.json")
    savepoint_review_path, savepoint_review = load("repository-savepoint-layer-tag-design-independent-review-v1.json")
    layer_review_path, layer_review = load("l1-l12-layer-semantics-remediation-independent-review-v3.json")
    test_route_path, test_route = load("predecessor-pr-test-retention-routes-71-v1.json")
    chat_path, chat = load("chat-independent-review-receipt-v1.json")
    activation_path, activation = load("po7-activation-runtime-independent-audit-v1.json")

    po_groups = po["summary"]["decision_groups"]
    vm_missing = vm["counts"]["missing_po_decisions"]
    if po_groups != 6 or vm_missing != 1:
        raise SystemExit("PO authority denominator drift")
    if bun_route["summary"]["route_records"] != 2210:
        raise SystemExit("Bun route denominator drift")
    if hybrid["summary"]["candidate_rows"] != 229:
        raise SystemExit("Hybrid denominator drift")
    po_activated = (
        activation.get("status") == "independent_audit_pass_authority_activated"
        and activation.get("projection", {}).get("decision_groups_activated") == 6
        and activation.get("projection", {}).get("question_receipts_activated") == 22
        and activation.get("projection", {}).get("vmodel_authority_events") == 1
        and activation.get("projection", {}).get("freeze_blocker_status") == "closed"
        and activation.get("safety", {}).get("authority_activation_credit") == 1
    )

    bun_design_closed = (
        bun_terminal_review["status"].startswith("independent_review_pass_")
        and bun_terminal_review["decision"]["design_freeze"].startswith("closed_")
        and bun_terminal["design_freeze_decision"]["open_design_obligations"] == 0
    )
    exact2_review_current = (
        exact2_normalization_review["sources"]["normalization_manifest"]["sha256"]
        == source(exact2_normalization_path)["sha256"]
    )
    exact2_design_closed = (
        exact2_review_current
        and exact2_normalization_review["status"].startswith("design_closure_accepted_")
        and exact2_normalization_review["decision"]["pending_zero_recognized_as_design_closure"] is True
    )
    exact2_issue_counts = exact2_normalization_review.get("findings", {}).get("issue_counts", {})
    exact2_review_findings = sum(exact2_issue_counts.values()) if isinstance(exact2_issue_counts, dict) else 0
    layer_findings = layer_review.get("findings")
    layer_summary = layer_review.get("summary", {})
    layer_open = {
        "findings": len(layer_findings) if isinstance(layer_findings, list) else 1,
        "independent_open_backlog": layer_summary.get("independent_open_backlog", 1),
        "producer_open_backlog": layer_summary.get("producer_open_backlog", 1),
        "unresolved": layer_summary.get("unresolved", 1),
    }
    layer_design_closed = (
        layer_review.get("status") == "independent_review_pass_design_closed_runtime_unchanged"
        and isinstance(layer_findings, list)
        and not layer_findings
        and all(value == 0 for value in layer_open.values())
    )

    design = [
        blocker(
            "DF-PO-001", "PO authority", "design_freeze", po_path,
            {"decision_groups": po_groups, "source_questions": po["summary"]["source_questions"]},
            {"selected_groups": 6 if po_activated else 0}, {"decision_groups": 0 if po_activated else po_groups}, "PO",
            "none; six A selections are bound to the GO authority event and activation receipt" if po_activated else "six mutually exclusive PO selections bound to the packet digest and answer activation receipt",
            status="closed" if po_activated else "open",
            authority_state="activated_current_independent_receipt" if po_activated else "candidate_or_pending",
        ),
        blocker(
            "DF-PO-002", "PO authority", "design_freeze", vm_path,
            {"authority_decisions": vm["counts"]["decisions"], "missing_po_decisions": vm_missing},
            {"approved": 1 if po_activated else 0}, {"VMAUTH-PO-01": 0 if po_activated else vm_missing}, "PO",
            "none; VMAUTH-PO-01 is activated against the current packet/source digests" if po_activated else "PO approval event binding VMAUTH-PO-01 to the current packet and source snapshot digests",
            status="closed" if po_activated else "open",
            authority_state="activated_current_independent_receipt" if po_activated else "candidate_or_pending",
        ),
        blocker(
            "DF-BUN-001", "Bun atom-specific route repair", "design_freeze", bun_route_review_path,
            {"active_atoms": bun_route["summary"]["route_records"], "semantic_families": bun_route_review["summary"]["semantic_layers"]},
            {"atom_specific_routes": bun_route_review["summary"]["route_complete_candidates"]},
            {"challenge_gap_obligations": bun_route["summary"]["route_records"] - bun_route_review["summary"]["route_complete_candidates"]}, "AI",
            "none for the independently reviewed 2,210 design routes; runtime replacement remains RA-BUN-001 and historical reclassification remains DF-BUN-002",
            status="closed",
            authority_state="independent_design_review_current_not_runtime_verified",
        ),
        blocker(
            "DF-BUN-002", "Bun historical/stale disposition", "design_freeze", bun_terminal_review_path,
            {"terminal_design_rows": bun_terminal["design_freeze_decision"]["denominator"], "current_bun_string_overlap_evidence": bun_retain["summary"]["current_bun_string_candidates"]},
            {**bun_terminal["design_freeze_decision"]["closed"], "current_bun_string_authority_fixture_classification": bun_retain["summary"]["current_bun_string_design_obligations"]},
            {"design_obligations": 0 if bun_design_closed else bun_terminal["design_freeze_decision"]["denominator"]}, "AI",
            "none for Design Freeze after current independent terminal review; implementation, retirement evidence, and Bun-zero proof remain transferred to RA-BUN-001" if bun_design_closed else "obtain a current passing independent review of all terminal receipts without runtime credit",
            status="closed" if bun_design_closed else "open",
            authority_state="independent_terminal_design_closed_runtime_acceptance_open" if bun_design_closed else "terminal_candidate_independent_review_not_passed",
        ),
        blocker(
            "DF-UNIVERSAL-002", "Universal 76 question closure", "design_freeze", nonpo_authority_review_path,
            {"questions": 76, "po_questions_excluded_to_DF_PO_001": 22, "non_po_questions": nonpo_review["summary"]["records"]},
            {"non_po_design_answer_receipts": nonpo_review["summary"]["statuses"]["design_answer_receipt_activated_source_limited"], "non_po_terminal_information_or_dependency_receipts": nonpo_authority_review["summary"]["records"], "po_questions_governed_by_DF_PO_001": 22},
            {"design_obligations": 0},
            "mixed",
            "none for non-PO Design obligations; answer/model activation is aggregated once under DF-PO-002 VMAUTH-PO-01 and high-impact execution gates remain separate",
            status="closed",
            authority_state="independent_design_review_current_activation_aggregated_to_VMAUTH_PO_01",
        ),
        blocker(
            "DF-EXACT2-001", "exact2 behavior disposition", "design_freeze", exact2_normalization_review_path,
            {"repositories": 2, "unique_path_content": exact2_atoms["summary"]["unique_path_content"], "behavior_atoms": exact2_normalization["summary"]["source_candidates"]},
            {"design_dispositioned_candidates": exact2_normalization["summary"]["source_candidates"] if exact2_design_closed else 0, "terminal_non_adopt_atoms": exact2_normalization["summary"]["terminal_non_adopt_atoms"] if exact2_design_closed else 0},
            {"independent_review_findings": 0 if exact2_design_closed else exact2_review_findings, "review_current": exact2_review_current, "pending_zero_claimed": exact2_normalization["summary"]["pending_design_disposition"]}, "AI",
            "none for Design Freeze after a current passing normalization review; custody/replay remains RA-EXACT2-001" if exact2_design_closed else exact2_normalization_review["decision"]["required_correction"],
            status="closed" if exact2_design_closed else "open",
            authority_state="independent_normalization_design_closed_runtime_acceptance_open" if exact2_design_closed else "current_independent_normalization_review_fail_closed",
        ),
        blocker(
            "DF-LAYER-SEM-001", "L1-L12 layer semantics", "design_freeze", layer_review_path,
            {"strict_review": 1, "reviewed_findings": len(layer_findings) if isinstance(layer_findings, list) else None},
            {"strict_review_passed": 1 if layer_design_closed else 0},
            {key: 0 if layer_design_closed else value for key, value in layer_open.items()}, "AI",
            "none; strict v3 review closes Design semantics only and does not grant runtime or coverage credit" if layer_design_closed else "regenerate the strict v3 review and close every finding, independent/producer backlog, and unresolved coordinate",
            status="closed" if layer_design_closed else "open",
            authority_state="independent_layer_semantics_design_closed_runtime_unchanged" if layer_design_closed else "strict_layer_semantics_review_fail_closed",
        ),
        blocker(
            "DF-CHAT-001", "chat source limitation", "design_freeze", chat_path,
            {"semantic_rows": chat["counts"]["semantic_rows"], "visible_occurrences": chat["counts"]["visible_occurrences"]},
            {"semantic_rows": 61, "visible_occurrences": 44, "source_limitation_accepted": 1},
            0, "dependency",
            "stale and regenerate only when a new transcript source or new chat correction becomes available",
            status="closed_source_limited",
        ),
    ]

    runtime = [
        blocker(
            "RA-BUN-001", "Bun runtime replacement", "runtime_acceptance", bun_review_path,
            2210, 0, 2210, "AI",
            "implemented Node artifacts, replayed oracles, independent execution receipts, and active Bun zero",
        ),
        blocker(
            "RA-HYBRID-001", "Hybrid Python runtime", "runtime_acceptance", hybrid_path,
            {"callables": 229, "fixture_cases": 687},
            {"executed": 0, "verified": 0}, {"callables": 229, "fixture_cases": 687}, "AI",
            "Node-revalidated proposal-worker executions with failure and transaction receipts",
        ),
        blocker(
            "RA-UNIVERSAL-001", "Universal runtime activation", "runtime_acceptance", universal_route_path,
            {"routes": 328, "questions": 76}, {"executed": 0, "verified": 0},
            {"routes": 328, "questions": 76}, "AI",
            "migration execution, conflict fixtures, activated authority, and verified route receipts",
        ),
        blocker(
            "RA-REBASELINE-001", "Rebaseline runtime closure", "runtime_acceptance", rebaseline_path,
            {"design_ac_cases": 18}, {"executed": 0}, {"design_ac_cases": 18}, "AI",
            "execute all 18 closure cases and bind observed failure/evidence receipts",
        ),
        blocker(
            "RA-EXACT2-001", "exact2 custody/replay", "runtime_acceptance", exact2_path,
            {"repositories": 2, "historical_checks": 71},
            {"trusted_receipts": 0, "restore_drills": 0, "historical_retained": 0},
            {"trusted_receipts": 2, "restore_drills": 2, "historical_checks": 71}, "dependency",
            "trusted CAS promotion, offline manifests, isolated restore drills, replay and historical test retention receipts",
        ),
    ]

    owner_counts = Counter(row["owner_class"] for row in design if row["status"] == "open")
    workstream_counts = Counter(row["workstream"] for row in design if row["status"] == "open")
    artifact = {
        "schema_version": "helix.design-freeze-critical-path.v1",
        "status": "design_freeze_authority_activated_runtime_separated" if po_activated else "critical_path_open_runtime_separated",
        # readiness ledgerは本critical artifactのcustody SHAも保持するため、raw hashでは
        # 相互自己参照になる。backtick付きgenerated SHAだけを正規化し、prose/ID/pathは保持する。
        "source_readiness_ledger": source(READINESS, volatile_custody_hashes=True),
        "current_nonblocking_review_sources": [
            {**source(nonpo_authority_review_path), "role": "universal_nonpo_authority", "status": nonpo_authority_review["status"]},
            {**source(savepoint_review_path), "role": "savepoint_layer_tag_design", "status": savepoint_review["status"]},
            {**source(activation_path), "role": "po7_authority_activation", "status": activation["status"]},
        ],
        "summary": {
            "design_freeze_rows": len(design),
            "design_freeze_open_rows": sum(row["status"] == "open" for row in design),
            "design_freeze_closed_rows": sum(row["status"] == "closed" for row in design),
            "design_freeze_closed_source_limited_rows": sum(row["status"] == "closed_source_limited" for row in design),
            "design_freeze_pending_independent_review_rows": sum("pending_independent" in row["authority_state"] for row in design),
            "runtime_acceptance_rows_separated": len(runtime),
            "open_by_owner_class": dict(sorted(owner_counts.items())),
            "open_by_workstream": dict(sorted(workstream_counts.items())),
            "po_authority_decision_units": po_groups + vm_missing,
            "po_authority_activated_units": po_groups + vm_missing if po_activated else 0,
            "design_reviewed_nonblockers": {
                "hybrid_nonadopt_boundary_rows": hybrid["summary"]["nonadopt_expected_boundary_mismatches"],
                "bun_historical_stale_custody_dispositions": bun_historical["summary"]["rows"],
                "universal_nonpo_design_obligations": nonpo_authority_review["summary"]["records"],
                "rebaseline_defer_rows": rebaseline["route_review"]["disposition_counts"]["defer"],
                "universal_semantic_routes": universal_route["verification_boundary"]["independent_semantic_review_pass"],
                "exact2_candidate_test_oracle_routes": test_route["summary"]["candidate_test_oracle_routes"],
                "savepoint_layer_tag_design_findings_closed": savepoint_review["summary"]["closed_design_not_implemented"],
            },
            "runtime_execution_credit_in_design_freeze": 0,
            "design_runtime_double_count_rows": 0,
            "coverage_credit_true": 0,
            "verified_true": 0,
        },
        "invariants": [
            "runtime execution zero is not itself a Design Freeze blocker",
            "candidate, reviewed, activated, executed, verified, and source-limited are distinct states",
            "PO-owned decisions are never auto-selected",
            "unknown behavior denominators are not converted to zero",
            "source limitation closure does not claim raw transcript completeness",
            "expected non-adopt Node ownership boundaries are not Design Freeze failures",
            "explicit defer is a candidate design disposition and is not counted as missing design",
            "route activation and execution remain runtime/authority acceptance, not Design Freeze design work",
            "PO question units compressed into decision groups are not counted again in Universal non-PO open units",
            "exact2 candidate denominator remains pending until its independent atomic review is current",
            "non-PO information receipts are not counted again as PO decision units or runtime activation",
            "Design and runtime blocker identity intersection is zero",
        ],
        "design_freeze_critical_path": design,
        "runtime_acceptance_blockers_separated": runtime,
    }
    Path(sys.argv[1]).write_text(
        json.dumps(artifact, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
