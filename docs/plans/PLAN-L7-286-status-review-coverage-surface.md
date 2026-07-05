---
plan_id: PLAN-L7-286-status-review-coverage-surface
title: "PLAN-L7-286: status / handover の review coverage 表示"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "completion review-bundle の text surface を additive に強化する。D-API/D-DB、実 rename、approval 記録、version-up activation、cutover apply は行わない。"
owner: TL (Codex)
parent_design: docs/plans/PLAN-L7-285-review-bundle-blocker-coverage.md
pair_artifact: tests/cli-surface.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - status review coverage"
  - role: qa
    slot_label: "QA - handover/status text regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-286-status-review-coverage-surface.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-285-review-bundle-blocker-coverage.md
  requires:
    - docs/plans/PLAN-L7-285-review-bundle-blocker-coverage.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T21:27:31+09:00"
    tests_green_at: "2026-07-03T21:27:31+09:00"
    verdict: approve
    scope: "status / handover status text が completion review-bundle の coverage 分離を落とさず、JSON を見ない再開者にも non-packet blocker を見せる。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/cli-surface.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T21:27:31+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:a490de618d639056b0916839aed502a913c405588d3aae82fbe1afb1db065e6d"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T21:27:31+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
---

## 目的

`completion review-bundle` 単体の text には `review-coverage:` があるが、普段確認される `helix status` と `helix handover status` の text は review-bundle command だけを表示していた。JSON を見ない運用では、review packet で閉じる blocker と packet 外 blocker の分離を見落とす余地が残る。

この PLAN では status / handover status text に `completion-review-coverage:` を追加し、通常確認 surface でも `reviewCoveredBlockers` / `nonPacketBlockers` を落とさない。

## DoD

- [x] `helix status` text が `completion-review-coverage:` を出す。
- [x] `helix handover status` text が `completion-review-coverage:` を出す。
- [x] JSON の `completionReviewBundle.reviewCoveredBlockers` / `nonPacketBlockers` と text surface が同じ分離を示す。
- [x] L6 function spec と L7 unit-test design が status / handover text の coverage 表示を明記する。
