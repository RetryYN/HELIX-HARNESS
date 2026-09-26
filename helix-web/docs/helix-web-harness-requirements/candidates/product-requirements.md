---
title: "HELIX-WEB-HARNESS-REQUIREMENTSの要求候補（2026-09-26 PO原案）"
status: requirement_candidate
authority_status: unadopted
authority_effect: none
created: 2026-09-26
target: HELIX-WEB-HARNESS-REQUIREMENTS
source: helix-web/docs/helix-web/sources/helix-web-product-group-requirements-po-original-2026-09-26.md
source_sections: [5]
decision_record: docs/governance/decisions/helix-web-product-group-po-decisions-2026-09-26.md
---

# HELIX-WEB-HARNESS-REQUIREMENTSの要求候補（2026-09-26 PO原案）

## これは何か

2026-09-26にPOが示した「HELIX-Web製品群 要求原案」のうち、HELIX-WEB-HARNESS-REQUIREMENTSが担当する部分を、原文のID・種類・文言のまま載せる。
原文の状態は「要求候補・未採択」である。本書は要求（L2）でも受入（L11）でもなく、本書から要求の採用・承認・実装許可を生成しない。
採択後は、対象の`L1-planning/`、`L2-requirements/`、`L11-acceptance/`へ対応させる（原案1.2）。

出典は[原文のsnapshot](../../helix-web/sources/helix-web-product-group-requirements-po-original-2026-09-26.md)の5節（snapshot 143〜158行）である。見出しの階層だけを一段下げた。

## 原案の本文

<!-- 出典：snapshot 143〜158行（原案5節） -->
### 5．製品② HELIX-WEB-HARNESS-REQUIREMENTS

**目的：利用者の意図と既存資産から要求を形成し、必要な要件・受入条件を揃えられること。**

ID接頭辞：`HELIXWEBHARNESSREQUIREMENTS-L2-`

| 番号・種類 | 要求 | 受入候補 |
|---|---|---|
| **001・単体** | 目的、対象者、業務、利用場面、対象範囲、制約、期待成果を文章・フォーム・構造図から収集できること。 | 原入力と要求候補の対応を示し、追加解釈と利用者の指示を分ける。 |
| **002・接続** | BRAINの設計パターンが必要とする入力から、要求形成に不足している質問を導けること。 | 同じ内容を繰り返し質問せず、採用に不要な情報の全件入力を強制しない。 |
| **003・単体** | 機能、データ、権限、性能、信頼性、復旧、運用保守等を対象に応じて要求化し、単体・接続・構成体へ分けられること。 | 非機能要求や接続要求を画面・機能一覧の陰に落とさず、非該当の根拠を残す。 |
| **004・接続** | 一次要求形成の後、プロト・PoC・既存システムの確認結果を受けて二次形成できること。 | 変更理由と影響を残し、以前の合意を変更後の本文へ自動継承しない。 |
| **005・単体** | 要求候補、矛盾、不足、前提、選択肢、受入条件を提示し、利用者が意味を判断できること。 | AIが要件を起草できる一方、人間の要求・承認を代行して確定しない。 |
| **006・接続** | ID・版・出所・関係・受入条件付きの要件定義書を出力し、設計製品へ渡せること。 | 文書とCOREの内容が対応し、出力時に条件・例外・未決事項を欠落させない。 |

**単独成果物：** 要求・要件定義書、対象範囲、制約、未決事項、受入条件、設計へ渡す構造化入力。
