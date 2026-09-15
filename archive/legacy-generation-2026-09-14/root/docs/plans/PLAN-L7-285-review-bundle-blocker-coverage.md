---
plan_id: PLAN-L7-285-review-bundle-blocker-coverage
title: "PLAN-L7-285: completion review-bundle の blocker coverage 分離"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "completion review-bundle の判断前レビュー surface を additive に強化する。D-API/D-DB、実 rename、approval 記録、version-up activation、cutover apply は行わない。"
owner: TL (Codex)
parent_design: docs/plans/PLAN-L7-278-completion-review-bundle.md
pair_artifact: tests/completion-decision-packet.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - review bundle blocker coverage"
  - role: qa
    slot_label: "QA - coverage drift regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-285-review-bundle-blocker-coverage.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/lint/outstanding.ts
    artifact_type: source_module
  - artifact_path: src/lint/completion-decision-packet.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/completion-decision-packet.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-278-completion-review-bundle.md
  requires:
    - docs/plans/PLAN-L7-278-completion-review-bundle.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T21:22:49+09:00"
    tests_green_at: "2026-07-03T21:22:49+09:00"
    verdict: approve
    scope: "completion review-bundle が review packet で確認できる blocker と、packet だけでは閉じない workflow/semantic blocker を構造化して分離する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/completion-decision-packet.test.ts tests/cli-surface.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T21:22:49+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:33e4673a8c939c879178399ecbc4991b955cfa4343ffa154bf4e44dbb21f99be"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T21:22:49+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
---

## 目的

`completion review-bundle` の `reviewPackets` は S4 / version-up / rename / action-binding の判断材料を束ねる。一方、`blockedUntil` には `non_terminal_plans` や `semantic_frontier_blocked` も含まれるため、text / JSON の読み手が「review packet を確認すれば全 blocker が閉じる」と誤読する余地が残る。

この PLAN では bundle に `reviewCoveredBlockers` と `nonPacketBlockers` を追加し、packet review で確認できる blocker と、別 workflow state / semantic frontier の解消が必要な blocker を分離する。

## DoD

- [x] `completion-review-bundle.v1` が `reviewCoveredBlockers` を返す。
- [x] `completion-review-bundle.v1` が `nonPacketBlockers` を返す。
- [x] `analyzeCompletionReviewBundle` が coverage drift を fail-close する。
- [x] `completion review-bundle` text が `review-coverage:` を出す。
- [x] L6 function spec と L7 unit-test design が coverage 分離を明記する。
