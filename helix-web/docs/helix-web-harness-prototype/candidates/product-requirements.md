---
title: "HELIX-WEB-HARNESS-PROTOTYPEの要求候補（2026-09-26 PO原案）"
status: requirement_candidate
authority_status: unadopted
authority_effect: none
created: 2026-09-26
target: HELIX-WEB-HARNESS-PROTOTYPE
source: helix-web/docs/helix-web/sources/helix-web-product-group-requirements-po-original-2026-09-26.md
source_sections: [4]
decision_record: docs/governance/decisions/helix-web-product-group-po-decisions-2026-09-26.md
---

# HELIX-WEB-HARNESS-PROTOTYPEの要求候補（2026-09-26 PO原案）

## これは何か

2026-09-26にPOが示した「HELIX-Web製品群 要求原案」のうち、HELIX-WEB-HARNESS-PROTOTYPEが担当する部分を、原文のID・種類・文言のまま載せる。
原文の状態は「要求候補・未採択」である。本書は要求（L2）でも受入（L11）でもなく、本書から要求の採用・承認・実装許可を生成しない。
採択後は、対象の`L1-planning/`、`L2-requirements/`、`L11-acceptance/`へ対応させる（原案1.2）。

出典は[原文のsnapshot](../../helix-web/sources/helix-web-product-group-requirements-po-original-2026-09-26.md)の4節（snapshot 125〜139行）である。見出しの階層だけを一段下げた。

## 原案の本文

<!-- 出典：snapshot 125〜139行（原案4節） -->
### 4．製品① HELIX-WEB-HARNESS-PROTOTYPE

**目的：実装前に、利用者体験と技術的成立性を別々に確かめ、要求・設計へ結果を戻せること。**

ID接頭辞：`HELIXWEBHARNESSPROTOTYPE-L2-`

| 番号・種類 | 要求 | 受入候補 |
|---|---|---|
| **001・単体** | 利用者、目的、利用場面、操作、期待結果、制約、既存資料、検証したい不確実性を入力できること。 | 未入力・仮説・確定条件を区別し、AIが目的や制約を無断補完しない。 |
| **002・単体** | 画面構成、画面遷移、領域、フォーム、操作、状態をノード・属性・文章から編集できること。 | 正常、空、読込中、入力不備、失敗等の必要な状態と遷移を操作して確認できる。 |
| **003・接続** | BRAINのビジュアル・UX知識とVisual Design HARNESSを利用し、操作可能な画面プロトとHTMLを生成・修正できること。 | 製品固有の表現と汎用パターンを区別し、モックデータと実接続を表示する。 |
| **004・単体** | 画面の有無とは独立してPoCを実施し、仮説、試験条件、実験、観測、限界、成立・不成立・不明を記録できること。 | 非UI案件でも必要なPoCを実施でき、「動いた」だけで本番対応を宣言しない。 |
| **005・接続** | プロトとPoCの結果を要求形成・設計へ戻し、採用・修正・棄却した内容と理由を保持できること。 | 試作の結果が要件定義へ反映され、棄却した仮説が確定仕様へ混入しない。 |

**単独成果物：** 操作可能な画面試作、HTML、PoC成果物、検証記録、未解決事項、後続へ渡す入力。
