---
title: "8-slot scheduler と quota handover L6 機能単体テスト設計"
canonical_layer_scheme: L1-L12
layer: L6
sub_doc: unit-test-design
paired_layer: L6
status: draft
plan: docs/plans/PLAN-L7-527-slot-scheduler-quota-handover.md
pair_artifact: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md
behavior_contract_id: SLOT-SCHEDULER-QUOTA-HANDOVER-001
responsibility_owner: slot-scheduler-quota-handover
---

# 8-slot scheduler と quota handover L6 機能単体テスト設計

## 1. 関数ごとの oracle 割り付け

L6 機能設計の 7 export に対し、L8 の U-SSQ-001..065 と、独立レビュー指摘で追補した U-SSQ-066..082 を次のとおり割り付ける。実行ファイルは
`tests/slot-scheduler-quota-handover.test.ts` の 1 本とし、各 oracle は静的タイトルの `it()` と
1 対 1 で対応させる。

| export | 割り付け oracle | 観点 |
|---|---|---|
| `admitSlotAccountingRow` | U-SSQ-001..014, U-SSQ-074, U-SSQ-081 | exact set 9 field、ネストの exact、enum、unknown field の相殺と surplus |
| `evaluateDispatchAdmission` | U-SSQ-015..031, U-SSQ-053, U-SSQ-058, U-SSQ-062, U-SSQ-070..072, U-SSQ-075 | 判定順序 1..8、conflict 4 軸、lease 二重所有の判定キー、determinism |
| `admitQueueEntry` | U-SSQ-032, U-SSQ-054, U-SSQ-060, U-SSQ-061 | queue_limit 必須、backpressure の非受理・非 drop、重複 taskId |
| `evaluateQuotaHandover` | U-SSQ-033..044, U-SSQ-059, U-SSQ-066..069 | packet 5 必須要素、target 3 軸の単独変異、ack 再配送、quota threshold、lease 系譜 |
| `evaluateSlotFailureIsolation` | U-SSQ-045..048, U-SSQ-055, U-SSQ-073, U-SSQ-076..078, U-SSQ-082 | peer の state・lease・queue 位置の不変、failure lane の lease 解放 |
| `evaluateFrontierRecalculation` | U-SSQ-052, U-SSQ-056, U-SSQ-057, U-SSQ-063..065, U-SSQ-079, U-SSQ-080 | merge authority の非移譲、base HEAD 再評価、CI・review・DB receipt の再判定 |
| `admitCapacityEvidence` | U-SSQ-049..051 | lane 数の必須性と claimed capacity との比較 |

## 2. mutation 要件

分岐網羅は prose 主張ではなく `tests/tools/slot-scheduler-mutation/run-mutation.ts` の実行結果で
裏付ける。要件は次の 3 点とする。

1. mutant は判定分岐を 1 つずつ除去・弱化したものだけを使い、複数分岐を同時に壊さない。
2. 実行結果は `survived=0` かつ `pattern_missing=0` でなければならない（`pattern_missing` が
   1 件でもあると、mutant の `from` パターンが実ソースと乖離しており到達性を検証していない）。
3. 生存した mutant は「テストを足す」か「到達不能な分岐を削除する」かのどちらかで必ず解消し、
   mutant 自体を削除して数字を合わせることはしない。

現行実測値は `total=54 killed=54 survived=0 pattern_missing=0`（exit 0）。

## 3. fixture 方針

基準 fixture は capacity 8・queue_limit 4・conflict-free な candidate 1 件とし、各 negative
oracle は基準から**判定対象の 1 条件だけ**を差し替える。例外は判定順序検証 oracle
（U-SSQ-029 / U-SSQ-059）に限り、2 条件を同時成立させて先着条件の failure code を確認する。

conflict exclusion の稼働側 scope は 4 軸すべてが candidate と交差しない値を既定とし、
負例は 1 軸だけを candidate 側の値へ寄せる。これにより、ある軸の判定を削除した mutant が
必ず対応する 1 件の oracle だけを Red にする。

lease 二重所有の 3 分岐（lane スコープ・owner 不一致・fence_token 不一致）は
U-SSQ-030 / U-SSQ-058 / U-SSQ-062 が個別に押さえ、lane をまたいだ値一致が衝突扱いされないこと
（偽陽性の否定）を positive 側で確認する。
