# Issue #214 クロージャ記録 — 8-slot scheduler と quota handover 検収

## 概要

Issue #214（8-slot scheduler と quota handover）を正式 close する記録。最大 8 parallel slot を
slot／parent／task／dependency／state／quota snapshot／lease／start／terminal 時刻で accounting し、
dependency-aware scheduling、bounded queue と backpressure、quota threshold 前の handover、
slot 単位の failure isolation を fail-close で保証する仕組みを、V-model の 3 スライスで降ろして実装した。

## 降下スライス

| スライス | PLAN | PR | 成果物 |
|---|---|---|---|
| L4/L9 | PLAN-L4-71 | #477 | `docs/design/helix/L4-basic-design/slot-scheduler-quota-handover.md`、`docs/test-design/helix/L9-slot-scheduler-quota-handover-system-test-design.md`（U-SSQ-S-001..031） |
| L5/L8 | PLAN-L5-97 | #482 | `docs/design/helix/L5-detail/slot-scheduler-quota-handover.md`、`docs/test-design/helix/L8-slot-scheduler-quota-handover-unit-test-design.md`（U-SSQ-001..065） |
| L6/L7 | PLAN-L7-527 | #483 | `docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md`、`docs/test-design/helix/L6-slot-scheduler-quota-handover-unit-test-design.md`、`src/runtime/slot-scheduler-quota-handover.ts`、`tests/slot-scheduler-quota-handover.test.ts`、`tests/tools/slot-scheduler-mutation/run-mutation.ts` |

## 完了条件の充足

- 責務境界: per-task の委譲順序判定は #213 の `evaluateDelegationRequestOrdering` が正本であり、
  #214 の dispatcher は batch の相互排他だけを担う。lease CAS は #213 の `acquireWorkGraphLease` を
  そのまま呼び、第二の CAS を作らない。
- MIC-R-02（権限は移譲されない）: quota handover は quota だけを移し、merge authority は移さない。
  `evaluateFrontierRecalculation` が base HEAD・CI・review・DB receipt を再判定し、
  `SCHEDULER_MERGE_AUTHORITY_VIOLATION` で fail-close する。
- fail-close 網: capacity 超過（1..8）、dependency 前倒し、unbounded queue（`queue_limit` 欠落）、
  lease 二重所有、事後 handover・packet 欠落・ack 再配送、failure isolation breach、
  undersized capacity evidence（4-slot 結果による 8-slot claim の拒否）、時刻逆行。
  failure code は `SCHEDULER_*` 16 種で、すべて executable oracle から到達する。
  `WORK_GRAPH_*` / `WORKER_LIFECYCLE_*` は再定義せず透過させる。
- 分岐網羅は prose 主張ではなく `tests/tools/slot-scheduler-mutation/run-mutation.ts` が source mutant
  54 体を実生成して機械検証する（`total=54 killed=54 survived=0 pattern_missing=0`、exit 0）。
  この過程で到達不能な二重判定 1 件を発見し、分岐ごと削除した。
- 独立 AI-B review は 3 スライス合計 8 ラウンド（L4/L9 2 + L5/L8 3 + L6/L7 3。L4/L9 はリベース後の
  最終確認レビューを別途 1 回実施）で Critical 5 / Important 13 / Minor 11 を解消し、
  最終 approve・blockers 0。残存は非ブロッカー Minor 1 件（複合 OR 条件のサブ節網羅）のみ。
  Critical のうち 2 件は L6/L7 の実装欠陥で、reviewer が repro を実行して実証した
  （CAS の observed と expected の双方に packet 由来値を渡していたため偽造 fence token が admit された、
  および `acquireWorkGraphLease` の失敗を一律 `SCHEDULER_LEASE_DOUBLE_OWNERSHIP` へ誤って再命名していた）。
- `tdd_red_required` は false。classic Red-first cycle を踏んでいないため実在しない Red 実行を
  `red_at` / `green_at` として宣言せず、falsification 証跡を `mutation_oracle_required=true` 側の
  tracked runner に一本化している。
- same-HEAD CI: run 31274551183 が success（HEAD `4c436dbec4032547cf8465563e6dfde6acce6068`）。
- v2 review receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/483#issuecomment-5227836529
- completion receipt: https://github.com/RetryYN/HELIX-HARNESS/issues/214#issuecomment-5227841655
- merge SHA: `99b23fa2000c520ec44852cee38e93c5fbf7d1b1`

## 要件 trace

MIC-FR-001 / MIC-R-02・05・06 / MIC-AC-005..009 は L4 doc §6 の trace 表と PLAN-L7-527 の
`verification_bindings` 82 件で機械追跡できる（#396 で canonical Requirement JSON へ admit 済み）。

## successor

- #215（event projection／checkpoint replay）は本 issue の完了で unblock される。本実装の
  slot accounting row と quota handover packet を event source として projection 側が引き取る。
- DB projection と CLI surface の追加、GitHub Projects projection（MIC-R-07 系）は本 issue の範囲外で、
  後続 PLAN が所有する。

## Issue closure graph 契約

```json
{"schema_version":"helix-issue-closure-graph.v1","canonical_contracts":[{"contract_id":"SLOT-SCHEDULER-QUOTA-HANDOVER-001","owner_issue":214}],"child_issues":[],"successor_issues":[{"number":215,"expected_state":"open"}]}
```
