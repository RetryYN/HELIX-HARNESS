---
plan_id: PLAN-L7-401-operation-test-evidence-tokenization
title: "PLAN-L7-401 (troubleshoot): 運用テスト証跡の語彙分解検出"
kind: troubleshoot
layer: L7
drive: be
status: completed
route_mode: incident
created: 2026-07-09
updated: 2026-07-09
owner: Codex / TL
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
entry_signals:
  - "po_directive:2026-07-09 ハイブリッド版への差し替え前に、operation_test の既存 passed test evidence が observed に結合されない gap を解消する"
backprop_decision: not_required
backprop_decision_reason: "既存 L12 operation scope の検出語彙を補修し、L6 function-spec と L7 unit test design への同期をこのPLANの generates に含めて完了する。追加の上位戻しPLANは不要。"
agent_slots:
  - role: tl
    slot_label: "TL - operation_test evidence 語彙境界"
  - role: aim
    slot_label: "AIM - current-location matcher 補修"
  - role: qa
    slot_label: "QA - 誤昇格防止 oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-401-operation-test-evidence-tokenization.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/state-db/current-location.ts
    artifact_type: source_module
  - artifact_path: tests/current-location.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-400-operation-scope-ledger-observation.md
  requires:
    - docs/plans/PLAN-L7-397-vmodel-current-location-projection.md
    - docs/plans/PLAN-L7-400-operation-scope-ledger-observation.md
  references:
    - docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md
    - docs/test-design/helix/vmodel-docgen-fit-acceptance.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T20:01:40+09:00"
    tests_green_at: "2026-07-09T20:01:40+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "operation_test の evidence matcher を operation/ops/運用 + test/テスト の分離語彙へ拡張し、既存 passed test evidence を observed source として結合した。operation だけでは誤昇格しない oracle を追加した。"
    green_commands:
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T20:01:24+09:00"
        evidence_path: src/state-db/current-location.ts
        output_digest: "sha256:451667c39428a59334a6a179ba64f1a683f444c37375819fff339973f6b11615"
      - kind: unit_test
        command: "npx --no-install vitest run tests/current-location.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T20:01:24+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:080f2f9edf7ca61339be01035070a28915e4e0f5a4a59b2b44df6110091d26e7"
      - kind: lint
        command: "npx --no-install biome check src/state-db/current-location.ts tests/current-location.test.ts docs/design/harness/L6-function-design/function-spec.md docs/test-design/harness/L7-unit-test-design.md docs/plans/PLAN-L7-401-operation-test-evidence-tokenization.md"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T20:01:24+09:00"
        evidence_path: docs/plans/PLAN-L7-401-operation-test-evidence-tokenization.md
        output_digest: "sha256:bdb05e01ee06c1e6cc52e9222bc43b8616e8c178589fe8954f75f9f9655509e6"
      - kind: smoke
        command: "npx --no-install tsx src/cli.ts vmodel fit | rg \"operation-scope|vmodel fit:|regression-guard: operation-scope\""
        runner: node
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T20:01:24+09:00"
        evidence_path: src/state-db/current-location.ts
        output_digest: "sha256:451667c39428a59334a6a179ba64f1a683f444c37375819fff339973f6b11615"
---

# PLAN-L7-401: 運用テスト証跡の語彙分解検出

## 目的

`operation_test` の設計宣言は存在するが、既存の passed test evidence が `operation_test` 直書きでないため
observed に結合されない。運用テストを示す語彙が分離している場合も機械検出できるようにする。

## スコープ

- `operation_test` は `operation/ops/運用` と `test/テスト` の両方を含む evidence text を observed source にする。
- `operation` だけ、または `test` だけの evidence は observed へ昇格しない。
- `class_method_contract` は accepted runtime evidence が無いため、この PLAN では昇格させない。

## 受入条件

- `tests/current-location.test.ts` に分離トークンの positive / negative oracle がある。
- `current-location --summary-json` の `operation_scope.observed_gap` が 1 まで縮む。
- `doctor` の operation-scope watch は `class_method_contract` だけになる。
