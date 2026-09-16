---
plan_id: PLAN-L7-282-status-runtime-completion-next-action
title: "PLAN-L7-282: status nextAction の runtime/completion 分離"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "status 表示の誤読防止を additive に強化する。D-API/D-DB、実 rename、approval 記録、version-up activation、cutover apply は行わない。"
owner: TL (Codex)
parent_design: docs/plans/PLAN-L7-84-status-next-action-field.md
pair_artifact: tests/cli-surface.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - status next action split"
  - role: qa
    slot_label: "QA - blocked status surface regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-282-status-runtime-completion-next-action.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-84-status-next-action-field.md
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
  parent: docs/plans/PLAN-L7-84-status-next-action-field.md
  requires:
    - docs/plans/PLAN-L7-84-status-next-action-field.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T20:47:36+09:00"
    tests_green_at: "2026-07-03T20:47:36+09:00"
    verdict: approve
    scope: "status の runtime/judgment guidance と whole-program completion guidance を分離する。JSON は互換 nextAction を維持しつつ runtimeNextAction / completionNextAction を追加し、text は runtime-next / completion-next を出して曖昧な next 行を止める。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/cli-surface.test.ts tests/runtime.test.ts tests/outstanding.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T20:47:36+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:314800f32b5b30bd203e69d8dd228a4e216ac5b867c000098b1708fa4abf2dc0"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T20:47:36+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:dbdf65d20d8b25a90190d0c7239f52cba874a624de6f87c107900cd16c7a6838"
---

## 目的

`status --json` の `nextAction` は runtime / judgment gate guidance であり、whole-program / L14
completion の次手ではない。blocked 状態でも `cross-review-ready:` が先に見えると、PO/S4 判断、
version-up activation、不可逆 rename signoff、action-binding approval が解消済みだと誤読される。

この PLAN では既存 `nextAction` を互換維持しつつ、意味を明示する alias と text surface を追加する。

## DoD

- [x] `status --json` が `runtimeNextAction === nextAction` を返す。
- [x] `status --json` が `completionNextAction === workflowNextAction` を返す。
- [x] blocked status text が `runtime-next:` と `completion-next: completion-blocked:` を出す。
- [x] blocked status text が曖昧な `next:` 行を出さない。
- [x] `nextActionForMode` の既存値域と互換 `nextAction` は維持する。
