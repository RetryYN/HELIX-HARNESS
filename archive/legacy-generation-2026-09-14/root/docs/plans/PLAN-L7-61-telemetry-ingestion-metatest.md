---
plan_id: PLAN-L7-61-telemetry-ingestion-metatest
title: "PLAN-L7-61: telemetry ingestion transaction metatest の整備"
kind: impl
layer: L7
drive: fullstack
parent_design: docs/design/harness/L6-function-design/function-spec.md
status: completed
created: 2026-06-16
updated: 2026-06-16
review_evidence:
  - reviewer: code-reviewer
    review_kind: intra_runtime_subagent
    worker_model: gpt-5.4
    reviewer_model: gpt-5.4
    tests_green_at: "2026-06-16"
    reviewed_at: "2026-06-16"
    verdict: pass
    scope: "telemetry token ingestion の transaction guard と rollback metatest"
agent_slots:
  - role: tl
    slot_label: "TL - telemetry ingestion metatest 担当"
generates:
  - artifact_path: tests/token-tracker.test.ts
    artifact_type: test_code
dependencies:
  parent: PLAN-L7-58
  requires:
    - src/state-db/projection-writer.ts
    - src/state-db/token-tracker.ts
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-61: telemetry ingestion transaction metatest の整備

## 目的

大規模な session-log scan でも自動 telemetry 取得の堅牢性を保つ。

`helix telemetry scan` は、既存の Claude/Codex session JSONL から数万件の runtime token row を
ingest できる。ingest path は単一 SQLite transaction で batch 化されたままにし、projection failure
時は rollback しなければならない。

## 範囲

- `projectTokenUsage` が 1 つの `BEGIN IMMEDIATE` transaction を開くことを示す regression test を追加する。
- 自動 token projection の成功時に commit が 1 回だけ行われることを検証する。
- projection failure 時に rollback され、partial な `model_runs` row が残らないことを検証する。

## 検証

- [x] `bunx vitest run tests\token-tracker.test.ts`

## 完了条件

- [x] Bulk token usage ingest が transaction metatest で guard されている。
- [x] 失敗した token usage ingest が rollback metatest で guard されている。
- [x] test は provider CLI を呼び出さず、local user session file に依存しない。
