#!/usr/bin/env python3
"""Independently review Hybrid Python callable candidate dispositions."""

from __future__ import annotations

import hashlib
import json
import sys
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
GEN = ROOT / "docs/governance/generated"
CLOSED_CLASSES = {"source_atomization", "document_engine", "detector", "product_data", "analysis"}
NODE_ONLY_EFFECTS = {
    "node-admitted-subprocess-only",
    "fail-closed-node-gate-only",
    "node-admitted-dynamic-module-delegation",
}
ALLOWED_PROPOSAL_EFFECTS = {
    "proposal-only-no-observed-external-effect",
    "bounded-manifest-read-only",
    "isolated-result-root-node-commit",
    "deterministic-node-injected-source",
    "node-injected-environment-read-only",
}


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: generate-hybrid-python-disposition-semantic-review.py OUTPUT.json")
    candidate_path = GEN / "hybrid-python-callable-disposition-candidates-v1.json"
    semantic_path = GEN / "hybrid-python-callables-semantic-229-v2.json"
    fixture_path = ROOT / "docs/test-design/helix/hybrid-python-callable-fixture-contracts-v1.json"
    adr_path = ROOT / "docs/adr/ADR-009-node-python-linux-runtime.md"
    candidate = json.loads(candidate_path.read_text())
    semantic = json.loads(semantic_path.read_text())
    fixture = json.loads(fixture_path.read_text())
    semantic_by_id = {row["callable_id"]: row for row in semantic["records"]}
    fixture_by_id = {row["target"]["callable_id"]: row for row in fixture["fixtures"]}
    records = []
    overlay = []
    for row in sorted(candidate["records"], key=lambda item: item["callable_id"]):
        callable_id = row["callable_id"]
        semantic_row = semantic_by_id.get(callable_id)
        fixture_row = fixture_by_id.get(callable_id)
        closed_class = row["capability_class"] in CLOSED_CLASSES
        node_owner_ok = row["node_owner"] == "typescript-node-control-plane" and row["node_effect_boundary"] == "node_revalidate_then_single_transaction"
        proposal_only_ok = row["python_authoritative_commit"] is False and (
            row["python_proposal_role"].endswith("_proposal") or row["python_proposal_role"] in {"fixture_only", "none"}
        )
        exact_fixture = bool(
            fixture_row
            and fixture_row["fixture_id"] == row["fixture_id"]
            and fixture_row["target"]["anchor_version_id"] == row["anchor_version_id"]
            and len(fixture_row["cases"]) == 3
            and {case["case_id"] for case in fixture_row["cases"]} == set(row["fixture_case_ids"])
        )
        failure_edge = bool(fixture_row and row["failure_code"] in fixture_row["failure_contract"].values())
        semantic_edge = bool(semantic_row and semantic_row["anchor_version_id"] == row["anchor_version_id"])
        effect = row["effect_authority_candidate"]
        if not closed_class:
            reviewed = "reject"
            reason = "capability class is outside ADR-009 closed classes"
        elif effect == "no-production-authority" or row["python_proposal_role"] == "fixture_only":
            reviewed = "reject"
            reason = "fixture-only callable has no production adoption authority"
        elif effect in NODE_ONLY_EFFECTS or row["python_proposal_role"] == "none":
            reviewed = "redesign"
            reason = "effect is owned by the Node gate/subprocess/dynamic-loader boundary"
        elif effect == "registered-connector-default-deny" or row["capability_class"] == "product_data":
            reviewed = "defer"
            reason = "product-data connector requires classification and explicit activation authority"
        elif not (node_owner_ok and proposal_only_ok and exact_fixture and failure_edge and semantic_edge):
            reviewed = "defer"
            reason = "static ownership, proposal-only, fixture, failure, or semantic edge is incomplete"
        elif effect in ALLOWED_PROPOSAL_EFFECTS:
            reviewed = row["candidate_disposition"] if row["candidate_disposition"] in {"adopt", "defer"} else "defer"
            reason = "closed-class proposal preserves Node ownership; adopt/defer distinction remains a candidate planning choice"
        else:
            reviewed = "defer"
            reason = "effect authority is not in the reviewed closed set"
        changed = reviewed != row["candidate_disposition"]
        review_row = {
            "callable_id": callable_id,
            "anchor_version_id": row["anchor_version_id"],
            "capability_class": row["capability_class"],
            "candidate_disposition": row["candidate_disposition"],
            "reviewed_disposition": reviewed,
            "disposition_changed": changed,
            "reason": reason,
            "checks": {
                "adr009_closed_class": closed_class,
                "node_owner_and_effect_boundary": node_owner_ok,
                "python_proposal_only": proposal_only_ok,
                "semantic_anchor_exact": semantic_edge,
                "fixture_exact_three_cases": exact_fixture,
                "failure_code_edge": failure_edge,
                "effect_authority_candidate": effect,
                "execution_state_not_executed": row["execution_state"] == "not-executed"
            },
            "source": row["source"],
            "fixture_id": row["fixture_id"],
            "required_verification_receipt": row["required_verification_receipt"],
            "verified_adoption": False,
            "coverage_credit": False,
            "authority_receipt": None
        }
        records.append(review_row)
        if changed:
            overlay.append({
                "callable_id": callable_id,
                "source_candidate_disposition": row["candidate_disposition"],
                "corrected_candidate_disposition": reviewed,
                "reason": reason,
                "verified_adoption": False,
                "coverage_credit": False,
                "authority_receipt": None
            })
    by_pair = Counter((row["capability_class"], row["candidate_disposition"]) for row in records)
    by_reviewed = Counter(row["reviewed_disposition"] for row in records)
    artifact = {
        "schema_version": "helix.hybrid-python-disposition-semantic-review.v1",
        "receipt_id": "HPY-DISPOSITION-SEMANTIC-REVIEW-2026-07-16-01",
        "status": "pass_candidate_semantics_runtime_verification_pending" if not overlay else "fail_candidate_corrections_required",
        "sources": {
            "candidate": {"path": str(candidate_path.relative_to(ROOT)), "sha256": sha(candidate_path)},
            "semantic": {"path": str(semantic_path.relative_to(ROOT)), "sha256": sha(semantic_path)},
            "fixtures": {"path": str(fixture_path.relative_to(ROOT)), "sha256": sha(fixture_path)},
            "adr009": {"path": str(adr_path.relative_to(ROOT)), "sha256": sha(adr_path)}
        },
        "review_contract": {
            "closed_capability_classes": sorted(CLOSED_CLASSES),
            "node_owner": "typescript-node-control-plane",
            "node_effect_boundary": "node_revalidate_then_single_transaction",
            "python_authority": "proposal-only",
            "required_static_edges": ["semantic anchor", "fixture exact 1:1", "positive/negative/boundary cases", "failure code"],
            "runtime_promotion_forbidden": True
        },
        "summary": {
            "candidate_rows": len(records),
            "unique_callable_ids": len({row["callable_id"] for row in records}),
            "by_capability_and_candidate": {f"{key[0]}:{key[1]}": value for key, value in sorted(by_pair.items())},
            "reviewed_dispositions": dict(sorted(by_reviewed.items())),
            "misclassifications": len(overlay),
            "overlay_rows": len(overlay),
            "static_edge_failures": sum(not all(value for key, value in row["checks"].items() if key != "effect_authority_candidate") for row in records),
            "adopt_static_edge_failures": sum(
                row["candidate_disposition"] == "adopt"
                and not all(value for key, value in row["checks"].items() if key != "effect_authority_candidate")
                for row in records
            ),
            "nonadopt_expected_boundary_mismatches": sum(
                row["candidate_disposition"] != "adopt"
                and not all(value for key, value in row["checks"].items() if key != "effect_authority_candidate")
                for row in records
            ),
            "verified_adoptions": 0,
            "coverage_credit_true": 0,
            "runtime_executed": 0,
            "authority_receipts": 0
        },
        "invariants": [
            "candidate callable set equals review callable set exactly",
            "all five ADR-009 closed capability classes are reviewed",
            "candidate adopt is never converted to verified adoption by static review",
            "Node remains single writer and effect revalidator",
            "Python remains proposal-only",
            "fixture and failure edge existence is not fixture execution",
            "coverage and authority remain zero without runtime receipts"
        ],
        "correction_overlay": overlay,
        "records": records
    }
    Path(sys.argv[1]).write_text(json.dumps(artifact, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n")


if __name__ == "__main__":
    main()
