---
title: "workflow分類legacy input-only adapter機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
plan: docs/plans/PLAN-L7-568-workflow-classification-legacy-adapter.md
pair_artifact: docs/test-design/helix/L8-workflow-classification-legacy-adapter-unit-test-design.md
---

# workflow分類legacy input-only adapter機能設計

## 責務

deprecatedな`mode`／`model`入力だけをrequirements-owned versioned registryのbounded exact tableで
current `target_axis + target_id`へ一方向変換する。実装内に意味正本となる複製表を持たない。
receiptは変換元field/token、warning、変換先を残すが、legacy identityをcurrent output fieldとして再出力しない。

`forward`は3個のdevelopment styleを一意に決められず、旧`scrum`はProduction ScrumとHybridを区別できない。
`design-bottomup`はSCREEN_DESIGNとbackend-derived条件を同時に確定できず、旧`verification`もcurrent
verification scopeを一意に定めない。これらは推測変換せず`ambiguous`でfail-closeする。unknown値をForwardへ丸めない。

- `U-WFLEG-001`: exact legacy workflow modelをtyped identityへ一方向変換する。
- `U-WFLEG-002`: case-driven modelとworkflow modelのaxisを混同しない。
- `U-WFLEG-003`: ambiguous legacy値を推測せず拒否する。
- `U-WFLEG-004`: unknown値をunsupportedとして拒否する。
- `U-WFLEG-005`: receiptへlegacy identityをcurrent fieldとして再出力しない。
- `U-WFLEG-006`: registry contractを欠損させても実装内fallbackで変換しない。
- `U-WFLEG-007`: design／test design登録をG3 freeze digestへ伝播する。

本sliceはadapter APIを確立する。既存`routeSignalToMode` consumerの除去とDB projection移行は後続sliceで行い、
legacy adapterをcurrent routing authorityとして呼び戻さない。
