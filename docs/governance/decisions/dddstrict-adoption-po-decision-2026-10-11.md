---
decision_record_id: HDEC-DDDSTRICT-ADOPTION-2026-10-11
decision_status: recorded
decider_role: PO
decided_at: 2026-10-11
recorded_at: 2026-10-11
authority_effect: effective_when_this_record_is_admitted_to_main
---

# DDD／TDDの5規律追補のPO判断

## 原文と固定対象

POは本Codex会話の質問票で「4件とも推奨案を採用」と回答した（原文）。4件のうち本記録はDDDSTRICTの一要求identityだけを反映する。回答は次の質問に対するものであり、reviewやmergeから採否を生成しない。

> 要求完了に向けた4件の採否をまとめて確認します。推奨は、①[#1852の固定案](https://github.com/RetryYN/HELIX-HARNESS/blob/7096117209f65083dddea5f17612a5b8307e9922/docs/governance/crosswalks/requirements-resolution-packet.md) ASSETCOVER：全資産棚卸し・充足度mappingをHARNESS-L2-089と対L11へ採用（版未指定）、②[#1853の固定案](https://github.com/RetryYN/HELIX-HARNESS/blob/569a892ed7734e262e1c441d6d18e4e9111539e4/docs/governance/crosswalks/requirements-resolution-packet.md) O10GEN：Bの画面prototype生成を独立HARNESS-L2-090として1.0採用、③[#1854の固定案](https://github.com/RetryYN/HELIX-HARNESS/blob/df59185e55ff3514b3048b7b47b071c51702b4e8/docs/governance/crosswalks/requirements-resolution-packet.md) DDDSTRICT：依存方向・不変条件trace・Red/Green実観測・oracle強度・結合GWTの5規律を005と対L11へ追補、④[#1857の固定案](https://github.com/RetryYN/HELIX-HARNESS/blob/4bf4ecebbf344f6708d4d51b3c1e3cc2ac083565/docs/governance/crosswalks/requirements-resolution-packet.md) INCIDENTPORT：Bの通常Release Portをhotfixにも適用する追補です。これら4件の推奨案を採用しますか？要求の採否だけが対象で、実装・release・L3再開の許可は含みません。

- 提示commit: `df59185e55ff3514b3048b7b47b071c51702b4e8`
- 提示JSON: `docs/governance/crosswalks/requirements-resolution-packet.json`、SHA-256 `e7cdcf791967e0ebf5bb03290810f1f1f617b5d7b98138b67ebe20370ea124bb`
- 対象: `HARNESS-L2-005`と対L11、kind `unit`
- 作業base: `0cc1d862fba688923b9daa3004396a4948ace0be`
- L2固定追補text SHA-256: `0a1d4cde96c1e61ad7fb44129d017485b35f703e3d0c64d342afda26253e30b1`
- 対L11固定追補text SHA-256: `9d7028bae2837140921044a15798a4995574d3caa36a10e8266cdc31f4085c07`
- digest規則: 固定案のproposed_section/proposed_text UTF-8 bytesそのまま。先頭・末尾LFも含む。[被覆・追補照合receipt](../audits/requirement-registration/dddstrict-adoption-coverage-receipt-2026-10-11.json)に対象textを保持する。
- 仮登録: `MPR-RC-HARNESS-L2-005-001`／`registered_proposal`／`authority_effect: none`。仮登録の管理状態とPOの採否を区別する。

## 採用と保持

固定案のL2／対L11追補を同じbytesで採用する。未採択／候補のmetadataは提示時の固定bytesとして保持し、本判断を対象revisionの採否根拠にする。089は版未指定、090は1.0、003は既決1.0、005は既決の版指定を保持し追加しない。他identityの版・採択意味は変更しない。

適用TDDのRed／Green実観測と非逆順を定める。既決TDDORDERの契約／oracle先行凍結と実装後Redの記録を保持し、旧FR02の強制順序全体の移管は主張しない。旧HELIX固有の依存方向表・workflow anchor・GreenDefinition/historyは別に保持する。

## 旧sourceと保全

固定案のsource path／行を実sourceと資産台帳へ照合し、[原文行集合](../audits/requirement-registration/dddstrict-adoption-source-lines-2026-10-11.jsonl)へasset ID／path／行／file hash／span hashを保持する。旧sourceからの意味再導出であり、変更点・保持点は固定案のfacets／legacy_comparisonとreceiptへ結ぶ。最新baseへの追補位置の差はreceiptへ記録し、固定追補textと既存本文を保持する。旧未完成や旧runtimeの存在だけを変更理由にしない。

原文行には今回の意味範囲外のruntime／consumer／schema条件もあるため、全入力行を`MPR-SH-DDDSTRICT-001`へ保留する。`no_loss`はこの限定入力集合の保全partitionであり、全行の意味を今回の要求へ移管した証明ではない。限定意味mappingと原文全文の生存先を分け、formal successorは生成しない。333件の隔離前差分台帳をpath／hashで照合し、該当時は基準・隔離revisionを別atomとして入力し、意味同値を推定しない。旧test／CI／runtimeは実行しない。

## 未完範囲

- FR02のTDD強制順序の意味差分とformal rehome
- 旧FR50のworkflow anchor/旧GreenDefinition/関連A122/A124/A125/A126条件、原要求の全successor被覆
- 他DDD/TDD rule、旧schema/runtime/CLI/DB、全scopeへの検査実装、L3再開
- 1854の副所属FR24/30と完了条件全体
- 旧HELIX固有のlint/runtime/schema/CLI依存方向表を、HELIX自身の開発repo規則へ移管する対応。汎用005追補で削除/retire/被覆済みにしない。

本判断は要求の採否だけであり、実装・release・L3再開の許可を含まない。#1813の全source意味対応、#1814の要求整理、#2846の要件定義ロードマップへ残る範囲を保持する。Issue #1854の終了条件はreview側が要求段階の粒度で別に確認する。仮登録、review、mergeからIssue closeや受入成功を生成しない。
