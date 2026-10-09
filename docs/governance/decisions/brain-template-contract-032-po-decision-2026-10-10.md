---
decision_record_id: HDEC-BRAIN-TEMPLATECONTRACT-032-2026-10-10
decision_status: recorded
decider_role: PO
decided_at: 2026-10-10
recorded_at: 2026-10-10
authority_effect: effective_when_this_record_is_admitted_to_main
---

# BRAIN汎用template意味契約032のPO判断

## 対象と原文

POは本Codex会話の質問票で「032を1.0で採用（推奨）」と回答した（原文）。質問は次の固定案を提示した。

> [固定案](https://github.com/RetryYN/HELIX-HARNESS/blob/5624705c0f98e22b646860a61c6512ee12598170/docs/governance/crosswalks/requirements-resolution-packet.md)のTEMPLATECONTRACT（HELIXBRAIN-L2-032と対L11）を1.0で採用しますか？BRAINが15項目の汎用template意味契約を提供し、COREの製品適用・OSの案件記録と責務を分けます。seed採用とL3再開は含みません。

- 提示commit: `5624705c0f98e22b646860a61c6512ee12598170`
- 提示JSON SHA-256: `92f120b2abd5936df8e6f1a304bf35cdf0711e96b2a4e9f9a63f72862986bbdf`
- 判断単位: TEMPLATECONTRACT、一identity `HELIXBRAIN-L2-032`、kind `unit`、`version_target: 1.0`
- 作業base: `10bfe93a155c7fcc1833fd7e7f3d109dc02275d7`
- L2 path: `docs/helix-brain/L2-requirements/brain-requirements.md#helixbrain-l2-032`、節SHA-256 `f096552717f3b648477433e01df5533788e2ca2ead6bfdb5e24d32d364ac3e48`
- 対L11 path: `docs/helix-brain/L11-acceptance/brain-acceptance.md#helixbrain-l2-032`、節SHA-256 `bc0a4ea0e6f282fbb0aac884d1e6ff9d86b279d32c5fbd9cc3180260d4c29429`
- 節digest規則: 指定###見出しから次の見出し直前またはEOFまで、末尾空白を除きUTF-8 LF一つで終える。
- 最新仮登録: `MPR-RC-HELIXBRAIN-L2-032-001`、[被覆receipt](../audits/requirement-registration/brain-template-contract-032-coverage-receipt-2026-10-10.json)。register自体は`registered_proposal`／`authority_effect: none`を保持し、採択は本decisionの固定対象から読む。

## 採用と責務

提示したL2と対L11を同じbytesで採用する。本文の未採択候補・提案というmetadataは提示時点の固定bytesとして保持し、本decisionを対象revisionの採否・1.0指定の根拠とする。

BRAINは汎用templateのidentity、version、layer/pair、applicability、required input/section/field、relation、意味owner、trace、negative oracle、measurement、completion、downstream kind、supersessionの15項目を識別・比較できる意味契約候補と不足一覧を提供する。定義欠落と製品要求値の未決を分け、JSON意味正本と生成viewを区別する。completionは適用義務の条件を示し、知識採否やproject義務消込の裁定をBRAINへ移さない。

汎用知識の版/stateはBRAIN、製品適用・設計義務・不足質問・semantic impactはCORE、使用set/版・案件運転はOS。層・V-pair・oracleはHARNESS契約へ従う。既存要求の採択範囲と9/28固定L1は変更しない。

## 旧sourceと保留

旧asset `LEGACY-ASSET-4F5A1F0739EC1111D91D`のL4 `design-template-json-authority.md:19/23/26/27/30`を意味の再導出に用いた。7限定facetのうち5を032へ保持し、旧pair freeze後のcanonical authorityと生成viewの直接編集禁止という運用条件はsource holding `MPR-SH-BRAIN-TEMPLATE-CONTRACT-001`に残す。今回の採用は旧条件のretire・弱化やformal successorを決めない。relation/supersessionと汎用ownerは採択L1・9/25既決責務から導く。

限定集合の無損失partitionは[台帳](../audits/requirement-registration/brain-template-contract-source-lines-2026-10-10.jsonl)とreceiptで読む。旧6surface/6component、旧source全体、seed全体の移管完了には広げない。旧runtime/test/CIは実行しない。

## 残る範囲

最小seed選択・26seedの個別採否、CORE適用/Backflow/影響、OSのproject exact set/event/評価母集団、parity・renderer・pair/portfolioの固有bindingは#2846に保持する。schema/型/wire/algorithm、L3再開・承認、実装・CI起動・内部デプロイ・release、実行済み受入、他要求の採否、Issue closeは本decisionから生成しない。
