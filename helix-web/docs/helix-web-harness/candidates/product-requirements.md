---
title: "HELIX-WEB-HARNESSの要求候補（2026-09-26 PO原案）"
status: requirement_candidate
authority_status: unadopted
authority_effect: none
created: 2026-09-26
target: HELIX-WEB-HARNESS
source: helix-web/docs/helix-web/sources/helix-web-product-group-requirements-po-original-2026-09-26.md
source_sections: [3]
decision_record: docs/governance/decisions/helix-web-product-group-po-decisions-2026-09-26.md
---

# HELIX-WEB-HARNESSの要求候補（2026-09-26 PO原案）

## これは何か

2026-09-26にPOが示した「HELIX-Web製品群 要求原案」のうち、HELIX-WEB-HARNESSが担当する部分を、原文のID・種類・文言のまま載せる。
原文の状態は「要求候補・未採択」である。本書は要求（L2）でも受入（L11）でもなく、本書から要求の採用・承認・実装許可を生成しない。
採択後は、対象の`L1-planning/`、`L2-requirements/`、`L11-acceptance/`へ対応させる（原案1.2）。

出典は[原文のsnapshot](../../helix-web/sources/helix-web-product-group-requirements-po-original-2026-09-26.md)の3節（snapshot 105〜121行）である。見出しの階層だけを一段下げた。

## 原案の本文

<!-- 出典：snapshot 105〜121行（原案3節） -->
### 3．HELIX-WEB-HARNESSの共通要求

**目的：7製品を独立して成立させながら、同一案件の開発工程として接続できること。**

ID接頭辞：`HELIXWEBHARNESS-L2-`

| 番号・種類 | 要求 | 受入候補 |
|---|---|---|
| **001・単体** | 既存の要求、設計、コード、画面、PoC、運用資料から開始できるフルリバースの入口を持つこと。 | 持込資産の原文・出所・版を保持し、不足や推定を明示する。既存物の存在だけで上流承認を生成しない。 |
| **002・単体** | 7製品それぞれについて入力、出力、依存、対象外、受入条件、提供版を定義すること。 | 製品ごとの完成範囲を判断でき、必要でない製品の購入・導入を前提にしない。 |
| **003・接続** | 本体HARNESSの開発方式、層、V字対応、検証・差戻し条件を版付きで利用すること。 | Web側で矛盾する工程規則を再定義せず、採用した契約版を追跡できる。 |
| **004・構成体** | 製品間で対象ID、要求・設計revision、成果物、未完義務、検証結果を引き継げること。 | 別製品へ移っても再入力を強制せず、未解決事項を受渡しで消さない。 |
| **005・単体** | 利用者にHTML、文書、コード、配備物、運用手順等の成果物を渡し、内部処理用表現と区別すること。 | 成果物を利用できる一方、CORE内部のJSON・Pythonや秘密情報を無条件に公開しない。 |
| **006・構成体** | 入力済み、提案済み、確定済み、実装済み、検証済み、受入済み、リリース済み、配備済み、運用評価済みを区別すること。 | 一つの「完了」で異なる成立条件を相殺しない。 |
| **007・構成体** | 通常作業は委任範囲内で継続し、人間が持つ意味の採否・受入・不可逆操作等だけを適切な時点で戻すこと。 | 決定済みの事項を毎工程で再質問せず、AI提案から承認を捏造しない。 |

本体の7製品独立性と、単体要求・接続要求・構成体要求の区分を継承する。
