---
title: "workflow-model passage certificateのcatalog authority移行"
layer: L6
artifact_type: design
status: draft
created: 2026-09-10
updated: 2026-09-10
owner: Codex / TL
plan: docs/plans/PLAN-RECOVERY-1437-drive-passage-catalog-authority.md
pair_artifact: docs/test-design/helix/L8-drive-model-passage-catalog-authority-unit-test-design.md
parent_design: docs/design/helix/L6-function-design/workflow-classification-generated-catalog.md
---

# workflow-model passage certificateのcatalog authority移行

## 責務

既存のpassage certificate検査を、旧Drive model／entry modeの固定集合ではなく、requirements
registryから生成されたcurrent workflow classification catalogの`workflow_model` entity集合へ接続する。

## 契約

- certificate表の識別子列は`Workflow model / identity`とし、current typed identityを記録する。
- 必須識別子集合は`currentWorkflowModelIds()`から取得し、旧route／mode inventoryを参照しない。
- catalogに存在しないidentity、旧Drive model名、重複または欠落したcurrent identityはfail-closeする。
- 各行のForward targetとresidual statusの証跡検査は維持する。
- `PLAN-L3-04`の既存certificateはこのsliceでcurrent identity表へ更新する。旧Discovery／Scrum等のcompatibility
  identityはcurrent `workflow_model`集合へ再投入しない。

## 境界

このsliceはpassage certificateの検査入力と文書表をcurrent catalogへ収束させる。DB物理列、旧route-map
consumer、旧engine、配布、runtimeの削除・切替は含めず、後続の#1437／#865移管で扱う。

catalog projectionの生成・digest・legacy非出力契約は既存の
`workflow-classification-generated-catalog`へ委譲し、第二のidentity集合を作らない。
