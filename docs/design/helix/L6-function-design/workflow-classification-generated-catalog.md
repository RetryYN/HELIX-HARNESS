---
title: "workflow分類generated catalog機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-15
updated: 2026-08-15
owner: Codex / TL
plan: docs/plans/PLAN-L7-561-workflow-classification-generated-catalog.md
pair_artifact: docs/test-design/helix/L8-workflow-classification-generated-catalog-runtime-unit-test-design.md
---

# workflow分類generated catalog機能設計

## 責務

`workflow-classification-registry.v1`を唯一の入力として、下流consumer向けのversioned catalogを
決定的に生成する。catalogは意味を追加・変更せず、registryの全entity、typed axis、parent relation、
signal bindingを順序込みで等価投影する。

## 契約

- `U-WFCAT-001`: registryの全identityとrelationを損失なく投影する。
- `U-WFCAT-002`: registry version、requirements version、requirements digest、registry bytes digestを束縛する。
- `U-WFCAT-003`: common route identityとlegacy identity emissionを禁止する。
- `U-WFCAT-004`: committed catalogが再生成結果と異なる場合はfail-closeする。

旧`config/drive-route-catalog.json`はconsumer移行中のcompatibility inventoryであり、本catalogの
件数、identity、axis、意味を決定しない。

## DB registration consumer

`drive-db-registration` は `drive_runs.workflow_target_axis=workflow_model` の typed identity を
catalogのworkflow model集合に照合する。catalogに存在しないtyped identityは登録不備として
fail-closeする。一方、`drive_runs.mode` と `route_modes` は互換観測値であり、旧modeの存在数や
旧名の完全集合を current green 条件にしない。
