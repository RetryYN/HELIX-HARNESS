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
| evidence | `.ut-tdd/evidence/g8-integration/` |
| doctor gate | `g8-integration-workflow - OK` |

## 未完了境界

L8 は S4 未了の visualization、future version の serverless sharing、L14 cutover を close しない。これらは semantic frontier records として保持する。
