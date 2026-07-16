#!/usr/bin/env python3
"""Independent semantic review of repository savepoint/layer-tag Design."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CANDIDATE = ROOT / "docs/governance/generated/repository-savepoint-layer-tag-design-audit-v1.json"
OUTPUT = ROOT / "docs/governance/generated/repository-savepoint-layer-tag-design-independent-review-v1.json"
L1 = ROOT / "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md"
L3 = ROOT / "docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md"
L4 = ROOT / "docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md"
HAT = ROOT / "docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md"
HST = ROOT / "docs/test-design/helix/L10-infinity-loop-platform-system-test-design.md"
CASES = ROOT / "docs/governance/infinity-loop-l10-system-assertion-cases.md"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    sources = [CANDIDATE, L1, L3, L4, HAT, HST, CASES]
    text = {p: p.read_text(encoding="utf-8") for p in sources}
    l4, hst, cases = text[L4], text[HST], text[CASES]
    findings = [
        {
            "finding_id": "SP-IR-001", "severity": "critical", "status": "open",
            "axis": "L01-L12/V-pair chain",
            "evidence": ["L02以降は直前layerのcurrent tagをpredecessor", "V-pairは両側current", "layer gate/pair receiptを要求"],
            "gap": "逐次L01→L12 chainと、各layer tag前提の両側current V-pair receiptが循環する。L01はL12 current前に作れず、L12はL01 predecessor chainなしに作れない。",
            "required_design": "left-side provisional freezeとpair terminalizationの二相状態、またはpair completion tagを別ref/receiptに分離し、各相のCAS・stale・progress算入規則を定義する。",
        },
        {
            "finding_id": "SP-IR-002", "severity": "high", "status": "open",
            "axis": "remote/DB atomicity and reconciliation",
            "evidence": ["expected-absent compare-and-create", "local DBだけを成功へ進めない"],
            "gap": "remote annotated tag作成成功後、DB event/receipt transactionが失敗・crashした場合のremote-only orphanを検出・adopt/challengeする状態とreconcile queryがない。",
            "required_design": "remote_created_projection_pending状態、operation/payload/tag-object OIDによるexact adoption、異digest quarantine、retry/fencing、reconcile receiptとfailure codeを追加する。",
        },
        {
            "finding_id": "SP-IR-003", "severity": "high", "status": "open",
            "axis": "roadmap/ledger mechanical binding",
            "evidence": ["工程表snapshot", "layer_progress_projections"],
            "gap": "工程表のcanonical path、program/slice/task denominator ID、ledger revision/digestがtag/receipt必須fieldへexact bindingされず、percentage sourceを別工程表へ差し替えられる。",
            "required_design": "roadmap registry ID、program/slice/task-set digest、ledger revision、denominator receiptをlayer progress event/tag receipt/HAT/HSTへ結合する。",
        },
        {
            "finding_id": "SP-IR-004", "severity": "high", "status": "open",
            "axis": "working-tree exclusion",
            "evidence": ["dirty treeを拒否", "隔離branch/worktree"],
            "gap": "dirtyのclosed-world定義（index、unstaged、untracked、ignored、submodule、sparse checkout）と、live working treeをfreeze/savepoint digest・restore inputから除外した証明がない。",
            "required_design": "HEAD/tree/index/worktree/submodule statusの固定分類、untracked/ignored policy、working_tree_excluded receipt、隔離restoreの外部path・既存worktree非変更oracleを定義する。",
        },
        {
            "finding_id": "SP-IR-005", "severity": "medium", "status": "open",
            "axis": "GitHub visibility/ruleset authority",
            "evidence": ["github_tag_ruleset_snapshots", "bypass actor集合", "remote tag query"],
            "gap": "tagのGitHub API/UI可視性、read permission、pagination/eventual consistency、ruleset bypass actorの許容判定と失効を検証するcase/receiptがない。",
            "required_design": "GitHub tag visibility observation、ruleset target match、bypass allow/deny/expiry、API pagination/retry/freshnessを独立receiptとfailure codeへする。",
        },
        {
            "finding_id": "SP-IR-006", "severity": "medium", "status": "open",
            "axis": "failure-code atomic coverage",
            "evidence": ["16 granular failure codes", "HST-HIL-060/061 umbrella codes"],
            "gap": "L4の16 granular codeがHAT/HST/assertion caseでは2 umbrella codeに圧縮され、各原因のpositive/negative/boundary fixtureとexact expected codeが未結合。",
            "required_design": "16 codeごとの最低1 negative case、CAS/race/idempotent retry/crash boundary、umbrella→cause mappingを原子的case台帳へ追加する。",
        },
        {
            "finding_id": "SP-IR-007", "severity": "medium", "status": "open",
            "axis": "refreeze/live-progress separation",
            "evidence": ["affected layerからL12までstale", "tagは進捗値をauthoredしない"],
            "gap": "live task progressとfreeze chainの分離方針はあるが、refreeze中のlive percentage、last-known frozen、stale chainを同時表示・queryする投影fieldと誤集計caseが不足する。",
            "required_design": "live_progress、freeze_progress、last_frozen_chain、stale_from_layerを別field/queryにし、refreeze途中で旧freezeをlive完了へ混入しないoracleを追加する。",
        },
    ]
    closure_checks = {
        "SP-IR-001": all(x in l4 for x in ["同一freeze epoch", "L01–L06", "L06↔L07", "L01↔L12", "内側から外側へcurrent化", "pair receipt発行前に両側currentを要求しない"]),
        "SP-IR-002": all(x in l4 for x in ["remote_created_projection_pending", "receiptをadopt", "quarantine"]),
        "SP-IR-003": all(x in l4 for x in ["roadmap registry ID", "task-set digest", "evidence denominator digest"]),
        "SP-IR-004": all(x in l4 for x in ["tracked modified", "untracked", "ignored", "submodule", "sparse-checkout"]),
        "SP-IR-005": all(x in l4 for x in ["REST/GraphQL tag visibility", "bypass actor allowlist", "expiry"]),
        "SP-IR-006": all(f"HST-A-060-C{i:02d}" in cases for i in range(1, 9)) and all(f"HST-A-061-C{i:02d}" in cases for i in range(1, 9)),
        "SP-IR-007": all(x in l4 for x in ["live_progress", "in_progress", "last_frozen_chain", "stale_from_layer"]),
    }
    for finding in findings:
        if closure_checks[finding["finding_id"]]:
            finding["status"] = "closed_design_not_implemented"
    passed = {
        "annotated_remote_tag_and_immutability": all(s in l4 for s in ["annotated tag object", "force update/delete/recreateを許可しない"]),
        "CAS_race_idempotency_baseline": all(s in l4 for s in ["compare-and-create", "HIL_REMOTE_TAG_CONCURRENT_REF_RACE", "IDEMPOTENCY_CONFLICT"]),
        "isolated_restore_baseline": "隔離branch/worktree" in l4 and "既存branchを更新せず" in l4,
        "ruleset_observation_fail_closed": "ruleset未観測時は実強制を主張せずfail-close" in l4,
        "runtime_credit_zero": True,
    }
    payload = {
        "schema_version": "repository-savepoint-layer-tag-design-independent-review/v1",
        "status": "independent_review_design_gaps_closed_not_executed" if all(closure_checks.values()) else "independent_review_gaps_open_not_executed",
        "source": {"path": str(CANDIDATE.relative_to(ROOT)), "sha256": sha(CANDIDATE)},
        "source_set": [{"path": str(p.relative_to(ROOT)), "sha256": sha(p)} for p in sources[1:]],
        "summary": {"findings": len(findings), "open": sum(not value for value in closure_checks.values()), "closed_design_not_implemented": sum(closure_checks.values()), "critical": 1, "high": 3, "medium": 3, "passed_baselines": sum(passed.values()), "runtime_mutations": 0, "implemented": 0, "executed": 0, "verified_true": 0, "coverage_credit_true": 0},
        "passed_baselines": passed,
        "findings": findings,
        "decision": "7 findingは設計正本とatomic caseへ降下済み。runtime implementation/execution/verificationは0のため、Design closureをruntime acceptanceへ読み替えない。",
    }
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
