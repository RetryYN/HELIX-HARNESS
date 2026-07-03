---
plan_id: PLAN-L7-294-review-bundle-required-fields
title: "PLAN-L7-294: completion review-bundle requiredReviewFields 実配列復元"
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
    slot_label: "TL - review-bundle requiredReviewFields surface"
  - role: qa
    slot_label: "QA - review-bundle field drift regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-294-review-bundle-required-fields.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/outstanding.ts
    artifact_type: source_module
  - artifact_path: src/lint/completion-decision-packet.ts
    artifact_type: source_module
  - artifact_path: tests/completion-decision-packet.test.ts
    artifact_type: test_code
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-278-completion-review-bundle.md
  requires:
    - docs/plans/PLAN-L7-278-completion-review-bundle.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T22:28:16+09:00"
    tests_green_at: "2026-07-03T22:28:16+09:00"
    verdict: approve
    scope: "completion review-bundle の reviewPackets から requiredReviewFields 実配列へ直接辿れるようにし、digest だけの判断材料に戻らないようにする。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/completion-decision-packet.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T22:28:16+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:b94825eea53ab2439d2024e7136c60ae5bcc2e051b824892e712299b0bf2fd77"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T22:28:16+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T22:28:16+09:00"
        evidence_path: docs/plans/PLAN-L7-294-review-bundle-required-fields.md
        output_digest: "sha256:1630161a55fccb0e858e1b41c437c138b4ee42ccd4120888c4e462aadf6a5b94"
---

## 目的

`completion-review-bundle.v1` は S4 / version-up / rename / action-binding の判断前に見る非破壊レビュー束である。設計と test-design は `reviewPackets[].requiredReviewFields` を要求しているが、現行 JSON は `requiredReviewFieldsDigest` と `requiredSafetyFields` だけを返しており、承認者が bundle 単体から具体 field を辿れない。

この PLAN では `reviewPackets[]` に `requiredReviewFields[]` 実配列を additive に戻し、validator が decision packet の supporting summary と完全一致することを検査する。

## DoD

- [x] `completionReviewBundleForOutstanding()` が `reviewPackets[].requiredReviewFields[]` を返す。
- [x] `analyzeCompletionReviewBundle()` の期待 packet も実配列を含み、削除・drift を fail-close する。
- [x] `tests/completion-decision-packet.test.ts` が S4 review bundle で具体 field を確認する。
- [x] `requiredReviewFieldsDigest` は実配列の digest として維持する。
- [x] 実 S4 判断、version-up activation、action-binding approval、PLAN-M-02 cutover apply は行わない。
