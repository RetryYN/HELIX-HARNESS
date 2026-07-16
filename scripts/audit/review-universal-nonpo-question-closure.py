#!/usr/bin/env python3
"""Universal non-PO 54 closureを生成者と独立に監査する。"""

from __future__ import annotations

import argparse
import collections
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CANDIDATE = ROOT / "docs/governance/generated/universal-nonpo-question-design-closure-v1.json"
OUTPUT = ROOT / "docs/governance/generated/universal-nonpo-question-design-closure-independent-review-v1.json"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def digest(value: object) -> str:
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    candidate = json.loads(CANDIDATE.read_text(encoding="utf-8"))
    findings = []
    counts = collections.Counter()
    classes = collections.Counter()
    statuses = collections.Counter()
    for row in candidate["records"]:
        closure = row["closure"]
        cls = closure["class"]
        classes[cls] += 1
        statuses[closure["status"]] += 1
        issues = []
        if cls == "evidence_answered_reaudit":
            for evidence in closure["provenance"]:
                path = ROOT / evidence["path"]
                current = sha(path) if path.exists() else None
                text = path.read_text(encoding="utf-8", errors="replace") if path.exists() else ""
                ids_exist = all(identifier in text for identifier in evidence.get("ids", []))
                if current is None or not ids_exist or evidence.get("rebound_artifact_digest") != f"sha256:{current}" or not evidence.get("semantic_binding_current"):
                    issues.append("current_provenance_rebind_invalid")
            if not closure["authority"].get("required_for_activation") or closure["authority"].get("status") != "candidate-not-frozen":
                issues.append("activation_authority_boundary_invalid")
            if closure["status"] != "design_evidence_rebound_authority_not_activated" or closure["challenge"].get("unbound_current_evidence_count") != 0:
                issues.append("rebound_status_invalid")
        elif cls == "existing_po_chat_answer_design_receipt":
            answer = closure["answer"]
            if closure["answer_receipt_sha256"] != digest(answer):
                issues.append("source_limited_receipt_digest_mismatch")
            if answer["authority"].get("kind") != "PO_chat_primary" or answer["authority"].get("status") != "current" or not answer["authority"].get("source_ids"):
                issues.append("source_limited_authority_invalid")
            for source in answer["provenance"]:
                path = ROOT / source["path"]
                if not path.exists() or sha(path) != source["sha256"]:
                    issues.append("source_limited_provenance_stale")
            if closure["status"] != "design_answer_receipt_activated_source_limited" or not closure.get("freeze_credit"):
                issues.append("source_limited_activation_invalid")
        elif cls == "dependency_reaudit":
            expected_status = "terminal_defer_dependency_not_activated" if closure.get("answer_value") else "terminal_challenge_missing_value_not_activated"
            if closure["status"] != expected_status or closure.get("freeze_credit"):
                issues.append("dependency_terminal_status_invalid")
            if not closure.get("dependencies"):
                issues.append("dependency_catalog_empty")
            for dependency in closure.get("dependencies", []):
                if not dependency.get("resolution"):
                    issues.append("dependency_resolution_missing")
                for source in dependency.get("artifacts", []):
                    path = ROOT / source["path"]
                    if not path.exists() or sha(path) != source["sha256"]:
                        issues.append("dependency_artifact_stale")
        else:
            issues.append("unknown_closure_class")
        if row.get("coverage_credit"):
            issues.append("forbidden_coverage_credit")
        for issue in set(issues):
            counts[issue] += 1
        findings.append({"question_id": row["question_id"], "class": cls, "status": closure["status"], "issues": sorted(set(issues)), "coverage_credit": False})

    payload = {
        "schema_version": "helix.universal-nonpo-question-design-closure-independent-review.v1",
        "status": "independent_review_pass_design_evidence_rebound_authority_separated" if not counts else "independent_review_correction_required",
        "source": {"path": str(CANDIDATE.relative_to(ROOT)), "sha256": sha(CANDIDATE)},
        "summary": {"records": len(findings), "classes": dict(sorted(classes.items())), "statuses": dict(sorted(statuses.items())), "records_with_findings": sum(bool(row["issues"]) for row in findings), "issue_counts": dict(sorted(counts.items())), "coverage_credit_true": 0},
        "decision": "current digestへsemantic IDを再bindできる設計証拠と、activation authority未取得を別状態として扱う。source-limited receiptは原chat authorityを超えず、dependency defer/challengeはterminal not-activatedを維持する。",
        "findings": findings,
    }
    assert len(findings) == 54 and classes == {"evidence_answered_reaudit": 37, "existing_po_chat_answer_design_receipt": 12, "dependency_reaudit": 5}
    encoded = (json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode()
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_bytes() != encoded:
            print(f"STALE: {OUTPUT.relative_to(ROOT)}")
            return 1
        print(f"OK: {OUTPUT.relative_to(ROOT)}")
        return 0
    OUTPUT.write_bytes(encoded)
    print(f"WROTE: {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
