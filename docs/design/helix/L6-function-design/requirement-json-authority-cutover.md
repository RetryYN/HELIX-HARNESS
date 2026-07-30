---
title: "Requirement JSON authority cutover機能設計"
layer: L6
kind: add-design
status: draft
created: 2026-07-30
updated: 2026-07-30
owner: Codex / TL
plan: docs/plans/PLAN-L6-91-requirement-json-authority-cutover.md
parent_design: docs/design/helix/L6-function-design/requirement-generated-view-projection.md
pair_artifact: docs/test-design/helix/L8-requirement-json-authority-cutover-unit-test-design.md
---

# Requirement JSON authority cutover機能設計

## §0 位置づけ

PR3のshadow migrationとPR4の生成view／DB shadowを同一transactionでcanonical JSON authorityへ
切り替える。切替後の意味読取は`requirements-ir/manifest.json`以下のstable-ID shardだけを正規経路とし、
旧4 Markdownはdigest固定したcompatibility read-only input、Markdown viewはJSONからの生成物とする。

## §1 authority contract

- `config/requirement-ir-authority.json`がcanonical root、生成view、互換入力exact setとdigestを固定する。
- canonical shardは`helix-requirement-ir.v1`、`canonical`、`json_stable_id_shards`を同時に要求する。
- 旧Markdownは`authority_status: compatibility_read_only`とcanonical pointerを持ち、直接更新を拒否する。
- semantic consumerはcanonical JSONだけを読み、legacy Markdownを読むmigration toolは明示allowlistする。
- shadow generatorは明示出力先を必須とし、canonical／旧shadow pathへの再生成を拒否する。

## §2 view／DB cutover

- generated Markdownはcanonical JSONからbyte-for-byte再生成し、直接編集をdoctorで拒否する。
- harness.db schema v41の`requirement_ir`へ273 rowを単一transactionで投影する。
- 旧`requirement_ir_shadow`は同transaction内でdropし、再build後に存在しないことを検証する。
- requirement本文やraw shardをDBへ複製せず、ID、digest、owner、oracle、status、sourceだけを保持する。

## §3 fail-close

- canonical shard count／stable ID key／record digest／root digest drift
- generated view byte drift
- compatibility exact set／digest／frontmatter drift
- legacy Markdown semantic readのallowlist外consumer
- retired shadow artifactまたはDB tableの残存
- canonical JSONとlegacy Markdownのdual-write／dual-authority claim

## §4 非対象

- Requirement Discovery runtime、human edit proposal transaction
- Design Template JSON／Portfolio Planner（Issue #290）
- G1/G3 freeze receipt再発行（Issue #288）
