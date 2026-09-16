---
title: "8-slot scheduler と quota handover 機能設計"
canonical_layer_scheme: L1-L12
layer: L6
paired_layer: L6
status: draft
plan: docs/plans/PLAN-L7-527-slot-scheduler-quota-handover.md
pair_artifact: docs/test-design/helix/L6-slot-scheduler-quota-handover-unit-test-design.md
related_l5: docs/design/helix/L5-detail/slot-scheduler-quota-handover.md
behavior_contract_id: SLOT-SCHEDULER-QUOTA-HANDOVER-001
responsibility_owner: slot-scheduler-quota-handover
---

# 8-slot scheduler と quota handover 機能設計

## 1. 実装単位

`src/runtime/slot-scheduler-quota-handover.ts` に pure judgement として実装する。DB write、
network、ファイル I/O、時刻取得を持たず、入力から failure code または admit 結果だけを返す。
lease の取得は #213 の `acquireWorkGraphLease` をそのまま呼び、scheduler 側に第二の CAS を作らない。

| export | 役割 |
|---|---|
| `admitSlotAccountingRow` | slot accounting row の exact set 9 field 検証（ネストも exact） |
| `evaluateDispatchAdmission` | dispatch 受理の判定順序 1..8 |
| `admitQueueEntry` | bounded queue への追加受理と backpressure |
| `evaluateQuotaHandover` | quota threshold 前 handover と lease 系譜の継続 |
| `evaluateSlotFailureIsolation` | slot 単位 failure isolation の検査 |
| `evaluateFrontierRecalculation` | merge 後の frontier 再計算と merge authority の非移譲 |
| `admitCapacityEvidence` | capacity evidence の lane 数検査 |

## 2. 判定順序の実装

L5 §2 / §2.2 の順序をコードの制御フロー順にそのまま写像する。順序を保証するのは配置であり、
コメントではない。`evaluateDispatchAdmission` は accounting 検証 → queue_limit → capacity 範囲 →
入力形式 → dependency → conflict → capacity 超過 → lease 二重所有 → 時刻逆行の順で早期 return する。

queue_limit 判定を capacity 超過判定より前に置くことは U-SSQ-029 が固定し、mutation
`queue-limit-check-removed` が到達性を裏付ける。

## 3. lease 二重所有の判定

`leaseDoubleOwnership` は `(parent_id, task_id)` が一致する稼働 row だけを比較対象とし、
owner 不一致（条件 1）と、同一 owner での fence_token 不一致（条件 2、旧 lease 未解放）を
衝突とする。lane をまたいだ `fence_token` の値一致は衝突扱いしない。これは
`acquireWorkGraphLease` の `fence_token` が lane 内の単調カウンタであり lane 識別成分を
持たないという実装事実に由来する（L5 §2.1）。

mutation `lease-lane-scope-dropped` / `lease-owner-mismatch-ignored` /
`lease-fence-token-mismatch-ignored` の 3 体がこの 3 分岐の到達性を裏付ける。

### 3.1 handover の CAS wiring

`evaluateQuotaHandover` は `acquireWorkGraphLease` の CAS に、observed 値として稼働 row が実際に
保持する `current.row.writer_lease` を、expected 値として packet が主張する
`packet.writer_lease.fence_token` を渡す。両方を packet 由来にすると比較が自己参照になり、
CAS が構造的に発火しなくなる（独立レビューが repro で実証）。owner の一致は CAS が見ないため、
`packet.writer_lease.owner !== current.row.writer_lease.owner` を別分岐で拒否する。

CAS 失敗時は `WORK_GRAPH_LEASE_CAS_STALE` などの `WORK_GRAPH_*` code をそのまま透過させ、
`SCHEDULER_LEASE_DOUBLE_OWNERSHIP` へ再命名しない（L5 §4）。そのため本 module の失敗型は
`SchedulerFailureCode | WorkGraphFailureCode` の union とする。

## 4. handover の必須要素検査

`handoverPacketComplete` は 5 必須要素を field ごとの型検査で判定する。キー存在を先に走査する
ループは置かない。型検査が欠落も同時に弾くため、キー存在ループは**到達不能な二重判定**になり、
mutation で除去しても全 oracle が green のまま生存する（初回 mutation 実行で実測）。到達不能な
防御分岐を残さない方針に従い削除した。

## 5. mutation による分岐網羅の裏付け

`tests/tools/slot-scheduler-mutation/run-mutation.ts` が source mutant 54 体を実生成し、
`tests/slot-scheduler-quota-handover.test.ts` が全件を killed にすることを command で検証する
（`total=54 killed=54 survived=0 pattern_missing=0`、exit 0）。prose の「分岐網羅」主張は
根拠にしない。

初回実行では 2 体が生存し、いずれも実質的な欠陥だった。

1. `slot-row-exact-key-weakened`: unknown 追加 field を許す弱化に対し、欠落を伴わない純粋な
   surplus field の oracle が無かった。U-SSQ-011 に surplus field の反例を追加して塞いだ。
2. `handover-packet-required-keys-ignored`: §4 の到達不能な二重判定。分岐そのものを削除した。

独立レビューはさらに 2 件の Critical と 3 件の Important を検出し、いずれも oracle 未カバー領域に
潜んでいた（§3.1、§4.1、§6）。mutant 8 体を追加して 39 → 47 とした。2 ラウンド目はさらに deepFreeze の入力凍結副作用と未カバー分岐 5 件を検出し、mutant 7 体（計 54）と oracle U-SSQ-075..082 で塞いだ。

### 4.1 不変性

admit 系の返り値は `frozenClone`（`structuredClone` してから `deepFreeze`）でネストした record と
配列まで凍結する。浅い `Object.freeze` では
`quota_snapshot` / `writer_lease` / `dependency_ids` / `remaining_scope` が呼び出し側から書き換え可能で、
admit 済み値の不変性を前提にした後続判定（`leaseDoubleOwnership` / `conflicts` / `samePeerState`）が
壊れる。一方、複製せずに凍結すると spread が浅いためネスト参照が入力と共有されたままで、
呼び出し側が保持する入力オブジェクトまで凍結してしまう（pure judgement の前提を破る副作用）。
mutant `deep-freeze-shallowed` が U-SSQ-074 で、`frozen-clone-aliases-input` が U-SSQ-081 で
それぞれ killed になる。

失敗型の union も `QuotaHandoverResult` に限定する。`WORK_GRAPH_*` の透過が起きるのは lease を
取得する handover 経路だけであり、他 6 export の結果型を不必要に広げない。

## 6. 責務境界

- terminal 判定は `verifyWorkerLifecycleReceipt` に委ね、scheduler 側で terminal state を
  再定義しない。lease 解放の検証も `releaseWorkGraphLease` の結果を `predecessorReleased` /
  `failedLeaseReleased` として受け取るだけで、解放条件を再実装しない。
- merge 順序の確定と親 acceptance receipt の発行は #213 の Parent acceptance evaluator が保持する。
  `evaluateFrontierRecalculation` は `requestsMergeOrderDecision` を最優先で拒否し、frontier
  再計算の材料供給までに責務を閉じる（MIC-R-02）。
- `src/runtime/agent-slots.ts` は fail-open な並列観測であり、本 module の入力にも判定根拠にも
  しない。capacity gate の authority は `BoundedQueueSnapshotV1.capacity` と accounting row だけとする。

## 7. 現在の設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    {
      "asset_id": "slot-scheduler-dispatch",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/slot-scheduler-quota-handover.ts",
      "resource_kind": "typescript_export",
      "resource_name": "evaluateDispatchAdmission",
      "source_digest": "sha256:923b792ed7db89813c3ae12bccdade457e3a5469207c5b6533dfae71491365e5",
      "current_authority": true
    },
    {
      "asset_id": "work-graph-lease",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/work-graph-receipt-acceptance.ts",
      "resource_kind": "typescript_export",
      "resource_name": "acquireWorkGraphLease",
      "source_digest": "sha256:629e516db0b29a0f7b657f26cc7bd7646775eb70fa376015241d522f4a7c0063",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```

DB projection、CLI surface、GitHub Projects への投影は本 PLAN の対象外であり、完了を主張しない。
