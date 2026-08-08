# Issue #213 クロージャ記録 — work graph と三段 receipt 検収

## 概要

Issue #213（work graph と三段 receipt 検収）を正式 close する記録。実作業前に work graph・
dependency edge・capacity route・delegation-request receipt を確定し、独立 review receipt・
worker terminal receipt・親 acceptance receipt を別 identity／session／context かつ同一 HEAD・
順序付きで閉じる仕組みを、V-model の 3 スライスで降ろして実装した。

## 降下スライス

| スライス | PLAN | PR | 成果物 |
|---|---|---|---|
| L4/L9 | PLAN-L4-70 | #466 | `docs/design/helix/L4-basic-design/work-graph-receipt-acceptance.md`、`docs/test-design/helix/L9-work-graph-receipt-acceptance-system-test-design.md`（U-WGR-S-001..020） |
| L5/L8 | PLAN-L5-96 | #469 | `docs/design/helix/L5-detail/work-graph-receipt-acceptance.md`、`docs/test-design/helix/L8-work-graph-receipt-acceptance-unit-test-design.md`（U-WGR-001..045） |
| L6/L7 | PLAN-L7-525 | #471 | `docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md`、`src/runtime/work-graph-receipt-acceptance.ts`、`tests/work-graph-receipt-acceptance.test.ts`、`tests/tools/work-graph-mutation/run-mutation.ts` |

## 完了条件の充足

- 順序契約は delegation-request → independent review sealed → worker terminal → 親 acceptance。
  既存 `createWorkerLifecycleReceipt` が sealed review capability を必須入力とする契約を延長し、
  work graph 側に重複判定を作らない。
- fail-close 網: work graph なし着手、dependency 前倒し、receipt 先書き、同一 identity 自己検収、
  HEAD drift、review／親 acceptance 欠落、unknown field による欠落相殺（MIC-AC-004）。
  failure code は `WORK_GRAPH_*` 13 種で、すべて executable oracle から到達する。
- 分岐網羅は prose 主張ではなく `tests/tools/work-graph-mutation/run-mutation.ts` が source mutant
  19 体を実生成して機械検証する（19/19 killed、survived 0、exit 0）。到達不能な防御分岐 1 件は
  削除し、到達可能な前段束縛検査へ置き換えた。
- 独立 AI-B review は 3 スライス合計 7 ラウンドで Critical 2 / Important 5 / Minor 3 を解消し、
  最終 approve・blockers 0。
- same-HEAD CI: run 31259188482 が success（HEAD `b5fb6734d5960a9539a48ebeb61222ff40f16d07`）。
- v2 review receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/471#issuecomment-5226348548
- completion receipt: https://github.com/RetryYN/HELIX-HARNESS/issues/213#issuecomment-5226350943
- merge SHA: `da22c8e5dcbfbcce8194b3f8c321430172d3d8e6`

## 要件 trace

MIC-FR-001 / MIC-R-01..04 / MIC-AC-001..004 は L4 doc の trace 表と PLAN-L7-525 の
`verification_bindings` 45 件で機械追跡できる（#396 で canonical Requirement JSON へ admit 済み）。

## successor

- #214（8-slot scheduler）と #215（event projection／replay）は本 issue の完了で unblock される。
  両者とも本実装の work graph lease と三段 receipt を土台に接続する。
- 呼び出し元の provenance 責任境界は L6 doc §6.1 に明記しており、#214 の transactional boundary で
  機械強制する。

## Issue closure graph 契約

```json
{"schema_version":"helix-issue-closure-graph.v1","canonical_contracts":[{"contract_id":"WORK-GRAPH-RECEIPT-ACCEPTANCE-001","owner_issue":213}],"child_issues":[],"successor_issues":[{"number":214,"expected_state":"open"},{"number":215,"expected_state":"open"}]}
```
