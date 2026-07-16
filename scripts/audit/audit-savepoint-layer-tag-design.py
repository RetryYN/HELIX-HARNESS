#!/usr/bin/env python3
"""RepositorySavepointService / LayerFreezeTagGate の設計分母を監査する。"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "docs/governance/generated/repository-savepoint-layer-tag-design-audit-v1.json"
INPUTS = [
    "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md",
    "docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md",
    "docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md",
    "docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md",
    "docs/test-design/helix/L10-infinity-loop-platform-system-test-design.md",
    "docs/governance/infinity-loop-l10-system-assertion-cases.md",
    "docs/governance/infinity-loop-assertion-coverage-ledger.md",
]

TRACE = {
    "savepoint": ["HIL-FR-80", "HR-FR-HIL-46", "HAT-HIL-46", "HST-HIL-060"],
    "layer_freeze": ["HIL-FR-81", "HR-FR-HIL-47", "HAT-HIL-47", "HST-HIL-061"],
}
TABLES = [
    "repository_savepoints", "repository_savepoint_artifacts", "repository_restore_runs",
    "layer_freeze_tags", "layer_tag_ancestry_receipts", "layer_pair_tag_receipts",
    "layer_progress_projections", "tag_namespace_policies", "github_tag_ruleset_snapshots",
    "remote_tag_observations", "repository_savepoint_events", "repository_restore_checks",
    "layer_tag_events", "layer_vpair_tag_bindings", "layer_progress_events",
]
INDEXES = [
    "uq_savepoint_namespace_version", "uq_savepoint_operation_id", "ix_savepoint_commit_checkpoint",
    "uq_remote_tag_observation_sequence", "ix_remote_tag_current_ref",
    "uq_layer_authority_layer_version", "uq_layer_tag_operation_id", "ix_layer_predecessor",
    "uq_layer_vpair_revision", "ix_layer_progress_current_chain",
]
QUERIES = [
    "repository_savepoint_create_readiness_query", "repository_savepoint_remote_integrity_query",
    "repository_restore_verification_query", "layer_tag_create_readiness_query",
    "layer_freeze_chain_continuity_query", "layer_progress_projection_query",
]
RECEIPTS = [
    "savepoint_create_receipt", "remote_tag_verification_receipt",
    "github_tag_ruleset_authority_receipt", "restore_dry_run_receipt", "layer_tag_receipt",
    "layer_ancestry_receipt", "layer_vpair_receipt", "layer_progress_projection_receipt",
]
V_PAIRS = ["L01↔L12", "L02↔L11", "L03↔L10", "L04↔L09", "L05↔L08", "L06↔L07"]
GRAMMARS = [
    "refs/tags/helix/savepoint/<repository_id>/<savepoint_id>/v<n>",
    "refs/tags/helix/layer/<authority_model_id>/L<nn>/<scope_id>/v<n>",
    "refs/heads/helix/restore/<repository_id>/<savepoint_id>/<operation_id>",
]
FAILURES = [
    "HIL_SAVEPOINT_NAMESPACE_INVALID", "HIL_SAVEPOINT_TAG_NOT_ANNOTATED",
    "HIL_SAVEPOINT_REMOTE_REF_MISMATCH", "HIL_SAVEPOINT_RULESET_AUTHORITY_MISSING",
    "HIL_SAVEPOINT_BINDING_DIGEST_MISMATCH", "HIL_SAVEPOINT_IDEMPOTENCY_CONFLICT",
    "HIL_REMOTE_TAG_CONCURRENT_REF_RACE", "HIL_SAVEPOINT_RESTORE_MISMATCH",
    "HIL_LAYER_TAG_NAMESPACE_INVALID", "HIL_LAYER_TAG_ANCESTRY_INVALID", "HIL_LAYER_TAG_SKIP",
    "HIL_LAYER_TAG_VPAIR_ONE_SIDED", "HIL_LAYER_TAG_GATE_SHA_MISMATCH",
    "HIL_LAYER_TAG_SUPERSESSION_INVALID", "HIL_LAYER_PROGRESS_PROJECTION_INVALID",
    "HIL_LAYER_TAG_IDEMPOTENCY_CONFLICT",
]


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build() -> dict:
    texts = {name: (ROOT / name).read_text(encoding="utf-8") for name in INPUTS}
    all_text = "\n".join(texts.values())
    l4 = texts[INPUTS[2]]
    checks = {
        "trace_edges": all(token in all_text for values in TRACE.values() for token in values),
        "physical_tables": all(token in l4 for token in TABLES),
        "physical_indexes": all(token in l4 for token in INDEXES),
        "canonical_queries": all(token in l4 for token in QUERIES),
        "receipt_types": all(token in l4 for token in RECEIPTS),
        "namespace_grammars": all(token in l4 for token in GRAMMARS),
        "v_pairs": all(token in l4 for token in V_PAIRS),
        "failure_taxonomy": all(token in l4 for token in FAILURES),
        "ancestor_chain": "L01→L02→…→L12" in l4,
        "github_authority_observation_separated": "ruleset未観測時は実強制を主張せずfail-close" in l4,
        "vpair_two_phase_bootstrap": all(token in l4 for token in ["同一freeze epoch", "L01–L06", "L06↔L07", "L01↔L12", "内側から外側へcurrent化", "pair receipt発行前に両側currentを要求しない"]),
        "remote_db_crash_reconciliation": all(token in l4 for token in ["remote_created_projection_pending", "HIL_SAVEPOINT_REMOTE_DB_RECONCILIATION_REQUIRED"]),
        "roadmap_denominator_binding": all(token in l4 for token in ["roadmap registry ID", "task-set digest", "evidence denominator digest"]),
        "working_tree_closed_world": all(token in l4 for token in ["tracked modified", "untracked", "ignored", "submodule", "sparse-checkout"]),
        "github_visibility_and_bypass_expiry": all(token in l4 for token in ["REST/GraphQL tag visibility", "bypass actor allowlist", "expiry"]),
        "refreeze_progress_separation": all(token in l4 for token in ["live_progress", "in_progress", "last_frozen_chain", "stale_from_layer"]),
        "freeze_progress_independent_projection": all(token in l4 for token in ["`freeze_progress`はL01から連続する最長current chain", "層数/12", "freeze denominator digest", "`live_progress`、`in_progress`、`last_frozen_chain`を分子へ使わない"]),
        "vpair_atomic_stale_cascade": all(token in l4 for token in ["canonical V-pair counterpart set", "全対向tag", "pair receipt", "一つのCAS transaction/event chain", "片側currentの中間状態"]),
        "atomic_failure_cases": all(f"HST-A-060-C{i:02d}" in all_text for i in range(1, 9)) and all(f"HST-A-061-C{i:02d}" in all_text for i in range(1, 9)),
        "execution_credit_zero": True,
    }
    return {
        "schema_version": "repository-savepoint-layer-tag-design-audit/v1",
        "status": "design_completeness_review_pass_not_executed" if all(checks.values()) else "failed",
        "scope": ["RepositorySavepointService", "LayerFreezeTagGate"],
        "trace": TRACE,
        "fixed_denominator": {
            "tables": TABLES, "indexes": INDEXES, "queries": QUERIES,
            "receipt_types": RECEIPTS, "v_pairs": V_PAIRS, "failure_codes": FAILURES,
        },
        "checks": checks,
        "input_sha256": {name: digest(ROOT / name) for name in INPUTS},
        "execution": {
            "implemented": 0, "executed": 0, "verified": 0, "coverage_credit": False,
            "github_ruleset_observed": 0, "remote_tags_verified": 0, "restore_runs": 0,
        },
        "claim_boundary": "設計分母とtrace tokenの静的監査だけであり、Git/GitHub操作・runtime検証・coverage creditではない。",
    }


def render(payload: dict) -> bytes:
    return (json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode("utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    expected = render(build())
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_bytes() != expected:
            print(f"STALE: {OUTPUT.relative_to(ROOT)}")
            return 1
        print(f"OK: {OUTPUT.relative_to(ROOT)}")
        return 0
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_bytes(expected)
    print(f"WROTE: {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
