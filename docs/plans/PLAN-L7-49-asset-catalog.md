---
plan_id: PLAN-L7-49-asset-catalog
title: "PLAN-L7-49: harness.db 自動化 asset catalog"
kind: impl
layer: L7
drive: db
parent_design: docs/design/harness/L6-function-design/function-spec.md
status: completed
created: 2026-06-11
updated: 2026-06-11
agent_slots:
  - role: tl
    slot_label: 'TL - 自動化 asset catalog レビュー'
  - role: qa
    slot_label: 'QA - asset catalog evidence と drift レビュー'
review_evidence:
  - reviewer: code-reviewer
    review_kind: intra_runtime_subagent
    worker_model: gpt-5.4
    reviewer_model: gpt-5.3-codex
    tests_green_at: "2026-06-11"
    reviewed_at: "2026-06-11"
    verdict: pass-with-fixes
    scope: "asset catalog 範囲: metadata-only cataloging、許可 roots、DB に prompt bodies / secrets を保存しないこと、drift と空 catalog を findings として可視化すること。"
generates:
  - artifact_path: src/assets/catalog.ts
    artifact_type: source_module
  - artifact_path: tests/asset-catalog.test.ts
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
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-49: harness.db 自動化 asset catalog

## 目的

- 承認済み skill / roster / command roots を scan する `catalogAutomationAssets()` を実装する。
- metadata-only rows を `automation_assets` に保存し、検索可能な references を `search_index` に保存する。
- `helix asset catalog` を公開する。

## 不変条件

- Source paths は承認済み docs / `.claude` roots に限定する。
- Prompt bodies と secrets は DB に保存しない。
- Drift と空 catalog 条件は findings として可視化する。

## 完了証跡

- `src/assets/catalog.ts` と `tests/asset-catalog.test.ts` が存在する。
- `bun test tests/search-feedback.test.ts tests/readiness-guardrail.test.ts tests/asset-catalog.test.ts` -> 7 件 pass。
- `bunx tsc --noEmit` -> pass。
- `bun run src/cli.ts db rebuild --json` -> pass。
- `bun run src/cli.ts asset catalog --json` -> pass。19 件の metadata-only assets、findings 0。
- `bun run src/cli.ts doctor` -> pass。

## 注記

- `db rebuild` は設計どおり `automation_assets` を 0 に reset する。`asset catalog` は asset metadata を投入する projection command である。

## DoD

- [x] IT-ASSET-DB-01 通過。
- [x] `asset catalog` が実行可能で、prompt body non-storage invariant を網羅済み。
- [x] 回帰 slice と doctor 通過、review evidence 記録済み。
