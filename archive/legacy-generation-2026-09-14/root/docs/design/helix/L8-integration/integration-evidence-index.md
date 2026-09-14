---
title: "HELIX L8 結合テスト証跡インデックス"
layer: L8
kind: design
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Codex
pair_artifact: docs/test-design/helix/L5-pillar-integration-test-design.md
---

# HELIX L8 結合テスト証跡インデックス

本書は L5 integration contract と L8 実行証跡の対応を示す。現時点で close しているのは selected G8 profile であり、全 delivery ではない。

## 証跡

| 項目 | 証跡 |
|---|---|
| test-design | `docs/test-design/helix/L5-pillar-integration-test-design.md` |
| harness integration design | `docs/test-design/harness/L8-integration-test-design.md` |
| 実行テスト | `tests/g8-integration-workflow.test.ts` |
| evidence | `.helix/evidence/g8-integration/` |
| doctor gate | `g8-integration-workflow - OK` |

## 証跡対応

| L8 観点 | source / surface | test / oracle | 境界 |
|---|---|---|---|
| selected G8 workflow | `src/lint/g8-integration-workflow.ts` | `tests/g8-integration-workflow.test.ts` | selected / mandatory IT case と evidence manifest を検査する。全 delivery complete ではない。 |
| L5 contract trace | `docs/test-design/helix/L5-pillar-integration-test-design.md` | `tests/vmodel-pair.test.ts` の L5/L8 pair assertion | L5 contract が L8 integration test design に接続されることを見る。実 external integration pass の代替にはしない。 |
| evidence manifest | `.helix/evidence/g8-integration/` | `tests/g8-integration-workflow.test.ts` の manifest assertion | 証跡 path と mandatory case を固定する。未選択 frontier は L14 completion へ混ぜない。 |

## 未完了境界

L8 は S4 未了の visualization、future version の serverless sharing、L14 cutover を close しない。これらは semantic frontier records として保持する。
