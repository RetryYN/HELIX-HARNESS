---
title: "HELIX-WEB-CONNECTORの要求候補（2026-09-26 PO原案）"
status: requirement_candidate
authority_status: unadopted
authority_effect: none
created: 2026-09-26
target: HELIX-WEB-CONNECTOR
source: helix-web/docs/helix-web/sources/helix-web-product-group-requirements-po-original-2026-09-26.md
source_sections: [12]
decision_record: docs/governance/decisions/helix-web-product-group-po-decisions-2026-09-26.md
---

# HELIX-WEB-CONNECTORの要求候補（2026-09-26 PO原案）

## これは何か

2026-09-26にPOが示した「HELIX-Web製品群 要求原案」のうち、HELIX-WEB-CONNECTORが担当する部分を、原文のID・種類・文言のまま載せる。
原文の状態は「要求候補・未採択」である。本書は要求（L2）でも受入（L11）でもなく、本書から要求の採用・承認・実装許可を生成しない。
採択後は、対象の`L1-planning/`、`L2-requirements/`、`L11-acceptance/`へ対応させる（原案1.2）。

出典は[原文のsnapshot](../../helix-web/sources/helix-web-product-group-requirements-po-original-2026-09-26.md)の12節（snapshot 274〜292行）である。見出しの階層だけを一段下げた。

原文の名前と接頭辞は「HELIX-WEB-CONNECTER」「`HELIXWEBCONNECTER-L2-`」である。命名の規則（名前は英語）により、綴りだけをCONNECTORに改めた（[判断記録](../../../../docs/governance/decisions/helix-web-product-group-po-decisions-2026-09-26.md)）。番号、種類、文言の意味は変えていない。内部の機構間接続を担うHELIX-CONNECTとは別の対象である。

## 原案の本文

<!-- 出典：snapshot 274〜292行（原案12節） -->
### 12．HELIX-WEB-CONNECTORの要求

**目的：利用者の実行環境とWeb提供系を、許可・状態・版を保って接続すること。**

ID接頭辞：`HELIXWEBCONNECTOR-L2-`

| 番号・種類 | 要求 | 受入候補 |
|---|---|---|
| **001・単体** | 対応Linux、CPU、必要資源、依存ツールを確認し、導入・設定・接続・診断・撤去を提供すること。 | 「Linuxならすべて対応」とせず、標準構成への適合と不足条件を示す。 |
| **002・単体** | 既存Linux、WSL上のLinux、接続先Linux等を、検証した範囲で登録できること。 | 操作端末のOSと実行環境を別に記録し、OSの入替えを一律必須としない。 |
| **003・接続** | プロバイダー、モデル、effort、エディタ・拡張、リポジトリ、実行資源の能力と制約を登録できること。 | 認証、起動、結果回収、観測まで確認した能力を表示し、取得不能項目は不明とする。 |
| **004・接続** | 対応する正規の認証・操作経路を使い、資格情報の所在、使用範囲、有効期限、失効を扱うこと。 | 別契約のログインや利用枠を利用可能と推測せず、資格情報を不用意に転送しない。 |
| **005・接続** | 実行場所、対象リポジトリ、読書き範囲、ネットワーク、予算等を案件・操作へ束縛すること。 | 対象違い、範囲外操作、期限切れ権限を実行前に拒否する。 |
| **006・接続** | ジョブ配信、応答、切断、再接続、取消、再試行、結果不明を同じidentityで扱うこと。 | 応答欠落を未実行と決めつけず、副作用を二重実行しない。 |
| **007・接続** | 利用者のエディタ作業・未保存変更・リポジトリ変更と共存し、HELIX側の変更を識別できること。 | 利用者や別作業の変更を破棄せず、競合を検出して適切に戻す。 |
| **008・接続** | 現行Workerモデルで利用できる能力を提供し、起動、停止、timeout、結果・差分・証拠回収を行うこと。 | 廃止したRunner／Sandbox等を別の上位実行主体として復活させない。 |
| **009・構成体** | Web版、接続契約版、CONNECTOR版、提供能力版を確認して更新・切戻しできること。 | 不適合更新を利用可能にせず、撤去・失効後に旧接続から実行できない。 |

内部の機構間接続を担うHELIX-CONNECTと、顧客向けのHELIX-WEB-CONNECTORは別の所属・要求とする。
