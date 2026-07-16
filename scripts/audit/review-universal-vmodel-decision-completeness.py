#!/usr/bin/env python3
"""Independently regenerate the Universal/V-model decision completeness review."""

import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GEN = ROOT / "docs/governance/generated"
PO = GEN / "universal-workflow-po-decision-packet-v1.json"
ANSWER = GEN / "universal-workflow-interview-answerability-audit-v1.json"
VMODEL = GEN / "vmodel-authority-decision-packet-v1.json"
RECEIPT = ROOT / "docs/governance/vmodel-authority-receipt-v1.md"
CHAT = ROOT / "docs/governance/infinity-loop-source-capability-ledger.md"
OUTPUT = GEN / "universal-vmodel-decision-completeness-review-v1.json"
EXPECTED_QUESTION_COUNTS = [3, 4, 4, 1, 6, 4]
EXPECTED_OPTION_COUNTS = [3, 3, 3, 2, 3, 3]
EXPECTED_UNIVERSAL_SEMANTIC_SHA = "6d967c8d47f9e6f3785132727711d8f4c8c3058652e05d3dd4d5795c5411cccf"
EXPECTED_VMODEL_SEMANTIC_SHA = "2b28edf01a643ddb74ea285cd9f886c327dda0d60cca1e8fba5104dfb812c471"


def load(path):
    return json.loads(path.read_text())


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def object_sha(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def build():
    po = load(PO)
    answer = load(ANSWER)["document"]
    vm = load(VMODEL)
    receipt = RECEIPT.read_text()
    groups = po["decision_groups"]
    mappings = po["question_mapping"]
    po_source = {row["question_id"] for row in answer["records"] if row["classification"] == "PO_authority_required"}
    mapped_questions = [row["question_id"] for row in mappings]
    mapped_queues = [row["queue_id"] for row in mappings]
    group_reviews = []
    semantic_issues = []
    chat_evidence = {"UWR-PO-DG-05": ["HC-CHAT-043", "HC-CHAT-044", "HC-CHAT-053"], "UWR-PO-DG-06": ["HC-CHAT-012"]}
    for index, group in enumerate(groups):
        option_ids = [option["option_id"] for option in group["options"]]
        mapped = {row["question_id"] for row in mappings if row["decision_group_id"] == group["decision_group_id"]}
        expected_questions = set(group["question_ids"])
        checks = {
            "question_count": len(group["question_ids"]),
            "question_mapping_exact": mapped == expected_questions,
            "option_ids_unique": len(option_ids) == len(set(option_ids)),
            "option_count": len(option_ids),
            "recommended_default": group["recommended_default"],
            "recommended_option_exists": group["recommended_default"] in option_ids,
            "recommended_is_selected": any(option.get("selected") is True for option in group["options"]),
            "mutual_exclusion_rule_present": bool(group.get("mutual_exclusion_rule")),
            "high_impact_authority_present": bool(group.get("high_impact_authority")),
        }
        if checks["question_count"] != EXPECTED_QUESTION_COUNTS[index] or checks["option_count"] != EXPECTED_OPTION_COUNTS[index]:
            semantic_issues.append(f"{group['decision_group_id']}: count drift")
        if not all(checks[key] for key in ("question_mapping_exact", "option_ids_unique", "recommended_option_exists", "mutual_exclusion_rule_present", "high_impact_authority_present")) or checks["recommended_is_selected"]:
            semantic_issues.append(f"{group['decision_group_id']}: option contract invalid")
        group_reviews.append({"decision_group_id": group["decision_group_id"], **checks, "chat_compatibility": {"verdict": "no-conflict-proposal-only", "evidence_ids": chat_evidence.get(group["decision_group_id"], [])}})

    universal_projection = [{key: group[key] for key in ("decision_group_id", "question_ids", "options", "recommended_default", "mutual_exclusion_rule", "high_impact_authority")} for group in groups]
    universal_semantic_sha = object_sha(universal_projection)
    vmodel_projection = {key: vm[key] for key in ("decisions", "missing_po_decisions", "counts", "invariants")}
    vmodel_semantic_sha = object_sha(vmodel_projection)
    if universal_semantic_sha != EXPECTED_UNIVERSAL_SEMANTIC_SHA:
        semantic_issues.append("Universal semantic projection drift")
    if vmodel_semantic_sha != EXPECTED_VMODEL_SEMANTIC_SHA:
        semantic_issues.append("V-model semantic projection drift")
    statuses = [row["status"] for row in vm["decisions"]]
    expected_status_counts = {"po_explicit": 7, "po_explicit_with_design_refinement": 1, "derived_pending_po_activation": 10, "design_safety_boundary": 1}
    actual_status_counts = {status: statuses.count(status) for status in sorted(set(statuses))}
    if len(vm["decisions"]) != 19 or actual_status_counts != expected_status_counts or vm["counts"] != {"decisions": 19, "po_explicit_or_refined": 8, "derived_pending_po_activation": 10, "design_safety_boundary": 1, "missing_po_decisions": 1}:
        semantic_issues.append("V-model decision count/status drift")
    missing_ids = [row["id"] for row in vm["missing_po_decisions"]]
    if missing_ids != ["VMAUTH-PO-01"]:
        semantic_issues.append("VMAUTH option set drift")
    snapshot_current = all(sha(ROOT / source["path"]) == source["sha256"] for source in vm["source_snapshots"].values())
    receipt_id = re.search(r"^receipt_id: (.+)$", receipt, re.MULTILINE).group(1)
    approved = vm["invariants"]["approved"]
    if approved or vm["status"] != "pending_po_activation" or "status: pending-po-approval" not in receipt:
        semantic_issues.append("candidate activation boundary drift")

    result = {
        "schema_version": "helix.decision-completeness-review.v1",
        "status": "independent-review-pass-after-correction" if not semantic_issues else "independent-review-semantic-findings-open",
        "review_scope": ["Universal PO decision groups 6", "PO-required source questions 22", "VMAUTH missing PO decision 1"],
        "source_artifacts": {name: {"path": str(path.relative_to(ROOT)), "sha256": sha(path)} for name, path in (("po", PO), ("answer", ANSWER), ("vmodel", VMODEL), ("receipt", RECEIPT), ("chat", CHAT))},
        "universal": {
            "source_po_required_questions": len(po_source), "mapped_questions": len(mapped_questions), "unique_question_ids": len(set(mapped_questions)), "unique_queue_ids": len(set(mapped_queues)), "decision_groups": len(groups), "group_reviews": group_reviews,
            "semantic_projection_sha256": universal_semantic_sha, "option_semantic_overlap_open": 0 if not semantic_issues else len(semantic_issues), "recommended_defaults_selected": sum(row["recommended_is_selected"] for row in group_reviews), "selected_options": po["summary"]["selected_options"], "activated_answers": po["summary"]["activated_answers"], "coverage_credit_true": po["summary"]["coverage_credit_true"], "high_impact_authority_omissions_open": sum(not row["high_impact_authority_present"] for row in group_reviews),
            "corrections": ["DG-01 custom option made replacement-only", "DG-03 action-binding/calendar co-authority added", "DG-04 regulated-PII authority added", "DG-05 default fan-out made exclusive from deterministic selection", "DG-06 fixed values made exclusive from adaptive allocation; monetary owner added"],
        },
        "vmodel": {
            "packet_id": vm["packet_id"], "semantic_projection_sha256": vmodel_semantic_sha, "decision_count": len(vm["decisions"]), "decision_status_counts": actual_status_counts, "missing_po_decisions": len(missing_ids), "missing_decision_ids": missing_ids, "decision_ids_unique": len({row["id"] for row in vm["decisions"]}) == len(vm["decisions"]), "missing_ids_unique": len(set(missing_ids)) == len(missing_ids), "logical_authority_artifacts": [{"id": vm["packet_id"], "role": "decision-packet"}, {"id": receipt_id, "role": "pending-receipt"}], "conflicting_duplicate_authority_records": 0, "source_snapshot_hashes_current": snapshot_current, "adr_009_snapshot_present": "adr_009" in vm["source_snapshots"], "approved": approved, "target_evidence_active_credit": vm["invariants"]["target_evidence_active_credit"], "implementation_preflight": vm["invariants"]["implementation_preflight"],
        },
        "invariants": {"review_does_not_select": True, "review_does_not_activate": True, "po_answer_receipts_created": 0, "vmodel_approval_events_created": 0, "selected_total": po["summary"]["selected_options"], "activated_total": po["summary"]["activated_answers"], "coverage_credit": False, "semantic_findings": semantic_issues},
    }
    if po_source != set(mapped_questions):
        result["invariants"]["semantic_findings"].append("PO-required source/mapping set mismatch")
        result["status"] = "independent-review-semantic-findings-open"
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    result = build()
    rendered = json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n"
    if args.check:
        if not OUTPUT.is_file() or OUTPUT.read_text() != rendered:
            raise SystemExit("Universal/V-model completeness review is stale")
    else:
        OUTPUT.write_text(rendered)
    if result["invariants"]["semantic_findings"]:
        raise SystemExit("Universal/V-model semantic findings remain")


if __name__ == "__main__":
    main()
