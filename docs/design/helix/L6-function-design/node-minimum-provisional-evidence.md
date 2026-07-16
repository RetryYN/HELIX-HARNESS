---
title: "HELIX L6 機能設計 — Node Minimum provisional evidence"
layer: L6
kind: add-design
status: draft
created: 2026-07-16
updated: 2026-07-16
owner: Codex / TL
plan: PLAN-L7-458-node-minimum-provisional-evidence
pair_artifact: docs/test-design/helix/L8-node-minimum-provisional-evidence.md
---

# Node Minimum provisional evidence

## 境界

Node P0–P1はactive runtime、CLI、hook、CI、distribution、current pointerを切り替えない。
固定authority HEAD、Node/npm、lock/tree、SQLite、artifact、exact workflow集合を一つの`terminal:false`
receiptへ束縛する並行検証面だけを追加する。

## 契約

- workflow IDは`build/install/source-cli/sqlite/test/typecheck`のexact集合とし、欠落、未知、重複を拒否する。
- receiptはauthority HEAD、toolchain、lock/tree、SQLite API/version/compile options、artifact digestを必須にする。
- receiptの保存先は非active evidence artifactであり、current pointerやactivation stateを更新しない。
- production collectorはGit HEAD内のfrozen expectation artifact、Git HEAD/tree、Node/npm process、lock/tree bytes、
  `node:sqlite` query、artifact bytes、workflow artifact bytesをeffect portから再観測する。
  callerが完成済みbindingやdigestを直接提出するPASS APIは公開しない。
- workflow artifactは同じobserved HEAD/treeを持たなければならず、receiptは期待bindingと実観測bindingのexact一致を要求する。
- PASS receiptは保存直前にHEAD/tree freshnessを再検証し、symlinkを含まないcanonical ancestorだけを一階層ずつ作成して、
  `.helix/evidence/node-minimum/<receipt_digest>.json`へ`create-new`だけで保存する。同名上書きも拒否する。
- cutover、release、tag、distribution publishは本sliceの非目標である。
