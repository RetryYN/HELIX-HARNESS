---
plan_id: PLAN-L7-270-judgment-review-japanese-evidence
title: "PLAN-L7-270: judgment review 日本語 evidence"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "status の judgmentReview evidence 表示を日本語-first に揃える小変更。"
owner: TL (Codex)
parent_design: docs/test-design/harness/L7-unit-test-design.md
pair_artifact: tests/gate-review-tier.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - judgment review Japanese evidence implementation"
generates:
  - artifact_path: docs/plans/PLAN-L7-270-judgment-review-japanese-evidence.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/gate/review-tier.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/gate-review-tier.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/test-design/harness/L7-unit-test-design.md
  requires:
    - src/gate/review-tier.ts
    - tests/gate-review-tier.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T15:38:48+09:00"
    tests_green_at: "2026-07-03T15:38:48+09:00"
    verdict: approve
    scope: "status の judgmentReview.requiredEvidence に requiredEvidenceJa を追加し、text status で日本語 evidence と evidence-id を併記する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/gate-review-tier.test.ts tests/cli-surface.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T15:38:48+09:00"
        evidence_path: tests/gate-review-tier.test.ts
        output_digest: "sha256:5cdfc61216dce8c08e7545b840f2926225ac316fddf4a86c52a93fa1c559ccaa"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T15:38:48+09:00"
        evidence_path: src/gate/review-tier.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
---

# PLAN-L7-270: judgment review 日本語 evidence

## 目的

`ut-tdd status --json` の workflow blocker は `requiredEvidenceJa[]` を持つようになったが、
mode-level の `judgmentReview.requiredEvidence[]` は英語 machine prose だけだった。

この PLAN は、judgment gate の review 証跡確認も日本語-first surface に揃え、PO/chat 向けの
status 出力が evidence 部分だけ英語へ戻る穴を閉じる。

## 変更

- `JudgmentReviewPlan` に `requiredEvidenceJa[]` を追加する。
- hybrid / single-runtime / standalone の required evidence を日本語表示へ写像する。
- `ut-tdd status` text に `judgment-review-evidence:` 行を追加し、日本語 evidence と `evidence-id` を併記する。
- `U-DETECT-006` の test design を `requiredEvidenceJa[]` まで拡張する。

## 境界

- judgment gate の実行、承認、cross-agent review の実施は行わない。
- 既存 `requiredEvidence[]` と `gateCommandTemplate` は machine contract として残す。
- workflow completion blocker や S4/version-up/cutover/action-binding の判断 record は変更しない。

## 完了条件

- `judgmentReviewPlanForMode` が全 mode で `requiredEvidenceJa[]` を返す。
- `requiredEvidenceJa[]` は `requiredEvidence[]` と同じ順序・同じ件数になる。
- `ut-tdd status` text から日本語 evidence と machine `evidence-id` に辿れる。
- targeted tests、typecheck、design-language、plan governance、doctor が green。
