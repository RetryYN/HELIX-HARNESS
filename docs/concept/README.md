# HELIX Concept入口

[HELIX Concept](helix-concept.md)が、HELIXがどんなシステムで、どんな構想を持ち、どんな機構で成り立つかを定める唯一の現行本文である。
版ごとに別ファイルを作らず、同じファイルをその場で改訂する。改訂は人の指示をAIが反映する。変更の履歴はgitに残る。
Conceptを改訂したら、紐づく下位文書を見直し対象として示す。見直しを理由に作業全体を止めない。

## Conceptに紐づく下位文書

Conceptは他の文書を参照しない。次の文書がConceptを親として参照する。

| 文書 | 役割 |
|---|---|
| [HELIX自体の5大目標](helix-five-goals.md) | Conceptの5大目標の由来と詳細 |
| [HELIXエージェントの七大原則](helix-principles.md) | エージェントの行動規律。Conceptの9原則（構造原則）とは別 |
| [製品責務境界](product-boundary.md) | PO原文と機構・製品の責務境界の根拠 |
| 各機構・製品の定義（`docs/helix-*/L1-planning/`） | 機構・製品ごとの定義 |
| [HELIXの構造仮説](helix-structure-tvo-po-statements-2026-09-18.md) | 構成システム群の仮説と検証状態 |

## 履歴

版ごとのファイルは残さない。旧来の[v4.1](helix-concept-v4.1.md)と[v4.2](helix-concept-v4.2.md)は、下位文書の親を[HELIX Concept](helix-concept.md)へ付け替える改訂と同時に削除する。
削除後の過去の本文はgitの履歴で辿り、承認記録は対象のcommitとSHA-256で指す。
