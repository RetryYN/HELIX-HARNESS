---
plan_id: PLAN-L7-268-record-template-japanese-guidance
title: "PLAN-L7-268: record template 日本語 guidance"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "completion / status / 専用 packet の人間判断 template を日本語 guidance 付きにする小変更。"
owner: TL (Codex)
parent_design: docs/test-design/harness/L7-unit-test-design.md
pair_artifact: tests/completion-decision-packet.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - record template Japanese guidance implementation"
generates:
  - artifact_path: docs/plans/PLAN-L7-268-record-template-japanese-guidance.md
    artifact_type: markdown_doc
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
  - artifact_path: tests/identifier-rename.test.ts
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
    reviewed_at: "2026-07-03T16:45:00+09:00"
    tests_green_at: "2026-07-03T16:45:00+09:00"
    verdict: approve
    scope: "completion / status / dedicated packet の recordTemplates に日本語 guidance を追加し、欠落を lint で fail-close する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/outstanding.test.ts tests/completion-decision-packet.test.ts tests/identifier-rename.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:45:00+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:016ccaf09819dc3bf2027858f5dfa8d928e10de56245fd19eac42e81626fd64c"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T16:45:00+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
---

# PLAN-L7-268: record template 日本語 guidance

## 目的

completion / status / handover / 専用 packet は、残 blocker を record template として出している。
しかし template の guidance が英語中心のままだと、PO が日本語の判断フローだけで必要 record を埋めにくい。

この PLAN は、人間判断 blocker を自動解除せず、判断 record の入力補助を日本語 guidance 付きにする。

## 変更

- `CompletionDecisionRecordTemplate` に `insertionHintJa` と `yamlLinesJa[]` を追加する。
- `recordTemplatesForRecords` が全 required field を日本語 placeholder 付きで出す。
- `analyzeCompletionDecisionPacket` が日本語 guidance 欠落を fail-close する。
- CLI text の `record-template` 出力に `record-template-hint-ja` と `record-template-ja` を追加する。
- L7 unit test design の U-OUTSTANDING-005 を更新する。

## 境界

- PO/S4 decision、version-up activation、action-binding approval、PLAN-M-02 cutover approval は作成しない。
- 既存の英語 `insertionHint` / `yamlLines` は machine compatibility のため残す。
- `.ut-tdd` から `.helix` への rename apply は行わない。

## 完了条件

- completion decision packet / dedicated packet の recordTemplates が日本語 guidance を持つ。
- 日本語 guidance 欠落が packet lint violation になる。
- CLI text から日本語 guidance へ辿れる。
- targeted tests、typecheck、design-language、plan governance、doctor が green。
