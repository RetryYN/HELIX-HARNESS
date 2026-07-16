#!/usr/bin/env python3
"""Independently replay the current Universal non-PO closure/authority chain."""

import argparse
import hashlib
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GENERATED = ROOT / "docs/governance/generated"
ARTIFACTS = {
    "closure_candidate": GENERATED / "universal-nonpo-question-design-closure-v1.json",
    "closure_review": GENERATED / "universal-nonpo-question-design-closure-independent-review-v1.json",
    "authority_candidate": GENERATED / "universal-nonpo-authority-resolution-v1.json",
    "authority_review": GENERATED / "universal-nonpo-authority-resolution-independent-review-v1.json",
}
PO_PACKET = GENERATED / "universal-workflow-po-decision-packet-v1.json"
VMAUTH_PACKET = GENERATED / "vmodel-authority-decision-packet-v1.json"
OUTPUT = GENERATED / "universal-nonpo-current-chain-independent-audit-v1.json"


def load(path: Path):
    return json.loads(path.read_text())


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def source_entries(document):
    sources = document.get("sources") or document.get("source") or {}
    if isinstance(sources, list):
        return sources
    if "path" in sources:
        return [sources]
    return list(sources.values())


def build():
    docs = {name: load(path) for name, path in ARTIFACTS.items()}
    closure = docs["closure_candidate"]
    closure_review = docs["closure_review"]
    authority = docs["authority_candidate"]
    authority_review = docs["authority_review"]
    po_packet = load(PO_PACKET)
    vmauth_packet = load(VMAUTH_PACKET)
    findings = []
    digest_checks = []

    for owner, document in docs.items():
        for embedded in source_entries(document):
            path = ROOT / embedded["path"]
            actual = sha256(path) if path.is_file() else None
            current = actual == embedded["sha256"]
            digest_checks.append({
                "owner": owner,
                "path": embedded["path"],
                "embedded_sha256": embedded["sha256"],
                "current_sha256": actual,
                "current": current,
            })
            if not current:
                findings.append({"code": "embedded_source_digest_stale", "owner": owner, "path": embedded["path"]})

    classes = Counter(row["closure"]["class"] for row in closure["records"])
    expected_classes = {
        "existing_po_chat_answer_design_receipt": 12,
        "evidence_answered_reaudit": 37,
        "dependency_reaudit": 5,
    }
    if len(closure["records"]) != 54 or dict(classes) != expected_classes:
        findings.append({"code": "closure_partition_not_54_equals_12_plus_37_plus_5", "actual": dict(classes)})

    authority_classes = Counter(row["original_class"] for row in authority["records"])
    expected_authority = {"evidence_answered_reaudit": 37, "dependency_reaudit": 5}
    if len(authority["records"]) != 42 or dict(authority_classes) != expected_authority:
        findings.append({"code": "authority_partition_not_42_equals_37_plus_5", "actual": dict(authority_classes)})

    closure_nonpo_ids = {
        row["question_id"] for row in closure["records"]
        if row["closure"]["class"] != "existing_po_chat_answer_design_receipt"
    }
    authority_ids = {row["question_id"] for row in authority["records"]}
    if authority_ids != closure_nonpo_ids:
        findings.append({"code": "authority_set_not_exact_closure_37_plus_5"})

    for name, review, expected in (
        ("closure_review", closure_review, 54),
        ("authority_review", authority_review, 42),
    ):
        summary = review["summary"]
        review_findings = review.get("findings", [])
        open_findings = review_findings if name == "authority_review" else [
            row for row in review_findings if row.get("issues")
        ]
        if open_findings or summary.get("records_with_findings") != 0 or summary.get("finding_count", 0) != 0:
            findings.append({"code": "upstream_review_findings_nonzero", "owner": name})
        if summary.get("records") != expected:
            findings.append({"code": "upstream_review_record_count_drift", "owner": name})

    po_groups = po_packet["decision_groups"]
    po_ids = {qid for group in po_groups for qid in group["question_ids"]}
    if len(po_groups) != 6 or po_packet["summary"]["decision_groups"] != 6:
        findings.append({"code": "po_decision_groups_not_six"})
    if len(vmauth_packet["missing_po_decisions"]) != 1 or vmauth_packet["missing_po_decisions"][0]["id"] != "VMAUTH-PO-01":
        findings.append({"code": "vmodel_authority_unit_not_single_VMAUTH_PO_01"})
    if authority_ids & po_ids:
        findings.append({"code": "authority_rows_overlap_existing_po_questions"})
    summary = authority["summary"]
    if any((summary.get("po_decision_units_existing_universal_groups") != 6,
            summary.get("po_decision_units_additional_vmodel_authority") != 1,
            summary.get("po_decision_units_total") != 7,
            summary.get("individual_po_answers_required_for_evidence_rows") != 0)):
        findings.append({"code": "po_unit_summary_not_6_plus_1_with_zero_additional_37"})

    runtime_true = sum(row.get("runtime_verified") is True for row in authority["records"])
    coverage_true = sum(row.get("coverage_credit") is True for row in closure["records"]) + sum(
        row.get("coverage_credit") is True for row in authority["records"]
    )
    if runtime_true or coverage_true:
        findings.append({"code": "runtime_or_coverage_credit_nonzero"})

    provenance_checks = 0
    for row in closure["records"]:
        if row["closure"]["class"] == "dependency_reaudit":
            continue
        for evidence in row["closure"].get("provenance", []):
            path = ROOT / evidence["path"]
            actual = sha256(path) if path.is_file() else None
            provenance_checks += 1
            if evidence.get("current_sha256") != actual or evidence.get("rebound_artifact_digest") != f"sha256:{actual}":
                findings.append({"code": "provenance_current_digest_stale", "question_id": row["question_id"], "path": evidence["path"]})

    return {
        "schema_version": "helix.universal-nonpo-current-chain-independent-audit.v1",
        "status": "independent_audit_pass" if not findings else "independent_audit_findings_open",
        "sources": {name: {"path": str(path.relative_to(ROOT)), "sha256": sha256(path)} for name, path in ARTIFACTS.items()},
        "recalculated": {
            "closure_records": len(closure["records"]),
            "closure_partition": dict(classes),
            "authority_records": len(authority["records"]),
            "authority_partition": dict(authority_classes),
            "authority_exact_set_match": authority_ids == closure_nonpo_ids,
            "upstream_review_findings": sum(bool(row.get("issues")) for row in closure_review.get("findings", [])) + len(authority_review.get("findings", [])),
            "po_decision_units": {"existing_universal_groups": len(po_groups), "additional_vmodel_authority": 1, "total": len(po_groups) + 1},
            "additional_individual_po_units_for_37": summary.get("individual_po_answers_required_for_evidence_rows"),
            "runtime_verified_true": runtime_true,
            "coverage_credit_true": coverage_true,
            "embedded_source_digest_checks": len(digest_checks),
            "embedded_source_digests_current": sum(check["current"] for check in digest_checks),
            "provenance_current_digest_checks": provenance_checks,
        },
        "digest_checks": digest_checks,
        "findings": findings,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    result = build()
    rendered = json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    if args.check:
        if not OUTPUT.is_file() or OUTPUT.read_text() != rendered:
            raise SystemExit("independent audit artifact is stale")
    else:
        OUTPUT.write_text(rendered)
    if result["findings"]:
        raise SystemExit(f"independent audit findings remain: {len(result['findings'])}")


if __name__ == "__main__":
    main()
