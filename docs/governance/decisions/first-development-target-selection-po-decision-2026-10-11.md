---
title: "初回開発対象の選択 PO decision record（2026-10-11）"
decision_record_id: HDEC-FIRST-DEVELOPMENT-TARGET-SELECTION-2026-10-11
decision_status: recorded
decider_role: PO
decided_at: 2026-10-11
recorded_at: 2026-10-11
source: Codex GUI execution sessionで受け取ったPOの選択回答
authority_effect: effective_when_this_record_is_admitted_to_main
---

# 初回開発対象の選択

## 固定した対象

対象revisionは `d1e6576da1bd5c9f73ebe07a6dce8221c56a9c03`、文書は `docs/governance/requirements-first-roadmap.md`、全文bytesのSHA-256は `5ee019f469259e83b36813e8d4e6ef8571e2b1e9b3f80bb55641f745e41641ce`。対象節は「初回対象候補：templateの意味契約から案件の義務追跡まで」である。[固定案](https://github.com/RetryYN/HELIX-HARNESS/blob/d1e6576da1bd5c9f73ebe07a6dce8221c56a9c03/docs/governance/requirements-first-roadmap.md#初回対象候補templateの意味契約から案件の義務追跡まで)と[当時の照合記録](../audits/first-development-scope-proposal-2026-10-11.json)、[CONNECT009訂正記録](../audits/first-development-scope-proposal-2026-10-11-r2.json)を保つ。

## 問いと回答（原文）

> [レビュー済み対象案](https://github.com/RetryYN/HELIX-HARNESS/blob/d1e6576da1bd5c9f73ebe07a6dce8221c56a9c03/docs/governance/requirements-first-roadmap.md#初回対象候補templateの意味契約から案件の義務追跡まで)を、初回の開発対象として選びますか？ BRAIN032の汎用template提供→CORE009の製品適用→OS002の案件義務追跡を主題に、必要な安全・接続・資源・計測と初回配置入力を含める案です。対象選定だけを確認し、L3再開・実装・内部デプロイは含みません。

POの回答：

> この循環を初回対象にする（推奨）

## 判断の範囲と残る入力

BRAIN032の15項目の汎用template意味契約提供、CORE（HARNESS009）の製品適用、OS002の案件義務追跡を初回対象として選ぶ。単体・接続・構成体を区別し、必要な安全・接続・資源・計測、OS018の初回配置に必要なLABO水準とINTELLIGENCE配置案の入力を含める。内部更新・復旧・支援・評価還流のロードマップ全体の義務は減らさない。

これは対象の選択である。既決の要求意味・採否・版は変更しない。BRAIN032とHARNESS009の既決1.0、OS002の版指定を追加しない追補を保持する。Python接続候補の全面採用、templateの全体最小集合や案件の適用値・N/A、接続identity・再帰的依存閉包、初回Bench入力と配置根拠、具体toolchain・setup成立は未確定のまま残す。

[10/10巻き戻し判断](rollback-to-requirements-closure-po-decision-2026-10-10.md)によるL3／L10以下の停止を保持する。再開の順序・範囲、正式要件の起草・承認、設計・実装・CI・内部デプロイ・releaseの許可は本回答に含まれない。#2846／#2905の完了も生成しない。

## 旧sourceと失敗との対応

旧 `archive/legacy-generation-2026-09-14/root/CLAUDE.md:49–63`（LEGACY-ASSET-6EBDB617A8104A7756D0）の仕組み先行と意味処理／外部作用分離、同rootの `docs/design/helix/L4-basic-design/design-template-json-authority.md:19–60`（LEGACY-ASSET-4F5A1F0739EC1111D91D）の意味正本・表示・適用・portfolio・pairを起点にした固定案の意味再導出を保持する。旧schema・runtime・toolを移植しない。変更点は候補として提示した現行の循環をPOが初回対象に選んだことであり、新しい要求やgateの追加ではない。

同rootの `docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md:65–101` のUTW-004・021・029と10/10巻き戻しの失敗を保持し、選択記録やhashだけを機構成立・環境再現・再開許可へ変換しない。旧sourceのdigestと未完consumerは固定照合記録へ戻す。
