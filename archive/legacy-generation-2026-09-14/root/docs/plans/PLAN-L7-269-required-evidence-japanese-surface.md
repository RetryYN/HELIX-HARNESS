---
plan_id: PLAN-L7-269-required-evidence-japanese-surface
title: "PLAN-L7-269: required evidence 日本語 surface"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "completion / status / handover の人間判断 evidence 表示を日本語-first にする小変更。"
owner: TL (Codex)
parent_design: docs/test-design/harness/L7-unit-test-design.md
pair_artifact: tests/completion-decision-packet.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - required evidence Japanese surface implementation"
generates:
  - artifact_path: docs/plans/PLAN-L7-269-required-evidence-japanese-surface.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/lint/outstanding.ts
    artifact_type: source_module
  - artifact_path: src/lint/completion-decision-packet.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/handover/index.ts
    artifact_type: source_module
  - artifact_path: tests/outstanding.test.ts
    artifact_type: test_code
  - artifact_path: tests/completion-decision-packet.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/test-design/harness/L7-unit-test-design.md
  requires:
    - src/lint/outstanding.ts
    - src/lint/completion-decision-packet.ts
    - tests/completion-decision-packet.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T15:32:06+09:00"
    tests_green_at: "2026-07-03T15:32:06+09:00"
    verdict: approve
    scope: "completion / status / handover の requiredEvidence に requiredEvidenceJa を追加し、英語 machine prose の流用を fail-close する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/outstanding.test.ts tests/completion-decision-packet.test.ts tests/cli-surface.test.ts tests/handover.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T15:32:06+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:4ef542f35018034197d4d95d7ea819395893c6560fd0cfcf45814680ff82bce0"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T15:32:06+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
---

# PLAN-L7-269: required evidence 日本語 surface

## 目的

completion / status / handover / decision packet は、未了 blocker の required action と route を日本語-first で出す。
しかし required evidence は英語 machine prose だけで、PO が「どの証跡を確認するか」を日本語表示から追えない。

この PLAN は、既存の machine-readable `requiredEvidence[]` を残したまま、同じ順序・同じ件数の
`requiredEvidenceJa[]` を追加し、required action / route / review と同じ日本語-first 契約へ揃える。

## 変更

- `OutstandingItem` / `WorkflowNextActionItem` / `CompletionDecisionItem` に `requiredEvidenceJa[]` を追加する。
- blocker 別 `requiredEvidence[]` を `workflowEvidenceTextJa` で日本語表示へ写像する。
- `analyzeCompletionDecisionPacket` が `requiredEvidenceJa[]` の欠落、件数不一致、英語流用、対応表 drift を fail-close する。
- `helix status` text と `helix completion decision-packet` text に日本語 evidence と `evidence-id` を併記する。
- handover Next Action に日本語の必要証跡を含め、再開時に証跡確認が英語配列だけへ戻らないようにする。
- L7 unit test design の U-OUTSTANDING-015 を required evidence まで拡張する。

## 境界

- PO/S4 decision、version-up activation、action-binding approval、PLAN-M-02 cutover approval は作成しない。
- `requiredEvidence[]` の英語 machine field は互換性のため残す。
- `requiredEvidenceJa[]` は表示補助であり、機械照合の正本は既存 `requiredEvidence[]` と record/template/matrix contract とする。

## 完了条件

- outstanding / workflowNextActions / completion decision packet が `requiredEvidenceJa[]` を出す。
- completion decision packet lint が英語流用または drift した `requiredEvidenceJa[]` を拒否する。
- CLI text と handover の人間向け surface が日本語 evidence と machine `evidence-id` を併記する。
- targeted tests、typecheck、design-language、plan governance、doctor が green。
