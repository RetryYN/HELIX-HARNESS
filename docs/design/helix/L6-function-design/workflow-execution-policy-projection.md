---
title: "workflow execution policy generated projection機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-15
updated: 2026-08-15
owner: Codex / TL
plan: docs/plans/PLAN-L7-563-workflow-execution-policy-projection.md
pair_artifact: docs/test-design/helix/L8-workflow-execution-policy-projection-runtime-unit-test-design.md
---

# workflow execution policy generated projection機能設計

## 責務

requirements-owned `workflow-execution-policy-registry.v1`を唯一の入力として、下流consumer向けの
versioned policy projectionを決定的に生成する。projectionは意味やcommandを追加せず、登録済み
command ID、typed binding、coverageを損失なく投影する。

## 契約

- `U-WFEPROJ-001`: registryのcommand、binding、coverageを損失なく投影する。
- `U-WFEPROJ-002`: requirements、classification registry、policy registry bytesのdigestを束縛する。
- `U-WFEPROJ-003`: raw commandとlegacy identityのcurrent outputを禁止する。
- `U-WFEPROJ-004`: committed projectionが再生成結果と異なる場合はfail-closeする。
- `U-WFEPROJ-005`: design catalog登録をG3 freeze digestへ伝播する。

旧`src/schema/route-map.ts`と旧15-route catalogはcompatibility inventoryであり、本projectionの
command、binding、approval policyを決定しない。
