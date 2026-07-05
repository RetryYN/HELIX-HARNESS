---
title: "Harness L11 総合レビュー・UAT 境界"
layer: L11
kind: design
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Codex
---

# Harness L11 総合レビュー・UAT 境界

L11 は要求、要件、実装、検証証跡、運用判断をまとめて確認する層である。review evidence と completion packet は存在するが、open decisions が残る間は UAT close としない。

## 対象

| 項目 | 証跡 |
|---|---|
| review evidence 証跡 | `review-evidence` doctor gate |
| completion packet 証跡 | `./scripts/helix completion decision-packet --json` |
| review bundle 証跡 | `./scripts/helix completion review-bundle --json` |
| handover outstanding 証跡 | `.helix/handover/CURRENT.json` |

## 合否条件

- worker/reviewer 分離、tests_green_at、reviewed_at が記録されている。
- completion packet の required actions がすべて解消されている。
- UAT feedback が add-design / reverse / rejection route のいずれかへ分類されている。

## 未完了 blocker

`po_decision_pending`、`version_up_parked`、`human_approval_pending`、`irreversible_migration_pending` が残る状態では、L11 は全体承認を出さない。
