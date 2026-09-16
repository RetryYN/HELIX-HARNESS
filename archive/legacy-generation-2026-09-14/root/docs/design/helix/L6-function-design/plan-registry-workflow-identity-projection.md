---
title: "PLAN registry typed workflow identity投影機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
plan: docs/plans/PLAN-L7-575-plan-registry-workflow-identity-projection.md
pair_artifact: docs/test-design/helix/L8-plan-registry-workflow-identity-projection-unit-test-design.md
---

# PLAN registry typed workflow identity投影機能設計

## Authority

要件正本4.2.1〜4.2.4、Issue #205のDB projection契約、およびPLAN frontmatterの
`workflow_identity` strict schemaを上位authorityとする。新しい分類意味やL3要件を追加しない。
旧15-route catalog、`route_mode`、PLAN ID prefix、`kind`からcurrent identityを推測しない。

## 責務

`docs/plans/*.md`のfrontmatterを読み、typed identityを`plan_registry`の独立5列へ同一transactionで投影する。
本sliceはPLAN sourceからのread modelだけを所有し、Issue／PR ingest、current-location、execution episode、
right-arm evidenceは所有しない。

## Contract

- `U-DBWID-001`: strict schemaを通過したidentityのschema version、registry version、registry digest、axis、IDを
  値を変えず5列へ投影する。
- `U-DBWID-002`: identity objectが存在するのに欠損、余分なfield、型不正、registry drift、unknown identityが
  あればrebuildをfail-closeする。
- `U-DBWID-003`: identity未宣言のlegacy PLANは5列を全てSQL `NULL`とし、部分tupleを作らない。
- `U-DBWID-004`: DB schemaとprojectionへ`route_mode`、`mode`、`model`、`catalog_route_id`、`route_class`を
  current identityとして追加しない。
- `U-DBWID-005`: 汎用projection writerもtyped 5列の部分指定を拒否する。

## Transaction境界

`rebuildHarnessDb`の既存atomic rebuild内でschema migrationと全PLAN projectionを行う。typed identityの
validation failureはtransaction全体をrollbackし、直前のDB projectionを部分更新しない。rebuild／replayは
同じsource contentに対して同じtupleを返す。

## 後続境界

current-location、execution episode、right-arm bindingは#205の後続原子的PRで、この5列のexact tupleを入力にする。
本sliceの成功を#205全体のcompletionとは扱わない。
