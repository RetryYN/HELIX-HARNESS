---
plan_id: PLAN-L7-281-review-bundle-self-runnable-and-rename-safety
title: "PLAN-L7-281: review-bundle 自己再生成導線と rename safety"
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
    slot_label: "TL - review bundle runnable source"
  - role: qa
    slot_label: "QA - rename safety fields"
generates:
  - artifact_path: docs/plans/PLAN-L7-281-review-bundle-self-runnable-and-rename-safety.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-278-completion-review-bundle.md
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
  - artifact_path: tests/outstanding.test.ts
    artifact_type: test_code
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
    reviewed_at: "2026-07-03T20:41:35+09:00"
    tests_green_at: "2026-07-03T20:41:35+09:00"
    verdict: approve
    scope: "completion-review-bundle.v1 に runnableSourceCommand を追加し、JSON/text/status/handover から repo-local 再生成 command を辿れるようにする。rename plan summary は planOnly / mustNotApply / applyAuthorized を required safety fields として保持し、不可逆 cutover 前レビューの safety 欠落を防ぐ。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/completion-decision-packet.test.ts tests/outstanding.test.ts tests/cli-surface.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T20:41:35+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:b8915bd760fee53981336fdd3e071b22778dd97621e7edc08f65f090c723961f"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T20:41:35+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:33e278784935e556988a1ac4fd51ec1e0293bdce442e8e1349de4a5a9d0b1362"
---

## 目的

`completion review-bundle` は人間判断前に見る bundle だが、bundle 自身を repo-local に再生成する
runnable command が JSON contract に無いと、consumer / VSCode / handover で `ut-tdd ...` だけを
コピーして実行境界を取り違える余地が残る。

また rename cutover の review packet は不可逆 migration 前の最重要 bundle だが、summary から
`planOnly` / `mustNotApply` / `applyAuthorized` が落ちると、review bundle の `requiredSafetyFields`
が空になり、cutover 前レビューの安全境界を機械的に確認できない。

## DoD

- [x] `completion-review-bundle.v1` が `runnableSourceCommand=bun run ut-tdd completion review-bundle --json` を返す。
- [x] `analyzeCompletionReviewBundle` が `runnableSourceCommand` drift を fail-close する。
- [x] status / handover text が `runnable-completion-review-bundle:` を出す。
- [x] `completion review-bundle` text が source command と runnable command を同じ行に出す。
- [x] rename plan summary が `planOnly` / `mustNotApply` / `applyAuthorized` を required review field として返す。
- [x] review bundle の rename plan packet が空でない `requiredSafetyFields` を返す。
