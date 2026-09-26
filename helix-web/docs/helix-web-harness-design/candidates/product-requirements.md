---
title: "HELIX-WEB-HARNESS-DESIGNの要求候補（2026-09-26 PO原案）"
status: requirement_candidate
authority_status: unadopted
authority_effect: none
created: 2026-09-26
target: HELIX-WEB-HARNESS-DESIGN
source: helix-web/docs/helix-web/sources/helix-web-product-group-requirements-po-original-2026-09-26.md
source_sections: [6]
decision_record: docs/governance/decisions/helix-web-product-group-po-decisions-2026-09-26.md
---

# HELIX-WEB-HARNESS-DESIGNの要求候補（2026-09-26 PO原案）

## これは何か

2026-09-26にPOが示した「HELIX-Web製品群 要求原案」のうち、HELIX-WEB-HARNESS-DESIGNが担当する部分を、原文のID・種類・文言のまま載せる。
原文の状態は「要求候補・未採択」である。本書は要求（L2）でも受入（L11）でもなく、本書から要求の採用・承認・実装許可を生成しない。
採択後は、対象の`L1-planning/`、`L2-requirements/`、`L11-acceptance/`へ対応させる（原案1.2）。

出典は[原文のsnapshot](../../helix-web/sources/helix-web-product-group-requirements-po-original-2026-09-26.md)の6節（snapshot 162〜177行）である。見出しの階層だけを一段下げた。

## 原案の本文

<!-- 出典：snapshot 162〜177行（原案6節） -->
### 6．製品③ HELIX-WEB-HARNESS-DESIGN

**目的：製品構造をWebで編集し、COREとBRAINを通して一貫した設計を導けること。**

ID接頭辞：`HELIXWEBHARNESSDESIGN-L2-`

| 番号・種類 | 要求 | 受入候補 |
|---|---|---|
| **001・単体** | 画面構成、画面遷移、DB、API、アーキテクチャ、配備構成を、同じ製品モデルの異なる観点として編集できること。 | 同一対象を別画面で変更した結果が整合し、図ごとの独立正本にならない。 |
| **002・単体** | DBの実体、属性、型、必須条件、キー、関係、制約、ライフサイクル、変更時の既存データ条件を扱えること。 | 必須化や削除等から既存データへの影響を示し、定義変更だけでデータ移行済みとしない。 |
| **003・単体** | 構成要素、責務、接続、入出力、依存、認証・認可境界、実行環境をアーキテクチャとして扱えること。 | 接続線を描くだけで通信・権限・障害時の契約が成立したことにしない。 |
| **004・接続** | CORE、BRAIN、INTELLIGENCEを利用し、適用候補、必要入力、代替案、制約、反例、根拠を伴う設計を導けること。 | パターンの存在と案件への採用を分け、選択理由と参照版を保持する。 |
| **005・構成体** | 設計変更から画面、API、DB、実装、テスト、配備への影響と必要な再検証を導けること。 | 影響あり・なし・不明を区別し、無関係な全体再生成や無根拠な影響なし判定を避ける。 |
| **006・接続** | 設計書、構成図、定義、必要な検証義務を出力し、開発・リリース・運用保守へ渡せること。 | 設計の予測・シミュレーション結果と、実測・実証済み結果を区別する。 |

**単独成果物：** 設計書、画面・データ・API・構成の定義、変更影響、設計判断、検証義務。
