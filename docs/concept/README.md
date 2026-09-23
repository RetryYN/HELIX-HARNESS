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
| [要求対応表](../governance/crosswalks/concept-mechanism-version-requirement-crosswalk.md)・[PO判断パッケージ](../governance/crosswalks/concept-requirement-po-decision-packet.md) | 既存要求の再配置候補と未承認の上流差分 |
| 各機構・製品の定義（`docs/helix-*/L1-planning/`） | 機構・製品ごとの定義 |
| [HELIXの構造仮説](helix-structure-tvo-po-statements-2026-09-18.md) | 構成システム群の仮説と検証状態 |

## 履歴

版ごとのファイルは残さない。旧来の版別ファイルは下位文書の親付替えと同時に削除済みで、過去の本文はgit履歴で辿る。親は[HELIX Concept](helix-concept.md)の1ファイルである。
削除後の過去の本文はgitの履歴で辿り、承認記録は対象のcommitとSHA-256で指す。
