---
title: "8-slot scheduler と quota handover 基本設計"
canonical_layer_scheme: L1-L12
layer: L4
paired_layer: L9
status: draft
plan: docs/plans/PLAN-L4-71-slot-scheduler-quota-handover.md
pair_artifact: docs/test-design/helix/L9-slot-scheduler-quota-handover-system-test-design.md
behavior_contract_id: SLOT-SCHEDULER-QUOTA-HANDOVER-001
responsibility_owner: slot-scheduler-quota-handover
---

# 8-slot scheduler と quota handover 基本設計

## 1. 目的と境界

最大 8 並列 slot を、slot・parent・task・dependency・state・quota snapshot・lease・start 時刻・
terminal 時刻で accounting し、dependency-aware scheduling、bounded queue と backpressure、
quota threshold 到達前の handover、slot 単位の failure isolation を保証する。#213 で確定した
work graph lease（`acquireWorkGraphLease` / `releaseWorkGraphLease` の fence token CAS）と
三段 receipt をそのまま入力契約として使い、別 lease 体系・別 receipt 体系・別 DB table 系列・
別 workflow を新設しない。

capacity evidence の authority は 8-lane fixture ただ一つとする。4-slot hosted PoC は partial
evidence として保持してよいが、8-slot 合格の根拠として読み替えてはならない（`SCHEDULER_CAPACITY_EVIDENCE_UNDERSIZED`）。

要件 trace 先は MIC-FR-001 / MIC-R-05..06 / MIC-AC-005..009。ただし MIC-AC-009 は
`requirements-ir/refinement_contracts.json` 上で `MIC-R-02`（TL の統合権限）と `MIC-R-06` の
両方へ紐づくため、MIC-R-02 も本設計の trace 先に含める。MIC-R-02 の component 割当は #213 の
Parent acceptance evaluator が既に保持しており、本設計は権限を移さない。Dependency-aware
dispatcher は lane A の merge 後に READY frontier を再計算し、base drift・CI・review・DB receipt の
再判定材料を供給するところまでを担い、merge 順序の最終決定と親 acceptance receipt の発行は
Parent acceptance evaluator（TL 相当の単一 authority）に残す。

## 2. 構成責務

| component | 責務 | 禁止 |
|---|---|---|
| Slot capacity accountant | 稼働 slot を `slot_id` / `parent_id` / `task_id` / `dependency_ids` / `slot_state` / `quota_snapshot` / `writer_lease` / `started_at` / `terminated_at` の exact set で会計し、同時稼働数が capacity（既定 8、上限 8）を超えないことを保証する（MIC-R-06） | capacity 超過での dispatch、field 欠落 slot の計上、unknown 追加 field による欠落相殺、fail-open な観測記録での代替 |
| Dependency-aware dispatcher | work graph の READY frontier だけを dispatch 候補とし、同一 Issue・behavior contract・responsibility owner・共有正本・DB projection・authority owner・競合 changed path を持つ task へ同時に writer lease を発行しない（MIC-R-05） | dependency 未充足 task の前倒し dispatch、conflict exclusion を満たさない同時割当、dispatch 後の遡及的 READY 判定 |
| Bounded queue / backpressure controller | 待機 task を上限付き queue に保持し、上限到達時は reject ではなく backpressure signal を返して受理を止める（MIC-R-06） | unbounded queue、上限超過分の暗黙 drop、backpressure を成功として扱う応答 |
| Quota handover coordinator | quota snapshot が threshold へ到達する前に handover packet（lane_id / task_id / candidate_head / writer_lease fence token / 残作業境界）を発行し、後継 slot が同一 lease 系譜を引き継ぐことを保証する（MIC-R-06） | threshold 到達後の事後 handover、handover packet 欠落での slot 交代、handover 時の lease 二重所有 |
| Slot failure isolator | 1 slot の failure を当該 slot の terminal 記録と lease 解放に閉じ込め、依存関係の無い他 slot の実行と queue 位置を保存する（MIC-AC-007） | 1 lane failure による独立 lane の巻き込み終了、failure 時の queue 全体巻き戻し、lease 未解放のまま slot だけ消すこと |
| Capacity evidence gate | capacity claim の根拠 fixture の lane 数を検査し、8-lane fixture 以外を 8-slot 合格根拠として受理しない | 4-slot PoC 結果からの 8-slot 合格読み替え、lane 数を記録しない evidence の受理 |

## 3. 正本グラフ

```text
work graph READY frontier（#213 の graph validator 出力）
  └─ Dependency-aware dispatcher: conflict exclusion 判定
       └─ Slot capacity accountant: 空き slot 確認（同時稼働 ≦ 8）
            ├─ 空きあり → writer lease 取得（acquireWorkGraphLease の fence token CAS）→ slot 稼働
            └─ 空きなし → Bounded queue（上限到達で backpressure signal）
                 └─ Quota handover coordinator: quota threshold 前に handover packet 発行
                      └─ Slot failure isolator: terminal 記録 + lease 解放（#213 の releaseWorkGraphLease）
                           └─ 空き slot へ次の READY task を再割当
```

slot の起票から終端までの lease は `acquireWorkGraphLease` が返す fence token をそのまま単一
owner の証跡として使う。handover でも新しい lease を勝手に発行せず、旧 owner の解放（terminal
receipt 検証済み）と新 owner の CAS 取得を 1 遷移として扱い、両者が同時に owner である状態を作らない。

## 4. 状態とtransaction

```text
queued → dispatched → leased → running → (handover_pending → handover_completed)* → terminal
                          └──────────────────────────────────→ failed / backpressured
```

- `queued`: bounded queue 内。queue 長が上限に達している間は新規受理を backpressure で止める。
- `dispatched`: dependency と conflict exclusion を満たした READY task。まだ lease は持たない。
- `leased`: `acquireWorkGraphLease` が CAS 成功し fence token を得た状態。二重所有は CAS が拒否する。
- `running`: slot accounting の `started_at` が確定した状態。capacity 会計の対象。
- `handover_pending` / `handover_completed`: quota snapshot が threshold へ到達する前に handover
  packet を発行し、後継 slot が同一 lease 系譜を CAS で引き継いだ状態。
- `terminal`: #213 の worker terminal receipt 検証を通過した終端。`terminated_at` を確定して lease を解放する。
- `failed`: 当該 slot に閉じた失敗。lease を解放し、依存の無い他 slot の状態は変化させない。

各遷移は前段の accounting row を入力として束縛し、時刻の逆行（`terminated_at` < `started_at`、
未来 snapshot の先書き）を拒否する。dependency 未充足からの `dispatched` への直接遷移、
capacity 超過状態での `running` への遷移、lease 未取得での `running` への遷移は存在しない。

## 5. 設計リファクタリングgate

lease は #213 の `acquireWorkGraphLease` / `releaseWorkGraphLease` の fence token CAS を再利用し、
scheduler 側に第二の lease 実装を作らない。terminal 判定は `verifyWorkerLifecycleReceipt` に委譲し、
scheduler 側で terminal state を再定義しない。`src/runtime/agent-slots.ts` は fail-open な観測記録
（peak_parallel 統計と stale slot surface）であり、本 scheduler の fail-close 判定 authority では
ない。両者を混同せず、agent-slots を capacity gate の根拠として読み替えない。新規 DB table、
新規 workflow、新規 network 呼び出しは追加しない。

conflict exclusion の実装は 1 箇所に閉じる。#213 の `evaluateDelegationRequestOrdering` は
単一 binding の per-task 判定（dependency READY、base_head 一致、scope path、lease CAS）だけを
担い、複数 READY task 間の相互排他（同一 Issue・behavior contract／responsibility owner・
共有正本／DB projection／authority owner・changed path の 4 軸）は本設計の Dependency-aware
dispatcher が唯一の実装者となる。dispatcher はバッチ判定の述語を単一関数として持ち、
per-task 判定を再実装しない。逆に #213 側へ 4 軸のバッチ判定を複製することも禁止する。

## 6. L9合否境界

- 同時稼働 slot が 8 を超える dispatch を拒否する。
- dependency 未充足 task の前倒し dispatch を拒否する。
- queue が unbounded になる経路（上限なし受理）を拒否し、上限到達時は backpressure を返す。
- 同一 task へ 2 つの writer lease が同時に存在する状態（lease 二重所有）を拒否する。
- quota threshold 到達後の事後 handover、および handover packet 欠落での slot 交代を拒否する。
- 1 slot の failure が依存関係の無い他 slot を巻き込んで終了させることを拒否する。
- 4-slot fixture の結果を 8-slot capacity 合格の根拠として受理しない。
- slot accounting の exact set は unknown 追加 field で field 欠落を相殺できない。

| 要件 ID | 対応 component | 対応 fail-close |
|---|---|---|
| MIC-R-02 | #213 の Parent acceptance evaluator（本設計は権限を移さない） | dispatcher による merge 順序確定・自己 acceptance の拒否 |
| MIC-R-05 | Dependency-aware dispatcher / Quota handover coordinator | 競合 task への二重 writer lease 発行の拒否、handover 通知の別 lane 取得・重複配送・ack 後再配送の拒否 |
| MIC-R-06 | Slot capacity accountant / Bounded queue / Quota handover coordinator / Capacity evidence gate | capacity 超過、unbounded queue、lease 喪失、cell 数に応じた別契約の拒否 |
| MIC-AC-005 | Dependency-aware dispatcher | 同一 Issue・責務・共有正本・DB projection・path を組合せた task 群を投入し、conflict-free task だけが異なる lease を取得する |
| MIC-AC-006 | Quota handover coordinator | lane / target reviewer / HEAD を変異させた handover 通知で、指定 lane の指定 reviewer が 1 回だけ ack し、ack 後の再配送を拒否する |
| MIC-AC-007 | Slot failure isolator | 2 lane 同時稼働で片 lane を failure させ、独立 lane の実行と lane-ready 収束を保存する |
| MIC-AC-008 | Bounded queue / Slot capacity accountant | capacity を 2 から N（8）へ変更し queue 上限超過 task を投入して、同一 packet／lease／receipt 契約のまま超過分を backpressure する |
| MIC-AC-009（MIC-R-02/06） | Dependency-aware dispatcher（frontier 再計算）＋ #213 の Parent acceptance evaluator（merge 順序と acceptance の最終 authority） | lane A merge 後に lane B の base HEAD を再評価し、merge 前 HEAD の receipt 流用を拒否してから merge 候補へ戻す。dispatcher が merge 順序を確定することも拒否する |

## 7. 現在の設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    {
      "asset_id": "work-graph-lease",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/work-graph-receipt-acceptance.ts",
      "resource_kind": "typescript_export",
      "resource_name": "acquireWorkGraphLease",
      "source_digest": "sha256:629e516db0b29a0f7b657f26cc7bd7646775eb70fa376015241d522f4a7c0063",
      "current_authority": true
    },
    {
      "asset_id": "work-graph-lease-release",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/work-graph-receipt-acceptance.ts",
      "resource_kind": "typescript_export",
      "resource_name": "releaseWorkGraphLease",
      "source_digest": "sha256:629e516db0b29a0f7b657f26cc7bd7646775eb70fa376015241d522f4a7c0063",
      "current_authority": true
    },
    {
      "asset_id": "worker-terminal-receipt",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/worker-lifecycle-receipt.ts",
      "resource_kind": "typescript_export",
      "resource_name": "verifyWorkerLifecycleReceipt",
      "source_digest": "sha256:0bffec75b257d7f101ade5e7e54974e13a46e596b714ecf1ed4d747f8553e2a4",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```

これは再利用する既存 lease / terminal receipt の実在部分だけを示す。slot capacity accountant と
dependency-aware dispatcher、bounded queue controller と quota handover coordinator、そして
slot failure isolator と capacity evidence gate は本 PLAN での新規設計であり、実装・DB projection・
trace 完了は主張しない。
