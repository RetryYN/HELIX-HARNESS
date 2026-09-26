---
title: "HELIX-WEB-HARNESS-COREの要求候補（2026-09-26 PO原案）"
status: requirement_candidate
authority_status: unadopted
authority_effect: none
created: 2026-09-26
target: HELIX-WEB-HARNESS-CORE
source: helix-web/docs/helix-web/sources/helix-web-product-group-requirements-po-original-2026-09-26.md
source_sections: [11]
decision_record: docs/governance/decisions/helix-web-product-group-po-decisions-2026-09-26.md
---

# HELIX-WEB-HARNESS-COREの要求候補（2026-09-26 PO原案）

## これは何か

2026-09-26にPOが示した「HELIX-Web製品群 要求原案」のうち、HELIX-WEB-HARNESS-COREが担当する部分を、原文のID・種類・文言のまま載せる。
原文の状態は「要求候補・未採択」である。本書は要求（L2）でも受入（L11）でもなく、本書から要求の採用・承認・実装許可を生成しない。
採択後は、対象の`L1-planning/`、`L2-requirements/`、`L11-acceptance/`へ対応させる（原案1.2）。

出典は[原文のsnapshot](../../helix-web/sources/helix-web-product-group-requirements-po-original-2026-09-26.md)の11節（snapshot 254〜270行）である。見出しの階層だけを一段下げた。

## 原案の本文

<!-- 出典：snapshot 254〜270行（原案11節） -->
### 11．HELIX-WEB-HARNESS-COREの要求

**目的：Web側の各顧客製品について、意味・設計・依存・変更を一貫して処理すること。**

ID接頭辞：`HELIXWEBHARNESSCORE-L2-`

| 番号・種類 | 要求 | 受入候補 |
|---|---|---|
| **001・単体** | 顧客製品ごとに、要求、画面、データ、API、構成、実装、テスト、運用条件のIDと関係を保持すること。 | 顧客製品のCOREと、HELIX-Web製品群自身を開発するためのCOREが混在しない。 |
| **002・接続** | Web編集を、対象、操作ID、入力者、変更元revision、差分、契約版付きJSONとして受け取ること。 | 重複送信、古いrevision、不正な対象、未対応契約を識別し、黙って部分適用しない。 |
| **003・単体** | 画面上の配置・表示設定と、必須条件・接続・型等の意味変更を区別すること。 | ノード移動だけで設計・実装の再生成を起こさず、意味変更は影響判定へ渡す。 |
| **004・接続** | BRAINへ必要な文脈と条件を渡し、Pattern・Unit・Part、適用条件、代替、制約、根拠、版を受け取ること。 | 顧客の原文・秘密情報を不要に共有せず、BRAINの候補を自動採用としない。 |
| **005・構成体** | パターン、確定入力、INTELLIGENCEの案を使い、設計・不足入力・矛盾・検証義務を導出できること。 | 機械的導出とAI推論を区別し、推論結果の不確実性と採用理由を残す。 |
| **006・単体** | 変更影響を依存関係に沿って判定し、影響あり・なし・不明と再検証義務を保持すること。 | 一変更で無関係な全体を失敗扱いせず、逆に未確認範囲を合格にしない。 |
| **007・接続** | 入力、導出、手修正、コード変更、検証結果の履歴と対応を維持すること。 | JSON、図、コードを相互に無関係な正本にせず、外部編集との差を検出できる。 |
| **008・単体** | 製品モデルの保存・復元・比較、同時編集の競合、古い生成結果を扱えること。 | 最新状態の上書きや変更消失がなく、復元後も参照版と証拠を追跡できる。 |
| **009・接続** | 内部処理用JSON・Pythonと、利用者向け編集契約・成果物を分離すること。 | 内部実装を公開せずに編集・再導出ができ、公開成果物との意味対応を確認できる。 |
