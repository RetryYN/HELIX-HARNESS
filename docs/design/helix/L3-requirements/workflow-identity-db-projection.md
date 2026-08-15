---
title: "Typed workflow identity DB投影要件"
layer: L3
artifact_type: requirement
status: confirmed
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
source_issue: 205
---

# Typed workflow identity DB投影要件

## 上位authority

`docs/governance/helix-harness-requirements_v1.3.md` 4.2.1〜4.2.4の分類境界を継承する。本書は分類entityや
registry identityを変更せず、#205のDB read-model要件だけを追加する。分類意味が不変なためclassification
registry versionを便乗更新しない。

## DBP-FR-001 PLAN registry exact projection

`plan_registry`はPLAN frontmatterの`workflow_identity`を、次の独立5 fieldへexact投影する。

- `workflow_identity_schema_version`
- `workflow_registry_version`
- `workflow_registry_source_digest`
- `workflow_target_axis`
- `workflow_target_id`

PLANにidentityが無いlegacy recordでは5 fieldを全てSQL `NULL`とする。identityが存在する場合はall-or-noneの
strict schema、current classification registry version／digest、登録済みaxis＋IDを再検証し、同一transactionで
投影する。欠損、余分field、型不正、authority drift、unknown identityをidentityなしへ丸めずfail-closeする。

## DBP-NFR-001 deterministic replay

同じPLAN source集合からのrebuild／replayは同じ5 fieldを返し、validation failureでは直前projectionを部分更新しない。

## DBP-AC-001 legacy非再出力

`plan_registry`へ`route_mode`、`mode`、`model`、`catalog_route_id`、`route_class`をcurrent identity列として
追加しない。legacy PLANの成功をtyped PLANのvalidation failure相殺へ使わない。

## 後続境界

execution episode、current-location、right-arm evidenceとの束縛は、このexact tupleを入力とする後続の独立要件・
projectionで追加する。本要件だけでIssue #205のcompletionを主張しない。
