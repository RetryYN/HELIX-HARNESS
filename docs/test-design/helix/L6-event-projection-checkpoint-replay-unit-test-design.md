---
title: "orchestration event projection と checkpoint replay L6 機能単体テスト設計"
canonical_layer_scheme: L1-L12
layer: L6
sub_doc: unit-test-design
paired_layer: L6
status: confirmed
plan: docs/plans/PLAN-L7-528-event-projection-checkpoint-replay.md
pair_artifact: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md
behavior_contract_id: EVENT-PROJECTION-CHECKPOINT-REPLAY-001
responsibility_owner: event-projection-checkpoint-replay
---

# orchestration event projection と checkpoint replay L6 機能単体テスト設計

## 1. 関数ごとの oracle 割り付け

L6 機能設計の 8 export に対し、L8 の U-EPR-001..088 と、mutation 生存および追補で足した
U-EPR-089..102 を次のとおり割り付ける。実行ファイルは
`tests/event-projection-checkpoint-replay.test.ts` の 1 本とし、各 oracle は静的タイトルの `it()` と
1 対 1 で対応させる。

| export | 割り付け oracle | 観点 |
|---|---|---|
| `admitEventEnvelope` | U-EPR-001..022, U-EPR-088..091, U-EPR-103 | exact set 11 field、片肺、形式・enum、起点 causation 規則、判定順序 |
| `evaluateCausalOrder` | U-EPR-023..031 | 未来先書き、未解決 causation、correlation 跨ぎ、時刻逆行、境界、判定順序 |
| `evaluateIdempotentIngest` | U-EPR-032..038 | dedupe 3 分岐、列長不変、append-only 不変、snapshot 重複 |
| `evaluateLifecycleTransition` | U-EPR-039..046, U-EPR-098, U-EPR-102 | state machine、seal、correlation 分離、seal 先着 |
| `evaluateProjectionDrift` | U-EPR-047..056, U-EPR-101 | identity / state の分離判定、orphan lane、片方一致の否定、判定順序 |
| `selectCheckpointScope` | U-EPR-057..066, U-EPR-087, U-EPR-092..094, U-EPR-099 | 5 field exact set、区間、lane 境界、暗黙フォールバックの否定 |
| `evaluateCheckpointReplay` | U-EPR-067..076, U-EPR-086, U-EPR-100 | 束縛 3 件、stale HEAD、区間端点、digest 照合、判定順序 |
| `routeRecovery` | U-EPR-077..083, U-EPR-095..097 | bounded 性、上限境界、retry 可能集合、route 2 値 |
| 全 8 関数 | U-EPR-084, U-EPR-085 | 入力非破壊、determinism |

## 2. mutation 要件

分岐網羅は prose 主張ではなく `tests/tools/event-projection-mutation/run-mutation.ts` の実行結果で
裏付ける。要件は次の 3 点とする。

1. mutant は判定分岐を 1 つずつ除去・弱化したものだけを使い、複数分岐を同時に壊さない。
2. 実行結果は `survived=0` かつ `pattern_missing=0` でなければならない（`pattern_missing` が
   1 件でもあると、mutant の `from` パターンが実ソースと乖離しており到達性を検証していない）。
3. 生存した mutant は「テストを足す」か「到達不能な分岐を削除する」かのどちらかで必ず解消し、
   mutant 自体を削除して数字を合わせることはしない。

現行実測値は `total=61 killed=61 survived=0 pattern_missing=0`（exit 0）。

初回 55 mutant では survived 4 / pattern_missing 2 だった。`deep-freeze-shallowed` は到達不能分岐
だったためコード側の再帰を削除し（L6 §3）、残る 3 件は oracle 不足として U-EPR-098..100 を追加した。
`pattern_missing` 2 件は `from` パターンを実ソースへ合わせて実在させた。

独立レビューで判定順序の逆転が 2 件見つかったため、`drift-order-lane-first` と
`transition-order-machine-first`（分岐を消さず順序だけを入れ替える mutant）を追加し、58→60 体とした。
どちらも U-EPR-101 / U-EPR-102 だけが検出者である。

さらに cross-runtime 独立レビューで `schema_version` が非空文字列なら admit される欠陥が見つかったため、
`envelope-schema-version-weakened-to-non-empty`（exact 一致を非空検査へ弱化する mutant）を追加して 60→61 体とした。
検出者は `U-EPR-103` だけであり、空文字を測る `U-EPR-090` では killed にならない。

`from` パターンは整形結果に依存するため、formatter がソースの改行位置を変えると `pattern_missing` が
再発する。runner は該当 mutant 名を `MISSING <name>` として出力し、どの分岐が未検証になったかを
数字だけでなく特定できるようにする。

## 3. fixture 方針

基準 fixture は、単一 lane・単一 correlation の event 列とし、各 negative oracle は基準から
**判定対象の 1 条件だけ**を差し替える。例外は判定順序検証 oracle（U-EPR-022 / U-EPR-028 /
U-EPR-029 / U-EPR-075 / U-EPR-076 / U-EPR-101 / U-EPR-102）に限り、2 条件を同時成立させて先着条件の failure code を確認する。

`causation_id` は null 可能 field であるため、**キー欠落**（U-EPR-009）と **null 値**
（U-EPR-020 / U-EPR-021）を別 oracle に分離する。`payload_digest` も同様に、キー欠落は exact set
違反（U-EPR-088）、値 null は片肺（U-EPR-012）として経路を分ける。

scope 系 oracle は 5 field を 1 件ずつ落とすほか、`scope` そのものが undefined の場合
（U-EPR-063）と、5 field が全て妥当でも unknown field を持つ場合（U-EPR-099）を独立に持つ。
後者は exact set 検査だけが唯一の検出者であり、形式検査では捕まらない。

U-EPR-066 は別 lane の追記に対する不変性を押さえ、lane 境界が実効であることを positive 側から
確認する。全体スコープ digest を lane checkpoint へ流用した実装では必ず Red になる。
