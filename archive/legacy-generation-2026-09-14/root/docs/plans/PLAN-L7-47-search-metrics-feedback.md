---
plan_id: PLAN-L7-47-search-metrics-feedback
title: "PLAN-L7-47: harness.db search index + skill metrics + feedback engine"
kind: impl
layer: L7
drive: db
parent_design: docs/design/harness/L6-function-design/function-spec.md
status: completed
created: 2026-06-11
updated: 2026-06-11
agent_slots:
  - role: tl
    slot_label: 'TL - search metrics / feedback DB projection review'
  - role: qa
    slot_label: 'QA - IT-DB search / feedback evidence review'
review_evidence:
  - reviewer: code-reviewer
    review_kind: intra_runtime_subagent
    worker_model: gpt-5.4
    reviewer_model: gpt-5.3-codex
    tests_green_at: "2026-06-11"
    reviewed_at: "2026-06-11"
    verdict: pass-with-fixes
    scope: "search / metrics / feedback 範囲: ranked find、skill metrics、feedback events、read-only search、feedback による PLAN 自動承認なし。"
generates:
  - artifact_path: src/search/index.ts
    artifact_type: source_module
  - artifact_path: src/feedback/engine.ts
    artifact_type: source_module
  - artifact_path: tests/search-feedback.test.ts
    artifact_type: test_code
pair_artifact: docs/test-design/harness/L8-integration-test-design.md
next_pair_freeze: L8
dependencies:
  parent: docs/plans/PLAN-L7-44-harness-db-master.md
  requires:
    - docs/plans/PLAN-L7-46-projection-writer.md
    - docs/design/harness/L5-detailed-design/internal-processing.md
    - docs/design/harness/L5-detailed-design/if-detail.md
    - docs/test-design/harness/L8-integration-test-design.md
  references:
    - docs/design/harness/L5-detailed-design/physical-data.md
    - https://www.sqlite.org/fts5.html
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-47: harness.db search + skill metrics + feedback の実装

## 目的

- `search_index` 上に `findReference(query)` を実装し、`helix find` を公開する。
- `computeSkillMetrics()` を実装し、firing / acceptance rates を `quality_signals` に保存して `helix metrics skill` を公開する。
- `emitFeedbackEvents()` を実装し、open findings / quality failures を `feedback_events` へ変換して `helix feedback list` を公開する。

## 不変条件

- authoring sources に対して search は read-only とし、DB projection は再構築可能にする。
- 欠落した skill logs は fabricated success ではなく findings として記録する。
- Feedback events は PLAN を自動承認しない。
- Secret-like content と transcript bodies は index 対象にしない。

## 完了証跡

- `src/search/index.ts`、`src/feedback/engine.ts`、`tests/search-feedback.test.ts` が存在する。
- `bun test tests/search-feedback.test.ts tests/readiness-guardrail.test.ts tests/asset-catalog.test.ts` -> 7 pass.
- `bunx tsc --noEmit` -> pass.
- `bun run src/cli.ts db rebuild --json` -> pass.
- CLI smoke が pass:
  - `bun run src/cli.ts find PLAN-L7-47-search-metrics-feedback --json`
  - `bun run src/cli.ts metrics skill --json`
  - `bun run src/cli.ts feedback list --emit --json`
- `bun run src/cli.ts doctor` -> pass.

## DoD

- [x] IT-SEARCH-01 / DB-03 / FEEDBACK-01 が green。
- [x] `find` / `metrics skill` / `feedback list` が runnable で、不変条件を維持している。
- [x] Regression slice と doctor が green で、review evidence が存在する。
