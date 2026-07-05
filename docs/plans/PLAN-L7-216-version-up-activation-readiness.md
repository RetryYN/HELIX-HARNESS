---
plan_id: PLAN-L7-216-version-up-activation-readiness
title: "PLAN-L7-216 (add-impl): version-up activation readiness の証跡整理"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - version-up activation readiness gate"
  - role: qa
    slot_label: "QA - activation packet regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-216-version-up-activation-readiness.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-216-version-up-activation-readiness.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/version-up-readiness.ts
    artifact_type: source_module
  - artifact_path: tests/version-up-readiness.test.ts
    artifact_type: test_code
  - artifact_path: docs/process/modes/version-up.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L3-06-helix-pillar-descent.md
  requires:
    - docs/plans/PLAN-REVERSE-216-version-up-activation-readiness.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T12:35:56+09:00"
    tests_green_at: "2026-07-01T12:35:56+09:00"
    verdict: approve
    scope: "Continuation: activationReadinessChecks now distinguish concrete evidence from prose-only requirements. Rehearsal/provenance text without a path, audit id, digest, execution log, result/exit code, or report artifact remains pending_evidence, so PLAN-L7-146 cannot look activation-ready merely because the PLAN says evidence will be recorded. This preserves the plan-only/version-up blocker and does not activate external infrastructure or bypass action-binding approval."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/version-up-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T12:35:56+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:848c78bc623fec0b0f838497f4acaf57042122ff71c5e0d10db5b0889f1e03a1"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T12:35:56+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:197e0bb048126d3ae3593a122a2b25679204774bf1769dcb5512309a4e9575eb"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T12:35:56+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T07:23:12+09:00"
    tests_green_at: "2026-07-01T07:23:12+09:00"
    verdict: approve
    scope: "Version-up activation packets now classify external rehearsal/provenance evidence as present or pending_evidence and surface pending items as blockedReasons. This strengthens the activation-preflight workflow without executing serverless activation, lifting version_target, or bypassing PO/action-binding approval."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/version-up-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T07:23:12+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:24c2bfc018a575b92ef493f7bf13a9c28c77945fc695797741d416232eb748e4"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:23:12+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:e5281e9eab7e257930c135cc1aafbca2884cd83f0ef3988035852271ddf27f5a"
---

# PLAN-L7-216: version-up activation readiness の証跡

## 目的

`version-up-activation-packet.v1` には外部のリハーサルと provenance の要件が並んでいるが、各要件を
`evidence-present` か未完了かに分類していなかった。この抜けを塞ぐ。外部 activation は引き続き
`plan-only` のまま維持し、どのリハーサル証跡が approval を妨げているかを明示すること。

## 範囲

- version-up activation packets に `activationReadinessChecks[]` を追加する。
- 外部のリハーサル/provenance 証跡を `present` または `pending_evidence` に分類する。
- 文面だけの指示、予定された確認、または具体的な証跡 locator を持たない "recorded" 主張
  (path、audit id、digest、run log、result/exit code、report artifact) は `pending_evidence` と扱う。
- 保留中の確認に対して `activation rehearsal evidence pending: <check>` の blocked reason を追加する。
- version-up process、L6 function design、L3/L6 の対になった test design を更新する。
- 既存の serverless/version-up activation blocker は維持する。

## 非対象

- `PLAN-L7-146-serverless-readonly-share` は activation しない。
- apply permission、deployment permission、secret access、action-binding approval は付与しない。
- `.helix -> .helix` cutover は実行しない。

## 外部根拠

process doc では、Google Cloud Deploy の deployment verification、canary、rollback の公式ドキュメントを
運用上の参照例として挙げている。deployment activation は approval 前に、検証され、限定的に段階化され、
かつ復旧可能であるべきだという整理である。

## 受入条件

- [x] External activation packets に `activationReadinessChecks[]` が含まれる。
- [x] 保留中の外部リハーサル/provenance 証跡が blocked reason になる。
- [x] 具体的な証跡 locator を伴わない prose-only のリハーサル/provenance 主張は
      `pending_evidence` のまま残る。
- [x] `PLAN-L7-146` の CLI activation packet で保留中の readiness checks を確認できる。
- [x] 既存の plan-only safety flags は固定されたまま:
      `planOnly=true`, `mustNotApply=true`, `applyCommandAvailable=false`,
      `activationAllowed=false`。
- [x] design/test-design/process docs は、全体完了を主張せずに gate を説明している。
