---
title: "HELIX L4 基本設計 — 文書 agent metadata 境界"
layer: L4
kind: add-design
status: draft
created: 2026-07-14
updated: 2026-07-14
owner: Codex / TL
plan: PLAN-L3-13-vmodel-docgen-fit
related_l3: docs/design/helix/L3-requirements/document-agent-metadata.md
pair_artifact: docs/test-design/helix/L9-document-agent-metadata-integration.md
---

# HELIX L4 基本設計 — 文書 agent metadata 境界

## §1 境界

`document_agent` は Markdown source に属する従属宣言であり、read-model、harness.db、AI runtime role の
いずれも値を作らない。pure analyzer、filesystem adapter、CLI/doctor composition を分離し、導出規則を
adapter や CLI に複製しない。

| 境界 | 責務 | 禁止事項 |
|---|---|---|
| declaration parser | `spec.defines` / `spec.refs` の既存 typed 抽出 | 本文 heuristic を合格根拠にすること |
| metadata analyzer | expected metadata と finding を純粋に算出 | filesystem / process / write を行うこと |
| filesystem adapter | canonical scope の列挙と読み込み | 対象外文書を対象へ昇格すること |
| CLI / doctor | read-only result を正規化して gate へ接続 | source の apply / upsert、DB mutation を行うこと |

## §2 導入方針

baseline は `config/document-agent-metadata-scope.json` を正本として明示する。manifest は
`schema_version`、`include_roots`、`exclude_roots`、`documents`（canonical 相対pathの辞書順集合）、
`required_gates`、`phase` を持つ。manifest 不在・parse failure・空 `documents`・path traversal・scope外文書は
fail-close である。

`checkDocumentAgentMetadata(repoRoot, manifest)` は manifest を注入され、manifest に無い文書を covered 数へ
含めない。Phase A の doctor は manifest 対象を read-only に検査し、Phase B の apply は artifact write port と
rollback receipt を必須にする。manifest の owner は repository source であり、DB/read-model は派生表示だけである。
