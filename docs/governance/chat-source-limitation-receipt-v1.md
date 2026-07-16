---
title: "HELIX chat source limitation receipt"
status: independently-reviewed-source-limited
created: 2026-07-16
updated: 2026-07-16
owner: PO / TL
receipt_id: CHAT-SOURCE-LIMIT-2026-07-16-01
schema: chat-source-limitation-receipt.v1
coverage_credit: false
---

# HELIX chat source limitation receipt （日本語の契約見出し）

## §0 目的

hosted chat surfaceがraw event ID、安定timestamp、全turn export、message digestをrepositoryへ公開しない条件で、
「見えていないraw transcriptを全件確認した」と偽装しないためのreceiptである。現行会話contextから抽出したsemantic requirement
61件とvisible occurrence 44件を保全するが、raw transcript completenessの代替にはしない。

## §1 observed boundary （日本語の契約見出し）

| field | value |
|---|---|
| semantic ledger | `docs/governance/infinity-loop-source-capability-ledger.md` |
| semantic rows | HC-CHAT-001..061 = 61 |
| visible occurrence rows | CHAT-U-001..044 = 44 | （日本語の機械契約記述）
| raw export available | false | （日本語の機械契約記述）
| stable platform message ID available | false | （日本語の機械契約記述）
| stable source timestamp available | false | （日本語の機械契約記述）
| source-provided digest available | false | （日本語の機械契約記述）
| omitted-turn denominator | unknown | （日本語の機械契約記述）
| semantic dedup completeness | unproven | （日本語の機械契約記述）

## §2 許可する主張と禁止する主張

許可する主張は「現在提供されたcontextから61 semantic requirementsを台帳化し、各行のHIL/design/test候補を追跡した」に限定する。
次はreceiptがapprovedでも禁止する。

- raw chatを100%捕捉した。
- 61件が会話全体の最終分母である。
- occurrence 44件が全message数である。
- semantic rowがあるためrequirement/design/test/gate coverageがgreenである。
- context compaction前後で欠落がない。

## §3 limitation acceptance contract （日本語の契約見出し）

raw exportを取得できないまま要件freezeする場合、次を全て満たす。

1. 61 semantic rowのstatement/source occurrence/HIL route/design route/test-oracle/statusがnon-emptyである。
2. ユーザーが後続chatで追加・訂正した内容は新semantic rowまたはsupersession edgeとしてappend-only登録する。
3. visible contextを独立runtimeが再読し、unmapped semantic finding 0のreview receiptを残す。
4. `raw_transcript_complete=false`と`coverage_credit=false`をfreeze packetへ保持する。
5. raw exportが後日利用可能になれば自動的にstale化し、message-by-message再抽出する。
6. limitation acceptanceはsource custodyだけに効き、各semantic requirementの設計・検証closureを免除しない。

## §4 failure code （日本語の契約見出し）

| condition | failure code |
|---|---|
| raw exportなしでraw completenessを主張 | `HIL_CHAT_RAW_COMPLETENESS_FALSE_CLAIM` |
| semantic rowの必須edge欠落 | `HIL_CHAT_SEMANTIC_EDGE_INCOMPLETE` |
| correctionを上書きし履歴消失 | `HIL_CHAT_CORRECTION_HISTORY_LOST` |
| context revision後もreceiptをcurrent扱い | `HIL_CHAT_LIMITATION_RECEIPT_STALE` |
| limitation receiptをrequirement closureへ加点 | `HIL_CHAT_LIMITATION_CREDIT_LAUNDERING` |
| raw export取得後に再監査しない | `HIL_CHAT_RAW_EXPORT_REENTRY_MISSING` |

## §5 stale/re-entry （日本語の契約見出し）

次で即staleとする: 新chat requirement、既存要求の訂正、context/export surface変更、raw transcript取得、semantic extractor version変更、
HC-CHAT/CHAT-Uのstatementまたはsource span変更。再entryはraw message→semantic atom→supersession/dedup→HIL/design/test/gate edge→
independent reviewの順で行い、削除や番号再利用をしない。

## §6 current verdict （日本語の契約見出し）

| metric | current | verdict |
|---|---:|---|
| visible semantic capture | 61 | OBSERVED | （日本語の機械契約記述）
| visible occurrence capture | 44 | OBSERVED | （日本語の機械契約記述）
| mandatory semantic edge validation | 61/61 | PASS | （日本語の機械契約記述）
| independent re-read | 1/1 | PASS |
| raw transcript closure | unknown | UNPROVEN | （日本語の機械契約記述）
| limitation acceptance | 1/1 | PASS |

したがって本receiptは欠落を隠すためのwaiverではなく、証明不能範囲を機械的に残すfail-honest境界である。

独立reviewの機械正本は
`docs/governance/generated/chat-independent-review-receipt-v1.json`（SHA-256
`21b5696e5e9ae1eb7c31b4c726f34ab82d65703410bc153ff9e043181667178a`）である。HC-CHAT 61件、CHAT-U 44件、
visible quote 44件、occurrence reverse edge 61/61、L1/L3/L4候補/HAT/AC edge 61/61を再検査した。
このPASSはsource limitation acceptanceだけを閉じ、`raw_transcript_completeness=unproven`、`coverage_credit=false`を維持する。
