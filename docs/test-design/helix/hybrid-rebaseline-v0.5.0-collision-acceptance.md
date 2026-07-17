---
title: "REBASELINE v0.5.0追突統合 受入・検証設計"
layer: L10
kind: system-test-design
status: draft
created: 2026-07-18
updated: 2026-07-18
owner: QA
pair_artifact: docs/design/helix/L3-requirements/hybrid-rebaseline-v0.5.0-collision.md
---

# REBASELINE v0.5.0追突統合 受入・検証設計

| AC-ID | 対応要件 | positive oracle | negative / boundary oracle |
|---|---|---|---|
| AC-V050-01 | HR-FR-V050-01 | ZIP digest一致、checksum 200/200、physical file 202 | 1 byte mutation、member欠落、200と202の混同を拒否 |
| AC-V050-02 | HR-FR-V050-02 | requirement 168、AC 117、edge 333、追加5/6/47を再計算 | hard-coded summary、削除・重複ownerを拒否 |
| AC-V050-03 | HR-FR-V050-03 | current authorityがtracked accepted ADRへ一意解決 | ZIP内confirmedだけによるauthority反転を拒否 |
| AC-V050-04 | HR-FR-V050-04 | Python入力・出力境界とNode再検証を全capability classで確認 | DB path、credential、SQL実行、network許可を注入して拒否 |
| AC-V050-05 | HR-FR-V050-05 | capsule scope、brief marker、digestがClaude/Codexで同一 | conformance failure時のprompt-only fallbackを拒否 |
| AC-V050-06 | HR-FR-V050-06 | full V／Production Scrum／PoCがexactly-one | unknown、hard trigger、Scrum不適格を完全Vへfail-close |
| AC-V050-07 | HR-FR-V050-07 | manifest/report/catalog/decision authorityが同一version・count・state | 既知5矛盾のどれか1件でも残ればterminal FAIL |
| AC-V050-08 | HR-FR-V050-08 | L1/L3/L4/L10/L12 routeとAC joinが全件一意 | unclassified、orphan、duplicate projectionを拒否 |

## 実行順序

1. source bytesとchecksumを再計算する。
2. v0.4.0とv0.5.0のID集合を再計算する。
3. current repo authorityとの衝突を判定する。
4. L1–L12 projectionとdelivery routeを検証する。
5. 既知矛盾0、unclassified 0、orphan 0の場合だけ追突統合をPASSにする。
