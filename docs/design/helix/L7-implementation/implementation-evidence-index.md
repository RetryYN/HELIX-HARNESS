---
title: "HELIX L7 実装証跡インデックス"
layer: L7
kind: design
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Codex
pair_artifact: docs/test-design/helix/L6-pillar-unit-test-design.md
---

# HELIX L7 実装証跡インデックス

本書は L6 機能 contract と L7 実装・テスト証跡を結ぶ索引である。実装が存在することと、L14 全件達成は別である。

## 現在の実装証跡

| 領域 | 主な実装 | 主なテスト |
|---|---|---|
| P2 orchestration | `src/orchestration/**`, `src/runtime/**` | `tests/orchestration/**`, `tests/pair-agent.test.ts`, `tests/agent-guard.test.ts` |
| P7 memory | `src/memory/**`, `src/state-db/**` | `tests/memory/**`, `tests/projection-writer.test.ts` |
| P9 DB convergence | `src/state-db/**`, `src/lint/**` | `tests/db-projection-coverage.test.ts`, `tests/semantic-frontier-consistency.test.ts` |
| setup / consumer | `src/setup/**`, `src/doctor/index.ts` | `tests/setup.test.ts`, `tests/distribution-acceptance.test.ts`, `tests/cli-surface.test.ts` |
| rename cutover | `src/lint/identifier-rename.ts` | `tests/identifier-rename.test.ts`, `tests/cutover-readiness.test.ts` |

## 証跡対応

| L7 観点 | source / surface | test / oracle | 境界 |
|---|---|---|---|
| L6 unit oracle trace | `docs/test-design/helix/L6-pillar-unit-test-design.md` の `HU-PILLAR-*` 43 件 | `tests/vmodel-pair.test.ts` の L6/L7 oracle count assertion | L6 function contract と L7 unit oracle の接続を検査する。実 runtime claim の代替にはしない。 |
| runtime provenance | `classifyVerificationEvidenceProfile` / `runtime-verification` surfaces | `tests/run-debug.test.ts` / `tests/projection-writer.test.ts` / `tests/semantic-frontier-consistency.test.ts` | `session_id`、runtime surface、timestamp、evidence path がある場合だけ `works` / `fired` / `used` claim に近づける。projection-only row は trace support に留める。 |
| setup/distribution implementation | `src/setup/**` / `src/lint/identifier-rename.ts` / `src/lint/distribution-*` | `tests/setup.test.ts` / `tests/distribution-acceptance.test.ts` / `tests/identifier-rename.test.ts` | consumer setup と rename rehearsal は no-write / plan-only 証跡であり、release/tag publish や cutover apply ではない。 |
| whole-program completion boundary | `src/lint/outstanding.ts` / `src/lint/completion-decision-packet.ts` / `src/lint/objective-evidence-audit.ts` | `tests/outstanding.test.ts` / `tests/completion-decision-packet.test.ts` / `tests/goal-evidence-audit.test.ts` | L7 の選択済み実装 green を L14 completion に読み替えない。`completionClaimAllowed=false` の間は G-10 blocked を維持する。 |

## 完了境界

- L7 の選択済み slice は `doctor` / targeted tests で green。
- `PLAN-L7-146-serverless-readonly-share` は `version_target: future` のため active L7 完了に数えない。
- `.helix` -> `.helix` は L14 cutover 承認前なので L7 実装済み扱いにしない。
- S4 未了の visualization は、read-model 初回応答があっても L7 全面実装と扱わない。
