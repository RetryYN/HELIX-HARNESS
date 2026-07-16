#!/usr/bin/env python3
"""Independently review Universal non-PO authority resolution."""

import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CANDIDATE = ROOT / "docs/governance/generated/universal-nonpo-authority-resolution-v1.json"
CLOSURE = ROOT / "docs/governance/generated/universal-nonpo-question-design-closure-v1.json"
CLOSURE_REVIEW = ROOT / "docs/governance/generated/universal-nonpo-question-design-closure-independent-review-v1.json"
PO_PACKET = ROOT / "docs/governance/generated/universal-workflow-po-decision-packet-v1.json"
VMAUTH = ROOT / "docs/governance/vmodel-authority-receipt-v1.md"
OUTPUT = ROOT / "docs/governance/generated/universal-nonpo-authority-resolution-independent-review-v1.json"


def load(path):
    return json.loads(path.read_text())


def digest(value):
    raw = json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode()
    return hashlib.sha256(raw).hexdigest()


def file_digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build():
    candidate = load(CANDIDATE)
    closure = load(CLOSURE)
    closure_review = load(CLOSURE_REVIEW)
    po = load(PO_PACKET)
    vm_text = VMAUTH.read_text()
    source = {r["question_id"]: r for r in closure["records"] if r["closure"]["class"] != "existing_po_chat_answer_design_receipt"}
    po_ids = {qid for group in po["decision_groups"] for qid in group["question_ids"]}
    findings = []
    reviews = []
    domains = set()
    dependency_terminal = 0
    evidence_terminal = 0
    for embedded in candidate.get("sources", []):
        path = ROOT / embedded["path"]
        if not path.exists() or file_digest(path) != embedded["sha256"]:
            findings.append({"question_id": None, "code": "candidate_embedded_source_stale", "path": embedded["path"]})
    if closure_review["status"] != "independent_review_pass_design_evidence_rebound_authority_separated":
        findings.append({"question_id": None, "code": "upstream_closure_review_not_pass", "status": closure_review["status"]})
    for row in candidate["records"]:
        qid = row["question_id"]
        issues = []
        src = source.get(qid)
        if not src:
            issues.append("source_question_missing")
        if qid in po_ids or row["po22_overlap"]:
            issues.append("nonpo_po22_overlap")
        if src and row["authority_source"]["required_authorities"] != src["closure"]["authority"]["required_for_activation"]:
            issues.append("authority_fields_drift")
        receipt = row["resolution"].get("terminal_design_receipt")
        if not receipt:
            issues.append("terminal_receipt_missing")
        elif digest({k: v for k, v in receipt.items() if k != "receipt_sha256"}) != receipt.get("receipt_sha256"):
            issues.append("terminal_receipt_digest_mismatch")
        if row["original_class"] == "evidence_answered_reaudit":
            evidence_terminal += 1
            if row["resolution"]["status"] != "terminal_design_evidence_current_activation_pending":
                issues.append("information_question_not_terminalized")
            if row["resolution"]["owner_class"].startswith("PO_"):
                issues.append("individual_PO_owner_incorrect")
            if src and receipt and receipt.get("answer_value_sha256") != src["closure"].get("answer_value_sha256"):
                issues.append("answer_digest_drift")
        else:
            dependency_terminal += 1
            if row["resolution"]["status"] not in {"ai_terminal_defer_receipt_candidate", "ai_terminal_challenge_receipt_candidate"}:
                issues.append("dependency_terminal_disposition_invalid")
            if not receipt or receipt.get("answer_activated") is not False:
                issues.append("dependency_receipt_activation_boundary_invalid")
        domain = receipt.get("high_impact_domain") if receipt else None
        if domain:
            domains.add(domain)
        if row["resolution"]["answer_activated"] or row["runtime_verified"] or row["coverage_credit"]:
            issues.append("forbidden_activation_or_credit")
        reviews.append({"question_id": qid, "source_question": src["source_question"] if src else None, "original_class": row["original_class"], "authority_fields": row["authority_source"]["required_authorities"], "resolution_owner": row["resolution"]["owner_class"], "high_impact_domain": domain, "findings": issues})
        findings.extend({"question_id": qid, "code": issue} for issue in issues)
    if len(po["decision_groups"]) != 6:
        findings.append({"question_id": None, "code": "universal_decision_group_count_drift"})
    if "追加PO判断は`VMAUTH-PO-01`の1件だけに集約する" not in vm_text:
        findings.append({"question_id": None, "code": "VMAUTH_single_PO_unit_not_supported"})
    summary = candidate["summary"]
    if summary.get("po_decision_units_total") != 7 or summary.get("individual_po_answers_required_for_evidence_rows") != 0:
        findings.append({"question_id": None, "code": "PO_decision_unit_recalculation_invalid"})
    if len(domains) != 2:
        findings.append({"question_id": None, "code": "high_impact_grouping_invalid"})
    return {
        "schema_version": "helix.universal-nonpo-authority-resolution-independent-review.v1",
        "status": "independent_review_pass" if not findings else "independent_review_findings_open",
        "sources": {"candidate": {"path": str(CANDIDATE.relative_to(ROOT)), "sha256": file_digest(CANDIDATE)}, "closure": {"path": str(CLOSURE.relative_to(ROOT)), "sha256": file_digest(CLOSURE)}, "closure_review": {"path": str(CLOSURE_REVIEW.relative_to(ROOT)), "sha256": file_digest(CLOSURE_REVIEW)}, "po_packet": {"path": str(PO_PACKET.relative_to(ROOT)), "sha256": file_digest(PO_PACKET)}, "vmodel_authority": {"path": str(VMAUTH.relative_to(ROOT)), "sha256": file_digest(VMAUTH)}},
        "decision": {"non_po_semantics": "37 evidence-current rows are information/design questions, not 37 PO option decisions", "po_decision_units": {"existing_universal_groups": 6, "additional_VMAUTH": 1, "total": 7, "individual_answers_for_37": 0}, "high_impact_authority_units": sorted(domains), "standing_authorization_substitution": 0, "activation": "pending"},
        "summary": {"records": len(reviews), "evidence_terminal_receipts": evidence_terminal, "dependency_terminal_receipts": dependency_terminal, "records_with_findings": len({x["question_id"] for x in findings}), "finding_count": len(findings), "runtime_verified": 0, "coverage_credit_true": 0},
        "findings": findings,
        "records": reviews,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    result = build()
    rendered = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text() != rendered:
            raise SystemExit("independent review artifact is stale")
    else:
        OUTPUT.write_text(rendered)
    if result["findings"]:
        raise SystemExit("independent review findings remain")


if __name__ == "__main__":
    main()
