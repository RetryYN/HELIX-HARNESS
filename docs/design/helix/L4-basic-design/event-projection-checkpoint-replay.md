---
title: "orchestration event projection と checkpoint replay 基本設計"
canonical_layer_scheme: L1-L12
layer: L4
paired_layer: L9
status: draft
plan: docs/plans/PLAN-L4-72-event-projection-checkpoint-replay.md
pair_artifact: docs/test-design/helix/L9-event-projection-checkpoint-replay-system-test-design.md
behavior_contract_id: EVENT-PROJECTION-CHECKPOINT-REPLAY-001
responsibility_owner: event-projection-checkpoint-replay
---

# orchestration event projection と checkpoint replay 基本設計

## 1. 目的と境界

request から terminal までの orchestration event を append-only で保持し、event envelope
（`event_id` / `event_type` / `occurred_at` / `plan_id` / `parent_lane_id` / `lane_id` /
`causation_id` / `correlation_id` / `head_sha` / `payload_digest` / `schema_version`）から
projection・checkpoint・receipt を exactly-once 相当で再構築する判定を確定する。

#213 の work graph lease と三段 receipt、#214 の slot accounting row と quota handover packet を
event source の入力契約としてそのまま使い、別 lease 体系・別 receipt 体系・別 accounting 体系を
新設しない。本設計が担うのは **event の受理可否・因果順序・冪等再構築・drift 検出** という
pure judgement であり、DB table の追加、CLI surface、GitHub Projects API 呼び出しは範囲外とする。

要件 trace 先は MIC-FR-001 / MIC-R-07 / MIC-AC-010..011。MIC-R-07 は repo-owned 工程表と
`harness.db` を計画・状態 authority とし、GitHub Issue / PR / Projects を read-side projection に
限定する。本設計はその projection 側の受理境界を定義するものであり、GitHub 表示から state を
逆流させる経路を作らない。

## 2. 構成責務

| component | 責務 | 禁止 |
|---|---|---|
| Event envelope admitter | orchestration event を 11 field の exact set で受理し、append-only 列へ追記可能かを判定する（MIC-R-07） | field 欠落 event の受理、unknown 追加 field による欠落相殺、payload だけを持つ event 片肺の受理、既存 event の書き換え |
| Causal order evaluator | `causation_id` / `correlation_id` / `occurred_at` から因果順序を判定し、原因より前に結果が確定する event 列を拒否する | causal inversion の受理、correlation を跨いだ causation の解決、未来 `occurred_at` の先書き |
| Idempotent ingest controller | 同一 `event_id` の再投入を副作用なしで吸収し、exactly-once 相当を保証する（MIC-AC-010） | 同一 event_id での二重 side effect、payload digest が異なる同一 event_id の暗黙上書き、dedupe 判定を成功応答で代替すること |
| Lifecycle transition gate | event_type 列が許容 state machine に沿うかを判定し、illegal transition を拒否する | 前段 event の無い terminal 受理、state を飛ばす遷移、terminal 後の追加遷移 |
| Projection drift detector | event 列から再構築した projection と read-back snapshot の identity / state を照合し、不一致を drift として fail-close する（MIC-AC-010） | 手動編集・green 表示・Issue close だけを完了根拠にすること、partial write の成功扱い、orphan lane の黙認 |
| Checkpoint scope selector | checkpoint 対象を `head_sha` / `parent_lane_id` / event 境界で絞り込む述語を供給する。**正規化と digest 算出そのものは行わず**、既存 canonicalization 契約へ渡す入力集合を決めるだけとする | 独自の正規化規則・列順・digest 関数の定義、lane 境界を無視した全体スコープでの checkpoint 主張 |
| Checkpoint replay verifier | scope selector が絞った集合について、同一 event 列の replay が同一 projection digest を返すことを検査する（MIC-AC-011） | checkpoint / HEAD / parent 欠落での replay、non-idempotent replay の受理、replay 結果の digest 未照合 |
| Recovery router | drift・orphan・stale HEAD・unknown option・rate limit を bounded retry または Recovery へ送る（MIC-AC-011） | 完了への前進、無制限 retry、rate limit 中断の成功扱い |

## 3. 正本グラフ

```text
orchestration event（#213 の receipt / #214 の slot accounting row を source とする）
  └─ Event envelope admitter: 11 field exact set 判定
       └─ Causal order evaluator: causation / correlation / occurred_at の因果順序
            └─ Idempotent ingest controller: event_id dedupe（同一 digest は no-op、差異は拒否）
                 └─ Lifecycle transition gate: event_type 列の state machine 判定
                      └─ append-only 列へ確定
                           ├─ Projection drift detector: 再構築 projection ↔ read-back snapshot 照合
                           │    └─ 不一致 → Recovery router
                           └─ Checkpoint scope selector: head_sha / parent_lane_id / event 境界で
                                対象行集合を絞る（正規化・digest 算出は行わない）
                                └─ Checkpoint replay verifier: 絞り込み済み集合の replay digest 一致判定
                                     └─ 不一致 → Recovery router
```

append-only 列は既存 event を書き換えず、訂正は後続 event の追記だけで表現する。projection は
event 列から都度再構築される派生物であり、projection 側の編集を event 列の authority として
逆流させない。

## 4. 状態とtransaction

```text
received → admitted → ordered → deduped → appended → projected → checkpointed
                                    │           └──────────────→ drifted
                                    └─ duplicate_absorbed（副作用なしで appended と同値の観測）
                                 rejected ←──────（各段の fail-close）
```

- `received`: envelope 未検査の入力。まだ append-only 列に触れない。
- `admitted`: 11 field exact set を満たした状態。
- `ordered`: causation / correlation / occurred_at が既存列と矛盾しない状態。
- `deduped`: 同一 `event_id` が既存かを判定した状態。既存かつ `payload_digest` 一致なら
  `duplicate_absorbed`（副作用なし）、既存かつ digest 不一致なら `rejected`。
- `appended`: append-only 列へ確定した状態。以後この event は不変。
- `projected`: 列から projection を再構築し、read-back snapshot と identity / state が一致した状態。
- `checkpointed`: checkpoint が `head_sha` / `parent_lane_id` / event 境界へ束縛され、
  replay digest が一致した状態。
- `drifted`: projection 照合または replay 照合の不一致。完了へ進めず Recovery router へ送る。
- `rejected`: 各段の fail-close。append-only 列を変化させない。

`appended` を経由しない `projected`、`projected` を経由しない `checkpointed`、`drifted` から
`checkpointed` への直接遷移は存在しない。`duplicate_absorbed` は観測上 `appended` と同じ
projection を返すが、列長と side effect を増やさない。

## 5. 設計リファクタリングgate

event の source となる receipt / accounting row は #213・#214 の既存 export をそのまま入力として
受け取り、本設計側で receipt 検証・lease CAS・capacity 会計を再実装しない。terminal 判定は
`verifyWorkerLifecycleReceipt`、lease は `acquireWorkGraphLease` / `releaseWorkGraphLease`、
slot 会計は `admitSlotAccountingRow` が引き続き唯一の authority である。

digest まわりは **canonicalization 契約と scope 選択を明確に分ける**。

正規化と算出のプリミティブは `src/shared/canonical-digest.ts` の `canonicalJson`（object key 順・array 順・
JSON 妥当性）と `sha256Digest` である。本設計は **この 2 export をそのまま使い、第二の
canonicalization 規則・第二の sha256 算出系を定義しない**。`createL3G3LogicalDbReceipt` も同じ
プリミティブを import して使っており、両者は同一の正規化契約の上に立つ。

一方で `createL3G3LogicalDbReceipt` 自体は本設計から**呼び出さない**。同 export は bootstrap
policy を読み込んで harness.db を 2 回 full rebuild する doctor 専用の重量関数であり、
event 単位の判定経路で呼ぶ対象ではない。さらに `createL3G3LogicalDbReceipt(repoRoot, deps)` は
`head_sha` / `parent_lane_id` / event 境界を引数に取らず、`logicalDatabaseDigest` の絞り込みも
`includeTable` による**テーブル単位**に留まる。すなわち現行の checkpoint digest は
`docs/governance/l3-g3-logical-db-bootstrap-policy.json` の `checkpoint_tables` に対する
**リポジトリ全体スコープ**であり、lane 単位の checkpoint 粒度は既存資産に存在しない。

そのため本設計は責務を次のとおり分割する。

- **既存契約の再利用（新規実装しない）**: 正規化規則と digest 算出関数。第二の canonicalization
  規則・第二の sha256 算出系を作らない。
- **本設計の新規責務**: `head_sha` / `parent_lane_id` / event 境界で対象行集合を絞る
  Checkpoint scope selector。これは新規設計であり、既存資産として主張しない。

この分割を守らない実装、すなわち scope 選択のために独自の正規化・digest 算出を起こす実装は
`contract_invariants` 違反として拒否する。lane 境界を無視して全体スコープの digest を
lane checkpoint として流用することも、他 lane の無関係な追記で恒常的に drift を誤検出するため拒否する。

新規 DB table、新規 CLI command、新規 network 呼び出し、GitHub Projects API 呼び出しは
本設計では追加しない。desired-state packet の投影実行と read-back の I/O は後続 PLAN の
transactional boundary が所有し、本設計はその判定述語だけを供給する。

## 6. L9合否境界

- event envelope の 11 field exact set を満たさない event を拒否し、unknown 追加 field で
  field 欠落を相殺できない。
- payload だけを持ち envelope を欠く event 片肺を拒否する。
- 既に `appended` 済みの event の書き換え（append-only 違反）を拒否し、訂正は後続 event の
  追記だけで表現する。
- 同一 `event_id` の再投入で side effect が 2 回発生することを拒否する。
- `payload_digest` の異なる同一 `event_id` の暗黙上書きを拒否する。
- 原因より前に結果が確定する causal inversion を拒否する。
- 存在しない event を指す未解決 `causation_id`、および `correlation_id` を跨いだ causation 解決を拒否する。
- state machine に無い illegal transition（前段 event の無い terminal、terminal 後の追加遷移）を拒否する。
- 再構築 projection と read-back snapshot の identity / state 不一致（projection drift）を拒否する。
- `head_sha` / `parent_lane_id` / event 境界のいずれかを欠く checkpoint での replay を拒否する。
- lane 境界を無視した全体スコープの digest を lane checkpoint として流用することを拒否する。
- scope 選択のために第二の canonicalization 規則・第二の digest 算出系を起こすことを拒否する。
- 同一 event 列の replay が異なる projection digest を返す non-idempotent replay を拒否する。
- どの lane にも属さない orphan lane の event を完了経路へ通さない。
- stale HEAD / unknown field option / rate limit 中断を成功扱いせず、bounded retry または
  Recovery へ送る。
- Project の列移動、field 編集、Issue close、green 表示だけで完了を確定しない。

| 要件 ID | 対応 component | 対応 fail-close |
|---|---|---|
| MIC-R-07 | Event envelope admitter / Projection drift detector / Recovery router | repo-owned 工程表と `harness.db` を authority とし、GitHub 表示からの逆流、手動編集による完了確定、stale projection の成功扱いを拒否する |
| MIC-AC-010 | Idempotent ingest controller / Projection drift detector | READY frontier を typed packet で投影し、read-back snapshot と identity / state が一致する場合だけ受理する。Project 手動編集・green 表示・Issue close だけの完了を拒否する |
| MIC-AC-011 | Checkpoint scope selector / Checkpoint replay verifier / Recovery router | stale HEAD・orphan item・unknown option・rate limit を注入しても完了へ進めず、bounded retry または Recovery へ遷移する。partial write と stale projection を成功扱いしない。lane 境界を無視した全体スコープ digest の流用も拒否する |

MIC-FR-001 の残る系統（MIC-R-01..04 = #213、MIC-R-05..06 = #214）は既に close 済みの
behavior contract が所有しており、本設計はそれらを再定義せず event source として参照する。

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
      "asset_id": "worker-terminal-receipt",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/worker-lifecycle-receipt.ts",
      "resource_kind": "typescript_export",
      "resource_name": "verifyWorkerLifecycleReceipt",
      "source_digest": "sha256:0bffec75b257d7f101ade5e7e54974e13a46e596b714ecf1ed4d747f8553e2a4",
      "current_authority": true
    },
    {
      "asset_id": "slot-accounting-row",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/slot-scheduler-quota-handover.ts",
      "resource_kind": "typescript_export",
      "resource_name": "admitSlotAccountingRow",
      "source_digest": "sha256:923b792ed7db89813c3ae12bccdade457e3a5469207c5b6533dfae71491365e5",
      "current_authority": true
    },
    {
      "asset_id": "canonical-json",
      "classification": "existing_runtime",
      "artifact_path": "src/shared/canonical-digest.ts",
      "resource_kind": "typescript_export",
      "resource_name": "canonicalJson",
      "source_digest": "sha256:c8f4c6eff75cf5bde2bd467ac647c1953168cbaa5ac5b913e8298fdaddd17000",
      "current_authority": true
    },
    {
      "asset_id": "sha256-digest",
      "classification": "existing_runtime",
      "artifact_path": "src/shared/canonical-digest.ts",
      "resource_kind": "typescript_export",
      "resource_name": "sha256Digest",
      "source_digest": "sha256:c8f4c6eff75cf5bde2bd467ac647c1953168cbaa5ac5b913e8298fdaddd17000",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```

これは event source と digest 算出として再利用する既存資産の実在部分だけを示す。§2 の責務表に
挙げた 8 component は、いずれも本 PLAN での新規設計であり、実装・DB projection・trace 完了は
主張しない。既存資産として宣言しているのは上記 5 件だけである。

digest 系で既存資産として宣言するのは `src/shared/canonical-digest.ts` の `canonicalJson` と
`sha256Digest` の 2 export だけである。これらは `createL3G3LogicalDbReceipt` が内部で import して
使っているプリミティブであり、本設計も同じプリミティブを直接使う。

`createL3G3LogicalDbReceipt` そのものは既存資産として宣言せず、本設計から**呼び出さない**。
同 export は bootstrap policy を読み込んで harness.db を 2 回 full rebuild する doctor 専用の
重量関数であり、event 1 件ごとの checkpoint replay 判定で呼ぶ対象ではない。加えて
`head_sha` / `parent_lane_id` / event 境界を引数に取らず、`logicalDatabaseDigest` の絞り込みも
`includeTable` によるテーブル単位に留まる。したがって lane 単位・event 境界単位の scope 選択は
既存資産に存在せず、§2 の Checkpoint scope selector が新規責務としてこれを担う
（本 PLAN では設計のみで、実装は主張しない）。
