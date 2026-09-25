---
title: "HELIX-INFRASTRUCTURE L1要求アイデアのPO提示と判断 decision record（2026-09-26）"
decision_record_id: HDEC-INFRASTRUCTURE-L1-IDEA-2026-09-26
decision_status: recorded
decider_role: PO
decided_at: 2026-09-26
recorded_at: 2026-09-26
source: docs/helix-infrastructure/sources/runtime-infrastructure-l1-po-original-2026-09-26.md
authority_effect: effective_when_this_record_is_admitted_to_main
---

# HELIX-INFRASTRUCTURE L1要求アイデアのPO提示と判断（2026-09-26）

## 記録の範囲

2026-09-26（Asia/Tokyo）のClaude作業sessionで、POが「HELIX Runtime Infrastructure L1要求候補 v0.1」の本文を示した。本書はその会話の記録である。
POの発言はそのまま引用し、AIの整理と区別する。本文の原文は[source snapshot](../../helix-infrastructure/sources/runtime-infrastructure-l1-po-original-2026-09-26.md)に保存した。
本記録から、要求（L2）の合意、要件（L3）の承認、実装許可、release、Issue closeを生成しない。

## POの提示

POは、本文だけを示した。本文は、HELIX自身の各機構、Worker、モデルの実行環境、dataの保存先、コネクタ等が稼働するための実行基盤を扱い、設計知識をBRAIN、Infrastructureの要求と設計をHELIX-HARNESS-CORE、進行の統制をHELIX-OS、権限の制約をHELIX-SECURITYに分けるとしている。

## 置き場所

現行のConceptの機構の表には、HELIX自身の実際の実行環境の状態を持つ機構がない。原文は、OS（作業と変更の状態）とは別のもので、同じ状態を二重に正本にしないとしている。
AIが、共通部品として加えるか、HELIX-OSの中の領域にするか、新しいコア機構にするかを聞いたところ、POは「新しいコア機構にする」を選んだ。

## 正式名称

AIが、HELIX-RUNTIME、HELIX-INFRASTRUCTURE、HELIX-INFRAのどれにするかを聞いたところ、POは「HELIX-INFRASTRUCTURE」を選んだ。

AIの整理：
- コアシステムの名称なので、2026-09-26の命名の規則（[LABOの判断記録](labo-core-engine-po-decisions-2026-09-26.md)、PR #2143）により、すべて大文字にする。コアシステムの名称は、HELIX-HARNESS、HELIX-HARNESS-CORE、HELIX-OS、HELIX-BRAIN、HELIX-LABO、HELIX-INTELLIGENCE、HELIX-SECURITY、HELIX-CONNECTに、HELIX-INFRASTRUCTUREが加わる。
- 原文の名前「HELIX Runtime Infrastructure」は、原文の一部としてsource snapshotに残す。

## 版と扱い

原文は「1.0で最低限成立させる範囲」として18項目を挙げ、高度なAutoscaling、Multi-cloud、完全自動のFailover等を後の版へ広げられるとしている。故障の単位、単一障害点、費用の観測、資源の作成から廃棄まで、更新の段階の適用、providerの交換、HELIX自身の世代の分離等は、18項目に名前が出てこない。
AIが、これらの版をどうするかを聞いたところ、POは次のように答えた。

> まだアイディアどうするかは全体をみてから

AIの整理：
- 本書の反映先の企画（L1）案は、アイデアの段階の案とする。採否、版、Conceptへの反映の形は、POが全体を見てから決める。
- 企画（L1）案には版（`version_target`）を付けず、原文の18項目のどれに当たるかだけを示す。

## 他の文書の未確定の点への影響

HARNESSのInfrastructureの要求候補（未mergeのPR #2144の`docs/helix-harness/candidates/infrastructure-requirements.md`）とBRAINのInfrastructure領域の要求候補（未mergeのPR #2145の`docs/helix-brain/candidates/infrastructure-domain-requirements.md`）は、原文の「Infrastructure Runtime」をどの機構が持つかを未確定としていた。

AIの整理：
- HELIX自身の実際の実行環境は、HELIX-INFRASTRUCTUREが持つ。
- HELIX-Webのserviceの側の実行環境（tenantの実行環境、顧客のjob、顧客の資格情報等）は、原文のHRI-L1-035により、HELIXの本体のInfrastructureへ暗黙に共有しない。Conceptでは、顧客のtenant・job・配備・監視・復旧はHELIX-Web-OSの行にある。
- 両候補の未確定の点を、この内容に改める。HELIX-INFRASTRUCTURE自体がアイデアの段階であることも添える。


## Workerへの統一の反映（2026-09-26）

同じsessionで、POは、作業の実行主体をWorkerへ統一し、HELIXサブエージェント、エージェントレーン、Runner、Sandboxを独立した上位の概念として廃止する要求を示し、「今全部に反映する」を選んだ（判断記録（未mergeのPR #2149の`HDEC-WORKER-EXECUTION-MODEL-2026-09-26`）。

AIの整理：
- 本PRの企画（L1）案の「Runner／Sandbox」を、Worker（実行）とSECURITY（制約とauthority）に置き換える。原文の保存は書き換えない。
- 原文のHRI-L1-039の「Runner / Sandbox等の限定実行経路」はWorkerの実行に、Workerが動く実際の資源はHELIX-INFRASTRUCTUREの側に置く（Workerの原文のRETIRE-SANDBOX-003）。

## 反映先

- [HELIX-INFRASTRUCTUREのL1企画案](../../helix-infrastructure/L1-planning/infrastructure-intent.md)とREADMEを新しく作る（`docs/helix-infrastructure/`）。
- Conceptの機構の表への行の追加、`docs/README.md`と`docs/governance/new-generation-start-here.md`の案内は、名前の表記を改めるPR #2143のmerge後に、POが全体を見てからの判断を受けて行う。
- PR #2144とPR #2145の候補の未確定の点を改める。
