---
plan_id: PLAN-L7-137-feedback-surface-taxonomy
title: "PLAN-L7-137 (troubleshoot): feedback surface を対応可能性で要約する"
kind: troubleshoot
layer: L7
drive: be
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
parent_design: docs/design/harness/L6-function-design/function-spec.md
backprop_decision: not_required
backprop_decision_reason: "The requirement to emit feedback already exists; this slice refines display taxonomy and prevents feedback queue self-noise."
agent_slots:
  - role: aim
    slot_label: "AIM - feedback surface triage"
  - role: tl
    slot_label: "TL - feedback surface taxonomy"
related_l0: docs/governance/helix-harness-concept_v3.1.md
generates:
  - artifact_path: docs/plans/PLAN-L7-137-feedback-surface-taxonomy.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/if-detail.md
    artifact_type: design_doc
  - artifact_path: src/feedback/surface.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: tests/feedback-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-110-takeover-feedback-surface.md
  requires:
    - docs/plans/PLAN-L7-44-harness-db-master.md
    - docs/plans/PLAN-L7-110-takeover-feedback-surface.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T18:20:12+09:00"
    tests_green_at: "2026-07-09T18:20:12+09:00"
    verdict: pass
    scope: "current-location recovery collect_evidence: feedback surface taxonomy と projection writer の unresolved join 抑止を現行テストで再検証し、review_evidence.green_commands へ投影可能な実行証跡を追加する。"
    worker_model: codex
    reviewer_model: codex
    green_commands:
      - kind: unit_test
        command: "bunx vitest run --project fast tests/feedback-surface.test.ts tests/search-feedback.test.ts tests/projection-writer.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T18:20:12+09:00"
        evidence_path: tests/feedback-surface.test.ts
        output_digest: "sha256:aed39cc63f3b8a9c66399ee3062907d4ea485c16fccfa988ed84f241d2cced28"
---

# PLAN-L7-137 (troubleshoot): feedback surface を対応可能性で要約する

## 0. 目的

検出を弱めずに feedback surface のノイズを減らす。未解決 feedback は次の分類で表示する。

- `gate`: 真のブロッカー。
- `actionable`: PLAN、設計、テスト作業で解消できる警告。
- `telemetry`: 1 件ずつ列挙せず、要約して扱うべき高頻度の計測行。

## 1. スコープ

- takeover と `helix feedback list` のテキスト出力で共有する feedback 表示分類を追加する。
- `helix feedback list --json` は raw audit path として維持する。
- テキスト出力は `signal_type` と件数でグループ化する。
- 通知キューが自己参照的な `unresolved-join` ノイズを作らないよう、解決可能な PLAN join findings から
  `feedback_events` キュー行を除外する。

## 2. 受入条件

- [x] `missing-test-oracle-id`、`artifact_progress_yellow`、skill rate signals などの telemetry 行が要約される。
- [x] actionable 行は表示されたまま、グループ化される。
- [x] gate 行は先頭に維持される。
- [x] raw JSON 出力は利用可能なまま維持される。
- [x] feedback queue projection は追加の unresolved join findings を作らない。

## 3. 検証

- `bun run vitest run tests\feedback-surface.test.ts tests\search-feedback.test.ts`
- `bun run vitest run tests\projection-writer.test.ts tests\feedback-surface.test.ts tests\search-feedback.test.ts`
- `bun run tsc --noEmit`
- `bun run lint`
- `bun run src\cli.ts db rebuild --json`
- `bun run src\cli.ts feedback list --emit`

## 4. 既知の残余

この分類は、すべての警告が修正済みであるとは主張しない。次の close-out 作業が価値の高い signal から
着手できるように、ブロッカー、対応可能な backlog、telemetry を分離するだけである。
