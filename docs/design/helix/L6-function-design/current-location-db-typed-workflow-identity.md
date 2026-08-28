---
title: "current-location DB typed workflow identity projection"
layer: L6
artifact_type: design
status: draft
created: 2026-08-28
updated: 2026-08-28
owner: Codex / TL
authority: docs/governance/helix-harness-requirements_v1.3.md
plan: docs/plans/PLAN-L7-693-current-location-db-typed-workflow-identity.md
pair_artifact: docs/test-design/helix/L8-current-location-db-typed-workflow-identity.md
---

# current-location DB typed workflow identity投影

## 目的

`project_current_location`のprimary workflow identityをrequirements-owned registryのexact tupleへ
置換し、旧`selected_drive_model`／`default_drive_model`と旧候補tableをcurrent DB authorityから除去する。

## 契約

- current rowは`workflow_identity_schema_version`、`workflow_registry_version`、
  `workflow_registry_source_digest`、`workflow_target_axis`、`workflow_target_id`を必須投影する。
- typed tupleはcurrent classification catalogでversion、digest、axis、IDを再検証する。
- classification catalog／registryはgoverned consumer repositoryではなくinstalled HELIX packageの
  requirements authorityから読む。consumer cwdやfixture rootを意味正本として扱わない。
- current-location内部に残るlegacy inputは既存input-only adapterを通し、DB rowへ旧identityや変換元を再出力しない。
- missing、stale、unknown、ambiguous、unsupportedは空値やForward fallbackへ縮退せず、projection transactionを失敗させる。
- `project_drive_model_candidates`は旧model enumをDB authorityへ再投影するため削除する。候補判断の後継は
  typed routing／allocation contractが所有し、本sliceで別名tableを複製しない。
- canonical projectionの失敗をcompatibility inventoryや旧tableの成功で相殺しない。

## transaction境界

schema、index、projection writer、ingestion requirement、checkpoint canonicalizationを同一sliceで更新する。
DB rebuildはexact tupleを含むrowをcommitするか、identity検証失敗で全体をrollbackする。

## 非対象

CLI整形、visualization view/tree、skill applicability、routing/allocation、legacy adapter自体の削除は扱わない。
