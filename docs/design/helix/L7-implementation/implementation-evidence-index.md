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

本書は L6 function contract と L7 実装・テスト証跡を結ぶ索引である。実装が存在することと、L14 全件達成は別である。

## 現在の実装証跡

| 領域 | 主な実装 | 主なテスト |
|---|---|---|
| P2 orchestration | `src/orchestration/**`, `src/runtime/**` | `tests/orchestration/**`, `tests/pair-agent.test.ts`, `tests/agent-guard.test.ts` |
| P7 memory | `src/memory/**`, `src/state-db/**` | `tests/memory/**`, `tests/projection-writer.test.ts` |
| P9 DB convergence | `src/state-db/**`, `src/lint/**` | `tests/db-projection-coverage.test.ts`, `tests/semantic-frontier-consistency.test.ts` |
| setup / consumer | `src/setup/**`, `src/doctor/index.ts` | `tests/setup.test.ts`, `tests/distribution-acceptance.test.ts`, `tests/cli-surface.test.ts` |
| rename cutover | `src/lint/identifier-rename.ts` | `tests/identifier-rename.test.ts`, `tests/cutover-readiness.test.ts` |

## 完了境界

- L7 の selected slices は `doctor` / targeted tests で green。
- `PLAN-L7-146-serverless-readonly-share` は `version_target: future` のため active L7 完了に数えない。
- `.ut-tdd` -> `.helix` は L14 cutover approval 前なので L7 実装済み扱いにしない。
- S4 未了の visualization は、read-model first response があっても L7 full implementation と扱わない。
