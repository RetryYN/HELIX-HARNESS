---
plan_id: PLAN-L7-233-boundary-rule-canonicalization
title: "PLAN-L7-233 (troubleshoot): 境界ルール正本化"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "IMP-105 は既存 module-boundary / domain-boundary の二重管理を解消する troubleshoot であり、新規 product requirement や外部 contract は追加しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/module-drift.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
review_evidence:
  - reviewer: codex-tl-current-location-recovery
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T18:47:48+09:00"
    tests_green_at: "2026-07-09T18:47:48+09:00"
    verdict: pass
    scope: "current-location recovery collect_evidence: canonical source-boundary matrix と coding-rules / DDD-TDD gate の現HEAD regression を fast suite で再検証する。"
    worker_model: codex
    reviewer_model: codex
    green_commands:
      - kind: unit_test
        command: "bun run test:fast"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T18:47:48+09:00"
        evidence_path: tests/coding-rules.test.ts
        output_digest: "sha256:0a56427fb56ec573beb58350c31ad8ef5b217ae5377bd190e4c3d670b5279403"
agent_slots:
  - role: aim
    slot_label: "AIM - IMP-105 boundary drift investigation"
  - role: tl
    slot_label: "TL - canonical boundary implementation"
generates:
  - artifact_path: docs/plans/PLAN-L7-233-boundary-rule-canonicalization.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/shared.ts
    artifact_type: source_module
  - artifact_path: src/lint/coding-rules.ts
    artifact_type: source_module
  - artifact_path: src/lint/ddd-tdd-rules.ts
    artifact_type: source_module
  - artifact_path: tests/coding-rules.test.ts
    artifact_type: test_code
  - artifact_path: tests/ddd-tdd-rules.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L6-function-design/module-drift.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/improvement-backlog.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-26-module-boundary-rule.md
  requires:
    - docs/plans/PLAN-L7-26-module-boundary-rule.md
    - docs/plans/PLAN-L7-27-domain-boundary-lint.md
    - docs/design/harness/L6-function-design/module-drift.md
    - docs/test-design/harness/L7-unit-test-design.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
---

# PLAN-L7-233: 境界ルール正本化

## 0. 目的

IMP-105 は `module-boundary` と `domain-boundary` が別の禁止 import 表を持ち、同じ source
boundary を見ているのに判定が部分的にずれる問題である。`module-boundary` は coding-rule SSoT、
`domain-boundary` は DDD/TDD strictness gate の rule id として残すが、禁止 matrix は 1 つに集約する。

## 1. スコープ

対象:

- `src/lint/shared.ts` に canonical source-boundary matrix と `violatesSourceBoundary` を置く。
- `src/lint/coding-rules.ts` は同じ helper を使い、違反を `module-boundary` として報告する。
- `src/lint/ddd-tdd-rules.ts` は同じ helper を使い、違反を `domain-boundary` として報告する。
- 旧 domain 側で抜けていた `lint -> gate` 代表ケースを U-CODE / U-DDDTDD の両方で固定する。
- L6 function design、L7 unit test design、IMP-105 backlog を同期する。

対象外:

- rule id の統合や廃止。
- import graph 全体の relation graph 化。これは IMP-118 以降の scope。
- `.helix` から HELIX への irreversible cutover。これは PLAN-M-02 の L14 承認後に扱う。

## 2. 受入条件

- `src/lint/*` importing `../gate/*` は `module-boundary` violation になる。
- 同じ fixture は DDD/TDD strictness 側でも `domain-boundary` violation になる。
- `module-boundary` と `domain-boundary` は別 rule id のまま、同じ canonical source-boundary matrix を使う。
- 実 repo の `coding-rules` / `ddd-tdd-rules` doctor gate は violations 0 を維持する。

## 3. テスト設計接続

対応 oracle は `docs/test-design/harness/L7-unit-test-design.md` の `U-CODE-011` と
`U-DDDTDD-010`。実テストは `tests/coding-rules.test.ts` と `tests/ddd-tdd-rules.test.ts` に同 ID citation を持つ。

## 4. 完了条件

- [x] 禁止 import matrix が `src/lint/shared.ts` に単一正本化されている。
- [x] `coding-rules` と `ddd-tdd-rules` が同じ helper を使う。
- [x] U-CODE-011 / U-DDDTDD-010 が追加されている。
- [x] L6 function design / L7 unit test design / improvement backlog が同期している。
