---
title: "HELIX L11 総合レビュー・UAT 境界"
layer: L11
kind: design
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Codex
---

# HELIX L11 総合レビュー・UAT 境界

L11 は、要件・実装・テスト・運用判断をまとめて確認する層である。現在は review evidence と completion packet の仕組みはあるが、open decisions が残るため全体 UAT close ではない。

## 現在の証跡

| 項目 | 証跡 |
|---|---|
| review 証跡 | `review-evidence` doctor gate |
| completion packet | `bun run src/cli.ts completion decision-packet --json` |
| semantic frontier | `src/lint/semantic-frontier-consistency.ts` |
| handover 未解決項目 | `.ut-tdd/handover/CURRENT.json` |

## 未完了境界

S4 decision、version-up activation、action-binding approval、cutover decision が残る状態では、L11 は全体承認を出さない。
