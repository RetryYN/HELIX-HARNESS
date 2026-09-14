---
title: "Harness L7 実装証跡境界"
layer: L7
kind: design
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Codex
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
---

# Harness L7 実装証跡境界

本書は harness core の L6 機能設計と L7 実装・単体テスト証跡を結ぶ境界である。L7 の selected slice が green であることと、L8-L14 の全体完了は別である。

## 対象

| 領域 | 実装 | 主な検証 |
|---|---|---|
| CLI / runtime guard | `src/cli.ts`, `src/runtime/**` | `tests/cli-surface.test.ts`, `tests/runtime*.test.ts`, `tests/*guard*.test.ts` |
| workflow / lint | `src/lint/**`, `src/plan/**`, `src/vmodel/**` | `tests/*lint*.test.ts`, `tests/vmodel-pair.test.ts`, `tests/doctor.test.ts` |
| state DB / projection | `src/state-db/**`, `src/feedback/**` | `tests/state-db.test.ts`, `tests/projection-writer.test.ts`, `tests/db-projection-*.test.ts` |
| setup / distribution | `src/setup/**`, `scripts/helix*` | `tests/setup.test.ts`, `tests/distribution-acceptance.test.ts` |

## 合否条件

- `bun run typecheck`、`bun run lint`、`bun run test:local` が green。
- `./scripts/helix doctor` が hard gate green。
- `impl-plan-trace` と `oracle-test-trace` が新規 orphan 0。

## 未完了 blocker

- S4 未了の discovery work は L7 完了根拠にしない。
- `PLAN-L7-146-serverless-readonly-share` は future activation まで active frontier 完了に数えない。
- `.helix` 系の不可逆 rename は PLAN-M-02 の cutover approval 前に L7 実装済み扱いにしない。
